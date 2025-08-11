"use server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import { purchase } from "@/lib/schema/purchase";

import { verifyUserAccess } from "@/lib/utils/auth";
import { adminManagerRole } from "@/lib/const";
import ClientError from "@/lib/exception/ClientError";
import { actionErrorDecoder } from "@/lib/exception/errorDecoder";

const schema = z.object({
  purchaseId: z.string(),
  newVendorId: z.string(),
});

export async function updatePurchaseVendor(formData: FormData) {
  const [user, authError] = await verifyUserAccess(adminManagerRole);
  if (authError) return { error: authError };

  const purchaseId = formData.get("purchase-id");
  const newVendorId = formData.get("new-purchase-vendor-id");

  const { data: payload, error: pyError } = schema.safeParse({
    purchaseId,
    newVendorId,
  });
  if (pyError) return { error: "Invalid Payload" };

  try {
    await db.transaction(async (tx) => {
      const currPurchase = await tx.query.purchase.findFirst({
        where: (purchase, { eq }) => eq(purchase.id, payload.purchaseId),
      });
      if (!currPurchase) throw new ClientError("Purchase Not Exist");
      if (![currPurchase.creatorId, currPurchase.ownerId].includes(user.userId))
        throw new ClientError("Not Allowed");

      const pickedVendor = await tx.query.vendor.findFirst({
        where: (vendor, { eq }) => eq(vendor.id, payload.newVendorId),
      });
      if (!pickedVendor) throw new ClientError("Vendor not exist");

      await tx
        .update(purchase)
        .set({ vendorId: payload.newVendorId, modifiedAt: new Date() })
        .where(eq(purchase.id, payload.purchaseId))
        .returning({ id: purchase.id });
    });
    revalidatePath(`/transaction/details/${payload.purchaseId}`);
    return { message: `Vendor changed` };
  } catch (error) {
    return actionErrorDecoder(error);
  }
}
