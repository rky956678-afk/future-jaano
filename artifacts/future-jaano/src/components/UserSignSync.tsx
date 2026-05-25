import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/react';
import { useGetMyProfile, useUpdateMyProfile } from '@workspace/api-client-react';
import { getUserSign, setUserSign, ZODIAC_KEYS, type ZodiacKey } from '@/lib/userProfile';

function isValidSign(v: unknown): v is ZodiacKey {
  return typeof v === 'string' && (ZODIAC_KEYS as readonly string[]).includes(v.toLowerCase());
}

/**
 * Mounted once at the app root. Syncs the user's zodiac sign between the
 * server (`/users/me.zodiacSign`) and the browser's localStorage so that:
 *   - On sign-in, the server-saved rashi populates the banner immediately.
 *   - If the user picked a rashi locally before signing in, it gets pushed
 *     to the server and persists forever across devices.
 */
export function UserSignSync() {
  const { isSignedIn, isLoaded } = useUser();
  const enabled = Boolean(isLoaded && isSignedIn);
  const { data: profile } = useGetMyProfile({ query: { enabled, queryKey: ['users-me-sync'] } });
  const updateProfile = useUpdateMyProfile();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!enabled) { syncedRef.current = false; return; }
    if (!profile || syncedRef.current) return;

    const serverSign = (profile as { zodiacSign?: string | null }).zodiacSign;
    const localSign = getUserSign();

    if (isValidSign(serverSign)) {
      const normalized = serverSign.toLowerCase() as ZodiacKey;
      if (normalized !== localSign) setUserSign(normalized);
      syncedRef.current = true;
    } else if (localSign) {
      // Server has no sign yet — push local choice up so it persists.
      updateProfile.mutate(
        { data: { zodiacSign: localSign } },
        { onSettled: () => { syncedRef.current = true; } },
      );
    } else {
      syncedRef.current = true;
    }
  }, [enabled, profile, updateProfile]);

  return null;
}
