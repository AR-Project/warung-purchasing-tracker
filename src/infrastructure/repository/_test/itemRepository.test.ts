import {
  create,
  type CreateItemRepoPayload,
  update,
  type UpdateItemRepoPayload,
  updateSortOrder,
  type UpdateOrderItemRepoPayload,
} from "../itemRepo";
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

  describe("update method", () => {
    test("should fail when itemId is invalid", async () => {
      const payload: UpdateItemRepoPayload = {
        id: "item-invalid",
        newName: "Invalid Item",
        parentId: defaultHelperUser.id,
        userId: defaultHelperUser.id,
      };

      const [result, error] = await update(payload);
      expect(result).toBeNull();
      expect(error).toBe("itemId invalid");
    });

    test("should fail when item is not owned by user", async () => {
      // Add item to existing user
      await itemTableHelper.add({
        id: "item-001",
        categoryId: "cat-000",
        name: "original name",
        creatorId: defaultHelperUser.id,
        ownerId: defaultHelperUser.id,
      });

      // add new user
      await userTableHelper.add({
        id: `u-222`,
        username: `test_2`,
        parentId: `u-222`,
      });
      await categoryTableHelper.add({
        id: "cat-111",
        ownerId: "u-222",
        creatorId: "u-222",
        name: "category user test_2",
      });
      await userTableHelper.setDefaultCategory("u-222", "cat-111");

      const payload: UpdateItemRepoPayload = {
        id: "item-001",
        newName: "Invalid Item",
        parentId: "u-222",
        userId: "u-222",
      };

      const [result, error] = await update(payload);
      const item = await itemTableHelper.findById("item-001");

      expect(result).toBeNull();
      expect(error).toBe("update unauthorized");
      expect(item[0].id).toBe("item-001");
      expect(item[0].name).toBe("original name");
    });

    test("should success and persist change", async () => {
      await itemTableHelper.add({
        id: "item-001",
        categoryId: "cat-000",
        name: "original name",
        creatorId: defaultHelperUser.id,
        ownerId: defaultHelperUser.id,
      });
      const payload: UpdateItemRepoPayload = {
        id: "item-001",
        newName: "new name",
        parentId: defaultHelperUser.id,
        userId: defaultHelperUser.id,
      };

      const [result, error] = await update(payload);

      expect(error).toBeNull();
      expect(result).toStrictEqual({ id: "item-001", name: "new name" });
    });
    test("should success and persist change when performed by child user", async () => {
      await userTableHelper.add({
        id: "u-222",
        parentId: defaultHelperUser.id,
        username: "child user from u-123",
      });

      await itemTableHelper.add({
        id: "item-001",
        categoryId: "cat-000",
        name: "original name",
        creatorId: "u-222",
        ownerId: defaultHelperUser.id,
      });

      const payload: UpdateItemRepoPayload = {
        id: "item-001",
        newName: "new name",
        parentId: defaultHelperUser.id,
        userId: "u-222",
      };

      const [result, error] = await update(payload);

      expect(error).toBeNull();
      expect(result).toStrictEqual({ id: "item-001", name: "new name" });
    });
  });

  describe("update sortOrder method ", () => {
    test("should fail category is not exist", async () => {
      const payload: UpdateOrderItemRepoPayload = {
        categoryId: "cat-invalid",
        newOrder: ["invalid"],
        userId: defaultHelperUser.id,
        parentId: defaultHelperUser.id,
      };

      const [result, error] = await updateSortOrder(payload);

      expect(error).toBe("categoryId invalid");
      expect(result).toBeNull();
    });

    test("should fail when new order array length is doesnt match with existing item length", async () => {
      await itemTableHelper.add({
        id: "item-01",
        name: "sortOrder test #1",
        categoryId: "cat-000",
        sortOrder: 0,
        creatorId: defaultHelperUser.id,
        ownerId: defaultHelperUser.id,
      });
      await itemTableHelper.add({
        id: "item-02",
        name: "sortOrder test #2",
        categoryId: "cat-000",
        sortOrder: 1,
        creatorId: defaultHelperUser.id,
        ownerId: defaultHelperUser.id,
      });
      await itemTableHelper.add({
        id: "item-03",
        name: "sortOrder test #3",
        categoryId: "cat-000",
        sortOrder: 2,
        creatorId: defaultHelperUser.id,
        ownerId: defaultHelperUser.id,
      });

      const payload: UpdateOrderItemRepoPayload = {
        categoryId: "cat-000",
        newOrder: ["invalid"],
        userId: defaultHelperUser.id,
        parentId: defaultHelperUser.id,
      };

      const [result, error] = await updateSortOrder(payload);

      expect(error).toBe("newOrder invalid");
      expect(result).toBeNull();
    });

    test("should persist new order", async () => {
      await itemTableHelper.add({
        id: "item-01",
        name: "sortOrder test #1",
        categoryId: "cat-000",
        sortOrder: 0,
        creatorId: defaultHelperUser.id,
        ownerId: defaultHelperUser.id,
      });
      await itemTableHelper.add({
        id: "item-02",
        name: "sortOrder test #2",
        categoryId: "cat-000",
        sortOrder: 1,
        creatorId: defaultHelperUser.id,
        ownerId: defaultHelperUser.id,
      });
      await itemTableHelper.add({
        id: "item-03",
        name: "sortOrder test #3",
        categoryId: "cat-000",
        sortOrder: 2,
        creatorId: defaultHelperUser.id,
        ownerId: defaultHelperUser.id,
      });

      const payload: UpdateOrderItemRepoPayload = {
        categoryId: "cat-000",
        newOrder: ["item-03", "item-01", "item-02"],
        userId: defaultHelperUser.id,
        parentId: defaultHelperUser.id,
      };

      const [result, error] = await updateSortOrder(payload);

      const updatedItem = await itemTableHelper.findByCategoryId("cat-000");

      expect(result).toBe("ok");
      expect(error).toBeNull();

      expect(updatedItem[0].id).toBe("item-03");
      expect(updatedItem[0].sortOrder).toBe(0);
      expect(updatedItem[1].id).toBe("item-01");
      expect(updatedItem[1].sortOrder).toBe(1);
      expect(updatedItem[2].id).toBe("item-02");
      expect(updatedItem[2].sortOrder).toBe(2);
    });
  });
});
