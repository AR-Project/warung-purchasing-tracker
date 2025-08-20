"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { verifyUserAccess } from "@/lib/utils/auth";
import { generateId } from "@/lib/utils/generator";
import { createCategoryAndMoveItemService } from "@/service/createCategoryAndMoveItem.service";

const schema = z.object({
  itemId: z.string(),
  newCategory: z.string().min(3),
  pathToRevalidate: z.string(),
});

export async function createCategoryAndMoveItemAction(formData: FormData) {
  const [user, verifyError] = await verifyUserAccess(["admin", "manager"]);
  if (verifyError) return { error: verifyError };

  const { data, error: payloadError } = schema.safeParse({
    itemId: formData.get("item-id"),
    newCategory: formData.get("new-category"),
    pathToRevalidate: formData.get("path-to-revalidate"),
  });

  if (payloadError) return { error: "invalid payload" };

  const [result, serviceError] = await createCategoryAndMoveItemService({
    creatorId: user.userId,
    newCategoryId: `cat-${generateId(10)}`,
    itemId: data.itemId,
    newCategoryName: data.newCategory,
    parentId: user.parentId,
  });

  if (serviceError) return { error: serviceError };

  revalidatePath(data.pathToRevalidate);
  return {
    message: `Success`,
    data: result,
  };
}
