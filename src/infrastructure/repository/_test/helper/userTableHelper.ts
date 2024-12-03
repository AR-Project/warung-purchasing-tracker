import db from "@/infrastructure/database/db";
import { NewUserDbPayload, user } from "@/lib/schema/user";
import { eq } from "drizzle-orm";

export const defaultHelperUser: NewUserDbPayload = {
  id: "u-123",
  username: "test",
  hashedPassword: "$hashed$password",
  parentId: "u-123",
};

export const userTableHelper = {
  async add({
    username = defaultHelperUser.username,
    id = defaultHelperUser.id,
    hashedPassword = defaultHelperUser.hashedPassword,
    parentId = defaultHelperUser.parentId,
  }: Partial<NewUserDbPayload>) {
    return db
      .insert(user)
      .values({
        username,
        id,
        hashedPassword,
        parentId,
      })
      .returning();
  },
  async findById(idToSearch: string) {
    return db.select().from(user).where(eq(user.id, idToSearch));
  },
  async clean() {
    return db.delete(user);
  },
};

// support for old code
export const addUserHelper = userTableHelper.add;
export const findUserByIdHelper = userTableHelper.findById;
export const cleanUserTableHelper = userTableHelper.clean;
