"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import {
  NewPurchaseItemDbPayload,
  purchasedItem,
  purchase,
} from "@/lib/schema/purchase";
import { generateId } from "@/lib/utils/generator";
import { adminManagerRole } from "@/lib/const";

import { verifyUserAccess } from "@/lib/utils/auth";
import ClientError from "@/lib/exception/ClientError";

const userPayloadSchema = z.object({
  purchaseId: z.string(),
  listOfPurchaseItemAsStr: z.string(),
});

const listOfPurchaseItemSchema = z.array(
  z.object({
    itemId: z.string(),
    quantityInHundreds: z.number(),
    pricePerUnit: z.number(),
    totalPrice: z.number(),
  })
);

export async function updatePurchaseItemAction(formData: FormData) {
  const [user, authError] = await verifyUserAccess(adminManagerRole);
  if (authError) return { error: authError };

  const { data: payload, error: payloadErr } = userPayloadSchema.safeParse({
    purchaseId: formData.get("purchase-id"),
    listOfPurchaseItemAsStr: formData.get("items-to-add"),
  });
  if (payloadErr) return { error: "Invalid Payload" };

  const { data: listOfPurchaseItemPayload, error: listItemPyError } =
    listOfPurchaseItemSchema.safeParse(
      JSON.parse(payload.listOfPurchaseItemAsStr)
    );

  if (listItemPyError) return { error: "Invalid Payload" };

  const databaseError = await updatePurchaseItem({
    requester: user,
    purchaseId: payload.purchaseId,
    newPurchaseItemList: listOfPurchaseItemPayload,
  });

  if (databaseError) return { error: databaseError };

  revalidatePath(`/transaction/details/${payload.purchaseId}`);
  return { message: `Purchased Item Updated` };
}

type UpdatePurchaseItemPayload = {
  requester: UserSession;
  purchaseId: string;
  newPurchaseItemList: CreatePurchaseItemPayload[];
};

async function updatePurchaseItem({
  requester,
  purchaseId,
  newPurchaseItemList,
}: UpdatePurchaseItemPayload): Promise<string | null> {
  const { userId, parentId } = requester;

  try {
    await db.transaction(async (tx) => {
      // Validate Purchase
      const curPurchase = await tx.query.purchase.findFirst({
        where: (purchase, { eq }) => eq(purchase.id, purchaseId),
      });
      if (!curPurchase) throw new ClientError("Purchase not exist");

      const { creatorId, ownerId } = curPurchase;
      if (![creatorId, ownerId].includes(userId))
        throw new ClientError("not allowed");

      const currPurchaseItemLen = curPurchase.purchasedItemId.length;

      const newPcItDbPayload: NewPurchaseItemDbPayload[] =
        newPurchaseItemList.map((item, index) => ({
          ...item,
          creatorId: userId,
          ownerId: parentId,
          purchaseId: purchaseId,
          purchasedAt: curPurchase.purchasedAt,
          sortOrder: currPurchaseItemLen + index,
          id: generateId(14),
        }));

      const newListTotalPrice = newPcItDbPayload.reduce(
        (total, item) => total + item.totalPrice,
        0
      );

      const updatedPcTotPrice = curPurchase.totalPrice + newListTotalPrice;

      const newListOfPurchaseItemId = newPcItDbPayload.map((item) => item.id);

      await tx.insert(purchasedItem).values(newPcItDbPayload);
      await tx
        .update(purchase)
        .set({
          totalPrice: updatedPcTotPrice,
          purchasedItemId: [
            ...curPurchase.purchasedItemId,
            ...newListOfPurchaseItemId,
          ],
          modifiedAt: new Date(),
        })
        .where(eq(purchase.id, purchaseId))
        .returning({ id: purchase.id });
    });
    return null;
  } catch (error) {
    return error instanceof ClientError ? error.message : "Internal Error";
  }
}
