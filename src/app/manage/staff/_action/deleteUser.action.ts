"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import db from "@/infrastructure/database/db";
import { user } from "@/lib/schema/user";

export async function deleteUser(formdata: FormData): Promise<FormState> {
  const session = await auth();
  if (!session) return { error: "Forbidden" };

  const userIdToDeleteRaw = formdata.get("user-id-to-delete");
  const allowedRole: AvailableUserRole[] = ["admin", "manager"];

  const schema = z.string().min(1);

  const { data: userIdToDelete } = schema.safeParse(userIdToDeleteRaw);
  if (!userIdToDelete) {
    return { error: "Invalid Payload" };
  }

  let invariantError: string | undefined;
  try {
    const deletedUsername = await db.transaction(async (tx) => {
      // Validate requester user
      const requesterUsers = await tx
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, session.user.userId));
      if (requesterUsers.length === 0) {
        invariantError = "Invalid userId";
        tx.rollback();
      }

      // Validate requester user role
      const [requesterUser] = requesterUsers;
      if (!allowedRole.includes(requesterUser.role)) {
        invariantError = "Action not allowed.";
        tx.rollback();
      }

      // Validate if user to delete exist
      const usersToDelete = await tx
        .select()
        .from(user)
        .where(and(eq(user.id, userIdToDelete), eq(user.isDeleted, false)));
      if (usersToDelete.length === 0) {
        invariantError = "User not exist or already deleted";
        tx.rollback();
      }

      // SOFT DELETE user
      const [deletedUser] = await tx
        .update(user)
        .set({ isDeleted: true, deletedAt: new Date() })
        .where(eq(user.id, userIdToDelete))
        .returning({ username: user.username });
      return deletedUser.username;
    });

    revalidatePath("/manage/staff");
    return {
      message: `User deleted: ${deletedUsername}`,
    };
  } catch (error) {
    if (error instanceof Error) console.log(error);
    return { error: invariantError ? invariantError : "Internal Error" };
  }
}
