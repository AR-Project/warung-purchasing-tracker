import { CreateCategoryDbPayload } from "@/lib/schema/category";
import {
  addUserHelper,
  cleanUserTableHelper,
  defaultHelperUser,
  userTableHelper,
} from "./helper/userTableHelper";
import { categoryTableHelper } from "./helper/categoryTableHelper";
import {
  createCategory,
  deleteCategory,
  DeleteCategoryRepoPayload,
  getCategoryByParentId,
  UpdateCategoryDBPayload,
  updateCategoryRepo,
  updateCategorySortOrderDb,
  updateCategorySortOrderRepo,
} from "../categoryRepo";
import { itemTableHelper } from "./helper/itemTableHelper";

describe("categoryRepository", () => {
  beforeEach(async () => {
    // User Have No Default Category
    await userTableHelper.clean();
    await userTableHelper.add({});
  });

  afterEach(async () => {
    await cleanUserTableHelper();
  });

  describe("createCategory method", () => {
    afterEach(async () => {
      await categoryTableHelper.clean();
    });
    test("save and persist newCategory to database", async () => {
      const mockPayload: CreateCategoryDbPayload = {
        id: "cat-123",
        name: "test-cat",
        ownerId: defaultHelperUser.id,
        creatorId: defaultHelperUser.id,
      };

      const [data, error] = await createCategory(mockPayload);
      const persistedCategory = await categoryTableHelper.findById("cat-123");

      expect(data).toBe("cat-123");
      expect(error).toBeNull();
      expect(persistedCategory.length).toBe(1);
    });
    test("return error if category name is used from same user", async () => {
      const preload: CreateCategoryDbPayload = {
        id: "cat-999",
        name: "duplicate",
        ownerId: defaultHelperUser.id,
        creatorId: defaultHelperUser.id,
      };
      const mockPayload: CreateCategoryDbPayload = {
        id: "cat-123",
        name: "duplicate",
        ownerId: defaultHelperUser.id,
        creatorId: defaultHelperUser.id,
      };
      const [preloadData, preloadError] = await createCategory(preload);
      const [data, error] = await createCategory(mockPayload);
      const persistedCategory = await categoryTableHelper.findById("cat-999");
      const persistedData = await categoryTableHelper.findAll();
      expect(preloadData).toBe("cat-999");
      expect(preloadError).toBeNull();
      expect(data).toBeNull;
      expect(error).toBe("Category name already used");
      expect(persistedCategory.length).toBe(1);
      expect(persistedData.length).toBe(1);
    });

    test("insert correct data with correct sortOrder", async () => {
      const mock01: CreateCategoryDbPayload = {
        id: "cat-001",
        name: "cat-test-001",
        ownerId: defaultHelperUser.id,
        creatorId: defaultHelperUser.id,
      };
      const mock02: CreateCategoryDbPayload = {
        id: "cat-002",
        name: "cat-test-002",
        ownerId: defaultHelperUser.id,
        creatorId: defaultHelperUser.id,
      };
      const mock03: CreateCategoryDbPayload = {
        id: "cat-003",
        name: "cat-test-003",
        ownerId: defaultHelperUser.id,
        creatorId: defaultHelperUser.id,
      };

      await createCategory(mock01);
      await createCategory(mock02);
      await createCategory(mock03);

      const [persisted01] = await categoryTableHelper.findById("cat-001");
      const [persisted02] = await categoryTableHelper.findById("cat-002");
      const [persisted03] = await categoryTableHelper.findById("cat-003");

      expect(persisted01.sortOrder).toBe(1);
      expect(persisted02.sortOrder).toBe(2);
      expect(persisted03.sortOrder).toBe(3);
    });
  });

  describe("updateCategory method", () => {
    afterEach(async () => {
      await categoryTableHelper.clean();
    });

    test("should fail if id is not exist ", async () => {
      await categoryTableHelper.addMultiple(4);

      const testPayload: UpdateCategoryDBPayload = {
        id: "",
        name: "",
        requesterParentId: "",
      };

      const [result, error] = await updateCategoryRepo(testPayload);
      const currentTotalCategoryRow = await categoryTableHelper.findAll();

      expect(error).toBe("Invalid category ID");
      expect(result).toBeNull();
      expect(currentTotalCategoryRow.length).toBe(4);
    });

    test("should persist change to updated category", async () => {
      await categoryTableHelper.addMultiple(5);
      const testPayload: UpdateCategoryDBPayload = {
        id: "cat-003",
        name: "changed-category-name",
        requesterParentId: defaultHelperUser.id,
      };

      const [result, error] = await updateCategoryRepo(testPayload);
      const changedCategory = await categoryTableHelper.findById("cat-003");

      expect(error).toBeNull();
      expect(result).toBe("cat-003");
      expect(changedCategory.length).toBe(1);
      expect(changedCategory[0].name).toBe("changed-category-name");
    });
  });

  describe("updateCategorySortOrder method", () => {
    afterEach(async () => {
      await categoryTableHelper.clean();
    });

    test("should fail when passed with empty payload", async () => {
      await categoryTableHelper.addMultiple(3);
      const payload: updateCategorySortOrderDb = {
        newOrder: [],
        requesterUserParentId: "",
      };

      const [result, error] = await updateCategorySortOrderRepo(payload);

      expect(result).toBeNull();
      expect(error).toBe("empty category");
    });

    test("should fail when passed with empty payload but correct user", async () => {
      await categoryTableHelper.addMultiple(3);
      const payload: updateCategorySortOrderDb = {
        newOrder: [],
        requesterUserParentId: defaultHelperUser.id,
      };

      const [result, error] = await updateCategorySortOrderRepo(payload);

      expect(result).toBeNull();
      expect(error).toBe("newOrder invalid");
    });

    test("should fail when passed with different length for newOrder", async () => {
      await categoryTableHelper.addMultiple(3);
      const payload: updateCategorySortOrderDb = {
        newOrder: ["cat-002", "cat-001"],
        requesterUserParentId: defaultHelperUser.id,
      };

      const [result, error] = await updateCategorySortOrderRepo(payload);

      expect(result).toBeNull();
      expect(error).toBe("newOrder invalid");
    });

    test("should success and persist data", async () => {
      await categoryTableHelper.addMultiple(4);

      const payload: updateCategorySortOrderDb = {
        newOrder: ["cat-001", "cat-002", "cat-000", "cat-003"],
        requesterUserParentId: defaultHelperUser.id,
      };

      const originalOrder = await getCategoryByParentId(defaultHelperUser.id);
      const [result, error] = await updateCategorySortOrderRepo(payload);

      const updatedOrder = await getCategoryByParentId(defaultHelperUser.id);

      expect(error).toBeNull();
      expect(result).toBe("ok");
      expect(originalOrder.length).toBe(4);
      expect(updatedOrder.length).toBe(4);
      expect(originalOrder[0].sortOrder).toBe(0);
      expect(originalOrder[1].sortOrder).toBe(1);
      expect(originalOrder[2].sortOrder).toBe(2);
      expect(originalOrder[3].sortOrder).toBe(3);
      expect(originalOrder[0].id).toBe("cat-000");
      expect(originalOrder[1].id).toBe("cat-001");
      expect(originalOrder[2].id).toBe("cat-002");
      expect(originalOrder[3].sortOrder).toBe(3);

      expect(updatedOrder[0].sortOrder).toBe(0);
      expect(updatedOrder[1].sortOrder).toBe(1);
      expect(updatedOrder[2].sortOrder).toBe(2);
      expect(updatedOrder[3].sortOrder).toBe(3);

      expect(updatedOrder[0].id).toBe("cat-001");
      expect(updatedOrder[1].id).toBe("cat-002");
      expect(updatedOrder[2].id).toBe("cat-000");
      expect(updatedOrder[3].id).toBe("cat-003");
    });

    //  create mock categories with correct user
    // Should fail when method called with wrong credential - not an owner
    // Should fail when method called with bad array/payload, such as:
    //  different total category
    //  note: array shape is already validated in SA. Method only need to worry about correct length and correct ids
    // shoud success
  });

  describe("deleteCategory method", () => {
    afterEach(async () => {
      await itemTableHelper.clean();
      await categoryTableHelper.clean();
    });

    test("should fail when payload is invalid", async () => {
      await categoryTableHelper.addMultiple(4);

      const payload: DeleteCategoryRepoPayload = {
        categoryId: "",
        requesterParentId: "",
      };

      const [result, error] = await deleteCategory(payload);

      expect(result).toBeNull();
      expect(error).toBe("invalid payload");
    });
    test("should fail when payload is categoryId is invalid", async () => {
      await categoryTableHelper.addMultiple(4);

      const payload: DeleteCategoryRepoPayload = {
        categoryId: "cat-999",
        requesterParentId: defaultHelperUser.id,
      };

      const [result, error] = await deleteCategory(payload);

      expect(result).toBeNull();
      expect(error).toBe("invalid payload");
    });

    test("should fail when category is set as default category, on user or/and parent user", async () => {
      // This test also prevent the action when category left is one. Because one category, it has to be the default category
      await categoryTableHelper.add({
        id: "cat-111",
        name: "test category",
        ownerId: defaultHelperUser.id,
        creatorId: defaultHelperUser.id,
      });
      await userTableHelper.setDefaultCategory(defaultHelperUser.id, "cat-111");

      const payload: DeleteCategoryRepoPayload = {
        categoryId: "cat-111",
        requesterParentId: defaultHelperUser.id,
      };

      const categoriesPreDelete = await categoryTableHelper.findAll();

      const [result, repoError] = await deleteCategory(payload);

      const categoriesPostDelete = await categoryTableHelper.findAll();

      expect(result).toBeNull();
      expect(repoError).toBe("not allowed to delete default category");
      expect(categoriesPreDelete.length).toBe(1);
      expect(categoriesPostDelete.length).toBe(1);
    });

    test("should migrate all existing item's category to parent default category", async () => {
      // generate default category
      await categoryTableHelper.add({
        id: "cat-111",
        name: "default category",
        ownerId: defaultHelperUser.id,
        creatorId: defaultHelperUser.id,
      });
      await itemTableHelper.add({
        id: "item-01",
        categoryId: "cat-111",
        creatorId: defaultHelperUser.id,
        ownerId: defaultHelperUser.id,
        name: "Item on default Category #1",
      });

      // link category to user
      await userTableHelper.setDefaultCategory(defaultHelperUser.id, "cat-111");

      // generate category to delete
      await categoryTableHelper.add({
        id: "cat-222",
        name: "category to delete",
        ownerId: defaultHelperUser.id,
        creatorId: defaultHelperUser.id,
      });

      await itemTableHelper.add({
        id: "item-02",
        categoryId: "cat-222",
        creatorId: defaultHelperUser.id,
        ownerId: defaultHelperUser.id,
        name: "Item on deleted Category #1",
      });
      await itemTableHelper.add({
        id: "item-03",
        categoryId: "cat-222",
        creatorId: defaultHelperUser.id,
        ownerId: defaultHelperUser.id,
        name: "Item on deleted Category #2",
      });
      const payload: DeleteCategoryRepoPayload = {
        categoryId: "cat-222",
        requesterParentId: defaultHelperUser.id,
      };

      const categoriesPreDelete = await categoryTableHelper.findAll();
      const itemOnToBeDeleteCtgPre = await itemTableHelper.findByCategoryId(
        payload.categoryId
      );
      const itemOnDefaultCtgPre = await itemTableHelper.findByCategoryId(
        "cat-111"
      );
      const itemsOnUserPre = await itemTableHelper.findByUserId(
        defaultHelperUser.id
      );

      // Action
      const [result, repoError] = await deleteCategory(payload);

      const itemOnDefaultCtgPost = await itemTableHelper.findByCategoryId(
        "cat-111"
      );
      const categoriesPostDelete = await categoryTableHelper.findAll();
      const itemsOnUserPost = await itemTableHelper.findByUserId(
        defaultHelperUser.id
      );

      expect(result).toBe("ok");
      expect(repoError).toBeNull();
      // Check total number for item under default category
      expect(itemOnToBeDeleteCtgPre.length).toBe(2);
      expect(itemOnDefaultCtgPre.length).toBe(1);
      expect(itemsOnUserPre.length).toBe(3);
      expect(categoriesPreDelete.length).toBe(2);

      expect(categoriesPostDelete.length).toBe(1);
      expect(itemOnDefaultCtgPost.length).toBe(3);
      expect(itemsOnUserPost.length).toBe(3);
    });

    test("should success with valid payload", async () => {
      await categoryTableHelper.addMultiple(4);

      const payload: DeleteCategoryRepoPayload = {
        categoryId: "cat-001",
        requesterParentId: defaultHelperUser.id,
      };

      const categoriesPreDelete = await categoryTableHelper.findAll();
      const [result, error] = await deleteCategory(payload);
      const categoriesPostDelete = await categoryTableHelper.findAll();
      const emptyCategory = await categoryTableHelper.findById("cat-001");

      expect(error).toBeNull();
      expect(result).toBe("ok");
      expect(categoriesPreDelete.length).toBe(4);
      expect(categoriesPostDelete.length).toBe(3);
      expect(emptyCategory.length).toBe(0);
    });
  });
});
