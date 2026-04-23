import { createHmac, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { ensureAdminUser, findAdminUserByEmail } from "../data/runtimeStore.ts";
import type { AdminUser } from "../types.ts";

const cookieName = "fell_admin_session";
const adminEmail = process.env.ADMIN_EMAIL ?? "admin@fellconcierge.local";
const adminPassword = process.env.ADMIN_PASSWORD ?? "fell-demo-admin";
const sessionSecret = process.env.SESSION_SECRET ?? "change-me-for-production";

const encode = (value: string) => Buffer.from(value, "utf8").toString("base64url");
const decode = (value: string) => Buffer.from(value, "base64url").toString("utf8");

export const hashPassword = (password: string) => {
  const salt = randomUUID();
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, storedHash: string) => {
  const [salt, expectedHash] = storedHash.split(":");
  if (!salt || !expectedHash) {
    return false;
  }
  const candidateHash = scryptSync(password, salt, 64).toString("hex");
  if (candidateHash.length !== expectedHash.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(candidateHash, "hex"), Buffer.from(expectedHash, "hex"));
};

const sign = (payload: string) => createHmac("sha256", sessionSecret).update(payload).digest("base64url");

const parseCookies = (request: IncomingMessage) =>
  Object.fromEntries(
    (request.headers.cookie ?? "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separatorIndex = part.indexOf("=");
        return [part.slice(0, separatorIndex), part.slice(separatorIndex + 1)];
      })
  );

export const ensureDefaultAdmin = () => {
  const adminUser: AdminUser = {
    id: "admin_default",
    email: adminEmail,
    password_hash: hashPassword(adminPassword),
    created_at: new Date().toISOString()
  };
  ensureAdminUser(adminUser);
};

export const authenticateAdmin = (email: string, password: string) => {
  const adminUser = findAdminUserByEmail(email);
  if (!adminUser) {
    return false;
  }
  return verifyPassword(password, adminUser.password_hash);
};

export const createSessionCookie = (email: string) => {
  const payload = `${email}|${Date.now()}`;
  const signature = sign(payload);
  return `${cookieName}=${encode(payload)}.${signature}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`;
};

export const clearSessionCookie = () => `${cookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;

export const isAdminAuthenticated = (request: IncomingMessage) => {
  const token = parseCookies(request)[cookieName];
  if (!token) {
    return false;
  }

  const [payloadToken, signature] = token.split(".");
  if (!payloadToken || !signature) {
    return false;
  }

  const payload = decode(payloadToken);
  const expectedSignature = sign(payload);
  if (signature.length !== expectedSignature.length) {
    return false;
  }
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return false;
  }

  const [email] = payload.split("|");
  return Boolean(findAdminUserByEmail(email));
};

export const requireAdmin = (request: IncomingMessage, response: ServerResponse) => {
  if (isAdminAuthenticated(request)) {
    return true;
  }
  response.writeHead(302, { Location: "/admin/login" });
  response.end();
  return false;
};
