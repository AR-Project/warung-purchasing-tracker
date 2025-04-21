"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { createCategory } from "@/infrastructure/repository/itemRepo";
import { CreateCategoryDbPayload } from "@/lib/schema/item";
import { generateId } from "@/lib/utils/generator";

const createCtgryReqSchema = z.string();

export default async function createCategoryAction(formData: FormData) {
  const session = await auth();
  if (session === null) return { error: "forbidden" };

  const { data: categoryName, success: isReqValid } =
    createCtgryReqSchema.safeParse(formData.get("category-name"));

  if (isReqValid === false) return { error: "invalid Request" };

  const payload: CreateCategoryDbPayload = {
    id: `cat-${generateId(9)}`,
    name: categoryName,
    ownerId: session.user.userId,
    creatorId: session.user.parentId,
  };

  const [createdCategoryId, dbError] = await createCategory(payload);
  if (dbError !== null) return { error: dbError };

  revalidatePath("/manage/category");
  return { message: "Category Created", data: createdCategoryId };
}
