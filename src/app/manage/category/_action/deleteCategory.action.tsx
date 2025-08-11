"use server";
import { deleteCategory } from "@/infrastructure/repository/categoryRepo";
import { adminManagerRole } from "@/lib/const";
import { verifyUserAccess } from "@/lib/utils/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const deleteRequestSchema = z.string();

export default async function deleteCategoryAction(formData: FormData) {
  const [user, authError] = await verifyUserAccess(adminManagerRole);
  if (authError !== null) return { error: authError };

  const { data: categoryId, error } = deleteRequestSchema.safeParse(
    formData.get("category-id")
  );
  if (error) return { error: "invalid payload" };

  const [result, repoError] = await deleteCategory({
    categoryId,
    requesterParentId: user.parentId,
  });
  if (repoError !== null) return { error: repoError };

  revalidatePath("/manage/category");

  return { message: `Success delete ${categoryId}` };
}
