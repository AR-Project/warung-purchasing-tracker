"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { DateTime } from "luxon";

import db from "@/infrastructure/database/db";
import { purchasedItems, purchases } from "@/lib/schema/schema";

export async function deleteSingleItemAction(
  prevState: any,
  formData: FormData
): Promise<FormStateWithTimestamp<void>> {
  const purchaseIdRaw = formData.get("purchase-id");
  const purchasedItemIdRaw = formData.get("purchase-item-id");

  const schema = z.object({
    purchaseId: z.string(),
    purchasedItemId: z.string(),
  });

  try {
    const payload = schema.parse({
      purchaseId: purchaseIdRaw,
      purchasedItemId: purchasedItemIdRaw,
    });

    await db.transaction(async (tx) => {
      const purchase = await tx
        .select()
        .from(purchases)
        .where(eq(purchases.id, payload.purchaseId));

      const purchasedItem = await tx
        .select()
        .from(purchasedItems)
        .where(eq(purchasedItems.id, payload.purchasedItemId));

      if (purchase.length == 0 || purchasedItem.length == 0) {
        tx.rollback();
      }

      // validate purchasedItemId on purchase
      const oldPurchasedItemIds = structuredClone(purchase[0].purchasedItemId);
      const isPurchasedItemExist = oldPurchasedItemIds.includes(
        payload.purchasedItemId
      );

      if (!isPurchasedItemExist) {
        tx.rollback();
      }

      // update purchases.purchasedItemId / delete current purchaseItemsId
      const updatedPurchasedItemIds = oldPurchasedItemIds.filter(
        (id) => id !== payload.purchasedItemId
      );

      // BUG: Calculate new total price
      await tx
        .update(purchases)
        .set({
          purchasedItemId: updatedPurchasedItemIds,
          modifiedAt: new Date(),
        })
        .where(eq(purchases.id, payload.purchaseId))
        .returning({ id: purchases.id });

      // delete rows on purchasedItems by its id
      await tx
        .delete(purchasedItems)
        .where(eq(purchasedItems.id, payload.purchasedItemId));
    });

    revalidatePath(`/transaction/details/${payload.purchaseId}`);
    return { message: `Item deleted`, timestamp: Date.now().toString() };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "internal error", timestamp: Date.now().toString() };
  }
}
