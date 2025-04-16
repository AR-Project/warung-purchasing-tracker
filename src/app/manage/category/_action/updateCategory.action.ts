"use server";

import { auth } from "@/auth";
import { updateCategoryRepo } from "@/infrastructure/repository/itemRepo";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateCtgReqSchema = z.object({
  name: z.string().min(1).max(255),
  id: z.string(),
});

export default async function updateCategoryAction(formData: FormData) {
  const session = await auth();
  if (session === null) return { error: "forbidden" };

  const { data: payload, success } = updateCtgReqSchema.safeParse({
    name: formData.get("new-category-name"),
    id: formData.get("category-id"),
  });
  if (success === false) return { error: "invalid request" };

  const [id, error] = await updateCategoryRepo(payload);
  if (error !== null) return { error: "internal error" };

  revalidatePath("/manage/category");
  return { message: `${id} updated to -> ${payload.name}` };
}
