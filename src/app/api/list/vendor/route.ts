import { auth } from "@/auth";
import getUserVendors from "@/app/_loader/getUserVendors.loader";

export async function GET() {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const { parentId } = session.user;

  const result = await getUserVendors(parentId);
  return Response.json(result);
}
