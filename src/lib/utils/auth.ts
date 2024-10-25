import { auth } from "@/auth";

/** Return user info from session, or throw error when session is null */
export async function getUserInfo(): Promise<UserSession> {
  const session = await auth();
  if (!session) throw new Error("USER_LOGGED_OUT");
  return session.user;
}
