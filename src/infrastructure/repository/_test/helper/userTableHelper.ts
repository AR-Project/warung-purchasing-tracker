import db from "@/infrastructure/database/db";
import { NewUserDbPayload, user } from "@/lib/schema/user";
import { eq } from "drizzle-orm";

export const defaultHelperUser: NewUserDbPayload = {
  id: "u-123",
  username: "test",
  hashedPassword: "$hashed$password",
  parentId: "u-123",
};

export function addUserHelper({
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
}

export function findUserByIdHelper(idToSearch: string) {
  return db.select().from(user).where(eq(user.id, idToSearch));
}

export function cleanUserTableHelper() {
  return db.delete(user);
}
