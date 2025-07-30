"use server";

import { z } from "zod";
import { DrizzleError, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

import db from "@/infrastructure/database/db";
import { purchasedItem, purchase } from "@/lib/schema/purchase";
import { user } from "@/lib/schema/user";
import { getUserInfo } from "@/lib/utils/auth";
import { item } from "@/lib/schema/item";

export async function editDataSingleItem(
  formData: FormData
): Promise<FormState<void>> {
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

  const allowedRole: AvailableUserRole[] = ["admin", "manager", "staff"];

  try {
    const { userId: loggedInUserId } = await getUserInfo();
    const payload = schema.parse(payloadRaw);

    const {
      purchaseId,
      purchaseItemIdToUpdate,
      updatedQuantityInHundred,
      updatedPricePerUnit,
    } = payload;

    const itemName = await db.transaction(async (tx) => {
      // Validate role
      const [currentUser] = await tx
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, loggedInUserId));
      if (!allowedRole.includes(currentUser.role)) {
        invariantError = "Not Allowed";
        tx.rollback();
      }

      // Validate existance of purchase
      const currentPurchases = await tx
        .select({
          totalPrice: purchase.totalPrice,
          creatorId: purchase.creatorId,
          ownerId: purchase.ownerId,
        })
        .from(purchase)
        .where(eq(purchase.id, purchaseId));
      if (currentPurchases.length == 0) {
        invariantError = "purchase not exist";
        tx.rollback();
      }

      // Validate authorization on current purchase
      const { creatorId, ownerId } = currentPurchases[0];
      if (![creatorId, ownerId].includes(loggedInUserId)) {
        invariantError = "Not an owner / creator";
        tx.rollback();
      }

      // Validate existance of purchaseItem
      const currentPurchasedItem = await tx
        .select({
          totalPrice: purchasedItem.totalPrice,
          itemId: purchasedItem.itemId,
          itemName: item.name,
        })
        .from(purchasedItem)
        .where(eq(purchasedItem.id, purchaseItemIdToUpdate))
        .innerJoin(item, eq(purchasedItem.itemId, item.id));
      if (currentPurchasedItem.length == 0) {
        invariantError = "purchased item not exist";
        tx.rollback();
      }

      // Calculate NEW purchase item total price
      const updatedPurchasedItemTotalPrice =
        (parseInt(updatedQuantityInHundred) * parseInt(updatedPricePerUnit)) /
        100;

      // Calculate NEW purchase total price
      const newTotalPrice =
        currentPurchases[0].totalPrice -
        currentPurchasedItem[0].totalPrice +
        updatedPurchasedItemTotalPrice;

      // Append change to database
      await tx
        .update(purchase)
        .set({
          totalPrice: newTotalPrice,
          modifiedAt: new Date(),
        })
        .where(eq(purchase.id, purchaseId));
      await tx
        .update(purchasedItem)
        .set({
          totalPrice: updatedPurchasedItemTotalPrice,
          quantityInHundreds: parseInt(updatedQuantityInHundred),
          pricePerUnit: parseInt(updatedPricePerUnit),
          modifiedAt: new Date(),
        })
        .where(eq(purchasedItem.id, purchaseItemIdToUpdate));

      // const [item] = await tx
      //   .select({ name: items.name })
      //   .from(items)
      //   .where(eq(items.id, currentPurchasedItem[0].itemId));
      // return item.name;
      return currentPurchasedItem[0].itemName;
    });

    revalidateTag(purchaseId);
    const response = {
      message: `Data Item ${itemName} Updated`,
    };

    return response;
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
