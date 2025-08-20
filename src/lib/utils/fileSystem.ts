import { join } from "path";

/**
 * Relative path format: `./images/<user-id>/<server-file-name>.jpg`
 */

export function generateImagePathOnServer(
  userId: string,
  serverFileName: string
) {
  const DEFAULT_FOLDER = "images";
  return join(process.cwd(), DEFAULT_FOLDER, userId, `${serverFileName}.jpg`);
}
