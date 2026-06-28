import { languageInstruction } from "../lib/languages";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { openai } from "../lib/openai";

const router = Router();

const PURPOSE_LABELS: Record<string, string> = {
  "vivah": "Vivah (Marriage)", "grih-pravesh": "Grih Pravesh (Housewarming)",
  "vyapar": "Vyapar (Business)", "yatra": "Yatra (Travel)",
  "naam-karan": "Naam Karan (Naming Ceremony)", "mundan": "Mundan (First Haircut)",
  "other": "General Auspicious Work",
};

async function generateMuhurats(purpose: string, startDate: string, endDate: string, location: string, language: string) {
  const { lang, instruction } = languageInstruction(language);
  const purposeLabel = PURPOSE_LABELS[purpose] || purpose;

  const prompt = `You are a Vedic astrology expert specializing in Muhurat (auspicious timing).

${instruction}

Find auspicious Muhurat timings for: ${purposeLabel}
Date range: ${startDate} to ${endDate}
Location: ${location || "India"}

Provide 3-5 auspicious time windows. All text values (tithi, nakshatra, yoga, quality, reason, generalGuidance) in ${lang}. Return JSON:
{
  "muhurats": [
    {
      "date": "YYYY-MM-DD (must be between ${startDate} and ${endDate})",
      "timeRange": "HH:MM AM/PM - HH:MM AM/PM",
      "tithi": "<tithi name>",
      "nakshatra": "<nakshatra name>",
      "yoga": "<yoga name>",
      "quality": "excellent|good|average",
      "reason": "why this time is auspicious for ${purposeLabel}..."
    }
  ],
  "generalGuidance": "general guidance for ${purposeLabel}..."
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

// POST /api/muhurat
router.post("/muhurat", requireAuth, async (req, res) => {
  try {
    const { purpose, startDate, endDate, location, language } = req.body;

    if (!purpose || !startDate || !endDate) {
      res.status(400).json({ error: "purpose, startDate, and endDate are required" });
      return;
    }

    const result = await generateMuhurats(purpose, startDate, endDate, location || "India", language || "en");

    res.status(201).json({
      purpose: PURPOSE_LABELS[purpose] || purpose,
      muhurats: result.muhurats || [],
      generalGuidance: result.generalGuidance || "Consult a local pandit for precise timings.",
    });
  } catch (err) {
    req.log.error({ err }, "Error creating muhurat");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
