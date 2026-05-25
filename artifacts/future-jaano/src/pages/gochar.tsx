import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { useGetGochar } from '@workspace/api-client-react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PLANET_COLORS: Record<string, string> = {
  Sun: 'text-amber-400', Moon: 'text-slate-300', Mars: 'text-red-400',
  Mercury: 'text-green-400', Jupiter: 'text-yellow-300', Venus: 'text-pink-400',
  Saturn: 'text-blue-400', Rahu: 'text-purple-400', Ketu: 'text-orange-400',
};
const PLANET_EMOJI: Record<string, string> = {
  Sun: '☀️', Moon: '🌙', Mars: '♂️', Mercury: '☿', Jupiter: '♃',
  Venus: '♀️', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

export default function Gochar() {
  const { t, language } = useLanguage();
  const { data, isLoading, refetch, isFetching } = useGetGochar({ language });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary mb-4 drop-shadow-md">
          {t("Today's Gochar (Transit)", "आज का गोचर (ग्रह स्थिति)")}
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          {t("Current positions of all 9 planets and their effects on your life.", "सभी 9 ग्रहों की वर्तमान स्थिति और आपके जीवन पर उनका प्रभाव।")}
        </p>

        <div className="flex justify-center mb-8">
          <Button onClick={() => refetch()} disabled={isFetching} variant="outline" className="rounded-xl border-primary/30 text-primary">
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            {t('Refresh', 'ताज़ा करें')}
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6">
              <h2 className="text-lg font-serif font-bold text-primary mb-3">{t("Today's Overview", "आज का सारांश")}</h2>
              <p className="text-foreground/80 leading-relaxed">{data.generalEffect}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.planets.map((planet) => (
                <div key={planet.planet} className="bg-card/60 border border-border/40 rounded-xl p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{PLANET_EMOJI[planet.planet] || '⭐'}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-lg ${PLANET_COLORS[planet.planet] || 'text-primary'}`}>
                          {language === 'hi' && planet.planetHi ? planet.planetHi : planet.planet}
                        </span>
                        {planet.isRetrograde && (
                          <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                            {t('Retrograde', 'वक्री')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'hi' && planet.rashiHi ? planet.rashiHi : planet.rashi} · {planet.degree}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/70 leading-relaxed">{planet.effect}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground italic">
              {t('Planetary positions are approximate. Consult a qualified astrologer for precise analysis.', 'ग्रह स्थितियां अनुमानित हैं। सटीक विश्लेषण के लिए किसी योग्य ज्योतिषी से परामर्श करें।')}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
