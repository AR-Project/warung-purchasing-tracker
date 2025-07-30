import { eq } from "drizzle-orm";

import { category } from "@/lib/schema/category";
import { NewUserDbPayload, user } from "@/lib/schema/user";

import db from "@/infrastructure/database/db";

export const defaultHelperUser: NewUserDbPayload = {
  id: "u-123",
  username: "test",
  hashedPassword: "$hashed$password",
  parentId: "u-123",
};

export const userTableHelper = {
  /**
   * Default Value: id: `u-123`, username: `test`
   */
  async add({
    username = defaultHelperUser.username,
    id = defaultHelperUser.id,
    hashedPassword = defaultHelperUser.hashedPassword,
    parentId = defaultHelperUser.parentId,
    defaultCategory,
  }: Partial<NewUserDbPayload>) {
    return db
      .insert(user)
      .values({
        username,
        id,
        hashedPassword,
        parentId,
        defaultCategory,
      })
      .returning();
  },

  /**
   * Create user with defaultHelperUser, with default category already set up ("cat-000")
   * Clean up category table everytime using this helper
   */
  async addWithCategory({
    username = defaultHelperUser.username,
    id = defaultHelperUser.id,
    hashedPassword = defaultHelperUser.hashedPassword,
    parentId = defaultHelperUser.parentId,
  }: Partial<NewUserDbPayload>) {
    const [createdUser] = await db
      .insert(user)
      .values({
        username,
        id,
        hashedPassword,
        parentId,
      })
      .returning();

    const [createdCategory] = await db
      .insert(category)
      .values({
        id: "cat-000",
        creatorId: createdUser.id,
        name: "default category",
        ownerId: createdUser.id,
      })
      .returning();

    const [createdUserWithDefaultCategory] = await db
      .update(user)
      .set({ defaultCategory: createdCategory.id })
      .where(eq(user.id, createdUser.id))
      .returning();

    return createdUserWithDefaultCategory;
  },

  async findById(idToSearch: string) {
    return db.select().from(user).where(eq(user.id, idToSearch));
  },
  async setDefaultCategory(userId: string, categoryId: string) {
    return db
      .update(user)
      .set({ defaultCategory: categoryId })
      .where(eq(user.id, userId));
  },
  async clean() {
    return db.delete(user);
  },
};

// support for old code
export const addUserHelper = userTableHelper.add;
export const findUserByIdHelper = userTableHelper.findById;
export const cleanUserTableHelper = userTableHelper.clean;
