"use server";

import { z } from "zod";
import { DrizzleError, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import { items, purchasedItems, purchases } from "@/lib/schema/schema";
import { getUserInfo } from "@/lib/utils/auth";
import { user } from "@/lib/schema/user";
import {
  NewPurchaseArchiveDbPayload,
  purchaseArchive,
} from "@/lib/schema/archive";
import { generateId } from "@/lib/utils/generator";

export async function deleteSingleItemAction(
  formData: FormData
): Promise<FormState<void>> {
  const purchaseIdRaw = formData.get("purchase-id");
  const purchasedItemIdToDeleteRaw = formData.get("purchase-item-id");

  const userPayloadSchema = z.object({
    purchaseId: z.string(),
    purchasedItemIdToDelete: z.string(),
  });

  let invariantError: string | undefined;
  const allowedRole: AvailableUserRole[] = ["admin", "manager"];
  try {
    const { userId: loggedInUserId, parentId } = await getUserInfo();
    const { data: payload } = userPayloadSchema.safeParse({
      purchaseId: purchaseIdRaw,
      purchasedItemIdToDelete: purchasedItemIdToDeleteRaw,
    });
    if (!payload) {
      invariantError = "Invalid Payload";
      throw new Error(invariantError);
    }

    await db.transaction(async (tx) => {
      // Validate user role
      const [currentUser] = await tx
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, loggedInUserId));
      if (!allowedRole.includes(currentUser.role)) {
        invariantError = "Not Allowed";
        tx.rollback();
      }

      // Validate existance of purchase
      const currentPurchase = await tx
        .select()
        .from(purchases)
        .where(eq(purchases.id, payload.purchaseId));
      if (currentPurchase.length == 0) {
        invariantError = "Invalid Purchase";
        tx.rollback();
      }

      // Validate if loggedInUser is have authorization on current purchase
      const { creatorId, ownerId } = currentPurchase[0];
      if (![creatorId, ownerId].includes(loggedInUserId)) {
        invariantError = "Not an owner / creator";
        tx.rollback();
      }

      // Validate existance of purchaseItem
      const purchaseItemToDelete = await tx
        .select()
        .from(purchasedItems)
        .where(eq(purchasedItems.id, payload.purchasedItemIdToDelete));
      if (purchaseItemToDelete.length == 0) {
        invariantError = "Invalid purchase item";
        tx.rollback();
      }

      // Validate purchase item to delete is exist on current purchase
      const oldListOfPurchaseItemId = structuredClone(
        currentPurchase[0].purchasedItemId
      );
      const isExistOnPurchase = oldListOfPurchaseItemId.includes(
        payload.purchasedItemIdToDelete
      );
      if (!isExistOnPurchase) {
        invariantError = "Purchase Item not exist";
        tx.rollback();
      }

      // Generate new listOfPurchaseItemId
      const newListOfPurchaseItemId = oldListOfPurchaseItemId.filter(
        (id) => id !== payload.purchasedItemIdToDelete
      );

      // Temporary store deleted purchase
      const [deletedPurchaseItem] = purchaseItemToDelete;

      // Calculate changed data (purchase total price)
      const deletedPurchaseItemTotalPrice =
        deletedPurchaseItem.pricePerUnit *
        (deletedPurchaseItem.quantityInHundreds / 100);
      const newPurchaseTotalPrice =
        currentPurchase[0].totalPrice - deletedPurchaseItemTotalPrice;

      // Prepare Archival payload
      const [item] = await tx
        .select({ name: items.name })
        .from(items)
        .where(eq(items.id, deletedPurchaseItem.itemId));
      const data = {
        ...deletedPurchaseItem,
        ...item,
      };
      const purchaseArchiveDbPayload: NewPurchaseArchiveDbPayload = {
        id: generateId(20),
        ownerId: parentId,
        creatorId: loggedInUserId,
        description: "purchase item deletion",
        data,
      };

      // Append change to database
      await tx.insert(purchaseArchive).values(purchaseArchiveDbPayload);
      await tx
        .update(purchases)
        .set({
          purchasedItemId: newListOfPurchaseItemId,
          modifiedAt: new Date(),
          totalPrice: newPurchaseTotalPrice,
        })
        .where(eq(purchases.id, payload.purchaseId))
        .returning({ id: purchases.id });

      await tx
        .delete(purchasedItems)
        .where(eq(purchasedItems.id, payload.purchasedItemIdToDelete));
    });

    revalidatePath(`/transaction/details/${payload.purchaseId}`);
    return { message: `Item deleted` };
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
