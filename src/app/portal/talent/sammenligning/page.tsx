/**
 * PlayerHQ — Talent · Sammenligning (MOBILE-FIRST 430px)
 *
 * Side-by-side med en annen spiller på samme nivå. Athletic-editorial re-styl
 * mot DS-tokens (logikk uendret):
 *  - Mono-eyebrow m/pulse + italic display-tittel + Anonymiser-toggle
 *  - Søk/velg-skjema (URL-param ?q / ?spiller)
 *  - Overlapping radar (primary vs muted-foreground)
 *  - Akse-rader side om side (progress-bars)
 *  - SG-delta-kort over valgt periode (?periode=30d|90d|1ar) fra Round
 *
 * All data fra TalentTracking + Round — ingen falske tall (tomstate når null).
 */

import { ArrowLeftRight, Minus, TrendingDown, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

import {
  AXIS_KEYS,
  AXIS_LABELS,
  RadarChart,
  type RadarValues,
} from "@/components/portal/talent/radar-chart";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

import { AnonymiserToggle } from "./anonymiser-toggle";

type Periode = "30d" | "90d" | "1ar";

type SgDelta = {
  label: string;
  no: number | null;
  da: number | null;
};

type SearchParams = Promise<{ q?: string; spiller?: string; periode?: string }>;

function lesAnonymiser(prefs: unknown): boolean {
  if (!prefs || typeof prefs !== "object" || Array.isArray(prefs)) return false;
  const talent = (prefs as Record<string, unknown>).talent;
  if (!talent || typeof talent !== "object" || Array.isArray(talent)) return false;
  const v = (talent as Record<string, unknown>).anonymiserSammenligning;
  return v === true;
}

export default async function SammenligningPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  const { q, spiller, periode } = await searchParams;

  const mineData = await prisma.talentTracking.findUnique({
    where: { userId: user.id },
    include: { user: { select: { name: true, preferences: true } } },
  });
  if (!mineData) return null;

  const minAnonymisert = lesAnonymiser(mineData.user.preferences);
  const mittNavn = minAnonymisert ? "Spiller" : (mineData.user.name ?? "Deg");

  // Hent alle andre på samme nivå, valgfritt filtrert på søketekst
  const kandidater = await prisma.talentTracking.findMany({
    where: {
      niva: mineData.niva,
      NOT: { userId: user.id },
      ...(q && q.trim().length > 0
        ? {
            user: {
              name: { contains: q.trim(), mode: "insensitive" },
            },
          }
        : {}),
    },
    include: { user: { select: { id: true, name: true, preferences: true } } },
    take: 50,
    orderBy: { user: { name: "asc" } },
  });

  // Valgt motspiller
  const valgt = spiller
    ? kandidater.find((k) => k.user.id === spiller) ??
      (await prisma.talentTracking.findFirst({
        where: { user: { id: spiller }, niva: mineData.niva },
        include: { user: { select: { id: true, name: true, preferences: true } } },
      }))
    : null;

  const mine: RadarValues = {
    fysisk: mineData.fysisk,
    teknikk: mineData.teknikk,
    taktikk: mineData.taktikk,
    mental: mineData.mental,
    motivasjon: mineData.motivasjon,
  };
  const annen: RadarValues | null = valgt
    ? {
        fysisk: valgt.fysisk,
        teknikk: valgt.teknikk,
        taktikk: valgt.taktikk,
        mental: valgt.mental,
        motivasjon: valgt.motivasjon,
      }
    : null;

  const annenAnonymisert = valgt ? lesAnonymiser(valgt.user.preferences) : false;
  const annenNavn = !valgt
    ? null
    : annenAnonymisert
      ? "Spiller"
      : (valgt.user.name ?? "Ukjent");

  // Periode-filter for SG delta
  const periodeValgt: Periode =
    periode === "90d" ? "90d" : periode === "1ar" ? "1ar" : "30d";
  const dager = periodeValgt === "1ar" ? 365 : periodeValgt === "90d" ? 90 : 30;
  const periodeStart = new Date();
  periodeStart.setDate(periodeStart.getDate() - dager);

  // SG siste runder i perioden vs runder før perioden
  const [nyeRunder, gamleRunder] = await Promise.all([
    prisma.round.findMany({
      where: { userId: user.id, playedAt: { gte: periodeStart } },
      orderBy: { playedAt: "desc" },
      take: 5,
      select: { sgTotal: true, sgApp: true, sgArg: true, sgPutt: true, playedAt: true },
    }),
    prisma.round.findMany({
      where: { userId: user.id, playedAt: { lt: periodeStart } },
      orderBy: { playedAt: "desc" },
      take: 5,
      select: { sgTotal: true, sgApp: true, sgArg: true, sgPutt: true },
    }),
  ]);

  function snitt(
    runder: {
      sgTotal: number | null;
      sgApp: number | null;
      sgArg: number | null;
      sgPutt: number | null;
    }[],
    felt: "sgTotal" | "sgApp" | "sgArg" | "sgPutt",
  ): number | null {
    const vals = runder.map((r) => r[felt]).filter((v): v is number => v !== null);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }

  const sgDeltas: SgDelta[] = [
    { label: "SG Totalt", no: snitt(nyeRunder, "sgTotal"), da: snitt(gamleRunder, "sgTotal") },
    { label: "SG APP", no: snitt(nyeRunder, "sgApp"), da: snitt(gamleRunder, "sgApp") },
    { label: "SG ARG", no: snitt(nyeRunder, "sgArg"), da: snitt(gamleRunder, "sgArg") },
    { label: "SG PUTT", no: snitt(nyeRunder, "sgPutt"), da: snitt(gamleRunder, "sgPutt") },
  ];

  return (
    <div className="mx-auto flex max-w-[480px] flex-col gap-4">
      {/* Tilbake */}
      <Link
        href="/portal/talent"
        className="inline-flex w-fit items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Tilbake til talent
      </Link>

      {/* Header */}
      <header>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.6)]" />
          </span>
          TALENT · SAMMENLIGNING · {mineData.niva}
        </span>
        <h1 className="mt-1.5 font-display text-[26px] font-bold leading-[1.1] tracking-[-0.02em] text-foreground">
          Sammenlign{" "}
          <em className="font-normal italic text-primary">deg</em> med en annen.
        </h1>
        <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">
          Velg en spiller på {mineData.niva}-nivå for å se hvordan dere ligger
          mot hverandre. Vil du ikke vise navnet ditt? Skru på «Anonymiser meg».
        </p>
        <div className="mt-3">
          <AnonymiserToggle initial={minAnonymisert} />
        </div>
      </header>

      {/* Søk + velg */}
      <section
        aria-label="Velg motspiller"
        className="rounded-xl border border-border bg-card p-4"
      >
        <form
          action="/portal/talent/sammenligning"
          method="get"
          className="flex flex-col gap-3"
        >
          <div>
            <label
              htmlFor="q"
              className="block font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground"
            >
              Søk etter navn
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q ?? ""}
              placeholder={`Søk blant spillere på ${mineData.niva}`}
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            />
          </div>
          <div>
            <label
              htmlFor="spiller"
              className="block font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground"
            >
              Velg fra liste
            </label>
            <select
              id="spiller"
              name="spiller"
              defaultValue={spiller ?? ""}
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <option value="">— Ingen valgt —</option>
              {kandidater.map((k) => {
                const navn = lesAnonymiser(k.user.preferences)
                  ? "Spiller"
                  : (k.user.name ?? "Ukjent");
                return (
                  <option key={k.user.id} value={k.user.id}>
                    {navn}
                    {k.klubb ? ` · ${k.klubb}` : ""}
                  </option>
                );
              })}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-6 font-mono text-[11px] font-extrabold uppercase tracking-[0.10em] text-accent transition hover:opacity-90"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Sammenlign
          </button>
        </form>
        {q && kandidater.length === 0 && (
          <p className="mt-3 text-[13px] text-muted-foreground">
            Ingen treff på «{q}» på {mineData.niva}-nivå.
          </p>
        )}
      </section>

      {!valgt || !annen ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <Users
            className="mx-auto h-8 w-8 text-muted-foreground/50"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="mt-3 text-[13px] text-muted-foreground">
            Velg en spiller fra lista eller søk for å se sammenligning.
          </p>
        </div>
      ) : (
        <>
          {/* Overlapping radar */}
          <section
            aria-label="Radar-sammenligning"
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-center">
              <RadarChart
                series={[
                  {
                    label: annenNavn ?? "Annen",
                    values: annen,
                    fillClass: "fill-muted-foreground",
                    strokeClass: "stroke-muted-foreground",
                  },
                  {
                    label: mittNavn,
                    values: mine,
                    fillClass: "fill-primary",
                    strokeClass: "stroke-primary",
                  },
                ]}
                size={340}
              />
            </div>
            {/* Legende */}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
                  <span className="text-sm font-bold text-foreground">{mittNavn}</span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  {mineData.klubb ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" aria-hidden />
                  <span className="text-sm font-bold text-muted-foreground">{annenNavn}</span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  {valgt.klubb ?? "—"}
                </span>
              </div>
            </div>
            <Link
              href="/portal/talent/sammenligning"
              className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-4 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-secondary-foreground transition hover:opacity-90"
            >
              Tilbakestill
            </Link>
          </section>

          {/* Akser side om side */}
          <section aria-label="Akser i detalj" className="flex flex-col gap-3">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              Akser side om side
            </span>
            <div className="flex flex-col gap-3">
              {AXIS_KEYS.map((k) => (
                <CompareAxis
                  key={k}
                  label={AXIS_LABELS[k]}
                  youLabel={mittNavn}
                  youValue={mine[k] ?? null}
                  otherLabel={annenNavn ?? "Annen"}
                  otherValue={annen[k] ?? null}
                />
              ))}
            </div>
          </section>

          {/* SG-delta */}
          <FremgangSeksjon
            sgDeltas={sgDeltas}
            periodeValgt={periodeValgt}
            q={q}
            spiller={spiller}
          />
        </>
      )}

      {/* Alltid vis fremgang for innlogget spiller når ingen er valgt */}
      {!valgt && (
        <FremgangSeksjon
          sgDeltas={sgDeltas}
          periodeValgt={periodeValgt}
          q={q}
          spiller={spiller}
        />
      )}
    </div>
  );
}

function FremgangSeksjon({
  sgDeltas,
  periodeValgt,
  q,
  spiller,
}: {
  sgDeltas: SgDelta[];
  periodeValgt: Periode;
  q?: string;
  spiller?: string;
}) {
  return (
    <section aria-label="Fremgang over tid" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          Din fremgang
        </span>
        <PeriodePicker aktiv={periodeValgt} q={q} spiller={spiller} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {sgDeltas.map((d) => (
          <SgDeltaKort key={d.label} delta={d} />
        ))}
      </div>
    </section>
  );
}

function PeriodePicker({
  aktiv,
  q,
  spiller,
}: {
  aktiv: Periode;
  q?: string;
  spiller?: string;
}) {
  const perioder: { key: Periode; label: string }[] = [
    { key: "30d", label: "30 d" },
    { key: "90d", label: "90 d" },
    { key: "1ar", label: "1 år" },
  ];
  return (
    <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
      {perioder.map((p) => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (spiller) params.set("spiller", spiller);
        params.set("periode", p.key);
        return (
          <a
            key={p.key}
            href={`/portal/talent/sammenligning?${params.toString()}`}
            className={cn(
              "rounded-md px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] transition-colors",
              p.key === aktiv
                ? "bg-primary text-accent"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p.label}
          </a>
        );
      })}
    </div>
  );
}

function SgDeltaKort({ delta }: { delta: SgDelta }) {
  const diff =
    delta.no !== null && delta.da !== null ? delta.no - delta.da : null;
  const pos = diff !== null && diff >= 0;
  const DirIcon = diff === null ? Minus : pos ? TrendingUp : TrendingDown;
  const fmtSg = (v: number | null) => {
    if (v === null) return "—";
    return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(2).replace(".", ",");
  };
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3.5">
      <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
        {delta.label}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1 font-mono text-[22px] font-bold leading-none tabular-nums tracking-[-0.02em]",
          diff === null
            ? "text-muted-foreground"
            : pos
              ? "text-success"
              : "text-destructive",
        )}
      >
        <DirIcon className="h-4 w-4" strokeWidth={2} aria-hidden />
        {diff === null
          ? "—"
          : (pos ? "+" : "−") + Math.abs(diff).toFixed(2).replace(".", ",")}
      </span>
      <div className="flex justify-between font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
        <span>Nå: {fmtSg(delta.no)}</span>
        <span>Da: {fmtSg(delta.da)}</span>
      </div>
    </div>
  );
}

function CompareAxis({
  label,
  youLabel,
  youValue,
  otherLabel,
  otherValue,
}: {
  label: string;
  youLabel: string;
  youValue: number | null;
  otherLabel: string;
  otherValue: number | null;
}) {
  const youPct = youValue === null ? 0 : Math.max(0, Math.min(100, (youValue / 10) * 100));
  const otherPct =
    otherValue === null ? 0 : Math.max(0, Math.min(100, (otherValue / 10) * 100));

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-bold leading-snug text-foreground">{label}</h3>
      <div className="mt-3 flex flex-col gap-2.5">
        <Row label={youLabel} value={youValue} pct={youPct} colorClass="bg-primary" />
        <Row label={otherLabel} value={otherValue} pct={otherPct} colorClass="bg-muted-foreground" />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  pct,
  colorClass,
}: {
  label: string;
  value: number | null;
  pct: number;
  colorClass: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-xs font-semibold text-foreground">{label}</span>
        <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
          {value === null ? "—" : value.toFixed(1)} / 10
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full rounded-full", colorClass)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
