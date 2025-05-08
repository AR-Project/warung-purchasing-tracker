import { eq } from "drizzle-orm";

import db from "@/infrastructure/database/db";
import { image } from "@/lib/schema/image";

export async function imagesLoader(userId: string) {
  return await db.select().from(image).where(eq(image.ownerId, userId));
}
