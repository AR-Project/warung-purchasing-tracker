import db from "@/infrastructure/database/db";
import { items } from "@/lib/schema/item";
import { purchasedItems } from "@/lib/schema/schema";
import { asc, eq } from "drizzle-orm";

type Data = {
  id: string;
  name: string;
};

export async function listOfItemsLoader(requesterId: string): Promise<Data[]> {
  const result = await db.query.purchasedItems.findMany({
    where: eq(purchasedItems.ownerId, requesterId),
    columns: {
      itemId: true,
    },
    with: {
      item: {
        columns: {
          name: true,
        },
      },
    },
  });

  return result.map((row) => ({
    id: row.itemId,
    name: row.item.name,
  }));
}
