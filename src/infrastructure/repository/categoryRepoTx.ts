import { category } from "@/lib/schema/category";
import { eq } from "drizzle-orm";
import { Tx } from "../database/db";

export async function countCategoryByUserTx(ownerId: string, tx: Tx) {
  return await tx.$count(category, eq(category.ownerId, ownerId));
}

export type CreateCatgoryTxPayload = {
  id: string;
  name: string;
  ownerId: string;
  creatorId: string;
  sortOrder: number;
};

export async function createCategoryTx(
  payload: CreateCatgoryTxPayload,
  tx: Tx
) {
  return await tx
    .insert(category)
    .values(payload)
    .returning({ id: category.id, name: category.name });
}
