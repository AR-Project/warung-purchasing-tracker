"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import { purchasedItem, purchase } from "@/lib/schema/purchase";
import { verifyUserAccess } from "@/lib/utils/auth";

import {
  NewPurchaseArchiveDbPayload,
  purchaseArchive,
} from "@/lib/schema/archive";
import { generateId } from "@/lib/utils/generator";
import ClientError from "@/lib/exception/ClientError";
import { adminManagerRole } from "@/lib/const";

const userPayloadSchema = z.object({
  purchaseId: z.string(),
  purchasedItemIdToDelete: z.string(),
});

export async function deleteSingleItemAction(
  formData: FormData
): Promise<FormState<void>> {
  const [user, authError] = await verifyUserAccess(adminManagerRole);
  if (authError) return { error: authError };

  const purchaseIdRaw = formData.get("purchase-id");
  const purchasedItemIdToDeleteRaw = formData.get("purchase-item-id");

  const { data: payload, error: payloadError } = userPayloadSchema.safeParse({
    purchaseId: purchaseIdRaw,
    purchasedItemIdToDelete: purchasedItemIdToDeleteRaw,
  });
  if (payloadError) return { error: "Invalid Payload" };
  try {
    await db.transaction(async (tx) => {
      // Validate existance of purchase
      const currentPurchase = await tx.query.purchase.findFirst({
        where: (purchase, { eq }) => eq(purchase.id, payload.purchaseId),
      });
      if (!currentPurchase) throw new ClientError("Invalid Purchase");
      const { creatorId, ownerId, purchasedItemId, totalPrice } =
        currentPurchase;

      // Validate authorization
      if (![creatorId, ownerId].includes(user.userId))
        throw new ClientError("Not allowed");

      // Validate existence of purchaseItem
      const purchaseItemToDelete = await tx.query.purchasedItem.findFirst({
        where: (purchaseItem, { eq }) =>
          eq(purchaseItem.id, payload.purchasedItemIdToDelete),
        with: { item: { columns: { name: true } } },
      });
      if (!purchaseItemToDelete) throw new ClientError("Invalid purchase item");

      const isItemExistOnPurchase = purchasedItemId.includes(
        payload.purchasedItemIdToDelete
      );
      if (!isItemExistOnPurchase)
        throw new ClientError("Purchase Item not exist");

      // Update list of PurchaseItemId
      const updatedPurchaseItemIds = purchasedItemId.filter(
        (id) => id !== payload.purchasedItemIdToDelete
      );

      // Calculate price
      const { pricePerUnit, quantityInHundreds } = purchaseItemToDelete;
      const updatedPurchasePrice =
        totalPrice - pricePerUnit * (quantityInHundreds / 100);

      // Archive
      const { item, ...rest } = purchaseItemToDelete;
      const purchaseArchiveDbPayload: NewPurchaseArchiveDbPayload = {
        id: generateId(20),
        ownerId: user.parentId,
        creatorId: user.userId,
        description: "purchase item deletion",
        data: {
          ...rest,
          itemName: item.name,
        },
      };

      // Persist action
      await tx.insert(purchaseArchive).values(purchaseArchiveDbPayload);
      await tx
        .update(purchase)
        .set({
          purchasedItemId: updatedPurchaseItemIds,
          modifiedAt: new Date(),
          totalPrice: updatedPurchasePrice,
        })
        .where(eq(purchase.id, payload.purchaseId))
        .returning({ id: purchase.id });

      await tx
        .delete(purchasedItem)
        .where(eq(purchasedItem.id, payload.purchasedItemIdToDelete));
    });

    revalidatePath(`/transaction/details/${payload.purchaseId}`);
    return { message: `Item deleted` };
  } catch (error) {
    return {
      error: error instanceof ClientError ? error.message : "Internal Error",
    };
  }
}
