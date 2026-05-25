import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateNumerologyReport, NumerologyReport } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calculator } from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';
import { LangToggle } from '@/components/LangToggle';

const formSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
});

export default function Numerology() {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [report, setReport] = React.useState<NumerologyReport | null>(null);

  const createReport = useCreateNumerologyReport();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      dateOfBirth: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createReport.mutate({
      data: {
        ...values,
        language
      }
    }, {
      onSuccess: (data) => {
        setReport(data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onError: () => {
        toast({
          title: t('Error', 'त्रुटि'),
          description: t('Failed to generate report. Please try again.', 'रिपोर्ट बनाने में विफल। कृपया पुनः प्रयास करें।'),
          variant: 'destructive'
        });
      }
    });
  }

  return (
    <Layout>
      <AuthGate feature={{
        icon: Calculator,
        titleEn: 'Unlock the Power of Your Numbers',
        titleHi: 'अपनी संख्याओं की शक्ति जानें',
        descEn: 'Get your life path number, destiny number, and a full numerology report grounded in Vedic tradition.',
        descHi: 'जीवन पथ संख्या, भाग्य संख्या और पूर्ण अंक ज्योतिष रिपोर्ट — वैदिक परंपरा पर आधारित।',
      }}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary mb-4 drop-shadow-md">
          {t('Numerology Reading', 'अंक ज्योतिष')}
        </h1>
        <p className="text-center text-muted-foreground mb-5">
          {t('Discover the hidden meaning of numbers in your life.', 'अपने जीवन में संख्याओं के छिपे अर्थ की खोज करें।')}
        </p>
        <LangToggle className="mb-8" lang={language} onChange={setLanguage} />

        {report ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setReport(null)}
              className="text-primary hover:underline font-medium flex items-center gap-2"
            >
              ← {t('Generate Another Report', 'दूसरी रिपोर्ट बनाएं')}
            </button>

            <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="border-b border-border/50 pb-6 text-center">
                <h2 className="text-2xl font-serif font-bold text-primary">{report.fullName}</h2>
                <p className="text-sm text-muted-foreground mt-2">{report.dateOfBirth}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-background/50 p-4 rounded-xl border border-border/30 text-center">
                  <p className="text-sm text-muted-foreground">{t('Life Path', 'जीवन पथ')}</p>
                  <p className="text-3xl font-bold text-primary">{report.lifePathNumber}</p>
                </div>
                <div className="bg-background/50 p-4 rounded-xl border border-border/30 text-center">
                  <p className="text-sm text-muted-foreground">{t('Destiny', 'भाग्य')}</p>
                  <p className="text-3xl font-bold text-primary">{report.destinyNumber}</p>
                </div>
                {report.soulUrgeNumber && (
                  <div className="bg-background/50 p-4 rounded-xl border border-border/30 text-center">
                    <p className="text-sm text-muted-foreground">{t('Soul Urge', 'आत्मा की इच्छा')}</p>
                    <p className="text-3xl font-bold text-primary">{report.soulUrgeNumber}</p>
                  </div>
                )}
                {report.personalityNumber && (
                  <div className="bg-background/50 p-4 rounded-xl border border-border/30 text-center">
                    <p className="text-sm text-muted-foreground">{t('Personality', 'व्यक्तित्व')}</p>
                    <p className="text-3xl font-bold text-primary">{report.personalityNumber}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-semibold text-primary">{t('Analysis', 'विश्लेषण')}</h3>
                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{report.analysis}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                {report.strengths && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-500">{t('Strengths', 'ताकत')}</h4>
                    <p className="text-sm text-muted-foreground">{report.strengths}</p>
                  </div>
                )}
                {report.challenges && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-destructive">{t('Challenges', 'चुनौतियां')}</h4>
                    <p className="text-sm text-muted-foreground">{report.challenges}</p>
                  </div>
                )}
              </div>

              {(report.luckyYears || report.compatibleNumbers) && (
                <div className="flex flex-wrap gap-6 pt-4 border-t border-border/50">
                  {report.luckyYears && (
                    <div>
                      <span className="text-sm text-muted-foreground block">{t('Lucky Years', 'शुभ वर्ष')}</span>
                      <span className="font-medium">{report.luckyYears}</span>
                    </div>
                  )}
                  {report.compatibleNumbers && (
                    <div>
                      <span className="text-sm text-muted-foreground block">{t('Compatible Numbers', 'संगत अंक')}</span>
                      <span className="font-medium">{report.compatibleNumbers}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-card/40 backdrop-blur-md border border-border/50 p-6 md:p-8 rounded-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/90">{t('Full Name (as on birth certificate)', 'पूरा नाम (जन्म प्रमाण पत्र के अनुसार)')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('Enter your full name', 'अपना पूरा नाम दर्ज करें')} className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/90">{t('Date of Birth', 'जन्म तिथि')}</FormLabel>
                      <FormControl>
                        <Input type="date" className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-12 text-lg rounded-xl" disabled={createReport.isPending}>
                  {createReport.isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('Calculating...', 'गणना की जा रही है...')}</>
                  ) : (
                    t('Get Numerology Report', 'अंक ज्योतिष रिपोर्ट प्राप्त करें')
                  )}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </div>
      </AuthGate>
    </Layout>
  );
}
