import {
  createHash,
} from "node:crypto";

import { NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";

import { getClientIp } from "@/lib/security/request-context";

export interface RateLimitPolicy {
  scope: string;
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;

  limit: number;
  remaining: number;

  resetAt: Date;
  retryAfterSeconds: number;
}

interface ConsumeRateLimitInput {
  policy: RateLimitPolicy;
  identifier: string;
}

export const RATE_LIMIT_POLICIES = {
  login: {
    scope: "auth:login",
    limit: 5,
    windowSeconds: 15 * 60,
  },

  register: {
    scope: "auth:register",
    limit: 5,
    windowSeconds: 60 * 60,
  },

  orderCreation: {
    scope: "order:create",
    limit: 10,
    windowSeconds: 10 * 60,
  },

  adminMutation: {
    scope: "admin:mutation",
    limit: 60,
    windowSeconds: 5 * 60,
  },
} satisfies Record<
  string,
  RateLimitPolicy
>;

function createIdentifierHash(
  identifier: string,
): string {
  return createHash("sha256")
    .update(identifier)
    .digest("hex");
}

function getWindowStart(
  now: Date,
  windowSeconds: number,
): Date {
  const windowMilliseconds =
    windowSeconds * 1000;

  const windowStartMilliseconds =
    Math.floor(
      now.getTime() /
        windowMilliseconds,
    ) * windowMilliseconds;

  return new Date(
    windowStartMilliseconds,
  );
}

async function removeExpiredBuckets(
  now: Date,
): Promise<void> {
  try {
    await prisma.rateLimitBucket.deleteMany(
      {
        where: {
          expiresAt: {
            lt: now,
          },
        },
      },
    );
  } catch (error) {
    console.error(
      "Rate limit cleanup error:",
      error,
    );
  }
}

export async function consumeRateLimit({
  policy,
  identifier,
}: ConsumeRateLimitInput): Promise<RateLimitResult> {
  const now = new Date();

  const windowStart = getWindowStart(
    now,
    policy.windowSeconds,
  );

  const resetAt = new Date(
    windowStart.getTime() +
      policy.windowSeconds * 1000,
  );

  const identifierHash =
    createIdentifierHash(identifier);

  const bucketKey = [
    policy.scope,
    identifierHash,
    windowStart.getTime(),
  ].join(":");

  const bucket =
    await prisma.rateLimitBucket.upsert({
      where: {
        key: bucketKey,
      },

      create: {
        key: bucketKey,
        count: 1,
        windowStart,
        expiresAt: resetAt,
      },

      update: {
        count: {
          increment: 1,
        },

        expiresAt: resetAt,
      },
    });

  if (Math.random() < 0.02) {
    void removeExpiredBuckets(now);
  }

  const allowed =
    bucket.count <= policy.limit;

  const remaining = Math.max(
    0,
    policy.limit - bucket.count,
  );

  const retryAfterSeconds =
    Math.max(
      1,
      Math.ceil(
        (resetAt.getTime() -
          now.getTime()) /
          1000,
      ),
    );

  return {
    allowed,
    limit: policy.limit,
    remaining,
    resetAt,
    retryAfterSeconds,
  };
}

export async function consumeRequestRateLimit(
  request: Request,
  policy: RateLimitPolicy,
  subject?: string,
): Promise<RateLimitResult> {
  const clientIp = getClientIp(request);

  const identifier = subject
    ? `${clientIp}:${subject}`
    : clientIp;

  return consumeRateLimit({
    policy,
    identifier,
  });
}

export function getRateLimitHeaders(
  result: RateLimitResult,
): HeadersInit {
  return {
    "X-RateLimit-Limit":
      String(result.limit),

    "X-RateLimit-Remaining":
      String(result.remaining),

    "X-RateLimit-Reset":
      String(
        Math.ceil(
          result.resetAt.getTime() /
            1000,
        ),
      ),
  };
}

export function createRateLimitResponse(
  result: RateLimitResult,
): NextResponse {
  return NextResponse.json(
    {
      success: false,

      message:
        "Too many requests. Please try again later.",

      data: {
        retryAfterSeconds:
          result.retryAfterSeconds,

        resetAt:
          result.resetAt.toISOString(),
      },
    },
    {
      status: 429,

      headers: {
        ...getRateLimitHeaders(result),

        "Retry-After": String(
          result.retryAfterSeconds,
        ),
      },
    },
  );
}