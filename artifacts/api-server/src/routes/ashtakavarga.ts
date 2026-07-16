import { languageInstruction } from "../lib/languages";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { aiJson } from "../lib/openai";
import { fallbackAshtakavarga } from "../lib/fallbacks";

const router = Router();

import { ashtakavarga as computeAV, jdFromISO, ascendantSidereal, geocodeCity } from "../lib/jyotish";

function generateRealAshtakavarga(dob: string, tob: string, pob: string) {
  const geo = geocodeCity(pob);
  const jd = jdFromISO(dob, tob || "12:00");
  const lagna = ascendantSidereal(jd, geo.lat, geo.lon);
  const lagnaIdx = Math.floor(lagna / 30);
  const av = computeAV(jd, lagnaIdx);
  return { rows: av.rows, sarva: av.sarva, lagnaIdx };
}

async function generateAshtakavargaAnalysis(
  dob: string, tob: string, pob: string,
  rows: any[], sarva: number[], language: string
) {
  const { lang, instruction } = languageInstruction(language);
  const signLabels = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
  const sarvaStr = signLabels.map((s, i) => `${s}: ${sarva[i]}`).join(", ");
  const strongHouses = sarva.map((v, i) => ({ v, s: signLabels[i]! })).filter(x => x.v >= 28).map(x => x.s);
  const weakHouses = sarva.map((v, i) => ({ v, s: signLabels[i]! })).filter(x => x.v <= 22).map(x => x.s);

  const prompt = `You are a Vedic astrology expert specializing in Ashtakavarga.

${instruction}

Birth details: DOB ${dob}, TOB ${tob}, POB ${pob}
Sarvashtakavarga scores by sign: ${sarvaStr}
Strong signs (28+): ${strongHouses.join(", ") || "None"}
Weak signs (22-): ${weakHouses.join(", ") || "None"}

Return JSON (rashi names and the analysis text all in ${lang}):
{
  "strongHouses": "strong rashi names in ${lang}, comma separated",
  "weakHouses": "weak rashi names in ${lang}, comma separated",
  "analysis": "comprehensive Ashtakavarga analysis (4-5 sentences) covering life areas, strengths, and guidance"
}

FINAL REMINDER: ${instruction}`;

  return aiJson(
    [
      { role: "system", content: instruction },
      { role: "user", content: prompt },
    ],
    fallbackAshtakavarga(strongHouses, weakHouses, language),
  );
}

// POST /api/ashtakavarga
router.post("/ashtakavarga", requireAuth, async (req, res) => {
  try {
    const { dateOfBirth, timeOfBirth, placeOfBirth, language } = req.body;

    if (!dateOfBirth || !timeOfBirth || !placeOfBirth) {
      res.status(400).json({ error: "dateOfBirth, timeOfBirth, and placeOfBirth are required" });
      return;
    }

    const { rows, sarva } = generateRealAshtakavarga(dateOfBirth, timeOfBirth, placeOfBirth);
    const aiResult = await generateAshtakavargaAnalysis(dateOfBirth, timeOfBirth, placeOfBirth, rows, sarva, language || "en");

    res.status(201).json({
      rows,
      sarvashtakavarga: sarva,
      strongHouses: aiResult.strongHouses || "",
      weakHouses: aiResult.weakHouses || "",
      analysis: aiResult.analysis || "Ashtakavarga analysis completed.",
    });
  } catch (err) {
    req.log.error({ err }, "Error creating ashtakavarga");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
