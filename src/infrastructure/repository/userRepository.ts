import { eq } from "drizzle-orm";

import { NewUserDbPayload, user } from "@/lib/schema/user";
import db from "../database/db";
import { category, CreateCategoryDbPayload } from "@/lib/schema/category";
import { generateId } from "@/lib/utils/generator";

type CreatedUser = {
  id: string;
  username: string;
};

type CreateUserResult = SafeResult<CreatedUser>;

export async function createUserRepo(
  payload: NewUserDbPayload
): Promise<CreateUserResult> {
  let invariantError: string | undefined;

  try {
    const newUser = await db.transaction(async (tx) => {
      const existingUserWithSameName = await tx
        .select()
        .from(user)
        .where(eq(user.username, payload.username));

      if (existingUserWithSameName.length > 0) {
        invariantError = "Username not available";
        tx.rollback();
      }
      const [newUser] = await tx
        .insert(user)
        .values(payload)
        .returning({ username: user.username, id: user.id });

      // CREATE default category
      const defaultCategoryPayload: CreateCategoryDbPayload = {
        id: `cat-${generateId(9)}`,
        name: `${payload.username}'s Default Category`,
        ownerId: newUser.id,
        creatorId: newUser.id,
      };

      const defaultCategoryResult = await tx
        .insert(category)
        .values(defaultCategoryPayload)
        .returning({ id: category.id });

      if (defaultCategoryResult.length !== 1) {
        invariantError = "fail to create default category";
        tx.rollback();
      }

      const [newUserWithDefaultCategory] = await tx
        .update(user)
        .set({ defaultCategory: defaultCategoryResult[0].id })
        .where(eq(user.id, newUser.id))
        .returning({ username: user.username, id: user.id });

      // return newUser;
      return newUserWithDefaultCategory;
    });

    return [newUser, null];
  } catch (error) {
    return [null, invariantError ? invariantError : "internal error"];
  }
}

export async function getUserRole(
  requestedUserId: string
): Promise<SafeResult<AvailableUserRole>> {
  const userInfo = await db.query.user.findFirst({
    where: eq(user.id, requestedUserId),
    columns: { id: true, role: true },
  });

  if (userInfo === undefined) return [null, "user_repo.user-not-exist"];

  return [userInfo.role, null];
}
