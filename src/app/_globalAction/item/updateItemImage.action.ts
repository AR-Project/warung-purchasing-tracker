"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { verifyUserAccess } from "@/lib/utils/auth";
import { adminManagerRole } from "@/lib/const";
import { createImageAndUpdateItemService } from "@/service/database/createImageAndUpdateItem.service";
import {
  deleteImageFile,
  writeImageFile,
} from "@/infrastructure/storage/localStorage";
import { logger } from "@/lib/logger";
import { generateImagePathOnServer } from "@/lib/utils/fileSystem";

const schema = z.object({
  itemId: z.string(),
  imageBlob: z.custom<Blob>(
    (data) => data instanceof Blob && data.type === "image/jpeg"
  ),
  pathToRevalidate: z.string(),
});

export async function updateItemImageAction(formData: FormData) {
  const [user, verifyError] = await verifyUserAccess(adminManagerRole);
  if (verifyError) return { error: verifyError };

  const { data: payload, error: payloadError } = schema.safeParse({
    itemId: formData.get("item-id"),
    imageBlob: formData.get("image-blob"),
    pathToRevalidate: formData.get("path-to-revalidate"),
  });

  if (payloadError) return { error: "invalid payload" };

  const [imageMeta, writeError] = await writeImageFile(
    payload.imageBlob,
    user.parentId
  );
  if (writeError !== null) return { error: writeError };

  const [dbResult, dbError] = await createImageAndUpdateItemService({
    itemId: payload.itemId,
    parentId: user.parentId,
    creatorId: user.userId,
    imageData: imageMeta,
  });

  if (dbError !== null) {
    // Delete file
    await deleteImageFile(
      generateImagePathOnServer(user.parentId, imageMeta.serverFileName)
    );
    console.log(dbError);

    logger.error("Database Error", {
      location: "updateItemImageAction -> createImageAndUpdateItem Service",
    });
    return { error: "Internal Error" };
  }

  if (dbResult.oldImage !== null) {
    // Make sure this operation delete old image file
    await deleteImageFile(
      generateImagePathOnServer(user.parentId, dbResult.oldImage)
    );
  }

  revalidatePath(payload.pathToRevalidate);

  return {
    message: `Item's Images updated`,
  };
}
