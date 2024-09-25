"use server";

import db from "@/infrastructure/database/db";
import { vendors } from "@/lib/schema/schema";
import { generateId } from "@/lib/utils/generator";
import { isString } from "@/lib/utils/validator";
import { eq } from "drizzle-orm";
import { revalidateTag, revalidatePath } from "next/cache";

export async function newVendor(prevState: any, formData: FormData) {
  const name = formData.get("name");

  if (!isString(name)) {
    return { error: "Data tidak valid" };
  }

  try {
    const vendorId = await db.transaction(async (tx) => {
      const existingVendors = await tx
        .select()
        .from(vendors)
        .where(eq(vendors.name, name));
      if (existingVendors.length > 0) {
        tx.rollback();
      }
      const [addedVendor] = await db
        .insert(vendors)
        .values({ name, id: generateId(6) })
        .returning({ id: vendors.id });
      return addedVendor.id;
    });

    revalidateTag("vendors");
    revalidatePath("/create");
    return {
      message: `Vendor ${name} created`,
      data: vendorId,
    };
  } catch (error) {
    return { error: "Nama Vendor telah dipakai" };
  }
}
