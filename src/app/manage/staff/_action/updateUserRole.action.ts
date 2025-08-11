"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import db from "@/infrastructure/database/db";
import { user } from "@/lib/schema/user";
import { adminManagerRole, adminOnlyRole } from "@/lib/const";
import { verifyUserAccess } from "@/lib/utils/auth";
import ClientError from "@/lib/exception/ClientError";
import { actionErrorDecoder } from "@/lib/exception/errorDecoder";

const schema = z.object({
  childUserId: z.string().min(1),
  newRole: z
    .string()
    .refine((val) => ["manager", "staff", "guest"].includes(val)),
});

export async function updateUserRole(formdata: FormData): Promise<FormState> {
  const [userInfo, authError] = await verifyUserAccess(adminManagerRole);
  if (authError) return { error: authError };

  const { data: payload } = schema.safeParse({
    childUserId: formdata.get("child-user-id"),
    newRole: formdata.get("new-role"),
  });
  if (!payload) return { error: "Invalid Payload" };

  try {
    await db.transaction(async (tx) => {
      const userToUpdate = await tx.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, payload.childUserId),
      });
      if (!userToUpdate) throw new ClientError("invalid user");
      if (userToUpdate.parentId !== userInfo.parentId)
        throw new ClientError("Not allowed");

      await tx
        .update(user)
        .set({
          role: payload.newRole as AvailableUserRole,
          modifiedAt: new Date(),
        })
        .where(eq(user.id, payload.childUserId));
    });

    revalidatePath("/manage/staff");
    return {
      message: `Role changed`,
    };
  } catch (error) {
    return actionErrorDecoder(error);
  }
}
