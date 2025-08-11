"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { NewImageDbPayload } from "@/lib/schema/image";
import { NewPurchaseDbPayload } from "@/lib/schema/purchase";
import { generateId } from "@/lib/utils/generator";
import { writeImageFile } from "@/infrastructure/storage/localStorage";
import { saveNewPurchase } from "@/infrastructure/repository/purchaseRepository";
import { verifyUserAccess } from "@/lib/utils/auth";
import { adminManagerStaffRole } from "@/lib/const";

export async function savePurchaseAction(formData: FormData) {
  const [user, authError] = await verifyUserAccess(adminManagerStaffRole);
  if (authError) return { error: authError };

  const [validatedPayload] = validateFormData(formData);
  if (!validatedPayload) return { error: "Invalid Payload" };
  const { newPurchasePayload, listOfPurchaseItem } = validatedPayload;

  const [validatedImage] = validateFormDataImage(formData.get("image"));
  let newImageDbPayload: NewImageDbPayload | null = null;

  if (validatedImage) {
    const [metadata] = await writeImageFile(validatedImage);
    if (metadata) {
      newImageDbPayload = {
        ...metadata,
        creatorId: user.userId,
        ownerId: user.parentId,
        originalFileName: "from-create-purchase",
      };
    }
  }

  const newPurchaseDbPayload: NewPurchaseDbPayload = {
    id: generateId(10),
    creatorId: user.userId,
    ownerId: user.parentId,
    imageId: newImageDbPayload ? newImageDbPayload.id : null,
    vendorId: newPurchasePayload.vendorId,
    purchasedAt: new Date(newPurchasePayload.purchasedAt),
    totalPrice: newPurchasePayload.totalPrice,
  };

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

type PurchaseItem = {
  totalPrice: number;
  itemId: string;
  quantityInHundreds: number;
  pricePerUnit: number;
};

type ValidatedData = {
  newPurchasePayload: NewPurchasePayload;
  listOfPurchaseItem: PurchaseItem[];
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

function validateFormDataImage(
  data: FormDataEntryValue | null
): [Blob, null] | [null, string] {
  const imageSchema = z.custom<Blob>(
    (data) => data instanceof Blob && data.type === "image/jpeg"
  );

  const { data: image, error } = imageSchema.safeParse(data);
  if (!image && error) return [null, "Expected a JPEG image blob"];
  return [image, null];
}
