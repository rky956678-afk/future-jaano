import { resolveLanguageName } from "../lib/languages";
import { Router } from "express";
import { db, kundliTable, readingsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { aiJson } from "../lib/openai";
import { fallbackKundli } from "../lib/fallbacks";
import {
  jdFromISO, grahaPositions, ascendantSidereal, geocodeCity, manglikStatus,
  vimshottari, RASHIS_EN, RASHIS_HI, NAKSHATRAS_EN, NAKSHATRAS_HI,
} from "../lib/jyotish";

/** Compute the real chart from birth details (IST assumed). */
function computeChart(dob: string, tob: string, pob: string) {
  const geo = geocodeCity(pob);
  const jd = jdFromISO(dob, tob || "12:00");
  const positions = grahaPositions(jd);
  const lagnaLon = ascendantSidereal(jd, geo.lat, geo.lon);
  const lagnaIdx = Math.floor(lagnaLon / 30);
  const moon = positions.find((p) => p.planet === "Moon")!;
  const sun = positions.find((p) => p.planet === "Sun")!;
  const manglik = manglikStatus(jd, lagnaIdx);
  const dasha = vimshottari(jd);

  // 12 houses (whole-sign) with planets placed by real position
  const houses = Array.from({ length: 12 }, (_, h) => {
    const rashiIdx = (lagnaIdx + h) % 12;
    return {
      house: h + 1,
      rashi: RASHIS_EN[rashiIdx]!,
      rashiHi: RASHIS_HI[rashiIdx]!,
      planets: positions
        .filter((p) => p.rashiIndex === rashiIdx)
        .map((p) => `${p.planet}${p.isRetrograde ? " (R)" : ""}`),
    };
  });

  return { geo, positions, lagnaIdx, moon, sun, manglik, dasha, houses };
}


const router = Router();

async function generateKundliAnalysis(data: {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  gender?: string;
  language?: string;
  chartSummary?: string;
  real?: { sunRashiIdx: number; moonRashiIdx: number; lagnaIdx: number; manglik: boolean };
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

The REAL astronomically computed chart (sidereal/Lahiri) is:
${data.chartSummary || ""}
Use EXACTLY these positions in your analysis — do not invent different placements.

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

  return aiJson(
    [
      {
        role: "system",
        content: `You are a multilingual Vedic astrologer. CRITICAL OUTPUT LANGUAGE: ${lang}. ${scriptNote}`,
      },
      { role: "user", content: prompt },
    ],
    fallbackKundli(data),
  );
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

    // ── Real astronomical chart (this is the source of truth) ──
    const chart = computeChart(dateOfBirth, timeOfBirth, placeOfBirth);
    const isHi = (language || "en").toLowerCase().startsWith("hi");
    const R = isHi ? RASHIS_HI : RASHIS_EN;
    const N = isHi ? NAKSHATRAS_HI : NAKSHATRAS_EN;

    const realSunSign = R[chart.sun.rashiIndex]!;
    const realMoonSign = R[chart.moon.rashiIndex]!;
    const realAscendant = isHi ? `${R[chart.lagnaIdx]} लग्न` : `${R[chart.lagnaIdx]} Ascendant`;
    const realPositions = chart.positions
      .map((p) => `${isHi ? p.planetHi : p.planet}: ${R[p.rashiIndex]} ${p.degreeInRashi.toFixed(1)}°${p.isRetrograde ? " (R)" : ""}`)
      .join(" | ");
    const realManglik = chart.manglik.manglik
      ? (isHi ? `मांगलिक (मंगल ${chart.manglik.house}वें भाव में)` : `Manglik (Mars in house ${chart.manglik.house})`)
      : (isHi ? "गैर-मांगलिक" : "Non-Manglik");

    const chartSummary = [
      `Ascendant (Lagna): ${RASHIS_EN[chart.lagnaIdx]}`,
      `Sun: ${RASHIS_EN[chart.sun.rashiIndex]} | Moon: ${RASHIS_EN[chart.moon.rashiIndex]} (${NAKSHATRAS_EN[chart.moon.nakshatraIndex]} nakshatra, pada ${chart.moon.pada})`,
      `All positions: ${chart.positions.map((p) => `${p.planet} in ${RASHIS_EN[p.rashiIndex]}${p.isRetrograde ? " (R)" : ""}`).join(", ")}`,
      `Manglik: ${chart.manglik.manglik ? `YES (Mars in house ${chart.manglik.house} from lagna)` : "No"}`,
      `Current Mahadasha: ${chart.dasha.currentDasha.planet} / Antardasha: ${chart.dasha.currentAntardasha} (${chart.dasha.dashaBalance})`,
    ].join("\n");

    const aiResult = await generateKundliAnalysis({
      name, dateOfBirth, timeOfBirth, placeOfBirth, gender, language, chartSummary,
      real: { sunRashiIdx: chart.sun.rashiIndex, moonRashiIdx: chart.moon.rashiIndex, lagnaIdx: chart.lagnaIdx, manglik: chart.manglik.manglik },
    });

    const [kundli] = await db.insert(kundliTable).values({
      userId: dbUser.id,
      name,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      sunSign: realSunSign,
      moonSign: realMoonSign,
      ascendant: realAscendant,
      analysis: aiResult.analysis || "Analysis generated.",
      planetaryPositions: realPositions,
      doshas: aiResult.doshas,
      remedies: aiResult.remedies,
      manglikStatus: realManglik,
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
      // ── Additive: real computed chart (new hightech fields) ──
      chart: {
        lagna: RASHIS_EN[chart.lagnaIdx],
        lagnaHi: RASHIS_HI[chart.lagnaIdx],
        moonNakshatra: `${NAKSHATRAS_EN[chart.moon.nakshatraIndex]} (${N[chart.moon.nakshatraIndex]})`,
        moonNakshatraPada: chart.moon.pada,
        houses: chart.houses,
        positions: chart.positions.map((p) => ({
          planet: p.planet, planetHi: p.planetHi,
          rashi: RASHIS_EN[p.rashiIndex], rashiHi: RASHIS_HI[p.rashiIndex],
          degree: Math.round(p.degreeInRashi * 10) / 10,
          nakshatra: NAKSHATRAS_EN[p.nakshatraIndex], pada: p.pada,
          retrograde: p.isRetrograde,
        })),
        currentDasha: chart.dasha.currentDasha.planet,
        currentAntardasha: chart.dasha.currentAntardasha,
        dashaBalance: chart.dasha.dashaBalance,
        placeUsed: chart.geo.matched,
      },
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
