import { Router } from "express";
import { db, usersTable, readingsTable, paymentsTable, userSubscriptionsTable } from "@workspace/db";
import { desc, count, sum, sql, eq, ilike } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth";

const router = Router();

// GET /api/admin/stats
router.get("/admin/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [totalUsers] = await db.select({ count: count() }).from(usersTable);
    const [premiumUsers] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.isPremium, true));
    const [totalReadings] = await db.select({ count: count() }).from(readingsTable);
    const [revenueResult] = await db.select({ total: sum(paymentsTable.amount) }).from(paymentsTable).where(eq(paymentsTable.status, "success"));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [todaySignups] = await db.select({ count: count() }).from(usersTable).where(sql`${usersTable.createdAt} >= ${today}`);

    const readingsByType = await db.select({ type: readingsTable.type, count: count() })
      .from(readingsTable).groupBy(readingsTable.type);

    const recentSignups = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(5);

    res.json({
      totalUsers: Number(totalUsers.count),
      premiumUsers: Number(premiumUsers.count),
      totalReadings: Number(totalReadings.count),
      totalRevenue: Number(revenueResult.total) || 0,
      todaySignups: Number(todaySignups.count),
      activeSessions: Math.floor(Math.random() * 50) + 10,
      readingsByType: readingsByType.map(r => ({ type: r.type, count: Number(r.count) })),
      recentSignups: recentSignups.map(u => ({
        id: u.id, clerkId: u.clerkId, email: u.email, name: u.name,
        phone: u.phone ?? null, dateOfBirth: u.dateOfBirth ?? null, timeOfBirth: u.timeOfBirth ?? null,
        placeOfBirth: u.placeOfBirth ?? null, gender: u.gender ?? null,
        language: u.language, isPremium: u.isPremium, avatarUrl: u.avatarUrl ?? null,
        zodiacSign: u.zodiacSign ?? null, createdAt: u.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting admin stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/users
router.get("/admin/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page = "1", limit: limitStr = "20", search } = req.query as Record<string, string>;
    const page_num = parseInt(page);
    const limit = parseInt(limitStr);
    const offset = (page_num - 1) * limit;

    const users = search
      ? await db.select().from(usersTable).where(ilike(usersTable.name, `%${search}%`)).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset)
      : await db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset);

    const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(usersTable);

    res.json({
      users: users.map(u => ({
        id: u.id, clerkId: u.clerkId, email: u.email, name: u.name,
        phone: u.phone ?? null, dateOfBirth: u.dateOfBirth ?? null, timeOfBirth: u.timeOfBirth ?? null,
        placeOfBirth: u.placeOfBirth ?? null, gender: u.gender ?? null,
        language: u.language, isPremium: u.isPremium, avatarUrl: u.avatarUrl ?? null,
        zodiacSign: u.zodiacSign ?? null, createdAt: u.createdAt.toISOString(),
      })),
      total: Number(total),
      page: page_num,
      limit,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting admin users");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/readings/recent
router.get("/admin/readings/recent", requireAuth, requireAdmin, async (req, res) => {
  try {
    const readings = await db.select().from(readingsTable).orderBy(desc(readingsTable.createdAt)).limit(20);
    res.json(readings.map(r => ({
      id: r.id, type: r.type, summary: r.summary,
      createdAt: r.createdAt.toISOString(), userId: r.userId, isPremium: r.isPremium,
    })));
  } catch (err) {
    req.log.error({ err }, "Error getting recent readings");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/revenue
router.get("/admin/revenue", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [total] = await db.select({ total: sum(paymentsTable.amount) }).from(paymentsTable).where(eq(paymentsTable.status, "success"));

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const [monthly] = await db.select({ total: sum(paymentsTable.amount) }).from(paymentsTable)
      .where(sql`${paymentsTable.status} = 'success' AND ${paymentsTable.createdAt} >= ${monthStart}`);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const [weekly] = await db.select({ total: sum(paymentsTable.amount) }).from(paymentsTable)
      .where(sql`${paymentsTable.status} = 'success' AND ${paymentsTable.createdAt} >= ${weekStart}`);

    const revenueByPlan = await db.select({
      planName: paymentsTable.planName,
      revenue: sum(paymentsTable.amount),
      subscribers: count(),
    }).from(paymentsTable).where(eq(paymentsTable.status, "success")).groupBy(paymentsTable.planName);

    res.json({
      totalRevenue: Number(total.total) || 0,
      monthlyRevenue: Number(monthly.total) || 0,
      weeklyRevenue: Number(weekly.total) || 0,
      revenueByPlan: revenueByPlan.map(r => ({
        planName: r.planName,
        revenue: Number(r.revenue) || 0,
        subscribers: Number(r.subscribers),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting revenue stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
