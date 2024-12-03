import Fuse from "fuse.js";
import db from "@/infrastructure/database/db";
import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { items } from "@/lib/schema/item";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { parentId } = session.user;

  const { keyword } = (await req.json()) as unknown as {
    keyword: string;
  };

  const getCachedItemsLoaders = unstable_cache(
    async () =>
      await db.select().from(items).where(eq(items.ownerId, parentId)),
    [],
    { tags: ["items"] }
  );
  // const allItems = await getCachedItemsLoaders();
  const allItems = await db
    .select()
    .from(items)
    .where(eq(items.ownerId, parentId));

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
