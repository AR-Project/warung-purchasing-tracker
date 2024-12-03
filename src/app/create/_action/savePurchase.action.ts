"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { NewImageDbPayload, NewPurchaseDbPayload } from "@/lib/schema/schema";
import { generateId } from "@/lib/utils/generator";
import {
  ImageMetadata,
  writeImageFile,
} from "@/infrastructure/storage/localStorage";
import { saveNewPurchase } from "@/infrastructure/repository/purchaseRepository";

export async function savePurchaseAction(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Forbidden" };

  const [validatedPayload] = validateFormData(formData);
  if (!validatedPayload) return { error: "Invalid Payload" };
  const { newPurchasePayload, listOfPurchaseItem } = validatedPayload;

  const imageRaw = formData.get("image");
  const [validatedImage] = validateFormImage(imageRaw);

  let imageMetadata: ImageMetadata | null = null;
  let newImageDbPayload: NewImageDbPayload | null = null;

  if (validatedImage) {
    const [metadata] = await writeImageFile(validatedImage);
    imageMetadata = metadata;
  }

  const newPurchaseDbPayload: NewPurchaseDbPayload = {
    id: generateId(10),
    creatorId: session.user.userId,
    ownerId: session.user.parentId,
    imageId: imageMetadata ? imageMetadata.id : null,
    vendorId: newPurchasePayload.vendorId,
    purchasedAt: new Date(newPurchasePayload.purchasedAt),
    totalPrice: newPurchasePayload.totalPrice,
  };

  if (imageMetadata) {
    newImageDbPayload = {
      ...imageMetadata,
      creatorId: session.user.userId,
      ownerId: session.user.parentId,
      originalFileName: "transaction",
    };
  }

  const [savedPurchaseId] = await saveNewPurchase(
    newPurchaseDbPayload,
    listOfPurchaseItem,
    newImageDbPayload
  );
  if (!savedPurchaseId) return { error: "Fail to save transaction" };

  revalidateTag("transaction");
  revalidatePath("/transaction");
  return {
    message: `Transaction ${savedPurchaseId} saved`,
    data: savedPurchaseId,
  };
}
/** -------------------- */

type NewPurchasePayload = {
  vendorId: string;
  purchasedAt: string;
  totalPrice: number;
  listOfPurchaseItemAsStr: string;
};

type ListOfPurchaseItem = {
  totalPrice: number;
  itemId: string;
  quantityInHundreds: number;
  pricePerUnit: number;
}[];

type ValidatedData = {
  newPurchasePayload: NewPurchasePayload;
  listOfPurchaseItem: ListOfPurchaseItem;
};

function validateFormData(
  formData: FormData
): [ValidatedData, null] | [null, string] {
  const vendorIdRaw = formData.get("vendor-id");
  const purchasedAtRaw = formData.get("purchased-at");
  const listOfPurchaseItemAsStrRaw = formData.get("items");
  const totalPriceRaw = formData.get("total-price");

  const payloadSchema = z.object({
    vendorId: z.string(),
    purchasedAt: z.string().date(),
    listOfPurchaseItemAsStr: z.string(),
    totalPrice: z.coerce.number(),
  });

  const purchaseItemArraySchema = z.array(
    z.object({
      itemId: z.string(),
      quantityInHundreds: z.coerce.number(),
      pricePerUnit: z.coerce.number(),
      totalPrice: z.coerce.number(),
    })
  );

  const { data: newPurchasePayload } = payloadSchema.safeParse({
    vendorId: vendorIdRaw,
    purchasedAt: purchasedAtRaw,
    listOfPurchaseItemAsStr: listOfPurchaseItemAsStrRaw,
    totalPrice: totalPriceRaw,
  });
  if (!newPurchasePayload) return [null, "Invalid Payload"];

  const { data: listOfPurchaseItem } = purchaseItemArraySchema.safeParse(
    JSON.parse(newPurchasePayload.listOfPurchaseItemAsStr)
  );
  if (!listOfPurchaseItem) return [null, "Invalid Payload"];

  return [{ newPurchasePayload, listOfPurchaseItem }, null];
}

function validateFormImage(
  data: FormDataEntryValue | null
): [Blob, null] | [null, string] {
  const imageSchema = z.custom<Blob>(
    (data) => data instanceof Blob && data.type === "image/jpeg"
  );

  const { data: image, error } = imageSchema.safeParse(data);
  if (!image && error) return [null, "Expected a JPEG image blob"];
  return [image, null];
}
