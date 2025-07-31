"use server";
import { z } from "zod";
import { hash } from "@node-rs/argon2";

import { NewUserDbPayload } from "@/lib/schema/user";
import { generateId } from "@/lib/utils/generator";
import { createUserRepo } from "@/infrastructure/repository/userRepository";
import { flag } from "@/lib/flag";

const reqSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().nullish(),
  confirmPassword: z.string(),
});

export async function registerUserAction(
  formData: FormData
): Promise<FormState> {
  const registrationUserStatus = await flag.userRegistration();
  if (registrationUserStatus === false)
    return { error: "Registration is closed" };

  const { data: payload, error: schemaError } = reqSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    email: formData.get("email"),
    confirmPassword: formData.get("confirm-password"),
  });

  if (schemaError) return { error: "Invalid payload" };
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

  const [data, invariantError] = await createUserRepo(newUserDbPayload);
  if (invariantError || !data) return { error: invariantError };

  return {
    message: `Success creating new user: ${data.username} - ${data.id}`,
  };
}
