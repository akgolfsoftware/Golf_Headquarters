/**
 * PILOT — CoachHQ Fasiliteter
 * Bygd fra wireframe/design-files-v2/02-fasiliteter-dark.html
 * URL: /fasiliteter-dark-demo
 *
 * Mock-data for Mulligan/GFGK/Bossum/WANG-fasiliteter.
 */
import {
  Copy,
  Download,
  Pencil,
  Plus,
  Search,
} from "lucide-react";

type FacilityStatus = "on" | "warn" | "off";

type Facility = {
  id: string;
  name: string;
  location: string;
  status: FacilityStatus;
  pct: number | null;
  pctLabel?: string;
  spark: { h: number; tone: "base" | "peak" | "primary" }[];
  selected?: boolean;
};

const FACILITIES: Facility[] = [
  {
    id: "studio-1",
    name: "Studio 1",
    location: "Mulligan Indoor Golf · Trackman 4",
    status: "on",
    pct: 82,
    selected: true,
    spark: [
      { h: 62, tone: "primary" },
      { h: 74, tone: "primary" },
      { h: 55, tone: "primary" },
      { h: 94, tone: "peak" },
      { h: 71, tone: "primary" },
      { h: 60, tone: "primary" },
      { h: 48, tone: "primary" },
    ],
  },
  {
    id: "studio-2",
    name: "Studio 2",
    location: "Mulligan Indoor Golf · Trackman 4",
    status: "on",
    pct: 71,
    spark: [
      { h: 42, tone: "base" },
      { h: 55, tone: "base" },
      { h: 38, tone: "base" },
      { h: 68, tone: "primary" },
      { h: 60, tone: "primary" },
      { h: 50, tone: "base" },
      { h: 35, tone: "base" },
    ],
  },
  {
    id: "studio-3",
    name: "Studio 3",
    location: "Mulligan Indoor Golf · Vedlikehold",
    status: "warn",
    pct: 12,
    spark: [
      { h: 20, tone: "base" },
      { h: 15, tone: "base" },
      { h: 8, tone: "base" },
      { h: 5, tone: "base" },
      { h: 5, tone: "base" },
      { h: 8, tone: "base" },
      { h: 12, tone: "base" },
    ],
  },
  {
    id: "studio-4",
    name: "Studio 4",
    location: "Mulligan Indoor Golf · Trackman 4",
    status: "on",
    pct: 74,
    spark: [
      { h: 48, tone: "base" },
      { h: 62, tone: "primary" },
      { h: 78, tone: "primary" },
      { h: 71, tone: "primary" },
      { h: 65, tone: "primary" },
      { h: 52, tone: "base" },
      { h: 40, tone: "base" },
    ],
  },
  {
    id: "range",
    name: "Range",
    location: "Gamle Fredrikstad GK · 24 baser",
    status: "on",
    pct: 68,
    spark: [
      { h: 35, tone: "base" },
      { h: 42, tone: "base" },
      { h: 58, tone: "primary" },
      { h: 64, tone: "primary" },
      { h: 70, tone: "primary" },
      { h: 80, tone: "primary" },
      { h: 95, tone: "peak" },
    ],
  },
  {
    id: "putting-green",
    name: "Putting-green",
    location: "Bossum Golfklubb · 6 hull",
    status: "on",
    pct: 52,
    spark: [
      { h: 28, tone: "base" },
      { h: 35, tone: "base" },
      { h: 40, tone: "base" },
      { h: 45, tone: "base" },
      { h: 58, tone: "primary" },
      { h: 62, tone: "primary" },
      { h: 55, tone: "primary" },
    ],
  },
  {
    id: "gym-a",
    name: "Gym A",
    location: "WANG Toppidrett · Styrkerom",
    status: "on",
    pct: 70,
    spark: [
      { h: 65, tone: "primary" },
      { h: 72, tone: "primary" },
      { h: 68, tone: "primary" },
      { h: 75, tone: "primary" },
      { h: 71, tone: "primary" },
      { h: 42, tone: "base" },
      { h: 30, tone: "base" },
    ],
  },
  {
    id: "bunker",
    name: "Bunker-grop",
    location: "Bossum Golfklubb · Inaktiv",
    status: "off",
    pct: null,
    pctLabel: "arkivert",
    spark: [
      { h: 5, tone: "base" },
      { h: 2, tone: "base" },
      { h: 2, tone: "base" },
      { h: 2, tone: "base" },
      { h: 2, tone: "base" },
      { h: 2, tone: "base" },
      { h: 2, tone: "base" },
    ],
  },
];

const WEEK_HOURS: { day: string; hours: string; closed?: boolean }[] = [
  { day: "Man", hours: "08–22" },
  { day: "Tir", hours: "08–22" },
  { day: "Ons", hours: "08–22" },
  { day: "Tor", hours: "08–22" },
  { day: "Fre", hours: "08–21" },
  { day: "Lør", hours: "10–20" },
  { day: "Søn", hours: "Lukket", closed: true },
];

const OCCUPANCY_WEEKS = [
  { label: "U 15", peak: 24, fill: 34, total: "58 %" },
  { label: "U 16", peak: 32, fill: 36, total: "68 %" },
  { label: "U 17", peak: 38, fill: 32, total: "70 %" },
  { label: "U 18", peak: 46, fill: 40, total: "86 %" },
  { label: "U 19", peak: 42, fill: 40, total: "82 %" },
];

export default function FasiliteterDarkDemo() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-8 py-8">
        {/* Hero */}
        <header className="mb-8 flex items-start justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              CoachHQ · Konfigurasjon
            </div>
            <h1 className="mt-2 font-display text-[36px] leading-[1.1] tracking-tight">
              <em className="font-normal italic">
                7 fasiliteter på 4 lokasjoner. Studio 3 trenger re-kalibrering.
              </em>
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              Sist endret 9. mai 2026 · Endringer logges i revisjonslogg
            </p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              <Download className="h-4 w-4" />
              Eksporter
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
              <Plus className="h-4 w-4" />
              Ny fasilitet
            </button>
          </div>
        </header>

        {/* KPI-strip */}
        <div className="mb-8 grid grid-cols-4 gap-4">
          <Kpi label="Aktive fasiliteter" value="7" foot="av 8 totalt · 1 i vedlikehold" />
          <Kpi label="Snitt-belegg" value="67" unit="%" delta="+4 pp" deltaTone="up" foot="siste 30 dager" />
          <Kpi
            label="Inntekt MTD"
            value="142 800"
            unit=" kr"
            delta="+12,4 %"
            deltaTone="up"
            foot="vs forrige måned"
          />
          <Kpi
            label="Vedlikehold påkrevd"
            value="1"
            valueTone="warning"
            foot="Studio 3 · Trackman re-kalibrering"
          />
        </div>

        {/* Master/detail */}
        <div className="grid grid-cols-[380px_1fr] gap-6 items-start">
          {/* Master list */}
          <div className="sticky top-6 flex flex-col overflow-hidden rounded-lg border border-border bg-card max-h-[calc(100vh-3rem)]">
            <div className="flex flex-col gap-3 border-b border-border px-5 py-4">
              <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-[13px] text-muted-foreground">
                <Search className="h-3.5 w-3.5" />
                <span>Søk fasilitet</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Alle", "Mulligan", "GFGK", "Bossum", "WANG"].map((c, i) => (
                  <Chip key={c} active={i === 0}>
                    {c}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {FACILITIES.map((f) => (
                <FacilityRow key={f.id} facility={f} />
              ))}
            </div>
            <div className="border-t border-border px-5 py-4">
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
                <Plus className="h-4 w-4" />
                Ny fasilitet
              </button>
            </div>
          </div>

          {/* Detail */}
          <div>
            {/* Detail header */}
            <div className="mb-8 flex items-end justify-between gap-6 border-b border-border pb-6">
              <div>
                <div className="mb-2 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  <Dot status="on" />
                  <span>Aktiv siden 12. september 2025</span>
                  <span>·</span>
                  <span>Mulligan Indoor Golf</span>
                </div>
                <h2 className="font-display text-[36px] italic leading-[1.15] tracking-tight">
                  Studio 1
                </h2>
                <div className="mt-2 text-[13.5px] text-muted-foreground">
                  Trackman-simulator · 4 personer · 24 m² · Sist redigert av Anders
                  Kristiansen 09.05.2026 kl 14:22
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
                  <Copy className="h-4 w-4" />
                  Dupliser
                </button>
                <button className="inline-flex items-center gap-2 rounded-md border border-destructive/20 bg-card px-3 py-2 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/5">
                  Arkiver
                </button>
                <button className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
                  <Pencil className="h-4 w-4" />
                  Rediger
                </button>
              </div>
            </div>

            {/* Grunnopplysninger */}
            <Section title="Grunnopplysninger" actionLabel="Endre">
              <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-card">
                <Field label="Type" value="Trackman-simulator" />
                <Field label="Kapasitet" value="4 personer" mono />
                <Field label="Areal" value="24 m²" mono />
                <Field label="Booking-økning" value="30 min" mono />
                <Field
                  label="Utstyr"
                  spanFull
                  value="Trackman 4 (sn. TM4-2024-014) · Mevo+ launch monitor · 3 putters (Scotty Cameron Phantom X) · iPad m/ TPS · projektor 4K · klimaanlegg"
                />
              </div>
            </Section>

            {/* Åpningstider */}
            <Section title="Åpningstider" actionLabel="Endre">
              <div className="grid grid-cols-7 gap-2">
                {WEEK_HOURS.map((d) => (
                  <div
                    key={d.day}
                    className={`rounded-md border border-border bg-card px-2 py-3 text-center ${
                      d.closed ? "bg-secondary/40" : ""
                    }`}
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      {d.day}
                    </div>
                    <div
                      className={`mt-1.5 font-mono text-[13px] font-medium ${
                        d.closed ? "italic text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {d.hours}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Pris-matrise */}
            <Section
              title="Pris-matrise"
              actionLabel="Endre"
              headerRight={
                <div className="inline-flex rounded-full border border-border bg-background p-0.5">
                  <button className="rounded-full bg-card px-3 py-1 text-[12px] font-medium text-foreground shadow-sm">
                    Standard
                  </button>
                  <button className="rounded-full px-3 py-1 text-[12px] font-medium text-muted-foreground">
                    Medlem
                  </button>
                </div>
              }
            >
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <table className="w-full border-collapse text-[13.5px]">
                  <thead>
                    <tr className="bg-secondary/40">
                      <th className="border-b border-border px-5 py-3 text-left font-mono text-[11px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
                        Tidsslot
                      </th>
                      <th className="border-b border-border px-5 py-3 text-right font-mono text-[11px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
                        Hverdag
                      </th>
                      <th className="border-b border-border px-5 py-3 text-right font-mono text-[11px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
                        Helg
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-b border-border px-5 py-3">
                        Off-peak{" "}
                        <span className="font-mono text-[11px] text-muted-foreground">
                          (08–15)
                        </span>
                      </td>
                      <td className="border-b border-border px-5 py-3 text-right font-mono font-medium">
                        450 kr / t
                      </td>
                      <td className="border-b border-border px-5 py-3 text-right font-mono font-medium">
                        550 kr / t
                      </td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3 font-medium text-primary">
                        Peak{" "}
                        <span className="font-mono text-[11px] text-muted-foreground">
                          (15–22)
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-medium text-primary">
                        650 kr / t
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-medium text-primary">
                        750 kr / t
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Belegg */}
            <Section
              title="Belegg · siste 30 dager"
              headerRight={
                <span className="text-[13px] text-muted-foreground">
                  Snitt 67 % · peak onsdag 17:00 (94 %)
                </span>
              }
            >
              <div className="flex h-40 items-end gap-4 rounded-lg border border-border bg-card p-6">
                {OCCUPANCY_WEEKS.map((w) => (
                  <div
                    key={w.label}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div className="flex w-full max-w-[48px] flex-1 flex-col-reverse gap-0.5 mx-auto">
                      <div
                        className="w-full rounded-sm bg-primary"
                        style={{ height: `${w.peak}%` }}
                      />
                      <div
                        className="w-full rounded-sm bg-primary/30"
                        style={{ height: `${w.fill}%` }}
                      />
                    </div>
                    <div className="font-mono text-[12px] font-medium">{w.total}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {w.label}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Inntekt MTD */}
            <Section title="Inntekt · måned hittil" actionLabel="Drill-down i Økonomi">
              <div className="flex items-center gap-8 rounded-lg border border-border bg-card p-6">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
                    Studio 1 · MTD
                  </div>
                  <div className="mt-1 font-mono text-[40px] font-medium leading-none tracking-tight">
                    47 200
                    <span className="text-[18px] font-normal text-muted-foreground">
                      {" "}
                      kr
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[12px]">
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary">
                      +18,2 %
                    </span>
                    <span className="text-muted-foreground">vs april MTD</span>
                  </div>
                </div>
                <div className="flex h-12 flex-1 items-end gap-0.5">
                  {[
                    32, 40, 55, 62, 48, 38, 42, 58, 64, 88, 72, 60, 50, 42, 55, 68, 74,
                    92, 80, 65, 48, 62, 72, 78, 96, 82, 70, 52, 58, 66,
                  ].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm ${
                        h >= 85
                          ? "bg-accent"
                          : h >= 60
                            ? "bg-primary/70"
                            : "bg-primary/20"
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  delta,
  deltaTone,
  valueTone,
  foot,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaTone?: "up" | "down";
  valueTone?: "warning";
  foot: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="font-mono text-[11px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-2 font-mono text-[32px] font-medium leading-none tracking-tight tabular-nums ${
          valueTone === "warning" ? "text-[#B8852A]" : "text-foreground"
        }`}
      >
        {value}
        {unit && (
          <span className="text-[14px] font-normal text-muted-foreground">{unit}</span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[12px]">
        {delta && (
          <span
            className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold ${
              deltaTone === "up"
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {delta}
          </span>
        )}
        <span className="text-muted-foreground">{foot}</span>
      </div>
    </div>
  );
}

function Chip({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-medium ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function Dot({ status }: { status: FacilityStatus }) {
  const cls =
    status === "on"
      ? "bg-primary"
      : status === "warn"
        ? "bg-[#B8852A]"
        : "bg-muted-foreground/40";
  return <span className={`inline-block h-2 w-2 rounded-full ${cls}`} />;
}

function FacilityRow({ facility }: { facility: Facility }) {
  return (
    <div
      className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 border-l-[3px] px-5 py-3.5 cursor-pointer transition-colors ${
        facility.selected
          ? "border-accent bg-accent/10"
          : "border-transparent hover:bg-secondary/40"
      }`}
    >
      <Dot status={facility.status} />
      <div>
        <div className="font-display text-[14px] font-semibold tracking-tight text-foreground">
          {facility.name}
        </div>
        <div className="mt-0.5 text-[11.5px] text-muted-foreground">
          {facility.location}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex h-4 w-16 items-end gap-[1.5px]">
          {facility.spark.map((s, i) => {
            const bg =
              s.tone === "peak"
                ? "bg-accent"
                : s.tone === "primary"
                  ? "bg-primary"
                  : "bg-muted-foreground/40";
            return (
              <span
                key={i}
                className={`flex-1 rounded-[1px] ${bg}`}
                style={{ height: `${Math.max(s.h, 4)}%` }}
              />
            );
          })}
        </div>
        <div className="font-mono text-[11px] text-muted-foreground tabular-nums">
          {facility.pct !== null ? `${facility.pct} %` : facility.pctLabel}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  actionLabel,
  headerRight,
  children,
}: {
  title: string;
  actionLabel?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-baseline justify-between">
        <div className="font-mono text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          {title}
        </div>
        <div className="flex items-center gap-4">
          {headerRight}
          {actionLabel && (
            <button className="text-[13px] font-medium text-primary hover:underline">
              {actionLabel} →
            </button>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  mono,
  spanFull,
}: {
  label: string;
  value: string;
  mono?: boolean;
  spanFull?: boolean;
}) {
  return (
    <div
      className={`border-b border-border px-5 py-4 last:border-b-0 ${
        spanFull ? "col-span-2" : "odd:border-r"
      }`}
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 text-[14.5px] font-medium text-foreground ${
          mono ? "font-mono" : ""
        } ${spanFull ? "text-[13.5px] font-normal leading-[1.6]" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
