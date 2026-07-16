import { Router } from "express";
import { openai, isOpenAIConfigured } from "../lib/openai";
import { resolveLanguageName } from "../lib/languages";

const router = Router();

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockHoroscope(sign: string) {
  return {
    sign,
    date:          new Date().toISOString().split("T")[0],
    prediction:    "AI horoscope is currently unavailable. The stars align in your favour — trust the process.",
    health:        "Take care of yourself and rest well.",
    career:        "Stay focused and opportunities will come.",
    love:          "Open your heart to possibilities.",
    finance:       "Be mindful of spending this week.",
    luckyNumber:   7,
    luckyColor:    "Gold",
    luckyGem:      "Citrine",
    compatibility: "Aries",
    mood:          "Positive",
    tip:           "Trust your instincts today.",
    rating:        4,
    emoji:         "⭐",
  };
}

async function fetchDailyHoroscope(sign: string, language: string) {
  if (!isOpenAIConfigured()) return mockHoroscope(sign);
  try {
    return await fetchDailyHoroscopeAI(sign, language);
  } catch {
    // AI call failed (network/quota) — serve mock so the feature keeps working
    return mockHoroscope(sign);
  }
}

async function fetchDailyHoroscopeAI(sign: string, language: string) {
  const lang = resolveLanguageName(language);
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `You are a Vedic astrologer. Give a detailed daily horoscope for ${sign} sign in ${lang}.
Return ONLY a JSON object with these exact fields:
{
  "prediction": "2-3 sentence daily prediction",
  "health": "1 sentence health advice",
  "career": "1 sentence career advice",
  "love": "1 sentence love/relationship advice",
  "finance": "1 sentence finance advice",
  "luckyNumber": <integer 1-9>,
  "luckyColor": "color name",
  "luckyGem": "gemstone name",
  "compatibility": "most compatible sign today",
  "mood": "one word mood",
  "tip": "practical tip for today",
  "rating": <integer 1-5>,
  "emoji": "one emoji representing today"
}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const data = JSON.parse(response.choices[0].message.content || "{}");
  return {
    sign,
    date: new Date().toISOString().split("T")[0],
    language,
    ...data,
    luckyNumber: Number(data.luckyNumber) || 7,
    rating:      Number(data.rating) || 4,
  };
}

function mockWeeklyHoroscope(sign: string) {
  return {
    sign,
    weekStart: getMonday(),
    weekEnd:   getSunday(),
    prediction: "This week brings steady progress. Focus your energy mid-week when planetary support peaks, and use the weekend to recharge and reconnect with family.",
    highlights: ["Career momentum builds mid-week", "A financial matter resolves favourably", "Good time to strengthen relationships"],
    luckyDays: ["Wednesday", "Friday"],
    luckyNumber: 7,
    luckyColor: "Blue",
    theme: "Growth",
  };
}

async function fetchWeeklyHoroscope(sign: string, language: string) {
  if (!isOpenAIConfigured()) return mockWeeklyHoroscope(sign);
  try {
    return await fetchWeeklyHoroscopeAI(sign, language);
  } catch {
    return mockWeeklyHoroscope(sign);
  }
}

async function fetchWeeklyHoroscopeAI(sign: string, language: string) {
  const lang = resolveLanguageName(language);
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `You are a Vedic astrologer. Give a weekly horoscope for ${sign} sign for the week of ${getMonday()} to ${getSunday()} in ${lang}.
Return ONLY a JSON object:
{
  "prediction": "2-3 sentence weekly overview",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"],
  "luckyDays": ["day1", "day2"],
  "luckyNumber": <integer 1-9>,
  "luckyColor": "color name",
  "theme": "one word theme for the week",
  "health": "weekly health advice",
  "career": "weekly career advice",
  "love": "weekly love advice",
  "finance": "weekly finance advice"
}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const data = JSON.parse(response.choices[0].message.content || "{}");
  return {
    sign,
    weekStart: getMonday(),
    weekEnd:   getSunday(),
    language,
    ...data,
    luckyNumber: Number(data.luckyNumber) || 7,
  };
}

function getMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split("T")[0];
}

function getSunday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  return new Date(d.setDate(diff)).toISOString().split("T")[0];
}

function validateSign(sign: string): string | null {
  const s = sign.toLowerCase();
  return ZODIAC_SIGNS.includes(s) ? s : null;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/horoscope/signs — list all zodiac signs (MUST be before /:sign)
router.get("/horoscope/signs", (_req, res) => {
  res.json({ signs: ZODIAC_SIGNS });
});

// GET /api/horoscope/daily/:sign — daily horoscope by path param (used by frontend)
router.get("/horoscope/daily/:sign", async (req, res) => {
  const sign = validateSign(req.params["sign"] as string);
  if (!sign) {
    res.status(400).json({ error: `Invalid zodiac sign "${req.params["sign"]}"`, validSigns: ZODIAC_SIGNS });
    return;
  }
  const { lang = "en", language = lang } = req.query as Record<string, string>;
  try {
    const result = await fetchDailyHoroscope(sign, language);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error fetching daily horoscope");
    res.status(500).json({ error: "Internal server error", message: "Failed to generate horoscope" });
  }
});

// GET /api/horoscope/weekly/:sign — weekly horoscope
router.get("/horoscope/weekly/:sign", async (req, res) => {
  const sign = validateSign(req.params["sign"] as string);
  if (!sign) {
    res.status(400).json({ error: `Invalid zodiac sign "${req.params["sign"]}"`, validSigns: ZODIAC_SIGNS });
    return;
  }
  const { language = "en" } = req.query as Record<string, string>;
  try {
    const result = await fetchWeeklyHoroscope(sign, language);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error fetching weekly horoscope");
    res.status(500).json({ error: "Internal server error", message: "Failed to generate weekly horoscope" });
  }
});

// GET /api/horoscope?sign=aries&language=en — query-param version
router.get("/horoscope", async (req, res) => {
  const { sign, language = "en" } = req.query as Record<string, string>;

  if (!sign) {
    res.status(400).json({
      error:      "sign query parameter is required",
      validSigns: ZODIAC_SIGNS,
      example:    "/api/horoscope?sign=aries",
    });
    return;
  }

  const normalised = validateSign(sign);
  if (!normalised) {
    res.status(400).json({ error: `Invalid sign "${sign}"`, validSigns: ZODIAC_SIGNS });
    return;
  }

  try {
    const result = await fetchDailyHoroscope(normalised, language);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error fetching horoscope");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/horoscope/:sign — path-param shorthand (MUST be after /signs and /daily/:sign)
router.get("/horoscope/:sign", async (req, res) => {
  const sign = validateSign(req.params["sign"] as string);
  if (!sign) {
    res.status(404).json({ error: `Invalid zodiac sign "${req.params["sign"]}"`, validSigns: ZODIAC_SIGNS });
    return;
  }
  const { language = "en" } = req.query as Record<string, string>;
  try {
    const result = await fetchDailyHoroscope(sign, language);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error fetching horoscope");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
