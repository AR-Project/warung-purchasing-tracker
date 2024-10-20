"use server";

import { z } from "zod";
import { DrizzleError, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

import db from "@/infrastructure/database/db";
import { items, purchasedItems, purchases } from "@/lib/schema/schema";

export async function editDataSingleItem(
  prevState: any,
  formData: FormData
): Promise<FormStateWithTimestamp<void>> {
  let invariantError: string | undefined;

  const schema = z.object({
    purchaseId: z.string(),
    purchaseItemIdToUpdate: z.string(),
    updatedPricePerUnit: z.string().regex(/^\d+$/),
    updatedQuantityInHundred: z.string().regex(/^\d+$/),
  });

  const payloadRaw = {
    purchaseId: formData.get("purchase-id"),
    purchaseItemIdToUpdate: formData.get("purchase-item-id"),
    updatedPricePerUnit: formData.get("updated-price-per-unit"),
    updatedQuantityInHundred: formData.get("updated-quantity-in-hundred"),
  };

  try {
    const payload = schema.parse(payloadRaw);

    const {
      purchaseId,
      purchaseItemIdToUpdate,
      updatedQuantityInHundred,
      updatedPricePerUnit,
    } = payload;

    const itemName = await db.transaction(async (tx) => {
      const currentPurchases = await tx
        .select({ totalPrice: purchases.totalPrice })
        .from(purchases)
        .where(eq(purchases.id, purchaseId));

      if (currentPurchases.length == 0) {
        invariantError = "purchase not exist";
        tx.rollback();
      }

      const currentPurchasedItem = await tx
        .select({
          totalPrice: purchasedItems.totalPrice,
          itemId: purchasedItems.itemId,
        })
        .from(purchasedItems)
        .where(eq(purchasedItems.id, purchaseItemIdToUpdate));

      if (currentPurchasedItem.length == 0) {
        invariantError = "purchased item not exist";
        tx.rollback();
      }

      const updatedPurchasedItemTotalPrice =
        (parseInt(updatedQuantityInHundred) * parseInt(updatedPricePerUnit)) /
        100;

      const newTotalPrice =
        currentPurchases[0].totalPrice -
        currentPurchasedItem[0].totalPrice +
        updatedPurchasedItemTotalPrice;

      await tx
        .update(purchases)
        .set({
          modifiedAt: new Date(),
          totalPrice: newTotalPrice,
        })
        .where(eq(purchases.id, purchaseId));

      await tx
        .update(purchasedItems)
        .set({
          totalPrice: updatedPurchasedItemTotalPrice,
          quantityInHundreds: parseInt(updatedQuantityInHundred),
          pricePerUnit: parseInt(updatedPricePerUnit),
        })
        .where(eq(purchasedItems.id, purchaseItemIdToUpdate));

      const [item] = await tx
        .select({ name: items.name })
        .from(items)
        .where(eq(items.id, currentPurchasedItem[0].itemId));
      return item.name;
    });

    revalidateTag(purchaseId);
    const response = {
      message: `Data Item ${itemName} Updated`,
      timestamp: Date.now(),
    };

    return response;
  } catch (error) {
    if (error instanceof DrizzleError) {
      return { error: invariantError ? invariantError : error.message };
    }

    return { error: "internal error", timestamp: Date.now() };
  }
}
