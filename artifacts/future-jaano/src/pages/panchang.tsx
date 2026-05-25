import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { useGetPanchang } from '@workspace/api-client-react';
import { Loader2, Sun, Moon, Star, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Panchang() {
  const { t, language } = useLanguage();
  const today = new Date().toISOString().split('T')[0]!;
  const [selectedDate, setSelectedDate] = useState(today);

  const { data, isLoading, refetch } = useGetPanchang({ date: selectedDate });

  const InfoCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
    <div className="bg-card/60 border border-border/40 rounded-xl p-4 flex items-center gap-3">
      <div className="text-primary opacity-80">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary mb-4 drop-shadow-md">
          {t('Daily Panchang', 'दैनिक पंचांग')}
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          {t('Tithi, Nakshatra, Yoga, Karan and auspicious timings for any day.', 'किसी भी दिन का तिथि, नक्षत्र, योग, करण और शुभ मुहूर्त।')}
        </p>

        <div className="flex gap-3 mb-8 max-w-sm mx-auto">
          <Input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-card/60 border-border/40"
          />
          <Button onClick={() => refetch()} className="bg-primary text-primary-foreground px-6 rounded-xl">
            {t('View', 'देखें')}
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
              <p className="text-muted-foreground text-sm mb-1">{t('Date', 'तारीख')}</p>
              <p className="text-2xl font-serif font-bold text-primary">
                {new Date(data.date + 'T00:00:00').toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-lg font-semibold text-foreground/80 mt-1">{data.vaara}</p>
              {data.festivals && <p className="mt-2 text-amber-400 font-semibold">🎉 {data.festivals}</p>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <InfoCard label={t('Tithi', 'तिथि')} value={data.tithi} icon={<Moon className="w-5 h-5" />} />
              <InfoCard label={t('Nakshatra', 'नक्षत्र')} value={data.nakshatra} icon={<Star className="w-5 h-5" />} />
              <InfoCard label={t('Yoga', 'योग')} value={data.yoga} icon={<Sun className="w-5 h-5" />} />
              <InfoCard label={t('Karan', 'करण')} value={data.karan} icon={<Calendar className="w-5 h-5" />} />
              <InfoCard label={t('Moon Rashi', 'चंद्र राशि')} value={data.moonRashi} icon={<Moon className="w-5 h-5" />} />
              <InfoCard label={t('Sun Rashi', 'सूर्य राशि')} value={data.sunRashi} icon={<Sun className="w-5 h-5" />} />
            </div>

            <div className="bg-card/60 border border-border/40 rounded-2xl p-6">
              <h2 className="text-lg font-serif font-bold text-primary mb-4">{t('Timings', 'समय')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: t('Sunrise', 'सूर्योदय'), value: data.sunrise },
                  { label: t('Sunset', 'सूर्यास्त'), value: data.sunset },
                  { label: t('Abhijit Muhurat', 'अभिजित मुहूर्त'), value: data.abhijitMuhurat },
                  { label: t('Rahu Kaal', 'राहु काल'), value: data.rahuKaal },
                  { label: t('Yamaghanta', 'यमघण्ट'), value: data.yamaghanta },
                  { label: t('Gulika Kaal', 'गुलिका काल'), value: data.gulikaKaal },
                ].map(item => (
                  <div key={item.label} className="bg-background/40 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">{t('Rahu Kaal, Yamaghanta & Gulika Kaal are inauspicious — avoid starting important work during these periods.', 'राहु काल, यमघण्ट और गुलिका काल अशुभ हैं — इन समयों में महत्वपूर्ण कार्य आरंभ करने से बचें।')}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
