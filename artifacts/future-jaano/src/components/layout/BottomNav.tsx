import React from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/lib/language';
import { Home, Compass, Sun, Sparkles } from 'lucide-react';

export function BottomNav() {
  const { t } = useLanguage();
  const [location] = useLocation();

  const navItems = [
    { href: '/', icon: Home, labelEn: 'Home', labelHi: 'होम' },
    { href: '/horoscope', icon: Compass, labelEn: 'Horoscope', labelHi: 'राशिफल' },
    { href: '/panchang', icon: Sun, labelEn: 'Panchang', labelHi: 'पंचांग' },
    { href: '/mantras', icon: ({ className }: { className?: string }) => <span className={`leading-none ${className ?? ''}`} aria-hidden>🕉️</span>, labelEn: 'Mantras', labelHi: 'मंत्र' },
    { href: '/problem-solver', icon: Sparkles, labelEn: 'Remedies', labelHi: 'उपाय' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center w-full h-full space-y-1">
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {t(item.labelEn, item.labelHi)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
