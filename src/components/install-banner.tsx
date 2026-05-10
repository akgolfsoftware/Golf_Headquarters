"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "akgolf:install-banner-dismissed";

function erIPhoneSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const erIOS = /iPhone|iPod/.test(ua);
  const erSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return erIOS && erSafari;
}

function erAlleredeInstallert(): boolean {
  if (typeof window === "undefined") return false;
  // iOS standalone-mode
  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };
  if (navigatorWithStandalone.standalone) return true;
  // PWA standalone-display
  return window.matchMedia("(display-mode: standalone)").matches;
}

export function InstallBanner() {
  const [vis, setVis] = useState(false);

  useEffect(() => {
    if (erAlleredeInstallert()) return;
    if (!erIPhoneSafari()) return;
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
    // Vis banner etter 3 sekunder
    const timer = setTimeout(() => setVis(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  function lukk() {
    setVis(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }

  if (!vis) return null;

  return (
    <div
      role="dialog"
      aria-label="Installer AK Golf"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-border bg-card p-4 shadow-2xl"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground">
          AK
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-sm font-semibold leading-tight text-foreground">
            Legg AK Golf på hjemskjermen
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Trykk{" "}
            <span className="inline-flex items-center gap-1">
              <ShareIcon /> Del
            </span>{" "}
            i Safari og velg{" "}
            <strong className="text-foreground">«Legg til på Hjem-skjerm»</strong>.
          </p>
        </div>
        <button
          type="button"
          onClick={lukk}
          aria-label="Lukk"
          className="-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 16V3" />
      <path d="M8 7l4-4 4 4" />
      <rect x="4" y="13" width="16" height="8" rx="2" />
    </svg>
  );
}
