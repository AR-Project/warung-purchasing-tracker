import { eq } from "drizzle-orm";

import db from "@/infrastructure/database/db";
import { images } from "@/lib/schema/schema";

export async function imagesLoader(userId: string) {
  return await db.select().from(images).where(eq(images.ownerId, userId));
}
