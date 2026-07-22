import {
  jwtVerify,
  SignJWT,
} from "jose";

import type {
  AuthSession,
  UserRole,
  VerifiedAuthSession,
} from "@/types/auth";

const JWT_ISSUER =
  "nova-enterprise-platform";

const JWT_AUDIENCE =
  "nova-platform-users";

type TokenLifetime =
  | "1d"
  | "7d";

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET;

  if (
    !secret ||
    secret ===
      "replace-with-a-secure-secret" ||
    secret.length < 32
  ) {
    throw new Error(
      "JWT_SECRET must be defined and contain at least 32 characters.",
    );
  }

  return new TextEncoder().encode(
    secret,
  );
}

function isUserRole(
  value: unknown,
): value is UserRole {
  return (
    value === "USER" ||
    value === "ADMIN"
  );
}

export async function createSessionToken(
  session: AuthSession,
  rememberMe: boolean,
): Promise<string> {
  const expiresIn: TokenLifetime =
    rememberMe ? "7d" : "1d";

  return new SignJWT({
    email: session.email,
    role: session.role,
    rememberMe,
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setSubject(session.userId)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<VerifiedAuthSession | null> {
  try {
    const { payload } =
      await jwtVerify(
        token,
        getJwtSecret(),
        {
          issuer: JWT_ISSUER,
          audience: JWT_AUDIENCE,

          algorithms: [
            "HS256",
          ],
        },
      );

    if (
      !payload.sub ||
      typeof payload.email !==
        "string" ||
      !isUserRole(payload.role) ||
      typeof payload.iat !==
        "number" ||
      typeof payload.exp !==
        "number"
    ) {
      return null;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,

      rememberMe:
        payload.rememberMe === true,

      issuedAt: payload.iat,
      expiresAt: payload.exp,
    };
  } catch {
    return null;
  }
}