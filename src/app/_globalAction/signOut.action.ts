"use server";

import { signOut } from "@/auth";

export async function signOutAction(_: FormData) {
  await signOut();
}
