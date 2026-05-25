import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { useGetSubscriptionPlans } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Check, Crown, Sparkles, Star, ShieldCheck, Zap, HeartHandshake } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

const tierMeta = [
  { icon: Sparkles, accent: 'from-sky-400/20 to-sky-600/5', ring: 'ring-sky-400/30' },
  { icon: Crown, accent: 'from-primary/30 to-amber-600/10', ring: 'ring-primary/60' },
  { icon: Star, accent: 'from-purple-400/20 to-purple-700/5', ring: 'ring-purple-400/30' },
];

export default function Premium() {
  const { t } = useLanguage();
  const { data: plans, isLoading } = useGetSubscriptionPlans();

  return (
    <Layout>
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-primary/8 via-primary/3 to-transparent" />

        <div className="relative container mx-auto px-4 py-16 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 mb-6">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                {t('Premium Membership', 'प्रीमियम सदस्यता')}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-5 leading-tight">
              {t('Unlock ', 'अनलॉक करें ')}
              <span className="bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">
                {t('Premium Guidance', 'प्रीमियम मार्गदर्शन')}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t(
                'Unlimited Kundli, Vastu reports, daily personalised remedies and priority access to our acharyas.',
                'असीमित कुण्डली, वास्तु रिपोर्ट, दैनिक व्यक्तिगत उपाय और हमारे आचार्यों तक प्राथमिकता पहुंच।'
              )}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-7 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary" />{t('Cancel anytime', 'कभी भी रद्द करें')}</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" />{t('Instant access', 'तुरंत पहुंच')}</span>
              <span className="flex items-center gap-1.5"><HeartHandshake className="w-3.5 h-3.5 text-primary" />{t('50,000+ trust us', '50,000+ हम पर भरोसा करते हैं')}</span>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-[520px] rounded-3xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto items-start">
              {plans?.map((plan, idx) => {
                const meta = tierMeta[idx] ?? tierMeta[0];
                const Icon = meta.icon;
                const monthly = ((plan.price ?? 0) / 100 / Math.max(1, plan.duration / 30));
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className={`relative flex flex-col transition-all ${
                      plan.isPopular
                        ? 'md:scale-105 md:-translate-y-2 z-10'
                        : 'hover:-translate-y-1'
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                        <div className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground px-4 py-1 rounded-full text-xs font-bold shadow-lg shadow-primary/40 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          {t('Most Popular', 'सबसे लोकप्रिय')}
                        </div>
                      </div>
                    )}

                    <div
                      className={`relative flex flex-col p-7 md:p-8 h-full bg-card border overflow-hidden rounded-3xl ${
                        plan.isPopular
                          ? 'border-primary/60 ring-2 ' + meta.ring + ' shadow-2xl shadow-primary/20'
                          : 'border-border/50 hover:border-primary/30'
                      }`}
                    >
                      {plan.isPopular && (
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                      )}
                      <div className={`absolute inset-0 bg-gradient-to-br ${meta.accent} opacity-50 pointer-events-none`} />

                      <div className="relative">
                        <div className="flex items-center gap-3 mb-5">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                            plan.isPopular ? 'bg-primary/20 text-primary' : 'bg-muted text-foreground/70'
                          }`}>
                            <Icon className="w-5 h-5" strokeWidth={2} />
                          </div>
                          <h3 className="text-xl font-serif font-bold text-foreground">
                            {t(plan.name, plan.nameHindi || plan.name)}
                          </h3>
                        </div>

                        <div className="mb-1 flex items-baseline gap-1.5">
                          <span className={`text-5xl font-bold ${plan.isPopular ? 'text-primary' : 'text-foreground'}`}>
                            ₹{((plan.price ?? 0) / 100).toLocaleString('en-IN')}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            / {plan.duration} {t('days', 'दिन')}
                          </span>
                        </div>
                        {plan.duration >= 60 && (
                          <p className="text-xs text-muted-foreground mb-6">
                            ≈ ₹{Math.round(monthly).toLocaleString('en-IN')} {t('per month', 'प्रति माह')}
                          </p>
                        )}
                        {plan.duration < 60 && <div className="mb-6" />}

                        <div className="h-px bg-border/50 my-2" />

                        <ul className="space-y-3.5 my-6 flex-1">
                          {((): string[] => {
                            try { return JSON.parse(plan.features); } catch { return plan.features.split('\n'); }
                          })().map((feature: string, fidx: number) => (
                            <li key={fidx} className="flex items-start gap-2.5">
                              <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                                plan.isPopular ? 'bg-primary/20' : 'bg-muted'
                              }`}>
                                <Check className={`w-3 h-3 ${plan.isPopular ? 'text-primary' : 'text-foreground/70'}`} strokeWidth={3} />
                              </span>
                              <span className="text-sm text-foreground/85 leading-snug">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          className={`w-full py-6 text-base rounded-2xl font-bold transition-all ${
                            plan.isPopular
                              ? 'bg-gradient-to-r from-primary to-amber-400 text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/30'
                              : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground border border-border'
                          }`}
                        >
                          {plan.isPopular ? `✨ ${t('Choose Plan', 'योजना चुनें')}` : t('Choose Plan', 'योजना चुनें')}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground mt-12 max-w-md mx-auto">
            <ShieldCheck className="w-4 h-4 inline mr-1.5 text-primary" />
            {t(
              'Secure payments via Razorpay. UPI, cards, net banking and wallets accepted.',
              'Razorpay के द्वारा सुरक्षित भुगतान। UPI, कार्ड, नेट बैंकिंग और वॉलेट स्वीकृत।'
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
