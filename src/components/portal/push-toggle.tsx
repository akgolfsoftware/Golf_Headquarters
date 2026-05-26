"use client";

/**
 * Push-varsler-toggle for PlayerHQ / CoachHQ.
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
import { useEffect, useState, useTransition } from "react";
import { VAPID_PUBLIC_KEY } from "@/lib/push/vapid";

type Status = "loading" | "unsupported" | "blocked" | "off" | "on";

export function PushToggle() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    void detectStatus().then(setStatus);
  }, []);

  function aktiver() {
    setError(null);
    startTransition(async () => {
      try {
        const next = await aktiverPush();
        setStatus(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke aktivere");
        setStatus(await detectStatus());
      }
    });
  }

  function deaktiver() {
    setError(null);
    startTransition(async () => {
      try {
        const next = await deaktiverPush();
        setStatus(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke deaktivere");
      }
    });
  }

  if (status === "loading") {
    return (
      <div className="text-xs text-muted-foreground">
        Sjekker push-status …
      </div>
    );
  }

  if (status === "unsupported") {
    return (
      <div className="rounded-md border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        Push-varsler støttes ikke i denne browseren. Prøv en moderne versjon
        av Safari, Chrome eller Firefox.
      </div>
    );
  }

  if (!VAPID_PUBLIC_KEY) {
    return (
      <div className="rounded-md border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        Push-varsler er midlertidig deaktivert. (VAPID-keys ikke konfigurert.)
      </div>
    );
  }

  if (status === "blocked") {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive-foreground">
        Du har blokkert varsler for dette nettstedet. Tillat varsler i
        browser-innstillinger for å aktivere push.
      </div>
    );
  }

  const isOn = status === "on";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium">Push-varsler på denne enheten</div>
          <p className="text-xs text-muted-foreground">
            Få varsler direkte i browser eller på telefonen — selv når portalen
            er lukket.
          </p>
        </div>
        <button
          type="button"
          onClick={() => (isOn ? deaktiver() : aktiver())}
          disabled={pending}
          aria-pressed={isOn}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            isOn ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform ${
              isOn ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive-foreground">
          {error}
        </div>
      ) : null}
    </div>
  );
}

// ----------------------------------------------------------------
// Helpers — alt browser-only.
// ----------------------------------------------------------------

async function detectStatus(): Promise<Status> {
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

async function aktiverPush(): Promise<Status> {
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

async function deaktiverPush(): Promise<Status> {
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
