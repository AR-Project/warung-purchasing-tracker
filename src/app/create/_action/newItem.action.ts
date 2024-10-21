"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import db from "@/infrastructure/database/db";
import { items } from "@/lib/schema/schema";
import { generateId } from "@/lib/utils/generator";
import { isString } from "@/lib/utils/validator";

export async function newItemAction(prevState: any, formData: FormData) {
  const name = formData.get("name");

  if (!isString(name)) {
    return { error: "Data tidak valid" };
  }

  try {
    const itemId = await db.transaction(async (tx) => {
      const existingItems = await tx
        .select()
        .from(items)
        .where(eq(items.name, name));
      if (existingItems.length > 0) {
        tx.rollback();
      }
      const [addedItem] = await db
        .insert(items)
        .values({ name, id: generateId(10) })
        .returning({ id: items.id });
      return addedItem.id;
    });

    revalidateTag("items");
    revalidatePath("/create");
    return {
      message: `Item ${name} created`,
      data: itemId,
    };
  } catch (error) {
    return { error: "Nama Item sudah dipakai" };
  }
}
