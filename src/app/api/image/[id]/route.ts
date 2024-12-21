import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import db from "@/infrastructure/database/db";
import { eq } from "drizzle-orm";
import { images } from "@/lib/schema/schema";

type Params = { params: Promise<SearchParams> };

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  if (typeof id !== "string") {
    return NextResponse.json({ error: "Image Not Found" }, { status: 404 });
  }

  const image = await db.query.images.findFirst({
    where: eq(images.id, id),
  });
  if (!image)
    return NextResponse.json({ error: "Image Not Found" }, { status: 404 });

  const imagePath = path.join(process.cwd(), image.path);

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
