import db from "@/infrastructure/database/db";
import { createCategoryAndMoveItemFactory } from "./createCategoryAndMoveItem";

export const createCategoryAndMoveItemService =
  createCategoryAndMoveItemFactory(db);
