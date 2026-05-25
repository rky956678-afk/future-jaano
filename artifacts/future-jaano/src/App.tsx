import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect, useRef, lazy, Suspense } from "react";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, useLanguage } from "@/lib/language";
import { Loader2 } from "lucide-react";
import { startDailyScheduler, stopDailyScheduler } from "@/lib/notifications";
import { getCachedHoroscope, greetingFor } from "@/lib/userProfile";
import { getTodayTip, getTipForLang } from "@/lib/dailyTips";
import { UserSignSync } from "@/components/UserSignSync";

import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

const Share = lazy(() => import("@/pages/share"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const AdminDashboard = lazy(() => import("@/pages/admin"));
const Horoscope = lazy(() => import("@/pages/horoscope"));
const Kundli = lazy(() => import("@/pages/kundli"));
const ProblemSolver = lazy(() => import("@/pages/problem-solver"));
const Vastu = lazy(() => import("@/pages/vastu"));
const PalmReading = lazy(() => import("@/pages/palm-reading"));
const FaceReading = lazy(() => import("@/pages/face-reading"));
const Numerology = lazy(() => import("@/pages/numerology"));
const Yoga = lazy(() => import("@/pages/yoga"));
const Premium = lazy(() => import("@/pages/premium"));
const Blog = lazy(() => import("@/pages/blog"));
const BlogPost = lazy(() => import("@/pages/blog-post"));
const Contact = lazy(() => import("@/pages/contact"));
const Panchang = lazy(() => import("@/pages/panchang"));
const Gochar = lazy(() => import("@/pages/gochar"));
const KundliMilan = lazy(() => import("@/pages/kundli-milan"));
const Dasha = lazy(() => import("@/pages/dasha"));
const Muhurat = lazy(() => import("@/pages/muhurat"));
const Ashtakavarga = lazy(() => import("@/pages/ashtakavarga"));
const Calendar = lazy(() => import("@/pages/calendar"));
const Settings = lazy(() => import("@/pages/settings"));
const Mantras = lazy(() => import("@/pages/mantras"));
const SadhanaPage = lazy(() => import("@/pages/sadhana"));
const Raksha = lazy(() => import("@/pages/raksha"));
const History = lazy(() => import("@/pages/history"));

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL as string | undefined;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "hsl(38, 90%, 55%)",
    colorBackground: "hsl(230, 50%, 20%)",
    colorText: "hsl(0, 0%, 98%)",
    colorTextSecondary: "hsl(0, 0%, 82%)",
    colorNeutral: "hsl(0, 0%, 95%)",
    colorInputBackground: "hsl(231, 45%, 28%)",
    colorInputText: "hsl(0, 0%, 98%)",
    colorShimmer: "hsl(38, 90%, 55%)",
    borderRadius: "0.75rem",
    fontFamily: "inherit",
    fontSize: "0.95rem",
  },
};

const clerkLocalization = {
  signIn: {
    start: {
      title: "Sign in to Future Jaano",
      subtitle: "Ancient wisdom meets modern life",
    },
  },
  signUp: {
    start: {
      title: "Join Future Jaano",
      subtitle: "Begin your spiritual journey",
    },
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 bg-background">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 bg-background">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      localization={clerkLocalization}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <LanguageProvider>
            <NotificationScheduler />
            <UserSignSync />
            <Suspense fallback={<PageFallback />}>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/horoscope" component={Horoscope} />
                <Route path="/kundli" component={Kundli} />
                <Route path="/problem-solver" component={ProblemSolver} />
                <Route path="/vastu" component={Vastu} />
                <Route path="/palm-reading" component={PalmReading} />
                <Route path="/face-reading" component={FaceReading} />
                <Route path="/numerology" component={Numerology} />
                <Route path="/yoga" component={Yoga} />
                <Route path="/premium" component={Premium} />
                <Route path="/blog" component={Blog} />
                <Route path="/blog/:slug" component={BlogPost} />
                <Route path="/contact" component={Contact} />
                <Route path="/panchang" component={Panchang} />
                <Route path="/gochar" component={Gochar} />
                <Route path="/kundli-milan" component={KundliMilan} />
                <Route path="/dasha" component={Dasha} />
                <Route path="/muhurat" component={Muhurat} />
                <Route path="/ashtakavarga" component={Ashtakavarga} />
                <Route path="/calendar" component={Calendar} />
                <Route path="/settings" component={Settings} />
                <Route path="/mantras" component={Mantras} />
                <Route path="/sadhana" component={SadhanaPage} />
                <Route path="/raksha" component={Raksha} />
                <Route path="/history" component={History} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/admin" component={AdminDashboard} />
                <Route path="/share" component={Share} />
                <Route path="/sign-in/*?" component={SignInPage} />
                <Route path="/sign-up/*?" component={SignUpPage} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
            <Toaster />
            <PWAInstallPrompt />
          </LanguageProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function NotificationScheduler() {
  const { t, language } = useLanguage();
  useEffect(() => {
    startDailyScheduler(() => {
      const greet = greetingFor(language);
      const fallbackTitle = t(
        `🪷 ${greet} — Your Daily Horoscope`,
        `🪷 ${greet} — आपका दैनिक राशिफल`,
      );
      const fallbackBody = t(
        "Tap to read today's reading, Panchang and auspicious timings.",
        'आज का राशिफल, पंचांग और शुभ मुहूर्त देखने के लिए दबाएं।',
      );

      // Today's life tip — practical wisdom that helps save money or
      // attract prosperity. Always appended so users get value daily.
      const tip = getTipForLang(getTodayTip(), language);

      // Use the prediction already prefetched by GoodMorningBanner. Avoid any
      // network I/O inside the scheduler callback so we never block the UI.
      const cached = getCachedHoroscope();
      if (cached && cached.lang === language) {
        const title = language === 'hi'
          ? `🪷 ${greet} — ${cached.signLabel} राशि`
          : `🪷 ${greet} — ${cached.signLabel}`;
        const body = `${cached.prediction || fallbackBody}\n\n${tip.title}\n${tip.message}`;
        return { title, body };
      }
      return { title: fallbackTitle, body: `${fallbackBody}\n\n${tip.title}\n${tip.message}` };
    });
    return () => stopDailyScheduler();
  }, [t, language]);
  return null;
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
