"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { updateOrderOfPurchaseItem } from "@/infrastructure/repository/purchaseRepository";

export async function updateListOrderOfPurchaseItem(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Forbidden" };

  const purchaseIdRaw = formData.get("purchase-id");
  const updatedListStringRaw = formData.get("updated-list");

  const schema = z.object({
    purchaseId: z.string(),
    updatedListString: z.string(),
  });
  const updatedListSchema = z.string().array();

  const { data: payload } = schema.safeParse({
    purchaseId: purchaseIdRaw,
    updatedListString: updatedListStringRaw,
  });
  if (!payload) return { error: "Invalid payload" };

  const { data: newOrderOfPurchaseItemId } = updatedListSchema.safeParse(
    JSON.parse(payload.updatedListString)
  );
  if (!newOrderOfPurchaseItemId) return { error: "Invalid payload" };

  const dbError = await updateOrderOfPurchaseItem({
    requester: session.user,
    purchaseId: payload.purchaseId,
    newOrder: newOrderOfPurchaseItemId,
  });

  if (dbError) return { error: dbError };
  revalidatePath(`/transaction/details/${payload.purchaseId}`);
  return { message: `Purchase Item Order Changed` };
}

// OLD LINE 130
