"use server";

import {
  createChildUserRepo,
  CreateChildUserRepoPayload,
} from "@/infrastructure/repository/userRepository";
import { verifyUserAccess } from "@/lib/utils/auth";
import { generateId } from "@/lib/utils/generator";
import { hash } from "@node-rs/argon2";
import { z } from "zod";

type NewChildUserResponsePayload = {
  id: string;
  username: string;
};

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  confirmPassword: z.string().min(1),
  role: z.enum(["guest", "manager", "staff"]),
});

export async function createChildUser(
  formdata: FormData
): Promise<FormState<NewChildUserResponsePayload>> {
  const [user, verifyUserError] = await verifyUserAccess(["admin", "manager"]);

  if (verifyUserError) {
    return { error: verifyUserError };
  }

  const usernameRaw = formdata.get("username");
  const passwordRaw = formdata.get("password");
  const confirmPasswordRaw = formdata.get("confirm-password");
  const roleRaw = formdata.get("role");

  const { data: payload, error: payloadError } = schema.safeParse({
    username: usernameRaw,
    password: passwordRaw,
    confirmPassword: confirmPasswordRaw,
    role: roleRaw,
  });
  if (payloadError || payload.password !== payload.confirmPassword) {
    return { error: "Invalid Payload" };
  }

  const hashedPassword = await hash(payload.password);
  const childId = `u-${generateId(10)}`;

  const createChildUserPayload: CreateChildUserRepoPayload = {
    username: payload.username,
    id: childId,
    hashedPassword,
    role: payload.role,
    parentId: user.userId,
  };

  const [createdChildUser, repoError] = await createChildUserRepo(
    createChildUserPayload
  );

  if (repoError || !createdChildUser) {
    return { error: repoError };
  }

  return {
    message: `New user successfully created: ${createdChildUser.username}`,
    data: createdChildUser,
  };
}
