import { join } from "path";

export function generateImageFilePath(imageId: string, uploadedDate: string) {
  const DEFAULT_FOLDER = "images";
  return join(process.cwd(), DEFAULT_FOLDER, uploadedDate, `${imageId}.jpg`);
}
