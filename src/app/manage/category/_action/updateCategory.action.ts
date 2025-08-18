"use server";

import { updateCategoryRepo } from "@/infrastructure/repository/categoryRepo";
import { adminManagerStaffRole } from "@/lib/const";
import { verifyUserAccess } from "@/lib/utils/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateCtgReqSchema = z.object({
  name: z.string().min(1).max(255),
  id: z.string(),
});

export default async function updateCategoryAction(formData: FormData) {
  const [user, authError] = await verifyUserAccess(adminManagerStaffRole);
  if (authError) return { error: "forbidden" };

  const { data: payload, error: payloadError } = updateCtgReqSchema.safeParse({
    name: formData.get("new-category-name"),
    id: formData.get("category-id"),
  });
  if (payloadError) return { error: "invalid request" };

  const [id, error] = await updateCategoryRepo({
    ...payload,
    requesterParentId: user.parentId,
  });
  if (error !== null) return { error: "internal error" };

  revalidatePath("/manage/category");
  return { message: `${id} updated to -> ${payload.name}` };
}
