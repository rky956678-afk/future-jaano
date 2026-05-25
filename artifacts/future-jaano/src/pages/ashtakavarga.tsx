import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateAshtakavarga, AshtakavargaReport } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BarChart3 } from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';

const formSchema = z.object({
  dateOfBirth: z.string().min(1),
  timeOfBirth: z.string().min(1),
  placeOfBirth: z.string().min(2),
});

const SIGNS_EN = ['Ar','Ta','Ge','Ca','Le','Vi','Li','Sc','Sa','Ca','Aq','Pi'];
const SIGNS_HI = ['मेष','वृष','मिथु','कर्क','सिंह','कन्या','तुला','वृश्चि','धनु','मकर','कुम्भ','मीन'];
const SIGN_KEYS = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'] as const;

function getScoreColor(v: number) {
  if (v >= 6) return 'bg-green-500/20 text-green-400';
  if (v >= 4) return 'bg-amber-500/10 text-amber-400';
  return 'bg-red-500/10 text-red-400';
}

export default function Ashtakavarga() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [report, setReport] = React.useState<AshtakavargaReport | null>(null);
  const createAV = useCreateAshtakavarga();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { dateOfBirth: '', timeOfBirth: '', placeOfBirth: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await createAV.mutateAsync({ data: { ...values, language } });
      setReport(result);
    } catch {
      toast({ title: t('Error', 'त्रुटि'), description: t('Could not generate Ashtakavarga. Please try again.', 'अष्टकवर्ग नहीं बन सका। पुनः प्रयास करें।'), variant: 'destructive' });
    }
  }

  return (
    <Layout>
      <AuthGate feature={{
        icon: BarChart3,
        titleEn: 'Ashtakavarga — Planetary Strength Chart',
        titleHi: 'अष्टकवर्ग — ग्रहों की शक्ति का चार्ट',
        descEn: 'Detailed bindu analysis showing how each planet supports your houses and life areas.',
        descHi: 'विस्तृत बिंदु विश्लेषण — कैसे प्रत्येक ग्रह आपके भावों और जीवन क्षेत्रों का समर्थन करता है।',
      }}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary mb-4 drop-shadow-md">
          {t('Ashtakavarga', 'अष्टकवर्ग')}
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          {t('Planetary strength analysis across all 12 zodiac signs.', 'सभी 12 राशियों में ग्रह बल का विश्लेषण।')}
        </p>

        {report ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card/60 border border-border/40 rounded-2xl p-4 overflow-x-auto">
              <h2 className="text-lg font-serif font-bold text-primary mb-4">{t('Ashtakavarga Table', 'अष्टकवर्ग तालिका')}</h2>
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-2 pr-3 text-muted-foreground font-medium">{t('Planet', 'ग्रह')}</th>
                    {(language === 'hi' ? SIGNS_HI : SIGNS_EN).map((s, i) => (
                      <th key={i} className="text-center py-2 px-1 text-muted-foreground font-medium text-xs">{s}</th>
                    ))}
                    <th className="text-center py-2 px-2 text-muted-foreground font-medium">{t('Total', 'कुल')}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((row: any, i) => (
                    <tr key={i} className="border-b border-border/20">
                      <td className="py-2 pr-3 font-semibold text-foreground">
                        {language === 'hi' ? row.planetHi : row.planet}
                      </td>
                      {SIGN_KEYS.map(k => (
                        <td key={k} className="text-center py-1 px-1">
                          <span className={`inline-block w-6 h-6 rounded text-xs font-bold leading-6 ${getScoreColor(row[k])}`}>
                            {row[k]}
                          </span>
                        </td>
                      ))}
                      <td className="text-center py-2 px-2 font-bold text-primary">{row.total}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-primary/30">
                    <td className="py-2 pr-3 font-bold text-primary">{t('Sarva', 'सर्व')}</td>
                    {report.sarvashtakavarga.map((v, i) => (
                      <td key={i} className="text-center py-1 px-1">
                        <span className={`inline-block w-6 h-6 rounded text-xs font-bold leading-6 ${v >= 28 ? 'bg-green-500/20 text-green-400' : v <= 22 ? 'bg-red-500/10 text-red-400' : 'bg-card/60 text-foreground'}`}>
                          {v}
                        </span>
                      </td>
                    ))}
                    <td className="text-center font-bold text-primary">{report.sarvashtakavarga.reduce((a, b) => a + b, 0)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                <span><span className="inline-block w-3 h-3 rounded bg-green-500/20 mr-1"></span>{t('Strong (6+)', 'बलवान (6+)')}</span>
                <span><span className="inline-block w-3 h-3 rounded bg-amber-500/10 mr-1"></span>{t('Average (4-5)', 'सामान्य (4-5)')}</span>
                <span><span className="inline-block w-3 h-3 rounded bg-red-500/10 mr-1"></span>{t('Weak (0-3)', 'कमज़ोर (0-3)')}</span>
              </div>
            </div>

            {[
              { title: t('Strong Houses', 'बलवान भाव'), content: report.strongHouses },
              { title: t('Weak Houses', 'कमज़ोर भाव'), content: report.weakHouses },
              { title: t('Analysis', 'विश्लेषण'), content: report.analysis },
            ].map(sec => sec.content && (
              <div key={sec.title} className="bg-card/60 border border-border/40 rounded-2xl p-6">
                <h2 className="text-lg font-serif font-bold text-primary mb-3">{sec.title}</h2>
                <p className="text-foreground/80 leading-relaxed">{sec.content}</p>
              </div>
            ))}

            <Button onClick={() => setReport(null)} variant="outline" className="w-full rounded-xl border-primary/30 text-primary">
              {t('Generate Again', 'पुनः बनाएं')}
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="bg-card/60 border border-border/40 rounded-2xl p-6 space-y-4 max-w-md mx-auto">
              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem><FormLabel>{t('Date of Birth', 'जन्म तिथि')}</FormLabel><FormControl><Input type="date" {...field} className="bg-background/40 border-border/40" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="timeOfBirth" render={({ field }) => (
                <FormItem><FormLabel>{t('Time of Birth', 'जन्म समय')}</FormLabel><FormControl><Input type="time" {...field} className="bg-background/40 border-border/40" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="placeOfBirth" render={({ field }) => (
                <FormItem><FormLabel>{t('Place of Birth', 'जन्म स्थान')}</FormLabel><FormControl><Input {...field} placeholder={t('City, State, Country', 'शहर, राज्य, देश')} className="bg-background/40 border-border/40" /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={createAV.isPending} className="w-full h-12 text-lg rounded-xl bg-primary text-primary-foreground">
                {createAV.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t('Generating...', 'बन रहा है...')}</> : <><BarChart3 className="mr-2 h-5 w-5" />{t('Generate Ashtakavarga', 'अष्टकवर्ग बनाएं')}</>}
              </Button>
            </form>
          </Form>
        )}
      </div>
      </AuthGate>
    </Layout>
  );
}
