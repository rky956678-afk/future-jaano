import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateKundliMilan, KundliMilanReport } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Heart, Star } from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';

const formSchema = z.object({
  person1Name: z.string().min(2), person1Dob: z.string().min(1),
  person1Tob: z.string().min(1), person1Pob: z.string().min(2),
  person2Name: z.string().min(2), person2Dob: z.string().min(1),
  person2Tob: z.string().min(1), person2Pob: z.string().min(2),
});

export default function KundliMilan() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [report, setReport] = React.useState<KundliMilanReport | null>(null);
  const createMilan = useCreateKundliMilan();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { person1Name: '', person1Dob: '', person1Tob: '', person1Pob: '', person2Name: '', person2Dob: '', person2Tob: '', person2Pob: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await createMilan.mutateAsync({ data: { ...values, language } });
      setReport(result);
    } catch {
      toast({ title: t('Error', 'त्रुटि'), description: t('Could not match kundlis. Please try again.', 'कुण्डली मिलान नहीं हो सका। पुनः प्रयास करें।'), variant: 'destructive' });
    }
  }

  const KOOTAS = [
    { key: 'varna', labelEn: 'Varna', labelHi: 'वर्ण', max: 1 },
    { key: 'vashya', labelEn: 'Vashya', labelHi: 'वश्य', max: 2 },
    { key: 'tara', labelEn: 'Tara', labelHi: 'तारा', max: 3 },
    { key: 'yoni', labelEn: 'Yoni', labelHi: 'योनि', max: 4 },
    { key: 'grihaMaitri', labelEn: 'Graha Maitri', labelHi: 'ग्रह मैत्री', max: 5 },
    { key: 'gana', labelEn: 'Gana', labelHi: 'गण', max: 6 },
    { key: 'bhakoota', labelEn: 'Bhakoota', labelHi: 'भकूट', max: 7 },
    { key: 'nadi', labelEn: 'Nadi', labelHi: 'नाड़ी', max: 8 },
  ] as const;

  const COMPATIBILITY_COLORS: Record<string, string> = {
    Excellent: 'text-green-400', Good: 'text-emerald-400', Average: 'text-amber-400', 'Below Average': 'text-red-400',
  };

  return (
    <Layout>
      <AuthGate feature={{
        icon: Heart,
        titleEn: 'Kundli Milan — Match Compatibility',
        titleHi: 'कुण्डली मिलान — गुण मिलान',
        descEn: 'Traditional Ashtakoot Guna Milan with detailed compatibility analysis for marriage matchmaking.',
        descHi: 'पारंपरिक अष्टकूट गुण मिलान — विवाह के लिए विस्तृत अनुकूलता विश्लेषण।',
      }}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary mb-4 drop-shadow-md">
          {t('Kundli Milan', 'कुण्डली मिलान')}
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          {t('Ashtakoota compatibility matching for marriage — 36 point analysis.', 'विवाह के लिए अष्टकूट कुण्डली मिलान — 36 गुण विश्लेषण।')}
        </p>

        {report ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
              <div className="text-6xl font-bold text-primary mb-2">{report.totalScore}<span className="text-3xl text-muted-foreground">/{report.maxScore}</span></div>
              <p className={`text-2xl font-serif font-bold ${COMPATIBILITY_COLORS[report.compatibility] || 'text-primary'}`}>
                {report.compatibility}
              </p>
            </div>

            <div className="bg-card/60 border border-border/40 rounded-2xl p-6">
              <h2 className="text-lg font-serif font-bold text-primary mb-4">{t('Ashtakoota Breakdown', 'अष्टकूट विवरण')}</h2>
              <div className="space-y-3">
                {KOOTAS.map(k => {
                  const score = report[k.key] as number;
                  const pct = (score / k.max) * 100;
                  return (
                    <div key={k.key} className="flex items-center gap-3">
                      <span className="w-28 text-sm text-muted-foreground">{t(k.labelEn, k.labelHi)}</span>
                      <div className="flex-1 bg-background/40 rounded-full h-2">
                        <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-12 text-sm font-semibold text-right text-foreground">{score}/{k.max}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {[
              { title: t('Analysis', 'विश्लेषण'), content: report.analysis },
              { title: t('Strengths', 'शक्तियां'), content: report.strengths },
              { title: t('Challenges', 'चुनौतियां'), content: report.challenges },
              { title: t('Recommendation', 'सिफारिश'), content: report.recommendation },
            ].map(sec => sec.content && (
              <div key={sec.title} className="bg-card/60 border border-border/40 rounded-2xl p-6">
                <h2 className="text-lg font-serif font-bold text-primary mb-3">{sec.title}</h2>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{sec.content}</p>
              </div>
            ))}

            <Button onClick={() => setReport(null)} variant="outline" className="w-full rounded-xl border-primary/30 text-primary">
              {t('Match Another Couple', 'दूसरी कुण्डली मिलाएं')}
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {(['person1', 'person2'] as const).map((p, i) => (
                <div key={p} className="bg-card/60 border border-border/40 rounded-2xl p-6">
                  <h2 className="text-lg font-serif font-bold text-primary mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    {i === 0 ? t('Boy / Person 1', 'वर / व्यक्ति 1') : t('Girl / Person 2', 'वधू / व्यक्ति 2')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`${p}Name`} render={({ field }) => (
                      <FormItem><FormLabel>{t('Full Name', 'पूरा नाम')}</FormLabel><FormControl><Input {...field} className="bg-background/40 border-border/40" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`${p}Dob`} render={({ field }) => (
                      <FormItem><FormLabel>{t('Date of Birth', 'जन्म तिथि')}</FormLabel><FormControl><Input type="date" {...field} className="bg-background/40 border-border/40" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`${p}Tob`} render={({ field }) => (
                      <FormItem><FormLabel>{t('Time of Birth', 'जन्म समय')}</FormLabel><FormControl><Input type="time" {...field} className="bg-background/40 border-border/40" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`${p}Pob`} render={({ field }) => (
                      <FormItem><FormLabel>{t('Place of Birth', 'जन्म स्थान')}</FormLabel><FormControl><Input {...field} placeholder={t('City, State', 'शहर, राज्य')} className="bg-background/40 border-border/40" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </div>
              ))}
              <Button type="submit" disabled={createMilan.isPending} className="w-full h-12 text-lg rounded-xl bg-primary text-primary-foreground">
                {createMilan.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t('Matching...', 'मिलान हो रहा है...')}</> : <><Heart className="mr-2 h-5 w-5" />{t('Match Kundli', 'कुण्डली मिलाएं')}</>}
              </Button>
            </form>
          </Form>
        )}
      </div>
      </AuthGate>
    </Layout>
  );
}
