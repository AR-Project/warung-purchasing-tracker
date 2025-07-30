"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import itemRepo, {
  type UpdateCategoryIdRepoPayload,
} from "@/infrastructure/repository/itemRepo";
import { verifyUserAccess } from "@/lib/utils/auth";

const schema = z.object({
  itemId: z.string(),
  targetCategoryId: z.string(),
  pathToRevalidate: z.string(),
});

export async function updateItemCategory(formData: FormData) {
  const [user, verifyError] = await verifyUserAccess(["admin", "manager"]);
  if (verifyError) return { error: verifyError };

  const { data, error: payloadError } = schema.safeParse({
    itemId: formData.get("item-id"),
    targetCategoryId: formData.get("target-category-id"),
    pathToRevalidate: formData.get("path-to-revalidate"),
  });

  if (payloadError) return { error: "invalid payload" };

  const repoPayload: UpdateCategoryIdRepoPayload = {
    parentId: user.parentId,
    userId: user.userId,
    itemId: data.itemId,
    targetCategoryId: data.targetCategoryId,
  };

  const [result, repoError] = await itemRepo.updateCategoryId(repoPayload);
  if (repoError !== null) return { error: repoError };

  revalidatePath(data.pathToRevalidate);

  return {
    message: `Item's Category is changed`,
  };
}
