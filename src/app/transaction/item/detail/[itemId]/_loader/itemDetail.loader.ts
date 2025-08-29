import db from "@/infrastructure/database/db";
import { DateTime } from "luxon";

import { parseRangeFilterToJSDate } from "@/lib/utils/validator";

export async function itemDetailLoader(
  requestedItemId: string,
  dateFilter: RangeFilter | undefined
) {
  const filter = parseRangeFilterToJSDate(dateFilter);

  const result = await db.query.item.findFirst({
    where: (item, { eq }) => eq(item.id, requestedItemId),
    with: {
      purchaseItem: {
        columns: {
          id: true,
          purchaseId: true,
          quantityInHundreds: true,
          pricePerUnit: true,
          totalPrice: true,
          purchasedAt: true,
        },
        where: (purchasedItem, { between }) =>
          filter
            ? between(purchasedItem.purchasedAt, filter.from, filter.to)
            : undefined,
        with: {
          purchase: {
            columns: {},
            with: {
              vendor: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: (purchaseItem, { desc }) => desc(purchaseItem.purchasedAt),
      },
      owner: {
        columns: {
          username: true,
        },
      },
      creator: {
        columns: {
          username: true,
        },
      },
      category: {
        columns: {
          name: true,
        },
      },
      image: {
        columns: {
          url: true,
        },
      },
    },
  });
  if (!result) return null;

  const { purchaseItem, ...rest } = result;

  return {
    itemDetail: rest,
    purchaseHistory: purchaseItem.map(({ purchase, ...ph }) => ({
      ...ph,
      purchasedAt: DateTime.fromJSDate(ph.purchasedAt)
        .setLocale("id")
        .toFormat("dd/LL"),
      quantity: ph.quantityInHundreds / 100,
      vendorName: purchase.vendor.name,
    })),
  };
}
