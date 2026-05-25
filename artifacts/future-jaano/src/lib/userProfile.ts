const SIGN_KEY = 'fj_user_sign';
const BANNER_DISMISSED_KEY = 'fj_morning_banner_last';

export const ZODIAC_KEYS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
] as const;

export type ZodiacKey = typeof ZODIAC_KEYS[number];

export function getUserSign(): ZodiacKey | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(SIGN_KEY);
    if (v && (ZODIAC_KEYS as readonly string[]).includes(v)) return v as ZodiacKey;
    return null;
  } catch {
    return null;
  }
}

export function setUserSign(sign: ZodiacKey): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(SIGN_KEY, sign); } catch { /* noop */ }
}

export function clearUserSign(): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(SIGN_KEY); } catch { /* noop */ }
}

// Module-level cache of the latest fetched horoscope, used by the notification
// scheduler to build a personalized message without making a synchronous
// network call from the timer callback.
export interface CachedHoroscope {
  sign: ZodiacKey;
  lang: string;
  prediction: string;
  signLabel: string;
  fetchedAt: number;
}

let cachedHoroscope: CachedHoroscope | null = null;

export function setCachedHoroscope(h: CachedHoroscope | null): void {
  cachedHoroscope = h;
}

export function getCachedHoroscope(): CachedHoroscope | null {
  return cachedHoroscope;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function wasMorningBannerDismissedToday(): boolean {
  if (typeof window === 'undefined') return false;
  try { return localStorage.getItem(BANNER_DISMISSED_KEY) === todayKey(); } catch { return false; }
}

export function dismissMorningBannerToday(): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(BANNER_DISMISSED_KEY, todayKey()); } catch { /* noop */ }
}

export function isMorning(): boolean {
  const h = new Date().getHours();
  return h >= 4 && h < 12;
}

export function greetingFor(lang: string): string {
  const isHi = lang !== 'en';
  const h = new Date().getHours();
  if (h >= 4 && h < 12) return isHi ? 'सुप्रभात' : 'Good Morning';
  if (h >= 12 && h < 17) return isHi ? 'नमस्कार' : 'Good Afternoon';
  if (h >= 17 && h < 21) return isHi ? 'शुभ संध्या' : 'Good Evening';
  return isHi ? 'शुभ रात्रि' : 'Good Night';
}
