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
import { useCreateKundli, KundliReport } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Download } from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';
import { useLocation } from 'wouter';
import { LangToggle } from '@/components/LangToggle';
import { localizeSign } from '@/lib/zodiac';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  timeOfBirth: z.string().min(1, 'Time of birth is required'),
  placeOfBirth: z.string().min(2, 'Place of birth is required'),
  gender: z.string().optional(),
});

export default function Kundli() {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [report, setReport] = React.useState<KundliReport | null>(null);
  const [downloadingPdf, setDownloadingPdf] = React.useState(false);
  const [, navigate] = useLocation();
  const reportRef = React.useRef<HTMLDivElement>(null);

  const createKundli = useCreateKundli();

  async function downloadPdf() {
    if (!reportRef.current || !report) return;
    setDownloadingPdf(true);
    try {
      const html2pdf = ((await import('html2pdf.js')) as unknown as { default: any }).default;
      const fileName = `Kundli-${report.name.replace(/\s+/g, '-')}-${report.dateOfBirth}.pdf`;
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: fileName,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#070b2d',
            logging: false,
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(reportRef.current)
        .save();
      toast({
        title: t('PDF Downloaded', 'PDF डाउनलोड हो गई'),
        description: t('Your Kundli has been saved as PDF.', 'आपकी कुण्डली PDF के रूप में सेव हो गई है।'),
      });
    } catch {
      toast({
        title: t('Download failed', 'डाउनलोड विफल'),
        description: t('Could not generate the PDF. Please try again.', 'PDF नहीं बन सकी। कृपया पुनः प्रयास करें।'),
        variant: 'destructive',
      });
    } finally {
      setDownloadingPdf(false);
    }
  }

  function goToUpaay() {
    if (!report) return;
    const doshas = report.doshas || '';
    const name = report.name || '';
    const desc = language === 'en'
      ? `My Kundli shows the following doshas: ${doshas || 'none identified'}. Please suggest remedies for these.`
      : `मेरी कुण्डली में निम्न दोष हैं: ${doshas || 'कोई दोष नहीं'}। कृपया मुझे इनके उपाय बताएं।`;
    const params = new URLSearchParams({
      from: 'kundli',
      name,
      doshas,
      description: desc,
      category: 'other',
    });
    navigate(`/problem-solver?${params.toString()}`);
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      dateOfBirth: '',
      timeOfBirth: '',
      placeOfBirth: '',
      gender: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createKundli.mutate({
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
          description: t('Failed to generate Kundli. Please try again.', 'कुण्डली बनाने में विफल। कृपया पुनः प्रयास करें।'),
          variant: 'destructive'
        });
      }
    });
  }

  return (
    <Layout>
      <AuthGate feature={{
        icon: Sparkles,
        titleEn: 'Your Personalized Vedic Kundli Awaits',
        titleHi: 'आपकी व्यक्तिगत वैदिक कुण्डली तैयार है',
        descEn: 'AI-generated birth chart analysis covering sun/moon sign, ascendant, doshas, and personalized remedies.',
        descHi: 'जन्म कुण्डली विश्लेषण — सूर्य/चंद्र राशि, लग्न, दोष और व्यक्तिगत उपाय।',
      }}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary mb-4 drop-shadow-md">
          {t('Kundli Analysis', 'कुण्डली विश्लेषण')}
        </h1>
        <p className="text-center text-muted-foreground mb-5">
          {t('Discover your cosmic blueprint and life path based on planetary alignments.', 'ग्रहों की स्थिति के आधार पर अपने ब्रह्मांडीय ब्लूप्रिंट और जीवन पथ की खोज करें।')}
        </p>
        <LangToggle className="mb-8" lang={language} onChange={setLanguage} />

        {report ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                onClick={() => setReport(null)}
                className="text-primary hover:underline font-medium flex items-center gap-2 self-start"
              >
                ← {t('Generate Another Kundli', 'दूसरी कुण्डली बनाएं')}
              </button>
              <Button
                onClick={downloadPdf}
                disabled={downloadingPdf}
                className="bg-gradient-to-r from-amber-400 to-amber-600 text-[#070b2d] hover:from-amber-300 hover:to-amber-500 rounded-full px-5 h-10 font-semibold flex items-center gap-2 shadow-lg"
              >
                {downloadingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('Preparing PDF…', 'PDF बन रही है…')}
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    {t('Download PDF', 'PDF डाउनलोड करें')}
                  </>
                )}
              </Button>
            </div>

            <div ref={reportRef} className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="border-b border-border/50 pb-6">
                <h2 className="text-2xl font-serif font-bold text-primary">{report.name}'s {t('Kundli', 'कुण्डली')}</h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-muted-foreground">
                  <p><strong>{t('DOB:', 'जन्म तिथि:')}</strong> {report.dateOfBirth}</p>
                  <p><strong>{t('Time:', 'समय:')}</strong> {report.timeOfBirth}</p>
                  <p><strong>{t('Place:', 'स्थान:')}</strong> {report.placeOfBirth}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/50 p-4 rounded-xl border border-border/30 text-center">
                  <p className="text-sm text-muted-foreground">{t('Sun Sign', 'सूर्य राशि')}</p>
                  <p className="text-lg font-bold text-foreground">{localizeSign(report.sunSign, language === 'en' ? 'en' : 'hi')}</p>
                </div>
                <div className="bg-background/50 p-4 rounded-xl border border-border/30 text-center">
                  <p className="text-sm text-muted-foreground">{t('Moon Sign', 'चंद्र राशि')}</p>
                  <p className="text-lg font-bold text-foreground">{localizeSign(report.moonSign, language === 'en' ? 'en' : 'hi')}</p>
                </div>
                <div className="bg-background/50 p-4 rounded-xl border border-border/30 text-center">
                  <p className="text-sm text-muted-foreground">{t('Ascendant (Lagna)', 'लग्न')}</p>
                  <p className="text-lg font-bold text-foreground">{localizeSign(report.ascendant, language === 'en' ? 'en' : 'hi')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary">{t('Detailed Analysis', 'विस्तृत विश्लेषण')}</h3>
                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{report.analysis}</p>
              </div>

              {report.planetaryPositions && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground/80">{t('Planetary Positions', 'ग्रह स्थिति')}</h4>
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">{report.planetaryPositions}</p>
                </div>
              )}

              {report.doshas && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-destructive">{t('Doshas Found', 'दोष')}</h4>
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">{report.doshas}</p>
                </div>
              )}

              {report.remedies && (
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2">
                  <h4 className="font-semibold text-primary">{t('Suggested Remedies', 'सुझाए गए उपाय')}</h4>
                  <p className="text-foreground/90 text-sm whitespace-pre-wrap">{report.remedies}</p>
                </div>
              )}

              {report.luckyStone && (
                <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                  <span className="font-medium">{t('Lucky Gemstone:', 'शुभ रत्न:')}</span>
                  <span className="text-primary font-bold">{report.luckyStone}</span>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <h3 className="font-serif font-bold text-lg text-primary mb-1">
                  {t('Get Personalized Remedies', 'व्यक्तिगत उपाय प्राप्त करें')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('Based on your Kundli doshas, get remedies from Lal Kitab, Atharvaveda & Vastu.', 'आपकी कुण्डली के दोषों के आधार पर लाल किताब, अथर्ववेद और वास्तु से उपाय पाएं।')}
                </p>
              </div>
              <Button
                onClick={goToUpaay}
                className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 h-11 font-semibold flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {t('Get Remedies (Upaay)', 'उपाय प्राप्त करें')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-card/40 backdrop-blur-md border border-border/50 p-6 md:p-8 rounded-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/90">{t('Full Name', 'पूरा नाम')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('Enter your name', 'अपना नाम दर्ज करें')} className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  
                  <FormField
                    control={form.control}
                    name="timeOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/90">{t('Time of Birth', 'जन्म समय')}</FormLabel>
                        <FormControl>
                          <Input type="time" className="bg-background/50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="placeOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/90">{t('City of Birth', 'जन्म स्थान')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('e.g. New Delhi, India', 'उदा. नई दिल्ली, भारत')} className="bg-background/50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/90">{t('Gender', 'लिंग')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder={t('Select gender', 'लिंग चुनें')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">{t('Male', 'पुरुष')}</SelectItem>
                            <SelectItem value="female">{t('Female', 'महिला')}</SelectItem>
                            <SelectItem value="other">{t('Other', 'अन्य')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full h-12 text-lg rounded-xl" disabled={createKundli.isPending}>
                  {createKundli.isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('Generating...', 'बनाया जा रहा है...')}</>
                  ) : (
                    t('Generate Kundli', 'कुण्डली बनाएं')
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
