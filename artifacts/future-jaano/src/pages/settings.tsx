import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage, SUPPORTED_LANGUAGES, type Language } from '@/lib/language';
import { Check, Globe, Sparkles, Bell, BellOff, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getPrefs,
  setPrefs as savePrefs,
  isSupported as notifSupported,
  permissionStatus,
  requestPermission,
  showNotification,
  type NotificationPrefs,
} from '@/lib/notifications';
import { Button } from '@/components/ui/button';

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [prefs, setPrefsState] = useState<NotificationPrefs>(() => getPrefs());
  const [perm, setPerm] = useState<NotificationPermission>(() =>
    notifSupported() ? permissionStatus() : 'denied',
  );

  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  async function toggleNotifications() {
    if (!notifSupported()) {
      toast({
        title: t('Not supported', 'समर्थित नहीं'),
        description: t(
          'Your browser does not support notifications. Try installing this app to your home screen.',
          'आपका ब्राउज़र सूचनाएँ समर्थन नहीं करता। ऐप को होम स्क्रीन पर इंस्टॉल करें।',
        ),
        variant: 'destructive',
      });
      return;
    }
    if (prefs.enabled) {
      setPrefsState({ ...prefs, enabled: false });
      toast({
        title: t('Notifications off', 'सूचनाएँ बंद'),
        description: t('You will no longer receive daily reminders.', 'अब आपको दैनिक रिमाइंडर नहीं मिलेंगे।'),
      });
      return;
    }
    const p = await requestPermission();
    setPerm(p);
    if (p === 'granted') {
      setPrefsState({ ...prefs, enabled: true });
      toast({
        title: t('Notifications enabled', 'सूचनाएँ चालू'),
        description: t(
          `You will receive daily horoscope at ${prefs.dailyHoroscopeTime}.`,
          `अब आपको ${prefs.dailyHoroscopeTime} पर दैनिक राशिफल मिलेगा।`,
        ),
      });
    } else {
      toast({
        title: t('Permission denied', 'अनुमति अस्वीकृत'),
        description: t(
          'Please allow notifications in your browser settings.',
          'कृपया ब्राउज़र सेटिंग्स से सूचनाओं की अनुमति दें।',
        ),
        variant: 'destructive',
      });
    }
  }

  async function sendTestNotification() {
    if (perm !== 'granted') {
      const p = await requestPermission();
      setPerm(p);
      if (p !== 'granted') return;
    }
    const ok = await showNotification(
      t('🪷 Future Jaano', '🪷 फ्यूचर जानो'),
      t(
        'Your daily reminder is working! You\'ll receive notifications like this each morning.',
        'आपका दैनिक रिमाइंडर काम कर रहा है! हर सुबह इसी तरह सूचना मिलेगी।',
      ),
      '/horoscope',
    );
    toast({
      title: ok
        ? t('Test sent!', 'टेस्ट भेजा गया!')
        : t('Could not send', 'भेजा नहीं जा सका'),
      description: ok
        ? t('Check your notification tray.', 'अपना नोटिफिकेशन ट्रे देखें।')
        : t('Please grant permission first.', 'पहले अनुमति दें।'),
    });
  }

  function handlePick(code: Language) {
    if (code === language) return;
    setLanguage(code);
    const name = SUPPORTED_LANGUAGES.find(l => l.code === code);
    toast({
      title: t('Language updated', 'भाषा बदल गई'),
      description: t(
        `AI answers will now be in ${name?.nameEn ?? 'English'}.`,
        `अब AI उत्तर ${name?.nameNative ?? name?.nameEn ?? 'English'} में मिलेंगे।`,
      ),
    });
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary drop-shadow-md mb-2 flex items-center justify-center gap-2">
          <Globe className="w-7 h-7" />
          {t('Settings', 'सेटिंग्स')}
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          {t(
            'Choose your language. AI answers will be delivered in the language you pick.',
            'अपनी भाषा चुनें। AI उत्तर आपकी चुनी हुई भाषा में मिलेंगे।',
          )}
        </p>

        <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 mt-1 shrink-0" />
            <div>
              <h2 className="font-serif text-xl font-bold text-primary">
                {t('App & AI Language', 'ऐप और AI भाषा')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t(
                  'Pick from 13 Indian languages. Kundli, remedies, numerology, yoga, palm/face/Vastu analysis — sab kuchh aapki bhasha mein.',
                  '13 भारतीय भाषाओं में से चुनें। कुण्डली, उपाय, अंक ज्योतिष, योग, हस्तरेखा/मुख/वास्तु विश्लेषण — सब कुछ आपकी भाषा में।',
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUPPORTED_LANGUAGES.map(opt => {
              const active = opt.code === language;
              return (
                <button
                  key={opt.code}
                  onClick={() => handlePick(opt.code)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition text-left ${
                    active
                      ? 'bg-primary/15 border-primary shadow-md'
                      : 'bg-background/40 border-border/50 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <div>
                    <div className={`font-bold text-lg ${active ? 'text-primary' : 'text-foreground'}`}>
                      {opt.nameNative}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {opt.nameEn}
                    </div>
                  </div>
                  {active && (
                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-muted-foreground border-t border-border/50 pt-4">
            <p>
              <strong className="text-foreground/80">{t('Note:', 'नोट:')}</strong>{' '}
              {t(
                'App menus stay in English/Hindi for now, but all astrology readings, remedies and analyses are generated in your chosen language.',
                'ऐप के मेन्यू अभी अंग्रेज़ी/हिन्दी में रहेंगे, लेकिन सभी ज्योतिष पठन, उपाय और विश्लेषण आपकी चुनी हुई भाषा में बनेंगे।',
              )}
            </p>
          </div>
        </div>

        <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-6 md:p-8 space-y-6 mt-8">
          <div className="flex items-start gap-3">
            {prefs.enabled && perm === 'granted' ? (
              <Bell className="w-5 h-5 text-emerald-400 mt-1 shrink-0" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground mt-1 shrink-0" />
            )}
            <div className="flex-1">
              <h2 className="font-serif text-xl font-bold text-primary">
                {t('Daily Notifications', 'दैनिक सूचनाएँ')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t(
                  'Get a daily horoscope reminder, festival alerts and Rahu Kaal warnings right on your device.',
                  'अपने डिवाइस पर दैनिक राशिफल, त्यौहार अलर्ट और राहु काल चेतावनी पाएं।',
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-background/40 rounded-xl p-4">
            <div>
              <p className="font-semibold text-foreground">
                {t('Enable notifications', 'सूचनाएँ चालू करें')}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {perm === 'denied'
                  ? t('Blocked — change in browser settings', 'अवरुद्ध — ब्राउज़र सेटिंग्स बदलें')
                  : prefs.enabled
                    ? t('Active — you\'ll get daily reminders', 'सक्रिय — दैनिक रिमाइंडर मिलेंगे')
                    : t('Off — tap to turn on', 'बंद — चालू करने के लिए दबाएं')}
              </p>
            </div>
            <button
              onClick={toggleNotifications}
              className={`relative w-14 h-8 rounded-full transition-colors disabled:opacity-50 ${
                prefs.enabled && perm === 'granted' ? 'bg-emerald-500' : 'bg-muted'
              }`}
              aria-label="Toggle notifications"
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${
                  prefs.enabled && perm === 'granted' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="bg-background/40 rounded-xl p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="w-4 h-4 text-primary" />
              {t('Daily horoscope time', 'दैनिक राशिफल का समय')}
            </label>
            <input
              type="time"
              value={prefs.dailyHoroscopeTime}
              onChange={e => setPrefsState({ ...prefs, dailyHoroscopeTime: e.target.value })}
              className="bg-background/60 border border-border/40 rounded-lg px-3 py-2 text-foreground w-full max-w-[180px]"
            />
            <p className="text-xs text-muted-foreground">
              {t(
                'Best to set early morning (Brahma Muhurta — 4:30 to 6:00 AM is ideal).',
                'सुबह जल्दी (ब्रह्म मुहूर्त — सुबह 4:30 से 6:00 के बीच) श्रेष्ठ है।',
              )}
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between bg-background/40 rounded-xl p-3 cursor-pointer">
              <span className="text-sm text-foreground">
                {t('Festival & Vrat alerts', 'त्यौहार और व्रत अलर्ट')}
              </span>
              <input
                type="checkbox"
                checked={prefs.panchangAlert}
                onChange={e => setPrefsState({ ...prefs, panchangAlert: e.target.checked })}
                className="w-5 h-5 accent-primary"
              />
            </label>
            <label className="flex items-center justify-between bg-background/40 rounded-xl p-3 cursor-pointer">
              <span className="text-sm text-foreground">
                {t('Rahu Kaal warnings', 'राहु काल चेतावनी')}
              </span>
              <input
                type="checkbox"
                checked={prefs.rahuKaalAlert}
                onChange={e => setPrefsState({ ...prefs, rahuKaalAlert: e.target.checked })}
                className="w-5 h-5 accent-primary"
              />
            </label>
          </div>

          <Button onClick={sendTestNotification} variant="outline" className="w-full rounded-xl">
            <Bell className="w-4 h-4 mr-2" />
            {t('Send test notification', 'टेस्ट सूचना भेजें')}
          </Button>

          <p className="text-xs text-muted-foreground italic border-t border-border/50 pt-3">
            {t(
              'For best results, install Future Jaano to your home screen (PWA). On iOS, notifications require iOS 16.4+ and the app installed to home screen.',
              'सर्वोत्तम परिणाम के लिए Future Jaano को होम स्क्रीन पर इंस्टॉल करें (PWA)। iOS पर सूचनाओं के लिए iOS 16.4+ और होम स्क्रीन पर इंस्टॉल आवश्यक है।',
            )}
          </p>
        </div>
      </div>
    </Layout>
  );
}
