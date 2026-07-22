import {
  NextRequest,
  NextResponse,
} from "next/server";

const SESSION_COOKIE_NAME =
  "nova_session";

const PROTECTED_PAGE_PREFIXES = [
  "/admin",
  "/profile",
  "/orders",
  "/checkout",
  "/cart",
];

const PRIVATE_API_PREFIXES = [
  "/api/auth",
  "/api/cart",
  "/api/orders",
  "/api/admin",
  "/api/inventory",
];

const UNSAFE_HTTP_METHODS =
  new Set([
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
  ]);

const CORS_ALLOWED_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
].join(", ");

const CORS_ALLOWED_HEADERS = [
  "Content-Type",
  "Authorization",
  "X-Requested-With",
].join(", ");

function getConfiguredOrigins(): string[] {
  return (
    process.env
      .CORS_ALLOWED_ORIGINS ?? ""
  )
    .split(",")
    .map(
      (origin) =>
        origin.trim(),
    )
    .filter(Boolean);
}

function isAllowedOrigin(
  request: NextRequest,
  origin: string,
): boolean {
  if (
    origin ===
    request.nextUrl.origin
  ) {
    return true;
  }

  return getConfiguredOrigins().includes(
    origin,
  );
}

function addCorsHeaders(
  response: NextResponse,
  origin: string,
): void {
  response.headers.set(
    "Access-Control-Allow-Origin",
    origin,
  );

  response.headers.set(
    "Access-Control-Allow-Credentials",
    "true",
  );

  response.headers.set(
    "Access-Control-Allow-Methods",
    CORS_ALLOWED_METHODS,
  );

  response.headers.set(
    "Access-Control-Allow-Headers",
    CORS_ALLOWED_HEADERS,
  );

  response.headers.set(
    "Access-Control-Max-Age",
    "86400",
  );

  response.headers.append(
    "Vary",
    "Origin",
  );
}

function addSecurityHeaders(
  response: NextResponse,
): void {
  response.headers.set(
    "X-Content-Type-Options",
    "nosniff",
  );

  response.headers.set(
    "X-Frame-Options",
    "DENY",
  );

  response.headers.set(
    "X-DNS-Prefetch-Control",
    "off",
  );

  response.headers.set(
    "X-Permitted-Cross-Domain-Policies",
    "none",
  );

  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );

  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  response.headers.set(
    "Cross-Origin-Opener-Policy",
    "same-origin",
  );

  if (
    process.env.NODE_ENV ===
    "production"
  ) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }
}

function isProtectedPage(
  pathname: string,
): boolean {
  return PROTECTED_PAGE_PREFIXES.some(
    (prefix) =>
      pathname === prefix ||
      pathname.startsWith(
        `${prefix}/`,
      ),
  );
}

function isPrivateApi(
  pathname: string,
): boolean {
  return PRIVATE_API_PREFIXES.some(
    (prefix) =>
      pathname === prefix ||
      pathname.startsWith(
        `${prefix}/`,
      ),
  );
}

function isCrossSiteMutation(
  request: NextRequest,
): boolean {
  if (
    !UNSAFE_HTTP_METHODS.has(
      request.method,
    )
  ) {
    return false;
  }

  return (
    request.headers.get(
      "sec-fetch-site",
    ) === "cross-site"
  );
}

function applyPrivateCachePolicy(
  response: NextResponse,
  pathname: string,
): void {
  if (isPrivateApi(pathname)) {
    response.headers.set(
      "Cache-Control",
      "private, no-store",
    );
  }
}

export function proxy(
  request: NextRequest,
) {
  const pathname =
    request.nextUrl.pathname;

  const isApiRequest =
    pathname.startsWith("/api/");

  const origin =
    request.headers.get("origin");

  if (
    isApiRequest &&
    isCrossSiteMutation(request)
  ) {
    const response =
      NextResponse.json(
        {
          success: false,

          message:
            "Cross-site API mutations are not permitted.",
        },
        {
          status: 403,
        },
      );

    addSecurityHeaders(response);

    return response;
  }

  if (
    isApiRequest &&
    origin &&
    !isAllowedOrigin(
      request,
      origin,
    )
  ) {
    const response =
      NextResponse.json(
        {
          success: false,

          message:
            "This origin is not permitted to access the API.",
        },
        {
          status: 403,
        },
      );

    addSecurityHeaders(response);

    return response;
  }

  if (
    isApiRequest &&
    request.method ===
      "OPTIONS"
  ) {
    const response =
      new NextResponse(null, {
        status: 204,
      });

    if (origin) {
      addCorsHeaders(
        response,
        origin,
      );
    }

    addSecurityHeaders(response);

    applyPrivateCachePolicy(
      response,
      pathname,
    );

    return response;
  }

  if (
    !isApiRequest &&
    isProtectedPage(pathname) &&
    !request.cookies.has(
      SESSION_COOKIE_NAME,
    )
  ) {
    const loginUrl =
      new URL(
        "/login",
        request.url,
      );

    loginUrl.searchParams.set(
      "next",
      `${pathname}${request.nextUrl.search}`,
    );

    const response =
      NextResponse.redirect(
        loginUrl,
      );

    addSecurityHeaders(response);

    return response;
  }

  const response =
    NextResponse.next();

  if (
    isApiRequest &&
    origin
  ) {
    addCorsHeaders(
      response,
      origin,
    );
  }

  addSecurityHeaders(response);

  applyPrivateCachePolicy(
    response,
    pathname,
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};