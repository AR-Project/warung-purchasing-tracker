"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { promises as fs } from "fs";
import { z } from "zod";
import { DateTime } from "luxon";

import db from "@/infrastructure/database/db";
import { writeImageFile } from "@/infrastructure/storage/localStorage";

import { image, NewImageDbPayload } from "@/lib/schema/image";
import { verifyUserAccess } from "@/lib/utils/auth";
import { generateImageFilePath } from "@/lib/utils/fileSystem";

const imageSchema = z.custom<Blob>(
  (data) => data instanceof Blob && data.type === "image/jpeg"
);

export async function uploadImage(
  formData: FormData
): Promise<FormState<string>> {
  const [user, authError] = await verifyUserAccess([
    "admin",
    "manager",
    "staff",
  ]);
  if (authError) return { error: authError };

  const imageBlobRaw = formData.get("image");
  const currentPathRaw = formData.get("current-path");

  const { data: currentPath, error: currentPathError } = z
    .string()
    .safeParse(currentPathRaw);
  if (currentPathError) return { error: "current path is not defined" };

  const { data: imageBlob } = imageSchema.safeParse(imageBlobRaw);
  if (!imageBlob) return { error: "Expect a image" };

  const [metadata, writeError] = await writeImageFile(imageBlob);
  if (writeError !== null) return { error: "Fail to save the image" };

  const newImageDbPayload: NewImageDbPayload = {
    id: metadata.id,
    path: metadata.path,
    ownerId: user.parentId,
    creatorId: user.userId,
    originalFileName: "blob",
  };

  try {
    const [savedImage] = await db
      .insert(image)
      .values(newImageDbPayload)
      .returning({ id: image.id });
    revalidatePath(currentPath);
    return { message: "Image uploaded successfully", data: savedImage.id };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Failed to upload image" };
  }
}

const removeImageSchema = z.object({
  imageId: z.string(),
  currentPath: z.string(),
});

export async function removeImage(
  formData: FormData
): Promise<FormState<string>> {
  const [user, authError] = await verifyUserAccess([
    "admin",
    "guest",
    "manager",
  ]);
  if (authError) return { error: authError };

  const { data: payload, error: payloadError } = removeImageSchema.safeParse({
    imageId: formData.get("id"),
    currentPath: formData.get("current-path"),
  });
  if (payloadError) return { error: "Invalid Payload" };

  try {
    const [resultImage] = await db
      .select()
      .from(image)
      .where(eq(image.id, payload.imageId));
    if (!resultImage) throw new Error("Image Not Found");

    if (![resultImage.creatorId, resultImage.ownerId].includes(user.userId))
      throw new Error("Unauthorized");

    const uploadAtDateString = DateTime.fromJSDate(
      resultImage.uploadedAt
    ).toISODate();
    if (!uploadAtDateString) throw new Error("Date Invalid");

    const imageFilePath = generateImageFilePath(
      payload.imageId,
      uploadAtDateString
    );

    await fs.stat(imageFilePath);
    await fs.unlink(imageFilePath);

    await db.delete(image).where(eq(image.id, payload.imageId));
    revalidatePath(payload.currentPath);

    return { message: "Image deleted successfully" };
  } catch (error) {
    console.error("Delete error:", error);
    console.log("Payload : " + JSON.stringify(payload, null, 4));
    return { error: "Failed to delete image" };
  }
}
