import { Link } from 'wouter';
import { useLanguage } from '@/lib/language';
import { ShieldCheck, Mail, MapPin, Heart, Sparkles } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  const jyotishLinks = [
    { href: '/horoscope', en: 'Daily Horoscope', hi: 'दैनिक राशिफल' },
    { href: '/kundli', en: 'Free Kundli', hi: 'मुफ्त कुण्डली' },
    { href: '/kundli-milan', en: 'Kundli Milan', hi: 'कुण्डली मिलान' },
    { href: '/panchang', en: 'Panchang', hi: 'पंचांग' },
    { href: '/muhurat', en: 'Shubh Muhurat', hi: 'शुभ मुहूर्त' },
    { href: '/calendar', en: 'Festival Calendar', hi: 'त्यौहार कैलेंडर' },
  ];

  const upaayLinks = [
    { href: '/problem-solver', en: 'Ask Remedy', hi: 'उपाय पूछें' },
    { href: '/vastu', en: 'Vastu Analysis', hi: 'वास्तु विश्लेषण' },
    { href: '/palm-reading', en: 'Palm Reading', hi: 'हस्त रेखा' },
    { href: '/face-reading', en: 'Face Reading', hi: 'मुखाकृति' },
    { href: '/numerology', en: 'Numerology', hi: 'अंक ज्योतिष' },
    { href: '/raksha', en: 'Stree Raksha', hi: 'स्त्री रक्षा' },
  ];

  const sadhanaLinks = [
    { href: '/mantras', en: 'Mantra Library', hi: 'मंत्र संग्रह' },
    { href: '/sadhana', en: 'Sadhana Vidhi', hi: 'साधना विधि' },
    { href: '/yoga', en: 'Yoga & Pranayam', hi: 'योग और प्राणायाम' },
    { href: '/dasha', en: 'Vimshottari Dasha', hi: 'विंशोत्तरी दशा' },
    { href: '/gochar', en: 'Gochar (Transit)', hi: 'गोचर' },
    { href: '/ashtakavarga', en: 'Ashtakavarga', hi: 'अष्टकवर्ग' },
  ];

  const companyLinks = [
    { href: '/premium', en: 'Premium', hi: 'प्रीमियम' },
    { href: '/blog', en: 'Blog', hi: 'ब्लॉग' },
    { href: '/history', en: 'My History', hi: 'मेरा इतिहास' },
    { href: '/settings', en: 'Settings', hi: 'सेटिंग्स' },
    { href: '/contact', en: 'Contact', hi: 'संपर्क' },
  ];

  return (
    <footer className="relative border-t border-primary/15 bg-[hsl(230,55%,7%)] mt-12">
      {/* Top accent gradient */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Brand row */}
        <div className="flex flex-col md:flex-row items-start gap-8 mb-10 pb-8 border-b border-white/8">
          <div className="flex-1 max-w-md">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <span className="font-serif text-2xl font-bold text-primary tracking-tight">
                {t('Future Jaano', 'भविष्य जानो')}
              </span>
              <Sparkles className="w-5 h-5 text-primary/70" />
            </Link>
            <p className="text-sm text-white/55 leading-relaxed">
              {t(
                'India\'s most trusted AI-powered Vedic guidance platform. Get personalized Kundli, Vastu, remedies and daily insights rooted in Lal Kitab, Atharvaveda and Yog Pradeepam.',
                'भारत का सबसे विश्वसनीय AI-संचालित वैदिक मार्गदर्शन मंच। लाल किताब, अथर्ववेद और योग प्रदीपम पर आधारित व्यक्तिगत कुण्डली, वास्तु, उपाय और दैनिक मार्गदर्शन प्राप्त करें।'
              )}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1.5 bg-primary/8 border border-primary/20 rounded-full px-3 py-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-white/75">{t('50,000+ Users', '50,000+ उपयोगकर्ता')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-primary/8 border border-primary/20 rounded-full px-3 py-1">
                <Heart className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-white/75">{t('Made in India', 'भारत में निर्मित')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-6 text-xs text-white/55">
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 mt-0.5 text-primary/70 shrink-0" />
              <div>
                <p className="font-semibold text-white/75 mb-0.5">{t('Email', 'ईमेल')}</p>
                <a href="mailto:support@futurejaano.com" className="hover:text-primary transition-colors">support@futurejaano.com</a>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-primary/70 shrink-0" />
              <div>
                <p className="font-semibold text-white/75 mb-0.5">{t('Based In', 'स्थान')}</p>
                <p>{t('Bharat', 'भारत')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <FooterColumn title={t('Jyotish', 'ज्योतिष')} links={jyotishLinks} />
          <FooterColumn title={t('Upaay', 'उपाय')} links={upaayLinks} />
          <FooterColumn title={t('Sadhana', 'साधना')} links={sadhanaLinks} />
          <FooterColumn title={t('Company', 'कंपनी')} links={companyLinks} />
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/8 text-xs text-white/45">
          <p>
            © {year} {t('Future Jaano. All rights reserved.', 'Future Jaano। सर्वाधिकार सुरक्षित।')}
          </p>
          <p className="flex items-center gap-1.5">
            <span>{t('Crafted with', 'बनाया गया')}</span>
            <Heart className="w-3 h-3 fill-primary text-primary" />
            <span>{t('for spiritual seekers', 'आध्यात्मिक साधकों के लिए')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; en: string; hi: string }[] }) {
  const { t } = useLanguage();
  return (
    <div>
      <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-white/55 hover:text-primary transition-colors">
              {t(l.en, l.hi)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
