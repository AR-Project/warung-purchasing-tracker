import db from "@/infrastructure/database/db";
import { desc, eq } from "drizzle-orm";
import { DateTime } from "luxon";

import { items } from "@/lib/schema/item";
import { purchasedItems } from "@/lib/schema/schema";

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
  const result = await db.query.items.findFirst({
    where: eq(items.id, requestedItemId),
    with: {
      purchaseItem: {
        columns: {
          purchaseId: true,
          quantityInHundreds: true,
          pricePerUnit: true,
          totalPrice: true,
          purchasedAt: true,
        },
        orderBy: [desc(purchasedItems.purchasedAt)],
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
