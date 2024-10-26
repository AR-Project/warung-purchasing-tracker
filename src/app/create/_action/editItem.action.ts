"use server";

import db from "@/infrastructure/database/db";
import { items } from "@/lib/schema/schema";
import { getUserInfo } from "@/lib/utils/auth";
import { isString } from "@/lib/utils/validator";
import { eq } from "drizzle-orm";
import { revalidateTag, revalidatePath } from "next/cache";

export async function editItem(formData: FormData) {
  const id = formData.get("id");
  const newName = formData.get("name");

  if (!isString(newName) || !isString(id)) {
    return { error: "Data tidak valid" };
  }

  let invariantError: string | undefined;

  try {
    const { userId } = await getUserInfo();

    const changedItem = await db.transaction(async (tx) => {
      // Validate Item Existence
      const existingItems = await tx
        .select()
        .from(items)
        .where(eq(items.id, id));
      if (existingItems.length === 0) {
        invariantError = "No such Item";
        tx.rollback();
      }

      // Validate authorization
      const { creatorId, ownerId } = existingItems[0];
      if (![creatorId, ownerId].includes(userId)) {
        invariantError = "Unauthorized to edit Item";
        throw new Error(invariantError);
      }

      // Append Item Name Change
      const [changedItem] = await db
        .update(items)
        .set({ name: newName })
        .where(eq(items.id, id))
        .returning({ id: items.id, name: items.name });
      return changedItem;
    });

    revalidateTag("items");
    revalidatePath("/create");
    return {
      message: `Item name changed to ${newName}`,
      data: changedItem,
    };
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return { error: invariantError ? invariantError : error.message };
    }

    return { error: "Internal Error" };
  }
}
