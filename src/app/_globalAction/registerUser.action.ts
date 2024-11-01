"use server";
import { z } from "zod";
import { hash } from "@node-rs/argon2";

import { NewUserDbPayload } from "@/lib/schema/user";
import { generateId } from "@/lib/utils/generator";
import { saveNewUser } from "@/infrastructure/repository/userRepository";

export async function registerUserAction(
  formData: FormData
): Promise<FormState> {
  const usernameRaw = formData.get("username");
  const passwordRaw = formData.get("password");
  const emailRaw = formData.get("email");
  const confirmPasswordRaw = formData.get("confirm-password");

  const schema = z.object({
    username: z.string(),
    password: z.string(),
    email: z.string().nullish(),
    confirmPassword: z.string(),
  });

  const { data: payload } = schema.safeParse({
    username: usernameRaw,
    password: passwordRaw,
    email: emailRaw,
    confirmPassword: confirmPasswordRaw,
  });

  if (!payload) return { error: "Invalid payload" };
  if (payload.password !== payload.confirmPassword)
    return { error: "Password Not match" };

  const { username, password, email } = payload;
  const id = `u-${generateId(10)}`;
  const newUserDbPayload: NewUserDbPayload = {
    username,
    id,
    email,
    hashedPassword: await hash(password),
    parentId: id,
  };

  const [data, invariantError] = await saveNewUser(newUserDbPayload);
  if (invariantError || !data) return { error: invariantError };

  return {
    message: `Success creating new user: ${data.username} - ${data.id}`,
  };
}
