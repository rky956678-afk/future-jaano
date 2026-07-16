/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Clerk shim — single import point for all Clerk APIs used in the app.
 *
 * When VITE_CLERK_PUBLISHABLE_KEY is set, this re-exports the real Clerk
 * components/hooks. When it is NOT set (local development without Clerk),
 * it provides mock implementations that behave as a signed-in "Demo User",
 * matching the API server's dev-auth fallback. This means the entire app —
 * every page and feature — works out of the box with zero external setup.
 */
import * as Clerk from "@clerk/react";

export const clerkEnabled = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
// When Clerk is not configured, the mocks below sign the user in as Demo User
// (matches the API server's DEV_AUTH mode).

// ─── Mock implementations (dev without Clerk) ────────────────────────────────

const demoUser: any = {
  id: "dev_demo_user",
  firstName: "Demo",
  lastName: "User",
  fullName: "Demo User",
  username: "demo",
  imageUrl: "",
  primaryEmailAddress: { emailAddress: "demo@futurejaano.local" },
  emailAddresses: [{ emailAddress: "demo@futurejaano.local" }],
  publicMetadata: {},
  unsafeMetadata: {},
  update: async () => demoUser,
};

function MockClerkProvider({ children }: { children?: React.ReactNode } & Record<string, any>) {
  return <>{children}</>;
}

const mockUseUser = () =>
  ({ isSignedIn: true, isLoaded: true, user: demoUser }) as any;

const mockUseAuth = () =>
  ({
    isSignedIn: true,
    isLoaded: true,
    userId: "dev_demo_user",
    sessionId: "dev_session",
    getToken: async () => null,
    signOut: async () => {},
  }) as any;

const mockUseClerk = () =>
  ({
    addListener: (_cb: any) => () => {},
    signOut: async () => {},
    openSignIn: () => {},
    openSignUp: () => {},
    user: demoUser,
  }) as any;

function MockUserButton(_props: Record<string, any>) {
  return (
    <div
      title="Demo User (dev mode — Clerk not configured)"
      className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary select-none"
    >
      DU
    </div>
  );
}

function MockAuthPage(_props: Record<string, any>) {
  return (
    <div className="max-w-md mx-auto mt-16 p-6 rounded-2xl border border-primary/25 bg-white/5 text-center space-y-3">
      <h2 className="text-xl font-bold">Dev mode — auth disabled</h2>
      <p className="text-sm opacity-70">
        VITE_CLERK_PUBLISHABLE_KEY is not set, so you are automatically signed
        in as <strong>Demo User</strong>. Add your Clerk keys to enable real
        sign-in/sign-up.
      </p>
      <a href="/" className="inline-block mt-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold">
        Go to Home
      </a>
    </div>
  );
}

// ─── Exports (real or mock) ───────────────────────────────────────────────────

export const ClerkProvider: typeof Clerk.ClerkProvider = clerkEnabled
  ? Clerk.ClerkProvider
  : (MockClerkProvider as any);

export const useUser: typeof Clerk.useUser = clerkEnabled
  ? Clerk.useUser
  : (mockUseUser as any);

export const useAuth: typeof Clerk.useAuth = clerkEnabled
  ? Clerk.useAuth
  : (mockUseAuth as any);

export const useClerk: typeof Clerk.useClerk = clerkEnabled
  ? Clerk.useClerk
  : (mockUseClerk as any);

export const UserButton: typeof Clerk.UserButton = clerkEnabled
  ? Clerk.UserButton
  : (MockUserButton as any);

export const SignIn: typeof Clerk.SignIn = clerkEnabled
  ? Clerk.SignIn
  : (MockAuthPage as any);

export const SignUp: typeof Clerk.SignUp = clerkEnabled
  ? Clerk.SignUp
  : (MockAuthPage as any);
