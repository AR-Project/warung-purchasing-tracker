"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { safePromise } from "@/lib/utils/safePromise";

export async function loginUserAction(formData: FormData) {
  const { error: signInRes } = await safePromise(
    signIn("credentials", formData)
  );

  const isAuthError = signInRes instanceof AuthError;
  const isAuthSuccess =
    signInRes instanceof Error && signInRes.message === "NEXT_REDIRECT";

  // SignIn Failure due client error
  if (isAuthError) return { error: "Invalid credentials" };

  if (isAuthSuccess) {
    // SignIn Success - throw error to trigger next redirect
    throw signInRes;
  } else {
    // SignIn Failure due server error
    console.error(signInRes);
    return { error: "internal error" };
  }
}
