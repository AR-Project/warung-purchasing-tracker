import db from "@/infrastructure/database/db";
import { safePromise } from "@/lib/utils/safePromise";

export async function checkUsernameAvaibility(
  usernameToCheck: string
): Promise<SafeResult<string>> {
  const { data, error: dbError } = await safePromise(
    db.query.user.findFirst({
      columns: { id: true },
      where: (user, { eq }) => eq(user.username, usernameToCheck),
    })
  );

  if (dbError) return [null, "internal error"];
  if (data) return [null, "unavailable"];

  return ["ok", null];
}
