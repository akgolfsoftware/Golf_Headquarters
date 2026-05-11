/**
 * PILOT — CoachHQ Kapasitet · denne uka
 * Bygd direkte fra wireframe/design-files-v2/06-dark-kapasitet.html
 * URL: /kapasitet-dark-demo
 *
 * Mock-data for uke 19 · 11.–17. mai 2026. Bytt til Prisma-henting senere.
 */

import { Download, Grid3x3, ChevronDown, Lightbulb } from "lucide-react";

type Facility = {
  name: string;
  meta: string;
  values: number[];
  avg: string;
};

const FACILITIES: Facility[] = [
  {
    name: "Studio 1",
    meta: "Mulligan · sim",
    values: [12, 28, 45, 72, 52, 68, 38, 58, 74, 78, 88, 94, 98, 88, 72, 42, 22],
    avg: "64 %",
  },
  {
    name: "Studio 2",
    meta: "Mulligan · sim",
    values: [8, 22, 42, 66, 48, 54, 32, 50, 68, 76, 86, 92, 96, 82, 66, 38, 18],
    avg: "59 %",
  },
  {
    name: "Studio 3",
    meta: "Mulligan · sim",
    values: [5, 18, 28, 54, 44, 48, 28, 38, 62, 72, 78, 86, 88, 76, 62, 34, 14],
    avg: "52 %",
  },
  {
    name: "Studio 4",
    meta: "Mulligan · sim",
    values: [-1, -1, 22, 42, 36, 44, 24, 34, 56, 68, 74, 78, 84, 72, 58, 28, 10],
    avg: "47 %",
  },
  {
    name: "GFGK Range",
    meta: "utendørs · 6 bays",
    values: [4, 26, 48, 68, 72, 76, 52, 58, 72, 82, 88, 96, 98, 86, 68, 42, 18],
    avg: "71 %",
  },
  {
    name: "Bossum Driving",
    meta: "utendørs · 12 bays",
    values: [2, 18, 34, 52, 58, 62, 44, 52, 66, 74, 82, 88, 78, 68, 52, 28, 8],
    avg: "56 %",
  },
  {
    name: "WANG-hallen",
    meta: "innendørs · putte",
    values: [8, 24, 42, 62, 52, 68, 48, 54, 72, 78, 88, 94, 92, 84, 72, 62, 38],
    avg: "62 %",
  },
];

const HOURS = ["06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"];

function cellClass(v: number): string {
  if (v < 0) {
    return "text-muted-foreground bg-[repeating-linear-gradient(135deg,var(--color-muted)_0_4px,var(--color-card)_4px_8px)]";
  }
  if (v < 20) return "bg-muted text-muted-foreground";
  if (v < 35) return "bg-[rgba(209,248,67,0.18)] text-foreground";
  if (v < 55) return "bg-[rgba(209,248,67,0.40)] text-foreground";
  if (v < 75) return "bg-[rgba(209,248,67,0.68)] text-foreground";
  if (v < 95) return "bg-accent text-accent-foreground font-semibold";
  return "bg-primary text-primary-foreground font-semibold";
}

export default function KapasitetDarkDemo() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="px-8 py-8 pb-12 lg:px-10">
        {/* Header */}
        <header className="mb-6 flex items-start justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              /admin/kapasitet
            </span>
            <h1 className="mt-2 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
              Kapasitet <em className="font-medium italic text-muted-foreground">· denne uka</em>
            </h1>
            <p className="mt-2 font-display text-[15px] italic text-muted-foreground">
              Onsdag kveld er stappfullt. Tirsdag formiddag er død.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              <Download className="h-4 w-4" />
              Eksporter
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
              <Grid3x3 className="h-4 w-4" />
              Bulk-blokker tider
            </button>
          </div>
        </header>

        {/* KPI strip */}
        <section className="mb-5 grid grid-cols-4 gap-4">
          <Kpi label="Snitt-belegg · denne uka" value="67" unit="%" meta="+4,2 pp vs forrige uke" metaTone="up" />
          <Kpi label="Overbookede slots" value="4" valueColor="primary" meta="> 95 % belegg · risiko" />
          <Kpi label="Underbookede" value="11" meta="< 20 % belegg · selg disse" />
          <Kpi label="Inntekt · MTD" value="142 800" unit=" kr" meta="+12 % vs forrige mnd" metaTone="up" />
        </section>

        {/* Filter bar */}
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
          <div className="inline-flex overflow-hidden rounded-md border border-border">
            <SegBtn>I dag</SegBtn>
            <SegBtn active>Denne uka</SegBtn>
            <SegBtn>Denne mnd</SegBtn>
            <SegBtn>Snitt 90d</SegBtn>
          </div>
          <Divider />
          <Chip active>
            Alle fasiliteter <span className="ml-1 font-mono text-[10px] text-muted-foreground">7</span>
          </Chip>
          <Chip>Studio 1–4</Chip>
          <Chip>Range</Chip>
          <Chip>Bossum</Chip>
          <Chip>WANG</Chip>
          <Divider />
          <Chip>Hverdag</Chip>
          <Chip>Helg</Chip>
          <span className="flex-1" />
          <span className="text-[12px] text-muted-foreground">Sortering:</span>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
            Belegg-prosent
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Heatmap + right rail */}
        <div className="grid grid-cols-[1fr_336px] items-start gap-6">
          {/* Heatmap card */}
          <section className="rounded-lg border border-border bg-card px-6 py-5">
            <div className="mb-4 flex items-end justify-between gap-6">
              <div>
                <h2 className="font-display text-[20px] font-semibold leading-snug tracking-tight">
                  Belegg per fasilitet × time
                </h2>
                <div className="mt-1 text-[12px] text-muted-foreground">
                  Uke 19 · 11.–17. mai 2026 · 17 timer × 7 fasiliteter
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span>0 %</span>
                <span className="inline-flex h-3.5 items-center gap-0.5">
                  <span className="h-3.5 w-4 bg-muted" />
                  <span className="h-3.5 w-4 bg-[rgba(209,248,67,0.18)]" />
                  <span className="h-3.5 w-4 bg-[rgba(209,248,67,0.40)]" />
                  <span className="h-3.5 w-4 bg-[rgba(209,248,67,0.68)]" />
                  <span className="h-3.5 w-4 bg-accent" />
                  <span className="h-3.5 w-4 bg-primary" />
                </span>
                <span>100 %</span>
              </div>
            </div>

            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: "132px repeat(17, 1fr) 64px" }}
            >
              <div />
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="py-1 text-center font-mono text-[10px] font-medium text-muted-foreground"
                >
                  {h}
                </div>
              ))}
              <div className="py-1 text-center font-mono text-[10px] font-medium text-muted-foreground">
                Snitt
              </div>

              {FACILITIES.map((f) => (
                <FacilityRow key={f.name} f={f} />
              ))}
            </div>
            <div className="mt-3 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Time (06:00 – 22:00)
            </div>
          </section>

          {/* Right rail */}
          <aside className="sticky top-6 flex flex-col gap-4">
            <RailCard title="Topp 3 mest brukte tider">
              <RankRow rank="1" label="Onsdag 17–20" sub="GFGK Range · WANG" value="94 %" />
              <RankRow rank="2" label="Tirsdag 18–20" sub="Studio 1–2" value="92 %" />
              <RankRow rank="3" label="Torsdag 17–19" sub="Bossum · Range" value="88 %" />
            </RailCard>

            <RailCard title="Topp 3 minst brukte tider">
              <RankRow rank="1" label="Tirsdag 09–11" sub="Studio 3 · Bossum" value="12 %" dim />
              <RankRow rank="2" label="Mandag 06–08" sub="alle fasiliteter" value="14 %" dim />
              <RankRow rank="3" label="Søndag 21–22" sub="alle fasiliteter" value="8 %" dim />
            </RailCard>

            {/* Insight */}
            <div className="rounded-lg border border-border bg-accent/15 p-4">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent-foreground">
                <Lightbulb className="h-3.5 w-3.5" />
                Foreslått tiltak
              </div>
              <h4 className="mt-2 font-display text-[15px] font-semibold leading-snug">
                Senk pris med 15 % på onsdag 09–11 for å løfte belegg fra 28 % til ~55 %.
              </h4>
              <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
                Modellen vurderer at priselastisitet er høy hverdager formiddag. Estimert ekstra inntekt:{" "}
                <b className="font-semibold text-foreground">4 200 kr / uke</b>.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
                  Anvend
                </button>
                <button className="inline-flex items-center rounded-md px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary">
                  Avvis
                </button>
              </div>
            </div>

            {/* Revenue card */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Inntekt · uke 19
              </div>
              <div className="mt-1.5 font-mono text-[34px] font-medium leading-none tabular-nums -tracking-tight">
                38 400
                <span className="ml-1 text-[14px] font-normal text-muted-foreground">kr</span>
              </div>
              <div className="mt-2 font-mono text-[12px] text-[var(--color-pyr-tek,#1A7D56)]">
                +2 400 kr vs forrige uke
              </div>
              <div className="mt-3 flex h-9 items-end gap-1">
                {[42, 58, 72, 88, 76, 64, 32].map((h, i) => (
                  <span
                    key={i}
                    className={`flex-1 rounded-sm ${i === 3 ? "bg-primary" : "bg-primary/30"}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 font-mono text-[10px] text-muted-foreground">
                <span>man</span>
                <span>tir</span>
                <span>ons</span>
                <span>tor</span>
                <span>fre</span>
                <span>lør</span>
                <span>søn</span>
              </div>
            </div>
          </aside>
        </div>

        <footer className="mt-10 flex items-center justify-between border-t border-border pt-6 text-[12px] text-muted-foreground">
          <span>AK Golf Platform · CoachHQ · /admin/kapasitet</span>
          <span className="font-mono">Uke 19/52 · sist oppdatert 14:32</span>
        </footer>
      </div>
    </div>
  );
}

function FacilityRow({ f }: { f: Facility }) {
  return (
    <>
      <div className="flex flex-col justify-center px-3 py-1">
        <div className="text-[13px] font-medium leading-tight">{f.name}</div>
        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{f.meta}</div>
      </div>
      {f.values.map((v, i) => (
        <div
          key={i}
          className={`grid aspect-square place-items-center rounded-sm font-mono text-[10px] tabular-nums ${cellClass(v)}`}
        >
          {v < 0 ? "—" : v}
        </div>
      ))}
      <div className="grid place-items-center rounded-sm bg-secondary font-mono text-[12px] font-semibold tabular-nums">
        {f.avg}
      </div>
    </>
  );
}

function Kpi({
  label,
  value,
  unit,
  meta,
  metaTone,
  valueColor,
}: {
  label: string;
  value: string;
  unit?: string;
  meta?: string;
  metaTone?: "up";
  valueColor?: "primary";
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-2 font-mono text-[30px] font-medium leading-none tabular-nums -tracking-tight ${
          valueColor === "primary" ? "text-primary" : ""
        }`}
      >
        {value}
        {unit && <small className="text-[14px] font-normal text-muted-foreground">{unit}</small>}
      </div>
      {meta && (
        <div
          className={`mt-2 text-[11px] ${
            metaTone === "up" ? "text-[var(--color-pyr-tek,#1A7D56)]" : "text-muted-foreground"
          }`}
        >
          {meta}
        </div>
      )}
    </div>
  );
}

function SegBtn({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <button
      className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Chip({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium ${
        active
          ? "bg-foreground text-background"
          : "border border-border bg-card text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function Divider() {
  return <span className="mx-1 h-6 w-px bg-border" />;
}

function RailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

function RankRow({
  rank,
  label,
  sub,
  value,
  dim,
}: {
  rank: string;
  label: string;
  sub: string;
  value: string;
  dim?: boolean;
}) {
  return (
    <div className="grid grid-cols-[24px_1fr_auto] items-center gap-3 border-t border-border py-2.5 first:border-t-0 first:pt-0">
      <span className="font-mono text-[12px] font-semibold text-muted-foreground">{rank}</span>
      <div>
        <div className="text-[13px] leading-tight">{label}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>
      </div>
      <span
        className={`font-mono text-[13px] font-semibold tabular-nums ${
          dim ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
