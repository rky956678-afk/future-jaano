import { Router } from "express";
import { db, pushSubscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { isPushConfigured, getPublicKey } from "../lib/webPush";

const router = Router();

// GET /api/push/vapid-key — public, no auth required
router.get("/push/vapid-key", (_req, res) => {
  if (!isPushConfigured()) {
    res.status(503).json({ error: "Push notifications are not configured on this server" });
    return;
  }
  res.json({ publicKey: getPublicKey() });
});

// POST /api/push/subscribe — register a push subscription
router.post("/push/subscribe", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const {
      endpoint,
      p256dh,
      auth,
      hour = 7,
      minute = 0,
      language = "en",
    } = req.body;

    if (!endpoint || !p256dh || !auth) {
      res.status(400).json({ error: "endpoint, p256dh, and auth are required" });
      return;
    }

    // Upsert: update if endpoint already exists, insert otherwise
    const existing = await db
      .select()
      .from(pushSubscriptionsTable)
      .where(eq(pushSubscriptionsTable.endpoint, endpoint))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(pushSubscriptionsTable)
        .set({ p256dh, auth, hour, minute, language, enabled: true, userId: dbUser.id })
        .where(eq(pushSubscriptionsTable.endpoint, endpoint));
      res.json({ success: true, message: "Push subscription updated" });
    } else {
      await db.insert(pushSubscriptionsTable).values({
        userId: dbUser.id,
        endpoint,
        p256dh,
        auth,
        hour,
        minute,
        language,
        enabled: true,
        userAgent: (req.headers["user-agent"] as string) ?? null,
      });
      res.status(201).json({ success: true, message: "Subscribed to push notifications" });
    }
  } catch (err) {
    req.log.error({ err }, "Error subscribing to push");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/push/unsubscribe — remove a push subscription
router.delete("/push/unsubscribe", requireAuth, async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      res.status(400).json({ error: "endpoint is required" });
      return;
    }

    await db
      .delete(pushSubscriptionsTable)
      .where(eq(pushSubscriptionsTable.endpoint, endpoint));

    res.json({ success: true, message: "Unsubscribed from push notifications" });
  } catch (err) {
    req.log.error({ err }, "Error unsubscribing from push");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/push/subscriptions — list all subscriptions for current user
router.get("/push/subscriptions", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const subscriptions = await db
      .select()
      .from(pushSubscriptionsTable)
      .where(eq(pushSubscriptionsTable.userId, dbUser.id));

    res.json(
      subscriptions.map((s) => ({
        id: s.id,
        endpoint: s.endpoint,
        hour: s.hour,
        minute: s.minute,
        enabled: s.enabled,
        language: s.language,
        createdAt: s.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Error getting push subscriptions");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/push/subscription — update schedule / preferences
router.patch("/push/subscription", requireAuth, async (req, res) => {
  try {
    const { endpoint, hour, minute, enabled, language } = req.body;
    if (!endpoint) {
      res.status(400).json({ error: "endpoint is required" });
      return;
    }

    const [updated] = await db
      .update(pushSubscriptionsTable)
      .set({
        ...(hour !== undefined && { hour }),
        ...(minute !== undefined && { minute }),
        ...(enabled !== undefined && { enabled }),
        ...(language !== undefined && { language }),
      })
      .where(eq(pushSubscriptionsTable.endpoint, endpoint))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Subscription not found" });
      return;
    }

    res.json({
      id: updated.id,
      endpoint: updated.endpoint,
      hour: updated.hour,
      minute: updated.minute,
      enabled: updated.enabled,
      language: updated.language,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error updating push subscription");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
