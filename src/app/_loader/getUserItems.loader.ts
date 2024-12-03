import db from "@/infrastructure/database/db";
import { items } from "@/lib/schema/item";
import { eq } from "drizzle-orm";

export default async function getUserItems(userId: string) {
  return await db
    .select({ id: items.id, name: items.name })
    .from(items)
    .where(eq(items.ownerId, userId));
}
