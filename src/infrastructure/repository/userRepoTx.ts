import { user } from "@/lib/schema/user";
import { Tx } from "../database/db";
import { eq } from "drizzle-orm";

type UpdateUserDefaultCategoryRepoTxPayload = {
  userId: string;
  categoryId: string;
};

export async function updateUserDefaultCategoryRepoTx(
  payload: UpdateUserDefaultCategoryRepoTxPayload,
  tx: Tx
) {
  return await tx
    .update(user)
    .set({ defaultCategory: payload.categoryId })
    .where(eq(user.id, payload.userId));
}
