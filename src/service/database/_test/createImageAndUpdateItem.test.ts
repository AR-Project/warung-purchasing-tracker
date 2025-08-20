import { categoryTableHelper } from "@/infrastructure/repository/_test/helper/categoryTableHelper";
import { itemTableHelper } from "@/infrastructure/repository/_test/helper/itemTableHelper";
import {
  defaultHelperUser,
  userTableHelper,
} from "@/infrastructure/repository/_test/helper/userTableHelper";
import {
  CreateImageAndUpdateItemPayload,
  createImageAndUpdateItemService,
} from "../createImageAndUpdateItem.service";
import { imageTableHelper } from "@/infrastructure/repository/_test/helper/imageTableHelper";

describe("SERVICE: createImageAndUpdateItem", () => {
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
    await imageTableHelper.clean();
  });

  test("should fail when itemId is invalid", async () => {
    const payload: CreateImageAndUpdateItemPayload = {
      itemId: "invalid",
      parentId: defaultHelperUser.id,
      creatorId: defaultHelperUser.id,
      imageData: {
        id: "image-123",
        url: "/user/image-123",
        serverFileName: "image-123",
      },
    };

    const [result, error] = await createImageAndUpdateItemService(payload);

    expect(error).toBe("itemId invalid");
    expect(result).toBeNull();
  });
  test("should fail when user tried to edit other user item / not owned item", async () => {
    await userTableHelper.add({
      username: "unauthorized-user",
      id: "user-test123",
      parentId: "user-test123",
    });

    const payload: CreateImageAndUpdateItemPayload = {
      itemId: "item-test123", // default user's item
      parentId: "user-test123",
      creatorId: "user-test123",
      imageData: {
        id: "image-123",
        url: "/user/image-123",
        serverFileName: "image-123",
      },
    };

    const [result, error] = await createImageAndUpdateItemService(payload);

    expect(error).toBe("user not authorized on this item");
    expect(result).toBeNull();
  });

  test("should success when previous imageId is null", async () => {
    const payload: CreateImageAndUpdateItemPayload = {
      itemId: "item-test123",
      parentId: defaultHelperUser.id,
      creatorId: defaultHelperUser.id,
      imageData: {
        id: "image-123",
        url: "/user/image-123",
        serverFileName: "image-123",
      },
    };

    const [result, error] = await createImageAndUpdateItemService(payload);

    const [itemResult] = await itemTableHelper.findById("item-test123");
    const [imageResult] = await imageTableHelper.findById("image-123");

    expect(itemResult.imageId).toBe("image-123");
    expect(imageResult.url).toBe("/user/image-123");
    expect(error).toBeNull();
    expect(result).toStrictEqual({
      itemId: "item-test123",
      imageId: "image-123",
      oldImage: null,
    });
  });

  test("should success when item already have image", async () => {
    await imageTableHelper.add({
      id: "img-old-123",
      creatorId: defaultHelperUser.id,
      ownerId: defaultHelperUser.id,
      originalFileName: "from-test",
      serverFileName: "000000_img_old",
      url: "/images/u-123/000000_img_old",
    });

    await itemTableHelper.add({
      id: "item-test124",
      name: "updateImage",
      ownerId: defaultHelperUser.id,
      creatorId: defaultHelperUser.id,
      categoryId: "cat-000",
      imageId: "img-old-123",
    });

    const payload: CreateImageAndUpdateItemPayload = {
      itemId: "item-test124",
      parentId: defaultHelperUser.id,
      creatorId: defaultHelperUser.id,
      imageData: {
        id: "img-new-123",
        url: "/images/user-123/image-new-123",
        serverFileName: "image-new-123",
      },
    };

    const [result, error] = await createImageAndUpdateItemService(payload);

    expect(error).toBeNull();
    expect(result).toStrictEqual({
      itemId: "item-test124",
      imageId: "img-new-123",
      oldImage: "000000_img_old",
    });
  });
});
