"use server";

import db from "@/infrastructure/database/db";
import { items } from "@/lib/schema/schema";
import { isString } from "@/lib/utils/validator";
import { eq } from "drizzle-orm";
import { revalidateTag, revalidatePath } from "next/cache";

export async function editItem(prevState: any, formData: FormData) {
  const id = formData.get("id");
  const newName = formData.get("name");

  if (!isString(newName) || !isString(id)) {
    return { error: "Data tidak valid" };
  }

  try {
    const itemId = await db.transaction(async (tx) => {
      const existingItems = await tx
        .select()
        .from(items)
        .where(eq(items.id, id));
      if (existingItems.length === 0) {
        tx.rollback();
      }
      const [changedItem] = await db
        .update(items)
        .set({ name: newName })
        .where(eq(items.id, id))
        .returning({ id: items.id });
      return changedItem.id;
    });

    revalidateTag("items");
    revalidatePath("/create");
    return {
      message: `Item name changed to ${newName}`,
      data: itemId,
    };
  } catch (error) {
    console.log(error);

    return { error: "Item ghoib" };
  }
}
