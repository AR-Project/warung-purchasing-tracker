"use server";
import { z } from "zod";
import { DrizzleError, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import { purchases } from "@/lib/schema/schema";
import { user } from "@/lib/schema/user";
import { getUserInfo } from "@/lib/utils/auth";

export async function updatePurchaseDate(prevState: any, formData: FormData) {
  const purchaseIdRaw = formData.get("purchase-id");
  const newPurchaseDateStringRaw = formData.get("new-purchase-date");

  const schema = z.object({
    purchaseId: z.string(),
    newPurchaseDateString: z.string().date(),
  });

  const allowedRole: AvailableUserRole[] = ["admin", "manager"];
  let invariantError: string | undefined;

  try {
    const { userId: loggedInUserId } = await getUserInfo();

    const { data: payload } = schema.safeParse({
      purchaseId: purchaseIdRaw,
      newPurchaseDateString: newPurchaseDateStringRaw,
    });
    if (!payload) {
      invariantError = "Invalid Payload Format";
      throw new Error(invariantError);
    }

    await db.transaction(async (tx) => {
      // Validate role
      const [currentUser] = await tx
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, loggedInUserId));
      if (!allowedRole.includes(currentUser.role)) {
        invariantError = "Not Allowed";
        tx.rollback();
      }

      // Validate Purchase
      const purchase = await tx
        .select()
        .from(purchases)
        .where(eq(purchases.id, payload.purchaseId));

      if (purchase.length == 0) {
        invariantError = "Purchase Not Exist";
        tx.rollback();
      }

      // Commit database change
      await tx
        .update(purchases)
        .set({
          purchasedAt: new Date(payload.newPurchaseDateString),
          modifiedAt: new Date(),
        })
        .where(eq(purchases.id, payload.purchaseId))
        .returning({ id: purchases.id });
    });
    revalidatePath(`/transaction/details/${payload.purchaseId}`);
    return { message: `Purchase Date changed` };
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
