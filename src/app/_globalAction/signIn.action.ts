"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { safePromise } from "@/lib/utils/safePromise";
import { rateLimit } from "@/lib/rateLimit";

export async function signInAction(formData: FormData) {
  const { error: rateLimitError } = await rateLimit({
    key: "login",
    limit: 3,
    window: "6 s",
  });
  if (rateLimitError) return { error: rateLimitError };

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
    return { error: "internal error" };
  }
}
