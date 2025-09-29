"use server";

"use server";
import { z } from "zod";

import { verifyUserAccess } from "@/lib/utils/auth";
import { adminManagerStaffRole } from "@/lib/const";
import itemRepo, { UpdateOrderItemRepoPayload } from "@/infrastructure/repository/itemRepo";

const updateOrderReqSchema = z.object({
  categoryId: z.string(),
  newOrderAsString: z.string()
});
const newOrderSchema = z.string().array();

export default async function updateItemSortOrderAction(formData: FormData) {
  const [user, authError] = await verifyUserAccess(adminManagerStaffRole);
  if (authError) return { error: authError };

  const { data: payload, error: payloadErr } = updateOrderReqSchema.safeParse({
    categoryId: formData.get("category-id"),
    newOrderAsString: formData.get("new-order")
  }

  );
  if (payloadErr) return { error: "invalid payload" };

  const { data: newOrder, error: parseNewOrderErr } = newOrderSchema.safeParse(
    JSON.parse(payload.newOrderAsString)
  );
  if (parseNewOrderErr) return { error: "invalid payload JSON" };

  const updateItemSortOrderPayload: UpdateOrderItemRepoPayload = {
    categoryId: payload.categoryId,
    newOrder: newOrder,
    userId: user.userId,
    parentId: user.parentId
  }

  console.log(updateItemSortOrderPayload);

  const [status, dbErr] = await itemRepo.updateSortOrder(updateItemSortOrderPayload)

  if (dbErr !== null) return { error: dbErr }

  return { message: `Success Saving` };
}
