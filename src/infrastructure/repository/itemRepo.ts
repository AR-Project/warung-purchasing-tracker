import { and, asc, eq, inArray, sql, SQL } from "drizzle-orm";

import { arraysHaveEqualElements } from "@/lib/utils/validator";
import { item } from "@/lib/schema/item";
import { category, CreateCategoryDbPayload } from "@/lib/schema/category";
import db from "../database/db";

type CategoryId = string;
type ErrorMessage = string;
type DefaultResult<T = string> = [T, null] | [null, ErrorMessage];

type CreateCategoryResult = DefaultResult<CategoryId>;

export async function getCategoryByParentId(parentId: string) {
  return await db.query.category.findMany({
    where: eq(category.ownerId, parentId),
    orderBy: [asc(category.sortOrder)],
  });
}

export async function createCategory(
  payload: CreateCategoryDbPayload
): Promise<CreateCategoryResult> {
  let invariantError: string | undefined;
  try {
    const categoryCreated = await db.transaction(async (tx) => {
      const categories = await tx.query.category.findMany({
        where: eq(category.ownerId, payload.ownerId),
        columns: { id: true, name: true },
      });

      const mappedCtgrName = categories.map((ctg) => ctg.name);
      if (mappedCtgrName.includes(payload.name)) {
        invariantError = "Category name already used";
        tx.rollback();
      }

      const [categoryCreated] = await tx
        .insert(category)
        .values({ ...payload, sortOrder: categories.length + 1 })
        .returning({ id: category.id });
      return categoryCreated;
    });
    return [categoryCreated.id, null];
  } catch (error) {
    return [null, invariantError ? invariantError : "internal error"];
  }
}

/**
 * UPDATE CATEGORY
 */

export type UpdateCategoryDBPayload = {
  id: string;
  name: string;
  requesterParentId: string;
};

type UpdateCategoryResult = DefaultResult<CategoryId>;

export async function updateCategoryRepo(
  payload: UpdateCategoryDBPayload
): Promise<UpdateCategoryResult> {
  let invariantError: string | undefined;

  try {
    const updatedCategoryId = await db.transaction(async (tx) => {
      const existedCategory = await tx
        .select()
        .from(category)
        .where(eq(category.id, payload.id));

      if (existedCategory.length === 0) {
        invariantError = "Invalid category ID";
        tx.rollback();
      }

      const [updatedCategory] = await tx
        .update(category)
        .set({ name: payload.name, modifiedAt: new Date() })
        .where(eq(category.id, payload.id))
        .returning({ id: category.id });

      return updatedCategory.id;
    });
    return [updatedCategoryId, null];
  } catch (error) {
    return [null, invariantError ? invariantError : "internal error"];
  }
}

/**
 * UPDATE CATEGORY SORT ORDER
 */

export type updateCategorySortOrderDb = {
  newOrder: Array<string>;
  requesterUserParentId: string;
};

export async function updateCategorySortOrderRepo(
  payload: updateCategorySortOrderDb
): Promise<DefaultResult<"ok">> {
  let invariantError: string | undefined;
  try {
    await db.transaction(async (tx) => {
      const categories = await tx.query.category.findMany({
        columns: {
          id: true,
        },
        where: eq(category.ownerId, payload.requesterUserParentId),
      });
      if (categories.length === 0) {
        invariantError = "empty category";
        tx.rollback();
      }
      const mappedCategories = categories.map((ctg) => ctg.id);

      if (
        arraysHaveEqualElements(mappedCategories, payload.newOrder) === false
      ) {
        invariantError = "newOrder invalid";
        tx.rollback();
      }

      // https://orm.drizzle.team/docs/guides/update-many-with-different-value
      const sqlChunks: SQL[] = [];
      sqlChunks.push(sql`(case`);
      payload.newOrder.forEach((id, index) => {
        sqlChunks.push(sql`when ${category.id} = ${id} then ${index}::INTEGER`);
      });
      sqlChunks.push(sql`end)`);
      const finalSql: SQL = sql.join(sqlChunks, sql.raw(" "));

      await tx
        .update(category)
        .set({ sortOrder: finalSql })
        .where(inArray(category.id, payload.newOrder));
    });
    return ["ok", null];
  } catch (error) {
    return [null, invariantError ? invariantError : "Internal Error"];
  }
}

/**
 * DELETE CATEGORY
 */

export type DeleteCategoryRepoPayload = {
  categoryId: string;
  requesterParentId: string;
};

export async function deleteCategory(
  payload: DeleteCategoryRepoPayload
): Promise<DefaultResult<"ok">> {
  let invariantError: string | undefined;
  try {
    await db.transaction(async (tx) => {
      const categoryToDelete = await tx.query.category.findMany({
        where: and(
          eq(category.id, payload.categoryId),
          eq(category.ownerId, payload.requesterParentId)
        ),
      });
      if (categoryToDelete.length === 0) {
        invariantError = "invalid payload";
        tx.rollback();
      }

      // Untested line --->
      // await tx
      //   .update(items)
      //   .set({ sortOrder: null, categoryId: null })
      //   .where(eq(items.categoryId, payload.categoryId));
      // <---
      await tx.delete(category).where(eq(category.id, payload.categoryId));
    });
    return ["ok", null];
  } catch (error) {
    return [null, invariantError ? invariantError : "Internal Error"];
  }
}
