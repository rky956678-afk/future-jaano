import { languageInstruction } from "../lib/languages";
import { Router } from "express";
import { db, problemsTable, readingsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { aiJson } from "../lib/openai";
import { fallbackProblems } from "../lib/fallbacks";

const router = Router();

async function generateRemedies(description: string, category: string, language: string) {
  const { lang, instruction } = languageInstruction(language);
  const prompt = `You are an expert in Vedic healing traditions including Lal Kitab, Atharvaveda, Yog Pradeepam, and Vastu Shastra.

${instruction}

A person is facing a ${category} problem: "${description}"

Provide comprehensive remedies. Format as JSON:
{
  "remedies": "overall remedy summary",
  "lalKitabRemedy": "specific Lal Kitab remedy with day, item, and ritual",
  "atharvavedaRemedy": "Atharvaveda mantra or ritual remedy",
  "yogPradeepamRemedy": "yoga and pranayama based remedy",
  "vastuRemedy": "Vastu correction for home/office",
  "mantra": "specific mantra in authentic Sanskrit Devanagari script ONLY (e.g. ॐ नमः शिवाय, ॐ गं गणपतये नमः) — never use Roman transliteration. Include chant count.",
  "gemstone": "recommended gemstone with how to wear it"
}

IMPORTANT: The mantra field MUST always be written in Sanskrit Devanagari script regardless of response language.
FINAL REMINDER: All other field values must be in ${lang}. ${instruction}`;

  return aiJson(
    [
      { role: "system", content: instruction },
      { role: "user", content: prompt },
    ],
    fallbackProblems(category, language),
  );
}

// POST /api/problems
router.post("/problems", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const { description, category, language } = req.body;

    if (!description || !category) {
      res.status(400).json({ error: "description and category are required" });
      return;
    }

    const aiResult = await generateRemedies(description, category, language || "en");

    const [problem] = await db.insert(problemsTable).values({
      userId: dbUser.id,
      description,
      category,
      remedies: aiResult.remedies || "Remedies generated.",
      lalKitabRemedy: aiResult.lalKitabRemedy,
      atharvavedaRemedy: aiResult.atharvavedaRemedy,
      yogPradeepamRemedy: aiResult.yogPradeepamRemedy,
      vastuRemedy: aiResult.vastuRemedy,
      mantra: aiResult.mantra,
      gemstone: aiResult.gemstone,
      language: language || "en",
    }).returning();

    await db.insert(readingsTable).values({
      userId: dbUser.id,
      type: "problem",
      summary: `${category.charAt(0).toUpperCase() + category.slice(1)} problem remedy`,
      isPremium: false,
    });

    res.status(201).json({
      id: problem.id, description: problem.description, category: problem.category,
      remedies: problem.remedies, lalKitabRemedy: problem.lalKitabRemedy ?? null,
      atharvavedaRemedy: problem.atharvavedaRemedy ?? null, yogPradeepamRemedy: problem.yogPradeepamRemedy ?? null,
      vastuRemedy: problem.vastuRemedy ?? null, mantra: problem.mantra ?? null,
      gemstone: problem.gemstone ?? null, language: problem.language,
      createdAt: problem.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error solving problem");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/problems/my
router.get("/problems/my", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const problems = await db.select().from(problemsTable).where(eq(problemsTable.userId, dbUser.id)).orderBy(desc(problemsTable.createdAt));
    res.json(problems.map(p => ({
      id: p.id, description: p.description, category: p.category, remedies: p.remedies,
      lalKitabRemedy: p.lalKitabRemedy ?? null, atharvavedaRemedy: p.atharvavedaRemedy ?? null,
      yogPradeepamRemedy: p.yogPradeepamRemedy ?? null, vastuRemedy: p.vastuRemedy ?? null,
      mantra: p.mantra ?? null, gemstone: p.gemstone ?? null, language: p.language,
      createdAt: p.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Error getting problems");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/problems/:id
router.get("/problems/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [problem] = await db.select().from(problemsTable).where(eq(problemsTable.id, id));
    if (!problem) { res.status(404).json({ error: "Not found" }); return; }
    res.json({
      id: problem.id, description: problem.description, category: problem.category, remedies: problem.remedies,
      lalKitabRemedy: problem.lalKitabRemedy ?? null, atharvavedaRemedy: problem.atharvavedaRemedy ?? null,
      yogPradeepamRemedy: problem.yogPradeepamRemedy ?? null, vastuRemedy: problem.vastuRemedy ?? null,
      mantra: problem.mantra ?? null, gemstone: problem.gemstone ?? null, language: problem.language,
      createdAt: problem.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting problem");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
