"use server";

import z from "zod";

import { checkUsernameAvaibility } from "./helper/validateUsername";

export async function validateUsernameAction(formData: FormData) {
  const { data: usernameToCheck, error: payloadError } = z
    .string()
    .regex(/^[a-zA-Z0-9._]+$/)
    .safeParse(formData.get("check-username"));
  if (payloadError) return { error: "invalid" };

  const [_, checkError] = await checkUsernameAvaibility(usernameToCheck);

  if (checkError) return { error: checkError };

  return { message: "ok" };
}
