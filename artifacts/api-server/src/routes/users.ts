import { Router } from "express";
import { db, usersTable, readingsTable, userSubscriptionsTable, notificationsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// GET /api/users/me — get current user's profile
router.get("/users/me", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    res.json({
      id: dbUser.id,
      clerkId: dbUser.clerkId,
      email: dbUser.email,
      name: dbUser.name,
      phone: dbUser.phone ?? null,
      dateOfBirth: dbUser.dateOfBirth ?? null,
      timeOfBirth: dbUser.timeOfBirth ?? null,
      placeOfBirth: dbUser.placeOfBirth ?? null,
      gender: dbUser.gender ?? null,
      language: dbUser.language,
      isPremium: dbUser.isPremium,
      avatarUrl: dbUser.avatarUrl ?? null,
      zodiacSign: dbUser.zodiacSign ?? null,
      isAdmin: dbUser.isAdmin,
      createdAt: dbUser.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting user profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/users/me — update current user's profile
router.patch("/users/me", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const {
      name,
      phone,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      gender,
      language,
      avatarUrl,
      zodiacSign,
    } = req.body;

    const [updated] = await db
      .update(usersTable)
      .set({
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(dateOfBirth !== undefined && { dateOfBirth }),
        ...(timeOfBirth !== undefined && { timeOfBirth }),
        ...(placeOfBirth !== undefined && { placeOfBirth }),
        ...(gender !== undefined && { gender }),
        ...(language !== undefined && { language }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(zodiacSign !== undefined && { zodiacSign }),
      })
      .where(eq(usersTable.id, dbUser.id))
      .returning();

    res.json({
      id: updated.id,
      clerkId: updated.clerkId,
      email: updated.email,
      name: updated.name,
      phone: updated.phone ?? null,
      dateOfBirth: updated.dateOfBirth ?? null,
      timeOfBirth: updated.timeOfBirth ?? null,
      placeOfBirth: updated.placeOfBirth ?? null,
      gender: updated.gender ?? null,
      language: updated.language,
      isPremium: updated.isPremium,
      avatarUrl: updated.avatarUrl ?? null,
      zodiacSign: updated.zodiacSign ?? null,
      isAdmin: updated.isAdmin,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error updating user profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/me/dashboard — DashboardSummary for the home page
router.get("/users/me/dashboard", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;

    // Total readings count
    const [readingsCount] = await db
      .select({ count: count() })
      .from(readingsTable)
      .where(eq(readingsTable.userId, dbUser.id));

    // Recent activity (last 5 readings)
    const recentReadings = await db
      .select()
      .from(readingsTable)
      .where(eq(readingsTable.userId, dbUser.id))
      .orderBy(desc(readingsTable.createdAt))
      .limit(5);

    // Active subscription
    const activeSub = await db
      .select()
      .from(userSubscriptionsTable)
      .where(eq(userSubscriptionsTable.userId, dbUser.id))
      .orderBy(desc(userSubscriptionsTable.startDate))
      .limit(1);

    // Unread notifications count
    const [unreadCount] = await db
      .select({ count: count() })
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, dbUser.id));

    res.json({
      totalReadings:       Number(readingsCount.count),
      todayHoroscope:      null, // populated by frontend from /api/horoscope/daily/:sign
      activeSubscription:  activeSub.length > 0 ? activeSub[0].planName : null,
      recentActivity:      recentReadings.map((r) => ({
        id:        r.id,
        type:      r.type,
        summary:   r.summary,
        isPremium: r.isPremium,
        createdAt: r.createdAt.toISOString(),
      })),
      zodiacSign:          dbUser.zodiacSign ?? null,
      unreadNotifications: Number(unreadCount.count),
      memberSince:         dbUser.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting user dashboard");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/me/readings — get current user's reading history
router.get("/users/me/readings", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const readings = await db
      .select()
      .from(readingsTable)
      .where(eq(readingsTable.userId, dbUser.id))
      .orderBy(desc(readingsTable.createdAt))
      .limit(50);

    res.json(
      readings.map((r) => ({
        id: r.id,
        type: r.type,
        summary: r.summary,
        isPremium: r.isPremium,
        createdAt: r.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Error getting user readings");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
