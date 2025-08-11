"use server";

import { z } from "zod";
import { revalidateTag, revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import { NewVendorDbPayload, vendor } from "@/lib/schema/vendor";
import { verifyUserAccess } from "@/lib/utils/auth";
import { generateId } from "@/lib/utils/generator";
import { safePromise } from "@/lib/utils/safePromise";
import { adminManagerStaffRole } from "@/lib/const";

export async function newVendor(formData: FormData) {
  const nameRaw = formData.get("name");

  const [user, authError] = await verifyUserAccess(adminManagerStaffRole);
  if (authError) return { error: authError };

  const { data: name, error: payloadError } = z.string().safeParse(nameRaw);
  if (payloadError) return { error: "Invalid payload" };

  const newVendorDbPayload: NewVendorDbPayload = {
    name,
    id: generateId(6),
    ownerId: user.parentId,
    creatorId: user.userId,
  };

  const { data, error: dbError } = await safePromise(
    db.insert(vendor).values(newVendorDbPayload).returning({ id: vendor.id })
  );

  if (dbError) return { error: "internal error" };

  revalidateTag("vendors");
  revalidatePath("/create");

  return {
    message: `Vendor ${name} created`,
    data: { id: data[0].id, name },
  };
}
