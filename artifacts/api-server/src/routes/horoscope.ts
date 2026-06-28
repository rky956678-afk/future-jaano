import { Router } from "express";
import { openai, isOpenAIConfigured } from "../lib/openai";
import { resolveLanguageName } from "../lib/languages";

const router = Router();

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

async function fetchHoroscope(sign: string, language: string) {
  if (!isOpenAIConfigured()) {
    return {
      sign,
      date: new Date().toISOString().split("T")[0],
      prediction: "AI horoscope is currently unavailable. Please try again later.",
      luckyNumber: "7",
      luckyColor: "Gold",
      mood: "Positive",
      tip: "Trust your instincts today.",
    };
  }

  const lang = resolveLanguageName(language);
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `You are a Vedic astrologer. Give a daily horoscope for ${sign} sign in ${lang}. Format as JSON with these exact fields: { "prediction": "detailed daily prediction", "luckyNumber": "number", "luckyColor": "color", "mood": "mood", "tip": "practical tip for today" }`,
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
  };
}

// GET /api/horoscope?sign=aries&language=en
router.get("/horoscope", async (req, res) => {
  const { sign, language = "en" } = req.query as Record<string, string>;

  if (!sign) {
    res.status(400).json({
      error: "sign query parameter is required",
      validSigns: ZODIAC_SIGNS,
      example: "/api/horoscope?sign=aries",
    });
    return;
  }

  const normalised = sign.toLowerCase();
  if (!ZODIAC_SIGNS.includes(normalised)) {
    res.status(400).json({
      error: `Invalid sign "${sign}"`,
      validSigns: ZODIAC_SIGNS,
    });
    return;
  }

  try {
    const result = await fetchHoroscope(normalised, language);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error fetching horoscope");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/horoscope/:sign
router.get("/horoscope/:sign", async (req, res) => {
  const sign = (req.params["sign"] as string).toLowerCase();
  const { language = "en" } = req.query as Record<string, string>;

  if (!ZODIAC_SIGNS.includes(sign)) {
    res.status(404).json({
      error: `Invalid zodiac sign "${sign}"`,
      validSigns: ZODIAC_SIGNS,
    });
    return;
  }

  try {
    const result = await fetchHoroscope(sign, language);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error fetching horoscope");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/horoscope/signs — list all zodiac signs
router.get("/horoscope/signs", (_req, res) => {
  res.json({ signs: ZODIAC_SIGNS });
});

export default router;
