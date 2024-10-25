"use server";

import { DrizzleError, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import db from "@/infrastructure/database/db";
import { items, NewItemDbPayload } from "@/lib/schema/schema";
import { generateId } from "@/lib/utils/generator";
import { getUserInfo } from "@/lib/utils/auth";

export async function newItemAction(
  formData: FormData
): Promise<FormState<string>> {
  const nameRaw = formData.get("name");
  let invariantError: string | undefined;

  try {
    const { userId, parentId } = await getUserInfo();
    const { data: name } = z.string().safeParse(nameRaw);
    if (!name) {
      invariantError = "Invalid Payload";
      throw new Error(invariantError);
    }
    const newItemDbPayload: NewItemDbPayload = {
      id: generateId(10),
      name,
      ownerId: parentId,
      creatorId: userId,
    };

    const [savedItem] = await db
      .insert(items)
      .values(newItemDbPayload)
      .returning({ id: items.id });

    revalidateTag("items");
    revalidatePath("/create");
    return {
      message: `Item ${nameRaw} created`,
      data: savedItem.id,
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
