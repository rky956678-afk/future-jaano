import { languageInstruction } from "../lib/languages";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { aiJson } from "../lib/openai";
import { fallbackDasha } from "../lib/fallbacks";

const router = Router();

// Real Vimshottari Dasha from the Moon's actual birth nakshatra
import { vimshottari, jdFromISO } from "../lib/jyotish";

const DASHA_ORDER = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"];

function calculateDasha(dob: string, tob: string) {
  const jd = jdFromISO(dob, tob || "12:00");
  const v = vimshottari(jd);
  return {
    currentDasha: v.currentDasha,
    currentAntardasha: v.currentAntardasha,
    dashaBalance: v.dashaBalance,
    periods: v.periods.map((p) => ({ ...p, interpretation: "" })),
    birthNakshatra: v.birthNakshatra,
    birthNakshatraHi: v.birthNakshatraHi,
    moonRashi: v.moonRashi,
  };
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

  return aiJson(
    [
      { role: "system", content: instruction },
      { role: "user", content: prompt },
    ],
    fallbackDasha(currentDasha, currentAntar, language),
  );
}

// POST /api/dasha
router.post("/dasha", requireAuth, async (req, res) => {
  try {
    const { dateOfBirth, timeOfBirth, placeOfBirth, language } = req.body;

    if (!dateOfBirth || !timeOfBirth || !placeOfBirth) {
      res.status(400).json({ error: "dateOfBirth, timeOfBirth, and placeOfBirth are required" });
      return;
    }

    const { currentDasha, currentAntardasha, dashaBalance, periods, birthNakshatra, birthNakshatraHi, moonRashi } = calculateDasha(dateOfBirth, timeOfBirth);
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
      birthNakshatra,
      birthNakshatraHi,
      moonRashi,
    });
  } catch (err) {
    req.log.error({ err }, "Error creating dasha report");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
