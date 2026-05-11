/**
 * DEMO — Talent · Ressurser
 * Spec: docs/spec/talent/08-ressurser.md
 * URL: /talent-ressurser-demo
 *
 * Delt ressurs-bibliotek for Talent-modulen. Verktøy, baner,
 * proff-bibliotek, college-data, filer og dokumenter.
 */

import {
  Search,
  Calculator,
  Ruler,
  Layers,
  MapPin,
  Upload,
  FileText,
  Filter,
  ArrowRight,
} from "lucide-react";

type Tone = "muted" | "info" | "success" | "warning" | "primary";

const HISTORY_PILLS = [
  "Score-kalkulator",
  "PEI-distanse",
  "Bossum GK",
  "Sportsplan AK Golf 2026",
];

const PROFFER: { initials: string; name: string; year: string; primary?: boolean }[] = [
  { initials: "VH", name: "Viktor Hovland", year: "1997", primary: true },
  { initials: "KV", name: "Kristoffer Ventura", year: "1995" },
  { initials: "EG", name: "Espen Kofstad", year: "1987" },
  { initials: "MR", name: "Markus Roinås", year: "2009" },
  { initials: "AN", name: "Anders Nedrum", year: "2008" },
  { initials: "JV", name: "Joachim Vik", year: "2010" },
];

const COLLEGE = [
  { division: "Division I", count: 18, sub: "Bl.a. Arizona State, Florida, Oklahoma" },
  { division: "Division II", count: 14, sub: "Bl.a. Lynn, Nova Southeastern" },
  { division: "NAIA", count: 12, sub: "Bl.a. Keiser, William Carey" },
  { division: "Norske spillere totalt", count: 60, sub: "Aktive på US college mai 2026" },
];

const BANER = [
  { name: "Bossum GK", role: "Hyppigst", meta: "78 runder · siste 90 dager · Slope 132" },
  { name: "GFGK · Gamle Fredrikstad", role: "Hardest", meta: "Slope 138 · CR 73,4 · Par 71" },
  { name: "Oslo GK", role: "Lengste", meta: "6 412 m · gul tee · Par 72" },
];

const DOCS = [
  {
    eyebrow: "Sportsplan",
    title: "AK Golf 2026",
    meta: "PDF · 42 s. · oppdatert 02. mai 2026",
  },
  {
    eyebrow: "Utviklingsmodell",
    title: "Pyramide v2",
    meta: "PDF · 18 s. · revidert 14. apr 2026",
  },
  {
    eyebrow: "NGF · rammeverk",
    title: "Talent 2026",
    meta: "PDF · 26 s. · publisert 09. apr 2026",
  },
  {
    eyebrow: "Tester",
    title: "Test-batteri",
    meta: "PDF · 12 s. · Anders Kristiansen",
  },
];

export default function TalentRessurserDemo() {
  return (
    <div className="min-h-screen bg-[var(--color-card,#FFFFFF)] text-foreground">
      {/* Hero / page-header */}
      <header className="grid grid-cols-[1fr_auto] items-end gap-6 border-b border-border pb-5 pt-1 mb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Verktøy · Baner · Dokumenter
          </span>
          <h1 className="mt-1 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
            <em className="font-medium italic">Ressurser</em>
          </h1>
          <p className="mt-1.5 max-w-[520px] text-[13px] leading-[1.5] text-muted-foreground">
            Beregn, oversett, sammenlign. Ett sted for verktøy, bane-katalog,
            proff-bibliotek, college-data og delte dokumenter.
          </p>
        </div>
        <div className="relative w-[360px]">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <input
            type="search"
            placeholder="Søk i ressurser, baner, dokumenter…"
            className="w-full rounded-md border border-input bg-card pl-9 pr-3 py-2.5 text-[13px] placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </header>

      {/* Sist brukt */}
      <section className="mb-6">
        <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Sist brukt
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {HISTORY_PILLS.map((p) => (
            <Pill key={p} tone="muted">
              {p}
            </Pill>
          ))}
        </div>
      </section>

      {/* Row 1: Verktøy + Baner */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <Card eyebrow="Verktøy" title="Beregn, oversett, sammenlign" counter="3">
          <div className="grid grid-cols-3 gap-3">
            <ToolCard acronym="SD" title="Score-kalkulator" sub="Brutto → netto · slope/CR" icon={<Calculator className="h-5 w-5" strokeWidth={1.5} />} />
            <ToolCard acronym="PEI" title="PEI-distanse" sub="Carry → total · høyde/temp" icon={<Ruler className="h-5 w-5" strokeWidth={1.5} />} />
            <ToolCard acronym="L1–6" title="Nivå-klassifisering" sub="Klasse A · juniorpyramide" icon={<Layers className="h-5 w-5" strokeWidth={1.5} />} />
          </div>
        </Card>

        <Card eyebrow="Baner" title="Norske golfbaner" counter="128">
          <div className="flex flex-col gap-2.5">
            {BANER.map((b) => (
              <Lane key={b.name} {...b} />
            ))}
            <button className="mt-2 inline-flex items-center gap-1.5 self-end rounded-full border border-border bg-transparent px-3.5 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
              Åpne bane-katalog
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </Card>
      </div>

      {/* Row 2: Proff + College + Filer */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <Card eyebrow="Proff-bibliotek" title="9 norske proffer" counter="9">
          <div className="grid grid-cols-3 gap-3">
            {PROFFER.map((p) => (
              <ProffAvatar key={p.name} {...p} />
            ))}
          </div>
        </Card>

        <Card eyebrow="College" title="Norske på US-college" counter="60">
          <div className="flex flex-col gap-2">
            {COLLEGE.map((c) => (
              <div
                key={c.division}
                className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-[var(--line-soft,#EFEDE6)] bg-[var(--surface-alt,#F1EEE5)]/50 px-3.5 py-2.5"
              >
                <div>
                  <div className="text-[13px] font-semibold leading-tight">{c.division}</div>
                  <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{c.sub}</div>
                </div>
                <div className="font-mono text-[18px] font-medium tabular-nums leading-none">
                  {c.count}
                </div>
              </div>
            ))}
            <button className="mt-2 inline-flex items-center gap-1.5 self-end rounded-full border border-border bg-transparent px-3.5 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
              <Filter className="h-3.5 w-3.5" strokeWidth={1.5} />
              Filtrer
            </button>
          </div>
        </Card>

        <Card eyebrow="Filer" title="Delt opplasting" counter="0">
          <div className="flex h-full flex-col items-center justify-center rounded-md border border-dashed border-border bg-[var(--surface-alt,#F1EEE5)]/50 px-4 py-10 text-center">
            <Upload className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
            <div className="mt-3 text-[13px] font-medium">Slipp filer her</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">— eller —</div>
            <button className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
              Velg filer
            </button>
            <div className="mt-3 text-[11px] text-muted-foreground">
              Ingen opplastede filer ennå
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Dokumenter & rammeverk */}
      <Card eyebrow="Dokumenter & rammeverk" title="Delt bibliotek" counter="4">
        <div className="grid grid-cols-4 gap-3">
          {DOCS.map((d) => (
            <DocCard key={d.title} {...d} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function Pill({ tone = "muted", children }: { tone?: Tone; children: React.ReactNode }) {
  const styles: Record<Tone, string> = {
    info: "bg-primary/10 text-primary",
    success: "bg-[#E5F1EA] text-[#1A7D56]",
    warning: "bg-[#FFF0D6] text-[#B8852A]",
    muted: "bg-secondary text-muted-foreground",
    primary: "bg-primary text-primary-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function Card({
  eyebrow,
  title,
  counter,
  children,
}: {
  eyebrow: string;
  title: string;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {eyebrow}
          </div>
          <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
            <em className="font-medium italic">{title}</em>
          </h3>
        </div>
        {counter && (
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {counter}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function ToolCard({
  acronym,
  title,
  sub,
  icon,
}: {
  acronym: string;
  title: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <button className="group flex flex-col items-start gap-2 rounded-md border border-[var(--line-soft,#EFEDE6)] bg-[var(--surface-alt,#F1EEE5)]/50 px-3.5 py-4 text-left transition-colors hover:border-primary/40 hover:bg-[var(--surface-alt,#F1EEE5)]">
      <div className="flex w-full items-center justify-between text-muted-foreground">
        {icon}
        <span className="font-display text-[20px] font-medium italic text-foreground">
          {acronym}
        </span>
      </div>
      <div className="mt-1 text-[13px] font-semibold leading-tight">{title}</div>
      <div className="text-[11px] leading-tight text-muted-foreground">{sub}</div>
    </button>
  );
}

function Lane({ name, role, meta }: { name: string; role: string; meta: string }) {
  return (
    <div className="grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-md border border-[var(--line-soft,#EFEDE6)] bg-[var(--surface-alt,#F1EEE5)]/50 px-3.5 py-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
        <MapPin className="h-4 w-4" strokeWidth={1.5} />
      </div>
      <div>
        <div className="text-[13px] font-semibold leading-tight">{name}</div>
        <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{meta}</div>
      </div>
      <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {role}
      </span>
    </div>
  );
}

function ProffAvatar({
  initials,
  name,
  year,
  primary,
}: {
  initials: string;
  name: string;
  year: string;
  primary?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-md border border-[var(--line-soft,#EFEDE6)] bg-[var(--surface-alt,#F1EEE5)]/50 px-2 py-3 text-center">
      <div
        className={`grid h-12 w-12 place-items-center rounded-full font-display text-[16px] font-semibold ${
          primary ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
        }`}
      >
        {initials}
      </div>
      <div className="mt-1 text-[11px] font-semibold leading-tight">{name}</div>
      <div className="font-mono text-[10px] text-muted-foreground">{year}</div>
    </div>
  );
}

function DocCard({
  eyebrow,
  title,
  meta,
}: {
  eyebrow: string;
  title: string;
  meta: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-[var(--line-soft,#EFEDE6)] bg-[var(--surface-alt,#F1EEE5)]/50 px-4 py-4">
      <div className="flex items-center justify-between">
        <FileText className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {eyebrow}
        </span>
      </div>
      <div className="font-display text-[18px] font-semibold italic leading-tight">{title}</div>
      <div className="text-[11px] leading-tight text-muted-foreground">{meta}</div>
    </div>
  );
}
