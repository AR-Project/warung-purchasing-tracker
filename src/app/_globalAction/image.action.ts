"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import path from "path";
import { promises as fs } from "fs";

import db from "@/infrastructure/database/db";

import { generateId } from "@/lib/utils/generator";
import { images, NewImageDbPayload } from "@/lib/schema/schema";
import { auth } from "@/auth";

export async function uploadImage(
  prevState: any,
  formData: FormData
): Promise<FormState<string>> {
  const session = await auth();
  if (!session) return { error: "Must login first" };
  const { user } = session;

  const payload = formData.get("image");
  if (payload === null || typeof payload === "string")
    return { error: "No payload" };

  const fileExtension = payload.name.match(/\.[0-9a-z]+$/i);
  const allowedExtension = [".jpg", ".jpeg"];
  if (fileExtension === null || !allowedExtension.includes(fileExtension[0]))
    return { error: "Must Be image files" };

  try {
    const id = `lib-${generateId(10)}`;
    const filename = id + fileExtension;
    const buffer = Buffer.from(await payload.arrayBuffer());
    const uploadPath = path.join(process.cwd(), "images", filename);

    const dbPayload: NewImageDbPayload = {
      id,
      ownerId: user.parentId,
      creatorId: user.userId,
      originalFileName: payload.name,
    };
    await db.insert(images).values(dbPayload);
    await fs.writeFile(uploadPath, buffer);
    revalidatePath("/library");
    return { message: "Image uploaded successfully", data: id };
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

    const imagePath = path.join(
      process.cwd(),
      "images",
      `${image.id}${image.fileExtension}`
    );

    await fs.stat(imagePath);
    await fs.unlink(imagePath);
    await db.delete(images).where(eq(images.id, payload));
    revalidatePath("/library");
    return { message: "Image deleted successfully" };
  } catch (error) {
    console.error("Delete error:", error);
    return { error: "Failed to delete image" };
  }
}
