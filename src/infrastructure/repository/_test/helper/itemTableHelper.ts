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
  async addMultiple(total: number) {
    const payloads: Array<CreateCategoryDbPayload> = [];

    for (let index = 0; index < total; index++) {
      payloads.push(generateSinglePayload(padNumber(index), index));
    }
    return db.insert(category).values(payloads).returning();

    function generateSinglePayload(
      id: string,
      sortOrder: number
    ): CreateCategoryDbPayload {
      return {
        id: `cat-${id}`,
        name: `test-category-#${id}`,
        ownerId: defaultHelperUser.id,
        creatorId: defaultHelperUser.id,
        sortOrder,
      };
    }

    function padNumber(number: number, length: number = 3) {
      return String(number).padStart(length, "0");
    }
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
