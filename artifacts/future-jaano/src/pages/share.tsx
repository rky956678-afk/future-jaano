import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Camera, Hand, User, Home as HomeIcon, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language';

interface SharedContent {
  title?: string;
  text?: string;
  url?: string;
}

export default function Share() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [shared, setShared] = useState<SharedContent>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShared({
      title: params.get('title') ?? undefined,
      text: params.get('text') ?? undefined,
      url: params.get('url') ?? undefined,
    });
  }, []);

  const sharedText = shared.text || shared.title || shared.url || '';

  const tools = [
    {
      id: 'vastu',
      label: t('Vastu Analysis', 'वास्तु विश्लेषण'),
      desc: t('Room or house photo', 'कमरे या घर की तस्वीर'),
      icon: HomeIcon,
      href: '/vastu',
    },
    {
      id: 'palm',
      label: t('Palm Reading', 'हस्तरेखा'),
      desc: t('Photo of your palm', 'हथेली की तस्वीर'),
      icon: Hand,
      href: '/palm-reading',
    },
    {
      id: 'face',
      label: t('Face Reading', 'मुख दर्शन'),
      desc: t('Photo of your face', 'चेहरे की तस्वीर'),
      icon: User,
      href: '/face-reading',
    },
    {
      id: 'problem',
      label: t('Problem Solver', 'समस्या समाधान'),
      desc: t('Use shared text as your question', 'साझा किया गया text प्रश्न के रूप में उपयोग करें'),
      icon: Sparkles,
      href: '/problem-solver',
    },
  ];

  const handleTool = (href: string) => {
    if (sharedText && href === '/problem-solver') {
      sessionStorage.setItem('shared-question', sharedText);
    }
    setLocation(href);
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl">
            <Camera className="h-8 w-8 text-[#070b2d]" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary md:text-4xl">
            {t('Shared with Future Jaano', 'Future Jaano के साथ साझा किया गया')}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t(
              'Choose how you would like to analyse what you shared.',
              'जो आपने साझा किया उसका विश्लेषण कैसे चाहिए, चुनें।',
            )}
          </p>
        </div>

        {sharedText && (
          <div className="mb-6 rounded-2xl border border-primary/30 bg-card/60 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {t('Shared text', 'साझा किया गया text')}
            </p>
            <p className="break-words text-sm text-foreground">{sharedText}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => handleTool(tool.href)}
                className="group flex items-start gap-3 rounded-2xl border border-border/40 bg-card/60 p-4 text-left transition hover:border-primary/60 hover:bg-card/80"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{tool.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{tool.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              {t('Back to home', 'होम पर वापस')}
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
