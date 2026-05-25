import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateMuhurat, MuhuratReport } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarCheck, Star } from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';

const formSchema = z.object({
  purpose: z.enum(['vivah','grih-pravesh','vyapar','yatra','naam-karan','mundan','other']),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  location: z.string().optional(),
});

const QUALITY_STYLES: Record<string, string> = {
  excellent: 'bg-green-500/10 border-green-500/30 text-green-400',
  good: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  average: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
};

export default function Muhurat() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [report, setReport] = React.useState<MuhuratReport | null>(null);
  const createMuhurat = useCreateMuhurat();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { purpose: 'vivah', startDate: '', endDate: '', location: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await createMuhurat.mutateAsync({ data: { ...values, language } });
      setReport(result);
    } catch {
      toast({ title: t('Error', 'त्रुटि'), description: t('Could not find Muhurats. Please try again.', 'मुहूर्त नहीं मिल सके। पुनः प्रयास करें।'), variant: 'destructive' });
    }
  }

  const purposes = [
    { value: 'vivah', en: 'Vivah (Marriage)', hi: 'विवाह' },
    { value: 'grih-pravesh', en: 'Grih Pravesh (Housewarming)', hi: 'गृह प्रवेश' },
    { value: 'vyapar', en: 'Vyapar (Business Start)', hi: 'व्यापार प्रारम्भ' },
    { value: 'yatra', en: 'Yatra (Travel)', hi: 'यात्रा' },
    { value: 'naam-karan', en: 'Naam Karan (Naming)', hi: 'नामकरण' },
    { value: 'mundan', en: 'Mundan (First Haircut)', hi: 'मुंडन' },
    { value: 'other', en: 'Other Auspicious Work', hi: 'अन्य शुभ कार्य' },
  ];

  return (
    <Layout>
      <AuthGate feature={{
        icon: CalendarCheck,
        titleEn: 'Find the Perfect Muhurat',
        titleHi: 'सर्वोत्तम मुहूर्त खोजें',
        descEn: 'Discover auspicious dates and timings for marriage, business, travel, and important life events.',
        descHi: 'विवाह, व्यापार, यात्रा और महत्वपूर्ण जीवन कार्यों के लिए शुभ तिथि और समय खोजें।',
      }}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary mb-4 drop-shadow-md">
          {t('Muhurat Calculator', 'मुहूर्त कैलकुलेटर')}
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          {t('Find auspicious timings for marriage, housewarming, business, travel and more.', 'विवाह, गृह प्रवेश, व्यापार, यात्रा और अन्य शुभ कार्यों के लिए मुहूर्त निकालें।')}
        </p>

        {report ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
              <CalendarCheck className="w-10 h-10 text-primary mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">{t('Auspicious timings for', 'शुभ मुहूर्त')}</p>
              <p className="text-2xl font-serif font-bold text-primary">{report.purpose}</p>
              <p className="text-sm text-muted-foreground mt-1">{report.muhurats.length} {t('muhurat(s) found', 'मुहूर्त मिले')}</p>
            </div>

            {report.muhurats.map((m, i) => (
              <div key={i} className={`border rounded-2xl p-5 ${QUALITY_STYLES[m.quality] || 'border-border/40 bg-card/60'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-lg text-foreground">{new Date(m.date + 'T00:00:00').toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-sm font-semibold text-foreground/80">{m.timeRange}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border font-semibold capitalize ${QUALITY_STYLES[m.quality]}`}>
                    {t(m.quality, m.quality === 'excellent' ? 'उत्तम' : m.quality === 'good' ? 'अच्छा' : 'सामान्य')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[{ l: t('Tithi', 'तिथि'), v: m.tithi }, { l: t('Nakshatra', 'नक्षत्र'), v: m.nakshatra }, { l: t('Yoga', 'योग'), v: m.yoga }].map(x => (
                    <span key={x.l} className="text-xs bg-background/40 border border-border/30 px-2 py-1 rounded-lg text-muted-foreground">
                      {x.l}: <span className="text-foreground font-medium">{x.v}</span>
                    </span>
                  ))}
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed">{m.reason}</p>
              </div>
            ))}

            <div className="bg-card/60 border border-border/40 rounded-2xl p-6">
              <h2 className="text-lg font-serif font-bold text-primary mb-3 flex items-center gap-2">
                <Star className="w-5 h-5" />{t('General Guidance', 'सामान्य मार्गदर्शन')}
              </h2>
              <p className="text-foreground/80 leading-relaxed">{report.generalGuidance}</p>
            </div>

            <Button onClick={() => setReport(null)} variant="outline" className="w-full rounded-xl border-primary/30 text-primary">
              {t('Find More Muhurats', 'और मुहूर्त खोजें')}
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="bg-card/60 border border-border/40 rounded-2xl p-6 space-y-4">
              <FormField control={form.control} name="purpose" render={({ field }) => (
                <FormItem><FormLabel>{t('Purpose', 'कार्य')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="bg-background/40 border-border/40"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {purposes.map(p => <SelectItem key={p.value} value={p.value}>{t(p.en, p.hi)}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem><FormLabel>{t('From Date', 'प्रारंभ तिथि')}</FormLabel><FormControl><Input type="date" {...field} className="bg-background/40 border-border/40" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem><FormLabel>{t('To Date', 'अंत तिथि')}</FormLabel><FormControl><Input type="date" {...field} className="bg-background/40 border-border/40" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>{t('Location (optional)', 'स्थान (वैकल्पिक)')}</FormLabel><FormControl><Input {...field} placeholder={t('City, State', 'शहर, राज्य')} className="bg-background/40 border-border/40" /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={createMuhurat.isPending} className="w-full h-12 text-lg rounded-xl bg-primary text-primary-foreground">
                {createMuhurat.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t('Finding...', 'खोजा जा रहा है...')}</> : <><CalendarCheck className="mr-2 h-5 w-5" />{t('Find Muhurat', 'मुहूर्त खोजें')}</>}
              </Button>
            </form>
          </Form>
        )}
      </div>
      </AuthGate>
    </Layout>
  );
}
