import rateLimit, {
  ipKeyGenerator,
  type RateLimitRequestHandler,
} from "express-rate-limit";
import { getAuth } from "@clerk/express";
import type { Request } from "express";

function keyFromReq(req: Request): string {
  try {
    const auth = getAuth(req);
    if (auth.userId) return `user:${auth.userId}`;
  } catch {
    /* not authed */
  }
  return `ip:${ipKeyGenerator(req.ip ?? "")}`;
}

const standardHandler = (windowMs: number) => ({
  windowMs,
  standardHeaders: "draft-7" as const,
  legacyHeaders: false,
  keyGenerator: keyFromReq,
  message: {
    error: "rate_limit_exceeded",
    message:
      "Aap bahut tezi se requests bhej rahe hain. Kripya thodi der baad puna prayatna karein. / You are making requests too quickly. Please try again later.",
  },
});

export const aiHeavyLimiter: RateLimitRequestHandler = rateLimit({
  ...standardHandler(60 * 60 * 1000),
  limit: 20,
});

export const aiLightLimiter: RateLimitRequestHandler = rateLimit({
  ...standardHandler(60 * 60 * 1000),
  limit: 60,
});

export const generalLimiter: RateLimitRequestHandler = rateLimit({
  ...standardHandler(60 * 1000),
  limit: 120,
});

import type { RequestHandler } from "express";

export function postOnly(limiter: RateLimitRequestHandler): RequestHandler {
  return (req, res, next) =>
    req.method === "POST" ? limiter(req, res, next) : next();
}
