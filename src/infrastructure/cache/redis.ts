import Redis from "ioredis";

declare global {
  // allow global var in dev to avoid re-creating clients on HMR
  // eslint-disable-next-line no-var
  var _redis: Redis | undefined;
}

export const redis =
  global._redis ??
  new Redis(process.env.REDIS_URL!, {
    lazyConnect: false,
    // keep defaults simple; add options here if you need them
  });

if (process.env.NODE_ENV !== "production") global._redis = redis;
