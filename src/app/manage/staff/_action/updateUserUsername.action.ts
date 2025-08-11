"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import { user } from "@/lib/schema/user";
import { adminManagerRole } from "@/lib/const";
import { verifyUserAccess } from "@/lib/utils/auth";
import ClientError from "@/lib/exception/ClientError";
import { actionErrorDecoder } from "@/lib/exception/errorDecoder";

const schema = z.object({
  childUserId: z.string().min(1),
  newUsername: z.string().min(1),
});

export async function updateUserUsername(
  formdata: FormData
): Promise<FormState> {
  const [userInfo, authError] = await verifyUserAccess(adminManagerRole);
  if (authError) return { error: authError };

  const { data: payload } = schema.safeParse({
    childUserId: formdata.get("child-user-id"),
    newUsername: formdata.get("new-username"),
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

      const existingUsername = await tx.query.user.findMany({
        where: (user, { eq }) => eq(user.username, payload.newUsername),
      });
      if (existingUsername.length !== 0)
        throw new ClientError("username not available");

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
    return actionErrorDecoder(error);
  }
}
