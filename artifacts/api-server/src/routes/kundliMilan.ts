import { languageInstruction } from "../lib/languages";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { openai } from "../lib/openai";

const router = Router();

async function generateKundliMilanReport(
  p1Name: string, p1Dob: string, p1Tob: string, p1Pob: string,
  p2Name: string, p2Dob: string, p2Tob: string, p2Pob: string,
  language: string
) {
  const { lang, instruction } = languageInstruction(language);

  const prompt = `You are a Vedic astrology expert specializing in Kundli matching (Ashtakoota system).

${instruction}
Analyze compatibility between:
Person 1: ${p1Name}, DOB: ${p1Dob}, TOB: ${p1Tob}, POB: ${p1Pob}
Person 2: ${p2Name}, DOB: ${p2Dob}, TOB: ${p2Tob}, POB: ${p2Pob}

Based on the 8 Kootas (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoota, Nadi) out of maximum 36 points:
- Varna: max 1, Vashya: max 2, Tara: max 3, Yoni: max 4, Graha Maitri: max 5, Gana: max 6, Bhakoota: max 7, Nadi: max 8

Return JSON (all text values — compatibility, analysis, strengths, challenges, recommendation — in ${lang}):
{
  "totalScore": <number between 18-34>,
  "maxScore": 36,
  "compatibility": "<Excellent/Good/Average/Below Average>",
  "varna": <0 or 1>,
  "vashya": <0, 1 or 2>,
  "tara": <0, 1, 2 or 3>,
  "yoni": <0 to 4>,
  "grihaMaitri": <0 to 5>,
  "gana": <0 or 6>,
  "bhakoota": <0 or 7>,
  "nadi": <0 or 8>,
  "analysis": "detailed analysis of the match...",
  "strengths": "areas where the couple will complement each other...",
  "challenges": "potential challenges and how to overcome them...",
  "recommendation": "overall recommendation for this match..."
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

// POST /api/kundli-milan
router.post("/kundli-milan", requireAuth, async (req, res) => {
  try {
    const { person1Name, person1Dob, person1Tob, person1Pob, person2Name, person2Dob, person2Tob, person2Pob, language } = req.body;

    if (!person1Name || !person1Dob || !person1Tob || !person1Pob ||
        !person2Name || !person2Dob || !person2Tob || !person2Pob) {
      res.status(400).json({ error: "All fields for both persons are required" });
      return;
    }

    const result = await generateKundliMilanReport(
      person1Name, person1Dob, person1Tob, person1Pob,
      person2Name, person2Dob, person2Tob, person2Pob,
      language || "en"
    );

    res.status(201).json({
      totalScore: result.totalScore || 24,
      maxScore: 36,
      compatibility: result.compatibility || "Good",
      varna: result.varna ?? 1,
      vashya: result.vashya ?? 2,
      tara: result.tara ?? 2,
      yoni: result.yoni ?? 3,
      grihaMaitri: result.grihaMaitri ?? 4,
      gana: result.gana ?? 6,
      bhakoota: result.bhakoota ?? 0,
      nadi: result.nadi ?? 8,
      analysis: result.analysis || "Kundli Milan analysis completed.",
      strengths: result.strengths || "",
      challenges: result.challenges || "",
      recommendation: result.recommendation || "",
    });
  } catch (err) {
    req.log.error({ err }, "Error creating kundli milan");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
