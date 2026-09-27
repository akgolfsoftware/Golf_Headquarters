"use client";

import React, { useState, useSyncExternalStore } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

function getSnapshot() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function getServerSnapshot() {
  return true;
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function OfflineBanner() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [sjekker, setSjekker] = useState(false);
  const [tvungetOnline, setTvungetOnline] = useState<boolean | null>(null);

  const erFrakoblet = tvungetOnline !== null ? !tvungetOnline : !isOnline;

  const sjekkTilkobling = () => {
    setSjekker(true);
    fetch("/api/health", { method: "HEAD", cache: "no-store" })
      .then(() => {
        setTvungetOnline(true);
      })
      .catch(() => {
        setTvungetOnline(false);
      })
      .finally(() => {
        setSjekker(false);
      });
  };

  if (!erFrakoblet) {
    return null;
  }

  return (
    <aside
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-50 flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-rose-300 bg-rose-50 px-4 py-2.5 text-xs font-sans text-rose-950 shadow-md transition-all"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-[#9B2415] animate-ping" />
        <WifiOff className="h-4 w-4 text-[#9B2415] shrink-0" />
        <span className="font-bold">Frakoblet internett:</span>
        <span className="text-rose-900">
          Ingen endringer går tapt. Data lagres lokalt og synkroniseres automatisk når nettet er tilbake.
        </span>
      </div>

      <button
        type="button"
        onClick={sjekkTilkobling}
        disabled={sjekker}
        className="flex items-center gap-1.5 rounded bg-[#141413] px-3 py-1 font-sans text-[11px] font-bold text-white hover:bg-black transition-colors shrink-0 disabled:opacity-50"
      >
        <RefreshCw className={`h-3 w-3 ${sjekker ? "animate-spin" : ""}`} />
        <span>{sjekker ? "Tester..." : "Sjekk nå"}</span>
      </button>
    </aside>
  );
}
