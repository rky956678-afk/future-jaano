import { languageInstruction } from "../lib/languages";
import { Router } from "express";
import { db, yogaTable, readingsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { openai } from "../lib/openai";

const router = Router();

async function generateYogaPlan(healthGoals: string, fitnessLevel: string, healthConditions: string, preferredDuration: number, language: string) {
  const { lang, instruction } = languageInstruction(language);
  const prompt = `You are a certified yoga and Ayurveda expert.

${instruction}

Create a personalized yoga plan.

Health Goals: ${healthGoals}
Fitness Level: ${fitnessLevel}
Health Conditions: ${healthConditions || "None mentioned"}
Preferred Duration: ${preferredDuration || 30} minutes per session

Return JSON (asana names like Surya Namaskar/Bhujangasana can stay in standard Sanskrit/transliteration, but all surrounding descriptions in ${lang}):
{
  "morningRoutine": "detailed morning yoga sequence with asana names",
  "eveningRoutine": "evening relaxation and yoga sequence",
  "meditation": "meditation technique suitable for their goals",
  "breathingExercises": "pranayama exercises with instructions",
  "dietaryAdvice": "Ayurvedic dietary suggestions",
  "weeklySchedule": "day-wise weekly schedule"
}

FINAL REMINDER: All explanatory text in ${lang}. ${instruction}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: instruction },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

// POST /api/yoga/suggestions
router.post("/yoga/suggestions", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const { healthGoals, fitnessLevel, healthConditions, preferredDuration, language } = req.body;

    if (!healthGoals || !fitnessLevel) {
      res.status(400).json({ error: "healthGoals and fitnessLevel are required" });
      return;
    }

    const aiResult = await generateYogaPlan(healthGoals, fitnessLevel, healthConditions || "", preferredDuration || 30, language || "en");

    const [yoga] = await db.insert(yogaTable).values({
      userId: dbUser.id,
      healthGoals,
      fitnessLevel,
      morningRoutine: aiResult.morningRoutine || "Surya Namaskar, Pranayama",
      eveningRoutine: aiResult.eveningRoutine || "Shavasana, gentle stretching",
      meditation: aiResult.meditation || "Mindfulness meditation",
      breathingExercises: aiResult.breathingExercises,
      dietaryAdvice: aiResult.dietaryAdvice,
      weeklySchedule: aiResult.weeklySchedule,
      language: language || "en",
    }).returning();

    await db.insert(readingsTable).values({
      userId: dbUser.id,
      type: "yoga",
      summary: `Personalized yoga plan for ${healthGoals}`,
      isPremium: false,
    });

    res.status(201).json({
      id: yoga.id, healthGoals: yoga.healthGoals, fitnessLevel: yoga.fitnessLevel,
      morningRoutine: yoga.morningRoutine, eveningRoutine: yoga.eveningRoutine,
      meditation: yoga.meditation, breathingExercises: yoga.breathingExercises ?? null,
      dietaryAdvice: yoga.dietaryAdvice ?? null, weeklySchedule: yoga.weeklySchedule ?? null,
      language: yoga.language, createdAt: yoga.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error generating yoga plan");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/yoga/plans/my
router.get("/yoga/plans/my", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const plans = await db.select().from(yogaTable).where(eq(yogaTable.userId, dbUser.id)).orderBy(desc(yogaTable.createdAt));
    res.json(plans.map(y => ({
      id: y.id, healthGoals: y.healthGoals, fitnessLevel: y.fitnessLevel,
      morningRoutine: y.morningRoutine, eveningRoutine: y.eveningRoutine,
      meditation: y.meditation, breathingExercises: y.breathingExercises ?? null,
      dietaryAdvice: y.dietaryAdvice ?? null, weeklySchedule: y.weeklySchedule ?? null,
      language: y.language, createdAt: y.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Error getting yoga plans");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
