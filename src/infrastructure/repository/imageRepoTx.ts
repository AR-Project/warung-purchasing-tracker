import { image, NewImageDbPayload } from "@/lib/schema/image";
import { Tx } from "../database/db";
import { eq } from "drizzle-orm";

export async function createImageTx(payload: NewImageDbPayload, tx: Tx) {
  return await tx.insert(image).values(payload).returning();
}

export async function deleteImageTx(id: string, tx: Tx) {
  return await tx
    .delete(image)
    .where(eq(image.id, id))
    .returning({ serverFileName: image.serverFileName });
}
