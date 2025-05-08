"use server";

import { z } from "zod";
import { DrizzleError, eq } from "drizzle-orm";
import { revalidateTag, revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import { NewVendorDbPayload, vendor } from "@/lib/schema/vendor";
import { getUserInfo } from "@/lib/utils/auth";
import { generateId } from "@/lib/utils/generator";

export async function newVendor(formData: FormData) {
  const nameRaw = formData.get("name");
  let invariantError: string | undefined;

  try {
    const { userId, parentId } = await getUserInfo();
    const { data: name } = z.string().safeParse(nameRaw);
    if (!name) {
      invariantError = "Payload invalid";
      throw new Error(invariantError);
    }

    const newVendorDbPayload: NewVendorDbPayload = {
      name,
      id: generateId(6),
      ownerId: parentId,
      creatorId: userId,
    };
    const [addedVendor] = await db
      .insert(vendor)
      .values(newVendorDbPayload)
      .returning({ id: vendor.id });

    revalidateTag("vendors");
    revalidatePath("/create");
    return {
      message: `Vendor ${name} created`,
      data: { id: addedVendor.id, name },
    };
  } catch (error) {
    if (invariantError) {
      return { error: invariantError };
    }

    if (error instanceof Error && error.message == "USER_LOGGED_OUT") {
      return { error: "Login first" };
    }

    if (error instanceof DrizzleError) {
      return { error: error.message };
    }

    return { error: "internal error" };
  }
}
