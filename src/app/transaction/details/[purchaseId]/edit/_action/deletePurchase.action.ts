"use server";

import { z } from "zod";
import { DrizzleError, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import { purchasedItems, purchases } from "@/lib/schema/schema";
import { auth } from "@/auth";
import { getUserInfo } from "@/lib/utils/auth";
import { user } from "@/lib/schema/user";

export async function deletePurchase(
  formData: FormData
): Promise<FormState<void>> {
  const purchaseIdRaw = formData.get("purchase-id");

  const schema = z.string();

  let invariantError: string | undefined;

  const allowedRole: AvailableUserRole[] = ["admin", "manager"];

  try {
    const { userId } = await getUserInfo();
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
        .from(purchases)
        .where(eq(purchases.id, purchaseIdToDelete));
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

      // Commit action to database
      await tx.delete(purchases).where(eq(purchases.id, purchaseIdToDelete));
      await tx
        .delete(purchasedItems)
        .where(eq(purchasedItems.purchaseId, purchaseIdToDelete));
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
