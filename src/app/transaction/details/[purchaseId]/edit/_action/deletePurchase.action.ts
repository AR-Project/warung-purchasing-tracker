"use server";

import { z } from "zod";
import { DrizzleError, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import { purchasedItem, purchase } from "@/lib/schema/purchase";
import { getUserInfo } from "@/lib/utils/auth";
import { user } from "@/lib/schema/user";
import {
  NewPurchaseArchiveDbPayload,
  purchaseArchive,
} from "@/lib/schema/archive";
import { generateId } from "@/lib/utils/generator";
import { item } from "@/lib/schema/item";

export async function deletePurchase(
  formData: FormData
): Promise<FormState<void>> {
  const purchaseIdRaw = formData.get("purchase-id");

  const schema = z.string();

  let invariantError: string | undefined;

  const allowedRole: AvailableUserRole[] = ["admin", "manager"];

  try {
    const { userId, parentId } = await getUserInfo();
    const { data: purchaseIdToDelete } = schema.safeParse(purchaseIdRaw);
    if (!purchaseIdToDelete) {
      invariantError = "Invalid Payload";
      throw new Error(invariantError);
    }

    await db.transaction(async (tx) => {
      // Validate user role
      const [userData] = await tx
        .select({
          role: user.role,
        })
        .from(user)
        .where(eq(user.id, userId));
      if (!allowedRole.includes(userData.role)) {
        invariantError = "Not Allowed";
        tx.rollback();
      }

      // Validate current purchase
      const purchaseToDelete = await tx
        .select()
        .from(purchase)
        .where(eq(purchase.id, purchaseIdToDelete));
      if (purchaseToDelete.length == 0) {
        invariantError = "invalid purchase id";
        tx.rollback();
      }

      // Validate authorization on current purchase
      const { creatorId, ownerId } = purchaseToDelete[0];
      if (![creatorId, ownerId].includes(userId)) {
        invariantError = "Not Allowed";
        tx.rollback();
      }

      const purchaseItems = await tx
        .select({
          data: purchasedItem,
          name: item.name,
        })
        .from(purchasedItem)
        .where(eq(purchasedItem.purchaseId, purchaseIdToDelete))
        .innerJoin(item, eq(purchasedItem.itemId, item.id));

      const listOfPurchaseItem = purchaseItems.map((row) => ({
        ...row.data,
        itemName: row.name,
      }));

      // Archival step
      const purchaseArchiveDbPayload: NewPurchaseArchiveDbPayload = {
        id: generateId(20),
        description: "Purchase Deletion",
        ownerId: parentId,
        creatorId: userId,
        data: {
          purchase: purchaseToDelete[0],
          listOfPurchaseItem,
        },
      };

      // Commit action to database
      await tx.insert(purchaseArchive).values(purchaseArchiveDbPayload);
      await tx.delete(purchase).where(eq(purchase.id, purchaseIdToDelete));
      await tx
        .delete(purchasedItem)
        .where(eq(purchasedItem.purchaseId, purchaseIdToDelete));
    });

    revalidatePath(`/transaction/purchase`);
    return { message: `Purchase transaction deleted` };
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
