import { promises as fs } from "fs";
import { join } from "path";
import { DateTime } from "luxon";

import { generateId } from "@/lib/utils/generator";

export type ImageMetadata = {
  id: string;
  path: string;
};

export async function writeImageFile(
  image: Blob
): Promise<SafeResult<ImageMetadata>> {
  const DEFAULT_FOLDER_NAME = "images";
  const DEFAULT_LOCATION = (process.cwd(), DEFAULT_FOLDER_NAME);

  // Prepare Metadata
  const finalImageId = `${generateId(10)}`;
  const finalFileName = finalImageId + ".jpg";
  const currentDateString = DateTime.now().toISODate();

  // Check target location
  const targetDir = join(DEFAULT_LOCATION, currentDateString);
  const isTargetDirExist = await checkDir(targetDir);
  if (!isTargetDirExist) await fs.mkdir(targetDir);

  // Prepare full path for target file
  const targetFilePath = join(targetDir, finalFileName);

  try {
    const buffer = Buffer.from(await image.arrayBuffer());
    await fs.writeFile(targetFilePath, buffer);
    return [
      {
        id: finalImageId,
        path: join(DEFAULT_FOLDER_NAME, currentDateString, finalFileName),
      },
      null,
    ];
  } catch (error) {
    console.error("LOCAL_STORAGE: Cannot write file to disk");
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
