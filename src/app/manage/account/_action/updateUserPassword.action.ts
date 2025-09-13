"use server";

import db from "@/infrastructure/database/db";
import { allRole } from "@/lib/const";
import { user } from "@/lib/schema/user";
import { verifyUserAccess } from "@/lib/utils/auth";
import { safePromise } from "@/lib/utils/safePromise";
import { hash, verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import z, { safeParse } from "zod";

const schema = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
  confirmNewPassword: z.string(),
});

export async function updateUserPassword(formdata: FormData) {
  const [authUser, authError] = await verifyUserAccess(allRole);
  if (authError) return { error: authError };

  const { data: payload, error: payloadError } = schema.safeParse({
    currentPassword: formdata.get("current-password"),
    newPassword: formdata.get("new-password"),
    confirmNewPassword: formdata.get("confirm-new-password"),
  });

  if (payloadError) return { error: "Invalid Payload" };
  if (payload.newPassword !== payload.confirmNewPassword)
    return { error: "confirm password is not same" };

  // Read User Password
  const { data: userData, error: readUserPasswordError } = await safePromise(
    db.query.user.findFirst({
      columns: {
        hashedPassword: true,
      },
      where: (user, { eq }) => eq(user.id, authUser.userId),
    })
  );

  if (readUserPasswordError) return { error: "internal error" };
  if (!userData) return { error: "invalid user" };

  const isPasswordValid = await verify(
    userData.hashedPassword,
    payload.currentPassword
  );

  if (!isPasswordValid) return { error: "Current Password Wrong" };

  const newHashedPassword = await hash(payload.newPassword);

  const { data: updatedUser, error: updateUserError } = await safePromise(
    db
      .update(user)
      .set({ hashedPassword: newHashedPassword })
      .where(eq(user.id, authUser.userId))
      .returning({ id: user.id })
  );

  if (updateUserError) return { error: "Fail to change password" };

  return { message: "success", data: updatedUser[0] };
}
