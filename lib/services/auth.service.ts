import {
  Prisma,
  UserRole,
} from "@/generated/prisma/client";

import {
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password";

import prisma from "@/lib/db/prisma";

import type {
  LoginInput,
  RegisterInput,
} from "@/schemas/auth.schema";

import type { AuthUser } from "@/types/auth";

const authUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

type AuthUserRecord = Prisma.UserGetPayload<{
  select: typeof authUserSelect;
}>;

export class EmailAlreadyExistsError extends Error {
  constructor() {
    super("An account with this email already exists.");
    this.name = "EmailAlreadyExistsError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password.");
    this.name = "InvalidCredentialsError";
  }
}

export class AccountDisabledError extends Error {
  constructor() {
    super("This account has been disabled.");
    this.name = "AccountDisabledError";
  }
}

export class InvalidSessionError extends Error {
  constructor() {
    super("Your session is no longer valid.");
    this.name = "InvalidSessionError";
  }
}

function serializeAuthUser(
  user: AuthUserRecord,
): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function isUniqueConstraintError(
  error: unknown,
): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function registerUser(
  input: RegisterInput,
): Promise<AuthUser> {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    throw new EmailAlreadyExistsError();
  }

  const passwordHash = await hashPassword(
    input.password,
  );

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: UserRole.USER,
        isActive: true,

        cart: {
          create: {},
        },
      },
      select: authUserSelect,
    });

    return serializeAuthUser(user);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new EmailAlreadyExistsError();
    }

    throw error;
  }
}

export async function authenticateUser(
  input: LoginInput,
): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
    select: {
      ...authUserSelect,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new InvalidCredentialsError();
  }

  const passwordIsValid = await verifyPassword(
    input.password,
    user.passwordHash,
  );

  if (!passwordIsValid) {
    throw new InvalidCredentialsError();
  }

  if (!user.isActive) {
    throw new AccountDisabledError();
  }

  return serializeAuthUser(user);
}

export async function getAuthenticatedUser(
  userId: string,
): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: authUserSelect,
  });

  if (!user || !user.isActive) {
    throw new InvalidSessionError();
  }

  return serializeAuthUser(user);
}