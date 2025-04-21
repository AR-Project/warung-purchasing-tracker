import { auth } from "@/auth";
import { getUserRole } from "@/infrastructure/repository/userRepository";

/** Return user info from session, or throw error when session is null */
export async function getUserInfo(): Promise<UserSession> {
  const session = await auth();
  if (!session) throw new Error("USER_LOGGED_OUT");
  return session.user;
}

export async function validateUser(): Promise<SafeResult<UserSession>> {
  const session = await auth();
  return session ? [session.user, null] : [null, "not_authenticated"];
}

type VerifyUserAccessError =
  | "not_authenticated"
  | "not_authorized"
  | "internal_error";

export async function verifyUserAccess(
  allowedRole: AvailableUserRole[]
): Promise<SafeResult<UserSession, VerifyUserAccessError>> {
  const [user, validateUserError] = await validateUser();
  if (validateUserError !== null) return [null, "not_authenticated"];

  // auth fron authjs only check from jwt. This line make sure active role
  // is verified directly from database
  const [currentUserRole, getUserRoleError] = await getUserRole(user.userId);
  if (getUserRoleError !== null) return [null, "internal_error"];

  if (allowedRole.includes(currentUserRole) === false)
    return [null, "not_authorized"];

  return [user, null];
}
