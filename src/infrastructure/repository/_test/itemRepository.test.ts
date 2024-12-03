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
  });
});
