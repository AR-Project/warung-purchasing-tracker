import { customAlphabet } from "nanoid";
import { CHARACTER_LIST, ID_LENGTH } from "../const";

export const generateId = (size: number = ID_LENGTH) => {
  return customAlphabet(CHARACTER_LIST, size)();
};
