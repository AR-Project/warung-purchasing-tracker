import db from "@/infrastructure/database/db";
import { items } from "@/lib/schema/item";
import { asc, eq } from "drizzle-orm";

export async function listOfItemsLoader(userId: string) {
  return await db
    .select()
    .from(items)
    .orderBy(asc(items.name))
    .where(eq(items.ownerId, userId));
}
