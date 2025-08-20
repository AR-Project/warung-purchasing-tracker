import { item } from "@/lib/schema/item";
import { eq } from "drizzle-orm";
import { Tx } from "../database/db";

export type UpdateItemCategoryTxPayload = {
  itemId: string;
  targetCategoryId: string;
  newSortOrder: number;
};

export async function updateItemCategoryTx(
  payload: UpdateItemCategoryTxPayload,
  tx: Tx
) {
  return await tx
    .update(item)
    .set({
      categoryId: payload.targetCategoryId,
      sortOrder: payload.newSortOrder,
    })
    .where(eq(item.id, payload.itemId));
}

export type UpdateItemImageTxPayload = {
  itemId: string;
  targetImageId: string;
};

export async function updateItemImageTx(
  payload: UpdateItemImageTxPayload,
  tx: Tx
) {
  return await tx
    .update(item)
    .set({
      imageId: payload.targetImageId,
    })
    .where(eq(item.id, payload.itemId))
    .returning();
}

export type CreateItemTxPayload = {
  id: string;
  name: string;
  ownerId: string;
  creatorId: string;
  categoryId: string;
  imageId?: string | null | undefined;
  sortOrder: number;
};

export async function createItemTx(payload: CreateItemTxPayload, tx: Tx) {
  await tx.insert(item).values(payload).returning({
    id: item.id,
    name: item.name,
    categoryId: item.categoryId,
  });
}

export async function countItemUnderSingleCategoryTx(
  categoryId: string,
  tx: Tx
) {
  return await tx.$count(item, eq(item.categoryId, categoryId));
}

export async function readItemTx(itemId: string, tx: Tx) {
  return await tx.query.item.findMany({
    with: {
      image: true,
    },
    where: (item, { eq }) => eq(item.id, itemId),
  });
}
