import { languageInstruction } from "../lib/languages";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { openai } from "../lib/openai";

const router = Router();

const PLANETS = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];
const PLANETS_HI: Record<string, string> = {
  Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध",
  Jupiter: "बृहस्पति", Venus: "शुक्र", Saturn: "शनि",
};
const SIGNS = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];

function generateApproxAshtakavarga(dob: string) {
  const seed = dob.replace(/\D/g, "").split("").reduce((a, b) => a + parseInt(b), 0);

  const rows = PLANETS.map((planet, pi) => {
    const values = SIGNS.map((_, si) => {
      const val = ((seed + pi * 7 + si * 3) % 5) + 2;
      return Math.min(8, Math.max(0, val));
    });
    const total = values.reduce((a, b) => a + b, 0);
    const obj: Record<string, number | string> = { planet, planetHi: PLANETS_HI[planet]! };
    SIGNS.forEach((s, i) => { obj[s] = values[i]!; });
    obj["total"] = total;
    return obj;
  });

  const sarva = SIGNS.map((_, si) =>
    rows.reduce((sum, row) => sum + (row[SIGNS[si]!] as number), 0)
  );

  return { rows, sarva };
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

// POST /api/ashtakavarga
router.post("/ashtakavarga", requireAuth, async (req, res) => {
  try {
    const { dateOfBirth, timeOfBirth, placeOfBirth, language } = req.body;

    if (!dateOfBirth || !timeOfBirth || !placeOfBirth) {
      res.status(400).json({ error: "dateOfBirth, timeOfBirth, and placeOfBirth are required" });
      return;
    }

    const { rows, sarva } = generateApproxAshtakavarga(dateOfBirth);
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
