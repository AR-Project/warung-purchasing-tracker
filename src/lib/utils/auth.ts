import { auth } from "@/auth";
import { getUserRole } from "@/infrastructure/repository/userRepository";

/** Return user info from session, or throw error when session is null
 * @deprecated use `validateUser` or `verifyUserAccess`
 */
export async function getUserInfo(): Promise<UserSession> {
  const session = await auth();
  if (!session) throw new Error("USER_LOGGED_OUT");
  return session.user;
}

export async function validateUser(): Promise<SafeResult<UserSession>> {
  const session = await auth();
  const isAuth = session && session.user;
  if (!isAuth) return [null, "not authenticated"];
  return [session.user, null];
}

export type UserSessionWithRole = UserSession & { role: string };

/**
 * Check user authentication and role in single call
 * @returns An session object with most updated user role or null
 */
export async function getUserRoleAuth(): Promise<
  SafeResult<UserSessionWithRole>
> {
  const [user, authError] = await validateUser();
  if (authError !== null) return [null, authError];

  const [role, getRoleError] = await getUserRole(user.userId);
  if (getRoleError != null) return [null, "repo error"];

  return [{ ...user, role }, null];
}

type VerifyUserAccessError =
  | "not_authenticated"
  | "not_authorized"
  | "internal_error";
/**
 * Check if user had role specified in params.
 *
 * This is used for gatekeeping purpose.
 *
 * @param allowedRole Array of role type that allowed
 * @returns return User session if role fit and error message if role not fit
 */
export async function verifyUserAccess(
  allowedRole: AvailableUserRole[]
): Promise<SafeResult<UserSession, VerifyUserAccessError>> {
  const [user, validateUserError] = await validateUser();
  if (validateUserError !== null) return [null, "not_authenticated"];

  // Verify role from database
  const [currentUserRole, getUserRoleError] = await getUserRole(user.userId);
  if (getUserRoleError !== null) return [null, "internal_error"];

  if (allowedRole.includes(currentUserRole) === false)
    return [null, "not_authorized"];

  return [user, null];
}
