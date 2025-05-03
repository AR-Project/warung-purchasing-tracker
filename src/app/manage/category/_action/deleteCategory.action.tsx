"use server";
import { deleteCategory } from "@/infrastructure/repository/itemRepo";
import { verifyUserAccess } from "@/lib/utils/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const deleteRequestSchema = z.string();

export default async function deleteCategoryAction(formData: FormData) {
  const [userInfo, verifyUserError] = await verifyUserAccess([
    "admin",
    "manager",
  ]);
  if (verifyUserError !== null) return { error: verifyUserError };

  const { data: categoryId, error } = deleteRequestSchema.safeParse(
    formData.get("category-id")
  );
  if (error) return { error: "invalid payload" };

  const [result, repoError] = await deleteCategory({
    categoryId,
    requesterParentId: userInfo.parentId,
  });
  if (repoError !== null) return { error: repoError };

  revalidatePath("/manage/category");

  return { message: `Success delete ${categoryId}` };
}
