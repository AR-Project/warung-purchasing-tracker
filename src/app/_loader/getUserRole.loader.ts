import db from "@/infrastructure/database/db";
import { user } from "@/lib/schema/user";
import { eq } from "drizzle-orm";

export default async function getUserRole(userId: string) {
  const [currentUser] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId));

  return currentUser.role;
}
