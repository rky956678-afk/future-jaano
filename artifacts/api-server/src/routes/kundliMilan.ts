import { languageInstruction } from "../lib/languages";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { aiJson } from "../lib/openai";
import { fallbackMilan } from "../lib/fallbacks";
import { gunaMilan } from "../lib/gunaMilan";

const router = Router();

async function generateMilanAnalysis(
  p1Name: string, p2Name: string,
  scores: ReturnType<typeof gunaMilan>,
  language: string,
) {
  const { lang, instruction } = languageInstruction(language);
  const prompt = `You are a Vedic astrology expert specializing in Kundli Milan (Ashtakoot matching).

${instruction}

The couple's ashtakoot scores were computed astronomically from their real Moon positions:
Boy (${p1Name}): Moon in ${scores.boy.moonRashi}, ${scores.boy.nakshatra} nakshatra, ${scores.boy.varna} varna, ${scores.boy.yoni} yoni
Girl (${p2Name}): Moon in ${scores.girl.moonRashi}, ${scores.girl.nakshatra} nakshatra, ${scores.girl.varna} varna, ${scores.girl.yoni} yoni

Guna scores (out of max): Varna ${scores.varna}/1, Vashya ${scores.vashya}/2, Tara ${scores.tara}/3, Yoni ${scores.yoni}/4, Graha Maitri ${scores.grihaMaitri}/5, Gana ${scores.gana}/6, Bhakoota ${scores.bhakoota}/7, Nadi ${scores.nadi}/8.
TOTAL: ${scores.totalScore}/36.
${scores.nadiDosha ? "NADI DOSHA is present." : ""} ${scores.bhakootaDosha ? "BHAKOOTA DOSHA is present." : ""} ${scores.ganaDosha ? "GANA DOSHA is present." : ""}

Write an expert interpretation of THESE EXACT scores. Return JSON (all text in ${lang}):
{
  "analysis": "detailed analysis of the match based on the scores above...",
  "strengths": "areas where the couple will complement each other...",
  "challenges": "potential challenges (mention any doshas above) and remedies to overcome them...",
  "recommendation": "overall recommendation for this match..."
}

FINAL REMINDER: ${instruction}`;

  return aiJson(
    [
      { role: "system", content: instruction },
      { role: "user", content: prompt },
    ],
    fallbackMilan(p1Name, p2Name, "", "", language),
  );
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

    // ── Real Ashtakoot computation from actual Moon positions ──
    const scores = gunaMilan(
      { dob: person1Dob, tob: person1Tob, pob: person1Pob },
      { dob: person2Dob, tob: person2Tob, pob: person2Pob },
    );

    const isHi = (language || "en").toLowerCase().startsWith("hi");
    const compatibility =
      scores.totalScore >= 30 ? (isHi ? "उत्तम" : "Excellent") :
      scores.totalScore >= 24 ? (isHi ? "अच्छा" : "Good") :
      scores.totalScore >= 18 ? (isHi ? "सामान्य" : "Average") :
      (isHi ? "औसत से कम" : "Below Average");

    const text = await generateMilanAnalysis(person1Name, person2Name, scores, language || "en");

    res.status(201).json({
      totalScore: scores.totalScore,
      maxScore: 36,
      compatibility,
      varna: scores.varna,
      vashya: scores.vashya,
      tara: scores.tara,
      yoni: scores.yoni,
      grihaMaitri: scores.grihaMaitri,
      gana: scores.gana,
      bhakoota: scores.bhakoota,
      nadi: scores.nadi,
      analysis: text.analysis || "Kundli Milan analysis completed.",
      strengths: text.strengths || "",
      challenges: text.challenges || "",
      recommendation: text.recommendation || "",
      // Additive detail fields (real computed data)
      boyDetails: scores.boy,
      girlDetails: scores.girl,
      doshas: { nadi: scores.nadiDosha, bhakoota: scores.bhakootaDosha, gana: scores.ganaDosha },
    });
  } catch (err) {
    req.log.error({ err }, "Error creating kundli milan");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
