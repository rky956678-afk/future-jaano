import React from 'react';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';

const BASE = import.meta.env.BASE_URL;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main className="flex-1 relative">
        {/* Mandala decorative background overlay */}
        <div className="pointer-events-none fixed inset-0 z-[-1] opacity-[0.04] flex items-center justify-center mix-blend-screen">
          <img
            src={`${BASE}assets/feature-yantra.png`}
            alt=""
            className="w-full max-w-[900px] object-contain animate-spin-slow"
            style={{ animationDuration: '180s' }}
            loading="lazy"
          />
        </div>
        {children}
      </main>
      <div className="pb-16 md:pb-0">
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}
