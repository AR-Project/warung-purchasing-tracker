"use server";

import itemRepo, {
  UpdateItemRepoPayload,
} from "@/infrastructure/repository/itemRepo";
import { verifyUserAccess } from "@/lib/utils/auth";
import { error } from "console";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  id: z.string(),
  newName: z.string(),
});

export async function updateItem(formData: FormData) {
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
  if (repoError || !result) return { error: repoError };

  revalidatePath(`/transaction/item/detail/${result.id}`);

  return {
    message: `Item name changed to ${result.name}`,
    data: result,
  };
}
