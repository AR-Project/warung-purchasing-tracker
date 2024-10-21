"use server";

import { z } from "zod";
import { DrizzleError, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import { purchasedItems, purchases } from "@/lib/schema/schema";
import { generateId } from "@/lib/utils/generator";

export async function updatePurchaseItemAction(
  prevState: any,
  formData: FormData
) {
  const purchaseId = formData.get("purchase-id");
  const listOfPurchaseItemRaw = formData.get("items-to-add");

  const payloadSchema = z.object({
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

  let payloadError: string | undefined;

  try {
    const payload = payloadSchema.parse({
      purchaseId,
      listOfPurchaseItemAsStr: listOfPurchaseItemRaw,
    });

    const listOfPurchaseItemPayload: CreatePurchaseItemPayload[] =
      listOfPurchaseItemSchema.parse(
        JSON.parse(payload.listOfPurchaseItemAsStr)
      );

    const listOfPurchaseItemDbPayload: CreatePurchaseItemDbPayload[] =
      listOfPurchaseItemPayload.map((item) => ({
        ...item,
        purchaseId: payload.purchaseId,
        id: generateId(14),
      }));

    await db.transaction(async (tx) => {
      const currentPurchase = await tx
        .select()
        .from(purchases)
        .where(eq(purchases.id, payload.purchaseId));

      if (currentPurchase.length == 0) {
        payloadError = "Purchase not exist";
        tx.rollback();
      }

      const totalPriceOfitemToAdd = listOfPurchaseItemDbPayload.reduce(
        (total, item) => total + item.totalPrice,
        0
      );

      const updatedPurchaseTotalPrice =
        currentPurchase[0].totalPrice + totalPriceOfitemToAdd;

      const listOfPurchaseItemIdToAdd = listOfPurchaseItemDbPayload.map(
        (item) => item.id
      );

      await tx.insert(purchasedItems).values(listOfPurchaseItemDbPayload);
      await tx
        .update(purchases)
        .set({
          totalPrice: updatedPurchaseTotalPrice,
          purchasedItemId: [
            ...currentPurchase[0].purchasedItemId,
            ...listOfPurchaseItemIdToAdd,
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
    if (error instanceof DrizzleError) {
      return {
        error: payloadError ? payloadError : "database Error",
        timestamp: Date.now(),
      };
    }

    return { error: "internal error", timestamp: Date.now() };
  }
}
