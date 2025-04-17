import { CreateCategoryDbPayload } from "@/lib/schema/item";
import {
  addUserHelper,
  cleanUserTableHelper,
  defaultHelperUser,
} from "./helper/userTableHelper";
import { categoryTableHelper } from "./helper/itemTableHelper";
import { createCategory } from "../itemRepo";

describe("itemRepository", () => {
  beforeAll(async () => {
    await addUserHelper({});
    return async () => {
      await cleanUserTableHelper();
    };
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
    test("return error if category name is used", async () => {
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
});
