import { Router } from "express";
import type { PushPayload } from "../lib/webPush";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Push route working",
  });
});

// Zodiac sign display names per language
const ZODIAC_NAMES: Record<string, Record<string, string>> = {
  en: {
    aries: "Aries", taurus: "Taurus", gemini: "Gemini", cancer: "Cancer",
    leo: "Leo", virgo: "Virgo", libra: "Libra", scorpio: "Scorpio",
    sagittarius: "Sagittarius", capricorn: "Capricorn", aquarius: "Aquarius", pisces: "Pisces",
  },
  hi: {
    aries: "à¤®à¥‡à¤·", taurus: "à¤µà¥ƒà¤·à¤­", gemini: "à¤®à¤¿à¤¥à¥à¤¨", cancer: "à¤•à¤°à¥à¤•",
    leo: "à¤¸à¤¿à¤‚à¤¹", virgo: "à¤•à¤¨à¥à¤¯à¤¾", libra: "à¤¤à¥à¤²à¤¾", scorpio: "à¤µà¥ƒà¤¶à¥à¤šà¤¿à¤•",
    sagittarius: "à¤§à¤¨à¥", capricorn: "à¤®à¤•à¤°", aquarius: "à¤•à¥à¤®à¥à¤­", pisces: "à¤®à¥€à¤¨",
  },
};

export function buildPayload(language: string, zodiacSign: string | null): PushPayload {
  const lang = language in ZODIAC_NAMES ? language : "en";
  const names = ZODIAC_NAMES[lang]!;

  if (zodiacSign && zodiacSign.toLowerCase() in names) {
    const signName = names[zodiacSign.toLowerCase()]!;
    const title = lang === "hi"
      ? `à¤†à¤œ à¤•à¤¾ à¤°à¤¾à¤¶à¤¿à¤«à¤² â€“ ${signName}`
      : `Daily Horoscope â€“ ${signName}`;
    const body = lang === "hi"
      ? `${signName} à¤°à¤¾à¤¶à¤¿ à¤•à¤¾ à¤†à¤œ à¤•à¤¾ à¤­à¤µà¤¿à¤·à¥à¤¯à¤«à¤² à¤¦à¥‡à¤–à¥‡à¤‚à¥¤`
      : `Check your ${signName} horoscope for today.`;
    return { title, body, url: "/horoscope", tag: `horoscope-${zodiacSign}` };
  }

  const title = lang === "hi" ? "Future Jaano â€“ à¤†à¤œ à¤•à¤¾ à¤…à¤ªà¤¡à¥‡à¤Ÿ" : "Future Jaano â€“ Daily Update";
  const body = lang === "hi"
    ? "à¤…à¤ªà¤¨à¤¾ à¤†à¤œ à¤•à¤¾ à¤°à¤¾à¤¶à¤¿à¤«à¤² à¤”à¤° à¤­à¤µà¤¿à¤·à¥à¤¯à¤«à¤² à¤¦à¥‡à¤–à¥‡à¤‚à¥¤"
    : "See your daily horoscope and predictions for today.";
  return { title, body, url: "/horoscope", tag: "daily-update" };
}

export default router;