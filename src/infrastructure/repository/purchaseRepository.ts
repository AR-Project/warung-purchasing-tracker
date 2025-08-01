import { revalidatePath, revalidateTag } from "next/cache";
import { eq, inArray, sql, SQL } from "drizzle-orm";
import { z } from "zod";

import db from "@/infrastructure/database/db";
import { auth } from "@/auth";
import { image, NewImageDbPayload } from "@/lib/schema/image";
import {
  NewPurchaseDbPayload,
  purchasedItem,
  NewPurchaseItemDbPayload,
  purchase,
} from "@/lib/schema/purchase";
import { generateId } from "@/lib/utils/generator";
import {
  ImageMetadata,
  writeImageFile,
} from "@/infrastructure/storage/localStorage";
import { user } from "@/lib/schema/user";
import { adminManagerRole } from "@/lib/const";

export async function saveNewPurchase(
  purchasePayload: NewPurchaseDbPayload,
  listOfPurchaseItem: CreatePurchaseItemPayload[],
  imagePayload: NewImageDbPayload | null
): Promise<[string, null] | [null, string]> {
  try {
    const savedPurchaseId = await db.transaction(async (tx) => {
      if (imagePayload) {
        await tx
          .insert(image)
          .values(imagePayload)
          .returning({ imageId: image.id });
      }

      const [savedPurchase] = await tx
        .insert(purchase)
        .values(purchasePayload)
        .returning({ id: purchase.id });

      const listOfPurchaseItemDbPayload: NewPurchaseItemDbPayload[] =
        listOfPurchaseItem.map((item, index) => ({
          ...item,
          id: generateId(14),
          purchasedAt: purchasePayload.purchasedAt,
          sortOrder: index,
          purchaseId: savedPurchase.id,
          creatorId: purchasePayload.creatorId,
          ownerId: purchasePayload.ownerId,
        }));
      await tx.insert(purchasedItem).values(listOfPurchaseItemDbPayload);

      const listOfPurchaseItemId = listOfPurchaseItemDbPayload.map(
        (item) => item.id
      );
      await tx
        .update(purchase)
        .set({ purchasedItemId: listOfPurchaseItemId })
        .where(eq(purchase.id, savedPurchase.id));
      return savedPurchase.id;
    });
    return [savedPurchaseId, null];
  } catch (error) {
    return [null, "Fail to save transaction"];
  }
}

type Payload = {
  requester: UserSession;
  purchaseId: string;
  newOrder: string[];
};

export async function updateOrderOfPurchaseItem({
  requester,
  purchaseId,
  newOrder,
}: Payload) {
  let invariantError: string | undefined;
  try {
    await db.transaction(async (tx) => {
      // Validate role
      const [currentUser] = await tx
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, requester.userId));
      if (!adminManagerRole.includes(currentUser.role)) {
        invariantError = "Not Allowed";
        tx.rollback();
      }

      // Validate Purchase
      const currentPurchase = await tx
        .select()
        .from(purchase)
        .where(eq(purchase.id, purchaseId));
      if (currentPurchase.length == 0) {
        invariantError = "purchase Not Exist";
        tx.rollback();
      }

      // Validate Authorization
      const { creatorId, ownerId } = currentPurchase[0];
      if (![creatorId, ownerId].includes(requester.userId)) {
        invariantError = "Not Allowed";
        tx.rollback();
      }

      // Validate length of purchase
      if (
        !arraysHaveEqualElements(currentPurchase[0].purchasedItemId, newOrder)
      ) {
        invariantError = "List of purchaseItem contain different item id";
        tx.rollback();
      }

      await tx
        .update(purchase)
        .set({
          purchasedItemId: newOrder,
          modifiedAt: new Date(),
        })
        .where(eq(purchase.id, purchaseId))
        .returning({ id: purchase.id });

      // https://orm.drizzle.team/docs/guides/update-many-with-different-value
      const sqlChunks: SQL[] = [];
      sqlChunks.push(sql`(case`);
      newOrder.forEach((id, index) => {
        sqlChunks.push(
          sql`when ${purchasedItem.id} = ${id} then ${index}::INTEGER`
        );
      });
      sqlChunks.push(sql`end)`);
      const finalSql: SQL = sql.join(sqlChunks, sql.raw(" "));

      await tx
        .update(purchasedItem)
        .set({ sortOrder: finalSql })
        .where(inArray(purchasedItem.id, newOrder));
    });
    return null;
  } catch (error) {
    return invariantError ? invariantError : "Internal Error";
  }
}

function arraysHaveEqualElements(array1: string[], array2: string[]) {
  if (array1.length !== array2.length) return false;
  const set = new Set(array2);

  for (const element of array1) {
    if (!set.has(element)) return false;
  }
  return true;
}
