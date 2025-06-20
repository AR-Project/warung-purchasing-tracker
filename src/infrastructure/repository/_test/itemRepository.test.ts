import { create, CreateItemRepoPayload } from "../itemRepo";
import { categoryTableHelper } from "./helper/categoryTableHelper";
import { itemTableHelper } from "./helper/itemTableHelper";
import { defaultHelperUser, userTableHelper } from "./helper/userTableHelper";

describe("item repository", () => {
  beforeEach(async () => {
    await userTableHelper.addWithCategory({});
  });
  afterEach(async () => {
    await itemTableHelper.clean();
    await categoryTableHelper.clean();
    await userTableHelper.clean();
  });

  describe("create method", () => {
    test("should fail when categoryId isInvalid", async () => {
      const payload: CreateItemRepoPayload = {
        id: "item-000",
        name: "Invalid Item",
        ownerId: defaultHelperUser.id,
        creatorId: defaultHelperUser.id,
        categoryId: "cat-invalid",
      };

      const [result, error] = await create(payload);
      expect(result).toBeNull();
      expect(error).toBe("categoryId invalid");
    });

    test("should success when categoryId is valid with correct sortOrder", async () => {
      await categoryTableHelper.add({ id: "cat-111" });
      await itemTableHelper.add({
        id: "item-222",
        categoryId: "cat-111",
        ownerId: defaultHelperUser.id,
        creatorId: defaultHelperUser.id,
        sortOrder: 0,
      });
      const payload: CreateItemRepoPayload = {
        id: "item-000",
        name: "Test Item",
        ownerId: defaultHelperUser.id,
        creatorId: defaultHelperUser.id,
        categoryId: "cat-111",
      };
      const [result, error] = await create(payload);

      const itemOnNewCtg = await itemTableHelper.findByCategoryId("cat-111");
      const itemsOnDefaultCtg = await itemTableHelper.findByCategoryId(
        "cat-000"
      );

      const [addedItem] = await itemTableHelper.findById("item-000");

      expect(result).toStrictEqual({
        id: "item-000",
        name: "Test Item",
        categoryId: "cat-111",
      });
      expect(error).toBeNull();
      expect(itemOnNewCtg.length).toBe(2);
      expect(itemsOnDefaultCtg.length).toBe(0);
      expect(addedItem.sortOrder).toBe(1);
    });

    test("should success when categoryId is not included", async () => {
      await itemTableHelper.add({
        id: "item-222",
        categoryId: "cat-000",
        ownerId: defaultHelperUser.id,
        creatorId: defaultHelperUser.id,
        sortOrder: 0,
      });
      await itemTableHelper.add({
        id: "item-333",
        categoryId: "cat-000",
        ownerId: defaultHelperUser.id,
        creatorId: defaultHelperUser.id,
        sortOrder: 1,
      });

      const payload: CreateItemRepoPayload = {
        id: "item-000",
        name: "Test Item",
        ownerId: defaultHelperUser.id,
        creatorId: defaultHelperUser.id,
      };
      const [result, error] = await create(payload);

      const itemsOnDefaultCtg = await itemTableHelper.findByCategoryId(
        "cat-000"
      );
      const [addedItem] = await itemTableHelper.findById("item-000");

      expect(result).toStrictEqual({
        id: "item-000",
        name: "Test Item",
        categoryId: "cat-000",
      });
      expect(error).toBeNull();
      expect(itemsOnDefaultCtg.length).toBe(3);
      expect(addedItem.sortOrder).toBe(2);
    });
  });
});
