/**
 * PlayerHQ · Årskalender (`/portal/kalender`) — hybrid-design 2026-06-17.
 *
 * Fasit: public/design-handover/prosjektgjennomgang-2026-06-17/
 *   prosjektgjennomgang-og-wireframing/project/PlayerHQ Årskalender (hybrid).dc.html
 *
 * Layout:
 *   - Header: "Årsplan {år}" + italic år i forest + spiller/HCP-subtitle
 *   - Gantt-kart: månedskolonner (J-D) + rader per pyramide-akse + TURN-markører
 *   - Forklaring-legend
 *   - Kommende hendelser (turnering + viktige blokker)
 *   - Tom-tilstand: ikon + tekst + CTA
 *
 * Server component. Prisma-data: SeasonPlan + periodBlocks + TournamentEntry.
 * Ingen hardkodet hex — kun DS-tokens.
 */

import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { lesPeriodeType } from "@/app/admin/kalender/lib/periode-helpers";

export const dynamic = "force-dynamic";

// ── Token-mapping ─────────────────────────────────────────────────────────────
// Gantt-rader etter fasit. Rekkefølge matcher design: FYS, TEK, SES, PEAK, REST, TURN.
// TURN-raden er markører (vertikale streker), ikke en sammenhengende bar.

type GanttRad = {
  label: string;
  /** CSS-bakgrunnsfarge for baren — DS-token via inline style */
  bg: string;
  /** CSS-tekstfarge for bar-label */
  fg: string;
  erMarkorer: boolean;
};

const GANTT_RADER: Record<string, GanttRad> = {
  FYS:  { label: "FYS",  bg: "var(--pyr-fys)",  fg: "#fff",                       erMarkorer: false },
  TEK:  { label: "TEK",  bg: "var(--pyr-tek)",  fg: "#fff",                       erMarkorer: false },
  SES:  { label: "SES",  bg: "var(--forest)",   fg: "var(--lime)",                erMarkorer: false },
  PEAK: { label: "PEAK", bg: "var(--lime)",      fg: "var(--forest-deep, #00402F)", erMarkorer: false },
  REST: { label: "REST", bg: "var(--pyr-tek)",  fg: "#fff",                       erMarkorer: false },
  TURN: { label: "TURN", bg: "var(--pyr-turn)", fg: "#fff",                       erMarkorer: true  },
};

const RAD_REKKEFOLGE = ["FYS", "TEK", "SES", "PEAK", "REST", "TURN"] as const;

const MANED_BOKSTAV = ["J","F","M","A","M","J","J","A","S","O","N","D"] as const;

// Norske månedsnavn — brukes i hendelse-kort
const MANED_KORT = ["JAN","FEB","MAR","APR","MAI","JUN","JUL","AUG","SEP","OKT","NOV","DES"] as const;

// ── Data-mapping ──────────────────────────────────────────────────────────────

type GanttBand = {
  /** 0–1 relativ startposisjon */
  startPct: number;
  /** 0–1 relativ bredde */
  widthPct: number;
  label: string;
  bg: string;
  fg: string;
  erAktiv: boolean;
};

type TurnMarkering = { leftPct: number };

type KommendeHendelse = {
  id: string;
  dag: string;
  mnd: string;
  tittel: string;
  meta: string;
  badge: string;
  badgeBg: string;
  badgeFg: string;
  ikonBg: string;
  ikonFg: string;
};

type AarsplanData =
  | { harData: true; ganttBands: Record<string, GanttBand[]>; turnMarkorer: TurnMarkering[]; hendelser: KommendeHendelse[]; aar: number; spillerNavn: string; hcp: string | null }
  | { harData: false; aar: number; spillerNavn: string };

// ── Server-datafunksjon ───────────────────────────────────────────────────────

async function hentData(spillerId: string, spillerNavn: string, hcp: number | null): Promise<AarsplanData> {
  const idag = new Date();
  const aar = idag.getFullYear();
  const fraAar = new Date(aar, 0, 1);
  const tilAar = new Date(aar, 11, 31);

  const [sesongplan, turneringer] = await Promise.all([
    prisma.seasonPlan.findFirst({
      where: { userId: spillerId, year: aar },
      include: { periodBlocks: { orderBy: { startDate: "asc" } } },
    }),
    prisma.tournamentEntry.findMany({
      where: {
        userId: spillerId,
        OR: [
          { tournament: { startDate: { gte: fraAar, lte: tilAar } } },
          { manualDate: { gte: fraAar, lte: tilAar } },
        ],
      },
      include: { tournament: { select: { name: true, startDate: true } } },
      take: 20,
    }),
  ]);

  const harPerioder = (sesongplan?.periodBlocks?.length ?? 0) > 0;
  const harTurneringer = turneringer.length > 0;

  if (!harPerioder && !harTurneringer) {
    return { harData: false, aar, spillerNavn };
  }

  // Mapper periode-blokker til Gantt-bands per rad
  const ganttBands: Record<string, GanttBand[]> = {
    FYS: [], TEK: [], SES: [], PEAK: [], REST: [],
  };

  for (const blokk of sesongplan?.periodBlocks ?? []) {
    const type = lesPeriodeType(blokk);
    const radKey = type === "GRUNN" ? "FYS"
      : type === "SPESIALISERING" ? "TEK"
      : type === "TURNERING" ? "SES"
      : type === "EVALUERING" ? "PEAK"
      : type === "FERIE" ? "REST"
      : null;

    if (!radKey || !(radKey in ganttBands)) continue;

    const startMnd = blokk.startDate.getMonth(); // 0–11
    const sluttMnd = blokk.endDate.getMonth();   // 0–11
    const startPct = startMnd / 12;
    const widthPct = Math.max(1 / 12, (sluttMnd - startMnd + 1) / 12);
    const rad = GANTT_RADER[radKey];

    const erAktiv = idag >= blokk.startDate && idag <= blokk.endDate;

    ganttBands[radKey].push({
      startPct,
      widthPct,
      label: blokk.focus ?? radKey,
      bg: rad.bg,
      fg: rad.fg,
      erAktiv,
    });
  }

  // Turnering-markører (prosentposisjon langs 12-mnd-aksen)
  const turnMarkorer: TurnMarkering[] = turneringer
    .map((e) => {
      const dato = e.tournament?.startDate ?? e.manualDate;
      if (!dato) return null;
      // Dag i året → prosent
      const dagIAar = Math.floor((dato.getTime() - fraAar.getTime()) / (1000 * 60 * 60 * 24));
      const dageTotalt = tilAar.getDate() === 31 && tilAar.getMonth() === 11 ? 365 : 365;
      return { leftPct: Math.min(0.98, Math.max(0.01, dagIAar / dageTotalt)) };
    })
    .filter((m): m is TurnMarkering => m !== null);

  // Kommende hendelser (neste 3)
  const fremtidigeEntries = turneringer
    .filter((e) => {
      const dato = e.tournament?.startDate ?? e.manualDate;
      return dato && dato >= idag;
    })
    .sort((a, b) => {
      const da = (a.tournament?.startDate ?? a.manualDate ?? new Date()).getTime();
      const db = (b.tournament?.startDate ?? b.manualDate ?? new Date()).getTime();
      return da - db;
    })
    .slice(0, 3);

  const hendelser: KommendeHendelse[] = fremtidigeEntries.map((e) => {
    const dato = e.tournament?.startDate ?? e.manualDate ?? new Date();
    const pri = e.priority as string;
    const erMajor = pri === "MAJOR";
    return {
      id: e.id,
      dag: String(dato.getDate()),
      mnd: MANED_KORT[dato.getMonth()],
      tittel: e.tournament?.name ?? e.manualName ?? "Turnering",
      meta: `${MANED_KORT[dato.getMonth()]} ${dato.getFullYear()}`,
      badge: erMajor ? "Major" : "Turnering",
      badgeBg: erMajor ? "rgba(37,99,235,.1)" : "rgba(0,88,64,.1)",
      badgeFg: erMajor ? "var(--info, #2563EB)" : "var(--forest, #005840)",
      ikonBg: erMajor ? "var(--sand, #F1EEE5)" : "var(--forest, #005840)",
      ikonFg: erMajor ? "var(--muted, #5E5C57)" : "var(--lime, #D1F843)",
    };
  });

  const hcpTekst = hcp !== null ? String(hcp.toFixed(1)) : null;

  return {
    harData: true,
    ganttBands,
    turnMarkorer,
    hendelser,
    aar,
    spillerNavn,
    hcp: hcpTekst,
  };
}

// ── Gantt-rad-komponent ───────────────────────────────────────────────────────

function GanttRadKomponent({
  radKey,
  bands,
  markorer,
}: {
  radKey: string;
  bands: GanttBand[];
  markorer: TurnMarkering[];
}) {
  const rad = GANTT_RADER[radKey];
  const erMarkorer = rad.erMarkorer;

  return (
    <div className="grid items-center gap-2" style={{ gridTemplateColumns: "36px 1fr" }}>
      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.03em] text-muted-foreground">
        {rad.label}
      </span>
      {/* Gantt-track */}
      <div
        className="relative h-[22px] rounded-[4px] bg-secondary"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg,transparent,transparent calc(100%/12 - 1px),var(--border) calc(100%/12 - 1px),var(--border) calc(100%/12))",
        }}
      >
        {!erMarkorer &&
          bands.map((band, i) => (
            <div
              key={i}
              className="absolute top-[3px] bottom-[3px] flex items-center overflow-hidden whitespace-nowrap rounded-[3px] px-[7px] font-mono text-[9px] font-semibold uppercase tracking-[0.03em]"
              style={{
                left: `${band.startPct * 100}%`,
                width: `${band.widthPct * 100}%`,
                background: band.bg,
                color: band.fg,
                boxShadow: band.erAktiv ? "0 0 0 1.5px var(--lime, #D1F843)" : undefined,
              }}
            >
              {band.label}
            </div>
          ))}
        {erMarkorer &&
          markorer.map((mk, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-[2px] rounded-full"
              style={{
                left: `${mk.leftPct * 100}%`,
                background: "var(--pyr-turn, #A32D2D)",
              }}
            >
              <span
                className="absolute -top-[3px] left-1/2 h-[6px] w-[6px] -translate-x-1/2 rounded-full"
                style={{ background: "var(--pyr-turn, #A32D2D)" }}
              />
            </div>
          ))}
      </div>
    </div>
  );
}

// ── Hoved-side ────────────────────────────────────────────────────────────────

export default async function PortalKalenderPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const data = await hentData(user.id, user.name ?? "Spiller", user.hcp ?? null);

  if (!data.harData) {
    // Tom-tilstand
    return (
      <div className="mx-auto w-full max-w-[460px] px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-4 px-0">
          <h1 className="font-display text-[24px] font-bold leading-tight tracking-[-0.03em] text-foreground">
            Årsplan
            <em className="ml-1 font-medium italic text-primary"> {data.aar}</em>
          </h1>
          <p className="mt-1 font-mono text-[13px] text-muted-foreground">
            {data.spillerNavn}
          </p>
        </div>

        {/* Tom-tilstand-kort */}
        <div className="rounded-[20px] border border-border bg-card px-5 py-8 text-center shadow-sm">
          <div
            className="mx-auto mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-full"
            style={{ background: "var(--secondary, #F1EEE5)" }}
          >
            <CalendarDays className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="font-display text-[17px] font-bold text-foreground">
            Ingen årsplan ennå
          </p>
          <p className="mx-auto mt-2 max-w-[260px] text-[13px] leading-[1.55] text-muted-foreground">
            Coach har ikke laget årsplan ennå. Ta kontakt med Anders Kristiansen.
          </p>
          <Link
            href="/portal/planlegge/workbench"
            className="mt-6 inline-block rounded-full bg-primary px-[22px] py-[10px] font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Send melding til coach
          </Link>
        </div>
      </div>
    );
  }

  const { ganttBands, turnMarkorer, hendelser, aar, spillerNavn, hcp: hcpTekst } = data;

  return (
    <div className="mx-auto w-full max-w-[460px] px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="font-display text-[24px] font-bold leading-tight tracking-[-0.03em] text-foreground">
          Årsplan
          <em className="ml-1 font-medium italic text-primary"> {aar}</em>
        </h1>
        <p className="mt-1 font-mono text-[13px] text-muted-foreground">
          {spillerNavn}
          {hcpTekst !== null && <> · HCP {hcpTekst}</>}
        </p>
      </div>

      {/* Gantt-kart */}
      <div className="rounded-[14px] border border-border bg-card px-4 py-4 shadow-sm">
        {/* Måneds-header */}
        <div className="mb-2 grid items-center gap-2" style={{ gridTemplateColumns: "36px 1fr" }}>
          <span />
          <div className="grid grid-cols-12">
            {MANED_BOKSTAV.map((m, i) => (
              <span
                key={i}
                className="text-center font-mono text-[8px] font-semibold uppercase tracking-[0.04em] text-muted-foreground"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Gantt-rader */}
        <div className="space-y-[5px]">
          {RAD_REKKEFOLGE.map((radKey) => (
            <GanttRadKomponent
              key={radKey}
              radKey={radKey}
              bands={ganttBands[radKey] ?? []}
              markorer={radKey === "TURN" ? turnMarkorer : []}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-[14px] flex flex-wrap gap-3">
          <span className="flex items-center gap-[5px] font-mono text-[9px] text-muted-foreground">
            <span
              className="inline-block h-[10px] w-[10px] rounded-[2px]"
              style={{ background: "var(--pyr-fys, #005840)" }}
            />
            Grunntrening
          </span>
          <span className="flex items-center gap-[5px] font-mono text-[9px] text-muted-foreground">
            <span
              className="inline-block h-[10px] w-[10px] rounded-[2px]"
              style={{ background: "var(--forest, #005840)" }}
            />
            Sesong
          </span>
          <span className="flex items-center gap-[5px] font-mono text-[9px] text-muted-foreground">
            <span
              className="inline-block h-[2px] w-[10px] rounded-sm"
              style={{ background: "var(--pyr-turn, #A32D2D)" }}
            />
            Turnering
          </span>
        </div>
      </div>

      {/* Kommende hendelser */}
      {hendelser.length > 0 && (
        <div className="mt-[18px]">
          <p className="mb-[10px] font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Kommende hendelser
          </p>
          <div className="flex flex-col gap-2">
            {hendelser.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-[11px] rounded-[14px] border border-border bg-card px-[13px] py-[11px] shadow-sm"
              >
                {/* Dato-ikon */}
                <div
                  className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-[8px]"
                  style={{ background: h.ikonBg }}
                >
                  <span
                    className="font-mono text-[12px] font-bold leading-none"
                    style={{ color: h.ikonFg }}
                  >
                    {h.dag}
                  </span>
                  <span
                    className="font-mono text-[7.5px] opacity-70"
                    style={{ color: h.ikonFg }}
                  >
                    {h.mnd}
                  </span>
                </div>

                {/* Tittel + meta */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-foreground">{h.tittel}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{h.meta}</p>
                </div>

                {/* Badge */}
                <span
                  className="shrink-0 rounded-full px-[8px] py-[3px] font-mono text-[9px] font-bold"
                  style={{ background: h.badgeBg, color: h.badgeFg }}
                >
                  {h.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
