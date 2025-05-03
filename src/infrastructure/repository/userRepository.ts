import { eq } from "drizzle-orm";

import { NewUserDbPayload, user } from "@/lib/schema/user";
import db from "../database/db";

type CreatedUser = {
  id: string;
  username: string;
};

type SaveNewUserReturn = [CreatedUser, null] | [null, string];

export async function saveNewUser(
  payload: NewUserDbPayload
): Promise<SaveNewUserReturn> {
  let invariantError: string | undefined;

  try {
    const newUser = await db.transaction(async (tx) => {
      const existingUser = await tx
        .select()
        .from(user)
        .where(eq(user.username, payload.username));

      if (existingUser.length > 0) {
        invariantError = "Username not available";
        tx.rollback();
      }
      const [newUser] = await tx
        .insert(user)
        .values(payload)
        .returning({ username: user.username, id: user.id });

      return newUser;
    });

    return [newUser, null];
  } catch (error) {
    return [null, invariantError ? invariantError : "internal error"];
  }
}

export async function getUserRole(
  requestedUserId: string
): Promise<SafeResult<AvailableUserRole>> {
  const userInfo = await db.query.user.findFirst({
    where: eq(user.id, requestedUserId),
    columns: { id: true, role: true },
  });

  if (userInfo === undefined) return [null, "user_repo.user-not-exist"];

  return [userInfo.role, null];
}
