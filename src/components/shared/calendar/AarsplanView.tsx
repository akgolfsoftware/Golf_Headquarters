// AarsplanView — Gantt 52 uker × N spillere.
//
// Hver rad er én spiller, 52 kolonner er ISO-uker. Periode-blokker rendres
// med fast farge per PeriodeType. Turneringer markeres med diamant-ikon på
// riktig dato. 7-dagerslås før turnering vises som tynn gul border-left.

import { TurneringMarker } from "./TurneringMarker";
import { PERIODE_FARGER, PERIODE_LABELS } from "@/lib/portal/training/ak-taxonomy";
import { cn } from "@/lib/utils";
import type { PeriodeType } from "@/generated/prisma/client";

export type AarsplanSpiller = { id: string; navn: string };

export type AarsplanPeriode = {
  id: string;
  spilllerId: string;
  type: PeriodeType;
  fra: Date;
  til: Date;
  focus?: string | null;
};

export type AarsplanTurnering = {
  id: string;
  spilllerId: string;
  navn: string;
  dato: Date;
  prioritet?: "MAJOR" | "NORMAL" | "LOCAL";
};

type Props = {
  aar: number;
  spillere: AarsplanSpiller[];
  perioder: AarsplanPeriode[];
  turneringer: AarsplanTurnering[];
  /** Standardradhøyde i px. */
  radHoyde?: number;
};

// ISO-uke nummer (1..53)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isoUkeNr(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Returnerer kolonne-start (1-indeksert) for en gitt dato innenfor året.
function kolonneFor(dato: Date, aar: number): number {
  const dagIAar = Math.floor(
    (dato.getTime() - new Date(aar, 0, 1).getTime()) / 86_400_000,
  );
  const uke = Math.min(52, Math.max(1, Math.floor(dagIAar / 7) + 1));
  return uke;
}

const MND_NAVN = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

// Tilnærmet uke der hver måned starter (relativt til 1. jan)
function maanedStartUker(aar: number): Array<{ uke: number; navn: string }> {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(aar, i, 1);
    return { uke: kolonneFor(d, aar), navn: MND_NAVN[i] };
  });
}

export function AarsplanView({
  aar,
  spillere,
  perioder,
  turneringer,
  radHoyde = 52,
}: Props) {
  const maaneder = maanedStartUker(aar);

  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="min-w-[1200px]">
        {/* Måneds-header */}
        <div
          className="sticky top-0 z-20 grid border-b border-border bg-card"
          style={{ gridTemplateColumns: "160px repeat(52, minmax(18px, 1fr))" }}
        >
          <div className="border-r border-border px-4 py-2 text-xs font-medium text-muted-foreground">
            Spiller
          </div>
          {Array.from({ length: 12 }, (_, i) => {
            const start = maaneder[i].uke;
            const slutt = i < 11 ? maaneder[i + 1].uke : 53;
            const span = Math.max(1, slutt - start);
            return (
              <div
                key={i}
                className="border-r border-border px-1 py-2 text-[11px] font-medium text-foreground"
                style={{ gridColumn: `${start + 1} / span ${span}` }}
              >
                {maaneder[i].navn}
              </div>
            );
          })}
        </div>

        {/* Uke-numre */}
        <div
          className="sticky top-9 z-10 grid border-b border-border bg-card"
          style={{ gridTemplateColumns: "160px repeat(52, minmax(18px, 1fr))" }}
        >
          <div className="border-r border-border" />
          {Array.from({ length: 52 }, (_, i) => (
            <div
              key={i}
              className="border-r border-border/50 py-1 text-center text-[9px] tabular-nums text-muted-foreground"
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Spiller-rader */}
        {spillere.map((sp) => {
          const radPerioder = perioder.filter((p) => p.spilllerId === sp.id);
          const radTurneringer = turneringer.filter((t) => t.spilllerId === sp.id);
          return (
            <div
              key={sp.id}
              className="grid border-b border-border"
              style={{
                gridTemplateColumns: "160px repeat(52, minmax(18px, 1fr))",
                height: `${radHoyde}px`,
              }}
            >
              <div className="flex items-center border-r border-border bg-card px-4 text-sm font-medium text-foreground">
                <span className="truncate">{sp.navn}</span>
              </div>

              {/* Periode-blokker */}
              <div
                className="relative"
                style={{ gridColumn: `2 / span 52`, height: `${radHoyde}px` }}
              >
                <div
                  className="grid h-full"
                  style={{ gridTemplateColumns: "repeat(52, minmax(18px, 1fr))" }}
                >
                  {radPerioder.map((p) => {
                    const fraUke = kolonneFor(p.fra, aar);
                    const tilUke = kolonneFor(p.til, aar);
                    const span = Math.max(1, tilUke - fraUke + 1);
                    const farge = PERIODE_FARGER[p.type];
                    const diagonal = farge.pattern === "diagonal-stripe";
                    return (
                      <div
                        key={p.id}
                        className={cn(
                          "my-2 flex items-center overflow-hidden rounded-md px-2 text-[11px] font-medium",
                        )}
                        style={{
                          gridColumn: `${fraUke} / span ${span}`,
                          backgroundColor: diagonal ? "transparent" : farge.bg,
                          color: farge.text,
                          backgroundImage: diagonal
                            ? "repeating-linear-gradient(135deg, #F1EEE5 0 6px, #E5E3DD 6px 12px)"
                            : undefined,
                          border: diagonal ? "1px solid #E5E3DD" : undefined,
                        }}
                        title={`${PERIODE_LABELS[p.type]} · ${p.focus ?? ""}`}
                      >
                        <span className="truncate">{PERIODE_LABELS[p.type]}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Turnerings-diamanter + 7-dagerslås */}
                {radTurneringer.map((t) => {
                  const uke = kolonneFor(t.dato, aar);
                  const lassUke = Math.max(1, kolonneFor(t.dato, aar) - 1);
                  // x-prosent for ikonet inne i rad
                  const leftPct = ((uke - 1) / 52) * 100;
                  const lassPct = ((lassUke - 1) / 52) * 100;
                  return (
                    <div key={t.id} className="pointer-events-none absolute inset-y-0">
                      {/* 7-dagerslås */}
                      <div
                        className="absolute inset-y-1"
                        style={{
                          left: `${lassPct}%`,
                          width: `${((uke - lassUke) / 52) * 100}%`,
                          borderLeft: "2px solid #D1F843",
                        }}
                        aria-hidden
                      />
                      {/* Markør */}
                      <div
                        className="pointer-events-auto absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${leftPct + 100 / 52 / 2}%` }}
                      >
                        <TurneringMarker
                          kort
                          navn={t.navn}
                          prioritet={t.prioritet ?? "NORMAL"}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {spillere.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Ingen spillere å vise.
          </div>
        )}
      </div>
    </div>
  );
}
