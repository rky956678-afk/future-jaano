import webpush from "web-push";
import { logger } from "./logger";

const publicKey = process.env["VAPID_PUBLIC_KEY"];
const privateKey = process.env["VAPID_PRIVATE_KEY"];
const subject = process.env["VAPID_SUBJECT"] || "mailto:admin@futurejaano.com";

let configured = false;

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  logger.info("Web Push: VAPID configured");
} else {
  logger.warn("Web Push: VAPID keys missing — push will be disabled");
}

export function isPushConfigured(): boolean {
  return configured;
}

export function getPublicKey(): string {
  return publicKey || "";
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export interface PushTarget {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendPush(
  target: PushTarget,
  payload: PushPayload,
): Promise<{ ok: boolean; statusCode?: number; expired?: boolean }> {
  if (!configured) return { ok: false };
  try {
    await webpush.sendNotification(
      {
        endpoint: target.endpoint,
        keys: { p256dh: target.p256dh, auth: target.auth },
      },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 12 },
    );
    return { ok: true };
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    const statusCode = e.statusCode;
    const expired = statusCode === 404 || statusCode === 410;
    if (!expired) {
      logger.warn({ err: e.message, statusCode }, "Web Push send failed");
    }
    return { ok: false, statusCode, expired };
  }
}

export default webpush;
