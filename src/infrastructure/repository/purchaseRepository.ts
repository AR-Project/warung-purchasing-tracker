import { revalidatePath, revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import db from "@/infrastructure/database/db";
import { auth } from "@/auth";
import {
  images,
  NewImageDbPayload,
  NewPurchaseDbPayload,
  purchasedItems,
  NewPurchaseItemDbPayload,
  purchases,
} from "@/lib/schema/schema";
import { generateId } from "@/lib/utils/generator";
import {
  ImageMetadata,
  writeImageFile,
} from "@/infrastructure/storage/localStorage";

export async function saveNewPurchase(
  purchasePayload: NewPurchaseDbPayload,
  listOfPurchaseItem: CreatePurchaseItemPayload[],
  imagePayload: NewImageDbPayload | null
): Promise<[string, null] | [null, string]> {
  try {
    const savedPurchaseId = await db.transaction(async (tx) => {
      if (imagePayload) {
        await tx
          .insert(images)
          .values(imagePayload)
          .returning({ imageId: images.id });
      }

      const [savedPurchase] = await tx
        .insert(purchases)
        .values(purchasePayload)
        .returning({ id: purchases.id });

      const listOfPurchaseItemDbPayload: NewPurchaseItemDbPayload[] =
        listOfPurchaseItem.map((item) => ({
          ...item,
          id: generateId(14),
          purchaseId: savedPurchase.id,
          creatorId: purchasePayload.creatorId,
          ownerId: purchasePayload.ownerId,
        }));
      await tx.insert(purchasedItems).values(listOfPurchaseItemDbPayload);

      const listOfPurchaseItemId = listOfPurchaseItemDbPayload.map(
        (item) => item.id
      );
      await tx
        .update(purchases)
        .set({ purchasedItemId: listOfPurchaseItemId })
        .where(eq(purchases.id, savedPurchase.id));
      return savedPurchase.id;
    });
    return [savedPurchaseId, null];
  } catch (error) {
    return [null, "Fail to save transaction"];
  }
}
