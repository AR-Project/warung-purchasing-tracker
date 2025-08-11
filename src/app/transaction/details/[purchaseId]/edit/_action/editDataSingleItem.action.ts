"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

import db from "@/infrastructure/database/db";
import { purchasedItem, purchase } from "@/lib/schema/purchase";
import { verifyUserAccess } from "@/lib/utils/auth";
import ClientError from "@/lib/exception/ClientError";
import { adminManagerStaffRole } from "@/lib/const";

const reqSchema = z.object({
  purchaseId: z.string(),
  purchaseItemIdToUpdate: z.string(),
  updatedPricePerUnit: z.coerce.number().int(),
  updatedQuantityInHundred: z.coerce.number().int(),
});

export async function editDataSingleItem(
  formData: FormData
): Promise<FormState<void>> {
  const [user, authErr] = await verifyUserAccess(adminManagerStaffRole);
  if (authErr) return { error: authErr };

  const payloadRaw = {
    purchaseId: formData.get("purchase-id"),
    purchaseItemIdToUpdate: formData.get("purchase-item-id"),
    updatedPricePerUnit: formData.get("updated-price-per-unit"),
    updatedQuantityInHundred: formData.get("updated-quantity-in-hundred"),
  };

  const { data: payload, error: payloadErr } = reqSchema.safeParse(payloadRaw);
  if (payloadErr) return { error: "Invalid Payload" };

  const {
    purchaseId,
    purchaseItemIdToUpdate,
    updatedQuantityInHundred,
    updatedPricePerUnit,
  } = payload;

  const updatedPurchasedItemTotalPrice =
    (updatedQuantityInHundred * updatedPricePerUnit) / 100;

  try {
    const itemName = await db.transaction(async (tx) => {
      // Validate existance of purchase
      const currentPurchase = await tx.query.purchase.findFirst({
        columns: { totalPrice: true, creatorId: true, ownerId: true },
        where: (purchase, { eq }) => eq(purchase.id, purchaseId),
      });
      if (!currentPurchase) throw new ClientError("purchase not exist");

      // Validate authorization on current purchase
      const { creatorId, ownerId } = currentPurchase;
      if (![creatorId, ownerId].includes(user.userId))
        throw new ClientError("Not an owner / creator");

      // Validate existence of purchaseItem
      const currentPurchasedItem = await tx.query.purchasedItem.findFirst({
        columns: { totalPrice: true },
        with: { item: { columns: { id: true, name: true } } },
        where: (purchasedItem, { eq }) =>
          eq(purchasedItem.id, purchaseItemIdToUpdate),
      });

      if (!currentPurchasedItem)
        throw new ClientError("purchased item not exist");

      // Calculate
      const updatedPurchaseTotalPrice =
        currentPurchase.totalPrice -
        currentPurchasedItem.totalPrice +
        updatedPurchasedItemTotalPrice;

      // Append change to database
      await tx
        .update(purchase)
        .set({
          totalPrice: updatedPurchaseTotalPrice,
          modifiedAt: new Date(),
        })
        .where(eq(purchase.id, purchaseId));
      await tx
        .update(purchasedItem)
        .set({
          totalPrice: updatedPurchasedItemTotalPrice,
          quantityInHundreds: updatedQuantityInHundred,
          pricePerUnit: updatedPricePerUnit,
          modifiedAt: new Date(),
        })
        .where(eq(purchasedItem.id, purchaseItemIdToUpdate));
      return currentPurchasedItem.item.name;
    });

    revalidateTag(purchaseId);
    return { message: `Data Item ${itemName} Updated` };
  } catch (error) {
    return {
      error: error instanceof ClientError ? error.message : "internal error",
    };
  }
}
