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
  return session
    ? [session.user, null]
    : [null, "user not valid / user logged out"];
}

export async function verifyUserAccess(
  allowedRole: AvailableUserRole[]
): Promise<SafeResult<UserSession>> {
  const [user, validateUserError] = await validateUser();
  if (validateUserError !== null) return [null, validateUserError];

  // auth fron authjs only check from jwt. This line make sure active role
  // is verified directly from database
  const [currentUserRole, getUserRoleError] = await getUserRole(user.userId);
  if (getUserRoleError !== null) return [null, getUserRoleError];

  if (allowedRole.includes(currentUserRole) === false)
    return [null, "user don't have apropiate role"];

  return [user, null];
}
