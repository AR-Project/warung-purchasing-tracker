import db from "@/infrastructure/database/db";
import { items } from "@/lib/schema/schema";
import { asc } from "drizzle-orm";

export async function listOfItemsLoader() {
  return await db.select().from(items).orderBy(asc(items.name));
}
