"use server";

import { z } from "zod";
import { DrizzleError, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import {
  NewPurchaseItemDbPayload,
  purchasedItem,
  purchase,
} from "@/lib/schema/purchase";
import { generateId } from "@/lib/utils/generator";
import { user } from "@/lib/schema/user";
import { adminManagerRole } from "@/lib/const";
import { auth } from "@/auth";

export async function updatePurchaseItemAction(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Forbidden" };

  const purchaseIdRaw = formData.get("purchase-id");
  const listOfPurchaseItemRaw = formData.get("items-to-add");

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

  const { data: payload } = userPayloadSchema.safeParse({
    purchaseId: purchaseIdRaw,
    listOfPurchaseItemAsStr: listOfPurchaseItemRaw,
  });
  if (!payload) return { error: "Invalid Payload" };

  const { data: listOfPurchaseItemPayload } =
    listOfPurchaseItemSchema.safeParse(
      JSON.parse(payload.listOfPurchaseItemAsStr)
    );

  if (!listOfPurchaseItemPayload) return { error: "Invalid Payload" };

  const databaseError = await updatePurchaseItem({
    requester: session.user,
    purchaseId: payload.purchaseId,
    purchaseItemList: listOfPurchaseItemPayload,
  });

  if (databaseError) return { error: databaseError };

  revalidatePath(`/transaction/details/${payload.purchaseId}`);
  return { message: `Purchased Item Updated` };
}

type UpdatePurchaseItemPayload = {
  requester: UserSession;
  purchaseId: string;
  purchaseItemList: CreatePurchaseItemPayload[];
};

async function updatePurchaseItem({
  requester,
  purchaseId,
  purchaseItemList,
}: UpdatePurchaseItemPayload): Promise<string | null> {
  const { userId, parentId } = requester;

  let invariantError: string | undefined;

  try {
    await db.transaction(async (tx) => {
      // Validate role
      const [currentUser] = await tx
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, userId));
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
        invariantError = "Purchase not exist";
        tx.rollback();
      }

      // Validate authorization on current purchase
      const { creatorId, ownerId } = currentPurchase[0];
      if (![creatorId, ownerId].includes(userId)) {
        invariantError = "Not an owner / creator";
        tx.rollback();
      }

      const currentPurchaseItemLength =
        currentPurchase[0].purchasedItemId.length;

      const listOfPurchaseItemDbPayload: NewPurchaseItemDbPayload[] =
        purchaseItemList.map((item, index) => ({
          ...item,
          creatorId: userId,
          ownerId: parentId,
          purchaseId: purchaseId,
          purchasedAt: currentPurchase[0].purchasedAt,
          sortOrder: index + currentPurchaseItemLength,
          id: generateId(14),
        }));

      const listOfPurchaseItemTotalPrice = listOfPurchaseItemDbPayload.reduce(
        (total, item) => total + item.totalPrice,
        0
      );

      const newPurchaseTotalPrice =
        currentPurchase[0].totalPrice + listOfPurchaseItemTotalPrice;

      const newListOfPurchaseItemId = listOfPurchaseItemDbPayload.map(
        (item) => item.id
      );

      await tx.insert(purchasedItem).values(listOfPurchaseItemDbPayload);
      await tx
        .update(purchase)
        .set({
          totalPrice: newPurchaseTotalPrice,
          purchasedItemId: [
            ...currentPurchase[0].purchasedItemId,
            ...newListOfPurchaseItemId,
          ],
          modifiedAt: new Date(),
        })
        .where(eq(purchase.id, purchaseId))
        .returning({ id: purchase.id });
    });
    return null;
  } catch (error) {
    return invariantError ? invariantError : "internal error";
  }
}
