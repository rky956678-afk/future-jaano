import { resolveLanguageName } from "../lib/languages";
import { Router } from "express";
import { db, kundliTable, readingsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { openai } from "../lib/openai";

const router = Router();

async function generateKundliAnalysis(data: {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  gender?: string;
  language?: string;
}) {
  const lang = resolveLanguageName(data.language);
  const scriptNote =
    lang === "Hindi"
      ? "ALL field VALUES (sunSign, moonSign, ascendant, analysis, planetaryPositions, doshas, remedies, manglikStatus, luckyStone) MUST be written in Hindi using Devanagari script — for example sunSign: \"मेष\", moonSign: \"वृषभ\", ascendant: \"मिथुन लग्न\", doshas: \"मांगलिक दोष विद्यमान है...\", manglikStatus: \"मांगलिक\", luckyStone: \"मूँगा\". Do NOT write values in English or Roman transliteration. Only JSON keys remain in English."
      : lang === "English"
      ? "All field values must be in English."
      : `ALL field VALUES must be written in ${lang} using its native script. Do NOT use Roman/English transliteration. Only JSON keys stay in English.`;
  const prompt = `You are an expert Vedic astrologer who responds ONLY in ${lang}.

${scriptNote}

Generate a detailed Kundli (birth chart) analysis for:
Name: ${data.name}
Date of Birth: ${data.dateOfBirth}
Time of Birth: ${data.timeOfBirth}
Place of Birth: ${data.placeOfBirth}
Gender: ${data.gender || "Not specified"}

Include:
1. Sun Sign and Moon Sign determination
2. Ascendant (Lagna) calculation
3. Planetary positions summary
4. Doshas present (Manglik, Kaal Sarpa, etc.)
5. Lucky stone recommendation
6. Manglik status
7. Detailed life analysis covering career, marriage, health, finance
8. Practical remedies from Vedic astrology including specific mantras

Format as JSON with these exact fields:
{
  "sunSign": "string",
  "moonSign": "string", 
  "ascendant": "string",
  "analysis": "detailed paragraph analysis",
  "planetaryPositions": "planetary positions as detailed text",
  "doshas": "doshas analysis",
  "remedies": "practical remedies list — IMPORTANT: any mantras mentioned here MUST be in Sanskrit Devanagari script only (e.g. ॐ नमः शिवाय), never in Roman transliteration",
  "manglikStatus": "manglik or non-manglik with details",
  "luckyStone": "recommended gemstone"
}

IMPORTANT: Any mantras in the remedies field must always be written in authentic Sanskrit Devanagari script.

FINAL REMINDER: Every value in the JSON must be in ${lang}. ${scriptNote}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a multilingual Vedic astrologer. CRITICAL OUTPUT LANGUAGE: ${lang}. ${scriptNote}`,
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

// POST /api/kundli
router.post("/kundli", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const { name, dateOfBirth, timeOfBirth, placeOfBirth, gender, language } = req.body;

    if (!name || !dateOfBirth || !timeOfBirth || !placeOfBirth) {
      res.status(400).json({ error: "name, dateOfBirth, timeOfBirth, placeOfBirth are required" });
      return;
    }

    const aiResult = await generateKundliAnalysis({ name, dateOfBirth, timeOfBirth, placeOfBirth, gender, language });

    const [kundli] = await db.insert(kundliTable).values({
      userId: dbUser.id,
      name,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      sunSign: aiResult.sunSign || "Unknown",
      moonSign: aiResult.moonSign || "Unknown",
      ascendant: aiResult.ascendant || "Unknown",
      analysis: aiResult.analysis || "Analysis generated.",
      planetaryPositions: aiResult.planetaryPositions,
      doshas: aiResult.doshas,
      remedies: aiResult.remedies,
      manglikStatus: aiResult.manglikStatus,
      luckyStone: aiResult.luckyStone,
      language: language || "en",
    }).returning();

    // Record reading
    await db.insert(readingsTable).values({
      userId: dbUser.id,
      type: "kundli",
      summary: `Kundli for ${name} - ${aiResult.sunSign || "Vedic"} Sun Sign`,
      isPremium: false,
    });

    res.status(201).json({
      id: kundli.id,
      name: kundli.name,
      dateOfBirth: kundli.dateOfBirth,
      timeOfBirth: kundli.timeOfBirth,
      placeOfBirth: kundli.placeOfBirth,
      sunSign: kundli.sunSign,
      moonSign: kundli.moonSign,
      ascendant: kundli.ascendant,
      analysis: kundli.analysis,
      planetaryPositions: kundli.planetaryPositions ?? null,
      doshas: kundli.doshas ?? null,
      remedies: kundli.remedies ?? null,
      manglikStatus: kundli.manglikStatus ?? null,
      luckyStone: kundli.luckyStone ?? null,
      language: kundli.language,
      createdAt: kundli.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating kundli");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/kundli/my
router.get("/kundli/my", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const kundlis = await db.select().from(kundliTable).where(eq(kundliTable.userId, dbUser.id)).orderBy(desc(kundliTable.createdAt));
    res.json(kundlis.map(k => ({
      id: k.id, name: k.name, dateOfBirth: k.dateOfBirth, timeOfBirth: k.timeOfBirth,
      placeOfBirth: k.placeOfBirth, sunSign: k.sunSign, moonSign: k.moonSign, ascendant: k.ascendant,
      analysis: k.analysis, planetaryPositions: k.planetaryPositions ?? null, doshas: k.doshas ?? null,
      remedies: k.remedies ?? null, manglikStatus: k.manglikStatus ?? null, luckyStone: k.luckyStone ?? null,
      language: k.language, createdAt: k.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Error getting kundlis");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/kundli/:id
router.get("/kundli/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [kundli] = await db.select().from(kundliTable).where(eq(kundliTable.id, id));
    if (!kundli) { res.status(404).json({ error: "Not found" }); return; }
    res.json({
      id: kundli.id, name: kundli.name, dateOfBirth: kundli.dateOfBirth, timeOfBirth: kundli.timeOfBirth,
      placeOfBirth: kundli.placeOfBirth, sunSign: kundli.sunSign, moonSign: kundli.moonSign, ascendant: kundli.ascendant,
      analysis: kundli.analysis, planetaryPositions: kundli.planetaryPositions ?? null, doshas: kundli.doshas ?? null,
      remedies: kundli.remedies ?? null, manglikStatus: kundli.manglikStatus ?? null, luckyStone: kundli.luckyStone ?? null,
      language: kundli.language, createdAt: kundli.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting kundli");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
