import { NewUserDbPayload } from "@/lib/schema/user";
import { userTableHelper } from "./helper/userTableHelper";
import {
  createUserRepo,
  createChildUserRepo,
  type CreateChildUserRepoPayload,
} from "../userRepository";
import { categoryTableHelper } from "./helper/itemTableHelper";

describe("UserRepository", () => {
  describe("createUser Method", () => {
    afterEach(async () => {
      await categoryTableHelper.clean();
      await userTableHelper.clean();
    });

    test("add user correctly and persist to database", async () => {
      const mockPayload: NewUserDbPayload = {
        id: "u-111",
        username: "mockup",
        hashedPassword: "$mockup$hashed$password",
        parentId: "u-111",
      };

      const [data, error] = await createUserRepo(mockPayload);

      const addedUser = await userTableHelper.findById("u-111");
      expect(addedUser.length).toBe(1);

      const defaultCategory = await categoryTableHelper.findById(
        addedUser[0].defaultCategory ? addedUser[0].defaultCategory : ""
      );

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data?.id).toBe("u-111");
      expect(data?.username).toBe("mockup");
      expect(defaultCategory.length).toBe(1);
    });

    test("not to add user when conflict on username ", async () => {
      await userTableHelper.add({
        id: "u-000",
        parentId: "u-000",
        username: "exist-username",
      });

      await categoryTableHelper.add({
        id: "cat-000",
        creatorId: "u-000",
        ownerId: "u-000",
      });

      await userTableHelper.setDefaultCategory("u-000", "cat-000");

      const mockPayload: NewUserDbPayload = {
        id: "u-111",
        username: "exist-username",
        hashedPassword: "$mockup$hashed$password",
        parentId: "u-111",
      };

      const [data, error] = await createUserRepo(mockPayload);

      const existingUser = await userTableHelper.findById("u-000");
      const addedUser = await userTableHelper.findById("u-111");
      const addedUserCategory = await categoryTableHelper.findByUserId("u-111");
      const existingUserCategory = await categoryTableHelper.findByUserId(
        "u-000"
      );

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error).toBe("Username not available");

      expect(addedUser.length).toBe(0);
      expect(existingUser.length).toBe(1);
      expect(addedUserCategory.length).toBe(0);
      expect(existingUserCategory.length).toBe(1);
    });
  });

  describe("createChildUserRepo method", () => {
    beforeEach(async () => {});
    afterEach(async () => {
      await userTableHelper.clean();
      await categoryTableHelper.clean();
    });

    test("should fail when parent user category is set", async () => {
      const payload: CreateChildUserRepoPayload = {
        username: "fail",
        id: "u-123",
        hashedPassword: "$hashed$password",
        role: "staff",
        parentId: "u-000",
      };

      const [data, error] = await createChildUserRepo(payload);

      expect(error).toBe("parent user default category not set");
      expect(data).toBeNull();
    });

    test("should fail when username is used", async () => {
      // mock parent user
      await userTableHelper.addWithCategory({
        id: "u-000",
        username: "notUniqueUsername",
        parentId: "u-000",
      });

      const payload: CreateChildUserRepoPayload = {
        username: "notUniqueUsername",
        id: "u-123",
        hashedPassword: "$hashed$password",
        role: "staff",
        parentId: "u-000",
      };

      const [data, error] = await createChildUserRepo(payload);

      expect(error).toBe("username not available");
      expect(data).toBeNull();
    });

    test("should success and persist data", async () => {
      // mock parent user
      await userTableHelper.addWithCategory({
        id: "u-000",
        username: "parent",
        parentId: "u-000",
      });

      const payload: CreateChildUserRepoPayload = {
        username: "child",
        id: "u-123",
        hashedPassword: "$hashed$password",
        role: "staff",
        parentId: "u-000",
      };

      const [data, error] = await createChildUserRepo(payload);

      const userOnTable = await userTableHelper.findById("u-123");
      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data?.id).toBe("u-123");
      expect(data?.username).toBe("child");
      expect(userOnTable.length).toBe(1);
    });
  });
});
