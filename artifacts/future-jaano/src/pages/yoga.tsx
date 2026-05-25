import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetYogaSuggestions, YogaPlan } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Flower2 } from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';
import { LangToggle } from '@/components/LangToggle';

const formSchema = z.object({
  healthGoals: z.string().min(5, 'Please describe your health goals'),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  healthConditions: z.string().optional(),
  preferredDuration: z.coerce.number().min(5).max(120).optional(),
});

export default function Yoga() {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [plan, setPlan] = React.useState<YogaPlan | null>(null);

  const getYogaPlan = useGetYogaSuggestions();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      healthGoals: '',
      fitnessLevel: 'beginner',
      healthConditions: '',
      preferredDuration: 30,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    getYogaPlan.mutate({
      data: {
        ...values,
        language
      }
    }, {
      onSuccess: (data) => {
        setPlan(data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onError: () => {
        toast({
          title: t('Error', 'त्रुटि'),
          description: t('Failed to generate plan. Please try again.', 'योजना बनाने में विफल। कृपया पुनः प्रयास करें।'),
          variant: 'destructive'
        });
      }
    });
  }

  return (
    <Layout>
      <AuthGate feature={{
        icon: Flower2,
        titleEn: 'A Personalised Yoga & Pranayama Plan',
        titleHi: 'व्यक्तिगत योग और प्राणायाम योजना',
        descEn: 'Get a tailored yoga and pranayama routine based on your health goals and energy needs.',
        descHi: 'आपके स्वास्थ्य लक्ष्यों के अनुसार अनुकूलित योग और प्राणायाम दिनचर्या प्राप्त करें।',
      }}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary mb-4 drop-shadow-md">
          {t('Yoga & Meditation Plan', 'योग और ध्यान योजना')}
        </h1>
        <p className="text-center text-muted-foreground mb-5">
          {t('Personalized holistic routines for your physical and spiritual well-being.', 'आपके शारीरिक और आध्यात्मिक कल्याण के लिए व्यक्तिगत समग्र दिनचर्या।')}
        </p>
        <LangToggle className="mb-8" lang={language} onChange={setLanguage} />

        {plan ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setPlan(null)}
              className="text-primary hover:underline font-medium flex items-center gap-2"
            >
              ← {t('Create Another Plan', 'दूसरी योजना बनाएं')}
            </button>

            <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary pb-2 border-b border-border/50">{t('Morning Routine', 'सुबह की दिनचर्या')}</h3>
                  <p className="text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed">{plan.morningRoutine}</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary pb-2 border-b border-border/50">{t('Evening Routine', 'शाम की दिनचर्या')}</h3>
                  <p className="text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed">{plan.eveningRoutine}</p>
                </div>
              </div>

              <div className="space-y-4 bg-primary/5 p-6 rounded-xl border border-primary/20">
                <h3 className="text-xl font-semibold text-primary">{t('Meditation & Mindfulness', 'ध्यान और माइंडफुलनेस')}</h3>
                <p className="text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed">{plan.meditation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                {plan.breathingExercises && (
                  <div>
                    <h4 className="font-semibold text-foreground/90 mb-2">{t('Pranayama (Breathing)', 'प्राणायाम')}</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{plan.breathingExercises}</p>
                  </div>
                )}
                {plan.dietaryAdvice && (
                  <div>
                    <h4 className="font-semibold text-foreground/90 mb-2">{t('Sattvic Diet Advice', 'सात्विक आहार सलाह')}</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{plan.dietaryAdvice}</p>
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
                  name="healthGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/90">{t('What are your main health goals?', 'आपके स्वास्थ्य लक्ष्य क्या हैं?')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('e.g., Reduce stress, improve flexibility, better sleep...', 'उदा., तनाव कम करें, लचीलापन बढ़ाएं, बेहतर नींद...')} className="bg-background/50 resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fitnessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/90">{t('Experience Level', 'अनुभव स्तर')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder={t('Select level', 'स्तर चुनें')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">{t('Beginner', 'शुरुआती')}</SelectItem>
                            <SelectItem value="intermediate">{t('Intermediate', 'मध्यम')}</SelectItem>
                            <SelectItem value="advanced">{t('Advanced', 'उन्नत')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/90">{t('Daily Time Available (mins)', 'दैनिक उपलब्ध समय (मिनट)')}</FormLabel>
                        <FormControl>
                          <Input type="number" className="bg-background/50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="healthConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/90">{t('Any health conditions or injuries?', 'कोई स्वास्थ्य समस्या या चोट?')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('e.g., Lower back pain, knee injury...', 'उदा., पीठ के निचले हिस्से में दर्द, घुटने की चोट...')} className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-12 text-lg rounded-xl" disabled={getYogaPlan.isPending}>
                  {getYogaPlan.isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('Creating your plan...', 'आपकी योजना बनाई जा रही है...')}</>
                  ) : (
                    t('Get Personalized Plan', 'व्यक्तिगत योजना प्राप्त करें')
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
