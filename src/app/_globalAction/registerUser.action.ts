"use server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { hash } from "@node-rs/argon2";

import db from "@/infrastructure/database/db";
import { user } from "@/lib/schema/user";
import { generateId } from "@/lib/utils/generator";

export async function registerUserAction(
  formData: FormData
): Promise<FormState> {
  const usernameRaw = formData.get("username");
  const passwordRaw = formData.get("password");
  const confirmPasswordRaw = formData.get("confirm-password");

  const schema = z.object({
    username: z.string(),
    password: z.string(),
    confirmPassword: z.string(),
  });

  let invariantError: string | undefined;

  try {
    const { username, password, confirmPassword } = schema.parse({
      username: usernameRaw,
      password: passwordRaw,
      confirmPassword: confirmPasswordRaw,
    });

    if (password !== confirmPassword) {
      invariantError = "Password confirmation does not match.";
      throw new Error("confirm password does not match");
    }

    const newUser = await db.transaction(async (tx) => {
      const existingUser = await tx
        .select()
        .from(user)
        .where(eq(user.username, username));

      if (existingUser.length > 0) {
        invariantError = "Username not available";
        tx.rollback();
      }

      const hashedPassword = await hash(password);

      const id = `u-${generateId(10)}`;

      const [newUser] = await tx
        .insert(user)
        .values({
          id: id,
          parentId: id,
          username: username,
          hashedPassword: hashedPassword,
        })
        .returning({ username: user.username, id: user.id });

      return newUser;
    });

    return {
      message: `Success creating new user: ${newUser.username} - ${newUser.id}`,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: invariantError ? invariantError : error.message,
      };
    }
    return { error: "Internal Error" };
  }
}
