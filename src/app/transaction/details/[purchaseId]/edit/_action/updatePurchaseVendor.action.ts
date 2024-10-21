"use server";
import { z } from "zod";
import { DrizzleError, eq } from "drizzle-orm";

import db from "@/infrastructure/database/db";
import { purchases, vendors } from "@/lib/schema/schema";
import { revalidatePath } from "next/cache";

export async function updatePurchaseVendor(prevState: any, formData: FormData) {
  const purchaseId = formData.get("purchase-id");
  const newVendorId = formData.get("new-purchase-vendor-id");

  const schema = z.object({
    purchaseId: z.string(),
    newVendorId: z.string(),
  });

  try {
    const payload = schema.parse({
      purchaseId,
      newVendorId,
    });

    await db.transaction(async (tx) => {
      const purchase = await tx
        .select()
        .from(purchases)
        .where(eq(purchases.id, payload.purchaseId));
      const vendor = await tx
        .select()
        .from(vendors)
        .where(eq(vendors.id, payload.newVendorId));

      if (purchase.length == 0 || vendor.length == 0) {
        tx.rollback();
      }

      await tx
        .update(purchases)
        .set({ vendorId: payload.newVendorId, modifiedAt: new Date() })
        .where(eq(purchases.id, payload.purchaseId))
        .returning({ id: purchases.id });
    });
    revalidatePath(`/transaction/details/${payload.purchaseId}`);
    return { message: `Vendor changed`, timestamp: Date.now().toString() };
  } catch (error) {
    if (error instanceof DrizzleError) {
      return { error: "invalid Payload", timestamp: Date.now().toString() };
    }

    return { error: "internal error", timestamp: Date.now().toString() };
  }
}
