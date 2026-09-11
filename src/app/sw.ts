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
import type { PrecacheEntry, SerwistGlobalConfig, RuntimeCaching } from "serwist";
import { Serwist, NetworkOnly } from "serwist";
import { erPrivatFlate } from "../lib/pwa/privat-flate";

type SwScope = {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  addEventListener(type: string, handler: (event: Event) => void): void;
  registration: { showNotification(title: string, options: object): Promise<void> };
  clients: {
    matchAll(opts: {
      type?: string;
      includeUncontrolled?: boolean;
    }): Promise<Array<{ url: string; focus(): Promise<unknown> }>>;
    openWindow(url: string): Promise<unknown>;
  };
} & SerwistGlobalConfig;

declare const self: SwScope;

/**
 * Personvern (GDPR): autentiserte flater skal ALDRI havne i Cache Storage.
 * NetworkOnly først (Serwist bruker første treff).
 */
const authNetworkOnly: RuntimeCaching = {
  matcher: ({ url, sameOrigin }) => sameOrigin && erPrivatFlate(url.pathname),
  handler: new NetworkOnly(),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [authNetworkOnly, ...defaultCache],
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

type MessageEv = Event & {
  data?: { type?: string };
  waitUntil?(p: Promise<unknown>): void;
};
type CacheStorageLike = {
  keys(): Promise<string[]>;
  delete(key: string): Promise<boolean>;
};
self.addEventListener("message", (event) => {
  const msg = event as MessageEv;
  if (msg.data?.type !== "CLEAR_CACHES") return;
  const caches = (self as unknown as { caches?: CacheStorageLike }).caches;
  if (!caches) return;
  const job = caches
    .keys()
    .then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  msg.waitUntil?.(job);
});

type PushEv = Event & {
  data: { json(): unknown } | null;
  waitUntil(p: Promise<unknown>): void;
};
type NotificationEv = Event & {
  notification: { close(): void; data: unknown };
  waitUntil(p: Promise<unknown>): void;
};

self.addEventListener("push", (event) => {
  const pushEvent = event as PushEv;
  if (!pushEvent.data) return;
  try {
    const data = pushEvent.data.json() as {
      title?: string;
      body?: string;
      url?: string;
      link?: string;
      icon?: string;
      tag?: string;
      requireInteraction?: boolean;
    };
    const title = data.title ?? "AK Golf";
    const targetUrl = data.link ?? data.url ?? "/portal";
    pushEvent.waitUntil(
      self.registration.showNotification(title, {
        body: data.body ?? "",
        icon: data.icon ?? "/icon-192.png",
        badge: "/icon-192.png",
        tag: data.tag,
        requireInteraction: data.requireInteraction ?? false,
        data: { url: targetUrl },
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
  notifEvent.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes(url));
        if (existing) return existing.focus();
        return self.clients.openWindow(url);
      }),
  );
});
