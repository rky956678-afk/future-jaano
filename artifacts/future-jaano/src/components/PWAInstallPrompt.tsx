import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'fj-pwa-install-dismissed-at';
const DISMISS_DAYS = 7;

export function PWAInstallPrompt() {
  const { t } = useLanguage();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error - iOS Safari
      window.navigator.standalone === true;
    if (isStandalone) return;

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    const dismissedRecently =
      dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 86400 * 1000;
    if (dismissedRecently) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === 'dismissed') {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setVisible(false);
    setDeferred(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible || !deferred) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 md:bottom-6 md:left-auto md:right-6 md:max-w-sm">
      <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-[#0b1244]/95 to-[#070b2d]/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg">
            <Download className="h-6 w-6 text-[#070b2d]" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-white">
              {t('Install Future Jaano', 'Future Jaano इंस्टॉल करें')}
            </p>
            <p className="mt-0.5 text-sm text-white/70">
              {t(
                'Faster access, works offline, no app store needed.',
                'तेज़ एक्सेस, ऑफ़लाइन काम करे, ऐप स्टोर की ज़रूरत नहीं।',
              )}
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={handleInstall}
                className="rounded-full bg-gradient-to-r from-amber-400 to-amber-600 font-semibold text-[#070b2d] hover:from-amber-300 hover:to-amber-500"
              >
                {t('Install', 'इंस्टॉल करें')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              >
                {t('Not now', 'अभी नहीं')}
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="text-white/50 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
