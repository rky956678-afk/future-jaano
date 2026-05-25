// Web Push client — registers the service worker subscription with the
// server so the server cron can deliver notifications even when the app is
// closed (the holy grail for our morning push reliability).

const VAPID_PUBLIC_KEY_ENV = import.meta.env.VITE_VAPID_PUBLIC_KEY as
  | string
  | undefined;

// Cached after first fetch from server
let serverVapidKey: string | null = null;

async function getVapidPublicKey(): Promise<string | null> {
  if (serverVapidKey) return serverVapidKey;
  try {
    const res = await fetch(`${apiBase()}/api/push/vapid-public-key`, {
      credentials: "include",
    });
    if (res.ok) {
      const data = (await res.json()) as { publicKey?: string };
      if (data.publicKey) {
        serverVapidKey = data.publicKey;
        return serverVapidKey;
      }
    }
  } catch {
    /* fall through to env */
  }
  // Dev fallback only — production should always have the server endpoint
  if (VAPID_PUBLIC_KEY_ENV) return VAPID_PUBLIC_KEY_ENV;
  return null;
}

function urlBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const buffer = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buffer;
}

function apiBase(): string {
  // Same-origin in production; the API server is mounted at /api via the
  // shared proxy in dev too.
  const base = import.meta.env.BASE_URL || "/";
  // Strip trailing slash since we add /api/...
  return base.replace(/\/$/, "");
}

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  // Wait for the active SW (vite-plugin-pwa auto-registers).
  const reg = await navigator.serviceWorker.ready;
  return reg;
}

/**
 * Subscribe this device to push and register with the server.
 * Returns true on success.
 */
export async function subscribeToPush(opts: {
  getToken: () => Promise<string | null>;
  hour: number;
  minute: number;
  language: string;
}): Promise<boolean> {
  if (!pushSupported()) return false;
  const vapidKey = await getVapidPublicKey();
  if (!vapidKey) {
    console.warn("[push] VAPID public key unavailable — skipping subscribe");
    return false;
  }

  const reg = await getRegistration();
  if (!reg) return false;

  try {
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToArrayBuffer(vapidKey),
      });
    }

    const json = sub.toJSON() as {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
    };
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return false;

    const token = await opts.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${apiBase()}/api/push/subscribe`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        hour: opts.hour,
        minute: opts.minute,
        language: opts.language,
        userAgent: navigator.userAgent,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn("[push] subscribe failed", err);
    return false;
  }
}

export async function unsubscribeFromPush(
  getToken: () => Promise<string | null>,
): Promise<boolean> {
  if (!pushSupported()) return false;
  const reg = await getRegistration();
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return true;

  const endpoint = sub.endpoint;
  try {
    await sub.unsubscribe();
  } catch {
    /* ignore */
  }
  try {
    const token = await getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    await fetch(`${apiBase()}/api/push/unsubscribe`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ endpoint }),
    });
  } catch {
    /* ignore */
  }
  return true;
}

export async function updatePushPreferences(
  getToken: () => Promise<string | null>,
  patch: { hour?: number; minute?: number; language?: string; enabled?: boolean },
): Promise<boolean> {
  if (!pushSupported()) return false;
  const reg = await getRegistration();
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return false;

  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${apiBase()}/api/push/preferences`, {
      method: "PATCH",
      headers,
      credentials: "include",
      body: JSON.stringify({ endpoint: sub.endpoint, ...patch }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
