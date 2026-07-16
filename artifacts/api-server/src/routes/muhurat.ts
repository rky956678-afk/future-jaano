import { languageInstruction } from "../lib/languages";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { aiJson } from "../lib/openai";
import { fallbackMuhurat } from "../lib/fallbacks";

const router = Router();

import {
  jdFromISO, panchang, inauspiciousWindows, geocodeCity, NAKSHATRAS_EN, NAKSHATRAS_HI,
} from "../lib/jyotish";

// Classical auspicious nakshatras (by index)
const SHUBH_NAKS = new Set([0, 3, 4, 7, 11, 12, 13, 14, 16, 20, 21, 22, 23, 25, 26]);
// Rikta tithis (4th, 9th, 14th of each paksha) + Amavasya are avoided
const RIKTA_TITHI = new Set([3, 8, 13, 18, 23, 28, 29]);
// Inauspicious yogas by index
const BAD_YOGAS = new Set([5, 8, 9, 12, 14, 16, 18, 26]); // Atiganda, Shula, Ganda, Vyaghata, Vajra, Vyatipata, Parigha, Vaidhriti

const TITHI_HI_SHORT: Record<string, string> = {
  Pratipada: "प्रतिपदा", Dwitiya: "द्वितीया", Tritiya: "तृतीया", Chaturthi: "चतुर्थी",
  Panchami: "पंचमी", Shashthi: "षष्ठी", Saptami: "सप्तमी", Ashtami: "अष्टमी",
  Navami: "नवमी", Dashami: "दशमी", Ekadashi: "एकादशी", Dwadashi: "द्वादशी",
  Trayodashi: "त्रयोदशी", Chaturdashi: "चतुर्दशी", Purnima: "पूर्णिमा", Amavasya: "अमावस्या",
};

/** Scan the date range with the jyotish engine and score each day's panchang. */
function computeRealMuhurats(startDate: string, endDate: string, location: string, hindi: boolean) {
  const geo = geocodeCity(location);
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  const maxDays = Math.min(90, Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1));

  const scored: Array<{ date: string; score: number; p: ReturnType<typeof panchang>; weekday: number }> = [];
  for (let i = 0; i < maxDays; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const iso = d.toISOString().split("T")[0]!;
    const p = panchang(jdFromISO(iso, "09:00"));
    let score = 0;
    if (SHUBH_NAKS.has(p.nakshatraIndex)) score += 2;
    if (!RIKTA_TITHI.has(p.tithiIndex)) score += 1;
    if (!BAD_YOGAS.has(p.yogaIndex)) score += 1;
    if (p.karanaName !== "Vishti") score += 1; // Bhadra avoided
    scored.push({ date: iso, score, p, weekday: d.getDay() });
  }

  scored.sort((a, b) => b.score - a.score || a.date.localeCompare(b.date));
  const top = scored.slice(0, 5).filter((s) => s.score >= 3);
  const picks = top.length >= 3 ? top : scored.slice(0, 3);

  return picks.map((s) => {
    const w = inauspiciousWindows(s.date, s.weekday, geo.lat, geo.lon);
    const baseTithi = s.p.tithiName.replace(/^(Shukla|Krishna) /, "");
    return {
      date: s.date,
      timeRange: w.abhijitMuhurat,
      tithi: hindi ? (TITHI_HI_SHORT[baseTithi] || s.p.tithiName) : s.p.tithiName,
      nakshatra: hindi ? NAKSHATRAS_HI[s.p.nakshatraIndex]! : NAKSHATRAS_EN[s.p.nakshatraIndex]!,
      yoga: s.p.yogaName,
      quality: s.score >= 5 ? "excellent" : s.score >= 4 ? "good" : "average",
      reason: hindi
        ? `${NAKSHATRAS_HI[s.p.nakshatraIndex]} नक्षत्र एवं ${s.p.yogaName} योग में अभिजीत मुहूर्त — राहुकाल (${w.rahuKaal}) से बचें।`
        : `Abhijit muhurat during ${NAKSHATRAS_EN[s.p.nakshatraIndex]} nakshatra and ${s.p.yogaName} yoga — avoid Rahu Kaal (${w.rahuKaal}).`,
    };
  });
}

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

  return aiJson(
    [
      { role: "system", content: instruction },
      { role: "user", content: prompt },
    ],
    fallbackMuhurat(purposeLabel, startDate, endDate, language),
  );
}

// POST /api/muhurat
router.post("/muhurat", requireAuth, async (req, res) => {
  try {
    const { purpose, startDate, endDate, location, language } = req.body;

    if (!purpose || !startDate || !endDate) {
      res.status(400).json({ error: "purpose, startDate, and endDate are required" });
      return;
    }

    const hindi = (language || "en").toLowerCase().startsWith("hi");
    // ── Real panchang-scored muhurats from the jyotish engine ──
    const realMuhurats = computeRealMuhurats(startDate, endDate, location || "Delhi", hindi);

    // AI supplies purpose-specific general guidance only (with fallback)
    const result = await generateMuhurats(purpose, startDate, endDate, location || "India", language || "en");

    res.status(201).json({
      purpose: PURPOSE_LABELS[purpose] || purpose,
      muhurats: realMuhurats,
      generalGuidance: result.generalGuidance || "Consult a local pandit for precise timings.",
    });
  } catch (err) {
    req.log.error({ err }, "Error creating muhurat");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
