import Fuse from "fuse.js";
import db from "@/infrastructure/database/db";
import { vendor } from "@/lib/schema/vendor";
import { unstable_cache } from "next/cache";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

const getCachedVendorsLoaders = unstable_cache(
  async () => await db.select().from(vendor),
  [],
  { tags: ["vendors"] }
);

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const { parentId } = session.user;

  const { keyword } = (await req.json()) as unknown as {
    keyword: string;
  };

  // const allVendors = await getCachedVendorsLoaders();
  const allVendors = await db
    .select()
    .from(vendor)
    .where(eq(vendor.ownerId, parentId));

  const fuse = new Fuse(allVendors, {
    includeScore: true,
    threshold: 0.01,
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
