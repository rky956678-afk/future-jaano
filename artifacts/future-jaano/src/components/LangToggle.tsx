import type { Language } from '@/lib/language';

interface LangToggleProps {
  lang: Language;
  onChange: (lang: Language) => void;
  className?: string;
}

export function LangToggle({ lang, onChange, className = '' }: LangToggleProps) {
  const isEn = lang === 'en';
  const isHi = !isEn;
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="inline-flex rounded-xl border border-primary/40 bg-background/60 backdrop-blur-sm p-1 gap-1">
        <button
          type="button"
          onClick={() => onChange('hi')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            isHi
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-foreground/80 hover:text-foreground hover:bg-white/10'
          }`}
        >
          हिन्दी
        </button>
        <button
          type="button"
          onClick={() => onChange('en')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            isEn
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-foreground/80 hover:text-foreground hover:bg-white/10'
          }`}
        >
          English
        </button>
      </div>
    </div>
  );
}
