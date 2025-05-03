"use server";
import { z } from "zod";

import { updateCategorySortOrderRepo } from "@/infrastructure/repository/itemRepo";
import { verifyUserAccess } from "@/lib/utils/auth";

const updateOrderReqSchema = z.string();
const newOrderSchema = z.string().array();

export default async function updateOrderCategoryAction(formData: FormData) {
  const [userInfo, verifyUserError] = await verifyUserAccess([
    "admin",
    "manager",
    "staff",
  ]);
  if (verifyUserError !== null) return { error: verifyUserError };

  const { data: stringJSON, error: reqEror } = updateOrderReqSchema.safeParse(
    formData.get("new-order")
  );
  if (reqEror) return { error: "invalid payload" };

  console.log(stringJSON);

  const { data: newOrder, error: parseError } = newOrderSchema.safeParse(
    JSON.parse(stringJSON)
  );
  if (parseError) return { error: "invalid payload JSON" };

  const [result, repoError] = await updateCategorySortOrderRepo({
    newOrder,
    requesterUserParentId: userInfo.parentId,
  });

  if (repoError !== null) return { error: repoError };

  return { message: `Success update category order` };
}
