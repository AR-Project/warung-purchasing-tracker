"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import itemRepo, {
  UpdateItemRepoPayload,
} from "@/infrastructure/repository/itemRepo";
import { verifyUserAccess } from "@/lib/utils/auth";

const schema = z.object({
  id: z.string(),
  newName: z.string(),
});

export async function updateItemName(formData: FormData) {
  const [user, verifyError] = await verifyUserAccess(["admin", "manager"]);
  if (verifyError) return { error: verifyError };

  const { data, error: payloadError } = schema.safeParse({
    id: formData.get("id"),
    newName: formData.get("name"),
  });

  if (payloadError) return { error: "invalid payload" };

  const repoPayload: UpdateItemRepoPayload = {
    id: data.id,
    newName: data.newName,
    parentId: user.parentId,
    userId: user.userId,
  };

  const [result, repoError] = await itemRepo.update(repoPayload);
  if (repoError !== null) return { error: repoError };

  revalidatePath(`/transaction/item/detail/${result.id}`);

  return {
    message: `Item name changed to ${result.name}`,
    data: result,
  };
}
