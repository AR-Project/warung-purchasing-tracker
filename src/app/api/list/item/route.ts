import { auth } from "@/auth";
import getUserItems from "@/app/_loader/getUserItems.loader";

export async function GET() {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const { parentId } = session.user;

  const result = await getUserItems(parentId);
  return Response.json(result);
}
