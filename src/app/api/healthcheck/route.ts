import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/infrastructure/database/db";
import redis from "@/infrastructure/cache/redis";
import { safePromise } from "@/lib/utils/safePromise";

export async function GET() {
  const { data: redisStatus } = await safePromise(redis.ping());
  const { error: databaseStatus } = await safePromise(
    db.execute(sql`select 1`)
  );
  const isCacheError = redisStatus !== "PONG";
  const isDatabaseError = !!databaseStatus;

  const isServiceDegrade = isCacheError || isDatabaseError;

  return NextResponse.json(
    {
      message: "ok",
      redis: isCacheError ? "down" : "ok",
      database: isDatabaseError ? "down" : "ok",
    },
    { status: isServiceDegrade ? 503 : 200 }
  );
}
