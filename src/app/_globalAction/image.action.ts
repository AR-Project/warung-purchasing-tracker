"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import path from "path";
import { promises as fs } from "fs";

import db from "@/infrastructure/database/db";

import { generateId } from "@/lib/utils/generator";
import { images } from "@/lib/schema/schema";

export async function uploadImage(
  prevState: any,
  formData: FormData
): Promise<FormState<string>> {
  const payload = formData.get("image");

  if (payload === null || typeof payload === "string") {
    return { error: "No payload" };
  }

  const fileExtension = payload.name.match(/\.[0-9a-z]+$/i);
  const allowedExtension = [".jpg", ".jpeg"];

  if (fileExtension === null || !allowedExtension.includes(fileExtension[0])) {
    return { error: "Must Be image files" };
  }

  const id = `lib-${generateId(10)}`;
  const filename = id + fileExtension;
  const buffer = Buffer.from(await payload.arrayBuffer());
  const uploadPath = path.join(process.cwd(), "images", filename);

  try {
    await db.insert(images).values({
      id,
      originalFileName: payload.name,
    });
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
  const payload = formData.get("id");

  if (typeof payload !== "string") {
    return { error: "No payload" };
  }

  try {
    const [image] = await db
      .select()
      .from(images)
      .where(eq(images.id, payload));
    if (!image) {
      throw new Error("Image Not Found");
    }
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
