/**
 * Web Push — grunnstruktur for klient og server.
 *
 * Klient: `subscribeToPush()` ber browseren om push-tillatelse, oppretter
 * en PushSubscription via service worker og POST-er den til /api/push/subscribe.
 *
 * Server: `sendPushNotification()` sender en notifikasjon via Web Push protocol.
 *
 * STATUS: PARKERT for V2.0 — krever:
 *  - VAPID-keys i env (NEXT_PUBLIC_VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY)
 *  - `web-push`-pakke installert (npm i web-push)
 *  - PushSubscription-modell i Prisma-schema (parkert)
 *  - /api/push/subscribe og /api/push/test route handlers
 *
 * Generer VAPID-keys lokalt:
 *   npx web-push generate-vapid-keys
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  icon?: string;
};

/**
 * Klient-side: ber om tillatelse og lager push-subscription.
 * Returnerer subscription-objekt som kan sendes til server for lagring.
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return null;
  }
  if (!VAPID_PUBLIC_KEY) {
    console.warn(
      "[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY mangler — kan ikke abonnere",
    );
    return null;
  }

  const tillatelse = await Notification.requestPermission();
  if (tillatelse !== "granted") return null;

  const registration = await navigator.serviceWorker.ready;
  const eksisterende = await registration.pushManager.getSubscription();
  if (eksisterende) return eksisterende;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
  });

  return subscription;
}

/**
 * Server-side: sender push til en gitt subscription.
 * Stub — krever `web-push`-pakke + faktisk implementasjon.
 */
export async function sendPushNotification(
  _subscription: PushSubscriptionJSON,
  _payload: PushPayload,
): Promise<{ ok: boolean; error?: string }> {
  // TODO V2.1: implementer med `web-push`-pakke.
  // import webpush from "web-push";
  // webpush.setVapidDetails("mailto:...", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  // await webpush.sendNotification(subscription, JSON.stringify(payload));
  return {
    ok: false,
    error: "push-not-configured: install web-push + sett VAPID-keys i env",
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData =
    typeof window !== "undefined"
      ? window.atob(base64)
      : Buffer.from(base64, "base64").toString("binary");
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
