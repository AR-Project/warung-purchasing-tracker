import db from "@/infrastructure/database/db";
import { vendors } from "@/lib/schema/schema";
import { eq } from "drizzle-orm";

export default async function getUserVendors(userId: string) {
  return await db
    .select({ id: vendors.id, name: vendors.name })
    .from(vendors)
    .where(eq(vendors.ownerId, userId));
}
