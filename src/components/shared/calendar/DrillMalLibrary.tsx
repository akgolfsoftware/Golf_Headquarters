"use client";

// DrillMalLibrary — modal for å bla i drill-maler.
// Tabs: Alle/Mine/Globale/★. Filter på pyramide + kategori + søk.
// Sortering: mest brukt / sist brukt / nyest / navn.
// Returnerer valgt mal-data via onVelg-callback.

import { useState, useMemo } from "react";
import { Search, Star, X, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { PYRAMIDE } from "@/lib/portal/training/ak-taxonomy";
import { DRILL_MAL_KATEGORIER } from "@/lib/taxonomy";
import type { PyramidArea } from "@/generated/prisma/client";

export type DrillMalKort = {
  id: string;
  navn: string;
  beskrivelse: string | null;
  kategori: string;
  pyramide: PyramidArea;
  erFavoritt: boolean;
  erGlobal: boolean;
  bruktAntall: number;
  sistBrukt: Date | null;
  createdAt: Date;
  coachId: string;
};

type Tab = "alle" | "mine" | "globale" | "favoritter";
type Sort = "mest_brukt" | "sist_brukt" | "nyest" | "navn";

type Props = {
  apen: boolean;
  onLukk: () => void;
  maler: DrillMalKort[];
  currentCoachId: string;
  onVelg: (mal: DrillMalKort) => void;
};

const PYRAMIDE_FARGE: Record<PyramidArea, string> = {
  FYS: "bg-pyr-fys",
  TEK: "bg-pyr-tek",
  SLAG: "bg-pyr-slag",
  SPILL: "bg-pyr-spill",
  TURN: "bg-pyr-turn",
};

// Mock-data hvis tabellen er tom — så coachen ser noe meningsfullt umiddelbart.
export const MOCK_DRILL_MALER: DrillMalKort[] = [
  {
    id: "mock-1",
    navn: "9-ball putt-rutine",
    beskrivelse: "Klassisk putt-utfordring fra 1m, 2m, 3m.",
    kategori: "PUTT_DRILL",
    pyramide: "SLAG",
    erFavoritt: true,
    erGlobal: true,
    bruktAntall: 47,
    sistBrukt: new Date(Date.now() - 86400000 * 3),
    createdAt: new Date(Date.now() - 86400000 * 90),
    coachId: "global",
  },
  {
    id: "mock-2",
    navn: "Range-koreografi 7-jern",
    beskrivelse: "L-kropp → L-arm → L-kolle progresjon.",
    kategori: "TEKNIKK",
    pyramide: "TEK",
    erFavoritt: false,
    erGlobal: true,
    bruktAntall: 22,
    sistBrukt: new Date(Date.now() - 86400000 * 10),
    createdAt: new Date(Date.now() - 86400000 * 60),
    coachId: "global",
  },
  {
    id: "mock-3",
    navn: "Knebøy 5×5",
    beskrivelse: "Tung styrkebase, 80% av 1RM.",
    kategori: "STYRKE",
    pyramide: "FYS",
    erFavoritt: false,
    erGlobal: true,
    bruktAntall: 31,
    sistBrukt: new Date(Date.now() - 86400000 * 5),
    createdAt: new Date(Date.now() - 86400000 * 120),
    coachId: "global",
  },
];

export function DrillMalLibrary({
  apen,
  onLukk,
  maler,
  currentCoachId,
  onVelg,
}: Props) {
  const [tab, setTab] = useState<Tab>("alle");
  const [sok, setSok] = useState("");
  const [pyramide, setPyramide] = useState<PyramidArea | "ALLE">("ALLE");
  const [kategori, setKategori] = useState<string>("");
  const [sort, setSort] = useState<Sort>("mest_brukt");

  const data = maler.length > 0 ? maler : MOCK_DRILL_MALER;

  const filtrert = useMemo(() => {
    const lower = sok.trim().toLowerCase();
    return data
      .filter((m) => {
        if (tab === "mine" && m.coachId !== currentCoachId) return false;
        if (tab === "globale" && !m.erGlobal) return false;
        if (tab === "favoritter" && !m.erFavoritt) return false;
        if (pyramide !== "ALLE" && m.pyramide !== pyramide) return false;
        if (kategori && m.kategori !== kategori) return false;
        if (lower && !m.navn.toLowerCase().includes(lower)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === "mest_brukt") return b.bruktAntall - a.bruktAntall;
        if (sort === "sist_brukt") {
          const ax = a.sistBrukt?.getTime() ?? 0;
          const bx = b.sistBrukt?.getTime() ?? 0;
          return bx - ax;
        }
        if (sort === "nyest") return b.createdAt.getTime() - a.createdAt.getTime();
        return a.navn.localeCompare(b.navn, "no");
      });
  }, [data, tab, sok, pyramide, kategori, sort, currentCoachId]);

  if (!apen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="relative flex h-[80vh] w-full max-w-5xl flex-col rounded-xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Library className="h-5 w-5 text-primary" strokeWidth={1.8} />
            <h2 className="text-lg font-semibold">Drill-bibliotek</h2>
          </div>
          <button
            type="button"
            onClick={onLukk}
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Lukk"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border px-6 py-2">
          {(["alle", "mine", "globale", "favoritter"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary",
              )}
            >
              {t === "favoritter" && <Star className="h-3.5 w-3.5" strokeWidth={1.8} />}
              {t === "alle"
                ? "Alle"
                : t === "mine"
                  ? "Mine"
                  : t === "globale"
                    ? "Globale"
                    : "Favoritter"}
            </button>
          ))}
        </div>

        {/* Filter-rad */}
        <div className="flex flex-wrap items-center gap-4 border-b border-border px-6 py-4">
          <div className="relative min-w-48 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.8} />
            <input
              type="text"
              value={sok}
              onChange={(e) => setSok(e.target.value)}
              placeholder="Søk i drill-maler"
              className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPyramide("ALLE")}
              className={cn(
                "rounded-full border px-2 py-2 text-xs font-medium",
                pyramide === "ALLE"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-secondary",
              )}
            >
              Alle
            </button>
            {(Object.keys(PYRAMIDE) as PyramidArea[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPyramide(p)}
                className={cn(
                  "rounded-full border px-2 py-2 text-xs font-medium",
                  pyramide === p
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-secondary",
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Alle kategorier</option>
            {DRILL_MAL_KATEGORIER.map((k) => (
              <option key={k.kode} value={k.kode}>
                {k.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="mest_brukt">Mest brukt</option>
            <option value="sist_brukt">Sist brukt</option>
            <option value="nyest">Nyest</option>
            <option value="navn">Navn (A-Å)</option>
          </select>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filtrert.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Ingen maler matcher filteret.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtrert.map((m) => (
                <div
                  key={m.id}
                  className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
                >
                  {/* Pyramide-stripe topp */}
                  <div className={cn("h-2 w-full", PYRAMIDE_FARGE[m.pyramide])} />
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold leading-snug">{m.navn}</h3>
                      {m.erFavoritt && (
                        <Star
                          className="h-4 w-4 shrink-0 fill-accent text-accent"
                          strokeWidth={1.8}
                        />
                      )}
                    </div>
                    {m.beskrivelse && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {m.beskrivelse}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2 text-[11px] text-muted-foreground">
                      <span className="rounded-sm bg-secondary px-2 py-1 font-mono">
                        {m.kategori}
                      </span>
                      <span className="font-mono tabular-nums">
                        Brukt {m.bruktAntall}×
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onVelg(m)}
                      className="mt-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Bruk
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
