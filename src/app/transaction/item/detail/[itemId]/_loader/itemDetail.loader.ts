import db from "@/infrastructure/database/db";
import { asc, desc, eq } from "drizzle-orm";
import { DateTime } from "luxon";

import { item } from "@/lib/schema/item";
import { purchasedItem } from "@/lib/schema/purchase";

export async function itemDetailLoader(requestedItemId: string) {
  const result = await db.query.item.findFirst({
    where: eq(item.id, requestedItemId),
    with: {
      purchaseItem: {
        columns: {
          purchaseId: true,
          quantityInHundreds: true,
          pricePerUnit: true,
          totalPrice: true,
          purchasedAt: true,
        },
        orderBy: [asc(purchasedItem.purchasedAt)],
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
    },
  });
  if (!result) return null;

  const { purchaseItem, ...rest } = result;

  return {
    itemDetail: rest,
    purchaseHistory: purchaseItem.map((ph) => ({
      ...ph,
      purchasedAt: DateTime.fromJSDate(ph.purchasedAt)
        .setLocale("id")
        .toLocaleString(),
      quantity: ph.quantityInHundreds / 100,
    })),
  };
}
