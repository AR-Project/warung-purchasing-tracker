"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import { user } from "@/lib/schema/user";
import { adminManagerRole } from "@/lib/const";
import { verifyUserAccess } from "@/lib/utils/auth";
import ClientError from "@/lib/exception/ClientError";
import { actionErrorDecoder } from "@/lib/exception/errorDecoder";

const schema = z.string().min(1);

export async function deleteUser(formdata: FormData): Promise<FormState> {
  const [authUser, authError] = await verifyUserAccess(adminManagerRole);
  if (authError) return { error: "Forbidden" };
  const userIdToDeleteRaw = formdata.get("user-id-to-delete");

  const { data: userIdToDelete, error: payloadError } =
    schema.safeParse(userIdToDeleteRaw);
  if (payloadError) return { error: "Invalid Payload" };

  try {
    const deletedUsername = await db.transaction(async (tx) => {
      const usersToDelete = await tx
        .select()
        .from(user)
        .where(and(eq(user.id, userIdToDelete), eq(user.isDeleted, false)));
      if (usersToDelete.length === 0)
        throw new ClientError("Invalid User to delete");
      if (usersToDelete[0].parentId != authUser.parentId)
        throw new ClientError("not allowed");

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
    return actionErrorDecoder(error);
  }
}
