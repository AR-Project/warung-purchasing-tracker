"use server";

import { z } from "zod";
import { DrizzleError, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { DateTime } from "luxon";

import db from "@/infrastructure/database/db";
import { purchasedItems, purchases } from "@/lib/schema/schema";

export async function deleteSingleItemAction(
  prevState: any,
  formData: FormData
): Promise<FormStateWithTimestamp<void>> {
  const purchaseIdRaw = formData.get("purchase-id");
  const purchasedItemIdToDeleteRaw = formData.get("purchase-item-id");

  const schema = z.object({
    purchaseId: z.string(),
    purchasedItemIdToDelete: z.string(),
  });

  let invariantError: string | undefined;
  try {
    const payload = schema.parse({
      purchaseId: purchaseIdRaw,
      purchasedItemIdToDelete: purchasedItemIdToDeleteRaw,
    });

    await db.transaction(async (tx) => {
      const currentPurchase = await tx
        .select()
        .from(purchases)
        .where(eq(purchases.id, payload.purchaseId));

      const purchasedItemToDelete = await tx
        .select()
        .from(purchasedItems)
        .where(eq(purchasedItems.id, payload.purchasedItemIdToDelete));

      if (currentPurchase.length == 0 || purchasedItemToDelete.length == 0) {
        invariantError = "invalid Item";
        tx.rollback();
      }

      const oldPurchasedItemIds = structuredClone(
        currentPurchase[0].purchasedItemId
      );
      const isPurchasedItemToDeleteExist = oldPurchasedItemIds.includes(
        payload.purchasedItemIdToDelete
      );

      if (!isPurchasedItemToDeleteExist) {
        invariantError = "Item lost";
        tx.rollback();
      }

      const updatedPurchasedItemIds = oldPurchasedItemIds.filter(
        (id) => id !== payload.purchasedItemIdToDelete
      );

      const [deletedItem] = purchasedItemToDelete;

      const totalPriceForDeletedPurchasedItem =
        deletedItem.pricePerUnit * (deletedItem.quantityInHundreds / 100);

      const newTotalPrice =
        currentPurchase[0].totalPrice - totalPriceForDeletedPurchasedItem;

      await tx
        .update(purchases)
        .set({
          purchasedItemId: updatedPurchasedItemIds,
          modifiedAt: new Date(),
          totalPrice: newTotalPrice,
        })
        .where(eq(purchases.id, payload.purchaseId))
        .returning({ id: purchases.id });

      await tx
        .delete(purchasedItems)
        .where(eq(purchasedItems.id, payload.purchasedItemIdToDelete));
    });

    revalidatePath(`/transaction/details/${payload.purchaseId}`);
    return { message: `Item deleted`, timestamp: Date.now().toString() };
  } catch (error) {
    if (error instanceof DrizzleError) {
      return { error: invariantError ? invariantError : error.message };
    }

    return { error: "internal error", timestamp: Date.now().toString() };
  }
}
