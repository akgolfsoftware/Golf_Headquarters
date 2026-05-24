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

// ServiceWorker-typene ligger i 'webworker'-lib som ikke er aktivert i prosjektets
// tsconfig (vi har 'dom' for app-koden). Bruk minimal type-skisse i stedet.
type SwScope = {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  addEventListener(type: string, handler: (event: Event) => void): void;
  registration: { showNotification(title: string, options: object): Promise<void> };
  clients: {
    matchAll(opts: object): Promise<Array<{ url: string; focus(): Promise<void> }>>;
    openWindow(url: string): Promise<unknown>;
  };
} & SerwistGlobalConfig;

declare const self: SwScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) =>
          (request as Request).destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();

// Minimale typer for SW-spesifikke event-egenskaper (webworker-lib er ikke aktivert)
type PushEv = Event & {
  data: { json(): unknown } | null;
  waitUntil(p: Promise<unknown>): void;
};
type NotificationEv = Event & {
  notification: { close(): void; data: unknown };
  waitUntil(p: Promise<unknown>): void;
};

// Push-event handler — viser system-varsling når server sender push.
self.addEventListener("push", (event) => {
  const pushEvent = event as PushEv;
  if (!pushEvent.data) return;
  try {
    const data = pushEvent.data.json() as {
      title?: string;
      body?: string;
      url?: string;
      icon?: string;
    };
    const title = data.title ?? "AK Golf";
    pushEvent.waitUntil(
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
  const notifEvent = event as NotificationEv;
  notifEvent.notification.close();
  const url =
    (notifEvent.notification.data as { url?: string } | undefined)?.url ?? "/portal";
  notifEvent.waitUntil(self.clients.openWindow(url));
});
