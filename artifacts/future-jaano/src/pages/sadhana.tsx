import React, { useMemo, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import type { Language } from '@/lib/language';
import { SADHANAS, SADHANA_CATEGORIES, type Sadhana, type SadhanaCategory } from '@/lib/sadhanas';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  Sun,
  Star,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

function SadhanaCard({ sadhana, onOpen }: { sadhana: Sadhana; onOpen: () => void }) {
  const { t } = useLanguage();
  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={t(`Open vidhi for ${sadhana.nameEn}`, `${sadhana.nameHi} की विधि देखें`)}
      className="p-5 bg-card/60 border-border/50 hover:border-primary/50 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-all cursor-pointer flex flex-col gap-3"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      data-testid={`sadhana-card-${sadhana.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg font-bold text-primary leading-snug">
            {t(sadhana.nameEn, sadhana.nameHi)}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(sadhana.deityEn, sadhana.deityHi)}
          </p>
        </div>
        <Sparkles className="h-5 w-5 text-primary/70 shrink-0" />
      </div>

      <p className="text-sm text-foreground/80 line-clamp-3">
        {t(sadhana.purposeEn, sadhana.purposeHi)}
      </p>

      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/30">
        <div className="flex items-start gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <span className="text-muted-foreground">{t(sadhana.bestTithiEn, sadhana.bestTithiHi)}</span>
        </div>
        <div className="flex items-start gap-1.5">
          <Sun className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <span className="text-muted-foreground">{t(sadhana.bestVaarEn, sadhana.bestVaarHi)}</span>
        </div>
      </div>

      <Button variant="outline" size="sm" className="mt-1 w-full">
        {t('View Full Vidhi →', 'पूर्ण विधि देखें →')}
      </Button>
    </Card>
  );
}

function SadhanaDetail({ sadhana }: { sadhana: Sadhana }) {
  const { t, language } = useLanguage() as { t: (en: string, hi: string) => string; language: Language };
  const method = language === 'hi' ? sadhana.methodHi : sadhana.methodEn;
  const precautions = language === 'hi' ? sadhana.precautionsHi : sadhana.precautionsEn;
  return (
    <div className="space-y-5">
      <p className="text-sm text-foreground/90 italic">
        {t(sadhana.deityEn, sadhana.deityHi)} — {t(sadhana.purposeEn, sadhana.purposeHi)}
      </p>

      {/* Timing grid */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
            <Calendar className="h-4 w-4" />
            {t('Best Tithi', 'श्रेष्ठ तिथि')}
          </div>
          <p className="text-sm text-foreground/85">{t(sadhana.bestTithiEn, sadhana.bestTithiHi)}</p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
            <Sun className="h-4 w-4" />
            {t('Best Day', 'श्रेष्ठ वार')}
          </div>
          <p className="text-sm text-foreground/85">{t(sadhana.bestVaarEn, sadhana.bestVaarHi)}</p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
            <Clock className="h-4 w-4" />
            {t('Best Time', 'श्रेष्ठ काल')}
          </div>
          <p className="text-sm text-foreground/85">{t(sadhana.bestTimeEn, sadhana.bestTimeHi)}</p>
        </div>
        {sadhana.bestNakshatraEn && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
              <Star className="h-4 w-4" />
              {t('Best Nakshatra', 'श्रेष्ठ नक्षत्र')}
            </div>
            <p className="text-sm text-foreground/85">
              {t(sadhana.bestNakshatraEn, sadhana.bestNakshatraHi ?? sadhana.bestNakshatraEn)}
            </p>
          </div>
        )}
      </div>

      {/* Duration */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
        <p className="text-sm">
          <span className="font-semibold text-amber-200">{t('Duration: ', 'अवधि: ')}</span>
          <span className="text-foreground/85">{t(sadhana.durationEn, sadhana.durationHi)}</span>
        </p>
      </div>

      {/* Mantra */}
      <div className="bg-card border border-border/50 rounded-lg p-4">
        <h4 className="text-primary font-semibold text-sm mb-2">{t('Moola Mantra', 'मूल मंत्र')}</h4>
        <p className="font-serif text-base sm:text-lg text-foreground leading-relaxed whitespace-pre-line">
          {sadhana.mantra}
        </p>
        <p className="text-xs text-muted-foreground mt-2 italic">{sadhana.mantraTransliteration}</p>
        <p className="text-xs text-primary mt-2">
          {t(`Recommended: ${sadhana.japaCount} japa × daily rounds`, `अनुशंसित: प्रतिदिन ${sadhana.japaCount} जप × माला`)}
        </p>
      </div>

      {/* Method */}
      <div>
        <h4 className="flex items-center gap-2 text-primary font-semibold text-base mb-2">
          <CheckCircle2 className="h-4 w-4" />
          {t('Vidhi (Method)', 'विधि')}
        </h4>
        <ol className="space-y-1.5 list-decimal list-inside text-sm text-foreground/85">
          {method.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      {/* Precautions */}
      <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-3">
        <h4 className="flex items-center gap-2 text-destructive font-semibold text-sm mb-2">
          <AlertTriangle className="h-4 w-4" />
          {t('Precautions (Niyam)', 'सावधानियाँ (नियम)')}
        </h4>
        <ul className="space-y-1 list-disc list-inside text-sm text-foreground/85">
          {precautions.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>

      {/* Sources */}
      <div className="bg-card/40 border border-border/50 rounded-lg p-3">
        <h4 className="flex items-center gap-2 text-primary font-semibold text-sm mb-2">
          <BookOpen className="h-4 w-4" />
          {t('Authentic Sources (Pramanik Granth)', 'प्रामाणिक स्रोत (ग्रन्थ)')}
        </h4>
        <ul className="space-y-1 text-sm text-foreground/85">
          {sadhana.sources.map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary mt-0.5">📜</span>
              <span>
                {t(s.textEn, s.textHi)}
                {s.reference && <span className="text-muted-foreground"> — {s.reference}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function SadhanaPage() {
  const { t } = useLanguage();
  const [category, setCategory] = useState<SadhanaCategory>('all');
  const [openSadhana, setOpenSadhana] = useState<Sadhana | null>(null);

  const filtered = useMemo(
    () => (category === 'all' ? SADHANAS : SADHANAS.filter((s) => s.category === category)),
    [category],
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-2">
            {t('Sadhana Vidhi', 'साधना विधि')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            {t(
              'Authentic Sadhana, Yogini Sadhana, Mantra Kriya and Tantric practices — drawn from Atharvaveda, Mantra Mahodadhi, Rudrayamala, Yogini Tantra and other pramanik granthas.',
              'प्रामाणिक साधना, योगिनी साधना, मंत्र क्रिया एवं तांत्रिक विधियाँ — अथर्ववेद, मंत्र महोदधि, रुद्रयामल, योगिनी तंत्र एवं अन्य प्रामाणिक ग्रन्थों से संकलित।',
            )}
          </p>
        </div>

        {/* Important disclaimer */}
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-lg p-4 mb-6 text-sm">
          <p className="font-semibold text-amber-200 mb-1 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {t('Important Notice', 'महत्वपूर्ण सूचना')}
          </p>
          <p className="text-foreground/85">
            {t(
              'These sadhanas are shared for educational purposes. Tantric and Ugra sadhanas (Bagalamukhi, Kali, Tara, Yogini) REQUIRE diksha from a qualified living guru. Self-practice of these can cause harm. Always consult a knowledgeable acharya before beginning.',
              'ये साधनाएँ शैक्षणिक उद्देश्य से प्रस्तुत हैं। तांत्रिक एवं उग्र साधनाएँ (बगलामुखी, काली, तारा, योगिनी) के लिए जीवित योग्य गुरु से दीक्षा अनिवार्य है। स्व-अभ्यास हानिकारक हो सकता है। प्रारम्भ से पूर्व विद्वान आचार्य से अवश्य परामर्श लें।',
            )}
          </p>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {SADHANA_CATEGORIES.map((c) => {
            const active = category === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setCategory(c.code)}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card/40 text-foreground/70 border-border/40 hover:border-primary/50'
                }`}
              >
                <span className="mr-1">{c.emoji}</span>
                {t(c.en, c.hi)}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <SadhanaCard key={s.id} sadhana={s} onOpen={() => setOpenSadhana(s)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-10">
            {t('No sadhanas in this category yet.', 'इस श्रेणी में अभी कोई साधना नहीं।')}
          </p>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!openSadhana} onOpenChange={(o) => !o && setOpenSadhana(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {openSadhana && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl text-primary">
                    {t(openSadhana.nameEn, openSadhana.nameHi)}
                  </DialogTitle>
                </DialogHeader>
                <SadhanaDetail sadhana={openSadhana} />
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
