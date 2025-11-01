import { createHmac, randomBytes } from "node:crypto";

import { cookies } from "next/headers";

const COOKIE_NAME = "sid";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET ausente");
  return secret;
}

function base64url(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest();
}

export type SessionData = {
  sid: string; // id aleatório da sessão
  email: string; // email do usuário
  name?: string; // opcional
};

export async function setSession(data: SessionData) {
  const payload = JSON.stringify({ ...data });
  const sig = sign(payload);
  const value = `${base64url(Buffer.from(payload))}.${base64url(sig)}`;

  (await cookies()).set({
    name: COOKIE_NAME,
    value,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<SessionData | null> {
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const [payloadB64, sigB64] = raw.split(".");
  if (!payloadB64 || !sigB64) return null;

  const payload = Buffer.from(
    payloadB64.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString("utf8");
  const expected = base64url(sign(payload));
  if (expected !== sigB64) return null;

  try {
    const parsed = JSON.parse(payload) as SessionData;
    if (!parsed?.sid || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function clearSession() {
  (await cookies()).set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function rotateSession(current: SessionData) {
  await setSession({ ...current, sid: randomBytes(16).toString("hex") });
}
