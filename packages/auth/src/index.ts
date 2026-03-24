import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

export type SessionSurface = "admin" | "user";
export type SessionRole = "tenant_admin" | "super_admin" | "project_manager" | "project_member";

export interface SessionTokenPayload {
  sub: string;
  tenantId: string;
  tenantCode: string;
  loginId: string;
  sessionId: string;
  tokenVersion: number;
  surface: SessionSurface;
  roles: SessionRole[];
  projectIds: string[];
  iat: number;
  exp: number;
}

const DEFAULT_AUTH_SECRET = "psilo-dev-secret";
const DEFAULT_PASSWORD_SALT = "psilo-dev-password-salt";

function getAuthSecret(secret?: string) {
  return secret ?? process.env.AUTH_SECRET ?? DEFAULT_AUTH_SECRET;
}

function getPasswordSalt(salt?: string) {
  return salt ?? process.env.PASSWORD_SALT ?? DEFAULT_PASSWORD_SALT;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlEncodeBuffer(value: Buffer) {
  return value.toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function hashPassword(password: string, salt?: string) {
  return scryptSync(password, getPasswordSalt(salt), 32).toString("hex");
}

export function verifyPassword(password: string, hashedPassword: string, salt?: string) {
  const actual = Buffer.from(hashPassword(password, salt), "hex");
  const expected = Buffer.from(hashedPassword, "hex");

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}

export function signSessionToken(payload: SessionTokenPayload, secret?: string) {
  const header = {
    alg: "HS256",
    typ: "PSILO",
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac("sha256", getAuthSecret(secret))
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();

  return `${encodedHeader}.${encodedPayload}.${base64UrlEncodeBuffer(signature)}`;
}

export function verifySessionToken(token: string, secret?: string): SessionTokenPayload {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error("Malformed token");
  }

  const expectedSignature = createHmac("sha256", getAuthSecret(secret))
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();
  const actualSignature = Buffer.from(encodedSignature, "base64url");

  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    throw new Error("Invalid signature");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionTokenPayload;

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return payload;
}

export function createSessionPayload(
  overrides: Omit<SessionTokenPayload, "iat" | "exp">,
  expiresInSeconds = 60 * 60,
): SessionTokenPayload {
  const issuedAt = Math.floor(Date.now() / 1000);

  return {
    ...overrides,
    iat: issuedAt,
    exp: issuedAt + expiresInSeconds,
  };
}
