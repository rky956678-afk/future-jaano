import React from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/lib/language';
import { useUser, UserButton } from '@/lib/clerk';
import { Menu, Bell, ChevronDown, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { isSignedIn } = useUser();
  const [location, setLocation] = useLocation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const navLinks = [
    { href: '/horoscope', labelEn: 'Horoscope', labelHi: 'राशिफल' },
    { href: '/kundli', labelEn: 'Kundli', labelHi: 'कुण्डली' },
    { href: '/problem-solver', labelEn: 'Remedies', labelHi: 'उपाय' },
    { href: '/premium', labelEn: 'Premium', labelHi: 'प्रीमियम' },
  ];

  const jyotishLinks = [
    { href: '/panchang', labelEn: 'Panchang', labelHi: 'पंचांग' },
    { href: '/gochar', labelEn: 'Gochar (Transit)', labelHi: 'गोचर' },
    { href: '/kundli-milan', labelEn: 'Kundli Milan', labelHi: 'कुण्डली मिलान' },
    { href: '/dasha', labelEn: 'Vimshottari Dasha', labelHi: 'विंशोत्तरी दशा' },
    { href: '/muhurat', labelEn: 'Muhurat', labelHi: 'मुहूर्त' },
    { href: '/ashtakavarga', labelEn: 'Ashtakavarga', labelHi: 'अष्टकवर्ग' },
    { href: '/vastu', labelEn: 'Vastu Dosh & Upaay', labelHi: 'वास्तु दोष और उपाय' },
    { href: '/mantras', labelEn: 'Mantra Library', labelHi: 'मंत्र संग्रह' },
    { href: '/sadhana', labelEn: 'Sadhana Vidhi', labelHi: 'साधना विधि' },
    { href: '/raksha', labelEn: 'Stree Raksha (Bhoot-Pret Upaay)', labelHi: 'स्त्री रक्षा (भूत-प्रेत उपाय)' },
    { href: '/calendar', labelEn: 'Festival Calendar', labelHi: 'त्यौहार कैलेंडर' },
    { href: '/settings', labelEn: 'Settings & Notifications', labelHi: 'सेटिंग्स और सूचनाएँ' },
  ];

  const isJyotishActive = jyotishLinks.some(l => location === l.href);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 bg-background border-r-border/40 overflow-y-auto">
            <div className="flex flex-col gap-6 mt-6">
              <Link href="/" className="font-serif text-2xl text-primary font-bold">
                Future Jaano
              </Link>
              <div className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className={`text-lg font-medium ${location === link.href ? 'text-primary' : 'text-foreground/70 hover:text-foreground'}`}>
                    {t(link.labelEn, link.labelHi)}
                  </Link>
                ))}
                <div className="pt-2 border-t border-border/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t('Jyotish Software', 'ज्योतिष सॉफ्टवेयर')}</p>
                  {jyotishLinks.map((link) => (
                    <Link key={link.href} href={link.href} className={`block py-1.5 text-base font-medium ${location === link.href ? 'text-primary' : 'text-foreground/70 hover:text-foreground'}`}>
                      {t(link.labelEn, link.labelHi)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-serif text-xl sm:text-2xl font-bold text-primary tracking-tight">
            {t('Future Jaano', 'भविष्य जानो')}
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`transition-colors hover:text-primary ${location === link.href ? 'text-primary' : 'text-foreground/80'}`}
            >
              {t(link.labelEn, link.labelHi)}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-1 transition-colors hover:text-primary ${isJyotishActive ? 'text-primary' : 'text-foreground/80'}`}>
                {t('Jyotish', 'ज्योतिष')} <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 bg-background border-border/50">
              <DropdownMenuLabel className="text-muted-foreground text-xs">{t('Jyotish Software', 'ज्योतिष सॉफ्टवेयर')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {jyotishLinks.map(link => (
                <DropdownMenuItem
                  key={link.href}
                  className={`cursor-pointer ${location === link.href ? 'text-primary' : ''}`}
                  onSelect={() => setLocation(link.href)}
                >
                  {t(link.labelEn, link.labelHi)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button variant="ghost" size="icon" onClick={toggleLanguage} className="h-9 w-9 rounded-full" title={t('Switch to Hindi', 'Switch to English')}>
            <span className="font-bold">{language === 'en' ? 'हिं' : 'EN'}</span>
            <span className="sr-only">Toggle language</span>
          </Button>

          {isSignedIn ? (
            <>
              <Link href="/history" className="hidden sm:inline-flex">
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full" title={t('My Readings', 'मेरी रीडिंग')}>
                  <ScrollText className="h-5 w-5 text-foreground/80" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full" title={t('Dashboard', 'डैशबोर्ड')}>
                  <Bell className="h-5 w-5 text-foreground/80" />
                </Button>
              </Link>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 ring-2 ring-primary/20 hover:ring-primary/50 transition-all"
                  }
                }}
              />
            </>
          ) : (
            <Link href="/sign-in">
              <Button variant="default" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 font-semibold">
                {t('Sign In', 'साइन इन')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
