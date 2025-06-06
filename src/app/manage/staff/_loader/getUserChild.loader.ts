import db from "@/infrastructure/database/db";
import { user } from "@/lib/schema/user";
import { and, eq } from "drizzle-orm";

type Result<T> = [null, T] | [string, null];

type UserObject = {
  id: string;
  username: string;
  role: string;
};

export default async function getUserChildren(
  requesterUserId: string
): Promise<Result<UserObject[]>> {
  const allowedRole: AvailableUserRole[] = ["admin", "manager"];
  let authorizationError: string | undefined;

  try {
    const listOfUser = await db.transaction(async (tx) => {
      // Validate User Role
      const [currentUser] = await tx
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, requesterUserId));

      if (!allowedRole.includes(currentUser.role)) {
        authorizationError = "Forbidden";
        tx.rollback();
      }

      const listOfUser = await tx
        .select({
          id: user.id,
          username: user.username,
          role: user.role,
          isDeleted: user.isDeleted,
        })
        .from(user)
        .where(
          and(eq(user.parentId, requesterUserId), eq(user.isDeleted, false))
        );

      return listOfUser.filter((user) => user.id !== requesterUserId);
    });

    return [null, listOfUser];
  } catch (error) {
    if (authorizationError) {
      return [authorizationError, null];
    }

    return ["Internal Error", null];
  }
}
