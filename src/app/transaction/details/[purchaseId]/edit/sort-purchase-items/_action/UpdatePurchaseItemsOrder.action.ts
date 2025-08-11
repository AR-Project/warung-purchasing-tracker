"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { updateOrderOfPurchaseItem } from "@/infrastructure/repository/purchaseRepository";
import { verifyUserAccess } from "@/lib/utils/auth";
import { adminManagerRole } from "@/lib/const";

const schema = z.object({
  purchaseId: z.string(),
  updatedListString: z.string(),
});

const updatedListSchema = z.string().array();

export async function updateListOrderOfPurchaseItem(formData: FormData) {
  const [user, authError] = await verifyUserAccess(adminManagerRole);
  if (authError) return { error: authError };

  const { data: payload, error: payloadError } = schema.safeParse({
    purchaseId: formData.get("purchase-id"),
    updatedListString: formData.get("updated-list"),
  });
  if (payloadError) return { error: "Invalid payload" };

  const { data: newOrder, error: newOrderError } = updatedListSchema.safeParse(
    JSON.parse(payload.updatedListString)
  );
  if (newOrderError) return { error: "Invalid payload" };

  const dbError = await updateOrderOfPurchaseItem({
    requester: user,
    purchaseId: payload.purchaseId,
    newOrder,
  });

  if (dbError) return { error: dbError };
  revalidatePath(`/transaction/details/${payload.purchaseId}`);
  return { message: `Purchase Item Order Changed` };
}
