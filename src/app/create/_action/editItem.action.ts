"use server";

import db from "@/infrastructure/database/db";
import { items } from "@/lib/schema/schema";
import { getUserInfo } from "@/lib/utils/auth";
import { isString } from "@/lib/utils/validator";
import { eq } from "drizzle-orm";
import { revalidateTag, revalidatePath } from "next/cache";

export async function editItem(prevState: any, formData: FormData) {
  const id = formData.get("id");
  const newName = formData.get("name");

  if (!isString(newName) || !isString(id)) {
    return { error: "Data tidak valid" };
  }

  let invariantError: string | undefined;

  try {
    const { userId } = await getUserInfo();

    const itemId = await db.transaction(async (tx) => {
      const existingListOfPurchaseItem = await tx
        .select()
        .from(items)
        .where(eq(items.id, id));
      if (existingListOfPurchaseItem.length === 0) {
        invariantError = "No such Purchase Item";
        tx.rollback();
      }

      const { creatorId, ownerId } = existingListOfPurchaseItem[0];

      if (![creatorId, ownerId].includes(userId)) {
        invariantError = "Unauthorized to delete image";
        throw new Error(invariantError);
      }
      const [changedPurchaseItem] = await db
        .update(items)
        .set({ name: newName })
        .where(eq(items.id, id))
        .returning({ id: items.id });
      return changedPurchaseItem.id;
    });

    revalidateTag("items");
    revalidatePath("/create");
    return {
      message: `Item name changed to ${newName}`,
      data: itemId,
    };
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return { error: invariantError ? invariantError : error.message };
    }

    return { error: "Internal Error" };
  }
}
