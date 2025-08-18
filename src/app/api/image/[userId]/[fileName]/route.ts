import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import z from "zod";

import { generateImagePathOnServer } from "@/lib/utils/fileSystem";

type Params = { params: Promise<SearchParams> };

const schema = z.object({
  userId: z.string(),
  fileName: z.string(),
});

export async function GET(req: Request, { params }: Params) {
  const paramsRaw = await params;

  const { data: imageMeta, error: paramsError } = schema.safeParse(paramsRaw);
  if (paramsError) return res("Image Not Found", 404);

  try {
    const serverPath = generateImagePathOnServer(
      imageMeta.userId,
      imageMeta.fileName
    );
    const imageBuffer = await fs.readFile(serverPath);
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return NextResponse.json(
      { error: "Failed to serve image" },
      { status: 500 }
    );
  }
}

function res(msg: string, code: number) {
  return NextResponse.json({ error: msg }, { status: code });
}
