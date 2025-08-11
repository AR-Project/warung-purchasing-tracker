"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { NewPlanDbPayload } from "@/lib/schema/plan";
import { saveNewPlan } from "@/infrastructure/repository/planRepo";

export async function createPlanAction(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Forbidden" };

  const [validatedNewPlanInput] = validateFormData(formData);
  if (!validatedNewPlanInput) return { error: "Invalid Payload" };

  const { totalPrice, listOfPlanItem } = validatedNewPlanInput;
  const newPlanDbPayload: NewPlanDbPayload = {
    creatorId: session.user.userId,
    totalPrice: totalPrice,
  };

  const [savedPlanId] = await saveNewPlan(newPlanDbPayload, listOfPlanItem);
  if (!savedPlanId) return { error: "Fail to save plan" };

  revalidateTag("plan");
  revalidatePath("/plan");
  return {
    message: `Transaction ${savedPlanId} saved`,
    data: savedPlanId,
  };
}

export type ListOfPlanItemInput = {
  totalPrice: number;
  itemId: string;
  quantityInHundreds: number;
  pricePerUnit: number;
}[];

export type SavePlanActionPayload = {
  totalPrice: number;
  listOfPlanItem: ListOfPlanItemInput;
};

function validateFormData(
  formData: FormData
): [SavePlanActionPayload, null] | [null, string] {
  const listOfPlanItemAsStrRaw = formData.get("plan-item-stringify");
  const totalPriceRaw = formData.get("total-price");

  const payloadSchema = z.object({
    listOfPlanItemAsStr: z.string(),
    totalPrice: z.coerce.number(),
  });

  const planItemArraySchema = z.array(
    z.object({
      itemId: z.string(),
      quantityInHundreds: z.coerce.number(),
      pricePerUnit: z.coerce.number(),
      totalPrice: z.coerce.number(),
    })
  );

  const { data: newPlanUserInput } = payloadSchema.safeParse({
    listOfPlanItemAsStr: listOfPlanItemAsStrRaw,
    totalPrice: totalPriceRaw,
  });
  if (!newPlanUserInput) return [null, "Invalid Payload"];

  const { data: listOfPurchaseItem } = planItemArraySchema.safeParse(
    JSON.parse(newPlanUserInput.listOfPlanItemAsStr)
  );
  if (!listOfPurchaseItem) return [null, "Invalid Payload"];

  return [
    {
      totalPrice: newPlanUserInput.totalPrice,
      listOfPlanItem: listOfPurchaseItem,
    },
    null,
  ];
}
