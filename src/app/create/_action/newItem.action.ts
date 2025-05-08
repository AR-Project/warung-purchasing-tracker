"use server";

import { DrizzleError, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import db from "@/infrastructure/database/db";
import { generateId } from "@/lib/utils/generator";
import { getUserInfo } from "@/lib/utils/auth";
import { item, NewItemDbPayload } from "@/lib/schema/item";
import { user } from "@/lib/schema/user";

export async function newItemAction(
  formData: FormData
): Promise<FormState<Item>> {
  const nameRaw = formData.get("name");
  let invariantError: string | undefined;

  try {
    const { userId, parentId } = await getUserInfo();
    const { data: name } = z.string().safeParse(nameRaw);
    if (!name) {
      invariantError = "Invalid Payload";
      throw new Error(invariantError);
    }

    // read user default category
    const userDefaultCategory = await db.query.user.findFirst({
      columns: {
        defaultCategory: true,
      },
      where: eq(user.id, userId),
    });

    if (!userDefaultCategory || !userDefaultCategory.defaultCategory) {
      invariantError = "intenal error - default category null";
      throw new Error(invariantError);
    }

    const newItemDbPayload: NewItemDbPayload = {
      id: generateId(10),
      name,
      ownerId: parentId,
      creatorId: userId,
      categoryId: userDefaultCategory.defaultCategory,
    };

    const [savedItem] = await db
      .insert(item)
      .values(newItemDbPayload)
      .returning({ id: item.id, name: item.name });

    revalidateTag("items");
    revalidatePath("/create");
    return {
      message: `Item ${nameRaw} created`,
      data: savedItem,
    };
  } catch (error) {
    if (error instanceof Error && error.message == "USER_LOGGED_OUT") {
      return { error: "Login first" };
    }
    if (invariantError) return { error: invariantError };
    if (error instanceof DrizzleError) return { error: error.message };
    return { error: "internal error" };
  }
}
