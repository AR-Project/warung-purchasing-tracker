import { generateId } from "@/lib/utils/generator";
import { DateTime } from "luxon";
import { join } from "path";
import { promises as fs } from "fs";

export type ImageMetadata = {
  id: string;
  path: string;
};

export async function writeImageFile(
  image: Blob
): Promise<[ImageMetadata, null] | [null, string]> {
  try {
    // Generate
    const imageId = `${generateId(10)}`;
    const filename = imageId + ".jpg";
    const stringDate = DateTime.now().toISODate();

    // Calculate
    const relativeDir = join("images", stringDate);
    const relativeFilePath = join(relativeDir, filename);

    // local disk
    const localDir = join(process.cwd(), relativeDir);
    const isLocalDirExist = await checkDir(localDir);
    if (!isLocalDirExist) await fs.mkdir(localDir);

    const localFilePath = join(process.cwd(), relativeFilePath);

    const buffer = Buffer.from(await image.arrayBuffer());
    await fs.writeFile(localFilePath, buffer);
    return [{ id: imageId, path: relativeFilePath }, null];
  } catch (error) {
    return [null, "Fail to write image"];
  }
}

async function checkDir(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch (error) {
    return false;
  }
}
