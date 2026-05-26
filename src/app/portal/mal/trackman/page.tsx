import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/empty-state";
import { Activity } from "lucide-react";
import { CsvImportModal } from "./csv-import-modal";
import { HtmlImportModal } from "./html-import-modal";
import { DispersionClient } from "./dispersion-client";
import { TrackmanImportModal } from "@/components/shared/trackman-import-modal";

// ---------------------------------------------------------------------------
// Static bag data — will be replaced by per-shot aggregates once rawJson
// parsing is wired up in the TrackMan agent.
// ---------------------------------------------------------------------------

type ClubCategory = "wood" | "iron" | "wedge" | "putter";

type Club = {
  name: string;
  carry: string;
  shots: number;
  category: ClubCategory;
  active?: boolean;
};

const CLUBS: Club[] = [
  { name: "Driver", carry: "234", shots: 96,  category: "wood" },
  { name: "3W",     carry: "215", shots: 32,  category: "wood" },
  { name: "5W",     carry: "198", shots: 24,  category: "wood" },
  { name: "4-jern", carry: "188", shots: 28,  category: "iron" },
  { name: "5-jern", carry: "178", shots: 48,  category: "iron" },
  { name: "6-jern", carry: "168", shots: 56,  category: "iron" },
  { name: "7-jern", carry: "162", shots: 80,  category: "iron", active: true },
  { name: "8-jern", carry: "148", shots: 64,  category: "iron" },
  { name: "9-jern", carry: "135", shots: 64,  category: "iron" },
  { name: "PW",     carry: "118", shots: 72,  category: "wedge" },
  { name: "GW · 50°", carry: "102", shots: 32, category: "wedge" },
  { name: "SW · 54°", carry: "88",  shots: 40, category: "wedge" },
  { name: "LW · 58°", carry: "72",  shots: 28, category: "wedge" },
  { name: "Putter", carry: "PT",   shots: 32,  category: "putter" },
];

const CATEGORY_COLOR: Record<ClubCategory, string> = {
  wood:   "#003B2A",
  iron:   "hsl(var(--success))",
  wedge:  "hsl(var(--warning))",
  putter: "hsl(var(--muted-foreground))",
};

// ---------------------------------------------------------------------------
// Session table — static data matching the design
// ---------------------------------------------------------------------------

type SessionRow = {
  name: string;
  category: ClubCategory;
  shots: number;
  carry: string;
  total: string;
  ballSpeed: string;
  smash: string;
  launch: string;
  spin: string;
  apex: string;
  sideS: string;
  totalS: string;
  pct: number;
  pctTone: "good" | "ok" | "bad";
  delta: string;
  deltaTone: "up" | "down" | "flat";
  highlight?: boolean;
};

const SESSION_ROWS: SessionRow[] = [
  { name: "Driver",    category: "wood",   shots: 96,  carry: "234", total: "251", ballSpeed: "165", smash: "1,49", launch: "12,8", spin: "2 580", apex: "32", sideS: "±9,2", totalS: "±8,1", pct: 64, pctTone: "ok",   delta: "+9 m",            deltaTone: "up" },
  { name: "3W",        category: "wood",   shots: 32,  carry: "215", total: "228", ballSpeed: "159", smash: "1,48", launch: "13,4", spin: "3 320", apex: "28", sideS: "±7,4", totalS: "±6,2", pct: 71, pctTone: "ok",   delta: "±0",              deltaTone: "flat" },
  { name: "5W",        category: "wood",   shots: 24,  carry: "198", total: "207", ballSpeed: "152", smash: "1,47", launch: "14,1", spin: "3 880", apex: "26", sideS: "±6,8", totalS: "±5,9", pct: 74, pctTone: "ok",   delta: "+3 m",            deltaTone: "up" },
  { name: "4-jern",    category: "iron",   shots: 28,  carry: "188", total: "195", ballSpeed: "148", smash: "1,42", launch: "14,9", spin: "4 320", apex: "24", sideS: "±6,4", totalS: "±5,6", pct: 75, pctTone: "ok",   delta: "+2 m",            deltaTone: "up" },
  { name: "5-jern",    category: "iron",   shots: 48,  carry: "178", total: "184", ballSpeed: "144", smash: "1,40", launch: "16,1", spin: "4 720", apex: "22", sideS: "±5,9", totalS: "±5,1", pct: 77, pctTone: "good", delta: "+4 m",            deltaTone: "up" },
  { name: "6-jern",    category: "iron",   shots: 56,  carry: "168", total: "173", ballSpeed: "141", smash: "1,39", launch: "17,4", spin: "5 140", apex: "20", sideS: "±5,6", totalS: "±4,8", pct: 78, pctTone: "good", delta: "+5 m",            deltaTone: "up" },
  { name: "7-jern",    category: "iron",   shots: 80,  carry: "162", total: "167", ballSpeed: "138", smash: "1,38", launch: "17,4", spin: "7 280", apex: "18", sideS: "±5,4", totalS: "±4,2", pct: 78, pctTone: "good", delta: "+6 m",            deltaTone: "up",   highlight: true },
  { name: "8-jern",    category: "iron",   shots: 64,  carry: "148", total: "152", ballSpeed: "132", smash: "1,37", launch: "19,2", spin: "6 580", apex: "18", sideS: "±4,8", totalS: "±3,9", pct: 82, pctTone: "good", delta: "+3 m",            deltaTone: "up" },
  { name: "9-jern",    category: "iron",   shots: 64,  carry: "135", total: "138", ballSpeed: "126", smash: "1,36", launch: "21,4", spin: "7 580", apex: "18", sideS: "±4,3", totalS: "±3,6", pct: 84, pctTone: "good", delta: "+2 m",            deltaTone: "up" },
  { name: "PW",        category: "wedge",  shots: 72,  carry: "118", total: "120", ballSpeed: "116", smash: "1,33", launch: "24,2", spin: "8 240", apex: "18", sideS: "±3,9", totalS: "±3,2", pct: 86, pctTone: "good", delta: "±0",              deltaTone: "flat" },
  { name: "GW · 50°",  category: "wedge",  shots: 32,  carry: "102", total: "103", ballSpeed: "108", smash: "1,31", launch: "26,6", spin: "8 640", apex: "16", sideS: "±3,4", totalS: "±2,8", pct: 88, pctTone: "good", delta: "+1 m",            deltaTone: "up" },
  { name: "SW · 54°",  category: "wedge",  shots: 40,  carry: "88",  total: "89",  ballSpeed: "102", smash: "1,29", launch: "28,8", spin: "9 240", apex: "14", sideS: "±3,1", totalS: "±2,5", pct: 89, pctTone: "good", delta: "−1 m",            deltaTone: "down" },
  { name: "LW · 58°",  category: "wedge",  shots: 28,  carry: "72",  total: "73",  ballSpeed: "96",  smash: "1,26", launch: "32,1", spin: "9 880", apex: "12", sideS: "±2,8", totalS: "±2,3", pct: 87, pctTone: "good", delta: "+2 m",            deltaTone: "up" },
  { name: "Putter",    category: "putter", shots: 32,  carry: "—",   total: "—",   ballSpeed: "—",   smash: "—",    launch: "—",    spin: "—",     apex: "—",  sideS: "±0,18",totalS: "±0,4", pct: 91, pctTone: "good", delta: "3-m konv. +6 %",  deltaTone: "up" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function TrackManPage() {
  const user = await requirePortalUser();

  const sessions = await prisma.trackManSession.findMany({
    where: { userId: user.id },
    orderBy: { recordedAt: "desc" },
    take: 50,
  });

  const total = sessions.length;
  const sisteOkt = sessions[0];

  // eslint-disable-next-line react-hooks/purity
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const okter30d = sessions.filter((s) => s.recordedAt >= thirtyDaysAgo);
  const slag30d = okter30d.reduce((s, x) => s + x.shotCount, 0);

  if (total === 0) {
    return (
      <div className="mx-auto max-w-[1240px] space-y-6 px-4 pb-20 sm:px-6 md:space-y-8 md:pb-0">
        <div>
          <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            TrackMan · sesong {new Date().getFullYear()} · trendvisning
          </div>
          <h1 className="font-display text-[28px] font-medium italic leading-tight tracking-tight md:text-[36px]">
            <em>Min sving</em> over tid
          </h1>
        </div>
        <EmptyState
          icon={Activity}
          titleItalic="Ingen TrackMan-data"
          titleTrail="importert ennå"
          sub="Importer din første økt for å se trajectory, KPI-trender og dispersion-pattern per kølle."
          cta={
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <TrackmanImportModal variant="primary" label="Importer TrackMan" />
                <CsvImportModal />
                <HtmlImportModal />
              </div>
              <p className="rounded-md bg-secondary px-4 py-2 text-left font-mono text-[11px] leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Eksporter fra TrackMan:</strong><br />
                CSV: Sessions → velg økt → Export → CSV<br />
                HTML: Åpne Multi Group Report i nettleseren → Lagre som HTML
              </p>
            </div>
          }
        />
      </div>
    );
  }

  const agentUpdatedDate = sisteOkt
    ? sisteOkt.recordedAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" })
    : "—";

  return (
    <div className="min-h-screen bg-card pb-20 text-foreground md:pb-0">
      <div className="mx-auto max-w-[1360px] space-y-4 px-4 py-2 sm:px-6">

        {/* ── Hero ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              TrackMan · sesong {new Date().getFullYear()} · trendvisning
            </div>
            <h1 className="font-display text-[28px] font-medium italic leading-tight tracking-tight md:text-[36px]">
              <em>Min sving</em> over tid
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                Pro
              </span>
              <Dot />
              <span>Trendvisning på tvers av økter — ikke én enkelt rapport</span>
              <Dot />
              <span>
                <b className="text-primary">{okter30d.length} {okter30d.length === 1 ? "økt" : "økter"}</b> siste 30d ·{" "}
                <b className="text-primary">{slag30d.toLocaleString("nb-NO")} slag</b> totalt
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TrackmanImportModal variant="primary" label="Importer TrackMan" />
            <CsvImportModal />
            <HtmlImportModal />
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground opacity-50"
            >
              Eksporter til Strokes Gained
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Action strip ── */}
        <div className="flex flex-wrap items-center gap-2 rounded-[14px] border border-border bg-card px-4 py-4">
          <span className="mr-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Sving-status
          </span>
          <Chip tone="success"><b>{okter30d.length}</b> {okter30d.length === 1 ? "økt" : "økter"} / 30d</Chip>
          <Chip><b>{slag30d.toLocaleString("nb-NO")}</b> slag</Chip>
          <Chip tone="success"><b>+6 m</b> driver carry / 30d</Chip>
          <Chip tone="info"><b>−1,2°</b> launch / 30d</Chip>
          <Chip><b>78 %</b> i target 7-jern</Chip>
        </div>

        {/* ── Bag picker ── */}
        <section className="rounded-[14px] border border-border bg-card px-[18px] pb-4 pt-4">
          {/* Header */}
          <div className="mb-2 flex items-center gap-2 border-b border-border/60 pb-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} className="h-[18px] w-[18px]">
                <path d="M14 6a4 4 0 0 0-8 0c0 1 0 2 1 3l-1 12h8l-1-12c1-1 1-2 1-3z"/>
                <path d="M18 10v10a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1V10"/>
                <path d="M10 2v4M14 4v2"/>
              </svg>
            </div>
            <div className="flex flex-col leading-snug">
              <strong className="font-display text-[14px] font-bold leading-none tracking-[-0.01em] text-foreground">
                {user.name ? `${user.name.split(" ")[0]}'s bag · velg kølle` : "Min bag · velg kølle"}
              </strong>
              <span className="font-mono text-[11px] text-muted-foreground">
                14 køller · 696 slag i siste økt ·{" "}
                {sisteOkt
                  ? `sist oppdatert ${sisteOkt.recordedAt.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}`
                  : "ingen økt ennå"}
              </span>
            </div>
            <div className="ml-auto flex gap-4 font-mono text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
              {(["Wood", "Jern", "Wedge", "Putt"] as const).map((label, i) => {
                const colors = ["#003B2A", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--muted-foreground))"];
                return (
                  <span key={label} className="inline-flex items-center gap-1.5">
                    <i className="inline-block h-2 w-2 rounded-full" style={{ background: colors[i] }} />
                    {label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Club grid */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-2 sm:grid sm:pb-0" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
            {CLUBS.map((club) => (
              <BagClub key={club.name} club={club} />
            ))}
          </div>
        </section>

        {/* ── Main 2-column layout ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">

          {/* Left column */}
          <div className="space-y-4">

            {/* Trajectory card */}
            <section className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                    7-jern · trajectory over tid
                  </div>
                  <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
                    Hvordan slaget endrer seg
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  <span>FRA</span>
                  {[0.20, 0.45, 0.70, 1].map((op, i) => (
                    <span key={i} className="inline-block h-1 w-5 rounded-sm" style={{ background: `rgba(0,88,64,${op})` }} />
                  ))}
                  <span>TIL NÅ</span>
                </div>
              </div>

              <svg viewBox="0 0 800 320" preserveAspectRatio="xMidYMid meet" className="block h-auto w-full rounded-lg"
                style={{ background: "linear-gradient(180deg, rgba(135,206,235,0.05) 0%, rgba(135,206,235,0) 60%, rgba(0,88,64,0.04) 100%)" }}>
                {/* Ground */}
                <line x1={40} y1={280} x2={780} y2={280} stroke="hsl(var(--foreground))" strokeWidth={1.5} />
                {/* X-axis labels */}
                {[{ x: 40, l: "0 m" }, { x: 200, l: "60 m" }, { x: 360, l: "120 m" }, { x: 520, l: "160 m" }, { x: 680, l: "200 m" }].map(({ x, l }) => (
                  <text key={x} x={x} y={298} fill="#7A7666" fontSize={10} style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)" }}>{l}</text>
                ))}
                {/* Y-axis labels */}
                {[{ y: 280, l: "0" }, { y: 220, l: "8m" }, { y: 160, l: "16m" }, { y: 100, l: "24m" }].map(({ y, l }) => (
                  <text key={y} x={35} y={y} textAnchor="end" fill="#7A7666" fontSize={10} style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)" }}>{l}</text>
                ))}
                {/* Trajectories — oldest to newest */}
                <path d="M 40 280 Q 280 70 530 280"  fill="none" stroke="#005840" strokeWidth={2}   opacity={0.18} />
                <path d="M 40 280 Q 290 90 545 280"  fill="none" stroke="#005840" strokeWidth={2}   opacity={0.30} />
                <path d="M 40 280 Q 300 110 555 280" fill="none" stroke="#005840" strokeWidth={2}   opacity={0.45} />
                <path d="M 40 280 Q 310 125 565 280" fill="none" stroke="#005840" strokeWidth={2.2} opacity={0.60} />
                <path d="M 40 280 Q 320 130 575 280" fill="none" stroke="#005840" strokeWidth={2.5} opacity={0.82} />
                <path d="M 40 280 Q 330 132 585 280" fill="none" stroke="#005840" strokeWidth={3} />
                {/* Apex markers */}
                <circle cx={280} cy={70} r={4} fill="#005840" opacity={0.30} />
                <text x={280} y={62} textAnchor="middle" fill="#005840" fontSize={9} opacity={0.6}
                  style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)" }}>
                  apex 24 m · 08.03
                </text>
                <circle cx={330} cy={132} r={6} fill="#D1F843" stroke="#005840" strokeWidth={2.5} />
                <text x={330} y={122} textAnchor="middle" fill="#005840" fontSize={9} fontWeight={700}
                  style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)" }}>
                  apex 18 m · 14.05
                </text>
                {/* Carry delta */}
                <circle cx={530} cy={280} r={3} fill="#005840" opacity={0.30} />
                <circle cx={585} cy={280} r={5} fill="#005840" />
                <line x1={530} y1={288} x2={585} y2={288} stroke="#005840" strokeWidth={2} strokeLinecap="round" />
                <text x={557} y={312} textAnchor="middle" fill="#005840" fontSize={10} fontWeight={700}
                  style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)" }}>
                  +8 m carry
                </text>
                {/* Wind note */}
                <text x={700} y={60} fill="#7A7666" fontSize={9} opacity={0.55}
                  style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)" }}>
                  VIND ↘ 3 m/s
                </text>
              </svg>

              <p className="mt-4 border-t border-border pt-4 text-[13px] leading-relaxed text-muted-foreground">
                <b className="text-foreground">Hva endret seg:</b> Apex har sunket fra 24 m til 18 m (lavere ball-flight) og carry har økt fra ca. 152 m til 162 m.
                Det er bra — du får mer rull og mindre vind-eksponering. Pro-coach Anders K. bekreftet retningen 12. mai.
              </p>
            </section>

            {/* KPI strip */}
            <section className="grid grid-cols-2 gap-2 lg:grid-cols-5">
              <KpiCard label="Snitt carry"  value="162" unit=" m"   delta="+6 m"   deltaTone="success" sub="8 økter"          sparkUp />
              <KpiCard label="Launch"       value="17,4" unit="°"   delta="−1,2°"  deltaTone="info"    sub="target 17–18°"   sparkDown />
              <KpiCard label="Spin"         value="7 280" unit=" rpm" delta="stabilt" deltaTone="flat"  sub="i target" />
              <KpiCard label="Smash"        value="1,38"             delta="+0,02"  deltaTone="success" sub="target 1,38–1,42" sparkUp />
              <KpiCard label="Dispersion"   value="±5,2" unit=" m"  delta="−2,1 m" deltaTone="success" sub="snittet inn"      sparkDown />
            </section>

            {/* Dispersion section */}
            <section className="rounded-lg border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                    Dispersion · landing zone fra TrackMan
                  </div>
                  <h3 className="mt-1 flex items-center gap-2.5 font-display text-[18px] font-semibold leading-snug">
                    <button
                      type="button"
                      aria-label="Forrige kølle"
                      className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-secondary text-muted-foreground hover:bg-card"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 stroke-[2]" />
                    </button>
                    <span>
                      7-jern
                      <span className="ml-2 text-[14px] font-medium text-muted-foreground">
                        · 80 slag · snitt carry 162 m
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label="Neste kølle"
                      className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-secondary text-muted-foreground hover:bg-card"
                    >
                      <ChevronRight className="h-3.5 w-3.5 stroke-[2]" />
                    </button>
                  </h3>
                </div>
                <span className="inline-flex items-baseline gap-1.5 rounded-full border bg-green-50 px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.05em] text-green-700"
                  style={{ borderColor: "rgba(22,163,74,0.30)" }}>
                  5 % mål · <b className="text-[12.5px] text-green-600">±8,1 m</b>
                </span>
              </div>

              <DispersionClient />

              {/* Legend */}
              <div className="mt-2 flex flex-wrap gap-x-3.5 gap-y-1.5 font-mono text-[11px] text-muted-foreground">
                <LegendDot color="hsl(var(--success))" label="Innenfor 5 % · grønn" />
                <LegendDot color="hsl(var(--warning))" label="Akseptabelt · gull" />
                <LegendDot color="hsl(var(--destructive))" label="Utenfor · rød" />
                <LegendLine color="hsl(var(--success))" label="5 % mål-radius" />
                <LegendLine color="hsl(var(--warning))" label="10 % grense" />
                <LegendLine color="hsl(var(--primary))" label="1σ konfidens-ellipse" />
                <span className="ml-auto text-[10px] text-muted-foreground/70">
                  5 % standard = 5 % av snitt carry (162 m × 5 % = 8,1 m)
                </span>
              </div>
            </section>

            {/* Compare card */}
            <section className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                  Sammenlikning · 7-jern
                </div>
                <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
                  Hvor står du?
                </h3>
              </div>
              <div className="space-y-4">
                <CompareRow label="Mot din baseline"          val="+6 m"        valClass="text-green-600"  pct={100} barColor="bg-green-500"      sub="Sesongstart 156 m → nå 162 m" />
                <CompareRow label="Mot HCP-jevngamle (A2)"    val="82. percentil" valClass="text-primary"  pct={82}  barColor="bg-primary"         sub="A2-snitt 154 m · 82 % under deg" />
                <CompareRow label="Mot pro-benchmark"         val="−12 m"       valClass="text-warning"  pct={93}  barColor="bg-warning"       sub="PGA tour-snitt 174 m · gap 12 m" />
              </div>
              <div className="mt-4 rounded-[10px] bg-secondary px-4 py-2 text-[12px] leading-relaxed">
                For din alder (16) er gapet til pro <b className="font-semibold">mindre enn snitt</b> — du henger med i utviklingen.
              </div>
            </section>

            {/* Full session table */}
            <section className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="space-y-2 border-b border-border px-4 py-4 sm:flex sm:flex-wrap sm:items-start sm:justify-between sm:gap-4 sm:space-y-0 sm:px-6 sm:py-6">
                <div>
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                    Økt-data · 10. mai 2026 · 19:42 · 52 min · 696 slag
                  </div>
                  <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
                    Full TrackMan-tabell · per kølle
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 rounded-lg border border-border bg-secondary p-0.5">
                    {(["Snitt", "Median", "Best"] as const).map((label, i) => (
                      <button
                        key={label}
                        type="button"
                        className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.05em] ${i === 0 ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-1.5 font-mono text-[11px] opacity-60"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Eksport CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse font-mono text-[12px] tabular-nums">
                  <thead>
                    <tr>
                      <Th left>Kølle</Th>
                      <Th>Slag</Th>
                      <Th sub="m">Carry</Th>
                      <Th sub="m">Total</Th>
                      <Th sub="mph">Ball-speed</Th>
                      <Th>Smash</Th>
                      <Th sub="°">Launch</Th>
                      <Th sub="rpm">Spin</Th>
                      <Th sub="m">Apex</Th>
                      <Th>Side σ</Th>
                      <Th>Total σ</Th>
                      <Th>Innenfor 5 %</Th>
                      <Th>Δ 30d</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {SESSION_ROWS.map((row) => (
                      <tr
                        key={row.name}
                        className={`group ${row.highlight ? "bg-primary/[0.04]" : "hover:bg-secondary/50"}`}
                      >
                        <td className={`whitespace-nowrap px-4 py-2.5 text-left ${row.highlight ? "shadow-[inset_3px_0_0_hsl(var(--primary))] pl-4" : ""}`}>
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: CATEGORY_COLOR[row.category] }} />
                            <strong className="font-display text-[13px] font-semibold leading-none tracking-[-0.005em] text-foreground">
                              {row.name}
                            </strong>
                          </div>
                        </td>
                        <Td>{row.shots}</Td>
                        <Td>{row.carry}</Td>
                        <Td>{row.total}</Td>
                        <Td>{row.ballSpeed}</Td>
                        <Td>{row.smash}</Td>
                        <Td>{row.launch}</Td>
                        <Td>{row.spin}</Td>
                        <Td>{row.apex}</Td>
                        <Td>{row.sideS}</Td>
                        <Td>{row.totalS}</Td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right">
                          <PctCell pct={row.pct} tone={row.pctTone} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right">
                          <DeltaChip delta={row.delta} tone={row.deltaTone} />
                        </td>
                      </tr>
                    ))}
                    {/* Totals row */}
                    <tr className="border-t-[1.5px] border-border bg-secondary font-semibold">
                      <td className="px-4 py-2.5 text-left text-[13px]">Totalt / snitt</td>
                      <Td>696</Td>
                      <Td>146 <small className="text-[10px] font-normal text-muted-foreground">m</small></Td>
                      <Td>152 <small className="text-[10px] font-normal text-muted-foreground">m</small></Td>
                      <Td>134</Td>
                      <Td>1,38</Td>
                      <Td>19,8</Td>
                      <Td>5 950</Td>
                      <Td>20</Td>
                      <Td>±5,0</Td>
                      <Td>±4,2</Td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right"><PctCell pct={80} tone="good" /></td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right"><DeltaChip delta="+3 m snitt" tone="up" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-6 py-2 font-mono text-[11px] text-muted-foreground">
                <span>Datakilde · TrackMan Performance Studio · CSV importert 10.05 19:48</span>
                <span className="flex gap-4">
                  <span>5 % standard = snitt carry × 5 %</span>
                  <span>σ = standard avvik over alle slag</span>
                </span>
              </div>
            </section>

          </div>

          {/* ── Agent drawer (sticky right) ── */}
          <aside className="sticky top-5 self-start overflow-hidden rounded-lg border border-border bg-card">
            <div className="border-b border-border px-[22px] py-[22px]">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                Agent-funn · oppdatert {agentUpdatedDate}
              </div>
              <h3 className="mt-1.5 font-display text-[18px] font-semibold leading-snug">
                Hva sier dataen?
              </h3>
              <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                3 funn på tvers av køller
              </div>
              <div className="mt-2.5 flex gap-1.5">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-green-700">
                  På sport
                </span>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-blue-700">
                  Coach varslet
                </span>
              </div>
            </div>

            <div className="border-b border-border/70 px-[22px] py-4">
              <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Driver — launch-justering
              </div>
              <div className="rounded-lg border-l-[3px] border-l-primary bg-secondary px-4 py-2 text-[12px] leading-relaxed">
                <b className="font-semibold text-primary">Driver launch nedjustert til 12,8°</b> — innenfor target (12–14°). Carry +9 m siste 30d. Hold setup som det er.
              </div>
            </div>

            <div className="border-b border-border/70 px-[22px] py-4">
              <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                7-jern — apex-trend
              </div>
              <div className="rounded-lg border-l-[3px] border-l-primary bg-secondary px-4 py-2 text-[12px] leading-relaxed">
                Apex sunket fra 24 m til 18 m. Bedre vind-tolerant slag. <b className="font-semibold text-primary">Smash 1,38</b> — i target.
              </div>
            </div>

            <div className="border-b border-border/70 px-[22px] py-4">
              <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Wedge — spin-variasjon
              </div>
              <div className="rounded-lg border-l-[3px] bg-[rgba(184,133,42,0.06)] px-4 py-2 text-[12px] leading-relaxed"
                style={{ borderLeftColor: "hsl(var(--warning))" }}>
                <b className="font-semibold text-[#6F4F18]">Spin varierer ±1 200 rpm</b> mellom slag. Coach foreslår: prøv en annen ball-type for bedre konsistens.
              </div>
            </div>

            <div className="border-b border-border/70 px-[22px] py-4">
              <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Coach-anbefaling
              </div>
              <blockquote className="rounded-[10px] bg-secondary px-4 py-2 text-[12px] italic leading-relaxed text-muted-foreground">
                «Behold setup på driver. Prøv ny ball-type (Pro V1x) for spin-kontroll på 7-jern og wedge — vi ser på data igjen om 2 uker.»
                <footer className="mt-2 font-mono text-[10px] not-italic text-muted-foreground/70">
                  — Anders K., Pro-coach
                </footer>
              </blockquote>
            </div>

            <div className="flex flex-col gap-2 px-[22px] py-4">
              <button
                type="button"
                disabled
                className="w-full rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground opacity-50"
              >
                Eksporter til Strokes Gained
              </button>
              <TrackmanImportModal variant="primary" label="Importer TrackMan" />
              <CsvImportModal />
              <HtmlImportModal />
              <Link
                href="/portal/coach/melding?type=trackman-vurdering"
                className="w-full rounded-md border border-border bg-card px-4 py-2 text-center text-[13px] font-medium hover:bg-secondary"
              >
                Be om coach-vurdering
              </Link>
              <Link
                href={`/portal/mal/trackman`}
                className="w-full rounded-md px-4 py-2 text-center text-[13px] text-muted-foreground hover:text-foreground"
              >
                Se alle {total} {total === 1 ? "økt" : "økter"} →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Dot() {
  return <span className="inline-block h-1 w-1 rounded-full bg-border" />;
}

function Chip({
  tone = "default",
  children,
}: {
  tone?: "default" | "success" | "info";
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    default: "border-border bg-card text-muted-foreground [&_b]:text-foreground",
    success: "border-green-200 bg-green-50 text-green-700 [&_b]:text-green-700",
    info:    "border-blue-200 bg-blue-50 text-blue-700 [&_b]:text-blue-700",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-[10px] border px-4 py-2 text-[12px] font-medium [&_b]:font-mono [&_b]:tabular-nums ${styles[tone]}`}>
      {children}
    </span>
  );
}

function BagClub({ club }: { club: Club }) {
  const stripe = CATEGORY_COLOR[club.category];
  const isActive = club.active;
  return (
    <div
      className={`relative flex shrink-0 w-16 sm:w-auto cursor-pointer flex-col items-center gap-0.5 rounded-[9px] border px-1 pb-2 pt-2 text-center transition-all ${
        isActive
          ? "border-primary bg-primary shadow-lg shadow-primary/20"
          : "border-border bg-secondary hover:-translate-y-0.5 hover:border-muted-foreground/40 hover:shadow-md"
      }`}
    >
      {/* Category stripe */}
      <span
        className="absolute left-2.5 right-2.5 top-0 h-[3px] rounded-b-sm"
        style={{ background: isActive ? "hsl(var(--accent))" : stripe, height: isActive ? "4px" : "3px" }}
      />
      <span className={`font-display text-[12px] font-semibold leading-none tracking-[-0.005em] ${isActive ? "text-accent" : "text-foreground"}`}>
        {club.name}
      </span>
      <span className={`font-mono text-[17px] font-medium leading-none tabular-nums tracking-[-0.02em] ${isActive ? "text-white" : "text-foreground"}`}>
        {club.carry}
        {club.carry !== "PT" && (
          <small className={`text-[9px] font-medium ${isActive ? "text-accent/70" : "text-muted-foreground"}`}>m</small>
        )}
      </span>
      <span className={`mt-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.04em] ${isActive ? "text-accent/75" : "text-muted-foreground"}`}>
        {club.shots} slag
      </span>
    </div>
  );
}

function KpiCard({
  label, value, unit, delta, deltaTone, sub, sparkUp, sparkDown,
}: {
  label: string;
  value: string;
  unit?: string;
  delta: string;
  deltaTone: "success" | "info" | "flat";
  sub: string;
  sparkUp?: boolean;
  sparkDown?: boolean;
}) {
  const deltaStyles: Record<string, string> = {
    success: "bg-green-50 text-green-600",
    info:    "bg-blue-50 text-blue-500",
    flat:    "bg-secondary text-muted-foreground",
  };

  const sparkPoints = sparkUp
    ? "0,20 25,16 50,12 75,8 100,5"
    : sparkDown
    ? "0,6 25,10 50,14 75,16 100,18"
    : "0,14 25,16 50,12 75,14 100,14";

  const sparkFill = sparkUp
    ? "0,28 0,20 25,16 50,12 75,8 100,5 100,28"
    : sparkDown
    ? "0,28 0,6 25,10 50,14 75,16 100,18 100,28"
    : "0,28 0,14 25,16 50,12 75,14 100,14 100,28";

  const sparkEndY = sparkUp ? 5 : sparkDown ? 18 : 14;

  const sparkColor = deltaTone === "info" ? "#3B82F6" : deltaTone === "flat" ? "#7A7666" : "hsl(var(--primary))";

  return (
    <article className="rounded-[14px] border border-border bg-card px-[18px] py-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </span>
        <span className={`rounded-md px-[7px] py-[3px] font-mono text-[10px] font-semibold ${deltaStyles[deltaTone]}`}>
          {delta}
        </span>
      </div>
      <div className="mb-0.5 font-mono text-[26px] font-medium leading-tight tabular-nums tracking-[-0.02em] text-foreground">
        {value}
        {unit && <small className="text-[13px] font-normal text-muted-foreground">{unit}</small>}
      </div>
      <div className="mb-2 font-mono text-[11px] text-muted-foreground">{sub}</div>
      <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="block h-7 w-full">
        <polyline points={sparkFill} fill={`${sparkColor}1A`} stroke="none" />
        <polyline points={sparkPoints} fill="none" stroke={sparkColor} strokeWidth={1.5} strokeLinecap="round" />
        <circle cx={100} cy={sparkEndY} r={2.5} fill={deltaTone === "success" ? "hsl(var(--accent))" : sparkColor} stroke={sparkColor} strokeWidth={1.5} />
      </svg>
    </article>
  );
}

function CompareRow({
  label, val, valClass, pct, barColor, sub,
}: {
  label: string;
  val: string;
  valClass: string;
  pct: number;
  barColor: string;
  sub: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <strong className="text-[13px] font-medium text-foreground">{label}</strong>
        <span className={`font-mono text-[14px] font-medium tabular-nums ${valClass}`}>{val}</span>
      </div>
      <div className="mb-1.5 font-mono text-[11px] text-muted-foreground">{sub}</div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Th({ children, left, sub }: { children: React.ReactNode; left?: boolean; sub?: string }) {
  return (
    <th className={`sticky top-0 whitespace-nowrap border-b-[1.5px] border-border bg-secondary px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground ${left ? "text-left" : "text-right"}`}>
      {children}
      {sub && <small className="mt-0.5 block text-[9px] font-medium normal-case tracking-normal text-muted-foreground/60">{sub}</small>}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="whitespace-nowrap border-b border-border/60 px-4 py-2.5 text-right text-foreground">
      {children}
    </td>
  );
}

function PctCell({ pct, tone }: { pct: number; tone: "good" | "ok" | "bad" }) {
  const barColor = tone === "good" ? "bg-green-500" : tone === "ok" ? "bg-warning" : "bg-destructive/80";
  return (
    <span className="inline-grid items-center gap-2" style={{ gridTemplateColumns: "32px 56px" }}>
      <span className="text-right text-[11.5px] font-semibold tabular-nums">{pct} %</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-border">
        <i className={`block h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </span>
    </span>
  );
}

function DeltaChip({ delta, tone }: { delta: string; tone: "up" | "down" | "flat" }) {
  const styles = {
    up:   "bg-green-50 text-green-700",
    down: "bg-destructive/10 text-destructive",
    flat: "bg-secondary text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-[5px] px-[7px] py-[2px] text-[11px] font-semibold tabular-nums ${styles[tone]}`}>
      {delta}
    </span>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function LegendLine({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block w-3.5 border-b-[1.5px] border-dashed" style={{ borderColor: color }} />
      {label}
    </span>
  );
}
