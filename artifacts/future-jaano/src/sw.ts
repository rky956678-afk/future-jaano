/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

self.skipWaiting();
clientsClaim();

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// ----- Web Push handler -----
// Server sends a JSON payload via web-push. We render it as a notification
// even when the app is closed.
interface PushPayload {
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
}

self.addEventListener("push", (event: PushEvent) => {
  let data: PushPayload = {};
  try {
    if (event.data) data = event.data.json() as PushPayload;
  } catch {
    if (event.data) data = { body: event.data.text() };
  }

  const title = data.title || "🪷 Future Jaano";
  const options: NotificationOptions = {
    body: data.body || "",
    icon: "/pwa-192.png",
    badge: "/pwa-192.png",
    tag: data.tag || "future-jaano-daily",
    requireInteraction: false,
    data: { url: data.url || "/horoscope" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target =
    (event.notification.data as { url?: string } | undefined)?.url || "/";
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        const url = new URL(client.url);
        if (url.pathname.includes(target) && "focus" in client) {
          return (client as WindowClient).focus();
        }
      }
      return self.clients.openWindow(target);
    })(),
  );
});
