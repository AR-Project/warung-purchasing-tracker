"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import itemRepo, {
  CreateItemRepoPayload,
} from "@/infrastructure/repository/itemRepo";
import { generateId } from "@/lib/utils/generator";
import { verifyUserAccess } from "@/lib/utils/auth";

export async function newItemAction(
  formData: FormData
): Promise<FormState<Item>> {
  const allowedRole: AvailableUserRole[] = ["staff", "admin", "manager"];
  const [user, authError] = await verifyUserAccess(allowedRole);
  if (authError) return { error: authError };

  const nameRaw = formData.get("name");
  const { data: name, error: payloadError } = z.string().safeParse(nameRaw);
  if (payloadError) return { error: "invalid payload" };

  const repoPayload: CreateItemRepoPayload = {
    id: generateId(10),
    name: name,
    ownerId: user.parentId,
    creatorId: user.userId,
  };

  const [addedItem, repoError] = await itemRepo.create(repoPayload);
  if (repoError || !addedItem) return { error: repoError };

  revalidateTag("items");
  revalidatePath("/create");

  return { message: "success", data: addedItem };
}
