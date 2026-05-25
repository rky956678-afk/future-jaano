import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// GET /api/notifications
router.get("/notifications", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const notifications = await db.select().from(notificationsTable)
      .where(eq(notificationsTable.userId, dbUser.id))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(20);

    res.json(notifications.map(n => ({
      id: n.id, title: n.title, message: n.message,
      type: n.type, isRead: n.isRead, createdAt: n.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Error getting notifications");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/notifications/:id/read
router.patch("/notifications/:id/read", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const { isRead } = req.body;

    const [notification] = await db.update(notificationsTable)
      .set({ isRead: isRead ?? true })
      .where(eq(notificationsTable.id, id))
      .returning();

    if (!notification) { res.status(404).json({ error: "Not found" }); return; }

    res.json({
      id: notification.id, title: notification.title, message: notification.message,
      type: notification.type, isRead: notification.isRead, createdAt: notification.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error updating notification");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
