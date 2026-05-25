import { Router } from "express";
import { db, subscriptionPlansTable, userSubscriptionsTable, paymentsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import crypto from "crypto";

const router = Router();

// GET /api/subscriptions/plans
router.get("/subscriptions/plans", async (req, res) => {
  try {
    const plans = await db.select().from(subscriptionPlansTable).orderBy(subscriptionPlansTable.price);
    res.json(plans.map(p => ({
      id: p.id, name: p.name, nameHindi: p.nameHindi ?? null,
      price: p.price, duration: p.duration, features: p.features,
      isPopular: p.isPopular, razorpayPlanId: p.razorpayPlanId ?? null,
    })));
  } catch (err) {
    req.log.error({ err }, "Error getting subscription plans");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/subscriptions/my
router.get("/subscriptions/my", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const [sub] = await db.select().from(userSubscriptionsTable)
      .where(eq(userSubscriptionsTable.userId, dbUser.id))
      .orderBy(desc(userSubscriptionsTable.createdAt))
      .limit(1);

    if (!sub) {
      res.status(404).json({ error: "No active subscription" });
      return;
    }

    res.json({
      id: sub.id, planName: sub.planName, status: sub.status,
      startDate: sub.startDate.toISOString(), endDate: sub.endDate.toISOString(),
      autoRenew: sub.autoRenew,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting subscription");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/payments/initiate
router.post("/payments/initiate", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const { planId, amount, currency } = req.body;

    if (!planId || !amount) {
      res.status(400).json({ error: "planId and amount are required" });
      return;
    }

    const [plan] = await db.select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.id, planId));
    if (!plan) { res.status(404).json({ error: "Plan not found" }); return; }

    // Create a mock order ID if Razorpay not configured
    const razorpayKey = process.env.RAZORPAY_KEY_ID;
    let orderId: string;

    if (razorpayKey && process.env.RAZORPAY_KEY_SECRET) {
      try {
        const Razorpay = (await import("razorpay")).default;
        const razorpay = new Razorpay({
          key_id: razorpayKey,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const order = await razorpay.orders.create({
          amount,
          currency: currency || "INR",
          notes: { planId: planId.toString(), userId: dbUser.id.toString() },
        });
        orderId = order.id;
      } catch {
        orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
    } else {
      orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    await db.insert(paymentsTable).values({
      userId: dbUser.id,
      planId,
      planName: plan.name,
      amount,
      currency: currency || "INR",
      status: "pending",
      razorpayOrderId: orderId,
    });

    res.status(201).json({
      orderId,
      amount,
      currency: currency || "INR",
      keyId: razorpayKey || "rzp_test_placeholder",
      notes: JSON.stringify({ planId, userId: dbUser.id }),
    });
  } catch (err) {
    req.log.error({ err }, "Error initiating payment");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/payments/verify
router.post("/payments/verify", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !planId) {
      res.status(400).json({ error: "Payment details are required" });
      return;
    }

    let isValid = true;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keySecret) {
      const body = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSignature = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
      isValid = expectedSignature === razorpaySignature;
    }

    if (!isValid) {
      res.status(400).json({ success: false, message: "Invalid payment signature" });
      return;
    }

    // Update payment record
    await db.update(paymentsTable).set({
      status: "success",
      razorpayPaymentId,
      razorpaySignature,
    }).where(eq(paymentsTable.razorpayOrderId, razorpayOrderId));

    // Get plan details and create subscription
    const [plan] = await db.select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.id, planId));
    if (!plan) { res.status(404).json({ success: false, message: "Plan not found" }); return; }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    const [subscription] = await db.insert(userSubscriptionsTable).values({
      userId: dbUser.id,
      planId: plan.id,
      planName: plan.name,
      status: "active",
      startDate: new Date(),
      endDate,
      autoRenew: false,
    }).returning();

    // Mark user as premium
    await db.update(usersTable).set({ isPremium: true }).where(eq(usersTable.id, dbUser.id));

    res.json({
      success: true,
      message: "Payment verified successfully. Premium access activated!",
      subscriptionId: subscription.id,
    });
  } catch (err) {
    req.log.error({ err }, "Error verifying payment");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/payments/history
router.get("/payments/history", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.userId, dbUser.id)).orderBy(desc(paymentsTable.createdAt));
    res.json(payments.map(p => ({
      id: p.id, amount: p.amount, currency: p.currency, status: p.status,
      planName: p.planName, razorpayOrderId: p.razorpayOrderId ?? null,
      createdAt: p.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Error getting payment history");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
