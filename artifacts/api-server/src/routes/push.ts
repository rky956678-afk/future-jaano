import { Router } from "express";
import { db, pushSubscriptionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { isPushConfigured, getPublicKey, sendPush } from "../lib/webPush";
import { getDailyHoroscopeBySign } from "./horoscope";
import { getTodayTip, getTipForLang } from "../lib/dailyTips";

const router = Router();

// GET /api/push/vapid-public-key  (no auth — public key is for subscription)
router.get("/push/vapid-public-key", (_req, res): void => {
  res.json({ publicKey: getPublicKey() });
});

// POST /api/push/subscribe
router.post("/push/subscribe", requireAuth, async (req, res): Promise<void> => {
  try {
    const dbUser = (req as any).dbUser;
    const { endpoint, keys, hour, minute, language, userAgent } = req.body || {};

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      res.status(400).json({ error: "Invalid subscription" });
      return;
    }

    const existing = await db
      .select()
      .from(pushSubscriptionsTable)
      .where(eq(pushSubscriptionsTable.endpoint, endpoint))
      .limit(1);

    // Authz: endpoints are unique per browser. If an endpoint exists but is
    // owned by a different user, reject — never silently rebind ownership.
    if (existing.length > 0 && existing[0]!.userId !== dbUser.id) {
      res.status(403).json({ ok: false, error: "Endpoint owned by another user" });
      return;
    }

    const values = {
      userId: dbUser.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      hour: typeof hour === "number" ? Math.max(0, Math.min(23, hour)) : 7,
      minute: typeof minute === "number" ? Math.max(0, Math.min(59, minute)) : 0,
      language: typeof language === "string" ? language : dbUser.language || "hi",
      userAgent: typeof userAgent === "string" ? userAgent.slice(0, 500) : null,
      enabled: true,
    };

    if (existing.length > 0) {
      await db
        .update(pushSubscriptionsTable)
        .set(values)
        .where(
          and(
            eq(pushSubscriptionsTable.endpoint, endpoint),
            eq(pushSubscriptionsTable.userId, dbUser.id),
          ),
        );
    } else {
      await db.insert(pushSubscriptionsTable).values(values);
    }

    res.json({ ok: true, message: "Subscription saved" });
  } catch (err) {
    req.log.error({ err }, "Error saving push subscription");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// POST /api/push/unsubscribe
router.post("/push/unsubscribe", requireAuth, async (req, res): Promise<void> => {
  try {
    const dbUser = (req as any).dbUser;
    const { endpoint } = req.body || {};
    if (!endpoint) {
      res.status(400).json({ error: "endpoint required" });
      return;
    }

    await db
      .delete(pushSubscriptionsTable)
      .where(
        and(
          eq(pushSubscriptionsTable.endpoint, endpoint),
          eq(pushSubscriptionsTable.userId, dbUser.id),
        ),
      );

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Error removing push subscription");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// PATCH /api/push/preferences
router.patch("/push/preferences", requireAuth, async (req, res): Promise<void> => {
  try {
    const dbUser = (req as any).dbUser;
    const { endpoint, hour, minute, language, enabled } = req.body || {};
    if (!endpoint) {
      res.status(400).json({ error: "endpoint required" });
      return;
    }

    const patch: Record<string, unknown> = {};
    if (typeof hour === "number") patch.hour = Math.max(0, Math.min(23, hour));
    if (typeof minute === "number") patch.minute = Math.max(0, Math.min(59, minute));
    if (typeof language === "string") patch.language = language;
    if (typeof enabled === "boolean") patch.enabled = enabled;

    await db
      .update(pushSubscriptionsTable)
      .set(patch)
      .where(
        and(
          eq(pushSubscriptionsTable.endpoint, endpoint),
          eq(pushSubscriptionsTable.userId, dbUser.id),
        ),
      );

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Error updating push preferences");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// POST /api/push/test — sends today's personalized push to all of user's devices.
router.post("/push/test", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!isPushConfigured()) {
      res.status(503).json({ ok: false, message: "Push not configured" });
      return;
    }
    const dbUser = (req as any).dbUser;
    const subs = await db
      .select()
      .from(pushSubscriptionsTable)
      .where(eq(pushSubscriptionsTable.userId, dbUser.id));

    if (subs.length === 0) {
      res.json({ ok: false, count: 0, message: "No subscriptions" });
      return;
    }

    let success = 0;
    for (const sub of subs) {
      const payload = buildPayload(
        sub.language,
        dbUser.zodiacSign || null,
      );
      const result = await sendPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload,
      );
      if (result.ok) success++;
      else if (result.expired) {
        await db
          .delete(pushSubscriptionsTable)
          .where(eq(pushSubscriptionsTable.endpoint, sub.endpoint));
      }
    }

    res.json({ ok: true, count: success, message: `Sent to ${success}/${subs.length} devices` });
  } catch (err) {
    req.log.error({ err }, "Error sending test push");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// Build a localized morning push payload from sign + today's tip.
export function buildPayload(lang: string, sign: string | null) {
  const isHi = lang !== "en";
  const greeting = isHi ? "सुप्रभात" : "Good Morning";
  const tip = getTipForLang(getTodayTip(), lang);

  let title = `🪷 ${greeting}`;
  let bodyParts: string[] = [];

  if (sign) {
    try {
      const horo = getDailyHoroscopeBySign(sign.toLowerCase(), isHi ? "hi" : "en");
      const signLabel = isHi ? horo.signHindi : horo.sign;
      title = isHi
        ? `🪷 ${greeting} — ${signLabel} राशि`
        : `🪷 ${greeting} — ${signLabel}`;
      bodyParts.push(horo.prediction);
    } catch {
      // fall through
    }
  }
  bodyParts.push(`${tip.title}\n${tip.message}`);

  return {
    title,
    body: bodyParts.join("\n\n"),
    url: "/horoscope",
    tag: "future-jaano-daily",
  };
}

export default router;
