"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import path from "path";
import { promises as fs } from "fs";
import { z } from "zod";

import { auth } from "@/auth";
import db from "@/infrastructure/database/db";
import { writeImageFile } from "@/infrastructure/storage/localStorage";
import { images, NewImageDbPayload } from "@/lib/schema/schema";

export async function uploadImage(
  prevState: any,
  formData: FormData
): Promise<FormState<string>> {
  const session = await auth();
  if (!session) return { error: "Must login first" };

  const payload = formData.get("image");
  const imageSchema = z.custom<Blob>(
    (data) => data instanceof Blob && data.type === "image/jpeg"
  );

  const { data: img } = imageSchema.safeParse(payload);
  if (!img) return { error: "Expect a image" };

  const [metadata] = await writeImageFile(img);
  if (!metadata) return { error: "Fail to save the image" };

  const newImageDbPayload: NewImageDbPayload = {
    id: metadata.id,
    path: metadata.path,
    ownerId: session.user.parentId,
    creatorId: session.user.userId,
    originalFileName: "blob",
  };

  try {
    const [savedImage] = await db
      .insert(images)
      .values(newImageDbPayload)
      .returning({ id: images.id });
    revalidatePath("/library");
    return { message: "Image uploaded successfully", data: savedImage.id };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Failed to upload image" };
  }
}

export async function removeImage(
  prevState: any,
  formData: FormData
): Promise<FormState<string>> {
  const session = await auth();
  if (!session) return { error: "Must login first" };
  const { user } = session;

  const payload = formData.get("id");
  if (typeof payload !== "string") return { error: "No payload" };

  try {
    const [image] = await db
      .select()
      .from(images)
      .where(eq(images.id, payload));
    if (!image) throw new Error("Image Not Found");

    if (![image.creatorId, image.ownerId].includes(user.userId))
      throw new Error("Unauthorized");

    const imageFilePath = path.join(process.cwd(), image.path);

    await fs.stat(imageFilePath);
    await fs.unlink(imageFilePath);
    await db.delete(images).where(eq(images.id, payload));
    revalidatePath("/library");
    return { message: "Image deleted successfully" };
  } catch (error) {
    console.error("Delete error:", error);
    return { error: "Failed to delete image" };
  }
}
