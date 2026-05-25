import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateDashaReport, DashaReport } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Clock } from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';

const formSchema = z.object({
  dateOfBirth: z.string().min(1),
  timeOfBirth: z.string().min(1),
  placeOfBirth: z.string().min(2),
});

const PLANET_COLORS: Record<string, string> = {
  Sun: 'border-amber-500/40 bg-amber-500/5',
  Moon: 'border-slate-400/40 bg-slate-400/5',
  Mars: 'border-red-500/40 bg-red-500/5',
  Mercury: 'border-green-500/40 bg-green-500/5',
  Jupiter: 'border-yellow-400/40 bg-yellow-400/5',
  Venus: 'border-pink-400/40 bg-pink-400/5',
  Saturn: 'border-blue-500/40 bg-blue-500/5',
  Rahu: 'border-purple-500/40 bg-purple-500/5',
  Ketu: 'border-orange-500/40 bg-orange-500/5',
};

export default function Dasha() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [report, setReport] = React.useState<DashaReport | null>(null);
  const createDasha = useCreateDashaReport();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { dateOfBirth: '', timeOfBirth: '', placeOfBirth: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await createDasha.mutateAsync({ data: { ...values, language } });
      setReport(result);
    } catch {
      toast({ title: t('Error', 'त्रुटि'), description: t('Could not calculate Dasha. Please try again.', 'दशा गणना नहीं हो सकी। पुनः प्रयास करें।'), variant: 'destructive' });
    }
  }

  return (
    <Layout>
      <AuthGate feature={{
        icon: Clock,
        titleEn: 'Your Vimshottari Dasha Timeline',
        titleHi: 'आपकी विंशोत्तरी दशा समयरेखा',
        descEn: 'See which planetary period (Mahadasha & Antardasha) you are currently in and what it means for you.',
        descHi: 'जानें कि आप किस ग्रह की महादशा और अंतर्दशा में हैं — और उसका आपके लिए क्या अर्थ है।',
      }}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary mb-4 drop-shadow-md">
          {t('Vimshottari Dasha', 'विंशोत्तरी दशा')}
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          {t('Find your current Mahadasha, Antardasha and the planetary periods of your life.', 'अपना वर्तमान महादशा, अंतर्दशा और जीवन के ग्रह काल जानें।')}
        </p>

        {report ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
              <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
              <p className="text-muted-foreground text-sm mb-2">{t('Current Period', 'वर्तमान दशा')}</p>
              <p className="text-3xl font-serif font-bold text-primary mb-1">
                {language === 'hi' ? report.periods.find(p => p.planet === report.currentDasha)?.planetHi || report.currentDasha : report.currentDasha} {t('Mahadasha', 'महादशा')}
              </p>
              <p className="text-lg text-foreground/70">{report.currentAntardasha} {t('Antardasha', 'अंतर्दशा')}</p>
              <p className="text-sm text-amber-400 mt-2">{report.dashaBalance}</p>
            </div>

            <div className="bg-card/60 border border-border/40 rounded-2xl p-6">
              <h2 className="text-lg font-serif font-bold text-primary mb-3">{t('Current Period Interpretation', 'वर्तमान दशा फल')}</h2>
              <p className="text-foreground/80 leading-relaxed">{report.currentPeriodInterpretation}</p>
            </div>

            <div className="bg-card/60 border border-border/40 rounded-2xl p-6">
              <h2 className="text-lg font-serif font-bold text-primary mb-4">{t('All Dasha Periods', 'सभी दशा काल')}</h2>
              <div className="space-y-3">
                {report.periods.map((period, idx) => {
                  const isCurrent = period.planet === report.currentDasha;
                  return (
                    <div key={idx} className={`rounded-xl p-4 border ${isCurrent ? 'border-primary/50 bg-primary/10' : (PLANET_COLORS[period.planet] || 'border-border/40 bg-card/30')}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">
                            {language === 'hi' ? period.planetHi : period.planet}
                          </span>
                          {isCurrent && <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full">{t('Current', 'वर्तमान')}</span>}
                        </div>
                        <span className="text-xs text-muted-foreground">{period.years} {t('years', 'वर्ष')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{period.startDate} → {period.endDate}</p>
                      {period.interpretation && <p className="text-sm text-foreground/70">{period.interpretation}</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            <Button onClick={() => setReport(null)} variant="outline" className="w-full rounded-xl border-primary/30 text-primary">
              {t('Calculate Again', 'पुनः गणना करें')}
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="bg-card/60 border border-border/40 rounded-2xl p-6 space-y-4">
              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem><FormLabel>{t('Date of Birth', 'जन्म तिथि')}</FormLabel><FormControl><Input type="date" {...field} className="bg-background/40 border-border/40" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="timeOfBirth" render={({ field }) => (
                <FormItem><FormLabel>{t('Time of Birth', 'जन्म समय')}</FormLabel><FormControl><Input type="time" {...field} className="bg-background/40 border-border/40" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="placeOfBirth" render={({ field }) => (
                <FormItem><FormLabel>{t('Place of Birth', 'जन्म स्थान')}</FormLabel><FormControl><Input {...field} placeholder={t('City, State, Country', 'शहर, राज्य, देश')} className="bg-background/40 border-border/40" /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={createDasha.isPending} className="w-full h-12 text-lg rounded-xl bg-primary text-primary-foreground">
                {createDasha.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t('Calculating...', 'गणना हो रही है...')}</> : <><Clock className="mr-2 h-5 w-5" />{t('Calculate Dasha', 'दशा जानें')}</>}
              </Button>
            </form>
          </Form>
        )}
      </div>
      </AuthGate>
    </Layout>
  );
}
