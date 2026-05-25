import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { AuthGate } from '@/components/AuthGate';
import { useGetMyReadings, type ReadingRecord, type ReadingRecordType } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Loader2, Sparkles, Home as HomeIcon, Hand, Smile, Calculator, Heart, HelpCircle, ScrollText, Calendar as CalIcon, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const TYPE_META: Record<ReadingRecordType, { icon: React.ReactNode; en: string; hi: string; link: string; color: string }> = {
  kundli:     { icon: <ScrollText className="w-5 h-5" />,  en: 'Kundli',         hi: 'कुण्डली',       link: '/kundli',         color: 'from-amber-500/30 to-orange-500/10' },
  horoscope:  { icon: <CalIcon className="w-5 h-5" />,     en: 'Horoscope',      hi: 'राशिफल',        link: '/horoscope',      color: 'from-purple-500/30 to-pink-500/10' },
  vastu:      { icon: <HomeIcon className="w-5 h-5" />,    en: 'Vastu',          hi: 'वास्तु',         link: '/vastu',          color: 'from-emerald-500/30 to-teal-500/10' },
  palm:       { icon: <Hand className="w-5 h-5" />,        en: 'Palm Reading',   hi: 'हस्त रेखा',      link: '/palm-reading',   color: 'from-rose-500/30 to-red-500/10' },
  face:       { icon: <Smile className="w-5 h-5" />,       en: 'Face Reading',   hi: 'मुखाकृति',       link: '/face-reading',   color: 'from-blue-500/30 to-cyan-500/10' },
  numerology: { icon: <Calculator className="w-5 h-5" />,  en: 'Numerology',     hi: 'अंक ज्योतिष',    link: '/numerology',     color: 'from-violet-500/30 to-indigo-500/10' },
  yoga:       { icon: <Heart className="w-5 h-5" />,       en: 'Yoga & Pranayam',hi: 'योग और प्राणायाम', link: '/yoga',         color: 'from-green-500/30 to-lime-500/10' },
  problem:    { icon: <HelpCircle className="w-5 h-5" />,  en: 'Remedy',         hi: 'उपाय',          link: '/problem-solver', color: 'from-yellow-500/30 to-amber-500/10' },
};

function formatDate(iso: string, lang: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function HistoryList() {
  const { t, language } = useLanguage();
  const { data, isLoading, isError, refetch } = useGetMyReadings();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t('Loading your readings...', 'आपके रीडिंग लोड हो रहे हैं...')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-destructive">{t('Failed to load history.', 'इतिहास लोड नहीं हो सका।')}</p>
        <button onClick={() => refetch()} className="text-primary hover:underline text-sm font-semibold">
          {t('Try again', 'पुनः प्रयास करें')}
        </button>
      </div>
    );
  }

  const readings = (data || []) as ReadingRecord[];

  if (readings.length === 0) {
    return (
      <div className="text-center py-16 bg-card/40 border border-border/50 rounded-2xl space-y-5">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
          <ScrollText className="w-9 h-9 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-1">
            {t('No readings yet', 'अभी कोई रीडिंग नहीं')}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {t('Start exploring our Vedic tools — your Kundli, Vastu and remedy reports will appear here.', 'हमारे वैदिक उपकरण आजमाएं — आपकी कुण्डली, वास्तु और उपाय रिपोर्ट यहाँ दिखेंगी।')}
          </p>
        </div>
        <Link
          href="/kundli"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full font-semibold text-sm transition-all"
        >
          <Sparkles className="w-4 h-4" />
          {t('Create Your First Kundli', 'अपनी पहली कुण्डली बनाएं')}
        </Link>
      </div>
    );
  }

  // Counts per type
  const counts = readings.reduce<Record<string, number>>((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card/40 border border-primary/20 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-primary">{readings.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('Total Readings', 'कुल रीडिंग')}</p>
        </div>
        <div className="bg-card/40 border border-border/40 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{Object.keys(counts).length}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('Tools Used', 'उपकरण उपयोग')}</p>
        </div>
        <div className="bg-card/40 border border-border/40 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{counts.kundli ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('Kundlis', 'कुण्डलियाँ')}</p>
        </div>
        <div className="bg-card/40 border border-border/40 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{counts.problem ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('Remedies', 'उपाय')}</p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {readings.map((r, i) => {
          const meta = TYPE_META[r.type as ReadingRecordType] ?? TYPE_META.problem;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.4), duration: 0.35 }}
            >
              <Link href={meta.link}>
                <div className={`group relative overflow-hidden bg-gradient-to-br ${meta.color} bg-card/40 border border-border/50 hover:border-primary/40 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all`}>
                  <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground text-sm">
                        {t(meta.en, meta.hi)}
                      </h3>
                      {r.isPremium && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                          {t('Premium', 'प्रीमियम')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{r.summary}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">{formatDate(r.createdAt, language)}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function History() {
  const { t } = useLanguage();
  return (
    <Layout>
      <AuthGate feature={{
        icon: ScrollText,
        titleEn: 'Your Spiritual Reading History',
        titleHi: 'आपका आध्यात्मिक पठन इतिहास',
        descEn: 'Sign in to view all your past Kundli, Vastu, palm, face, and remedy reports in one place.',
        descHi: 'साइन इन करें — अपनी सभी पुरानी कुण्डली, वास्तु, हस्तरेखा, चेहरा और उपाय रिपोर्ट एक जगह देखें।',
      }}>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary mb-3 drop-shadow-md">
            {t('My Readings', 'मेरी रीडिंग')}
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            {t('Your personal archive of Vedic guidance.', 'वैदिक मार्गदर्शन का आपका व्यक्तिगत संग्रह।')}
          </p>
          <HistoryList />
        </div>
      </AuthGate>
    </Layout>
  );
}
