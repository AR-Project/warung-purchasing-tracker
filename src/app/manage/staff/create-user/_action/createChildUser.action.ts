"use server";

import { auth } from "@/auth";
import db from "@/infrastructure/database/db";
import { NewUserDbPayload, user } from "@/lib/schema/user";
import { generateId } from "@/lib/utils/generator";
import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { z } from "zod";

type NewChildUserResponsePayload = {
  id: string;
  username: string;
};

export async function createChildUser(
  formdata: FormData
): Promise<FormState<NewChildUserResponsePayload>> {
  const session = await auth();
  if (!session) return { error: "Forbidden" };

  const usernameRaw = formdata.get("username");
  const passwordRaw = formdata.get("password");
  const userIdRaw = formdata.get("user-id");
  const confirmPasswordRaw = formdata.get("confirm-password");
  const roleRaw = formdata.get("role");

  const allowedRole: AvailableUserRole[] = ["admin", "manager"];

  const schema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
    userId: z.string(),
    confirmPassword: z.string().min(1),
    role: z.enum(["admin", "guest", "manager", "staff"]),
  });

  const { data: payload, error } = schema.safeParse({
    username: usernameRaw,
    password: passwordRaw,
    userId: userIdRaw,
    confirmPassword: confirmPasswordRaw,
    role: roleRaw,
  });
  if (!payload || payload.password !== payload.confirmPassword) {
    console.log(error?.flatten());

    return { error: "Invalid Payload" };
  }

  const hashedPassword = await hash(payload.password);
  const childId = `u-${generateId(10)}`;

  const newUserDbPayload: NewUserDbPayload = {
    username: payload.username,
    id: childId,
    hashedPassword,
    role: payload.role,
    parentId: payload.userId,
  };

  let invariantError: string | undefined;
  try {
    const newChildUser = await db.transaction(async (tx) => {
      // Validate current user
      const userList = await tx
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, payload.userId));
      if (userList.length === 0) {
        invariantError = "Your Id is invalid";
        tx.rollback();
      }

      // Validate current user role
      const [currentUser] = userList;
      if (!allowedRole.includes(currentUser.role)) {
        invariantError = "Action not allowed.";
        tx.rollback();
      }

      // Validate username
      const existingUsers = await tx
        .select()
        .from(user)
        .where(eq(user.username, payload.username));
      if (existingUsers.length !== 0) {
        invariantError = "Username not available";
        tx.rollback();
      }

      const [newChildUser] = await tx
        .insert(user)
        .values(newUserDbPayload)
        .returning({ username: user.username, id: user.id });

      return newChildUser;
    });

    return {
      message: `New user successfully created: ${newChildUser.username}`,
      data: newChildUser,
    };
  } catch (error) {
    if (error instanceof Error) console.log(error);
    return { error: invariantError ? invariantError : "Internal Error" };
  }
}
