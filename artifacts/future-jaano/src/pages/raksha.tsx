import { useMemo, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import {
  SYMPTOMS,
  PROTECTION_MANTRAS,
  REMEDIES,
  REMEDY_CATEGORIES,
  type Remedy,
} from '@/lib/raksha';
import { Shield, AlertTriangle, Sparkles } from 'lucide-react';

export default function Raksha() {
  const { t, language } = useLanguage();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [activeRemedy, setActiveRemedy] = useState<Remedy['category']>('daily');

  const remedies = useMemo(
    () => REMEDIES.filter(r => r.category === activeRemedy),
    [activeRemedy],
  );

  const score = checked.size;
  const totalSymptoms = SYMPTOMS.length;
  const severity =
    score === 0 ? null : score <= 3 ? 'mild' : score <= 7 ? 'moderate' : 'severe';

  function toggle(id: string) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const severityCopy = {
    mild: {
      en: 'Mild negative influence. Daily Hanuman Chalisa + Tulsi worship is sufficient.',
      hi: 'हल्की नकारात्मक ऊर्जा। दैनिक हनुमान चालीसा + तुलसी पूजन पर्याप्त है।',
      color: 'from-emerald-500/20 to-emerald-700/10 border-emerald-400/40',
    },
    moderate: {
      en: 'Moderate disturbance. Begin 21-day Bajrang Baan path + weekly Durga Saptashati.',
      hi: 'मध्यम बाधा। 21 दिन बजरंग बाण पाठ + साप्ताहिक दुर्गा सप्तशती शुरू करें।',
      color: 'from-amber-500/25 to-orange-700/10 border-amber-400/50',
    },
    severe: {
      en: 'Strong influence detected. Combine emergency upaay with 41-day Mahamrityunjaya jap. Consult a learned pandit if symptoms persist.',
      hi: 'गंभीर प्रभाव। आपातकालीन उपाय के साथ 41 दिन का महामृत्युंजय जप करें। लक्षण बने रहें तो विद्वान पंडित से परामर्श लें।',
      color: 'from-red-500/25 to-red-700/10 border-red-400/50',
    },
  } as const;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">

        {/* ── HEADER ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-400/30 mb-3">
            <Shield className="w-8 h-8 text-rose-300" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-2 drop-shadow-md">
            🛡️ {t('Stree Raksha — Protection from Negative Energies', 'स्त्री रक्षा — भूत-प्रेत बाधा से सुरक्षा')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            {t(
              'Ancient Sanatan remedies — mantras, kavach, vastu shields and tantric upaay specially for women\'s protection from bhoot-pret, evil eye, kala jadu and pitra dosh.',
              'भूत-प्रेत, बुरी नज़र, काला जादू और पितृ दोष से स्त्रियों की रक्षा हेतु सनातन परंपरा के सिद्ध उपाय — मंत्र, कवच, वास्तु सुरक्षा और तंत्रोक्त उपाय।',
            )}
          </p>
        </div>

        {/* ── DISCLAIMER ── */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8 flex items-start gap-3 max-w-3xl mx-auto">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs md:text-sm text-muted-foreground">
            <p className="font-semibold text-amber-300 mb-1">
              {t('Important', 'महत्वपूर्ण सूचना')}
            </p>
            <p>
              {t(
                'These are traditional remedies for spiritual peace and faith. Persistent physical or mental symptoms must be evaluated by a qualified doctor first. Spiritual practice supports — it does not replace — medical care.',
                'ये पारंपरिक उपाय आध्यात्मिक शांति और श्रद्धा के लिए हैं। लगातार शारीरिक या मानसिक लक्षणों की पहले योग्य चिकित्सक से जाँच कराएँ। आध्यात्मिक साधना चिकित्सा का पूरक है — विकल्प नहीं।',
              )}
            </p>
          </div>
        </div>

        {/* ── SYMPTOM SELF-CHECK ── */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mb-1 flex items-center gap-2">
            🔍 {t('Step 1 — Identify Lakshanas', 'चरण 1 — लक्षण पहचानें')}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t(
              'Tap the symptoms you have been experiencing. Honest selection helps choose the right upaay.',
              'जो लक्षण आप अनुभव कर रही हैं उन्हें चुनें। सही उपाय के लिए ईमानदारी से चुनाव करें।',
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SYMPTOMS.map(s => {
              const active = checked.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggle(s.id)}
                  aria-pressed={active}
                  className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                    active
                      ? 'bg-rose-500/15 border-rose-400/60 shadow-md shadow-rose-500/10'
                      : 'bg-card/40 border-border/40 hover:border-primary/40'
                  }`}
                >
                  <span className="text-xl shrink-0">{s.emoji}</span>
                  <span className="text-sm text-foreground/90 leading-snug">
                    {language === 'hi' ? s.hi : s.en}
                  </span>
                  <span
                    className={`ml-auto w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 transition-all flex items-center justify-center ${
                      active ? 'bg-rose-400 border-rose-400 text-white text-xs' : 'border-muted-foreground/30'
                    }`}
                  >
                    {active ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>

          {severity && (
            <div className={`mt-5 p-4 rounded-xl bg-gradient-to-br border ${severityCopy[severity].color}`}>
              <p className="text-sm font-semibold text-foreground mb-1">
                {score} / {totalSymptoms} {t('symptoms selected', 'लक्षण चुने')} —{' '}
                <span className="capitalize">
                  {severity === 'mild' && t('Mild', 'हल्का')}
                  {severity === 'moderate' && t('Moderate', 'मध्यम')}
                  {severity === 'severe' && t('Severe', 'गंभीर')}
                </span>
              </p>
              <p className="text-sm text-foreground/85">
                {language === 'hi' ? severityCopy[severity].hi : severityCopy[severity].en}
              </p>
            </div>
          )}
        </section>

        {/* ── PROTECTION MANTRAS ── */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mb-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            {t('Step 2 — Supreme Protection Mantras', 'चरण 2 — सर्वोच्च रक्षा मंत्र')}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t(
              'Recite with full shraddha. Light a diya before starting. Use a rudraksha or tulsi mala for counting.',
              'पूर्ण श्रद्धा से जप करें। आरंभ से पहले दीपक जलाएँ। गिनती के लिए रुद्राक्ष या तुलसी की माला प्रयोग करें।',
            )}
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {PROTECTION_MANTRAS.map(m => (
              <div
                key={m.id}
                className={`bg-card/50 border rounded-2xl p-5 shadow-lg transition-all ${
                  m.power === 'supreme'
                    ? 'border-amber-400/40 shadow-amber-500/5'
                    : m.power === 'high'
                    ? 'border-rose-400/30'
                    : 'border-border/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif text-lg font-bold text-primary">
                    {language === 'hi' ? m.titleHi : m.titleEn}
                  </h3>
                  {m.power === 'supreme' && (
                    <span className="text-[10px] uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-semibold">
                      {t('Supreme', 'सर्वोच्च')}
                    </span>
                  )}
                  {m.power === 'high' && (
                    <span className="text-[10px] uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/40 px-2 py-0.5 rounded-full font-semibold">
                      {t('High', 'उच्च')}
                    </span>
                  )}
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl p-4 mb-3">
                  <p
                    className="text-base md:text-lg font-serif text-foreground leading-relaxed text-center whitespace-pre-line"
                    style={{ fontFamily: "'Noto Serif Devanagari', serif" }}
                  >
                    {m.sanskrit}
                  </p>
                  <p className="text-xs text-muted-foreground italic text-center mt-2">
                    {m.transliteration}
                  </p>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div>
                    <span className="font-semibold text-primary/90">{t('Meaning', 'अर्थ')}: </span>
                    <span className="text-foreground/80">{language === 'hi' ? m.meaningHi : m.meaningEn}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-primary/90">{t('Benefits', 'लाभ')}: </span>
                    <span className="text-foreground/80">{language === 'hi' ? m.benefitsHi : m.benefitsEn}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-primary/90">{t('Best time', 'शुभ समय')}: </span>
                    <span className="text-foreground/80">{language === 'hi' ? m.bestTimeHi : m.bestTimeEn}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-primary/90">{t('Repeat', 'जप संख्या')}: </span>
                    <span className="text-foreground/80">{m.repetitions} {t('times', 'बार')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── REMEDIES ── */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mb-1 flex items-center gap-2">
            🌿 {t('Step 3 — Daily & Emergency Upaay', 'चरण 3 — दैनिक और आपातकालीन उपाय')}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t(
              'Choose category — combine daily practice with emergency upaay when symptoms are strong.',
              'श्रेणी चुनें — लक्षण तीव्र होने पर दैनिक अभ्यास के साथ आपातकालीन उपाय करें।',
            )}
          </p>

          <div className="flex flex-wrap gap-2 mb-5">
            {REMEDY_CATEGORIES.map(cat => (
              <button
                key={cat.code}
                onClick={() => setActiveRemedy(cat.code)}
                aria-pressed={activeRemedy === cat.code}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  activeRemedy === cat.code
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-card/40 text-muted-foreground border-border/40 hover:border-primary/60'
                }`}
              >
                {cat.emoji} {t(cat.en, cat.hi)}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {remedies.map(r => (
              <div
                key={r.id}
                className="bg-card/40 border border-border/40 rounded-2xl p-4 hover:border-primary/40 transition-all"
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl shrink-0">{r.emoji}</span>
                  <h3 className="font-semibold text-foreground leading-tight">
                    {language === 'hi' ? r.titleHi : r.titleEn}
                  </h3>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed mb-2">
                  {language === 'hi' ? r.descriptionHi : r.descriptionEn}
                </p>
                {r.itemsEn && r.itemsHi && (
                  <div className="bg-background/40 border border-border/30 rounded-lg p-2.5 mt-2">
                    <p className="text-xs font-semibold text-primary/90 mb-1">
                      {t('You will need', 'आवश्यक सामग्री')}:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                      {(language === 'hi' ? r.itemsHi : r.itemsEn).map((it, i) => (
                        <li key={i}>{it}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── CLOSING BLESSING ── */}
        <div className="text-center bg-gradient-to-br from-amber-500/10 to-rose-500/10 border border-amber-500/30 rounded-2xl p-6 max-w-2xl mx-auto">
          <p className="text-base md:text-lg font-serif text-foreground italic" style={{ fontFamily: "'Noto Serif Devanagari', serif" }}>
            {t(
              '"Where there is Hanuman, there fear cannot stand."',
              '"जहाँ हनुमान वहाँ भय का स्थान नहीं।"',
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {t('— Sanatan tradition', '— सनातन परंपरा')}
          </p>
        </div>
      </div>
    </Layout>
  );
}
