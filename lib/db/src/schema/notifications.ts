import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Stores Web Push subscriptions per device so the server can deliver
// notifications even when the app is closed. A single user can have multiple
// subscriptions (phone + desktop) — each browser/device gets its own row.
export const pushSubscriptionsTable = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  // Hour and minute (0-23, 0-59) when the user wants the daily morning push,
  // interpreted in Asia/Kolkata. Default 7:00 AM IST.
  hour: integer("hour").notNull().default(7),
  minute: integer("minute").notNull().default(0),
  enabled: boolean("enabled").notNull().default(true),
  language: text("language").notNull().default("en"),
  lastSentDate: text("last_sent_date"), // YYYY-MM-DD in IST — prevents double-send
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSentDate: true,
});
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type PushSubscription = typeof pushSubscriptionsTable.$inferSelect;
