"use client";

/**
 * Push-varsel-logikk for PlayerHQ / AgencyOS (klient).
 *
 * v2-port 17. juli 2026: den gamle <PushToggle/>-presentasjonen er erstattet av
 * InnstillingerVarslerV2 (v2-designsystemet). Denne filen beholder KUN
 * browser-logikken — uendret — og eksporterer den slik at presentasjonslaget
 * kan bo i v2-komponenten.
 *
 * Flyt når brukeren skrur PÅ:
 *  1. Request permission via Notification.requestPermission()
 *  2. Register /sw.js (Serwist-generert service worker)
 *  3. pushManager.subscribe() med VAPID_PUBLIC_KEY
 *  4. POST /api/push/subscribe med endpoint + keys
 *
 * Flyt når brukeren skrur AV:
 *  1. pushManager.getSubscription() → unsubscribe()
 *  2. POST /api/push/unsubscribe med endpoint
 *
 * Krever HTTPS (eller localhost) og en moderne browser med Push API.
 */
import { VAPID_PUBLIC_KEY } from "@/lib/push/vapid";

export type PushStatus = "loading" | "unsupported" | "blocked" | "off" | "on";

export async function detectPushStatus(): Promise<PushStatus> {
  if (typeof window === "undefined") return "loading";
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return "unsupported";
  }
  if (typeof Notification === "undefined") return "unsupported";
  if (Notification.permission === "denied") return "blocked";

  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return "off";
    const sub = await reg.pushManager.getSubscription();
    return sub ? "on" : "off";
  } catch {
    return "off";
  }
}

export async function aktiverPush(): Promise<PushStatus> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return permission === "denied" ? "blocked" : "off";
  }

  const reg =
    (await navigator.serviceWorker.getRegistration()) ??
    (await navigator.serviceWorker.register("/sw.js"));
  await navigator.serviceWorker.ready;

  const eksisterende = await reg.pushManager.getSubscription();
  // applicationServerKey aksepterer BufferSource. ArrayBuffer-castet er
  // nødvendig pga. lib.dom.d.ts som ikke godtar generisk ArrayBufferLike.
  const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    .buffer as ArrayBuffer;
  const sub =
    eksisterende ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    }));

  const json = sub.toJSON();
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: json.keys,
    }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Kunne ikke lagre subscription");
  }
  return "on";
}

export async function deaktiverPush(): Promise<PushStatus> {
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return "off";

  const endpoint = sub.endpoint;
  await sub.unsubscribe().catch(() => undefined);

  await fetch("/api/push/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint }),
  }).catch(() => undefined);

  return "off";
}

// VAPID-public key kommer som base64url-streng. Push API krever Uint8Array.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}
