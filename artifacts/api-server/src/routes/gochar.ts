import { languageInstruction } from "../lib/languages";
import { Router } from "express";
import { openai } from "../lib/openai";

const router = Router();

// Approximate planetary positions based on current date
// (simplified Vedic astrology placements)
function getApproxPlanetPositions(date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const year = date.getFullYear();

  const rashis = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
  const rashisHi = ["मेष","वृष","मिथुन","कर्क","सिंह","कन्या","तुला","वृश्चिक","धनु","मकर","कुम्भ","मीन"];

  // Simplified positions (not astronomically precise but indicative)
  const sunIdx = Math.floor(((date.getMonth() * 30 + date.getDate() - 14) / 360) * 12) % 12;
  const moonIdx = Math.floor((dayOfYear * 12 / 27.3)) % 12;
  const marsIdx = Math.floor(((year - 2020) * 12 / 2 + dayOfYear / 30)) % 12;
  const mercuryIdx = (sunIdx + (dayOfYear % 3) - 1 + 12) % 12;
  const jupiterIdx = Math.floor(((year - 2000) * 12 / 12 + dayOfYear / 365)) % 12;
  const venusIdx = (sunIdx + 1 + Math.floor(dayOfYear / 25)) % 12;
  const saturnIdx = Math.floor(((year - 2000) * 12 / 29.5)) % 12;
  const rahuIdx = Math.floor(((year - 2000) * 12 / 18.5)) % 12;
  const ketuIdx = (rahuIdx + 6) % 12;

  return [
    { planet: "Sun", planetHi: "सूर्य", rashi: rashis[sunIdx]!, rashiHi: rashisHi[sunIdx]!, degree: `${(dayOfYear % 30) + 1}°`, isRetrograde: false },
    { planet: "Moon", planetHi: "चंद्र", rashi: rashis[moonIdx]!, rashiHi: rashisHi[moonIdx]!, degree: `${(dayOfYear % 29) + 1}°`, isRetrograde: false },
    { planet: "Mars", planetHi: "मंगल", rashi: rashis[marsIdx]!, rashiHi: rashisHi[marsIdx]!, degree: `${(dayOfYear % 45) + 1}°`, isRetrograde: false },
    { planet: "Mercury", planetHi: "बुध", rashi: rashis[mercuryIdx]!, rashiHi: rashisHi[mercuryIdx]!, degree: `${(dayOfYear % 25) + 1}°`, isRetrograde: dayOfYear % 7 === 0 },
    { planet: "Jupiter", planetHi: "बृहस्पति", rashi: rashis[jupiterIdx]!, rashiHi: rashisHi[jupiterIdx]!, degree: `${(dayOfYear % 30) + 1}°`, isRetrograde: dayOfYear % 15 < 4 },
    { planet: "Venus", planetHi: "शुक्र", rashi: rashis[venusIdx]!, rashiHi: rashisHi[venusIdx]!, degree: `${(dayOfYear % 28) + 1}°`, isRetrograde: dayOfYear % 19 === 0 },
    { planet: "Saturn", planetHi: "शनि", rashi: rashis[saturnIdx]!, rashiHi: rashisHi[saturnIdx]!, degree: `${(dayOfYear % 30) + 1}°`, isRetrograde: dayOfYear % 12 < 5 },
    { planet: "Rahu", planetHi: "राहु", rashi: rashis[rahuIdx]!, rashiHi: rashisHi[rahuIdx]!, degree: `${(dayOfYear % 18) + 1}°`, isRetrograde: true },
    { planet: "Ketu", planetHi: "केतु", rashi: rashis[ketuIdx]!, rashiHi: rashisHi[ketuIdx]!, degree: `${(dayOfYear % 18) + 1}°`, isRetrograde: true },
  ];
}

async function generateGocharEffects(planets: ReturnType<typeof getApproxPlanetPositions>, language: string) {
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

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: instruction },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

// GET /api/gochar
router.get("/gochar", async (req, res) => {
  try {
    const language = (req.query["language"] as string) || "en";
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0]!;
    const planets = getApproxPlanetPositions(today);

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
