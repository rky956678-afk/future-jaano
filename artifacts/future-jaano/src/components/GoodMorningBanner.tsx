import { useEffect, useMemo, useState } from 'react';
import { useUser, useAuth } from '@/lib/clerk';
import { useUpdateMyProfile } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bell, X, Sun, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/language';
import {
  getUserSign,
  setUserSign,
  clearUserSign,
  setCachedHoroscope,
  greetingFor,
  wasMorningBannerDismissedToday,
  dismissMorningBannerToday,
  type ZodiacKey,
} from '@/lib/userProfile';
import { getTodayTip, getTipForLang } from '@/lib/dailyTips';
import {
  getPrefs,
  setPrefs,
  isSupported as notifSupported,
  permissionStatus,
  requestPermission,
} from '@/lib/notifications';
import { subscribeToPush, pushSupported } from '@/lib/pushClient';

const SIGNS: { key: ZodiacKey; nameEn: string; nameHi: string; icon: string }[] = [
  { key: 'aries',       nameEn: 'Aries',       nameHi: 'मेष',     icon: '♈' },
  { key: 'taurus',      nameEn: 'Taurus',      nameHi: 'वृषभ',    icon: '♉' },
  { key: 'gemini',      nameEn: 'Gemini',      nameHi: 'मिथुन',   icon: '♊' },
  { key: 'cancer',      nameEn: 'Cancer',      nameHi: 'कर्क',    icon: '♋' },
  { key: 'leo',         nameEn: 'Leo',         nameHi: 'सिंह',    icon: '♌' },
  { key: 'virgo',       nameEn: 'Virgo',       nameHi: 'कन्या',   icon: '♍' },
  { key: 'libra',       nameEn: 'Libra',       nameHi: 'तुला',    icon: '♎' },
  { key: 'scorpio',     nameEn: 'Scorpio',     nameHi: 'वृश्चिक', icon: '♏' },
  { key: 'sagittarius', nameEn: 'Sagittarius', nameHi: 'धनु',     icon: '♐' },
  { key: 'capricorn',   nameEn: 'Capricorn',   nameHi: 'मकर',     icon: '♑' },
  { key: 'aquarius',    nameEn: 'Aquarius',    nameHi: 'कुम्भ',   icon: '♒' },
  { key: 'pisces',      nameEn: 'Pisces',      nameHi: 'मीन',     icon: '♓' },
];

interface Horoscope {
  sign: string;
  signHindi: string;
  prediction: string;
  luckyColor: string;
  luckyNumber: number;
  emoji: string;
}

export function GoodMorningBanner() {
  const { t, language } = useLanguage();
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [sign, setSign] = useState<ZodiacKey | null>(() => getUserSign());
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(() => wasMorningBannerDismissedToday());
  const [perm, setPerm] = useState<NotificationPermission>(() =>
    typeof window !== 'undefined' && notifSupported() ? permissionStatus() : 'default',
  );
  const [prefs, setLocalPrefs] = useState(() => getPrefs());
  const greeting = useMemo(() => greetingFor(language), [language]);
  const tip = useMemo(() => getTipForLang(getTodayTip(), language), [language]);
  const name = user?.firstName || (isSignedIn ? '' : '');
  const updateProfile = useUpdateMyProfile();

  useEffect(() => {
    if (!sign) { setHoroscope(null); setCachedHoroscope(null); return; }
    let cancelled = false;
    setLoading(true);
    setHoroscope(null);
    const base = import.meta.env.BASE_URL || '/';
    fetch(`${base}api/horoscope/daily/${sign}?lang=${language}`)
      .then(r => r.ok ? r.json() : null)
      .then((d: Horoscope | null) => {
        if (cancelled) return;
        if (d) {
          setHoroscope(d);
          setCachedHoroscope({
            sign,
            lang: language,
            prediction: d.prediction,
            signLabel: language === 'hi' ? (d.signHindi || d.sign) : d.sign,
            fetchedAt: Date.now(),
          });
        } else {
          setHoroscope(null);
          setCachedHoroscope(null);
        }
      })
      .catch(() => { if (!cancelled) { setHoroscope(null); setCachedHoroscope(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [sign, language]);

  function handlePickSign(s: ZodiacKey) {
    setUserSign(s);
    setSign(s);
    if (isSignedIn) {
      updateProfile.mutate({ data: { zodiacSign: s } });
    }
  }

  function handleDismiss() {
    dismissMorningBannerToday();
    setDismissed(true);
  }

  async function handleEnableNotifications() {
    if (!notifSupported()) return;
    const p = await requestPermission();
    setPerm(p);
    if (p === 'granted') {
      const next = { ...prefs, enabled: true };
      setPrefs(next);
      setLocalPrefs(next);

      // Register a real Web Push subscription so the server cron can deliver
      // morning notifications even when the app/browser is closed. Only
      // attempt if signed in (server route requires auth).
      if (isSignedIn && pushSupported()) {
        const [hhStr, mmStr] = (next.dailyHoroscopeTime || '07:00').split(':');
        const hh = Number(hhStr) || 7;
        const mm = Number(mmStr) || 0;
        try {
          await subscribeToPush({
            getToken: () => getToken(),
            hour: hh,
            minute: mm,
            language,
          });
        } catch (err) {
          console.warn('[push] subscribe error', err);
        }
      }
    }
  }

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 pt-6"
      >
        <div className="relative max-w-3xl mx-auto rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-amber-500/8 to-purple-500/10 backdrop-blur-md p-5 sm:p-6 shadow-lg shadow-primary/10 overflow-hidden">
          {/* Decorative sun */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-8 -right-8 text-primary/15 pointer-events-none"
          >
            <Sun className="w-32 h-32" />
          </motion.div>

          <button
            onClick={handleDismiss}
            aria-label={t('Dismiss', 'बंद करें')}
            className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:bg-white/10 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {t('Today for you', 'आज आपके लिए')}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1">
              {greeting}{name ? `, ${name}` : ''} 🙏
            </h2>
            <p className="text-sm text-white/70 mb-4">
              {t(
                'Your personalized cosmic message for today',
                'आज के लिए आपका व्यक्तिगत ब्रह्मांडीय संदेश',
              )}
            </p>

            {!sign ? (
              <div>
                <p className="text-sm text-white/80 mb-3">
                  {t('Pick your rashi to get today\'s shubh sandesh:', 'अपनी राशि चुनें — आज का शुभ संदेश पाएं:')}
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {SIGNS.map(s => (
                    <button
                      key={s.key}
                      onClick={() => handlePickSign(s.key)}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/50 transition-all"
                    >
                      <span className="text-2xl text-primary">{s.icon}</span>
                      <span className="text-[10px] text-white/80 leading-tight">
                        {language === 'hi' ? s.nameHi : s.nameEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/10">
                  <div className="text-4xl">{horoscope?.emoji || '✨'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-primary font-semibold mb-0.5">
                      {language === 'hi' ? (horoscope?.signHindi || '') : (horoscope?.sign || '')}
                    </p>
                    <p className="text-sm sm:text-base text-white leading-snug">
                      {loading
                        ? t('Reading the stars...', 'तारों को पढ़ रहे हैं...')
                        : horoscope?.prediction || t('Your day brings positive energy.', 'आपका दिन सकारात्मक ऊर्जा लाता है।')}
                    </p>
                  </div>
                </div>

                {horoscope && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary">
                      {t('Lucky Color', 'शुभ रंग')}: <strong>{horoscope.luckyColor}</strong>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-200">
                      {t('Lucky #', 'शुभ अंक')}: <strong>{horoscope.luckyNumber}</strong>
                    </span>
                  </div>
                )}

                {/* Daily life tip — practical wisdom that saves money */}
                <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-emerald-500/5 border border-amber-500/20 p-3">
                  <p className="text-xs font-semibold text-amber-300 mb-1">
                    {tip.title}
                  </p>
                  <p className="text-sm text-white/85 leading-snug">
                    {tip.message}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Link href="/horoscope">
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:scale-[1.03] transition-transform">
                      {t('Full Horoscope', 'पूरा राशिफल')} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      clearUserSign();
                      setSign(null);
                      setHoroscope(null);
                      setCachedHoroscope(null);
                      if (isSignedIn) updateProfile.mutate({ data: { zodiacSign: undefined } });
                    }}
                    className="px-3 py-2 rounded-full text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {t('Change rashi', 'राशि बदलें')}
                  </button>
                  {notifSupported() && perm !== 'granted' && (
                    <button
                      onClick={handleEnableNotifications}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 border border-white/15 text-xs text-white/90 hover:bg-white/10 transition-colors"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      {t('Daily morning alerts', 'रोज़ सुबह अलर्ट')}
                    </button>
                  )}
                  {prefs.enabled && perm === 'granted' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-200">
                      <Bell className="w-3.5 h-3.5" />
                      {t(`Alerts on at ${prefs.dailyHoroscopeTime}`, `${prefs.dailyHoroscopeTime} पर अलर्ट चालू`)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
