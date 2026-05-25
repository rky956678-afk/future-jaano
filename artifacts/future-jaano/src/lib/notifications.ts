const STORAGE_KEY = 'fj_notification_prefs';

export interface NotificationPrefs {
  enabled: boolean;
  dailyHoroscopeTime: string;
  panchangAlert: boolean;
  rahuKaalAlert: boolean;
}

export const DEFAULT_PREFS: NotificationPrefs = {
  enabled: false,
  dailyHoroscopeTime: '07:00',
  panchangAlert: true,
  rahuKaalAlert: false,
};

export function getPrefs(): NotificationPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function setPrefs(prefs: NotificationPrefs): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function isSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function permissionStatus(): NotificationPermission {
  if (!isSupported()) return 'denied';
  return Notification.permission;
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!isSupported()) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export async function showNotification(
  title: string,
  body: string,
  url = '/',
): Promise<boolean> {
  if (!isSupported() || Notification.permission !== 'granted') return false;
  const options: NotificationOptions = {
    body,
    icon: '/pwa-192.png',
    badge: '/pwa-192.png',
    tag: 'future-jaano-daily',
    data: { url },
  };
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, options);
        return true;
      }
    }
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

let intervalId: number | null = null;
const LAST_FIRED_KEY = 'fj_notif_last_fired';

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function lastFiredDate(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(LAST_FIRED_KEY);
  } catch {
    return null;
  }
}

function markFired(date: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_FIRED_KEY, date);
  } catch {
    /* noop */
  }
}

export function startDailyScheduler(
  getTitle: () => { title: string; body: string },
): void {
  if (typeof window === 'undefined') return;
  if (intervalId !== null) return;

  const check = async () => {
    const prefs = getPrefs();
    if (!prefs.enabled) return;
    if (permissionStatus() !== 'granted') return;

    const now = new Date();
    const [hh, mm] = prefs.dailyHoroscopeTime.split(':').map(Number);
    const today = localDateKey(now);
    if (lastFiredDate() === today) return;

    if (
      hh !== undefined &&
      mm !== undefined &&
      (now.getHours() > hh || (now.getHours() === hh && now.getMinutes() >= mm))
    ) {
      const { title, body } = getTitle();
      const ok = await showNotification(title, body, '/horoscope');
      if (ok) markFired(today);
    }
  };

  void check();
  intervalId = window.setInterval(check, 60_000);
}

export function stopDailyScheduler(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
