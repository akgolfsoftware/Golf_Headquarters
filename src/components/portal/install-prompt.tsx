"use client";

/**
 * Install-CTA for PWA — viser banner med "Legg til på startskjerm".
 *
 * Strategi:
 *  - Android/Chrome: lytter på `beforeinstallprompt`, lagrer event,
 *    trigger native install-dialog ved klikk.
 *  - iOS Safari: viser instruksjon (Del-knapp → Legg til på Hjem-skjerm),
 *    da iOS ikke støtter beforeinstallprompt.
 *  - Vises kun på mobil og tidligst på 3. besøk.
 *  - Dismissible — lagrer i localStorage.
 */

import { useEffect, useState } from "react";
import { Share, X } from "lucide-react";

const STORAGE_DISMISSED = "akgolf:install-prompt-dismissed";
const STORAGE_VISITS = "akgolf:visits";
const MIN_VISITS = 3;

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function erMobil(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

function erIPhoneSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const erIOS = /iPhone|iPod/.test(ua);
  const erSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return erIOS && erSafari;
}

function erInstallert(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone) return true;
  return window.matchMedia("(display-mode: standalone)").matches;
}

export function InstallPrompt() {
  const [vis, setVis] = useState(false);
  const [bip, setBip] = useState<BIPEvent | null>(null);
  const [iosMode, setIosMode] = useState(false);

  useEffect(() => {
    if (erInstallert()) return;
    if (!erMobil()) return;
    if (localStorage.getItem(STORAGE_DISMISSED) === "1") return;

    // Tell besøk
    const visits = Number(localStorage.getItem(STORAGE_VISITS) ?? "0") + 1;
    localStorage.setItem(STORAGE_VISITS, String(visits));
    if (visits < MIN_VISITS) return;

    // Android: beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setBip(e as BIPEvent);
      setVis(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS: vis instruksjon
    if (erIPhoneSafari()) {
      setIosMode(true);
      const t = setTimeout(() => setVis(true), 2000);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function lukk() {
    setVis(false);
    localStorage.setItem(STORAGE_DISMISSED, "1");
  }

  async function installer() {
    if (!bip) return;
    await bip.prompt();
    const choice = await bip.userChoice;
    if (choice.outcome === "accepted") {
      setVis(false);
      localStorage.setItem(STORAGE_DISMISSED, "1");
    }
  }

  if (!vis) return null;

  return (
    <div
      role="dialog"
      aria-label="Installer AK Golf"
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-border bg-card p-4 shadow-2xl lg:bottom-4"
    >
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary font-display text-base font-semibold text-primary-foreground">
          AK
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-sm font-semibold leading-tight text-foreground">
            Legg AK Golf på hjemskjermen
          </h3>
          {iosMode ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Trykk{" "}
              <span className="inline-flex items-center gap-1">
                <Share width={12} height={12} aria-hidden /> Del
              </span>{" "}
              i Safari og velg{" "}
              <strong className="text-foreground">
                «Legg til på Hjem-skjerm»
              </strong>
              .
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              Få raskere tilgang og varsler. Ett trykk.
            </p>
          )}
          {!iosMode && bip && (
            <button
              type="button"
              onClick={installer}
              className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 active:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Legg til på startskjerm
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={lukk}
          aria-label="Lukk"
          className="-mr-1 -mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X width={16} height={16} aria-hidden />
        </button>
      </div>
    </div>
  );
}
