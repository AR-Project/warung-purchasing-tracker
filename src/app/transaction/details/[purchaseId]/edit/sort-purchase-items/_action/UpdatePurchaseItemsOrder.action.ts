"use server";
import { z } from "zod";
import { DrizzleError, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import { purchases } from "@/lib/schema/schema";
import { user } from "@/lib/schema/user";
import { getUserInfo } from "@/lib/utils/auth";

export async function updateListOrderOfPurchaseItem(formData: FormData) {
  const purchaseIdRaw = formData.get("purchase-id");
  const updatedListStringRaw = formData.get("updated-list");

  const schema = z.object({
    purchaseId: z.string(),
    updatedListString: z.string(),
  });

  const updatedListSchema = z.string().array();

  let invariantError: string | undefined;
  const allowedRole: AvailableUserRole[] = ["admin", "manager"];

  try {
    const { userId } = await getUserInfo();

    const payload = schema.parse({
      purchaseId: purchaseIdRaw,
      updatedListString: updatedListStringRaw,
    });

    const newListOfPurchaseItemId = updatedListSchema.parse(
      JSON.parse(payload.updatedListString)
    );

    await db.transaction(async (tx) => {
      // Validate role
      const [currentUser] = await tx
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, userId));
      if (!allowedRole.includes(currentUser.role)) {
        invariantError = "Not Allowed";
        tx.rollback();
      }

      // Validate Purchase
      const currentPurchase = await tx
        .select()
        .from(purchases)
        .where(eq(purchases.id, payload.purchaseId));
      if (currentPurchase.length == 0) {
        invariantError = "purchase Not Exist";
        tx.rollback();
      }

      // Validate Authorization
      const { creatorId, ownerId } = currentPurchase[0];
      if (![creatorId, ownerId].includes(userId)) {
        invariantError = "Not Allowed";
        tx.rollback();
      }

      // Validate length of purchase
      if (
        !arraysHaveEqualElements(
          currentPurchase[0].purchasedItemId,
          newListOfPurchaseItemId
        )
      ) {
        invariantError = "List of purchaseItem contain different item id";
        tx.rollback();
      }

      await tx
        .update(purchases)
        .set({
          purchasedItemId: newListOfPurchaseItemId,
          modifiedAt: new Date(),
        })
        .where(eq(purchases.id, payload.purchaseId))
        .returning({ id: purchases.id });
    });
    revalidatePath(`/transaction/details/${payload.purchaseId}`);
    return { message: `Purchase Item Order Changed` };
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

function arraysHaveEqualElements(array1: string[], array2: string[]) {
  // Check if the lengths are equal
  if (array1.length !== array2.length) {
    return false;
  }

  // Create a set for efficient lookup
  const set = new Set(array2);

  // Check if all elements in array1 exist in the set
  for (const element of array1) {
    if (!set.has(element)) {
      return false;
    }
  }

  return true;
}
