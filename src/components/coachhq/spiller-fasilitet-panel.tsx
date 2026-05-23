"use client";

/**
 * SpillerFasilitetPanel — CoachHQ-versjon av fasilitetsprofil-editoren.
 *
 * Brukes i /admin/spillere/[id] for at coach kan se og justere
 * hvilke fasiliteter en spiller har tilgang til.
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
  MapPin,
} from "lucide-react";
import { lagreSpillerFasiliteter } from "@/app/admin/spillere/[id]/actions";

// ─── Fasilitet-definisjon ─────────────────────────────────────────────────────

type FasilitetDef = {
  kode: string;
  label: string;
  gruppe: "treningssteder" | "green" | "utstyr";
  icon: typeof Circle;
};

const FASILITETER: FasilitetDef[] = [
  { kode: "DRIVING_RANGE", label: "Driving range", gruppe: "treningssteder", icon: Wind },
  { kode: "BANE", label: "Golfrunde", gruppe: "treningssteder", icon: Leaf },
  { kode: "SIMULATOR", label: "Simulator", gruppe: "treningssteder", icon: Gauge },
  { kode: "SHORT_GAME_AREA", label: "Nærspillsareal", gruppe: "treningssteder", icon: Layers },
  { kode: "BUNKER", label: "Sandbunker", gruppe: "treningssteder", icon: Mountain },
  { kode: "PUTTING_GREEN_KORT", label: "Puttingreen (kort)", gruppe: "green", icon: CircleDot },
  { kode: "PUTTING_GREEN_LANG", label: "Puttingreen (lang 15m+)", gruppe: "green", icon: ArrowUpWideNarrow },
  { kode: "RADAR", label: "Launch monitor", gruppe: "utstyr", icon: Wifi },
  { kode: "KAMERA", label: "Video-kamera", gruppe: "utstyr", icon: Video },
  { kode: "MAT_NET", label: "Matte + nett", gruppe: "utstyr", icon: Shell },
  { kode: "MED_BALL", label: "Medisinball", gruppe: "utstyr", icon: Circle },
  { kode: "VEKTSTANG", label: "Vektstang", gruppe: "utstyr", icon: Dumbbell },
  { kode: "TRAPBAR", label: "Trapbar / hex bar", gruppe: "utstyr", icon: Ruler },
  { kode: "LOPEBANE", label: "Løpebane", gruppe: "utstyr", icon: Timer },
];

const GRUPPER: { id: FasilitetDef["gruppe"]; label: string }[] = [
  { id: "treningssteder", label: "Treningssteder" },
  { id: "green", label: "Puttingreen" },
  { id: "utstyr", label: "Utstyr" },
];

// ─── Komponent ────────────────────────────────────────────────────────────────

export function SpillerFasilitetPanel({
  spillerId,
  initial,
}: {
  spillerId: string;
  initial: string[];
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
      const res = await lagreSpillerFasiliteter(spillerId, Array.from(valgte));
      if (res.ok) {
        setStatus("ok");
      } else {
        setStatus("feil");
        setFeilmelding(res.error);
      }
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <MapPin size={16} strokeWidth={1.5} className="text-muted-foreground" />
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Treningsfasiliteter
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Hva har spilleren tilgang til? Påvirker drill-biblioteket og AI-planlegging.
          </p>
        </div>
      </div>

      {/* Checkbox-grid per gruppe */}
      <div className="space-y-4">
        {GRUPPER.map((gruppe) => {
          const items = FASILITETER.filter((f) => f.gruppe === gruppe.id);
          return (
            <div key={gruppe.id}>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                {gruppe.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map((f) => {
                  const aktiv = valgte.has(f.kode);
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.kode}
                      type="button"
                      onClick={() => toggleFasilitet(f.kode)}
                      aria-pressed={aktiv}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        aktiv
                          ? "border-primary/40 bg-primary/10 font-medium text-primary"
                          : "border-border bg-secondary text-secondary-foreground hover:border-border hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-3 w-3" strokeWidth={1.75} />
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lagre */}
      <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={handleLagre}
          disabled={pending}
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Lagrer..." : "Lagre"}
        </button>
        {status === "ok" && (
          <span className="text-xs text-primary">Fasilitetsprofil oppdatert</span>
        )}
        {status === "feil" && (
          <span className="text-xs text-destructive">{feilmelding}</span>
        )}
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          {valgte.size} / 14 valgt
        </span>
      </div>
    </div>
  );
}
