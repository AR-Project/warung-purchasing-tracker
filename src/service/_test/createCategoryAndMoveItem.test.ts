import { categoryTableHelper } from "@/infrastructure/repository/_test/helper/categoryTableHelper";
import { itemTableHelper } from "@/infrastructure/repository/_test/helper/itemTableHelper";
import {
  defaultHelperUser,
  userTableHelper,
} from "@/infrastructure/repository/_test/helper/userTableHelper";
import {
  createCategoryAndMoveItemFactory,
  CreateCtgAndMoveItemPayload,
} from "../createCategoryAndMoveItem";
import db from "@/infrastructure/database/db";

describe("SERVICE: createCategoryAndMoveItem", () => {
  beforeEach(async () => {
    await userTableHelper.addWithCategory({});
    await itemTableHelper.add({
      id: "item-test123",
      name: "changeCtgItem",
      ownerId: defaultHelperUser.id,
      creatorId: defaultHelperUser.id,
      categoryId: "cat-000",
    });
  });
  afterEach(async () => {
    await itemTableHelper.clean();
    await categoryTableHelper.clean();
    await userTableHelper.clean();
  });

  test("should fail when itemId is invalid", async () => {
    const payload: CreateCtgAndMoveItemPayload = {
      itemId: "invalid",
      newCategoryId: "cat-999",
      newCategoryName: "test",
      parentId: defaultHelperUser.id,
      creatorId: defaultHelperUser.id,
    };

    const [result, error] = await createCategoryAndMoveItemFactory(db)(payload);

    expect(error).toBe("itemId invalid");
    expect(result).toBeNull();
  });
  test("should fail when user tried to edit other user item / not owned item", async () => {
    await userTableHelper.add({
      username: "unauthorized-user",
      id: "user-test123",
      parentId: "user-test123",
    });

    const payload: CreateCtgAndMoveItemPayload = {
      itemId: "item-test123",
      newCategoryId: "cat-999",
      newCategoryName: "test",
      parentId: "user-test123",
      creatorId: "user-test123",
    };

    const [result, error] = await createCategoryAndMoveItemFactory(db)(payload);

    expect(error).toBe("user not authorized on this item");
    expect(result).toBeNull();
  });

  test("should perform task successfully and persist change", async () => {
    const payload: CreateCtgAndMoveItemPayload = {
      itemId: "item-test123",
      newCategoryId: "cat-999",
      newCategoryName: "newCtg",
      parentId: defaultHelperUser.id,
      creatorId: defaultHelperUser.id,
    };

    const [result, error] = await createCategoryAndMoveItemFactory(db)(payload);

    expect(error).toBeNull();
    expect(result).toStrictEqual({
      itemName: "changeCtgItem",
      categoryName: "newCtg",
    });
  });
});
