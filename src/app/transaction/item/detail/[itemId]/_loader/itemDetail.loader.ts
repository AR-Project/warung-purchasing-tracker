import db from "@/infrastructure/database/db";
import { desc, eq } from "drizzle-orm";
import { DateTime } from "luxon";

import { item } from "@/lib/schema/item";
import { purchasedItem } from "@/lib/schema/purchase";

type LoaderResponse = {
  purchaseItemHistory: {
    purchaseId: string;
    purchaseDate: Date;
    quantityInHundreds: number;
    pricePerUnit: number;
    totalPrice: number;
  }[];
  id: string;
  name: string;
  imageId: string | null;
  createdAt: Date;
  modifiedAt: Date;
};

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
        orderBy: [desc(purchasedItem.purchasedAt)],
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
