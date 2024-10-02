import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

type Params = { params: { id: string } };

export async function GET(req: Request, { params }: Params) {
  const imagePath = path.join(process.cwd(), "images", `${params.id}`);

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
