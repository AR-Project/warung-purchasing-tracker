import Fuse from "fuse.js";
import db from "@/infrastructure/database/db";
import { eq } from "drizzle-orm";

import { verifyUserAccess } from "@/lib/utils/auth";
import { allRole } from "@/lib/const";
import { item } from "@/lib/schema/item";

export async function POST(req: Request) {
  const [user, authError] = await verifyUserAccess(allRole);

  if (authError) {
    return Response.json({ error: authError }, { status: 401 });
  }

  const { parentId } = user;

  const { keyword } = (await req.json()) as unknown as {
    keyword: string;
  };

  const allItems = await db
    .select()
    .from(item)
    .where(eq(item.ownerId, parentId));

  const fuse = new Fuse(allItems, {
    includeScore: true,
    threshold: 0.1,
    keys: ["name"],
  });

  const result = fuse
    .search(keyword)
    .map(({ item }) => ({ id: item.id, name: item.name }));

  if (result.length === 0) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }

  return Response.json(result);
}
