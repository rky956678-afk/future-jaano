import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { useGetDailyHoroscope } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { setUserSign, type ZodiacKey } from '@/lib/userProfile';
import { useUser } from '@/lib/clerk';
import { useUpdateMyProfile } from '@workspace/api-client-react';

const signs = [
  { id: 'aries', nameEn: 'Aries', nameHi: 'मेष', icon: '♈' },
  { id: 'taurus', nameEn: 'Taurus', nameHi: 'वृषभ', icon: '♉' },
  { id: 'gemini', nameEn: 'Gemini', nameHi: 'मिथुन', icon: '♊' },
  { id: 'cancer', nameEn: 'Cancer', nameHi: 'कर्क', icon: '♋' },
  { id: 'leo', nameEn: 'Leo', nameHi: 'सिंह', icon: '♌' },
  { id: 'virgo', nameEn: 'Virgo', nameHi: 'कन्या', icon: '♍' },
  { id: 'libra', nameEn: 'Libra', nameHi: 'तुला', icon: '♎' },
  { id: 'scorpio', nameEn: 'Scorpio', nameHi: 'वृश्चिक', icon: '♏' },
  { id: 'sagittarius', nameEn: 'Sagittarius', nameHi: 'धनु', icon: '♐' },
  { id: 'capricorn', nameEn: 'Capricorn', nameHi: 'मकर', icon: '♑' },
  { id: 'aquarius', nameEn: 'Aquarius', nameHi: 'कुंभ', icon: '♒' },
  { id: 'pisces', nameEn: 'Pisces', nameHi: 'मीन', icon: '♓' },
];

export default function Horoscope() {
  const { t } = useLanguage();
  const { isSignedIn } = useUser();
  const updateProfile = useUpdateMyProfile();
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [horoLang, setHoroLang] = useState<'en' | 'hi'>('hi');

  const today = format(new Date(), 'yyyy-MM-dd');
  const { data, isLoading } = useGetDailyHoroscope({
    date: today,
    lang: horoLang,
  });

  const selectedData = data?.find(d => d.sign.toLowerCase() === selectedSign);
  const currentSign = signs.find(s => s.id === selectedSign);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary mb-2 drop-shadow-md">
          {t('Daily Horoscope', 'दैनिक राशिफल')}
        </h1>
        <p className="text-center text-muted-foreground mb-5">
          {t('Cosmic guidance for today', 'आज के लिए ब्रह्मांडीय मार्गदर्शन')} — {format(new Date(), 'MMM dd, yyyy')}
        </p>

        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-1 gap-1">
            <button
              onClick={() => setHoroLang('hi')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                horoLang === 'hi'
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setHoroLang('en')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                horoLang === 'en'
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {!selectedSign ? (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {signs.map(sign => (
              <Card
                key={sign.id}
                className="bg-card/40 backdrop-blur-sm border-border/50 hover:border-primary/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(245,166,35,0.2)]"
                onClick={() => {
                  const s = sign.id as ZodiacKey;
                  setSelectedSign(sign.id);
                  setUserSign(s);
                  if (isSignedIn) updateProfile.mutate({ data: { zodiacSign: s } });
                }}
              >
                <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center gap-2">
                  <span className="text-4xl text-primary">{sign.icon}</span>
                  <h3 className="font-semibold text-foreground/90 text-center leading-tight">
                    {horoLang === 'hi' ? sign.nameHi : sign.nameEn}
                  </h3>
                  {horoLang === 'hi' && (
                    <p className="text-xs text-muted-foreground">{sign.nameEn}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setSelectedSign(null)}
              className="text-primary hover:underline font-medium flex items-center gap-2"
            >
              ← {t('Back to all signs', 'सभी राशियों पर वापस जाएं')}
            </button>

            {isLoading ? (
              <Skeleton className="h-64 w-full rounded-2xl" />
            ) : selectedData ? (
              <Card className="bg-card/60 backdrop-blur-md border-border/50 p-6 md:p-8 rounded-2xl">
                <div className="flex items-center gap-4 mb-6 border-b border-border/50 pb-6">
                  <span className="text-5xl md:text-6xl text-primary">{currentSign?.icon}</span>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                      {horoLang === 'hi'
                        ? `${currentSign?.nameHi} (${currentSign?.nameEn})`
                        : `${currentSign?.nameEn} (${currentSign?.nameHi})`}
                    </h2>
                    <p className="text-muted-foreground">{today}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      {horoLang === 'hi' ? 'भविष्यवाणी' : 'Prediction'}
                    </h3>
                    <p className="text-foreground/90 leading-relaxed text-lg">{selectedData.prediction}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedData.health && (
                      <div className="bg-background/50 p-4 rounded-xl border border-border/30">
                        <h4 className="font-semibold text-foreground/80 mb-1">
                          {horoLang === 'hi' ? 'स्वास्थ्य' : 'Health'}
                        </h4>
                        <p className="text-muted-foreground text-sm">{selectedData.health}</p>
                      </div>
                    )}
                    {selectedData.career && (
                      <div className="bg-background/50 p-4 rounded-xl border border-border/30">
                        <h4 className="font-semibold text-foreground/80 mb-1">
                          {horoLang === 'hi' ? 'करियर' : 'Career'}
                        </h4>
                        <p className="text-muted-foreground text-sm">{selectedData.career}</p>
                      </div>
                    )}
                    {selectedData.love && (
                      <div className="bg-background/50 p-4 rounded-xl border border-border/30">
                        <h4 className="font-semibold text-foreground/80 mb-1">
                          {horoLang === 'hi' ? 'प्रेम' : 'Love'}
                        </h4>
                        <p className="text-muted-foreground text-sm">{selectedData.love}</p>
                      </div>
                    )}
                    {selectedData.finance && (
                      <div className="bg-background/50 p-4 rounded-xl border border-border/30">
                        <h4 className="font-semibold text-foreground/80 mb-1">
                          {horoLang === 'hi' ? 'वित्त' : 'Finance'}
                        </h4>
                        <p className="text-muted-foreground text-sm">{selectedData.finance}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        {horoLang === 'hi' ? 'शुभ रंग:' : 'Lucky Color:'}
                      </span>
                      <span className="font-medium text-foreground">{selectedData.luckyColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        {horoLang === 'hi' ? 'शुभ अंक:' : 'Lucky Number:'}
                      </span>
                      <span className="font-medium text-foreground">{selectedData.luckyNumber}</span>
                    </div>
                    {selectedData.luckyGem && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">
                          {horoLang === 'hi' ? 'शुभ रत्न:' : 'Lucky Gem:'}
                        </span>
                        <span className="font-medium text-foreground">{selectedData.luckyGem}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                {t('Failed to load horoscope.', 'राशिफल लोड करने में विफल।')}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
