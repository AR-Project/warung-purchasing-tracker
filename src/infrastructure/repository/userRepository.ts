import { eq } from "drizzle-orm";

import { NewUserDbPayload, user } from "@/lib/schema/user";
import db from "../database/db";
import { category, CreateCategoryDbPayload } from "@/lib/schema/category";
import { generateId } from "@/lib/utils/generator";
import ClientError from "@/lib/exception/ClientError";
import { logger } from "@/lib/logger";

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

      // CREATE user
      const [newUser] = await tx
        .insert(user)
        .values(payload)
        .returning({ username: user.username, id: user.id });

      // CREATE user default category
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

      // LINK user and default category
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
  try {
    const userInfo = await db.query.user.findFirst({
      where: eq(user.id, requestedUserId),
      columns: { id: true, role: true },
    });

    if (userInfo === undefined) throw new ClientError("user not exist");

    return [userInfo.role, null];
  } catch (error) {
    if (error instanceof ClientError) {
      return [null, error.message];
    } else {
      logger.error("userRepository.getUserRole", { error });
      return [null, "internal error"];
    }
  }
}

export async function readUser(userId: string) {
  const user = await db.query.user.findFirst({
    columns: {
      username: true,
      defaultCategory: true,
      parentId: true,
      id: true,
      email: true,
      role: true,
    },
    where: (user, { eq }) => eq(user.id, userId),
  });
  return user;
}

export type CreateChildUserRepoPayload = {
  username: string;
  id: string;
  hashedPassword: string;
  role: AvailableUserRole;
  parentId: string;
};

export async function createChildUserRepo(
  payload: CreateChildUserRepoPayload
): Promise<CreateUserResult> {
  let invariantError: string | undefined;

  try {
    const createChildUser = await db.transaction(async (tx) => {
      // Check parent default category
      const parentUser = await tx.query.user.findFirst({
        columns: {
          defaultCategory: true,
        },
        where: eq(user.id, payload.parentId),
      });

      if (!parentUser || !parentUser.defaultCategory) {
        invariantError = "parent user default category not set";
        tx.rollback();
      }

      // No need to validate user role

      const userWithSameUsername = await tx.query.user.findMany({
        columns: { id: true },
        where: (user, { eq }) => eq(user.username, payload.username),
      });

      if (userWithSameUsername.length > 0) {
        invariantError = "username not available";
        tx.rollback();
      }

      const newUserDbPayload: NewUserDbPayload = {
        username: payload.username,
        id: payload.id,
        hashedPassword: payload.hashedPassword,
        role: payload.role,
        parentId: payload.parentId,
        defaultCategory: parentUser?.defaultCategory,
      };

      // create child user
      const [createdChildUser] = await tx
        .insert(user)
        .values(newUserDbPayload)
        .returning({ username: user.username, id: user.id });

      return createdChildUser;
    });
    return [createChildUser, null];
  } catch (error) {
    return [null, invariantError ? invariantError : "internal error"];
  }
}
