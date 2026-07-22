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
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isAllowedOrigin(
  request: NextRequest,
  origin: string,
): boolean {
  if (
    origin === request.nextUrl.origin
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
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );

  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
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
    request.method === "OPTIONS"
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

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};