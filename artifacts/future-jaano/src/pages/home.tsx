import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Star, Lock, Brain, Sparkles, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { GoodMorningBanner } from '@/components/GoodMorningBanner';

function SriYantra() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="yantGold" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE066" stopOpacity="1" />
          <stop offset="50%" stopColor="#F5B52E" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#B8730A" stopOpacity="0.2" />
        </radialGradient>
        <radialGradient id="yantGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F5B52E" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F5B52E" stopOpacity="0" />
        </radialGradient>
        <filter id="yantraGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Outer radial glow */}
      <circle cx="200" cy="200" r="195" fill="url(#yantGlow)" />

      {/* Bhupura – outer square with T-gates */}
      <rect x="22" y="22" width="356" height="356" fill="none" stroke="#F5B52E" strokeWidth="1.2" opacity="0.55" />
      <rect x="34" y="34" width="332" height="332" fill="none" stroke="#F5B52E" strokeWidth="0.6" opacity="0.35" />
      <rect x="46" y="46" width="308" height="308" fill="none" stroke="#F5B52E" strokeWidth="0.6" opacity="0.25" />

      {/* Top gate */}
      <path d="M168,22 L168,46 L148,46 L148,60 L252,60 L252,46 L232,46 L232,22Z"
        fill="hsl(230,55%,8%)" stroke="#F5B52E" strokeWidth="1" opacity="0.75" />
      {/* Bottom gate */}
      <path d="M168,378 L168,354 L148,354 L148,340 L252,340 L252,354 L232,354 L232,378Z"
        fill="hsl(230,55%,8%)" stroke="#F5B52E" strokeWidth="1" opacity="0.75" />
      {/* Left gate */}
      <path d="M22,168 L46,168 L46,148 L60,148 L60,252 L46,252 L46,232 L22,232Z"
        fill="hsl(230,55%,8%)" stroke="#F5B52E" strokeWidth="1" opacity="0.75" />
      {/* Right gate */}
      <path d="M378,168 L354,168 L354,148 L340,148 L340,252 L354,252 L354,232 L378,232Z"
        fill="hsl(230,55%,8%)" stroke="#F5B52E" strokeWidth="1" opacity="0.75" />

      {/* 16-petal outer lotus */}
      {Array.from({ length: 16 }).map((_, i) => {
        const a = ((i * 22.5) - 90) * Math.PI / 180;
        const pa = 11.25 * Math.PI / 180;
        const outerR = 152, innerR = 108;
        const ox = 200 + outerR * Math.cos(a), oy = 200 + outerR * Math.sin(a);
        const x1 = 200 + innerR * Math.cos(a - pa), y1 = 200 + innerR * Math.sin(a - pa);
        const x2 = 200 + innerR * Math.cos(a + pa), y2 = 200 + innerR * Math.sin(a + pa);
        return <path key={`lp16-${i}`} d={`M${x1},${y1} Q${ox},${oy} ${x2},${y2}`}
          fill="none" stroke="#F5B52E" strokeWidth="0.9" opacity="0.38" />;
      })}

      {/* 8-petal inner lotus */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = ((i * 45) - 90) * Math.PI / 180;
        const pa = 22.5 * Math.PI / 180;
        const outerR = 112, innerR = 76;
        const ox = 200 + outerR * Math.cos(a), oy = 200 + outerR * Math.sin(a);
        const x1 = 200 + innerR * Math.cos(a - pa), y1 = 200 + innerR * Math.sin(a - pa);
        const x2 = 200 + innerR * Math.cos(a + pa), y2 = 200 + innerR * Math.sin(a + pa);
        return <path key={`lp8-${i}`} d={`M${x1},${y1} Q${ox},${oy} ${x2},${y2}`}
          fill="none" stroke="#F5B52E" strokeWidth="1.1" opacity="0.5" />;
      })}

      {/* 3 concentric circles */}
      <circle cx="200" cy="200" r="150" fill="none" stroke="#F5B52E" strokeWidth="0.8" opacity="0.45" />
      <circle cx="200" cy="200" r="108" fill="none" stroke="#F5B52E" strokeWidth="0.7" opacity="0.4" />
      <circle cx="200" cy="200" r="76" fill="none" stroke="#F5B52E" strokeWidth="0.6" opacity="0.35" />

      {/* ── 9 interlocked triangles (Sri Yantra pattern) ── */}
      {/* 5 downward (Shakti) */}
      <polygon points="200,68  318,262 82,262"  fill="none" stroke="#F5B52E" strokeWidth="1.6" opacity="0.75" filter="url(#yantraGlow)" />
      <polygon points="200,98  300,248 100,248" fill="none" stroke="#F5B52E" strokeWidth="1.2" opacity="0.65" />
      <polygon points="200,126 282,234 118,234" fill="none" stroke="#F5B52E" strokeWidth="1"   opacity="0.6"  />
      <polygon points="200,150 264,220 136,220" fill="none" stroke="#F5B52E" strokeWidth="0.9" opacity="0.55" />
      <polygon points="200,170 248,210 152,210" fill="none" stroke="#F5B52E" strokeWidth="0.8" opacity="0.5"  />

      {/* 4 upward (Shiva) */}
      <polygon points="200,332 82,138 318,138"  fill="none" stroke="#F5B52E" strokeWidth="1.6" opacity="0.75" filter="url(#yantraGlow)" />
      <polygon points="200,302 100,152 300,152" fill="none" stroke="#F5B52E" strokeWidth="1.2" opacity="0.65" />
      <polygon points="200,274 118,166 282,166" fill="none" stroke="#F5B52E" strokeWidth="1"   opacity="0.6"  />
      <polygon points="200,250 136,180 264,180" fill="none" stroke="#F5B52E" strokeWidth="0.9" opacity="0.55" />

      {/* Central inner triangle */}
      <polygon points="200,185 216,208 184,208" fill="rgba(245,181,46,0.12)" stroke="#FFE066" strokeWidth="1" opacity="0.8" filter="url(#softGlow)" />

      {/* Bindu – central point */}
      <circle cx="200" cy="200" r="14" fill="url(#yantGold)" opacity="0.25" />
      <circle cx="200" cy="200" r="7"  fill="#F5B52E" opacity="0.9" filter="url(#yantraGlow)" />
      <circle cx="200" cy="200" r="3"  fill="#FFF5C0" opacity="1" />
    </svg>
  );
}

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: Math.random() * 2 + 0.5, delay: Math.random() * 4, duration: Math.random() * 3 + 2,
}));
const ZODIAC = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const ZODIACS_POS = Array.from({ length: 10 }, (_, i) => ({
  id: i, symbol: ZODIAC[i % 12],
  x: Math.random() * 90 + 5, y: Math.random() * 90 + 5,
  size: Math.random() * 18 + 14, delay: Math.random() * 5,
}));

const TESTIMONIALS_EN = [
  { text: 'The career guidance was surprisingly accurate. Changed my career path completely.', author: 'Rahul', city: 'Delhi', rating: 5 },
  { text: 'Vastu remedies transformed my home energy. I feel so much more at peace now.', author: 'Priya', city: 'Mumbai', rating: 5 },
  { text: 'Best AI astrology platform I have ever used. Deeply personalized guidance.', author: 'Amit', city: 'Bengaluru', rating: 5 },
  { text: 'Kundli analysis was spot-on. The doshas mentioned were accurate.', author: 'Sunita', city: 'Jaipur', rating: 5 },
];
const TESTIMONIALS_HI = [
  { text: 'करियर मार्गदर्शन आश्चर्यजनक रूप से सटीक था। मेरा पूरा करियर बदल गया।', author: 'राहुल', city: 'दिल्ली', rating: 5 },
  { text: 'वास्तु उपायों ने मेरे घर की ऊर्जा बदल दी। अब बहुत शांति महसूस होती है।', author: 'प्रिया', city: 'मुंबई', rating: 5 },
  { text: 'यह AI ज्योतिष का सबसे अच्छा प्लेटफ़ॉर्म है। बहुत व्यक्तिगत मार्गदर्शन मिला।', author: 'अमित', city: 'बेंगलुरु', rating: 5 },
  { text: 'कुण्डली विश्लेषण बिल्कुल सटीक था। दोष बताए गए वे सही थे।', author: 'सुनीता', city: 'जयपुर', rating: 5 },
];

const BASE = import.meta.env.BASE_URL;

const FEATURES = [
  { titleEn: 'Horoscope', titleHi: 'राशिफल', link: '/horoscope', icon: '✨', img: `${BASE}assets/rashi-wheel.png`, descEn: 'Daily cosmic guidance', descHi: 'दैनिक ग्रह मार्गदर्शन' },
  { titleEn: 'Kundli', titleHi: 'कुण्डली', link: '/kundli', icon: '📜', img: `${BASE}assets/feature-kundli.png`, descEn: 'Vedic birth chart', descHi: 'वैदिक जन्म पत्रिका' },
  { titleEn: 'Vastu', titleHi: 'वास्तु दोष', link: '/vastu', icon: '🏠', img: `${BASE}assets/feature-vastu.png`, descEn: 'Home energy analysis', descHi: 'घर की ऊर्जा विश्लेषण' },
  { titleEn: 'Palmistry', titleHi: 'हस्तरेखा', link: '/palm-reading', icon: '✋', img: `${BASE}assets/feature-palm.png`, descEn: 'Palm line reading', descHi: 'हाथ की रेखाएं' },
  { titleEn: 'Face Reading', titleHi: 'मुखाकृति', link: '/face-reading', icon: '👤', img: `${BASE}assets/deity-krishna.png`, descEn: 'Samudrika shastra', descHi: 'सामुद्रिक शास्त्र' },
  { titleEn: 'Numerology', titleHi: 'अंक ज्योतिष', link: '/numerology', icon: '🔢', img: `${BASE}assets/feature-yantra.png`, descEn: 'Life path numbers', descHi: 'जीवन पथ संख्या' },
  { titleEn: 'Yoga Plans', titleHi: 'योग', link: '/yoga', icon: '🧘', img: `${BASE}assets/feature-yoga.png`, descEn: 'Personalized routines', descHi: 'व्यक्तिगत योग दिनचर्या' },
  { titleEn: 'Remedies', titleHi: 'उपाय', link: '/problem-solver', icon: '🌿', img: `${BASE}assets/deity-ganesh.png`, descEn: 'Lal Kitab & Vedic', descHi: 'लाल किताब और वैदिक' },
  { titleEn: 'Stree Raksha', titleHi: 'स्त्री रक्षा', link: '/raksha', icon: '🛡️', img: `${BASE}assets/deity-durga.png`, descEn: 'Bhoot-pret upaay & mantra', descHi: 'भूत-प्रेत उपाय और मंत्र' },
];

const DEITIES = [
  { img: `${BASE}assets/deity-ganesh.png`, en: 'Ganesh', hi: 'गणेश' },
  { img: `${BASE}assets/deity-shiva.png`, en: 'Shiva', hi: 'शिव' },
  { img: `${BASE}assets/deity-lakshmi.png`, en: 'Lakshmi', hi: 'लक्ष्मी' },
  { img: `${BASE}assets/deity-hanuman.png`, en: 'Hanuman', hi: 'हनुमान' },
  { img: `${BASE}assets/deity-durga.png`, en: 'Durga', hi: 'दुर्गा' },
  { img: `${BASE}assets/deity-krishna.png`, en: 'Krishna', hi: 'कृष्ण' },
];

const TRUST_BADGES = [
  { icon: <Brain className="w-4 h-4" />, en: 'AI-Powered Analysis', hi: 'AI-संचालित विश्लेषण' },
  { icon: <Star className="w-4 h-4" />, en: 'Ancient Vedic Wisdom', hi: 'प्राचीन वैदिक ज्ञान' },
  { icon: <Lock className="w-4 h-4" />, en: 'Secure & Private', hi: 'सुरक्षित और निजी' },
  { icon: <ShieldCheck className="w-4 h-4" />, en: 'Personalized Remedies', hi: 'व्यक्तिगत उपाय' },
];

const STATS = [
  { num: '50K+', en: 'Accurate Predictions', hi: 'सटीक भविष्यवाणियाँ' },
  { num: '4.9★', en: 'User Rating', hi: 'उपयोगकर्ता रेटिंग' },
  { num: '12+', en: 'Vedic Sciences', hi: 'वैदिक विज्ञान' },
];

export default function Home() {
  const { t, language } = useLanguage();
  const [tIdx, setTIdx] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const list = language === 'hi' ? TESTIMONIALS_HI : TESTIMONIALS_EN;

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => setTIdx(i => (i + 1) % list.length), 4000);
    return () => clearInterval(id);
  }, [autoplay, list.length]);

  const prev = () => { setAutoplay(false); setTIdx(i => (i - 1 + list.length) % list.length); };
  const next = () => { setAutoplay(false); setTIdx(i => (i + 1) % list.length); };

  return (
    <Layout>
      <div className="relative overflow-hidden">

        {/* ── Hero temple background ── */}
        <div
          className="absolute top-0 left-0 right-0 h-[640px] pointer-events-none z-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, hsl(230,55%,8%,0.55), hsl(230,55%,8%,0.85) 60%, hsl(230,55%,8%,1)), url(${BASE}assets/hero-temple.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* ── Background particles ── */}
        {STARS.map(s => (
          <motion.div key={s.id}
            className="absolute rounded-full bg-white/60 pointer-events-none"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
            animate={{ opacity: [0.1, 0.8, 0.1], scale: [1, 1.4, 1] }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
        {ZODIACS_POS.map(z => (
          <motion.div key={z.id}
            className="absolute pointer-events-none select-none text-primary/8 font-serif"
            style={{ left: `${z.x}%`, top: `${z.y}%`, fontSize: z.size }}
            animate={{ opacity: [0.04, 0.12, 0.04], y: [-6, 6, -6] }}
            transition={{ duration: 6 + z.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            {z.symbol}
          </motion.div>
        ))}

        {/* Glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-0 w-64 h-64 rounded-full bg-purple-500/4 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-64 h-64 rounded-full bg-primary/4 blur-3xl pointer-events-none" />

        {/* ── DAILY GREETING BANNER ── */}
        <GoodMorningBanner />

        {/* ── HERO ── */}
        <section className="relative container mx-auto px-4 pt-10 pb-12 text-center max-w-4xl">
          {/* Shield badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-5 py-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                {t('Trusted by 50,000+ Users Across India', '50,000+ भारतीयों का विश्वास')}
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-white drop-shadow-lg leading-tight mb-6"
          >
            {t('Trusted AI Guidance', 'विश्वसनीय AI मार्गदर्शन')}<br />
            <span className="text-primary">{t('for Your Future', 'आपके भविष्य के लिए')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-8"
          >
            {t(
              'Join thousands receiving accurate insights based on Lal Kitab, Atharvaved, Vastu Shastra, and Yog Pradeepam.',
              'हजारों लोगों के साथ जुड़ें जो लाल किताब, अथर्ववेद, वास्तु शास्त्र और योग प्रदीपम पर आधारित सटीक मार्गदर्शन पा रहे हैं।'
            )}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10"
          >
            <Link href="/kundli">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 32px rgba(245,181,46,0.55)' }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg text-primary-foreground shadow-lg shadow-primary/30 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, hsl(38,90%,48%) 0%, hsl(38,90%,65%) 100%)' }}
              >
                <Sparkles className="w-5 h-5" />
                {t('Create Free Kundli', 'मुफ्त कुण्डली बनाएं')}
              </motion.button>
            </Link>
            <Link href="/problem-solver">
              <motion.button
                whileHover={{ scale: 1.04, backgroundColor: 'rgba(245,181,46,0.1)' }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg text-primary border border-primary/50 backdrop-blur-sm bg-transparent cursor-pointer transition-colors"
              >
                {t('Ask a Question', 'प्रश्न पूछें')}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {TRUST_BADGES.map((b, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-primary/8 border border-primary/20 rounded-full px-4 py-1.5">
                <span className="text-primary">{b.icon}</span>
                <span className="text-xs font-medium text-white/80">{t(b.en, b.hi)}</span>
              </div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex justify-center gap-8 md:gap-16 py-6 border-y border-white/8"
          >
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-primary">{s.num}</p>
                <p className="text-xs text-white/50 mt-1">{t(s.en, s.hi)}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── SRI YANTRA SECTION ── */}
        <section className="relative container mx-auto px-4 py-10 max-w-3xl text-center overflow-hidden">
          {/* Large ambient glow behind yantra */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-80 h-80 rounded-full bg-primary/8 blur-3xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-2"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-primary/60 font-semibold">
              {t('Sacred Geometry', 'पवित्र ज्यामिति')}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-2xl md:text-3xl font-serif font-bold text-white mb-2"
          >
            {t('Shri Yantra — The Source of Cosmic Energy', 'श्री यंत्र — ब्रह्मांडीय ऊर्जा का स्रोत')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-white/45 text-sm max-w-md mx-auto mb-8"
          >
            {t(
              'The 9 interlocking triangles of the Shri Yantra represent the union of Shiva and Shakti — the foundation of all Vedic wisdom.',
              'श्री यंत्र के 9 परस्पर जुड़े त्रिकोण शिव और शक्ति के मिलन का प्रतिनिधित्व करते हैं — समस्त वैदिक ज्ञान का आधार।'
            )}
          </motion.p>

          {/* Yantra + outer pulse rings */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative mx-auto w-64 h-64 md:w-80 md:h-80"
          >
            {/* Pulse rings */}
            {[1, 2, 3].map(n => (
              <motion.div key={n}
                className="absolute inset-0 rounded-full border border-primary/20"
                animate={{ scale: [1, 1.18 + n * 0.08], opacity: [0.3, 0] }}
                transition={{ duration: 3, delay: n * 0.9, repeat: Infinity, ease: 'easeOut' }}
              />
            ))}
            {/* Slow continuous rotation */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
              className="w-full h-full"
            >
              <SriYantra />
            </motion.div>
          </motion.div>

          {/* Caption badges below yantra */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { en: 'Lal Kitab', hi: 'लाल किताब' },
              { en: 'Atharvaveda', hi: 'अथर्ववेद' },
              { en: 'Vastu Shastra', hi: 'वास्तु शास्त्र' },
              { en: 'Yog Pradeepam', hi: 'योग प्रदीपम' },
            ].map((b, i) => (
              <motion.span key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="text-xs px-4 py-1.5 rounded-full border border-primary/25 text-primary/70 bg-primary/5 font-medium"
              >
                {t(b.en, b.hi)}
              </motion.span>
            ))}
          </div>
        </section>

        {/* ── FEATURES GRID ── */}
        <section className="container mx-auto px-4 py-12 max-w-5xl">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl md:text-3xl font-serif font-bold text-center text-white mb-3"
          >
            {t('Explore Ancient Sciences', 'प्राचीन विज्ञान खोजें')}
          </motion.h2>
          <p className="text-center text-white/50 text-sm mb-8">
            {t('AI-powered tools rooted in Vedic tradition', 'वैदिक परंपरा पर आधारित AI उपकरण')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.titleEn}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <Link href={f.link}>
                  <motion.div
                    whileHover={{ y: -4, borderColor: 'rgba(245,181,46,0.5)' }}
                    className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden flex flex-col cursor-pointer group transition-all shadow-lg h-full"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/10 to-transparent">
                      <img
                        src={f.img}
                        alt={f.titleEn}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                      <div className="absolute top-2 right-2 text-2xl drop-shadow-lg">{f.icon}</div>
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-semibold text-foreground/95 text-sm leading-tight">
                        {t(f.titleEn, f.titleHi)}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {t(f.descEn, f.descHi)}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── ACCURACY ASSURANCE ── */}
        <section className="container mx-auto px-4 py-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-[hsl(230,55%,11%)] border border-primary/25 rounded-3xl p-8 text-center overflow-hidden"
          >
            <div className="absolute inset-0 rounded-3xl bg-primary/5 blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-3">
                {t('Why Users Trust Future Jaano', 'Future Jaano पर विश्वास क्यों?')}
              </h3>
              <p className="text-white/65 text-sm leading-relaxed max-w-lg mx-auto">
                {t(
                  'Our AI combines traditional Vedic knowledge with advanced intelligence to provide deeply researched and personalized guidance — accurate, private, and always available.',
                  'हमारा AI पारंपरिक वैदिक ज्ञान और उन्नत बुद्धिमत्ता को मिलाकर गहन शोध पर आधारित व्यक्तिगत मार्गदर्शन प्रदान करता है — सटीक, निजी और हमेशा उपलब्ध।'
                )}
              </p>
            </div>
          </motion.div>
        </section>

        {/* ── DEITIES STRIP ── */}
        <section className="container mx-auto px-4 py-10 max-w-5xl">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl md:text-3xl font-serif font-bold text-center text-white mb-3"
          >
            {t('Seek Blessings from the Divine', 'देवताओं का आशीर्वाद प्राप्त करें')}
          </motion.h2>
          <p className="text-center text-white/50 text-sm mb-8">
            {t('Explore mantras, sadhana and remedies dedicated to each deity', 'प्रत्येक देवता को समर्पित मंत्र, साधना और उपाय खोजें')}
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {DEITIES.map((d, i) => (
              <Link key={d.en} href="/mantras">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.45 }}
                  whileHover={{ y: -3 }}
                  className="bg-card/40 border border-primary/15 hover:border-primary/40 rounded-2xl overflow-hidden cursor-pointer transition-all group"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={d.img}
                      alt={d.en}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <p className="text-center text-xs md:text-sm font-semibold text-white/85 py-2">
                    {t(d.en, d.hi)}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="container mx-auto px-4 py-10 max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-serif font-bold text-center text-white mb-3"
          >
            {t('How Future Jaano Works', 'Future Jaano कैसे काम करता है')}
          </motion.h2>
          <p className="text-center text-white/50 text-sm mb-10">
            {t('Three simple steps to begin your spiritual journey', 'आध्यात्मिक यात्रा शुरू करने के तीन आसान कदम')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { num: '01', en: { t: 'Choose a Tool', d: 'Kundli, Vastu, Palm reading or one of 12+ Vedic sciences.' }, hi: { t: 'उपकरण चुनें', d: 'कुण्डली, वास्तु, हस्तरेखा या 12+ वैदिक विज्ञानों में से कोई एक।' } },
              { num: '02', en: { t: 'Share Your Details', d: 'Enter your birth details or upload a photo. Fully encrypted and private.' }, hi: { t: 'विवरण साझा करें', d: 'अपना जन्म विवरण दर्ज करें या फोटो अपलोड करें। पूरी तरह एन्क्रिप्टेड और निजी।' } },
              { num: '03', en: { t: 'Get Personalized Insights', d: 'AI combines Lal Kitab, Atharvaveda and Vastu Shastra for deep guidance.' }, hi: { t: 'व्यक्तिगत मार्गदर्शन पाएं', d: 'AI लाल किताब, अथर्ववेद और वास्तु शास्त्र को मिलाकर गहन मार्गदर्शन देता है।' } },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative bg-card/40 border border-border/50 hover:border-primary/40 rounded-2xl p-6 transition-all"
              >
                <div className="absolute -top-4 left-6 bg-gradient-to-br from-primary to-amber-600 text-primary-foreground text-sm font-bold px-3 py-1 rounded-full shadow-lg shadow-primary/30">
                  {step.num}
                </div>
                <h3 className="text-lg font-serif font-bold text-white mt-2 mb-2">
                  {t(step.en.t, step.hi.t)}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {t(step.en.d, step.hi.d)}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="container mx-auto px-4 py-10 max-w-2xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl font-serif font-bold text-center text-white mb-6"
          >
            {t('What Our Users Say', 'उपयोगकर्ता क्या कहते हैं')}
          </motion.h2>

          <div className="relative bg-[hsl(230,55%,11%)] border border-primary/20 rounded-2xl px-6 py-6 min-h-[130px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={tIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-3"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: list[tIdx].rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-white/80 italic leading-relaxed">"{list[tIdx].text}"</p>
                <p className="text-primary text-sm font-semibold">— {list[tIdx].author}, {list[tIdx].city}</p>
              </motion.div>
            </AnimatePresence>

            <div className="absolute right-3 top-3 flex gap-1">
              <button
                onClick={prev}
                aria-label={t('Previous testimonial', 'पिछला प्रशंसापत्र')}
                className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={next}
                aria-label={t('Next testimonial', 'अगला प्रशंसापत्र')}
                className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-all"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex justify-center gap-1.5 mt-4">
              {list.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setAutoplay(false); setTIdx(i); }}
                  aria-label={t(`Go to testimonial ${i + 1}`, `प्रशंसापत्र ${i + 1} पर जाएं`)}
                  aria-current={i === tIdx ? 'true' : undefined}
                  className={`rounded-full transition-all duration-300 ${i === tIdx ? 'w-5 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-white/20'}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── SECURITY FOOTER ── */}
        <section className="container mx-auto px-4 pb-12 text-center">
          <p className="text-xs text-white/35 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            {t(
              'Your information is fully encrypted and kept confidential.',
              'आपकी जानकारी पूरी तरह एन्क्रिप्टेड और गोपनीय है।'
            )}
          </p>
        </section>

      </div>
    </Layout>
  );
}
