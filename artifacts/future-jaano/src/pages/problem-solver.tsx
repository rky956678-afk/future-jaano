import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubmitProblem, ProblemSolution } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, BookOpen, Leaf, Link2 } from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';
import { useSearch } from 'wouter';
import { LangToggle } from '@/components/LangToggle';

const formSchema = z.object({
  category: z.enum(['health', 'career', 'marriage', 'business', 'education', 'finance', 'relationship', 'other']),
  description: z.string().min(10, 'Please describe your problem in more detail'),
});

export default function ProblemSolver() {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [solution, setSolution] = React.useState<ProblemSolution | null>(null);
  const search = useSearch();

  const submitProblem = useSubmitProblem();

  const params = React.useMemo(() => new URLSearchParams(search), [search]);
  const fromKundli = params.get('from') === 'kundli';
  const kundliName = params.get('name') || '';
  const kundliDesc = params.get('description') || '';
  const kundliCategory = (params.get('category') || 'other') as z.infer<typeof formSchema>['category'];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: fromKundli ? kundliCategory : 'career',
      description: fromKundli ? kundliDesc : '',
    },
  });

  React.useEffect(() => {
    if (fromKundli && kundliDesc) {
      form.setValue('category', kundliCategory);
      form.setValue('description', kundliDesc);
    }
  }, [fromKundli, kundliDesc, kundliCategory]);

  React.useEffect(() => {
    const shared = sessionStorage.getItem('shared-question');
    if (shared) {
      form.setValue('description', shared);
      sessionStorage.removeItem('shared-question');
    }
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {
    submitProblem.mutate({
      data: {
        ...values,
        language
      }
    }, {
      onSuccess: (data) => {
        setSolution(data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onError: () => {
        toast({
          title: t('Error', 'त्रुटि'),
          description: t('Failed to get guidance. Please try again.', 'मार्गदर्शन प्राप्त करने में विफल। कृपया पुनः प्रयास करें।'),
          variant: 'destructive'
        });
      }
    });
  }

  return (
    <Layout>
      <AuthGate feature={{
        icon: Leaf,
        titleEn: 'Find Remedies for Life\u2019s Challenges',
        titleHi: 'जीवन की चुनौतियों के उपाय खोजें',
        descEn: 'Describe your problem and get personalized solutions from Lal Kitab, Atharvaveda, Yog Pradeepam and Vastu.',
        descHi: 'अपनी समस्या बताएं — लाल किताब, अथर्ववेद, योग प्रदीपम और वास्तु से व्यक्तिगत उपाय पाएं।',
      }}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary mb-4 drop-shadow-md">
          {t('Divine Problem Solver', 'दिव्य समस्या समाधान')}
        </h1>
        <p className="text-center text-muted-foreground mb-5">
          {t('Seek guidance from the combined wisdom of Lal Kitab, Atharvaveda, Vastu, and Yog Pradeepam.', 'लाल किताब, अथर्ववेद, वास्तु और योग प्रदीपिका के संयुक्त ज्ञान से मार्गदर्शन लें।')}
        </p>
        <LangToggle className="mb-6" lang={language} onChange={setLanguage} />

        {fromKundli && (
          <div className="mb-6 flex items-start gap-3 bg-primary/10 border border-primary/30 rounded-xl px-4 py-3">
            <Link2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-primary">
                {t('Linked from your Kundli', 'आपकी कुण्डली से लिंक किया गया')}
                {kundliName ? ` — ${kundliName}` : ''}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('Your Kundli dosha details have been pre-filled below. You can edit before submitting.', 'आपके कुण्डली दोष का विवरण नीचे भरा गया है। सबमिट करने से पहले आप बदल सकते हैं।')}
              </p>
            </div>
          </div>
        )}

        {solution ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setSolution(null)}
              className="text-primary hover:underline font-medium flex items-center gap-2"
            >
              ← {t('Ask Another Question', 'एक और प्रश्न पूछें')}
            </button>

            <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden">
              <div className="p-6 md:p-8 space-y-8">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {t('General Guidance', 'सामान्य मार्गदर्शन')}
                  </h2>
                  <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed bg-background/50 p-4 rounded-xl">{solution.remedies}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {solution.lalKitabRemedy && (
                    <div className="space-y-2 bg-primary/5 p-4 rounded-xl border border-primary/20">
                      <h3 className="font-semibold text-primary flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        {t('Lal Kitab Remedy', 'लाल किताब उपाय')}
                      </h3>
                      <p className="text-sm text-foreground/80">{solution.lalKitabRemedy}</p>
                    </div>
                  )}

                  {solution.atharvavedaRemedy && (
                    <div className="space-y-2 bg-primary/5 p-4 rounded-xl border border-primary/20">
                      <h3 className="font-semibold text-primary flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        {t('Atharvaveda Remedy', 'अथर्ववेद उपाय')}
                      </h3>
                      <p className="text-sm text-foreground/80">{solution.atharvavedaRemedy}</p>
                    </div>
                  )}

                  {solution.vastuRemedy && (
                    <div className="space-y-2 bg-primary/5 p-4 rounded-xl border border-primary/20">
                      <h3 className="font-semibold text-primary flex items-center gap-2">
                        <Leaf className="w-4 h-4" />
                        {t('Vastu Guidance', 'वास्तु मार्गदर्शन')}
                      </h3>
                      <p className="text-sm text-foreground/80">{solution.vastuRemedy}</p>
                    </div>
                  )}

                  {solution.yogPradeepamRemedy && (
                    <div className="space-y-2 bg-primary/5 p-4 rounded-xl border border-primary/20">
                      <h3 className="font-semibold text-primary flex items-center gap-2">
                        <Leaf className="w-4 h-4" />
                        {t('Yoga/Pranayama', 'योग/प्राणायाम')}
                      </h3>
                      <p className="text-sm text-foreground/80">{solution.yogPradeepamRemedy}</p>
                    </div>
                  )}
                </div>

                {(solution.mantra || solution.gemstone) && (
                  <div className="flex flex-col md:flex-row gap-6 pt-6 border-t border-border/50">
                    {solution.mantra && (
                      <div className="flex-1 bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <h4 className="font-semibold text-foreground/80 mb-2 text-xs uppercase tracking-wider">
                          {t('Mantra (Sanskrit)', 'मंत्र (संस्कृत)')}
                        </h4>
                        <p className="text-primary font-serif text-xl leading-relaxed tracking-wide"
                           style={{ fontFamily: "'Noto Serif Devanagari', 'Mangal', serif" }}>
                          {solution.mantra}
                        </p>
                      </div>
                    )}
                    {solution.gemstone && (
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground/80 mb-1">{t('Gemstone', 'रत्न')}</h4>
                        <p className="text-foreground">{solution.gemstone}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-card/40 backdrop-blur-md border border-border/50 p-6 md:p-8 rounded-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/90">{t('What area of life needs guidance?', 'जीवन के किस क्षेत्र में मार्गदर्शन की आवश्यकता है?')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50 h-12 text-lg">
                            <SelectValue placeholder={t('Select a category', 'श्रेणी चुनें')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="health">{t('Health', 'स्वास्थ्य')}</SelectItem>
                          <SelectItem value="career">{t('Career & Job', 'करियर')}</SelectItem>
                          <SelectItem value="finance">{t('Finance & Wealth', 'वित्त')}</SelectItem>
                          <SelectItem value="business">{t('Business', 'व्यापार')}</SelectItem>
                          <SelectItem value="marriage">{t('Marriage', 'विवाह')}</SelectItem>
                          <SelectItem value="relationship">{t('Relationships', 'रिश्ते')}</SelectItem>
                          <SelectItem value="education">{t('Education', 'शिक्षा')}</SelectItem>
                          <SelectItem value="other">{t('Other', 'अन्य')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/90">{t('Describe your problem', 'अपनी समस्या का वर्णन करें')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('Please be specific about your current situation...', 'कृपया अपनी वर्तमान स्थिति के बारे में विशिष्ट रहें...')} 
                          className="bg-background/50 min-h-[150px] text-base resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-14 text-lg rounded-xl" disabled={submitProblem.isPending}>
                  {submitProblem.isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('Seeking Divine Guidance...', 'दिव्य मार्गदर्शन प्राप्त किया जा रहा है...')}</>
                  ) : (
                    t('Seek Guidance', 'मार्गदर्शन प्राप्त करें')
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
