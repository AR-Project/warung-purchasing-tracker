"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";

import { unstable_update } from "@/auth";

import db from "@/infrastructure/database/db";
import { user } from "@/lib/schema/user";
import { allRole } from "@/lib/const";
import { verifyUserAccess } from "@/lib/utils/auth";
import { checkUsernameAvaibility } from "./helper/validateUsername";

const schema = z.object({
  currentPath: z.string(),
  newUsername: z.string().regex(/^[a-zA-Z0-9._]+$/),
});

export async function updateUserUsername(formData: FormData) {
  const [authUser, authError] = await verifyUserAccess(allRole);
  if (authError) return { error: authError };

  const { data: payload, error: payloadError } = schema.safeParse({
    currentPath: formData.get("current-path"),
    newUsername: formData.get("new-username"),
  });

  if (payloadError) return { error: "invalid payload" };

  const [_, checkError] = await checkUsernameAvaibility(payload.newUsername);

  if (checkError) return { error: checkError };

  // change username
  await db
    .update(user)
    .set({ username: payload.newUsername })
    .where(eq(user.id, authUser.userId));

  await unstable_update({
    user: {
      username: payload.newUsername,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/", "page");

  return {
    message: "dry run",
    data: {
      currentPath: payload.currentPath,
      newUsername: payload.newUsername,
    },
  };
}
