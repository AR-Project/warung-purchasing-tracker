"use server";
import { z } from "zod";
import { DrizzleError, eq } from "drizzle-orm";

import db from "@/infrastructure/database/db";
import { vendor } from "@/lib/schema/vendor";
import { purchase } from "@/lib/schema/purchase";
import { revalidatePath } from "next/cache";
import { user } from "@/lib/schema/user";
import { getUserInfo } from "@/lib/utils/auth";

export async function updatePurchaseVendor(formData: FormData) {
  const purchaseId = formData.get("purchase-id");
  const newVendorId = formData.get("new-purchase-vendor-id");

  const schema = z.object({
    purchaseId: z.string(),
    newVendorId: z.string(),
  });

  let invariantError: string | undefined;

  const allowedRole: AvailableUserRole[] = ["admin", "manager"];

  try {
    const { userId } = await getUserInfo();

    const { data: payload } = schema.safeParse({
      purchaseId,
      newVendorId,
    });
    if (!payload) {
      invariantError = "Invalid Payload";
      throw new Error(invariantError);
    }

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

      const currentPurchase = await tx
        .select()
        .from(purchase)
        .where(eq(purchase.id, payload.purchaseId));
      if (currentPurchase.length == 0) {
        invariantError = "Purchase Not Exist";
        tx.rollback();
      }
      const { creatorId, ownerId } = currentPurchase[0];
      if (![creatorId, ownerId].includes(userId)) {
        invariantError = "Not Allowed";
        tx.rollback();
      }

      const vendorResult = await tx
        .select()
        .from(vendor)
        .where(eq(vendor.id, payload.newVendorId));
      if (vendorResult.length == 0) {
        invariantError = "Vendor not exist";
        tx.rollback();
      }

      await tx
        .update(purchase)
        .set({ vendorId: payload.newVendorId, modifiedAt: new Date() })
        .where(eq(purchase.id, payload.purchaseId))
        .returning({ id: purchase.id });
    });
    revalidatePath(`/transaction/details/${payload.purchaseId}`);
    return { message: `Vendor changed` };
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
