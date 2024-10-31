"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import db from "@/infrastructure/database/db";
import { user } from "@/lib/schema/user";
import { adminOnlyRole } from "@/lib/const";

export async function changeUsername(formdata: FormData): Promise<FormState> {
  const session = await auth();
  if (!session) return { error: "Forbidden" };

  const childUserIdRaw = formdata.get("child-user-id");
  const newUsername = formdata.get("new-username");

  const schema = z.object({
    childUserId: z.string().min(1),
    newUsername: z.string().min(1),
  });

  const { data: payload } = schema.safeParse({
    childUserId: childUserIdRaw,
    newUsername: newUsername,
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

      // Validate newUsername
      const existingUser = await tx
        .select()
        .from(user)
        .where(eq(user.username, payload.newUsername));
      if (existingUser.length !== 0) {
        invariantError = "Username not available";
        tx.rollback();
      }

      // Append change user
      await tx
        .update(user)
        .set({
          username: payload.newUsername,
          modifiedAt: new Date(),
        })
        .where(eq(user.id, payload.childUserId));
    });

    revalidatePath("/manage/staff");
    return {
      message: `Username changed`,
    };
  } catch (error) {
    if (error instanceof Error) console.log(error);
    return { error: invariantError ? invariantError : "Internal Error" };
  }
}
