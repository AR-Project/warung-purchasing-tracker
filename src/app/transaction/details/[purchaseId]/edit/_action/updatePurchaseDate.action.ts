"use server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import { purchase } from "@/lib/schema/purchase";
import { verifyUserAccess } from "@/lib/utils/auth";
import ClientError from "@/lib/exception/ClientError";
import { actionErrorDecoder } from "@/lib/exception/errorDecoder";

const schema = z.object({
  purchaseId: z.string(),
  newPurchaseDateString: z.iso.date(),
});

export async function updatePurchaseDate(formData: FormData) {
  const [user, authError] = await verifyUserAccess(["admin", "manager"]);
  if (authError) return { error: authError };

  const { data: payload, error: payloadErr } = schema.safeParse({
    purchaseId: formData.get("purchase-id"),
    newPurchaseDateString: formData.get("new-purchase-date"),
  });
  if (payloadErr) return { error: "Invalid Payload" };
  try {
    await db.transaction(async (tx) => {
      const currPurchase = await tx.query.purchase.findFirst({
        where: (purchase, { eq }) => eq(purchase.id, payload.purchaseId),
      });

      if (!currPurchase) throw new ClientError("Purchase Not Exist");
      if (![currPurchase.ownerId, currPurchase.creatorId].includes(user.userId))
        throw new ClientError("Not Allowed");

      await tx
        .update(purchase)
        .set({
          purchasedAt: new Date(payload.newPurchaseDateString),
          modifiedAt: new Date(),
        })
        .where(eq(purchase.id, payload.purchaseId))
        .returning({ id: purchase.id });
    });
    revalidatePath(`/transaction/details/${payload.purchaseId}`);
    return { message: `Purchase Date changed` };
  } catch (error) {
    return actionErrorDecoder(error);
  }
}
