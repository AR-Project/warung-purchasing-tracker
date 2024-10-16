"use server";

import { z } from "zod";
import { DrizzleError, eq } from "drizzle-orm";

import db from "@/infrastructure/database/db";
import { purchasedItems, purchases, vendors } from "@/lib/schema/schema";
import { revalidatePath } from "next/cache";
import { generateId } from "@/lib/utils/generator";

export async function updatePurchaseItemAction(
  prevState: any,
  formData: FormData
) {
  const purchaseId = formData.get("purchase-id");
  const itemsRaw = formData.get("items-to-add");

  const payloadSchema = z.object({
    purchaseId: z.string(),
    itemsStrings: z.string(),
  });

  const itemsSchema = z.array(
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
      itemsStrings: itemsRaw,
    });

    const itemsToAddPayload: PurchasedItemPayload[] = itemsSchema.parse(
      JSON.parse(payload.itemsStrings)
    );

    const itemsToAdd = itemsToAddPayload.map((item) => ({
      ...item,
      purchaseId: payload.purchaseId,
      id: generateId(14),
    }));

    const id = await db.transaction(async (tx) => {
      const currentPurchase = await tx
        .select()
        .from(purchases)
        .where(eq(purchases.id, payload.purchaseId));

      if (currentPurchase.length == 0) {
        payloadError = "Purchase not exist";
        tx.rollback();
      }

      const totalPriceOfitemToAdd = itemsToAdd.reduce(
        (total, item) => total + item.totalPrice,
        0
      );
      await tx.insert(purchasedItems).values(itemsToAdd);

      await tx
        .update(purchases)
        .set({
          totalPrice: currentPurchase[0].totalPrice + totalPriceOfitemToAdd,
          purchasedItemId: [
            ...currentPurchase[0].purchasedItemId,
            ...itemsToAdd.map((item) => item.id),
          ],
          modifiedAt: new Date(),
        })
        .where(eq(purchases.id, payload.purchaseId))
        .returning({ id: purchases.id });
    });
    revalidatePath(`/transaction/details/${payload.purchaseId}`);
    return {
      message: `Purchased Item Updated`,
      data: id,
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
