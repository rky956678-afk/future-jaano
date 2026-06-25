import type { PushPayload } from "./webPush";

const ZODIAC_NAMES: Record<string, Record<string, string>> = {
  en: {
    aries: "Aries", taurus: "Taurus", gemini: "Gemini", cancer: "Cancer",
    leo: "Leo", virgo: "Virgo", libra: "Libra", scorpio: "Scorpio",
    sagittarius: "Sagittarius", capricorn: "Capricorn", aquarius: "Aquarius", pisces: "Pisces",
  },
  hi: {
    aries: "मेष", taurus: "वृषभ", gemini: "मिथुन", cancer: "कर्क",
    leo: "सिंह", virgo: "कन्या", libra: "तुला", scorpio: "वृश्चिक",
    sagittarius: "धनु", capricorn: "मकर", aquarius: "कुम्भ", pisces: "मीन",
  },
};

export function buildPayload(language: string, zodiacSign: string | null): PushPayload {
  const lang = language in ZODIAC_NAMES ? language : "en";
  const names = ZODIAC_NAMES[lang]!;
  if (zodiacSign && zodiacSign.toLowerCase() in names) {
    const signName = names[zodiacSign.toLowerCase()]!;
    const title = lang === "hi"
      ? `आज का राशिफल – ${signName}`
      : `Daily Horoscope - ${signName}`;
    const body = lang === "hi"
      ? `${signName} राशि का आज का भविष्यफल देखें।`
      : `Check your ${signName} horoscope for today.`;
    return { title, body, url: "/horoscope", tag: `horoscope-${zodiacSign}` };
  }
  const title = lang === "hi" ? "Future Jaano - आज का अपडेट" : "Future Jaano - Daily Update";
  const body = lang === "hi"
    ? "अपना आज का राशिफल और भविष्यफल देखें।"
    : "See your daily horoscope and predictions for today.";
  return { title, body, url: "/horoscope", tag: "daily-update" };
}
