import getUserVendors from "@/app/_loader/getUserVendors.loader";
import { verifyUserAccess } from "@/lib/utils/auth";
import { allRole } from "@/lib/const";

export async function GET() {
  const [user, authError] = await verifyUserAccess(allRole);

  if (authError) {
    return Response.json({ error: authError }, { status: 401 });
  }
  const { parentId } = user;

  const result = await getUserVendors(parentId);
  return Response.json(result);
}
