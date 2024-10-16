import db from "@/infrastructure/database/db";
import { images } from "@/lib/schema/schema";

export async function imagesLoader() {
  return await db.select().from(images);
}
