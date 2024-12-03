import { eq } from "drizzle-orm";

import db from "@/infrastructure/database/db";
import { category, CreateCategoryDbPayload } from "@/lib/schema/item";
import { defaultHelperUser } from "./userTableHelper";

export const categoryTableHelper = {
  async add({
    id = "cat-123",
    name = "test-category",
    ownerId = defaultHelperUser.id,
    creatorId = defaultHelperUser.id,
  }: Partial<CreateCategoryDbPayload>) {
    return db
      .insert(category)
      .values({
        id,
        name,
        ownerId,
        creatorId,
      })
      .returning();
  },
  async findById(idToSearch: string) {
    return db.select().from(category).where(eq(category.id, idToSearch));
  },
  async findAll() {
    return db.select().from(category);
  },
  async clean() {
    return db.delete(category);
  },
};
