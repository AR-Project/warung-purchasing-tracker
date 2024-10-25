"use server";

import { z } from "zod";
import { DrizzleError, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import {
  NewPurchaseItemDbPayload,
  purchasedItems,
  purchases,
} from "@/lib/schema/schema";
import { generateId } from "@/lib/utils/generator";
import { getUserInfo } from "@/lib/utils/auth";
import { user } from "@/lib/schema/user";

export async function updatePurchaseItemAction(
  prevState: any,
  formData: FormData
) {
  const purchaseId = formData.get("purchase-id");
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

  let invariantError: string | undefined;
  const allowedRole: AvailableUserRole[] = ["admin", "manager"];

  try {
    const { userId, parentId } = await getUserInfo();

    const { data: payload } = userPayloadSchema.safeParse({
      purchaseId,
      listOfPurchaseItemAsStr: listOfPurchaseItemRaw,
    });
    if (!payload) {
      invariantError = "Invalid Payload";
      throw new Error(invariantError);
    }

    const {
      data: listOfPurchaseItemPayload,
    }: { data?: CreatePurchaseItemPayload[] } =
      listOfPurchaseItemSchema.safeParse(
        JSON.parse(payload.listOfPurchaseItemAsStr)
      );

    if (!listOfPurchaseItemPayload) {
      invariantError = "Invalid list of purchase item structure";
      throw new Error(invariantError);
    }

    const listOfPurchaseItemDbPayload: NewPurchaseItemDbPayload[] =
      listOfPurchaseItemPayload.map((item) => ({
        ...item,
        creatorId: userId,
        ownerId: parentId,
        purchaseId: payload.purchaseId,
        id: generateId(14),
      }));

    await db.transaction(async (tx) => {
      // Validate role
      const [currentUser] = await tx
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, userId));
      if (!allowedRole.includes(currentUser.role)) {
        invariantError = "Not Allowed";
        tx.rollback();
      }

      // Validate Purchase
      const currentPurchase = await tx
        .select()
        .from(purchases)
        .where(eq(purchases.id, payload.purchaseId));
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

      const listOfPurchaseItemTotalPrice = listOfPurchaseItemDbPayload.reduce(
        (total, item) => total + item.totalPrice,
        0
      );

      const newPurchaseTotalPrice =
        currentPurchase[0].totalPrice + listOfPurchaseItemTotalPrice;

      const newListOfPurchaseItemId = listOfPurchaseItemDbPayload.map(
        (item) => item.id
      );

      await tx.insert(purchasedItems).values(listOfPurchaseItemDbPayload);
      await tx
        .update(purchases)
        .set({
          totalPrice: newPurchaseTotalPrice,
          purchasedItemId: [
            ...currentPurchase[0].purchasedItemId,
            ...newListOfPurchaseItemId,
          ],
          modifiedAt: new Date(),
        })
        .where(eq(purchases.id, payload.purchaseId))
        .returning({ id: purchases.id });
    });
    revalidatePath(`/transaction/details/${payload.purchaseId}`);
    return {
      message: `Purchased Item Updated`,
      timestamp: Date.now(),
    };
  } catch (error) {
    if (invariantError) {
      return { error: invariantError };
    }

    if (error instanceof Error && error.message == "USER_LOGGED_OUT") {
      return { error: "Login first" };
    }

    if (error instanceof DrizzleError) {
      return { error: error.message };
    }

    return { error: "internal error" };
  }
}
