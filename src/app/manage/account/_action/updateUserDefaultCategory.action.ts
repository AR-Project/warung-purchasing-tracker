"use server";

import { revalidatePath } from "next/cache";
import z from "zod";

import db from "@/infrastructure/database/db";

import { allRole } from "@/lib/const";
import { verifyUserAccess } from "@/lib/utils/auth";
import { safePromise } from "@/lib/utils/safePromise";
import ClientError from "@/lib/exception/ClientError";
import { updateUserDefaultCategoryRepoTx } from "@/infrastructure/repository/userRepoTx";
import { readCategoryByIdTx } from "@/infrastructure/repository/categoryRepoTx";

const schema = z.object({
  currentPath: z.string(),
  categoryId: z.string(),
});

export async function updateUserDefaultCategory(formData: FormData) {
  const [authUser, authError] = await verifyUserAccess(allRole);
  if (authError) return { error: authError };

  const { data: payload, error: payloadError } = schema.safeParse({
    currentPath: formData.get("current-path"),
    categoryId: formData.get("category-id"),
  });

  if (payloadError) return { error: "invalid payload" };

  const { error: dbError } = await safePromise(
    db.transaction(async (tx) => {
      const currCategory = await readCategoryByIdTx(payload.categoryId, tx);
      if (!currCategory) throw new ClientError("invalid category Id");

      const { ownerId, creatorId } = currCategory;
      if (![ownerId, creatorId].includes(authUser.userId))
        throw new ClientError("not allowed");

      await updateUserDefaultCategoryRepoTx(
        { categoryId: payload.categoryId, userId: authUser.userId },
        tx
      );
    })
  );

  if (dbError) {
    return dbError instanceof ClientError
      ? { error: dbError.message }
      : { error: "internal error" };
  }

  revalidatePath(payload.currentPath);

  return {
    message: "change category",
  };
}
