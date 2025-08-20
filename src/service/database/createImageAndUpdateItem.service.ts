import { Tx } from "@/infrastructure/database/db";

import {
  readItemTx,
  updateItemImageTx,
} from "@/infrastructure/repository/itemRepoTx";

import { InvariantError } from "@/lib/exception/InvariantError";
import { dbTxWrapper } from "./lib/factory";
import {
  createImageTx,
  deleteImageTx,
} from "@/infrastructure/repository/imageRepoTx";
import { NewImageDbPayload } from "@/lib/schema/image";
import { WriteImageFileResult } from "@/infrastructure/storage/localStorage";

export type CreateImageAndUpdateItemPayload = {
  itemId: string;
  parentId: string;
  creatorId: string;
  imageData: WriteImageFileResult;
};

async function createImageAndUpdateItemTxLogic(
  tx: Tx,
  payload: CreateImageAndUpdateItemPayload
) {
  const currentItem = await readItemTx(payload.itemId, tx);
  if (currentItem.length === 0) throw new InvariantError("itemId invalid");

  const { ownerId, creatorId } = currentItem[0];
  if (![ownerId, creatorId].includes(payload.parentId))
    throw new InvariantError("user not authorized on this item");

  const imagePayload: NewImageDbPayload = {
    ...payload.imageData,
    ownerId: payload.parentId,
    creatorId: payload.creatorId,
    originalFileName: "item image",
  };

  const [newImage] = await createImageTx(imagePayload, tx);

  const [updatedItem] = await updateItemImageTx(
    { itemId: currentItem[0].id, targetImageId: newImage.id },
    tx
  );

  let serverFileName: string | null = null;

  if (currentItem[0].image !== null) {
    const [deletedImage] = await deleteImageTx(currentItem[0].image.id, tx);

    serverFileName = deletedImage.serverFileName;
  }

  return {
    itemId: updatedItem.id,
    imageId: newImage.id,
    oldImage: serverFileName,
  };
}

export const createImageAndUpdateItemService = dbTxWrapper(
  createImageAndUpdateItemTxLogic
);
