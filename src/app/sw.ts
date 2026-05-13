/**
 * Service worker for AK Golf PWA — bygget med Serwist.
 *
 * Strategi:
 *  - Precache av build-genererte statiske assets (next/static, ikoner, etc.)
 *  - NetworkFirst for navigasjoner og API-kall (med offline-fallback til cache)
 *  - StaleWhileRevalidate for bilder, fonter og statiske data
 *
 * Filen kompileres av @serwist/next og serves som /sw.js i prod.
 */

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

// Push-event handler — viser system-varsling når server sender push.
self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json() as {
      title?: string;
      body?: string;
      url?: string;
      icon?: string;
    };
    const title = data.title ?? "AK Golf";
    event.waitUntil(
      self.registration.showNotification(title, {
        body: data.body ?? "",
        icon: data.icon ?? "/icon-192.png",
        badge: "/icon-192.png",
        data: { url: data.url ?? "/portal" },
      }),
    );
  } catch {
    // Ignorer payload-feil
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url =
    (event.notification.data as { url?: string } | undefined)?.url ?? "/portal";
  event.waitUntil(self.clients.openWindow(url));
});
