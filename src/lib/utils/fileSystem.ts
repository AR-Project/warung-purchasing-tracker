import { join } from "path";

export function generateImagePathOnServer(
  userId: string,
  serverFileName: string
) {
  const DEFAULT_FOLDER = "images";
  return join(process.cwd(), DEFAULT_FOLDER, userId, `${serverFileName}.jpg`);
}
