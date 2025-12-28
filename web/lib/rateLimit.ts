import { RateLimiterMemory } from "rate-limiter-flexible";
import { env } from "./env";

const points = Number(env.RATE_LIMIT_POINTS ?? "20");
const duration = Number(env.RATE_LIMIT_DURATION_SEC ?? "60");

export const limiter = new RateLimiterMemory({ points, duration });

export async function rateLimitOrThrow(key: string) {
  try {
    await limiter.consume(key);
  } catch {
    const err = new Error("Too many requests");
    (err as any).status = 429;
    throw err;
  }
}
