import { desc, eq } from "drizzle-orm";

import db from "@/infrastructure/database/db";
import { items } from "@/lib/schema/item";
import { purchasedItems } from "@/lib/schema/schema";

export type ItemWithPrice = {
  id: string;
  name: string;
  lastPrice: number;
  purchasedAt: Date;
};

export default async function getUserItemsWithPrice(
  requesterUserId: string
): Promise<ItemWithPrice[]> {
  const result = await db.query.items.findMany({
    where: eq(items.ownerId, requesterUserId),
    columns: {
      id: true,
      name: true,
    },
    with: {
      purchaseItem: {
        columns: {
          pricePerUnit: true,
          purchasedAt: true,
        },
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
        orderBy: [desc(purchasedItems.purchasedAt)],
        limit: 1,
      },
    },
  });

  return result
    .filter((row) => row.purchaseItem.length != 0)
    .map((item) => {
      return {
        id: item.id,
        name: item.name,
        lastPrice: item.purchaseItem[0].pricePerUnit,
        purchasedAt: item.purchaseItem[0].purchasedAt,
      };
    });
}
