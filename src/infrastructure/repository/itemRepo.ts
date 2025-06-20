import { eq } from "drizzle-orm";

import { item, NewItemDbPayload } from "@/lib/schema/item";
import db from "@/infrastructure/database/db";

export type CreateItemRepoPayload = {
  id: string;
  name: string;
  ownerId: string;
  creatorId: string;
  categoryId?: string;
};

type CreateItemRepoResult = SafeResult<{
  id: string;
  name: string;
  categoryId: string;
}>;

/**
 * Create Item Repository. Not including `categoryId` fallback to owners/parent users default.
 */
export async function create(
  payload: CreateItemRepoPayload
): Promise<CreateItemRepoResult> {
  let invariantError: string | undefined;

  try {
    const itemCreated = await db.transaction(async (tx) => {
      const { categoryId, ...rest } = payload;
      const dbPayload: NewItemDbPayload = {
        ...rest,
        categoryId: "",
        sortOrder: 0,
      };

      if (categoryId) {
        const category = await tx.query.category.findMany({
          where: (category, { eq }) => eq(category.id, categoryId),
        });

        if (category.length === 0) {
          invariantError = "categoryId invalid";
          tx.rollback();
        }

        // modify dbPayload
        dbPayload.categoryId = categoryId;
        dbPayload.sortOrder = await tx.$count(
          item,
          eq(item.categoryId, categoryId)
        );
      } else {
        const [{ defaultCategory }] = await tx.query.user.findMany({
          columns: { defaultCategory: true },
          where: (user, { eq }) => eq(user.id, dbPayload.ownerId),
        });
        if (!defaultCategory) {
          tx.rollback();
          throw new Error(
            "should be impossible - just for supress typescript error"
          );
        }

        // modify dbPayload
        dbPayload.categoryId = defaultCategory;
        dbPayload.sortOrder = await tx.$count(
          item,
          eq(item.categoryId, defaultCategory)
        );
      }

      const [itemCreated] = await db.insert(item).values(dbPayload).returning({
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
      });
      return itemCreated;
    });
    return [itemCreated, null];
  } catch (error) {
    return [null, invariantError ? invariantError : "internal error"];
  }
}

const itemRepo = {
  create,
};

export default itemRepo;
