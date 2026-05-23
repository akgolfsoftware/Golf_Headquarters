"use client";

/**
 * FasilitetSelector — interaktiv checkbox-grid for treningsfasiliteter.
 *
 * Lar spiller markere hvilke fasiliteter de har tilgang til.
 * Brukes i /portal/profil og (via SpillerFasilitetPanel) i CoachHQ.
 */

import { useState, useTransition } from "react";
import {
  Wifi,
  Layers,
  Mountain,
  Video,
  CircleDot,
  ArrowUpWideNarrow,
  Leaf,
  Ruler,
  Dumbbell,
  Gauge,
  Timer,
  Shell,
  Wind,
  Circle,
} from "lucide-react";
import { lagreFasiliteter } from "./actions";

// ─── Definisjon av alle 14 fasiliteter ───────────────────────────────────────

type FasilitetDef = {
  kode: string;
  label: string;
  beskrivelse: string;
  icon: typeof Circle;
  gruppe: "treningssteder" | "green" | "utstyr";
};

const FASILITETER: FasilitetDef[] = [
  // Treningssteder
  {
    kode: "DRIVING_RANGE",
    label: "Driving range",
    beskrivelse: "Utendørs range med vanlig avstand",
    icon: Wind,
    gruppe: "treningssteder",
  },
  {
    kode: "BANE",
    label: "Golfrunde",
    beskrivelse: "Tilgang til 9 eller 18 hull",
    icon: Leaf,
    gruppe: "treningssteder",
  },
  {
    kode: "SIMULATOR",
    label: "Simulator",
    beskrivelse: "Innendørs simulator-bay",
    icon: Gauge,
    gruppe: "treningssteder",
  },
  {
    kode: "SHORT_GAME_AREA",
    label: "Nærspillsareal",
    beskrivelse: "Gress for chip og pitch fra varierende løv og rough",
    icon: Layers,
    gruppe: "treningssteder",
  },
  {
    kode: "BUNKER",
    label: "Sandbunker",
    beskrivelse: "Bunker på treningsgreen eller bane",
    icon: Mountain,
    gruppe: "treningssteder",
  },
  // Green
  {
    kode: "PUTTING_GREEN_KORT",
    label: "Puttingreen (kort)",
    beskrivelse: "Putting green opp til 10m",
    icon: CircleDot,
    gruppe: "green",
  },
  {
    kode: "PUTTING_GREEN_LANG",
    label: "Puttingreen (lang)",
    beskrivelse: "Putting green 15m+ for lag-putt",
    icon: ArrowUpWideNarrow,
    gruppe: "green",
  },
  // Utstyr
  {
    kode: "RADAR",
    label: "Launch monitor",
    beskrivelse: "TrackMan, FlightScope, Garmin R10, Mevo+ eller lignende",
    icon: Wifi,
    gruppe: "utstyr",
  },
  {
    kode: "KAMERA",
    label: "Video-kamera",
    beskrivelse: "iPhone + stativ for swing-video",
    icon: Video,
    gruppe: "utstyr",
  },
  {
    kode: "MAT_NET",
    label: "Matte + nett",
    beskrivelse: "Innendørs trekningsmatte med nett",
    icon: Shell,
    gruppe: "utstyr",
  },
  {
    kode: "MED_BALL",
    label: "Medisinball",
    beskrivelse: "2–4 kg medisinball for rotasjonsøvelser",
    icon: Circle,
    gruppe: "utstyr",
  },
  {
    kode: "VEKTSTANG",
    label: "Vektstang",
    beskrivelse: "Benkpress, squat rack eller lignende",
    icon: Dumbbell,
    gruppe: "utstyr",
  },
  {
    kode: "TRAPBAR",
    label: "Trapbar / hex bar",
    beskrivelse: "Hex bar for heavy hinges og RDL",
    icon: Ruler,
    gruppe: "utstyr",
  },
  {
    kode: "LOPEBANE",
    label: "Løpebane",
    beskrivelse: "Friidrettsbane eller tredemølle",
    icon: Timer,
    gruppe: "utstyr",
  },
];

const GRUPPER: { id: FasilitetDef["gruppe"]; label: string }[] = [
  { id: "treningssteder", label: "Treningssteder" },
  { id: "green", label: "Puttingreen" },
  { id: "utstyr", label: "Utstyr" },
];

// ─── Komponent ────────────────────────────────────────────────────────────────

export function FasilitetSelector({
  initial,
  onSaved,
}: {
  initial: string[];
  onSaved?: (ny: string[]) => void;
}) {
  const [valgte, setValgte] = useState<Set<string>>(new Set(initial));
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "ok" | "feil">("idle");
  const [feilmelding, setFeilmelding] = useState("");

  function toggleFasilitet(kode: string) {
    setValgte((prev) => {
      const next = new Set(prev);
      if (next.has(kode)) {
        next.delete(kode);
      } else {
        next.add(kode);
      }
      return next;
    });
    setStatus("idle");
  }

  function handleLagre() {
    startTransition(async () => {
      const res = await lagreFasiliteter(Array.from(valgte));
      if (res.ok) {
        setStatus("ok");
        onSaved?.(Array.from(valgte));
      } else {
        setStatus("feil");
        setFeilmelding(res.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Info-boks */}
      <div className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-foreground">
        Disse innstillingene bestemmer hvilke drills som vises når du aktiverer{" "}
        <span className="font-semibold">«Mine anlegg»</span>-filteret i drill-biblioteket.
        Drills uten spesielle krav vises alltid.
      </div>

      {GRUPPER.map((gruppe) => {
        const items = FASILITETER.filter((f) => f.gruppe === gruppe.id);
        return (
          <section key={gruppe.id} aria-labelledby={`gruppe-${gruppe.id}`}>
            <h3
              id={`gruppe-${gruppe.id}`}
              className="mb-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
            >
              {gruppe.label}
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {items.map((f) => {
                const aktiv = valgte.has(f.kode);
                const Icon = f.icon;
                return (
                  <button
                    key={f.kode}
                    type="button"
                    onClick={() => toggleFasilitet(f.kode)}
                    aria-pressed={aktiv}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                      aktiv
                        ? "border-primary/40 bg-primary/10 text-foreground"
                        : "border-border bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    {/* Checkbox-indikator */}
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        aktiv
                          ? "border-primary bg-primary"
                          : "border-input bg-background"
                      }`}
                      aria-hidden
                    >
                      {aktiv && (
                        <svg
                          viewBox="0 0 12 12"
                          className="h-3 w-3 text-primary-foreground"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <polyline points="2,6 5,9 10,3" />
                        </svg>
                      )}
                    </span>

                    <Icon
                      className={`mt-0.5 h-4 w-4 shrink-0 ${aktiv ? "text-primary" : "text-muted-foreground"}`}
                      strokeWidth={1.75}
                    />

                    <span>
                      <span className="block text-sm font-medium leading-tight">
                        {f.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {f.beskrivelse}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Lagre-knapp */}
      <div className="flex items-center gap-4 border-t border-border pt-4">
        <button
          type="button"
          onClick={handleLagre}
          disabled={pending}
          className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Lagrer..." : "Lagre fasiliteter"}
        </button>

        {status === "ok" && (
          <span className="text-sm text-primary">
            Lagret! Drill-filteret oppdateres automatisk.
          </span>
        )}
        {status === "feil" && (
          <span className="text-sm text-destructive">{feilmelding}</span>
        )}
      </div>
    </div>
  );
}
