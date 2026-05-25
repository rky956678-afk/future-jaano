import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth"),
  timeOfBirth: text("time_of_birth"),
  placeOfBirth: text("place_of_birth"),
  gender: text("gender"),
  language: text("language").notNull().default("en"),
  isPremium: boolean("is_premium").notNull().default(false),
  avatarUrl: text("avatar_url"),
  zodiacSign: text("zodiac_sign"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
