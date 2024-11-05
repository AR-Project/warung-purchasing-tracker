import db from "@/infrastructure/database/db";
import { items } from "@/lib/schema/item";
import { purchasedItems } from "@/lib/schema/schema";
import { and, asc, eq, inArray } from "drizzle-orm";

type Data = {
  id: string;
  name: string;
};

export async function listOfItemsLoader(requesterId: string): Promise<Data[]> {
  const result = await db.query.items.findMany({
    where: and(
      eq(items.ownerId, requesterId),
      inArray(
        items.id,
        db
          .select({
            itemId: purchasedItems.itemId,
          })
          .from(purchasedItems)
          .where(eq(purchasedItems.ownerId, requesterId))
      )
    ),

    columns: {
      id: true,
      name: true,
    },
  });
  return result;
}
