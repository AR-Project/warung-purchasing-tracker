"use server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import { purchases } from "@/lib/schema/schema";

export async function updateListOrderOfPurchaseItem(formData: FormData) {
  const purchaseIdRaw = formData.get("purchase-id");
  const updatedListStringRaw = formData.get("updated-list");

  const schema = z.object({
    purchaseId: z.string(),
    updatedListString: z.string(),
  });

  const updatedListSchema = z.string().array();

  let invariantError: string | undefined;
  try {
    const payload = schema.parse({
      purchaseId: purchaseIdRaw,
      updatedListString: updatedListStringRaw,
    });

    const updatedListOfPurchaseItemIds = updatedListSchema.parse(
      JSON.parse(payload.updatedListString)
    );

    await db.transaction(async (tx) => {
      const purchase = await tx
        .select()
        .from(purchases)
        .where(eq(purchases.id, payload.purchaseId));

      if (purchase.length == 0) {
        invariantError = "purchase Not Exist";
        tx.rollback();
      }

      if (
        !arraysHaveEqualElements(
          purchase[0].purchasedItemId,
          updatedListOfPurchaseItemIds
        )
      ) {
        invariantError = "List of purchaseItem contain different item";
        tx.rollback();
      }

      await tx
        .update(purchases)
        .set({
          purchasedItemId: updatedListOfPurchaseItemIds,
          modifiedAt: new Date(),
        })
        .where(eq(purchases.id, payload.purchaseId))
        .returning({ id: purchases.id });
    });
    revalidatePath(`/transaction/details/${payload.purchaseId}`);
    return { message: `Order Changed` };
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: invariantError ? invariantError : error.message,
      };
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
