"use server";
import { z } from "zod";

import { updateCategorySortOrderRepo } from "@/infrastructure/repository/categoryRepo";
import { verifyUserAccess } from "@/lib/utils/auth";
import { adminManagerStaffRole } from "@/lib/const";

const updateOrderReqSchema = z.string();
const newOrderSchema = z.string().array();

export default async function updateOrderCategoryAction(formData: FormData) {
  const [user, authError] = await verifyUserAccess(adminManagerStaffRole);
  if (authError) return { error: authError };

  const { data: payload, error: payloadErr } = updateOrderReqSchema.safeParse(
    formData.get("new-order")
  );
  if (payloadErr) return { error: "invalid payload" };

  const { data: newOrder, error: parseJSONErr } = newOrderSchema.safeParse(
    JSON.parse(payload)
  );
  if (parseJSONErr) return { error: "invalid payload JSON" };

  const [result, repoError] = await updateCategorySortOrderRepo({
    newOrder,
    requesterUserParentId: user.parentId,
  });

  if (repoError !== null) return { error: repoError };

  return { message: `Success update category order` };
}
