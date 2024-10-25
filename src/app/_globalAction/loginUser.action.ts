"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function loginUserAction(formData: FormData) {
  try {
    await signIn("credentials", formData);
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message };
    }

    if (error instanceof Error) {
      if (error.message === "NEXT_REDIRECT") {
        throw error;
      }
      return { error: error.message };
    }

    return { error: "internal error" };
  }
}
