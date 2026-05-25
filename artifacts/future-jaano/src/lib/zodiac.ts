const SIGN_HI: Record<string, string> = {
  aries: 'मेष',
  taurus: 'वृषभ',
  gemini: 'मिथुन',
  cancer: 'कर्क',
  leo: 'सिंह',
  virgo: 'कन्या',
  libra: 'तुला',
  scorpio: 'वृश्चिक',
  sagittarius: 'धनु',
  capricorn: 'मकर',
  aquarius: 'कुम्भ',
  pisces: 'मीन',
};

const SIGN_EN: Record<string, string> = {
  aries: 'Aries',
  taurus: 'Taurus',
  gemini: 'Gemini',
  cancer: 'Cancer',
  leo: 'Leo',
  virgo: 'Virgo',
  libra: 'Libra',
  scorpio: 'Scorpio',
  sagittarius: 'Sagittarius',
  capricorn: 'Capricorn',
  aquarius: 'Aquarius',
  pisces: 'Pisces',
};

const HI_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(SIGN_HI).map(([k, v]) => [v, k])
);

function normalizeSign(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (SIGN_EN[lower]) return lower;
  if (HI_TO_KEY[trimmed]) return HI_TO_KEY[trimmed];
  // also try first word ("Aries (Mesha)" -> "aries")
  const firstWord = lower.split(/[\s(/,]/)[0];
  if (firstWord && SIGN_EN[firstWord]) return firstWord;
  return null;
}

export function localizeSign(value: string | null | undefined, lang: 'hi' | 'en'): string {
  if (!value) return '';
  const key = normalizeSign(value);
  if (!key) return value;
  return lang === 'hi' ? SIGN_HI[key]! : SIGN_EN[key]!;
}

const ACTIVITY_HI: Record<string, string> = {
  kundli: 'कुण्डली',
  horoscope: 'राशिफल',
  vastu: 'वास्तु',
  palm: 'हस्तरेखा',
  face: 'मुख रेखा',
  numerology: 'अंक ज्योतिष',
  yoga: 'योग',
  problem: 'समस्या समाधान',
  remedy: 'उपाय',
  panchang: 'पंचांग',
  gochar: 'गोचर',
  ashtakavarga: 'अष्टकवर्ग',
};

const ACTIVITY_EN: Record<string, string> = {
  kundli: 'Kundli',
  horoscope: 'Horoscope',
  vastu: 'Vastu',
  palm: 'Palm Reading',
  face: 'Face Reading',
  numerology: 'Numerology',
  yoga: 'Yoga',
  problem: 'Problem Solver',
  remedy: 'Remedies',
  panchang: 'Panchang',
  gochar: 'Gochar',
  ashtakavarga: 'Ashtakavarga',
};

export function localizeActivityType(type: string, lang: 'hi' | 'en'): string {
  const key = type.toLowerCase();
  const map = lang === 'hi' ? ACTIVITY_HI : ACTIVITY_EN;
  return map[key] || (type.charAt(0).toUpperCase() + type.slice(1));
}

export function activityRoute(type: string): string {
  const key = type.toLowerCase();
  const routes: Record<string, string> = {
    kundli: '/kundli',
    horoscope: '/horoscope',
    vastu: '/vastu',
    palm: '/palm',
    face: '/face',
    numerology: '/numerology',
    yoga: '/yoga',
    problem: '/problem-solver',
    remedy: '/problem-solver',
    panchang: '/panchang',
    gochar: '/gochar',
    ashtakavarga: '/ashtakavarga',
  };
  return routes[key] || '/dashboard';
}
