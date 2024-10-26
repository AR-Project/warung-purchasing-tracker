"use server";

import path from "path";
import { promises as fs } from "fs";
import { revalidatePath, revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import db from "@/infrastructure/database/db";
import {
  images,
  NewImageDbPayload,
  NewPurchaseDbPayload,
  purchasedItems,
  NewPurchaseItemDbPayload,
  purchases,
} from "@/lib/schema/schema";
import { generateId } from "@/lib/utils/generator";
import { getUserInfo } from "@/lib/utils/auth";

export async function savePurchaseAction(formData: FormData) {
  const vendorIdRaw = formData.get("vendor-id");
  const purchasedAtRaw = formData.get("purchased-at");
  const listOfPurchaseItemAsStrRaw = formData.get("items");
  const totalPriceRaw = formData.get("total-price");

  const image = formData.get("image");

  const payloadSchema = z.object({
    vendorId: z.string(),
    purchasedAt: z.string().date(),
    listOfPurchaseItemAsStr: z.string(),
    totalPrice: z.coerce.number(),
  });

  const listOfPurchaseItemUserPayloadSchema = z.array(
    z.object({
      itemId: z.string(),
      quantityInHundreds: z.coerce.number(),
      pricePerUnit: z.coerce.number(),
      totalPrice: z.coerce.number(),
    })
  );

  try {
    const { userId: creatorId, parentId: ownerId } = await getUserInfo();

    const { data: userPayload } = payloadSchema.safeParse({
      vendorId: vendorIdRaw,
      purchasedAt: purchasedAtRaw,
      listOfPurchaseItemAsStr: listOfPurchaseItemAsStrRaw,
      totalPrice: totalPriceRaw,
    });
    if (!userPayload) return { error: "Invalid payload" };

    const { data: listOfPurchaseItemUserPayload } =
      listOfPurchaseItemUserPayloadSchema.safeParse(
        JSON.parse(userPayload.listOfPurchaseItemAsStr)
      );
    if (!listOfPurchaseItemUserPayload) return { error: "Invalid payload" };

    const savedPurchaseId = await db.transaction(async (tx) => {
      const imageId: string | null = await tx.transaction(async (tx) => {
        try {
          const processedImageMetadata = await imageFormValidator(
            image,
            userPayload.purchasedAt
          );

          if (!processedImageMetadata) return null;

          const newImageDbPayoad: NewImageDbPayload = {
            ...processedImageMetadata,
            creatorId,
            ownerId,
          };
          const [savedImage] = await tx
            .insert(images)
            .values(newImageDbPayoad)
            .returning({ imageId: images.id });

          return savedImage.imageId;
        } catch (error) {
          console.log(error);
          tx.rollback(); // rollback on image tx scope
          return null;
        }
      });

      const newPurchaseDbPayload: NewPurchaseDbPayload = {
        id: generateId(10),
        creatorId,
        ownerId,
        imageId: imageId,
        vendorId: userPayload.vendorId,
        purchasedAt: new Date(userPayload.purchasedAt),
        totalPrice: userPayload.totalPrice,
      };

      const [savedPurchase] = await tx
        .insert(purchases)
        .values(newPurchaseDbPayload)
        .returning({ id: purchases.id });

      const listOfPurchaseItemDbPayload: NewPurchaseItemDbPayload[] =
        listOfPurchaseItemUserPayload.map((item) => ({
          ...item,
          id: generateId(14),
          purchaseId: savedPurchase.id,
          creatorId,
          ownerId,
        }));
      await tx.insert(purchasedItems).values(listOfPurchaseItemDbPayload);

      const listOfPurchaseItemId = listOfPurchaseItemDbPayload.map(
        (item) => item.id
      );
      await tx
        .update(purchases)
        .set({ purchasedItemId: listOfPurchaseItemId })
        .where(eq(purchases.id, savedPurchase.id));
      return savedPurchase.id;
    });

    revalidateTag("transaction");
    revalidatePath("/transaction");
    return {
      message: `Transaction ${savedPurchaseId} saved`,
      data: savedPurchaseId,
    };
  } catch (error) {
    console.log(error);

    return { error: "Fail to save transaction" };
  }
}

async function imageFormValidator(
  image: FormDataEntryValue | null,
  purchasedAt: string
): Promise<{ id: string; originalFileName: string } | null> {
  // Validate
  if (image === null) return null;

  if (typeof image === "string") {
    // User submit something but it is a string
    throw new Error("Image payload not a file");
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
