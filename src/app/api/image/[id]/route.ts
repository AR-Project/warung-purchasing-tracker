import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import db from "@/infrastructure/database/db";
import { eq } from "drizzle-orm";
import { image } from "@/lib/schema/image";

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

  const imagePath = path.join(process.cwd(), imagesResult.path);

  try {
    const imageBuffer = await fs.readFile(imagePath);
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
