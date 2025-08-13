import { promises as fs } from "fs";
import { join } from "path";
import { DateTime } from "luxon";

import { generateId } from "@/lib/utils/generator";
import { logger } from "@/lib/logger";

const DEFAULT_FOLDER_NAME = "images";
const LOCATION = (process.cwd(), DEFAULT_FOLDER_NAME);

export async function writeImageFile(
  image: Blob,
  userId: string
): Promise<SafeResult<{ id: string; url: string; serverFileName: string }>> {
  const time = DateTime.now().toFormat("yyMMdd"); // 251230

  // Prepare Metadata
  const id = `${generateId(10)}`;
  const targetName = `${time}_${id}`;

  // Check target location
  const userDir = join(LOCATION, userId);
  const isTargetDirExist = await checkDir(userDir);
  if (!isTargetDirExist) await fs.mkdir(userDir);

  // Prepare full path for target file
  const targetFilePath = join(userDir, `${targetName}.jpg`);

  try {
    const buffer = Buffer.from(await image.arrayBuffer());
    await fs.writeFile(targetFilePath, buffer);
    return [
      {
        id: id,
        url: `${userId}/${targetName}`,
        serverFileName: targetName,
      },
      null,
    ];
  } catch (error) {
    logger.error("LOCAL_STORAGE: Cannot write file to disk");
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
