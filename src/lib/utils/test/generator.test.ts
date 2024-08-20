import { generateId } from "../generator";

describe("generator factory", () => {
  test("should return correct function", () => {
    const id = generateId(15);

    expect(typeof id).toBe("string");
    expect(id.length).toBe(15);
  });
});
