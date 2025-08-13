import Redis from "ioredis";

declare global {
  // allow global var in dev to avoid re-creating clients on HMR
  // eslint-disable-next-line no-var
  var _redis: Redis | undefined;
  var __redisLastLog: number | undefined;
}

const LOG_WINDOW_MS = 5 * 60_000; // log at most once per 5 minutes

function logOnce(msg: string) {
  const now = Date.now();
  const last = global.__redisLastLog ?? 0;
  if (now - last > LOG_WINDOW_MS) {
    console.warn(msg);

    global.__redisLastLog = now;
  }
}

const redis =
  global._redis ??
  new Redis(process.env.REDIS_URL!, {
    lazyConnect: true, // don't connect until first command
    enableOfflineQueue: false, // fail fast if offline
    maxRetriesPerRequest: 0, // don't retry individual commands
    // keep background reconnects, but not too chatty
    retryStrategy: (times) => Math.min(10_000 * times, 60_000), // 10s -> 60s cap
  });

if (process.env.NODE_ENV !== "production") global._redis = redis;

redis.on("error", (err) => {
  logOnce(`[redis] ${err?.message ?? String(err)}`);
});
redis.on("end", () => logOnce("[redis] connection lost"));
redis.on("connect", () => logOnce("[redis] connected"));

export default redis;
