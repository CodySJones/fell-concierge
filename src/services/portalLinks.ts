import { createHmac, timingSafeEqual } from "node:crypto";

const tokenSecret = process.env.PORTAL_LINK_SECRET ?? process.env.SESSION_SECRET ?? "change-me-for-production";
const defaultTtlDays = Number(process.env.PORTAL_LINK_TTL_DAYS ?? 30);

interface PortalLinkPayload {
  clientId: string;
  email: string;
  expiresAt: number;
}

const sign = (payload: string) => createHmac("sha256", tokenSecret).update(payload).digest("base64url");

export const createPortalToken = (clientId: string, email: string, ttlDays = defaultTtlDays) => {
  const payload: PortalLinkPayload = {
    clientId,
    email: email.trim().toLowerCase(),
    expiresAt: Date.now() + ttlDays * 24 * 60 * 60 * 1000
  };
  const json = JSON.stringify(payload);
  return `${Buffer.from(json, "utf8").toString("base64url")}.${sign(json)}`;
};

export const decodePortalToken = (token: string): PortalLinkPayload | null => {
  const [payloadToken, signature] = token.split(".");
  if (!payloadToken || !signature) {
    return null;
  }

  try {
    const json = Buffer.from(payloadToken, "base64url").toString("utf8");
    const expectedSignature = sign(json);
    if (signature.length !== expectedSignature.length) {
      return null;
    }
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(json) as PortalLinkPayload;
    if (!payload.clientId || !payload.email || !payload.expiresAt || payload.expiresAt < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

