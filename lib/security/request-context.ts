export interface RequestContext {
  ipAddress: string | null;
  userAgent: string | null;
}

function normalizeHeaderValue(
  value: string | null,
): string | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue || null;
}

export function getClientIp(
  request: Request,
): string {
  const forwardedFor =
    request.headers.get(
      "x-forwarded-for",
    );

  if (forwardedFor) {
    const firstIp =
      forwardedFor
        .split(",")[0]
        ?.trim();

    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = normalizeHeaderValue(
    request.headers.get("x-real-ip"),
  );

  if (realIp) {
    return realIp;
  }

  const vercelForwardedFor =
    normalizeHeaderValue(
      request.headers.get(
        "x-vercel-forwarded-for",
      ),
    );

  if (vercelForwardedFor) {
    return vercelForwardedFor;
  }

  return "unknown";
}

export function getRequestContext(
  request: Request,
): RequestContext {
  const ipAddress = getClientIp(request);

  return {
    ipAddress:
      ipAddress === "unknown"
        ? null
        : ipAddress,

    userAgent:
      normalizeHeaderValue(
        request.headers.get(
          "user-agent",
        ),
      ),
  };
}