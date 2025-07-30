import db from "@/infrastructure/database/db";
import { vendor } from "@/lib/schema/vendor";
import { eq } from "drizzle-orm";

export default async function getUserVendors(userId: string) {
  return await db
    .select({ id: vendor.id, name: vendor.name })
    .from(vendor)
    .where(eq(vendor.ownerId, userId));
}
