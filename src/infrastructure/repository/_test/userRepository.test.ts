import { NewUserDbPayload } from "@/lib/schema/user";
import {
  addUserHelper,
  cleanUserTableHelper,
  findUserByIdHelper,
} from "./helper/userTableHelper";
import { saveNewUser } from "../userRepository";

describe("UserRepository", () => {
  afterEach(async () => {
    await cleanUserTableHelper();
  });

  describe("saveNewUser Method", () => {
    test("sanity Check", async () => {
      expect(1).toBe(1);
    });
    test("add user correctly and persist to database", async () => {
      const mockPayload: NewUserDbPayload = {
        id: "u-111",
        username: "mockup",
        hashedPassword: "$mockup$hashed$password",
        parentId: "u-111",
      };

      const [data, error] = await saveNewUser(mockPayload);

      const addedUser = await findUserByIdHelper("u-111");
      expect(addedUser.length).toBe(1);
      expect(data).not.toBeNull();
      expect(data?.id).toBe("u-111");
      expect(data?.username).toBe("mockup");
      expect(error).toBeNull();
    });
    test("not to add user when conflict on username ", async () => {
      await addUserHelper({
        id: "u-000",
        parentId: "u-000",
        username: "exist-username",
      });

      const mockPayload: NewUserDbPayload = {
        id: "u-111",
        username: "exist-username",
        hashedPassword: "$mockup$hashed$password",
        parentId: "u-111",
      };

      const [data, error] = await saveNewUser(mockPayload);

      const existingUser = await findUserByIdHelper("u-000");
      const addedUser = await findUserByIdHelper("u-111");
      expect(addedUser.length).toBe(0);
      expect(existingUser.length).toBe(1);

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error).toBe("Username not available");
    });
  });
});
