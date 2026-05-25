import { Router } from "express";
import { db, usersTable, readingsTable, notificationsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getDailyHoroscopeBySign } from "./horoscope";

const router = Router();

// GET /api/users/me
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
      createdAt: dbUser.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting user profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/users/me
router.patch("/users/me", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const { name, phone, dateOfBirth, timeOfBirth, placeOfBirth, gender, language, zodiacSign } = req.body;

    const [updated] = await db.update(usersTable)
      .set({
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(dateOfBirth !== undefined && { dateOfBirth }),
        ...(timeOfBirth !== undefined && { timeOfBirth }),
        ...(placeOfBirth !== undefined && { placeOfBirth }),
        ...(gender !== undefined && { gender }),
        ...(language && { language }),
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
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error updating user profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/me/dashboard
router.get("/users/me/dashboard", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;

    const [readingCount] = await db.select({ count: count() }).from(readingsTable).where(eq(readingsTable.userId, dbUser.id));
    const recentReadings = await db.select().from(readingsTable).where(eq(readingsTable.userId, dbUser.id)).orderBy(desc(readingsTable.createdAt)).limit(5);
    const [unreadCount] = await db.select({ count: count() }).from(notificationsTable).where(eq(notificationsTable.userId, dbUser.id));

    const zodiacSign = dbUser.zodiacSign || "aries";
    let todayHoroscope;
    try {
      todayHoroscope = getDailyHoroscopeBySign(zodiacSign.toLowerCase());
    } catch {
      todayHoroscope = getDefaultHoroscope(zodiacSign);
    }

    res.json({
      totalReadings: Number(readingCount.count),
      todayHoroscope,
      activeSubscription: dbUser.isPremium ? "premium" : null,
      recentActivity: recentReadings.map(r => ({
        id: r.id,
        type: r.type,
        summary: r.summary,
        createdAt: r.createdAt.toISOString(),
        userId: r.userId,
        isPremium: r.isPremium,
      })),
      zodiacSign: dbUser.zodiacSign ?? null,
      unreadNotifications: Number(unreadCount.count),
      memberSince: dbUser.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting dashboard");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/me/readings
router.get("/users/me/readings", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const readings = await db.select().from(readingsTable).where(eq(readingsTable.userId, dbUser.id)).orderBy(desc(readingsTable.createdAt));

    res.json(readings.map(r => ({
      id: r.id,
      type: r.type,
      summary: r.summary,
      createdAt: r.createdAt.toISOString(),
      userId: r.userId,
      isPremium: r.isPremium,
    })));
  } catch (err) {
    req.log.error({ err }, "Error getting readings");
    res.status(500).json({ error: "Internal server error" });
  }
});

function getDefaultHoroscope(sign: string) {
  return {
    sign,
    signHindi: null,
    date: new Date().toISOString().split("T")[0],
    prediction: "Today is a favorable day for new beginnings. Trust your instincts and take action.",
    health: "Focus on balanced nutrition and adequate rest.",
    career: "Professional opportunities may arise. Stay alert and prepared.",
    love: "Communication is key in relationships today.",
    finance: "Financial stability is within reach with careful planning.",
    luckyColor: "Gold",
    luckyNumber: 7,
    luckyGem: "Yellow Sapphire",
    compatibility: "Libra",
    rating: 4,
    emoji: "⭐",
  };
}

export default router;
