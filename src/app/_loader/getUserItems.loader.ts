import db from "@/infrastructure/database/db";
import { item } from "@/lib/schema/item";
import { eq } from "drizzle-orm";

export default async function getUserItems(userId: string) {
  return await db
    .select({ id: item.id, name: item.name })
    .from(item)
    .where(eq(item.ownerId, userId));
}
