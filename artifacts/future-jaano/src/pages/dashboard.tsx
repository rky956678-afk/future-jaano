import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { useUser } from '@clerk/react';
import { useGetUserDashboard } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocation } from 'wouter';
import { localizeActivityType, activityRoute, localizeSign } from '@/lib/zodiac';
import { ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const { t, language } = useLanguage();
  const { user } = useUser();
  const { data: dashboard, isLoading } = useGetUserDashboard();
  const [, navigate] = useLocation();
  const uiLang: 'hi' | 'en' = language === 'hi' ? 'hi' : 'en';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">
          {t('Namaste', 'नमस्ते')}, {user?.firstName || 'Seeker'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t('Welcome to your spiritual sanctuary.', 'आपके आध्यात्मिक अभयारण्य में आपका स्वागत है।')}
        </p>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {dashboard?.todayHoroscope && (
                <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6">
                  <h2 className="text-xl font-semibold mb-4 text-primary">{t("Today's Guidance", "आज का मार्गदर्शन")}</h2>
                  <p className="text-foreground/90 leading-relaxed">{dashboard.todayHoroscope.prediction}</p>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">{t('Recent Activity', 'हाल की गतिविधि')}</h2>
                {dashboard?.recentActivity && dashboard.recentActivity.length > 0 ? (
                  <ul className="space-y-2">
                    {dashboard.recentActivity.map(activity => {
                      const localizedSummary = activity.summary.replace(
                        /\b(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)\b/gi,
                        (m) => localizeSign(m, uiLang)
                      );
                      return (
                        <li key={activity.id}>
                          <button
                            type="button"
                            onClick={() => navigate(activityRoute(activity.type))}
                            className="w-full text-left text-sm flex items-start gap-2 p-3 rounded-xl hover:bg-primary/10 active:bg-primary/15 transition-colors border border-transparent hover:border-primary/20"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-primary">{localizeActivityType(activity.type, uiLang)}</span>
                              <p className="text-muted-foreground line-clamp-2 mt-1">{localizedSummary}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('No recent activity.', 'कोई हाल की गतिविधि नहीं।')}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
