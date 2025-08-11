"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import db from "@/infrastructure/database/db";
import { user } from "@/lib/schema/user";
import { adminOnlyRole } from "@/lib/const";

export async function updateUserRole(formdata: FormData): Promise<FormState> {
  const session = await auth();
  if (!session) return { error: "Forbidden" };

  const childUserIdRaw = formdata.get("child-user-id");
  const newRoleRaw = formdata.get("new-role");

  const availableRole = ["manager", "staff", "guest"];

  const schema = z.object({
    childUserId: z.string().min(1),
    newRole: z.string().refine((val) => availableRole.includes(val)),
  });

  const { data: payload } = schema.safeParse({
    childUserId: childUserIdRaw,
    newRole: newRoleRaw,
  });
  if (!payload) {
    return { error: "Invalid Payload" };
  }

  let invariantError: string | undefined;
  try {
    await db.transaction(async (tx) => {
      // Validate requester user
      const requesterUsers = await tx
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, session.user.userId));
      if (requesterUsers.length === 0) {
        invariantError = "Invalid requesterId";
        tx.rollback();
      }

      // Validate requester user role
      const [requesterUser] = requesterUsers;
      if (!adminOnlyRole.includes(requesterUser.role)) {
        invariantError = "Your role is not allowed";
        tx.rollback();
      }

      // Validate if user to modify exist
      const usersToDelete = await tx
        .select()
        .from(user)
        .where(eq(user.id, payload.childUserId));
      if (usersToDelete.length === 0) {
        invariantError = "User not exist";
        tx.rollback();
      }

      // Append change user
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
    if (error instanceof Error) console.log(error);
    return { error: invariantError ? invariantError : "Internal Error" };
  }
}
