"use server";

import { z } from "zod";
import { DrizzleError, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import { purchasedItems, purchases } from "@/lib/schema/schema";

export async function deletePurchase(
  formData: FormData
): Promise<FormState<void>> {
  const purchaseIdRaw = formData.get("purchase-id");

  const schema = z.string();

  let invariantError: string | undefined;
  try {
    const purchaseId = schema.parse(purchaseIdRaw);

    await db.transaction(async (tx) => {
      const currentPurchase = await tx
        .select()
        .from(purchases)
        .where(eq(purchases.id, purchaseId));

      if (currentPurchase.length == 0) {
        invariantError = "invalid id";
        tx.rollback();
      }

      await tx.delete(purchases).where(eq(purchases.id, purchaseId));
    });

    revalidatePath(`/transaction/purchase`);
    return { message: `Purchase transaction deleted` };
  } catch (error) {
    if (error instanceof DrizzleError) {
      return {
        error: invariantError ? invariantError : error.message,
      };
    }

    return { error: "internal error" };
  }
}
