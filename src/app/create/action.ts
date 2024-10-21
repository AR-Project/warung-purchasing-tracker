"use server";

import path from "path";
import { promises as fs } from "fs";
import { revalidatePath, revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";

import db from "@/infrastructure/database/db";
import { images, purchasedItems, purchases } from "@/lib/schema/schema";
import { generateId } from "@/lib/utils/generator";
import { isString } from "@/lib/utils/validator";

export async function makePurchase(prevState: any, formData: FormData) {
  const vendorId = formData.get("vendor-id");
  const purchasedAt = formData.get("purchased-at");
  const itemsRaw = formData.get("items");
  const totalPrice = formData.get("total-price");
  const image = formData.get("image");

  if (
    !isString(vendorId) ||
    !isString(purchasedAt) ||
    !isString(itemsRaw) ||
    !isString(totalPrice)
  )
    return {
      error: "data Invalid",
    };

  const items = JSON.parse(itemsRaw) as CreatePurchaseItemPayload[];

  try {
    const id = await db.transaction(async (tx) => {
      const imageId: string | null = await tx.transaction(async (tx) => {
        try {
          const processedImageMetadata = await imageFormValidator(
            image,
            purchasedAt
          );
          if (!processedImageMetadata) return null;
          const [uploadedImage] = await db
            .insert(images)
            .values(processedImageMetadata)
            .returning({ imageId: images.id });

          return uploadedImage.imageId;
        } catch (error) {
          console.log(error);
          tx.rollback();
          return null;
        }
      });

      const [newPurchase] = await tx
        .insert(purchases)
        .values({
          id: generateId(10),
          imageId: imageId,
          vendorId,
          purchasedAt: new Date(purchasedAt),
          totalPrice: parseInt(totalPrice),
          createdAt: new Date(),
        })
        .returning({ id: purchases.id });

      const payload = items.map((item) => ({
        ...item,
        purchaseId: newPurchase.id,
        id: generateId(14),
      }));
      const purchasedItemId = payload.map((item) => item.id);

      await tx.insert(purchasedItems).values(payload);
      await tx
        .update(purchases)
        .set({ purchasedItemId })
        .where(eq(purchases.id, newPurchase.id));
      return newPurchase.id;
    });

    revalidateTag("transaction");
    revalidatePath("/transaction");
    return {
      message: `Transaction ${id} created`,
      data: id,
    };
  } catch (error) {
    console.log(error);

    return { error: "Transaksi Gagal" };
  }
}

async function imageFormValidator(
  image: FormDataEntryValue | null,
  purchasedAt: string
): Promise<{ id: string; originalFileName: string } | null> {
  // Validate
  if (typeof image === "string" || image === null) {
    return null;
  }
  const allowedExtension = [".jpg", ".jpeg"];
  // Image metadata validate and processing
  const fileExtension = image.name.match(/\.[0-9a-z]+$/i);

  if (fileExtension === null || !allowedExtension.includes(fileExtension[0])) {
    throw new Error("Only accepting jpeg file");
  }
  const imageId = `tx-${purchasedAt}-${generateId(10)}`;
  const filename = imageId + fileExtension;
  const buffer = Buffer.from(await image.arrayBuffer());
  const uploadPath = path.join(process.cwd(), "images", filename);

  // Proccessing
  await fs.writeFile(uploadPath, buffer);
  return { id: imageId, originalFileName: image.name };
}
