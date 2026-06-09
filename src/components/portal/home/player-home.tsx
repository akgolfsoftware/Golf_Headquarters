/**
 * PlayerHQ Hjem (/portal) — portet FRA fersk Claude Design-fasit:
 *   public/design-handover/AK Golf HQ Design System/playerhq-app/ph-home.jsx (HomeMobile)
 *
 * Presentasjonell komponent. Tar all data via `HjemData`-props — INGEN
 * Prisma/DB/auth her. Mobil er primær-fasit.
 *
 * Vertikal stack (topp → bunn), eksakt rekkefølge fra HomeMobile:
 *   1. Foto-hero (Anders-unntak: tier-pill + avatar i topp; greeting + display-headline i bunn)
 *   2. KPI-strip (3): HCP · SG Total · Neste økt
 *   3. Dagens fokus — FeaturedCard m/ foto + to handlinger (Start økt / Se i planen)
 *   4. Primærknapp: "Planlegg i Workbench"
 *   5. Pyramide-kort (UKE NN · PYRAMIDEN)
 *   6. Resten av dagen — økt-rader m/ status-chip
 *   7. Neste tee — dato-boks-rad
 *   8. Neste turnering — teaser-kort + planlegg-CTA
 *
 * Athletic-primitiver + DS-tokens (globals.css). Ingen hardkodet hex, ingen emoji.
 */

import Link from "next/link";
import {
  Play,
  LayoutTemplate,
  ChevronRight,
  ArrowRight,
  Trophy,
} from "lucide-react";
import {
  FeaturedCard,
  KpiCard,
  PyramidProgress,
  AthleticEyebrow,
  AthleticBadge,
} from "@/components/athletic";
import type { HjemData, ProgramOkt } from "@/lib/portal-hjem/hjem-data";

// ── 1. Foto-hero ─────────────────────────────────────────────────────────────
// Unntak (Anders 2026-06-02): hjem beholder tier-pill + profilbilde i hero-topp
// (fasiten har dato-eyebrow + vær der). Greeting + display-headline følger fasiten.

function FotoHero({ data }: { data: HjemData }) {
  return (
    <header className="relative flex min-h-[348px] flex-col justify-between overflow-hidden md:rounded-[20px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/akgolf/AK-Golf-Academy-${data.heroImageId}.webp`}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "center 45%" }}
        loading="eager"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 32%, transparent 46%, rgba(10,31,23,0.94) 100%)",
        }}
      />

      {/* Topp: tier-pill (venstre) + avatar (høyre) */}
      <div className="relative z-10 flex items-start justify-between p-5">
        <span className="inline-flex items-center rounded-full border border-accent/50 bg-accent/15 px-2.5 py-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-accent [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]">
          PlayerHQ · {data.user.tier}
        </span>
        <Link
          href="/portal/meg"
          aria-label="Min profil"
          className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-accent bg-foreground/30 font-display text-base font-bold text-accent transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          {data.user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            data.user.initialer
          )}
        </Link>
      </div>

      {/* Bunn: greeting (liten italic lime) + display-headline (stor hvit, lime aksent) */}
      <div className="relative z-10 p-5 pb-6">
        <span className="block font-display text-[18px] font-medium italic text-accent">
          {data.hilsen}, {data.user.fornavn}.
        </span>
        <h1 className="mt-1 font-display text-[29px] font-bold leading-[1.04] tracking-[-0.02em] text-background [text-shadow:0_2px_12px_rgba(0,0,0,0.42)]">
          {data.headline.pre}{" "}
          <em className="font-normal italic text-accent">{data.headline.em}</em>{" "}
          {data.headline.post}
        </h1>
      </div>
    </header>
  );
}

// ── Knappestiler (delt) ──────────────────────────────────────────────────────
const limeBtn =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary";
const ghostDarkBtn =
  "inline-flex h-11 items-center justify-center rounded-full border border-white/30 px-5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50";

// ── 3. Dagens fokus ──────────────────────────────────────────────────────────
function DagensFokus({ data }: { data: HjemData }) {
  const f = data.dagensFokus;
  if (!f) return null;
  return (
    <FeaturedCard
      imageSrc={`/images/akgolf/AK-Golf-Academy-${((data.heroImageId + 9) % 30) + 1}.webp`}
      eyebrow={f.eyebrow}
      showPulse
      title={f.tittel}
      italic={f.italic}
      description={f.beskrivelse}
      minHeight={200}
      action={
        <div className="flex flex-wrap gap-2.5">
          <Link href={f.startHref} className={limeBtn}>
            Start økt
            <Play className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </Link>
          <Link href={f.planHref} className={ghostDarkBtn}>
            Se i planen
          </Link>
        </div>
      }
    />
  );
}

// ── 6. Resten av dagen — én rad ──────────────────────────────────────────────
function ProgramRad({ o }: { o: ProgramOkt }) {
  const chip =
    o.status === "now"
      ? { variant: "lime" as const, label: "Nå" }
      : o.status === "done"
        ? { variant: "neutral" as const, label: "Logget" }
        : { variant: "neutral" as const, label: "Kommer" };
  return (
    <Link
      href={o.href}
      className="flex items-center gap-3.5 border-b border-border py-3 last:border-b-0 transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="w-[50px] shrink-0 text-right font-mono text-[13px] font-semibold text-foreground">
        {o.tid}
      </span>
      <span
        className={
          "h-9 w-[3px] shrink-0 rounded-full " +
          (o.status === "now" ? "bg-accent" : "bg-border")
        }
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold tracking-[-0.005em] text-foreground">
          {o.tittel}
        </span>
        <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">
          {o.meta}
        </span>
      </span>
      <AthleticBadge variant={chip.variant}>{chip.label}</AthleticBadge>
    </Link>
  );
}

// ── SecHead ──────────────────────────────────────────────────────────────────
function SecHead({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between">
      <AthleticEyebrow>{children}</AthleticEyebrow>
      {action}
    </div>
  );
}

const linkMono =
  "font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary transition-opacity hover:opacity-80";

// ── Hovedkomponent ───────────────────────────────────────────────────────────
export function PlayerHome({ data }: { data: HjemData }) {
  return (
    <div className="mx-auto w-full max-w-[460px] pb-8 md:hidden">
      <FotoHero data={data} />

      <div className="space-y-5 px-4 pt-5 sm:px-5">
        {/* 2. KPI-strip — 3 på rad også på mobil */}
        {data.kpi.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {data.kpi.map((k) => (
              <KpiCard key={k.label} size="sm" label={k.label} value={k.value} trend={k.trend} />
            ))}
          </div>
        )}

        {/* 3. Dagens fokus */}
        <DagensFokus data={data} />

        {/* 4. Primærknapp → Workbench */}
        <Link
          href="/portal/planlegge"
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <LayoutTemplate className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          Planlegg i Workbench
        </Link>

        {/* 5. Pyramide */}
        {data.pyramide.length > 0 && (
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3.5 flex items-baseline justify-between">
              <AthleticEyebrow>UKE {data.ukeNr} · PYRAMIDEN</AthleticEyebrow>
              <Link href="/portal/planlegge" className={linkMono}>
                Se plan →
              </Link>
            </div>
            <PyramidProgress rows={data.pyramide} />
          </section>
        )}

        {/* 6. Resten av dagen */}
        {data.dagensProgram.length > 0 && (
          <section className="space-y-1">
            <SecHead
              action={
                <Link href="/portal/gjennomfore" className={linkMono}>
                  I dag →
                </Link>
              }
            >
              RESTEN AV DAGEN
            </SecHead>
            <div>
              {data.dagensProgram.map((o) => (
                <ProgramRad key={o.id} o={o} />
              ))}
            </div>
          </section>
        )}

        {/* 7. Neste tee */}
        {data.nesteTee && (
          <section className="space-y-1">
            <SecHead>NESTE TEE</SecHead>
            <Link
              href={data.nesteTee.href}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex h-[54px] w-[54px] shrink-0 flex-col items-center justify-center rounded-[14px] bg-secondary">
                <span className="font-mono text-[9px] font-bold uppercase text-muted-foreground">
                  {data.nesteTee.dagKort}
                </span>
                <span className="font-display text-[22px] font-bold leading-none text-foreground">
                  {data.nesteTee.datoTall}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold tracking-[-0.005em] text-foreground">
                  {data.nesteTee.navn}
                </span>
                <span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground">
                  {data.nesteTee.meta}
                </span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/70" strokeWidth={2} aria-hidden />
            </Link>
          </section>
        )}

        {/* 8. Neste turnering */}
        {data.nesteTurnering && (
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <AthleticEyebrow>NESTE TURNERING</AthleticEyebrow>
              <Link href={data.nesteTurnering.href} className={linkMono}>
                Alle →
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <Trophy className="h-5 w-5" strokeWidth={2} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold tracking-[-0.01em] text-foreground">
                  {data.nesteTurnering.navn}
                </div>
                <div className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                  {data.nesteTurnering.meta}
                </div>
              </div>
              <AthleticBadge variant="ok">{data.nesteTurnering.chip}</AthleticBadge>
            </div>
            <Link
              href={data.nesteTurnering.planHref}
              className="mt-3.5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-secondary font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Planlegg mot {data.nesteTurnering.navn}
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}

// ── Desktop-layout (ph-home.jsx · HomeDesktop): hero inline + 5-KPI + 2-kol grid ──
export function PlayerHomeDesktop({ data }: { data: HjemData }) {
  const f = data.dagensFokus;
  return (
    <div className="mx-auto hidden w-full max-w-[1120px] px-6 py-6 md:block">
      {/* Hero band */}
      <header className="relative flex min-h-[240px] flex-col justify-end overflow-hidden rounded-3xl p-9">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/images/akgolf/AK-Golf-Academy-${data.heroImageId}.webp`} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center 40%" }} loading="eager" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(110deg, rgba(10,31,23,0.93) 0%, rgba(0,88,64,0.55) 55%, rgba(0,88,64,0.12) 100%)" }} />
        <div className="absolute left-9 top-7 z-10 flex items-center gap-4">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-accent [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">{data.datoEyebrow}</span>
        </div>
        <div className="relative z-10">
          <div className="mb-3.5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full border-2 border-white/40 bg-foreground/30 font-display text-base font-bold text-accent">
              {data.user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                data.user.initialer
              )}
            </span>
            <span className="inline-flex items-center rounded-full border border-accent/50 bg-accent/15 px-2.5 py-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-accent">
              PlayerHQ · {data.user.tier}
              {data.user.hcp != null && ` · HCP ${data.user.hcp.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`}
            </span>
          </div>
          <span className="block font-display text-xl font-medium italic text-accent">
            {data.hilsen}, {data.user.fornavn}.
          </span>
          <h1 className="mt-1.5 max-w-[18ch] font-display text-[40px] font-bold leading-[1.04] tracking-[-0.025em] text-background [text-shadow:0_2px_12px_rgba(0,0,0,0.4)]">
            {data.headline.pre} <em className="font-normal italic text-accent">{data.headline.em}</em> {data.headline.post}
          </h1>
          <div className="mt-[18px] flex gap-2.5">
            <Link href={f?.startHref ?? "/portal/gjennomfore"} className={limeBtn}>
              Start dagens økt <Play className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </Link>
            <Link href="/portal/planlegge" className={ghostDarkBtn}>Åpne Workbench</Link>
          </div>
        </div>
      </header>

      {/* 5-KPI */}
      {data.kpiDesktop.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {data.kpiDesktop.map((k) => (
            <KpiCard key={k.label} label={k.label} value={k.value} unit={k.unit} trend={k.trend} />
          ))}
        </div>
      )}

      {/* 2-kolonne grid */}
      <div className="mt-6 grid grid-cols-[1.6fr_1fr] gap-6">
        <div className="space-y-6">
          <DagensFokus data={data} />
          {data.dagensProgram.length > 0 && (
            <section className="space-y-1">
              <SecHead action={<Link href="/portal/gjennomfore" className={linkMono}>Hele dagen →</Link>}>
                DAGENS PROGRAM · {data.dagensProgram.length} ØKTER
              </SecHead>
              <div className="rounded-2xl border border-border bg-card px-4">
                {data.dagensProgram.map((o) => (
                  <ProgramRad key={o.id} o={o} />
                ))}
              </div>
            </section>
          )}
          {data.nesteTee && (
            <section className="space-y-1">
              <SecHead>NESTE TEE</SecHead>
              <Link href={data.nesteTee.href} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40">
                <span className="flex h-[54px] w-[54px] shrink-0 flex-col items-center justify-center rounded-[14px] bg-secondary">
                  <span className="font-mono text-[9px] font-bold uppercase text-muted-foreground">{data.nesteTee.dagKort}</span>
                  <span className="font-display text-[22px] font-bold leading-none text-foreground">{data.nesteTee.datoTall}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">{data.nesteTee.navn}</span>
                  <span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground">{data.nesteTee.meta}</span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/70" strokeWidth={2} aria-hidden />
              </Link>
            </section>
          )}
        </div>
        <div className="space-y-6">
          {data.pyramide.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3.5 flex items-baseline justify-between">
                <AthleticEyebrow>UKE {data.ukeNr} · PYRAMIDEN</AthleticEyebrow>
                <Link href="/portal/planlegge" className={linkMono}>Se plan →</Link>
              </div>
              <PyramidProgress rows={data.pyramide} />
            </section>
          )}
          {data.nesteTurnering && (
            <section className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-baseline justify-between">
                <AthleticEyebrow>NESTE TURNERING</AthleticEyebrow>
                <Link href={data.nesteTurnering.href} className={linkMono}>Alle →</Link>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <Trophy className="h-5 w-5" strokeWidth={2} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">{data.nesteTurnering.navn}</div>
                  <div className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">{data.nesteTurnering.meta}</div>
                </div>
                <AthleticBadge variant="ok">{data.nesteTurnering.chip}</AthleticBadge>
              </div>
              <Link href={data.nesteTurnering.planHref} className="mt-3.5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-secondary font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-secondary/70">
                Planlegg mot {data.nesteTurnering.navn}
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              </Link>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
