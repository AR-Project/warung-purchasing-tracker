"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import itemRepo, {
  CreateItemRepoPayload,
} from "@/infrastructure/repository/itemRepo";
import { generateId } from "@/lib/utils/generator";
import { verifyUserAccess } from "@/lib/utils/auth";

const optionalSchema = z.object({
  pathToRevalidate: z.string(),
  categoryId: z.string().optional(),
});

/**
 *
 * @param formData Required field `"name"`. Optional field `"category-id"` and `"path-to-revalidate"`.
 * @returns
 */
export async function createItemAction(
  formData: FormData
): Promise<FormState<Item>> {
  const allowedRole: AvailableUserRole[] = ["staff", "admin", "manager"];
  const [user, authError] = await verifyUserAccess(allowedRole);
  if (authError) return { error: authError };

  const nameRaw = formData.get("name");
  const categoryIdRaw = formData.get("category-id");
  const pathToRevalidateRaw = formData.get("path-to-revalidate");

  const { data: name, error: payloadError } = z.string().safeParse(nameRaw);
  if (payloadError) return { error: "invalid payload" };

  const repoPayload: CreateItemRepoPayload = {
    id: generateId(10),
    name: name,
    ownerId: user.parentId,
    creatorId: user.userId,
  };

  const { data: optionalData } = optionalSchema.safeParse({
    categoryId: categoryIdRaw,
    pathToRevalidateRaw: pathToRevalidateRaw,
  });

  if (optionalData) {
    repoPayload.categoryId = optionalData.categoryId;
  }

  const [addedItem, repoError] = await itemRepo.create(repoPayload);
  if (repoError || !addedItem) return { error: repoError };

  revalidateTag("items");
  revalidatePath(optionalData ? optionalData.pathToRevalidate : "/create");

  return { message: "success", data: addedItem };
}
