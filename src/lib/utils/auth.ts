import { auth } from "@/auth"; // Only auth import allowed
import redis from "@/infrastructure/cache/redis";
import { getUserRole } from "@/infrastructure/repository/userRepository";

import { safePromise } from "@/lib/utils/safePromise";
import { logger } from "@/lib/logger";

type VerifyUserAccessError =
  | "not_authenticated"
  | "not_authorized"
  | "internal_error";

/** Check user auth.
 * @returns UserInfo or null
 */
export async function validateUser(): Promise<
  SafeResult<UserSession, VerifyUserAccessError>
> {
  const session = await auth();
  const isAuth = session && session.user;
  if (!isAuth) return [null, "not_authenticated"];
  return [session.user, null];
}

/**
 * Check user authentication and role in single call
 * @returns An session object with most updated user role or null
 */
export async function getUserRoleAuth(): Promise<
  SafeResult<UserSessionWithRole>
> {
  const [user, authError] = await validateUser();
  if (authError !== null) return [null, authError];

  const roleCacheKey = `role-${user.userId}`;

  const { data: roleCache } = await safePromise(redis.get(roleCacheKey));
  if (roleCache) return [{ ...user, role: roleCache }, null]; // early return if cache exist

  const [role, getRoleError] = await getUserRole(user.userId);
  if (getRoleError != null) return [null, "repo error"];

  const { error } = await safePromise(redis.set(roleCacheKey, role, "EX", 120));
  if (error) logger.error("Redis cache error when setting key");

  return [{ ...user, role }, null];
}

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

  const roleCacheKey = `role-${user.userId}`;

  const { data: roleCache } = await safePromise(redis.get(roleCacheKey));
  if (roleCache && allowedRole.includes(roleCache as AvailableUserRole))
    return [user, null]; // early return if cache exist

  // Verify role from database
  const [currentUserRole, getUserRoleError] = await getUserRole(user.userId);
  if (getUserRoleError !== null) return [null, "internal_error"];

  // set new key
  const { error } = await safePromise(
    redis.set(roleCacheKey, currentUserRole, "EX", 120)
  );
  if (error) logger.error("Redis cache error when setting key");

  if (allowedRole.includes(currentUserRole) === false)
    return [null, "not_authorized"];

  return [user, null];
}
