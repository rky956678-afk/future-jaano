import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const readingsTable = pgTable("readings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // kundli, horoscope, vastu, palm, face, numerology, yoga, problem
  summary: text("summary").notNull(),
  isPremium: boolean("is_premium").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReadingSchema = createInsertSchema(readingsTable).omit({ id: true, createdAt: true });
export type InsertReading = z.infer<typeof insertReadingSchema>;
export type Reading = typeof readingsTable.$inferSelect;

export const kundliTable = pgTable("kundli_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  timeOfBirth: text("time_of_birth").notNull(),
  placeOfBirth: text("place_of_birth").notNull(),
  sunSign: text("sun_sign").notNull(),
  moonSign: text("moon_sign").notNull(),
  ascendant: text("ascendant").notNull(),
  analysis: text("analysis").notNull(),
  planetaryPositions: text("planetary_positions"),
  doshas: text("doshas"),
  remedies: text("remedies"),
  manglikStatus: text("manglik_status"),
  luckyStone: text("lucky_stone"),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertKundliSchema = createInsertSchema(kundliTable).omit({ id: true, createdAt: true });
export type InsertKundli = z.infer<typeof insertKundliSchema>;
export type Kundli = typeof kundliTable.$inferSelect;

export const problemsTable = pgTable("problem_solutions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  remedies: text("remedies").notNull(),
  lalKitabRemedy: text("lal_kitab_remedy"),
  atharvavedaRemedy: text("atharvaveda_remedy"),
  yogPradeepamRemedy: text("yog_pradeepam_remedy"),
  vastuRemedy: text("vastu_remedy"),
  mantra: text("mantra"),
  gemstone: text("gemstone"),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProblemSchema = createInsertSchema(problemsTable).omit({ id: true, createdAt: true });
export type InsertProblem = z.infer<typeof insertProblemSchema>;
export type Problem = typeof problemsTable.$inferSelect;

export const vastuTable = pgTable("vastu_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  roomType: text("room_type").notNull(),
  overallScore: integer("overall_score").notNull(),
  findings: text("findings").notNull(),
  remedies: text("remedies").notNull(),
  positiveAspects: text("positive_aspects"),
  negativeAspects: text("negative_aspects"),
  colorRecommendations: text("color_recommendations"),
  directionAnalysis: text("direction_analysis"),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVastuSchema = createInsertSchema(vastuTable).omit({ id: true, createdAt: true });
export type InsertVastu = z.infer<typeof insertVastuSchema>;
export type Vastu = typeof vastuTable.$inferSelect;

export const palmTable = pgTable("palm_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  lifeLine: text("life_line").notNull(),
  heartLine: text("heart_line").notNull(),
  headLine: text("head_line").notNull(),
  fateLine: text("fate_line"),
  sunLine: text("sun_line"),
  analysis: text("analysis").notNull(),
  longevityPrediction: text("longevity_prediction"),
  careerPrediction: text("career_prediction"),
  lovePrediction: text("love_prediction"),
  fortunePrediction: text("fortune_prediction"),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPalmSchema = createInsertSchema(palmTable).omit({ id: true, createdAt: true });
export type InsertPalm = z.infer<typeof insertPalmSchema>;
export type Palm = typeof palmTable.$inferSelect;

export const faceTable = pgTable("face_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  faceShape: text("face_shape").notNull(),
  eyeAnalysis: text("eye_analysis").notNull(),
  noseAnalysis: text("nose_analysis").notNull(),
  lipsAnalysis: text("lips_analysis"),
  foreheadAnalysis: text("forehead_analysis"),
  analysis: text("analysis").notNull(),
  personalityTraits: text("personality_traits"),
  fortunePrediction: text("fortune_prediction"),
  healthIndicators: text("health_indicators"),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFaceSchema = createInsertSchema(faceTable).omit({ id: true, createdAt: true });
export type InsertFace = z.infer<typeof insertFaceSchema>;
export type Face = typeof faceTable.$inferSelect;

export const numerologyTable = pgTable("numerology_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fullName: text("full_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  lifePathNumber: integer("life_path_number").notNull(),
  destinyNumber: integer("destiny_number").notNull(),
  soulUrgeNumber: integer("soul_urge_number"),
  personalityNumber: integer("personality_number"),
  birthdayNumber: integer("birthday_number"),
  analysis: text("analysis").notNull(),
  strengths: text("strengths"),
  challenges: text("challenges"),
  luckyYears: text("lucky_years"),
  compatibleNumbers: text("compatible_numbers"),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertNumerologySchema = createInsertSchema(numerologyTable).omit({ id: true, createdAt: true });
export type InsertNumerology = z.infer<typeof insertNumerologySchema>;
export type Numerology = typeof numerologyTable.$inferSelect;

export const yogaTable = pgTable("yoga_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  healthGoals: text("health_goals").notNull(),
  fitnessLevel: text("fitness_level").notNull(),
  morningRoutine: text("morning_routine").notNull(),
  eveningRoutine: text("evening_routine").notNull(),
  meditation: text("meditation").notNull(),
  breathingExercises: text("breathing_exercises"),
  dietaryAdvice: text("dietary_advice"),
  weeklySchedule: text("weekly_schedule"),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertYogaSchema = createInsertSchema(yogaTable).omit({ id: true, createdAt: true });
export type InsertYoga = z.infer<typeof insertYogaSchema>;
export type Yoga = typeof yogaTable.$inferSelect;
