import { Tx } from "@/infrastructure/database/db";
import {
  countCategoryByUserTx,
  createCategoryTx,
  CreateCatgoryTxPayload,
} from "@/infrastructure/repository/categoryRepoTx";
import {
  readItemTx,
  UpdateItemCategoryTxPayload,
} from "@/infrastructure/repository/itemRepoTx";
import { updateItemCategoryTx } from "@/infrastructure/repository/itemRepoTx";
import { InvariantError } from "@/lib/exception/InvariantError";
import { dbTxWrapper } from "./lib/factory";

export type CreateCtgAndMoveItemPayload = {
  itemId: string;
  newCategoryId: string;
  newCategoryName: string;
  parentId: string;
  creatorId: string;
};

async function createCategoryAndMoveItemTxLogic(
  tx: Tx,
  payload: CreateCtgAndMoveItemPayload
) {
  const currentItem = await readItemTx(payload.itemId, tx);
  if (currentItem.length === 0) throw new InvariantError("itemId invalid");

  const { ownerId, creatorId } = currentItem[0];
  if (![ownerId, creatorId].includes(payload.parentId))
    throw new InvariantError("user not authorized on this item");

  // read user total category -> get value of item sortOrder on newCategory
  const categoryCount = await countCategoryByUserTx(payload.parentId, tx);

  // create category
  const createCategoryTxPayload: CreateCatgoryTxPayload = {
    id: payload.newCategoryId,
    creatorId: payload.creatorId,
    name: payload.newCategoryName,
    ownerId: payload.creatorId,
    sortOrder: categoryCount,
  };

  const [newCategory] = await createCategoryTx(createCategoryTxPayload, tx);

  // update item's category
  const updateItemCategoryTxPayload: UpdateItemCategoryTxPayload = {
    itemId: payload.itemId,
    newSortOrder: 0,
    targetCategoryId: newCategory.id,
  };
  await updateItemCategoryTx(updateItemCategoryTxPayload, tx);

  return {
    itemName: currentItem[0].name,
    categoryName: newCategory.name,
  };
}

export const createCategoryAndMoveItemService = dbTxWrapper(
  createCategoryAndMoveItemTxLogic
);
