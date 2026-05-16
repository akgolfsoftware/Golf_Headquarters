"use client";

/**
 * ViewModeToggle (Standard/Avansert) — for PlayerHQ kalender + analyse.
 *
 * NB: Ikke å forveksle med <ViewModeToggle/> i `view-mode-toggle.tsx` som
 * bytter mellom CoachHQ- og PlayerHQ-perspektiv. Denne styrer kompleksitets-
 * nivå (skjul/vis avanserte visninger og taksonomi-koder) for én spiller.
 *
 * Brukes som sticky pill øverst på portal-sider. Hvis brukeren er på GRATIS-
 * tier kan vi låse Avansert — kall med `locked` så vises låsikon + tooltip.
 */

import { Sparkles, Sliders, Lock } from "lucide-react";
import { useViewMode, type ViewMode } from "./ViewModeContext";
import { cn } from "@/lib/utils";

type Props = {
  /** Hvis satt: lås Avansert (f.eks. fordi bruker er GRATIS). */
  locked?: boolean;
  /** Lenke som vises hvis brukeren prøver å klikke en låst Avansert-knapp. */
  upgradeHref?: string;
  className?: string;
};

const ALTERNATIVER: { kode: ViewMode; label: string; ikon: typeof Sparkles }[] =
  [
    { kode: "standard", label: "Standard", ikon: Sparkles },
    { kode: "advanced", label: "Avansert", ikon: Sliders },
  ];

export function ViewModeToggle({
  locked = false,
  upgradeHref = "/portal/meg/abonnement",
  className,
}: Props) {
  const { mode, setMode, hydrated } = useViewMode();

  function velg(ny: ViewMode) {
    if (ny === "advanced" && locked) {
      if (typeof window !== "undefined") {
        window.location.href = upgradeHref;
      }
      return;
    }
    setMode(ny);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Visningsmodus"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 text-xs",
        // Skjul under hydrering for å unngå feil aktiv-tilstand.
        hydrated ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      {ALTERNATIVER.map(({ kode, label, ikon: Icon }) => {
        const aktiv = mode === kode;
        const erLast = kode === "advanced" && locked;
        return (
          <button
            key={kode}
            type="button"
            role="radio"
            aria-checked={aktiv}
            onClick={() => velg(kode)}
            title={
              erLast
                ? "Avansert krever PRO-abonnement — klikk for å oppgradere"
                : `Bytt til ${label}`
            }
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors",
              aktiv
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>{label}</span>
            {erLast && (
              <Lock className="h-3 w-3" strokeWidth={1.75} aria-hidden />
            )}
          </button>
        );
      })}
    </div>
  );
}
