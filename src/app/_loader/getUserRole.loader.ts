import db from "@/infrastructure/database/db";
import { user } from "@/lib/schema/user";
import { eq } from "drizzle-orm";

/**
 * @deprecated - use directly from the repo or using lib/util/auth
 */
export default async function getUserRole(userId: string) {
  const [currentUser] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId));

  return currentUser ? currentUser.role : "no user";
}
