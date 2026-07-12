/**
 * PILOT — AgencyOS Plan-bygger · Wizard (6 steg)
 * Dynamic route: /demos/plan-bygger/[1..6] (under (internal) → ADMIN-only)
 * Bygd direkte fra wireframe/design-files-v2/coachhq-A/02-plan-bygger-steg-{1,2,3,5,6}.html + 02-plan-bygger.html
 *
 * Mock-data for Øyvind Rohjan mot Sørlandsåpent 2026. Bytt til Prisma-henting senere.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Search, Send, Sparkles } from "lucide-react";

type StegId = "1" | "2" | "3" | "4" | "5" | "6";

const VALID_STEG: readonly StegId[] = ["1", "2", "3", "4", "5", "6"] as const;

type StegMeta = {
  num: StegId;
  name: string;
  shortSub: string;
  navSub: string;
};

const STEPS: readonly StegMeta[] = [
  { num: "1", name: "Spiller", shortSub: "Øyvind R.", navSub: "Velg nå" },
  { num: "2", name: "Periode", shortSub: "8 uker", navSub: "8 ukers default" },
  { num: "3", name: "Faser", shortSub: "5 faser", navSub: "Auto-foreslås" },
  { num: "4", name: "Pyramide", shortSub: "Allokert", navSub: "Drag-allokering" },
  { num: "5", name: "Økt-skjelett", shortSub: "24 økter", navSub: "Auto-bygges" },
  { num: "6", name: "Bekreft", shortSub: "Klar", navSub: "Send til spiller" },
];

export default async function PlanByggerStegPage({
  params,
}: {
  params: Promise<{ steg: string }>;
}) {
  const { steg } = await params;
  if (!VALID_STEG.includes(steg as StegId)) notFound();
  const current = steg as StegId;

  return (
    <div className="min-h-screen bg-[var(--surface,#FAFAF7)] text-foreground">
      <main className="mx-auto max-w-[1240px] px-8 py-8">
        <PageHead current={current} />
        <StepStripe current={current} />
        {current === "1" && <Step1 />}
        {current === "2" && <Step2 />}
        {current === "3" && <Step3 />}
        {current === "4" && <Step4 />}
        {current === "5" && <Step5 />}
        {current === "6" && <Step6 />}
        <FooterBar current={current} />
      </main>
    </div>
  );
}

/* ============================================================
   FELLES SHELL
   ============================================================ */

function PageHead({ current }: { current: StegId }) {
  const heads: Record<StegId, { eyebrow: string; title: React.ReactNode; lede: string }> = {
    "1": {
      eyebrow: "Treningsplaner · Ny plan · Steg 1 av 6",
      title: (
        <>
          <em className="font-medium italic">Velg spiller</em> for ny plan
        </>
      ),
      lede:
        "Hvem skal planen lages for? Du kan filtrere etter kategori eller søke direkte. Periodiserings-agent leser spillerens 30-dagers historikk når du velger.",
    },
    "2": {
      eyebrow: "Treningsplaner · Ny plan · Øyvind Rohjan · Steg 2 av 6",
      title: (
        <>
          <em className="font-medium italic">Sett periode</em> og hovedmål
        </>
      ),
      lede:
        "Start, slutt og peak. Periodiserings-agent foreslår 8 ukers periode mot første turnering i kalenderen.",
    },
    "3": {
      eyebrow: "Treningsplaner · Ny plan · Øyvind Rohjan · Steg 3 av 6",
      title: (
        <>
          <em className="font-medium italic">Strukturér faser</em> for perioden
        </>
      ),
      lede:
        "Periodiserings-agent har foreslått 5 faser basert på Øyvind' 30-dagers historikk og peak 2. juni. Dra for å justere lengder, eller godta forslaget.",
    },
    "4": {
      eyebrow: "Treningsplaner · Ny plan · Øyvind Rohjan · Kategori A · HCP +2,4",
      title: (
        <>
          <em className="font-medium italic">Bygg ny plan</em> · Sørlandsåpent 2026
        </>
      ),
      lede:
        "Wizard med 6 steg. Periodiserings-agent foreslår faser og pyramide-allokasjon basert på turneringsdato, kursprofil og spillerens SG-trender.",
    },
    "5": {
      eyebrow: "Treningsplaner · Ny plan · Øyvind Rohjan · Steg 5 av 6",
      title: (
        <>
          <em className="font-medium italic">Økt-skjelett</em> — 24 økter generert
        </>
      ),
      lede:
        "Periodiserings-agent har bygd 24 økter fordelt over 8 uker. Hver økt er allokert pyramidefokus i tråd med fasen. Du kan redigere enkeltøkter eller godkjenne hele skjelettet.",
    },
    "6": {
      eyebrow: "Treningsplaner · Ny plan · Øyvind Rohjan · Steg 6 av 6",
      title: (
        <>
          <em className="font-medium italic">Gjennomgå og send</em> til Øyvind
        </>
      ),
      lede:
        "Siste sjekk før planen aktiveres. Øyvind får varsel i appen og en kort beskjed via e-post. Plan-status: utkast.",
    },
  };
  const h = heads[current];
  return (
    <header className="mb-6">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {h.eyebrow}
      </span>
      <h1 className="mt-1 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
        {h.title}
      </h1>
      <p className="mt-2 max-w-[760px] text-[13px] leading-[1.55] text-muted-foreground">
        {h.lede}
      </p>
    </header>
  );
}

function StepStripe({ current }: { current: StegId }) {
  const currentIdx = STEPS.findIndex((s) => s.num === current);
  return (
    <div className="mb-6 grid grid-cols-6 gap-2">
      {STEPS.map((s, idx) => {
        const state: "done" | "current" | "todo" =
          idx < currentIdx ? "done" : idx === currentIdx ? "current" : "todo";
        const sub = state === "done" ? s.shortSub : state === "current" ? s.navSub : s.navSub;
        return <StepCard key={s.num} num={s.num} name={s.name} sub={sub} state={state} />;
      })}
    </div>
  );
}

function StepCard({
  num,
  name,
  sub,
  state,
}: {
  num: string;
  name: string;
  sub: string;
  state: "done" | "current" | "todo";
}) {
  const isCurrent = state === "current";
  const isDone = state === "done";
  return (
    <div
      className={`relative rounded-[14px] bg-card px-4 py-4 ${
        isCurrent ? "border-2 border-accent" : "border border-border"
      }`}
    >
      <div
        className={`mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-[12px] font-semibold leading-none ${
          isDone
            ? "bg-[var(--brand-primary,#005840)] text-white"
            : isCurrent
              ? "bg-accent text-[var(--brand-accent-on,#005840)]"
              : "bg-[var(--surface-alt,#F1EEE5)] text-muted-foreground"
        }`}
      >
        {num}
      </div>
      <div className="text-[13px] font-semibold leading-tight text-foreground">{name}</div>
      <div className="mt-1 text-[11px] leading-[1.3] text-muted-foreground">{sub}</div>
      {isDone && (
        <Check
          className="absolute right-3 top-3 h-4 w-4 text-[var(--brand-primary,#005840)]"
          strokeWidth={2.5}
        />
      )}
    </div>
  );
}

function FooterBar({ current }: { current: StegId }) {
  const idx = Number(current);
  const prev = idx > 1 ? String(idx - 1) : null;
  const next = idx < 6 ? String(idx + 1) : null;

  const prevLabels: Record<number, string> = {
    2: "← Spiller",
    3: "← Periode",
    4: "← Faser",
    5: "← Pyramide",
    6: "← Økt-skjelett",
  };
  const nextLabels: Record<number, string> = {
    1: "Neste: Periode →",
    2: "Neste: Faser →",
    3: "Neste: Pyramide →",
    4: "Neste: Økt-skjelett →",
    5: "Neste: Bekreft →",
  };

  return (
    <div className="mt-6 flex items-center justify-between gap-2.5 border-t border-border pt-4">
      <div className="flex gap-2.5">
        <button className="inline-flex items-center rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
          Avbryt
        </button>
        {idx > 1 && (
          <button className="inline-flex items-center rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
            Lagre utkast
          </button>
        )}
      </div>
      <div className="flex gap-2.5">
        {prev ? (
          <Link
            href={`/demos/plan-bygger/${prev}`}
            className="inline-flex items-center rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            {prevLabels[idx]}
          </Link>
        ) : (
          <button
            disabled
            className="inline-flex cursor-not-allowed items-center rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground opacity-40"
          >
            ← Tilbake
          </button>
        )}
        {next ? (
          <Link
            href={`/demos/plan-bygger/${next}`}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {nextLabels[idx]}
          </Link>
        ) : (
          <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            <Send className="h-3.5 w-3.5" strokeWidth={1.8} />
            Send til Øyvind
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   STEG 1 — Velg spiller
   ============================================================ */

function Step1() {
  return (
    <section className="rounded-2xl border border-border bg-card px-6 py-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Mine 38 elever
          </div>
          <h3 className="mt-1 font-display text-[20px] font-bold leading-tight tracking-tight">
            Hvem skal planen lages for?
          </h3>
          <p className="mt-1 max-w-[520px] text-[12px] leading-[1.5] text-muted-foreground">
            Filtrer etter kategori, søk på navn, eller bruk forslag basert på hvem som mangler aktiv
            plan.
          </p>
        </div>
        <div className="flex gap-2">
          <FilterChip label="Kategori A" count={6} />
          <FilterChip label="Kategori B" count={12} />
          <FilterChip label="Junior" count={14} />
        </div>
      </div>

      <div className="relative mb-6">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
        <input
          placeholder="Søk på navn …"
          className="w-full rounded-md border border-input bg-background px-4 py-2 pl-10 text-[14px] leading-none"
        />
      </div>

      <div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        Foreslått — mangler aktiv plan
      </div>
      <div className="mb-6 grid grid-cols-3 gap-2">
        <PlayerPickCard initial="Ø" name="Øyvind Rohjan" pill="Kat A" sub="HCP +2,4" selected />
        <PlayerPickCard initial="H" name="Henrik Nilsen" pill="Pro" sub="HCP 8,7" />
        <PlayerPickCard initial="A" name="Anna Karlsen" pill="Free" sub="HCP 16,8" bg="hsl(var(--warning))" />
      </div>

      <div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        Alle elever — kategori A og B
      </div>
      <div className="grid grid-cols-3 gap-2">
        <PlayerPickCard initial="Ø" name="Mads Rønning" pill="Pro" sub="HCP 9,4" bg="hsl(var(--success))" />
        <PlayerPickCard initial="L" name="Lise Sandberg" pill="Free" sub="HCP 19,5" bg="hsl(var(--muted-foreground))" />
        <PlayerPickCard
          initial="J"
          name="Joachim Tangen"
          pill="Skadet"
          sub="HCP 14,2"
          bg="hsl(var(--destructive))"
          dimmed
        />
      </div>
    </section>
  );
}

function FilterChip({ label, count }: { label: string; count: number }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-4 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
      {label}
      <span className="text-muted-foreground">{count}</span>
    </button>
  );
}

function PlayerPickCard({
  initial,
  name,
  pill,
  sub,
  selected = false,
  bg = "hsl(var(--primary))",
  dimmed = false,
}: {
  initial: string;
  name: string;
  pill: string;
  sub: string;
  selected?: boolean;
  bg?: string;
  dimmed?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl bg-card p-4 ${
        selected
          ? "border-2 border-accent bg-[color-mix(in srgb, var(--v2-lime) 8%, transparent)]"
          : "border border-border hover:bg-secondary/40"
      } ${dimmed ? "opacity-50" : ""}`}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-display text-[14px] font-semibold text-white"
        style={{ background: bg }}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold leading-tight">{name}</div>
        <div className="mt-1 flex items-center gap-2 text-[11px] leading-none text-muted-foreground">
          <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-foreground">
            {pill}
          </span>
          <span>{sub}</span>
        </div>
      </div>
      <div
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
          selected
            ? "border-2 border-accent bg-accent text-[var(--brand-accent-on,#005840)]"
            : "border-2 border-border"
        }`}
      >
        {selected && <Check className="h-3 w-3" strokeWidth={2.5} />}
      </div>
    </div>
  );
}

/* ============================================================
   STEG 2 — Periode
   ============================================================ */

function Step2() {
  return (
    <>
      <AgentStrip
        label="Periodiserings-agent"
        body={
          <>
            <b className="font-semibold">Foreslår 8 ukers periode</b> — Sørlandsåpent 2.–4. juni er
            Øyvind&apos; første A-turnering. Anbefaler peak 2. juni med 2 ukers base + 1
            forberedelse + 3 spesifikk + 3 d taper.
          </>
        }
      />

      <div className="grid grid-cols-[1fr_360px] gap-6">
        <section className="rounded-2xl border border-border bg-card px-6 py-6">
          <div className="mb-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Mai – juli 2026
            </div>
            <h3 className="mt-1 font-display text-[20px] font-bold leading-tight tracking-tight">
              Velg periode og peak
            </h3>
            <p className="mt-1 max-w-[500px] text-[12px] leading-[1.5] text-muted-foreground">
              Klikk start, deretter slutt. Marker peak (turneringsdato) ved å holde inne ⌘ og
              klikke.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MiniCal title="Mai 2026" weeks="u 18–22" month="mai" />
            <MiniCal title="Juni 2026" weeks="u 23–27" month="jun" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <Preset label="4 uker" sub="Sprint-prep" />
            <Preset label="6 uker" sub="Comeback" />
            <Preset label="8 uker" sub="Turneringsprep" active />
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <SideCard title="Spiller">
            <PlayerMini />
          </SideCard>
          <SideCard title="Valgt periode">
            <StatRow label="Start" value="9. mai 2026" />
            <StatRow label="Slutt" value="30. jun 2026" />
            <StatRow label="Varighet" value="8 uker" />
            <StatRow label="Peak" value="2.–4. jun" tone="success" last />
          </SideCard>
          <SideCard title="Turneringer i perioden">
            <StatRow label="Sørlandsåpent" value="02.06" />
            <StatRow label="NM-kvalik" value="21.06" />
            <StatRow label="Klubbmesterskap" value="28.06" last />
          </SideCard>
        </aside>
      </div>
    </>
  );
}

function MiniCal({ title, weeks, month }: { title: string; weeks: string; month: "mai" | "jun" }) {
  const isMai = month === "mai";
  const days: { d: number; state?: "muted" | "start" | "in-range" | "end" | "peak" }[] = isMai
    ? [
        { d: 28, state: "muted" },
        { d: 29, state: "muted" },
        { d: 30, state: "muted" },
        { d: 1 },
        { d: 2 },
        { d: 3 },
        { d: 4 },
        { d: 5 },
        { d: 6 },
        { d: 7 },
        { d: 8 },
        { d: 9, state: "start" },
        { d: 10, state: "in-range" },
        { d: 11, state: "in-range" },
        { d: 12, state: "in-range" },
        { d: 13, state: "in-range" },
        { d: 14, state: "in-range" },
        { d: 15, state: "in-range" },
        { d: 16, state: "in-range" },
        { d: 17, state: "in-range" },
        { d: 18, state: "in-range" },
        { d: 19, state: "in-range" },
        { d: 20, state: "in-range" },
        { d: 21, state: "in-range" },
        { d: 22, state: "in-range" },
        { d: 23, state: "in-range" },
        { d: 24, state: "in-range" },
        { d: 25, state: "in-range" },
        { d: 26, state: "in-range" },
        { d: 27, state: "in-range" },
        { d: 28, state: "in-range" },
        { d: 29, state: "in-range" },
        { d: 30, state: "in-range" },
        { d: 31, state: "in-range" },
        { d: 1, state: "muted" },
      ]
    : [
        { d: 1, state: "in-range" },
        { d: 2, state: "peak" },
        { d: 3, state: "peak" },
        { d: 4, state: "peak" },
        { d: 5, state: "in-range" },
        { d: 6, state: "in-range" },
        { d: 7, state: "in-range" },
        { d: 8, state: "in-range" },
        { d: 9, state: "in-range" },
        { d: 10, state: "in-range" },
        { d: 11, state: "in-range" },
        { d: 12, state: "in-range" },
        { d: 13, state: "in-range" },
        { d: 14, state: "in-range" },
        { d: 15, state: "in-range" },
        { d: 16, state: "in-range" },
        { d: 17, state: "in-range" },
        { d: 18, state: "in-range" },
        { d: 19, state: "in-range" },
        { d: 20, state: "in-range" },
        { d: 21, state: "in-range" },
        { d: 22, state: "in-range" },
        { d: 23, state: "in-range" },
        { d: 24, state: "in-range" },
        { d: 25, state: "in-range" },
        { d: 26, state: "in-range" },
        { d: 27, state: "in-range" },
        { d: 28, state: "in-range" },
        { d: 29, state: "in-range" },
        { d: 30, state: "end" },
        { d: 1 },
        { d: 2 },
        { d: 3 },
        { d: 4 },
        { d: 5 },
      ];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-display text-[14px] font-semibold leading-none">{title}</h4>
        <span className="font-mono text-[11px] text-muted-foreground">{weeks}</span>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {["M", "T", "O", "T", "F", "L", "S"].map((dn, i) => (
          <div
            key={i}
            className="py-1.5 text-center font-mono text-[9px] font-semibold uppercase tracking-[0.05em] text-muted-foreground"
          >
            {dn}
          </div>
        ))}
        {days.map((c, i) => {
          const base =
            "aspect-square flex items-center justify-center font-mono text-[12px] tabular-nums leading-none cursor-pointer rounded-md";
          let cls = base;
          if (c.state === "muted") cls += " text-muted-foreground/50";
          else if (c.state === "start" || c.state === "end")
            cls += " bg-[var(--brand-primary,#005840)] text-white font-semibold";
          else if (c.state === "in-range") cls += " bg-[rgba(0,88,64,0.10)] rounded-none";
          else if (c.state === "peak")
            cls +=
              " bg-accent text-[var(--brand-accent-on,#005840)] font-bold outline outline-2 -outline-offset-2 outline-accent";
          else cls += " hover:bg-secondary";
          return (
            <div key={i} className={cls}>
              {c.d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Preset({ label, sub, active = false }: { label: string; sub: string; active?: boolean }) {
  return (
    <button
      className={`rounded-md border px-4 py-2.5 text-center transition-colors ${
        active
          ? "border-[var(--brand-primary,#005840)] bg-[var(--brand-primary,#005840)] text-white"
          : "border-border bg-background hover:bg-secondary"
      }`}
    >
      <div className="text-[12px] font-semibold leading-none">{label}</div>
      <div className="mt-1 text-[10px] leading-none opacity-70">{sub}</div>
    </button>
  );
}

/* ============================================================
   STEG 3 — Faser
   ============================================================ */

function Step3() {
  return (
    <>
      <AgentStrip
        label="Periodiserings-agent · forslag"
        body={
          <>
            <b className="font-semibold">5-faset modell mot peak 2. juni</b> — kort base for å
            gjenoppta volum etter 4 ukers off-season, deretter forberedelse og 3 ukers
            turneringsspesifikk skill-blokk. 3 dagers taper sikrer recovery rett før peak. Konfidens
            87 %.
          </>
        }
      />

      <section className="rounded-2xl border border-border bg-card px-6 py-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              5 faser · 8 uker · totalt 56 dager
            </div>
            <h3 className="mt-1 font-display text-[20px] font-bold leading-tight tracking-tight">
              Foreslått fase-struktur
            </h3>
            <p className="mt-1 max-w-[500px] text-[12px] leading-[1.5] text-muted-foreground">
              Dra fasekant for å justere lengde. Vekta og fokus settes i steg 4.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center rounded-md border border-border bg-transparent px-4 py-1.5 text-[12px] font-medium hover:bg-secondary">
              + Legg til fase
            </button>
            <button className="inline-flex items-center rounded-md border border-border bg-transparent px-4 py-1.5 text-[12px] font-medium hover:bg-secondary">
              Tilbakestill
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex h-14 overflow-hidden rounded-xl border border-border">
            <PhaseSeg flex={14} bg="rgba(46,142,255,0.18)" color="#2E8EFF" name="Base" days="14 d" />
            <PhaseSeg
              flex={7}
              bg="rgba(255,150,46,0.22)"
              color="#FF962E"
              name="Forberedelse"
              days="7 d"
            />
            <PhaseSeg
              flex={21}
              bg="rgba(217,107,42,0.22)"
              color="#D96B2A"
              name="Spesifikk"
              days="21 d"
            />
            <PhaseSeg flex={3} bg="rgba(216,57,57,0.22)" color="#D83939" name="Taper" days="3 d" />
            <PhaseSeg
              flex={11}
              bg="rgba(122,167,68,0.22)"
              color="#7AA744"
              name="Konkurranse"
              days="11 d"
            />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] tabular-nums text-muted-foreground">
            <span>9 mai</span>
            <span>23 mai</span>
            <span>30 mai</span>
            <span>2 jun</span>
            <span>20 jun</span>
            <span>30 jun</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          <PhDetailCard
            num="01"
            name="Base"
            desc="Gjenoppta volum etter off-season. Aerob teknikkbase, fundamentet i pyramiden."
            days="14 dager"
            dates="9.–22. mai"
            focus="Foundations 70 %"
            color="#2E8EFF"
          />
          <PhDetailCard
            num="02"
            name="Forberedelse"
            desc="Bygg intensitet, introduser spesifikke skill-blokker mot Sørlandsåpent."
            days="7 dager"
            dates="23.–29. mai"
            focus="Skills 55 %"
            color="#FF962E"
          />
          <PhDetailCard
            num="03"
            name="Spesifikk"
            desc="Turneringsspesifikke scenarier, mental forberedelse, scoring-trening."
            days="21 dager"
            dates="30. mai – 19. jun"
            focus="Strategy 45 %"
            color="#D96B2A"
          />
          <PhDetailCard
            num="04"
            name="Taper"
            desc="Redusert volum siste 3 dager. Recovery, lett putt-routine, mentalt fokus."
            days="3 dager"
            dates="20.–22. jun"
            focus="Recovery"
            color="#D83939"
          />
          <PhDetailCard
            num="05"
            name="Konkurranse"
            desc="Aktive turneringer + lett vedlikehold. NM-kvalik 21.06, klubbmesterskap 28.06."
            days="11 dager"
            dates="20.–30. jun"
            focus="Performance"
            color="#7AA744"
          />
        </div>
      </section>
    </>
  );
}

function PhaseSeg({
  flex,
  bg,
  color,
  name,
  days,
}: {
  flex: number;
  bg: string;
  color: string;
  name: string;
  days: string;
}) {
  return (
    <div
      className="flex min-w-0 flex-col items-center justify-center gap-0.5 px-2 py-2 text-center"
      style={{ flex, background: bg, color }}
    >
      <b className="block max-w-full truncate font-display text-[12px] font-bold leading-tight">
        {name}
      </b>
      <span className="font-mono text-[10px] leading-none opacity-70">{days}</span>
    </div>
  );
}

function PhDetailCard({
  num,
  name,
  desc,
  days,
  dates,
  focus,
  color,
}: {
  num: string;
  name: string;
  desc: string;
  days: string;
  dates: string;
  focus: string;
  color: string;
}) {
  return (
    <div
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="font-mono text-[10px] leading-none text-muted-foreground">{num}</div>
      <h4 className="font-display text-[16px] font-bold leading-tight tracking-tight">{name}</h4>
      <p className="flex-1 text-[12px] leading-[1.5] text-muted-foreground">{desc}</p>
      <div className="flex justify-between border-t border-[var(--line-soft,#EFEDE6)] pt-2 font-mono text-[11px] tabular-nums text-muted-foreground">
        <span>{days}</span>
        <span>{dates}</span>
      </div>
      <div className="text-[11px] leading-[1.3] text-muted-foreground">
        Fokus: <b className="font-semibold text-foreground">{focus}</b>
      </div>
    </div>
  );
}

/* ============================================================
   STEG 4 — Pyramide (kortere variant)
   ============================================================ */

function Step4() {
  return (
    <>
      <div
        className="mb-6 flex items-center gap-4 rounded-lg border border-[rgba(0,88,64,0.18)] border-l-4 border-l-[var(--brand-primary,#005840)] px-4 py-4"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(0,88,64,0.06) 0%, color-mix(in srgb, var(--v2-lime) 10%, transparent) 100%)",
        }}
      >
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary,#005840)] font-mono text-[11px] font-bold text-[var(--brand-accent,#D1F843)]">
          PA
        </div>
        <div className="flex-1">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Plan-watcher · agent-forslag
          </div>
          <p className="mt-1 max-w-[720px] text-[13px] leading-[1.5] text-foreground">
            <b className="font-semibold">Foreslår SLAG 35 % i Spesifikk-fase</b> — Bjaavann har
            sandbase med dyp bunkersand, og Øyvind&apos; SG-arg er −0,1 siste 30 d. Reduser FYS til
            10 % og TEK til 15 % for å gi rom.
          </p>
        </div>
        <button className="inline-flex items-center rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
          Avvis
        </button>
        <button className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-[13px] font-semibold text-[var(--brand-accent-on,#005840)] transition-opacity hover:opacity-90">
          Bruk forslag
        </button>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-6">
        <section className="rounded-2xl border border-border bg-card px-6 py-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Steg 4 · Spesifikk-fase
              </div>
              <h3 className="mt-1 font-display text-[20px] font-bold leading-tight tracking-tight">
                Hvordan tid fordeles i fase 3
              </h3>
              <p className="mt-1 max-w-[500px] text-[12px] leading-[1.5] text-muted-foreground">
                Sum må være 100 %. Subtil bar under hver slider viser hva Øyvind har faktisk trent
                siste 4 uker — for kontekst.
              </p>
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              AI-forslag
            </button>
          </div>

          <SliderBlock
            color="hsl(var(--success))"
            code="FYS"
            label="fysisk fundament"
            value={10}
            historyPct={18}
            historyBg="rgba(22,163,74,0.30)"
            historyLabel="Faktisk siste 4 u: 18 %"
          />
          <SliderBlock
            color="hsl(var(--primary))"
            code="TEK"
            label="teknikk"
            value={15}
            historyPct={32}
            historyBg="rgba(0,88,64,0.30)"
            historyLabel="Faktisk siste 4 u: 32 %"
          />
          <SliderBlock
            color="hsl(var(--accent))"
            code="SLAG"
            label="slagprogresjon"
            value={35}
            historyPct={24}
            historyBg="color-mix(in srgb, var(--v2-lime) 40%, transparent)"
            historyLabel="Faktisk siste 4 u: 24 % · agent foreslår løft"
          />
          <SliderBlock
            color="hsl(var(--warning))"
            code="SPILL"
            label="banespill"
            value={30}
            historyPct={14}
            historyBg="rgba(184,133,42,0.30)"
            historyLabel="Faktisk siste 4 u: 14 %"
          />
          <SliderBlock
            color="hsl(var(--muted-foreground))"
            code="TURN"
            label="turnering"
            value={10}
            historyPct={12}
            historyBg="rgba(94,92,87,0.30)"
            historyLabel="Faktisk siste 4 u: 12 %"
          />

          <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
            <div>
              <div className="font-mono text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                Sum allokasjon
              </div>
              <div className="mt-1 font-mono text-[28px] font-semibold tabular-nums leading-none text-[var(--status-success,#1A7D56)]">
                100 %
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--status-success-bg,#E5F1EA)] px-4 py-1.5 text-[12px] font-medium text-[var(--status-success,#1A7D56)]">
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              Klar for neste steg
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <SideCard title="Spiller">
            <PlayerMini />
            <StatRow label="HCP" value="+2,4" />
            <StatRow label="SG total 12u" value="+0,8" tone="success" />
            <StatRow label="SG-arg 30d" value="−0,1" tone="danger" />
            <StatRow label="Sist trent" value="i dag" last />
          </SideCard>
          <SideCard title="Periode">
            <StatRow label="Start" value="9. mai 2026" />
            <StatRow label="Slutt" value="30. jun 2026" />
            <StatRow label="Varighet" value="8 uker" />
            <StatRow label="Økter" value="24 totalt" />
            <StatRow label="Peak" value="2.–4. jun" last />
          </SideCard>
        </aside>
      </div>
    </>
  );
}

function SliderBlock({
  color,
  code,
  label,
  value,
  historyPct,
  historyBg,
  historyLabel,
}: {
  color: string;
  code: string;
  label: string;
  value: number;
  historyPct: number;
  historyBg: string;
  historyLabel: string;
}) {
  return (
    <div className="border-b border-[var(--line-soft,#EFEDE6)] py-4 last:border-b-0">
      <div className="grid grid-cols-[100px_1fr_70px] items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm" style={{ background: color }} />
          <div>
            <b className="text-[13px] font-semibold leading-none">{code}</b>
            <div className="mt-1 text-[11px] leading-none text-muted-foreground">{label}</div>
          </div>
        </div>
        <div className="relative h-2 rounded-sm bg-[var(--surface-alt,#F1EEE5)]">
          <div
            className="absolute left-0 top-0 h-full rounded-sm"
            style={{ width: `${value}%`, background: color }}
          />
          <div
            className="absolute top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white shadow"
            style={{ left: `${value}%`, borderColor: color }}
          />
        </div>
        <div className="text-right font-mono text-[18px] font-semibold tabular-nums leading-none">
          {value} %
        </div>
      </div>
      <div
        className="ml-[114px] mt-1.5 h-[3px] overflow-hidden rounded-sm bg-[var(--surface-alt,#F1EEE5)]"
        style={{ maxWidth: "calc(100% - 184px)" }}
      >
        <div className="h-full" style={{ width: `${historyPct}%`, background: historyBg }} />
      </div>
      <div className="ml-[114px] mt-1.5 text-[10px] font-medium leading-none text-muted-foreground">
        {historyLabel}
      </div>
    </div>
  );
}

/* ============================================================
   STEG 5 — Økt-skjelett
   ============================================================ */

function Step5() {
  const weeks: WeekProps[] = [
    {
      name: "Uke 1",
      range: "9.–15. mai",
      phase: "Base · 3 økter",
      phaseColor: "#2E8EFF",
      phaseBg: "rgba(46,142,255,0.18)",
      days: [
        { dn: "Sø" },
        { dn: "Ma 11.05", title: "Range 90 min", meta: "Foundations", kind: "tek" },
        { dn: "Ti" },
        { dn: "On 13.05", title: "Range 75 min", meta: "Ballrate", kind: "tek" },
        { dn: "To" },
        { dn: "Fr 15.05", title: "Korthold 60 min", meta: "Chip-base", kind: "slag" },
        { dn: "Lø" },
      ],
    },
    {
      name: "Uke 2",
      range: "16.–22. mai",
      phase: "Base · 3 økter",
      phaseColor: "#2E8EFF",
      phaseBg: "rgba(46,142,255,0.18)",
      days: [
        { dn: "Sø" },
        { dn: "Ma 18.05", title: "Range 90 min", meta: "Iron-base", kind: "tek" },
        { dn: "Ti" },
        { dn: "On 20.05", title: "Range 75 min", meta: "Driver-shape", kind: "slag" },
        { dn: "To" },
        { dn: "Fr" },
        { dn: "Lø 22.05", title: "Bane 9 · 120 min", meta: "Planning", kind: "spill" },
      ],
    },
    {
      name: "Uke 3",
      range: "23.–29. mai",
      phase: "Forberedelse · 3 økter",
      phaseColor: "#FF962E",
      phaseBg: "rgba(255,150,46,0.22)",
      days: [
        { dn: "Sø" },
        { dn: "Ma 25.05", title: "Range 90 min", meta: "Iron-distance", kind: "slag" },
        { dn: "Ti" },
        { dn: "On 27.05", title: "Korthold 75 min", meta: "Putt-rutiner", kind: "slag" },
        { dn: "To" },
        { dn: "Fr 29.05", title: "Range 60 min", meta: "Mental", kind: "tek" },
        { dn: "Lø" },
      ],
    },
    {
      name: "Uke 4",
      range: "30. mai – 5. jun",
      phase: "Spesifikk · peak-uke",
      phaseColor: "#D96B2A",
      phaseBg: "rgba(217,107,42,0.22)",
      days: [
        { dn: "Sø" },
        { dn: "Ma 01.06", title: "Bane 18 · 240 min", meta: "Scenario", kind: "spill" },
        { dn: "Ti 02.06", title: "SØRLANDS-ÅPENT", meta: "Turnering", kind: "turn" },
        { dn: "On 03.06", title: "SØRLANDS-ÅPENT", meta: "Turnering", kind: "turn" },
        { dn: "To 04.06", title: "SØRLANDS-ÅPENT", meta: "Turnering", kind: "turn" },
        { dn: "Fr" },
        { dn: "Lø 05.06", title: "Recovery 45 min", meta: "Debrief", kind: "fys" },
      ],
    },
    {
      name: "Uke 5",
      range: "6.–12. jun",
      phase: "Spesifikk · 4 økter",
      phaseColor: "#D96B2A",
      phaseBg: "rgba(217,107,42,0.22)",
      days: [
        { dn: "Sø" },
        { dn: "Ma 08.06", title: "Range 90 min", meta: "Pressure", kind: "slag" },
        { dn: "Ti" },
        { dn: "On 10.06", title: "Bane 9 · 120 min", meta: "Klubbing", kind: "spill" },
        { dn: "To" },
        { dn: "Fr 12.06", title: "Korthold 75 min", meta: "Scoring", kind: "slag" },
        { dn: "Lø 13.06", title: "Range 60 min", meta: "Rutine", kind: "tek" },
      ],
    },
    {
      name: "Uke 6",
      range: "13.–19. jun",
      phase: "Spesifikk · 3 økter",
      phaseColor: "#D96B2A",
      phaseBg: "rgba(217,107,42,0.22)",
      days: [
        { dn: "Sø" },
        { dn: "Ma 15.06", title: "Bane 18 · 240 min", meta: "Scoring", kind: "spill" },
        { dn: "Ti" },
        { dn: "On 17.06", title: "Range 75 min", meta: "Wedges", kind: "slag" },
        { dn: "To" },
        { dn: "Fr 19.06", title: "Korthold 60 min", meta: "Fokus", kind: "slag" },
        { dn: "Lø" },
      ],
    },
    {
      name: "Uke 7",
      range: "20.–22. jun",
      phase: "Taper · 2 økter + NM-kvalik",
      phaseColor: "#D83939",
      phaseBg: "rgba(216,57,57,0.22)",
      days: [
        { dn: "Sø 20.06", title: "Lett 45 min", meta: "Recovery", kind: "fys" },
        { dn: "Ma 21.06", title: "NM-KVALIK", meta: "Turnering", kind: "turn" },
        { dn: "Ti 22.06", title: "Recovery 30 min", meta: "Debrief", kind: "fys" },
        { dn: "On" },
        { dn: "To" },
        { dn: "Fr" },
        { dn: "Lø" },
      ],
    },
    {
      name: "Uke 8",
      range: "23.–30. jun",
      phase: "Konkurranse · 4 økter",
      phaseColor: "#7AA744",
      phaseBg: "rgba(122,167,68,0.22)",
      days: [
        { dn: "Ti" },
        { dn: "On 24.06", title: "Range 60 min", meta: "Vedlikehold", kind: "tek" },
        { dn: "To" },
        { dn: "Fr 26.06", title: "Korthold 45 min", meta: "Putt", kind: "slag" },
        { dn: "Lø" },
        { dn: "Sø 28.06", title: "KLUBBMESTERSKAP", meta: "Turnering", kind: "turn" },
        { dn: "Ti 30.06", title: "Recovery 45 min", meta: "Oppsum.", kind: "fys" },
      ],
    },
  ];

  return (
    <>
      <AgentStrip
        label="Periodiserings-agent · 24 økter generert"
        body={
          <>
            <b className="font-semibold">
              3 økter/uke i base + forberedelse, 4 økter/uke i spesifikk, 2 lette økter i taper
            </b>{" "}
            — totalt 24 økter, snittlengde 75 min. 14 økter på range, 6 på kortholdsområde, 4 på
            bane. Skill-fokus matcher pyramidefordelingen.
          </>
        }
      />

      <section className="rounded-2xl border border-border bg-card px-6 py-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Ukeoversikt · klikk økt for å redigere
            </div>
            <h3 className="mt-1 font-display text-[20px] font-bold leading-tight tracking-tight">
              24 økter fordelt over 8 uker
            </h3>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center rounded-md border border-border bg-transparent px-4 py-1.5 text-[12px] font-medium hover:bg-secondary">
              Filter: alle
            </button>
            <button className="inline-flex items-center rounded-md border border-border bg-transparent px-4 py-1.5 text-[12px] font-medium hover:bg-secondary">
              + Legg til økt
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {weeks.map((w) => (
            <WeekRow key={w.name} {...w} />
          ))}
        </div>
      </section>
    </>
  );
}

type DayKind = "fys" | "tek" | "slag" | "spill" | "turn";
type DayCell = { dn: string; title?: string; meta?: string; kind?: DayKind };
type WeekProps = {
  name: string;
  range: string;
  phase: string;
  phaseColor: string;
  phaseBg: string;
  days: DayCell[];
};

function WeekRow({ name, range, phase, phaseColor, phaseBg, days }: WeekProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[13px] font-semibold leading-none">
          <b className="mr-2 font-mono">{name}</b>
          <span className="font-normal text-muted-foreground">{range}</span>
        </div>
        <div
          className="rounded-full px-2.5 py-1 text-[11px] font-medium leading-none"
          style={{ background: phaseBg, color: phaseColor }}
        >
          ● {phase}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d, i) => (
          <DayCellBlock key={i} {...d} />
        ))}
      </div>
    </div>
  );
}

function DayCellBlock({ dn, title, meta, kind }: DayCell) {
  const styles: Record<DayKind, { bg: string; border: string }> = {
    fys: { bg: "rgba(22,163,74,0.10)", border: "rgba(22,163,74,0.30)" },
    tek: { bg: "rgba(0,88,64,0.10)", border: "rgba(0,88,64,0.30)" },
    slag: { bg: "color-mix(in srgb, var(--v2-lime) 20%, transparent)", border: "color-mix(in srgb, var(--v2-lime) 50%, transparent)" },
    spill: { bg: "rgba(184,133,42,0.12)", border: "rgba(184,133,42,0.35)" },
    turn: { bg: "rgba(94,92,87,0.12)", border: "rgba(94,92,87,0.30)" },
  };
  const isEmpty = !title;
  const s = kind ? styles[kind] : null;
  return (
    <div
      className={`flex flex-col justify-between rounded-md p-2 ${
        isEmpty ? "border border-dashed border-border" : "border"
      }`}
      style={{
        aspectRatio: "1.4 / 1",
        background: s?.bg,
        borderColor: s?.border,
      }}
    >
      <div className="font-mono text-[9px] uppercase leading-none text-muted-foreground">{dn}</div>
      {title && (
        <>
          <div className="text-[10px] font-semibold leading-tight text-foreground">{title}</div>
          <div className="text-[9px] leading-none opacity-70">{meta}</div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   STEG 6 — Bekreft
   ============================================================ */

function Step6() {
  return (
    <>
      <div
        className="mb-6 rounded-2xl px-8 py-8 text-white"
        style={{
          background: "linear-gradient(135deg, #005840 0%, #006B4F 100%)",
        }}
      >
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] opacity-70">
          Klar til å sende
        </div>
        <h2 className="mt-2.5 font-display text-[32px] font-bold leading-[1.1] tracking-tight">
          <em className="font-medium italic">Sørlandsåpent-prep</em> · 8 uker mot peak 2. juni
        </h2>
        <p className="mt-2 max-w-[540px] text-[14px] leading-[1.5] opacity-85">
          5 faser · 24 økter · 1 800 min total treningstid · 3 turneringer · pyramide-fordeling i
          tråd med spesifikk fase. Konfidens 87 %.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SumBlock title="Plan-detaljer" editHref="/demos/plan-bygger/2">
          <SumRow label="Navn" value="Sørlandsåpent-prep" />
          <SumRow label="Spiller" value="Øyvind Rohjan" />
          <SumRow label="Coach" value="Anders K." />
          <SumRow label="Start" value="9. mai 2026" />
          <SumRow label="Slutt" value="30. juni 2026" />
          <SumRow label="Varighet" value="8 uker · 56 dager" />
          <SumRow label="Peak" value="2.–4. juni" last />
        </SumBlock>

        <SumBlock title="Faser og volum" editHref="/demos/plan-bygger/3">
          <SumRow label="● Base" labelColor="#2E8EFF" value="14 d · 6 økter" />
          <SumRow label="● Forberedelse" labelColor="#FF962E" value="7 d · 3 økter" />
          <SumRow label="● Spesifikk" labelColor="#D96B2A" value="21 d · 10 økter" />
          <SumRow label="● Taper" labelColor="#D83939" value="3 d · 2 økter" />
          <SumRow label="● Konkurranse" labelColor="#7AA744" value="11 d · 3 økter" />
          <SumRow label="Totalt" value="24 økter · 1 800 min" last />
        </SumBlock>

        <SumBlock title="Pyramide-allokering" editHref="/demos/plan-bygger/4">
          <SumRow label="Foundations" value="32 %" />
          <SumRow label="Skills" value="38 %" />
          <SumRow label="Strategy" value="18 %" />
          <SumRow label="Mental" value="8 %" />
          <SumRow label="Performance" value="4 %" last />
        </SumBlock>

        <SumBlock title="Turneringer i perioden">
          <SumRow label="Sørlandsåpent (peak)" value="2.–4. jun" />
          <SumRow label="NM-kvalik" value="21. jun" />
          <SumRow label="Klubbmesterskap" value="28. jun" />
          <SumRow label="Treningsdager" value="24" />
          <SumRow label="Hviledager" value="9" last />
        </SumBlock>
      </div>

      <section className="mt-6">
        <div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Varselforhåndsvisning — det Øyvind vil se
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-2 text-[11px] leading-none text-muted-foreground">
            Fra Anders K. · i kveld kl 21:30
          </div>
          <div className="mb-2.5 font-display text-[14px] font-semibold leading-[1.3]">
            Du har en ny plan:{" "}
            <em className="font-medium italic">Sørlandsåpent-prep</em>
          </div>
          <p className="text-[13px] leading-[1.6] text-foreground">
            Hei Øyvind — jeg har bygd en 8-ukers plan mot Sørlandsåpent 2. juni. Vi starter med to
            ukers base for å bygge volum etter off-season, deretter forberedelse og en tre ukers
            spesifikk turneringsblokk. 24 økter totalt. Si fra hvis noe ikke passer, så justerer vi.
          </p>
        </div>
      </section>
    </>
  );
}

function SumBlock({
  title,
  editHref,
  children,
}: {
  title: string;
  editHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h4 className="mb-2.5 flex items-center justify-between font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        <span>{title}</span>
        {editHref && (
          <Link
            href={editHref}
            className="font-sans text-[11px] font-medium normal-case tracking-normal text-[var(--brand-primary,#005840)] hover:underline"
          >
            rediger
          </Link>
        )}
      </h4>
      <div>{children}</div>
    </div>
  );
}

function SumRow({
  label,
  value,
  labelColor,
  last = false,
}: {
  label: string;
  value: string;
  labelColor?: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2 text-[13px] leading-[1.4] ${
        last ? "" : "border-b border-[var(--line-soft,#EFEDE6)]"
      }`}
    >
      <span style={labelColor ? { color: labelColor } : undefined}>{label}</span>
      <b className="font-mono font-semibold tabular-nums">{value}</b>
    </div>
  );
}

/* ============================================================
   FELLES HJELPERE
   ============================================================ */

function AgentStrip({ label, body }: { label: string; body: React.ReactNode }) {
  return (
    <div
      className="mb-6 flex items-center gap-4 rounded-lg border border-[rgba(0,88,64,0.18)] border-l-4 border-l-[var(--brand-primary,#005840)] px-4 py-4"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(0,88,64,0.06) 0%, color-mix(in srgb, var(--v2-lime) 10%, transparent) 100%)",
      }}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary,#005840)] font-mono text-[11px] font-bold text-[var(--brand-accent,#D1F843)]">
        PA
      </div>
      <div className="flex-1">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </div>
        <p className="mt-1 max-w-[720px] text-[13px] leading-[1.5] text-foreground">{body}</p>
      </div>
      <button className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-[13px] font-semibold text-[var(--brand-accent-on,#005840)] transition-opacity hover:opacity-90">
        Bruk forslag
      </button>
    </div>
  );
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-6">
      <h4 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}

function PlayerMini() {
  return (
    <div className="mb-4 grid grid-cols-[48px_1fr] items-center gap-2">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary,#005840)] font-display text-[16px] font-semibold text-white">
        M
      </div>
      <div>
        <div className="text-[14px] font-semibold leading-tight">Øyvind Rohjan</div>
        <div className="mt-1 text-[11px] leading-[1.3] text-muted-foreground">
          Kategori A · 17 år · WANG
        </div>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  tone,
  last = false,
}: {
  label: string;
  value: string;
  tone?: "success" | "danger";
  last?: boolean;
}) {
  const valueClass =
    tone === "success"
      ? "text-[var(--status-success,#1A7D56)]"
      : tone === "danger"
        ? "text-[var(--status-danger,#A32D2D)]"
        : "";
  return (
    <div
      className={`flex items-center justify-between py-2 ${
        last ? "" : "border-b border-[var(--line-soft,#EFEDE6)]"
      }`}
    >
      <span className="text-[12px] font-medium leading-none text-muted-foreground">{label}</span>
      <span
        className={`font-mono text-[13px] font-semibold tabular-nums leading-none ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}
