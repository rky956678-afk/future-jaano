import { languageInstruction } from "../lib/languages";
import { Router } from "express";
import { aiJson } from "../lib/openai";
import { fallbackGochar } from "../lib/fallbacks";

const router = Router();

// Real planetary transit positions from the jyotish engine
import { grahaPositions, jdFromISO, RASHIS_EN, RASHIS_HI } from "../lib/jyotish";

function getPlanetPositions(dateISO: string) {
  const jd = jdFromISO(dateISO, "12:00");
  return grahaPositions(jd).map((g) => ({
    planet: g.planet,
    planetHi: g.planetHi,
    rashi: RASHIS_EN[g.rashiIndex]!,
    rashiHi: RASHIS_HI[g.rashiIndex]!,
    degree: `${g.degreeInRashi.toFixed(1)}°`,
    isRetrograde: g.isRetrograde,
  }));
}

async function generateGocharEffects(planets: ReturnType<typeof getPlanetPositions>, language: string) {
  const { lang, instruction } = languageInstruction(language);
  const planetList = planets.map(p => `${p.planet} in ${p.rashi}${p.isRetrograde ? " (Retrograde)" : ""}`).join(", ");

  const prompt = `You are a Vedic astrology expert. Today's planetary positions are: ${planetList}.

${instruction}

Generate a brief effect (1-2 sentences) for each planet's current transit and an overall general effect for today.
Return JSON with this exact structure (JSON keys stay in English, all values in ${lang}):
{
  "effects": {
    "Sun": "...", "Moon": "...", "Mars": "...", "Mercury": "...",
    "Jupiter": "...", "Venus": "...", "Saturn": "...", "Rahu": "...", "Ketu": "..."
  },
  "generalEffect": "Overall guidance for today based on planetary positions"
}

FINAL REMINDER: ${instruction}`;

  return aiJson(
    [
      { role: "system", content: instruction },
      { role: "user", content: prompt },
    ],
    fallbackGochar(language),
  );
}

// GET /api/gochar
router.get("/gochar", async (req, res) => {
  try {
    const language = (req.query["language"] as string) || "en";
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0]!;
    const planets = getPlanetPositions(dateStr);

    const aiResult = await generateGocharEffects(planets, language);
    const effects = aiResult.effects || {};

    const planetsWithEffects = planets.map(p => ({
      ...p,
      effect: effects[p.planet] || `${p.planet} is transiting ${p.rashi}.`,
    }));

    res.json({
      date: dateStr,
      planets: planetsWithEffects,
      generalEffect: aiResult.generalEffect || "Planetary positions indicate a normal day.",
    });
  } catch (err) {
    req.log.error({ err }, "Error getting gochar");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
