"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { verifyUserAccess } from "@/lib/utils/auth";
import { createCategory } from "@/infrastructure/repository/itemRepo";
import { CreateCategoryDbPayload } from "@/lib/schema/item";
import { generateId } from "@/lib/utils/generator";

const createCtgryReqSchema = z.string();

export default async function createCategoryAction(formData: FormData) {
  const [userInfo, error] = await verifyUserAccess([
    "admin",
    "staff",
    "manager",
  ]);
  if (error !== null) return { error: "forbidden" };

  const { data: categoryName, success: isReqValid } =
    createCtgryReqSchema.safeParse(formData.get("category-name"));

  if (isReqValid === false) return { error: "invalid Request" };

  const payload: CreateCategoryDbPayload = {
    id: `cat-${generateId(9)}`,
    name: categoryName,
    ownerId: userInfo.userId,
    creatorId: userInfo.parentId,
  };

  const [createdCategoryId, dbError] = await createCategory(payload);
  if (dbError !== null) return { error: dbError };

  revalidatePath("/manage/category");
  return { message: "Category Created", data: createdCategoryId };
}
