"use server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { DateTime } from "luxon";

import db from "@/infrastructure/database/db";
import { purchases } from "@/lib/schema/schema";

export async function updatePurchaseDate(prevState: any, formData: FormData) {
  const purchaseId = formData.get("purchase-id");
  const newPurchaseDateString = formData.get("new-purchase-date");

  const schema = z.object({
    purchaseId: z.string(),
    newPurchaseDateString: z.string(),
  });

  try {
    const payload = schema.parse({
      purchaseId,
      newPurchaseDateString,
    });

    const date = DateTime.fromISO(payload.newPurchaseDateString);

    if (!date.isValid) throw new Error("Invalid Date");

    await db.transaction(async (tx) => {
      const purchase = await tx
        .select()
        .from(purchases)
        .where(eq(purchases.id, payload.purchaseId));

      if (purchase.length == 0) {
        tx.rollback();
      }

      await tx
        .update(purchases)
        .set({ purchasedAt: date.toJSDate(), modifiedAt: new Date() })
        .where(eq(purchases.id, payload.purchaseId))
        .returning({ id: purchases.id });
    });
    revalidatePath(`/transaction/details/${payload.purchaseId}`);
    return { message: `Purchase Date changed` };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "internal error" };
  }
}
