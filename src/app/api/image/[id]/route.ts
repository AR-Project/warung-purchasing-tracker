import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { DateTime } from "luxon";
import { eq } from "drizzle-orm";

import db from "@/infrastructure/database/db";
import { image } from "@/lib/schema/image";
import { generateImageFilePath } from "@/lib/utils/fileSystem";

type Params = { params: Promise<SearchParams> };

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  if (typeof id !== "string") {
    return NextResponse.json({ error: "Image Not Found" }, { status: 404 });
  }

  const imagesResult = await db.query.image.findFirst({
    where: eq(image.id, id),
  });
  if (!imagesResult)
    return NextResponse.json({ error: "Image Not Found" }, { status: 404 });

  const uploadedDate = DateTime.fromJSDate(imagesResult.uploadedAt).toISODate();
  if (!uploadedDate)
    return NextResponse.json({ error: "Image Not Found" }, { status: 404 });

  try {
    const imageBuffer = await fs.readFile(
      generateImageFilePath(id, uploadedDate)
    );
    return new NextResponse(imageBuffer, {
      headers: { "Content-Type": "image/jpeg" },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return NextResponse.json(
      { error: "Failed to serve image" },
      { status: 500 }
    );
  }
}
