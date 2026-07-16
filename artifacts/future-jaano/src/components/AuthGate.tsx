import { useEffect, useState } from 'react';
import { useUser } from '@/lib/clerk';
import { useLocation } from 'wouter';
import { useLanguage } from '@/lib/language';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Sparkles, Brain, Lock, Star, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';

interface FeatureCtx {
  icon?: LucideIcon;
  titleEn: string;
  titleHi: string;
  descEn?: string;
  descHi?: string;
}

interface AuthGateProps {
  children: React.ReactNode;
  feature?: FeatureCtx;
}

const testimonials = [
  { text: 'Career guidance was surprisingly accurate.', author: 'Rahul', city: 'Delhi', rating: 5 },
  { text: 'Vastu remedies transformed my home energy completely.', author: 'Priya', city: 'Mumbai', rating: 5 },
  { text: 'Best AI astrology platform I have ever used.', author: 'Amit', city: 'Bengaluru', rating: 5 },
];

const testimonialHi = [
  { text: 'करियर मार्गदर्शन आश्चर्यजनक रूप से सटीक था।', author: 'राहुल', city: 'दिल्ली', rating: 5 },
  { text: 'वास्तु उपायों ने मेरे घर की ऊर्जा बदल दी।', author: 'प्रिया', city: 'मुंबई', rating: 5 },
  { text: 'यह AI ज्योतिष का सबसे अच्छा प्लेटफ़ॉर्म है।', author: 'अमित', city: 'बेंगलुरु', rating: 5 },
];

const ZODIAC = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const STARS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  delay: Math.random() * 3,
  duration: Math.random() * 2 + 2,
}));

const ZODIACS_POS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  symbol: ZODIAC[Math.floor(Math.random() * ZODIAC.length)],
  x: Math.random() * 90 + 5,
  y: Math.random() * 90 + 5,
  size: Math.random() * 16 + 12,
  delay: Math.random() * 4,
}));

export function AuthGate({ children, feature }: AuthGateProps) {
  const { isSignedIn, isLoaded } = useUser();
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  // If Clerk fails to initialise (bad/missing key, blocked network, wrong
  // domain), isLoaded stays false forever and the page used to render blank.
  // After a short timeout we fall through to the sign-in card instead.
  const [authTimedOut, setAuthTimedOut] = useState(false);

  const list = language === 'hi' ? testimonialHi : testimonials;

  useEffect(() => {
    if (isLoaded) return;
    const timer = setTimeout(() => setAuthTimedOut(true), 6000);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => {
      setTestimonialIdx(i => (i + 1) % list.length);
    }, 3500);
    return () => clearInterval(id);
  }, [autoplay, list.length]);

  if (!isLoaded && !authTimedOut) {
    // Visible loading state instead of a blank page
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-sm text-white/50">
          {t('Loading…', 'लोड हो रहा है…')}
        </p>
      </div>
    );
  }
  if (isSignedIn) return <>{children}</>;

  const prev = () => { setAutoplay(false); setTestimonialIdx(i => (i - 1 + list.length) % list.length); };
  const next = () => { setAutoplay(false); setTestimonialIdx(i => (i + 1) % list.length); };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 overflow-hidden">

      {/* Background stars */}
      {STARS.map(s => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white/70 pointer-events-none"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.3, 1] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Background zodiac symbols */}
      {ZODIACS_POS.map(z => (
        <motion.div
          key={z.id}
          className="absolute pointer-events-none select-none text-primary/10 font-serif"
          style={{ left: `${z.x}%`, top: `${z.y}%`, fontSize: z.size }}
          animate={{ opacity: [0.05, 0.15, 0.05], y: [-4, 4, -4] }}
          transition={{ duration: 5 + z.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          {z.symbol}
        </motion.div>
      ))}

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Glow ring behind card */}
        <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-2xl -z-10 scale-105" />

        <div className="bg-[hsl(230,55%,11%)] border border-primary/25 rounded-3xl overflow-hidden shadow-2xl shadow-black/60">

          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="p-8 space-y-7">

            {/* Feature / Shield icon */}
            <div className="flex justify-center">
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center shadow-lg shadow-primary/20">
                  {feature?.icon ? (
                    <feature.icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
                  ) : (
                    <ShieldCheck className="w-10 h-10 text-primary" strokeWidth={1.5} />
                  )}
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-primary-foreground" />
                </div>
              </motion.div>
            </div>

            {/* Heading */}
            <div className="text-center space-y-2">
              {feature && (
                <p className="text-xs font-semibold text-primary uppercase tracking-widest">
                  {t('Sign in to unlock', 'अनलॉक करने के लिए साइन इन करें')}
                </p>
              )}
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white leading-tight">
                {feature
                  ? t(feature.titleEn, feature.titleHi)
                  : t('Trusted AI Guidance for Your Future', 'आपके भविष्य के लिए विश्वसनीय AI मार्गदर्शन')}
              </h2>
              <p className="text-sm text-white/65 leading-relaxed">
                {feature && feature.descEn && feature.descHi
                  ? t(feature.descEn, feature.descHi)
                  : t(
                      'Join thousands receiving accurate insights based on Lal Kitab, Atharvaved, Vastu Shastra, and Yog Pradeepam.',
                      'हजारों लोगों के साथ जुड़ें जो लाल किताब, अथर्ववेद, वास्तु और योग प्रदीपम पर आधारित सटीक ज्ञान प्राप्त कर रहे हैं।'
                    )}
              </p>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <Brain className="w-3.5 h-3.5" />, en: 'AI-Powered Analysis', hi: 'AI-संचालित विश्लेषण' },
                { icon: <Star className="w-3.5 h-3.5" />, en: 'Ancient Vedic Wisdom', hi: 'प्राचीन वैदिक ज्ञान' },
                { icon: <Lock className="w-3.5 h-3.5" />, en: 'Secure & Private', hi: 'सुरक्षित और निजी' },
                { icon: <ShieldCheck className="w-3.5 h-3.5" />, en: 'Personalized Remedies', hi: 'व्यक्तिगत उपाय' },
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -12 : 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                  className="flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-xl px-3 py-2.5"
                >
                  <span className="text-primary shrink-0">{badge.icon}</span>
                  <span className="text-xs font-medium text-white/85">{t(badge.en, badge.hi)}</span>
                </motion.div>
              ))}
            </div>

            {/* Social proof */}
            <div className="grid grid-cols-3 gap-3 py-3 border-y border-white/8">
              {[
                { num: '50K+', en: 'Predictions', hi: 'भविष्यवाणियाँ' },
                { num: '4.9★', en: 'User Rating', hi: 'रेटिंग' },
                { num: '🌏', en: 'Pan-India', hi: 'पूरे भारत' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-lg font-bold text-primary">{stat.num}</p>
                  <p className="text-xs text-white/55 mt-0.5">{t(stat.en, stat.hi)}</p>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 28px rgba(245,181,46,0.5)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setLocation('/sign-in')}
              className="w-full h-13 py-3.5 rounded-2xl font-bold text-base text-primary-foreground cursor-pointer"
              style={{ background: 'linear-gradient(135deg, hsl(38,90%,50%) 0%, hsl(38,90%,65%) 100%)' }}
            >
              ✨ {t('Sign In / Create Free Account', 'साइन इन / निःशुल्क खाता बनाएं')}
            </motion.button>

            {/* Accuracy assurance */}
            <div className="bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-white/60 leading-relaxed">
                {t(
                  'Our AI combines traditional Vedic knowledge with advanced intelligence to provide deeply researched and personalized guidance.',
                  'हमारा AI पारंपरिक वैदिक ज्ञान और उन्नत बुद्धिमत्ता को मिलाकर गहन शोध पर आधारित व्यक्तिगत मार्गदर्शन प्रदान करता है।'
                )}
              </p>
            </div>

            {/* Testimonials */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest text-center">
                {t('What users say', 'उपयोगकर्ता क्या कहते हैं')}
              </p>
              <div className="relative bg-white/4 border border-white/10 rounded-2xl px-5 py-4 min-h-[88px] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={testimonialIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-2"
                  >
                    <div className="flex gap-0.5">
                      {Array.from({ length: list[testimonialIdx].rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-primary fill-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-white/80 italic leading-relaxed">
                      "{list[testimonialIdx].text}"
                    </p>
                    <p className="text-xs text-primary font-semibold">
                      — {list[testimonialIdx].author}, {list[testimonialIdx].city}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Prev / Next */}
                <div className="absolute right-2 top-2 flex gap-1">
                  <button
                    onClick={prev}
                    aria-label={t('Previous testimonial', 'पिछला प्रशंसापत्र')}
                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={next}
                    aria-label={t('Next testimonial', 'अगला प्रशंसापत्र')}
                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                  >
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                {/* Dots */}
                <div className="flex justify-center gap-1.5 mt-3">
                  {list.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setAutoplay(false); setTestimonialIdx(i); }}
                      aria-label={t(`Go to testimonial ${i + 1}`, `प्रशंसापत्र ${i + 1} पर जाएं`)}
                      aria-current={i === testimonialIdx ? 'true' : undefined}
                      className={`rounded-full transition-all duration-300 ${i === testimonialIdx ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-white/25'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Security message */}
            <p className="text-center text-xs text-white/40 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" />
              {t(
                'Your information is fully encrypted and kept confidential.',
                'आपकी जानकारी पूरी तरह एन्क्रिप्टेड और गोपनीय है।'
              )}
            </p>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
