import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { MANTRAS, MANTRA_CATEGORIES, type MantraCategory, type Mantra } from '@/lib/mantras';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Minus, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SpeakResult {
  utterance: SpeechSynthesisUtterance | null;
  hasHindiVoice: boolean;
}

function speak(text: string, onEnd?: () => void): SpeakResult {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { utterance: null, hasHindiVoice: false };
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'hi-IN';
  utter.rate = 0.75;
  utter.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const hi = voices.find(v => v.lang.startsWith('hi') || v.lang.startsWith('sa'));
  if (hi) utter.voice = hi;
  if (onEnd) utter.onend = onEnd;
  window.speechSynthesis.speak(utter);
  return { utterance: utter, hasHindiVoice: !!hi };
}

function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

const COUNTER_KEY = 'fj_japa_counters';

function loadCounters(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(COUNTER_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveCounters(c: Record<string, number>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COUNTER_KEY, JSON.stringify(c));
  } catch {
    /* noop */
  }
}

function MantraCard({ mantra }: { mantra: Mantra }) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [playing, setPlaying] = useState(false);
  const [counters, setCounters] = useState<Record<string, number>>(() => loadCounters());
  const count = counters[mantra.id] ?? 0;
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  function handlePlay() {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    const result = speak(mantra.sanskrit, () => setPlaying(false));
    utterRef.current = result.utterance;
    if (!result.utterance) {
      setPlaying(false);
      toast({
        title: t('Audio not available', 'ऑडियो उपलब्ध नहीं'),
        description: t(
          'Your browser does not support speech synthesis. You can still read the mantra above.',
          'आपका ब्राउज़र वाक् संश्लेषण समर्थन नहीं करता। आप मंत्र ऊपर पढ़ सकते हैं।',
        ),
        variant: 'destructive',
      });
    } else if (!result.hasHindiVoice) {
      toast({
        title: t('Using default voice', 'डिफ़ॉल्ट आवाज़ का उपयोग'),
        description: t(
          'No Hindi/Sanskrit voice found on your device — pronunciation may not be accurate. Install a Hindi voice in your system settings for best results.',
          'आपके डिवाइस पर हिंदी/संस्कृत आवाज़ नहीं मिली — उच्चारण सटीक नहीं हो सकता। बेहतर परिणाम के लिए सिस्टम सेटिंग्स में हिंदी आवाज़ इंस्टॉल करें।',
        ),
      });
    }
  }

  function updateCount(delta: number) {
    const next = Math.max(0, count + delta);
    const updated = { ...counters, [mantra.id]: next };
    setCounters(updated);
    saveCounters(updated);
  }

  function resetCount() {
    const updated = { ...counters, [mantra.id]: 0 };
    setCounters(updated);
    saveCounters(updated);
  }

  const progress = mantra.repetitions > 0 ? Math.min(100, (count / mantra.repetitions) * 100) : 0;

  return (
    <div className="bg-card/60 backdrop-blur-md border border-border/40 rounded-2xl p-6 space-y-4 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-serif font-bold text-primary">
            {language === 'hi' ? mantra.titleHi : mantra.titleEn}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {language === 'hi' ? mantra.titleEn : mantra.titleHi}
          </p>
        </div>
        <Button
          size="sm"
          onClick={handlePlay}
          className={`rounded-full shrink-0 ${playing ? 'bg-red-500 hover:bg-red-600' : 'bg-primary'}`}
          aria-label={playing ? 'Stop' : 'Play'}
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
      </div>

      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl p-4">
        <p className="text-base md:text-lg font-serif text-foreground leading-relaxed text-center" style={{ fontFamily: "'Noto Serif Devanagari', serif" }}>
          {mantra.sanskrit}
        </p>
        <p className="text-xs text-muted-foreground italic text-center mt-2">{mantra.transliteration}</p>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="font-semibold text-primary/90">{t('Meaning', 'अर्थ')}: </span>
          <span className="text-foreground/80">{language === 'hi' ? mantra.meaningHi : mantra.meaningEn}</span>
        </div>
        <div>
          <span className="font-semibold text-primary/90">{t('Benefits', 'लाभ')}: </span>
          <span className="text-foreground/80">{language === 'hi' ? mantra.benefitsHi : mantra.benefitsEn}</span>
        </div>
        <div>
          <span className="font-semibold text-primary/90">{t('Best time', 'शुभ समय')}: </span>
          <span className="text-foreground/80">{language === 'hi' ? mantra.bestTime.hi : mantra.bestTime.en}</span>
        </div>
      </div>

      <div className="border-t border-border/40 pt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-primary">
            🪷 {t('Japa Counter', 'जप काउंटर')}
          </p>
          <p className="text-xs text-muted-foreground">
            {count} / {mantra.repetitions}
          </p>
        </div>
        <div className="w-full bg-background/50 rounded-full h-2 mb-3 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" onClick={() => updateCount(-1)} className="rounded-full w-9 h-9 p-0" aria-label={t('Decrease count', 'गणना घटाएं')}>
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => updateCount(1)}
            className="rounded-full flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-base py-5"
            aria-label={t('Add one jap', 'एक जप जोड़ें')}
          >
            +1 {t('Jap', 'जप')}
          </Button>
          <Button size="sm" variant="outline" onClick={() => updateCount(11)} className="rounded-full px-3" aria-label={t('Add eleven', 'ग्यारह जोड़ें')}>
            +11
          </Button>
          <Button size="sm" variant="ghost" onClick={resetCount} className="rounded-full w-9 h-9 p-0" aria-label={t('Reset count', 'गणना रीसेट')}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        {count >= mantra.repetitions && mantra.repetitions > 0 && (
          <p className="text-center text-emerald-400 text-sm font-semibold mt-3">
            ✨ {t(`Completed ${mantra.repetitions} repetitions!`, `${mantra.repetitions} जप पूर्ण!`)}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Mantras() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<MantraCategory>('general');

  const filtered = useMemo(() => {
    if (activeCategory === 'general') return MANTRAS;
    return MANTRAS.filter(m => m.category === activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary mb-2 drop-shadow-md flex items-center justify-center gap-2">
          🕉️ {t('Mantra Library', 'मंत्र संग्रह')}
        </h1>
        <p className="text-center text-muted-foreground mb-6 max-w-2xl mx-auto">
          {t(
            'Sanskrit mantras with meaning, benefits, audio recitation and japa counter — practice daily for inner transformation.',
            'संस्कृत मंत्र — अर्थ, लाभ, ऑडियो उच्चारण और जप काउंटर के साथ। दैनिक अभ्यास से आंतरिक परिवर्तन।',
          )}
        </p>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 mb-6 flex items-start gap-2 max-w-2xl mx-auto">
          <Volume2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            {t(
              'Tip: Tap ▶ to hear the mantra. Audio uses your device\'s text-to-speech — works best on Android Chrome with Hindi voices installed.',
              'सुझाव: ▶ दबा कर मंत्र सुनें। ऑडियो आपके डिवाइस की हिंदी आवाज़ का प्रयोग करता है — Android Chrome पर सर्वोत्तम।',
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {MANTRA_CATEGORIES.map(cat => (
            <button
              key={cat.code}
              onClick={() => setActiveCategory(cat.code)}
              aria-pressed={activeCategory === cat.code}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                activeCategory === cat.code
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-card/40 text-muted-foreground border-border/40 hover:border-primary/60'
              }`}
            >
              {cat.emoji} {t(cat.en, cat.hi)}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map(m => (
            <MantraCard key={m.id} mantra={m} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">{t('No mantras in this category yet.', 'इस श्रेणी में अभी कोई मंत्र नहीं।')}</p>
        )}
      </div>
    </Layout>
  );
}
