import { languageInstruction } from "../lib/languages";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { openai } from "../lib/openai";

const router = Router();

// Vimshottari Dasha planet years
const DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};
const DASHA_ORDER = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"];
const DASHA_HI: Record<string, string> = {
  Ketu: "केतु", Venus: "शुक्र", Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल",
  Rahu: "राहु", Jupiter: "बृहस्पति", Saturn: "शनि", Mercury: "बुध",
};

function calculateDasha(dob: string) {
  const birth = new Date(dob);
  const today = new Date();
  const dayOfYear = Math.floor((birth.getTime() - new Date(birth.getFullYear(), 0, 0).getTime()) / 86400000);
  // Use nakshatra index to determine starting dasha (simplified)
  const nakshatraIndex = dayOfYear % 27;
  const dashaOwnerIndex = Math.floor(nakshatraIndex / 3) % 9;

  const periods: Array<{ planet: string; planetHi: string; startDate: string; endDate: string; years: number; interpretation: string }> = [];
  let currentDate = new Date(birth);

  for (let i = 0; i < 9; i++) {
    const planetIndex = (dashaOwnerIndex + i) % 9;
    const planet = DASHA_ORDER[planetIndex]!;
    const years = DASHA_YEARS[planet]!;
    const startDate = currentDate.toISOString().split("T")[0]!;
    const endDate = new Date(currentDate.getTime() + years * 365.25 * 86400000).toISOString().split("T")[0]!;
    periods.push({ planet, planetHi: DASHA_HI[planet]!, startDate, endDate, years, interpretation: "" });
    currentDate = new Date(currentDate.getTime() + years * 365.25 * 86400000);
  }

  // Find current dasha
  let currentDasha = periods[0]!;
  let currentAntardasha = "";
  for (const p of periods) {
    if (new Date(p.startDate) <= today && today <= new Date(p.endDate)) {
      currentDasha = p;
      // Calculate antardasha
      const elapsed = today.getTime() - new Date(p.startDate).getTime();
      const total = new Date(p.endDate).getTime() - new Date(p.startDate).getTime();
      const fraction = elapsed / total;
      const antarIndex = Math.floor(fraction * 9);
      const antarPlanetIndex = (DASHA_ORDER.indexOf(p.planet) + antarIndex) % 9;
      currentAntardasha = DASHA_ORDER[antarPlanetIndex]!;
      break;
    }
  }

  const remainingMs = new Date(currentDasha.endDate).getTime() - today.getTime();
  const remainingYears = (remainingMs / (365.25 * 86400000)).toFixed(1);

  return { currentDasha, currentAntardasha, dashaBalance: `${remainingYears} years remaining`, periods };
}

async function generateDashaInterpretations(
  dob: string, tob: string, pob: string,
  currentDasha: string, currentAntar: string, periods: any[],
  language: string
) {
  const { lang, instruction } = languageInstruction(language);
  const periodList = periods.map((p: any) => `${p.planet} (${p.startDate} to ${p.endDate})`).join(", ");

  const prompt = `You are a Vedic astrology expert specializing in Vimshottari Dasha.

${instruction}

Birth details: DOB ${dob}, TOB ${tob}, POB ${pob}
Current Dasha: ${currentDasha} Mahadasha, ${currentAntar} Antardasha
All periods: ${periodList}

Return JSON (all interpretation text in ${lang}; JSON keys for planet names stay in English):
{
  "currentPeriodInterpretation": "detailed interpretation of the current ${currentDasha}/${currentAntar} period (3-4 sentences)",
  "periodEffects": {
    ${DASHA_ORDER.map(p => `"${p}": "brief effect of ${p} dasha"`).join(",\n    ")}
  }
}

FINAL REMINDER: ${instruction}`;

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

// POST /api/dasha
router.post("/dasha", requireAuth, async (req, res) => {
  try {
    const { dateOfBirth, timeOfBirth, placeOfBirth, language } = req.body;

    if (!dateOfBirth || !timeOfBirth || !placeOfBirth) {
      res.status(400).json({ error: "dateOfBirth, timeOfBirth, and placeOfBirth are required" });
      return;
    }

    const { currentDasha, currentAntardasha, dashaBalance, periods } = calculateDasha(dateOfBirth);
    const aiResult = await generateDashaInterpretations(
      dateOfBirth, timeOfBirth, placeOfBirth,
      currentDasha.planet, currentAntardasha, periods, language || "en"
    );

    const periodEffects = aiResult.periodEffects || {};
    const periodsWithInterpretation = periods.map((p: any) => ({
      ...p,
      interpretation: periodEffects[p.planet] || `${p.planet} Dasha period.`,
    }));

    res.status(201).json({
      currentDasha: currentDasha.planet,
      currentAntardasha,
      dashaBalance,
      periods: periodsWithInterpretation,
      currentPeriodInterpretation: aiResult.currentPeriodInterpretation || "Current dasha analysis completed.",
    });
  } catch (err) {
    req.log.error({ err }, "Error creating dasha report");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
