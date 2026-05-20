/**
 * PlayerHQ — Talent · Sammenligning
 *
 * Side-by-side med en annen spiller på samme nivå:
 *  - Søk via URL-param (?q=...) eller dropdown med spillere på samme nivå
 *  - Velg motspiller via ?spiller=<userId>
 *  - Overlapping radar + bar-grafer per akse
 *  - "Anonymiser meg"-toggle (lagres i preferences)
 */

import { ArrowLeftRight, Users } from "lucide-react";
import Link from "next/link";

import { TalentHero } from "@/components/portal/talent/talent-hero";
import {
  AXIS_KEYS,
  AXIS_LABELS,
  RadarChart,
  type RadarValues,
} from "@/components/portal/talent/radar-chart";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

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

  // Periode-filter for HCP og SG delta
  const periodeValgt: Periode =
    periode === "90d" ? "90d" : periode === "1ar" ? "1ar" : "30d";
  const dager = periodeValgt === "1ar" ? 365 : periodeValgt === "90d" ? 90 : 30;
  const periodeStart = new Date();
  periodeStart.setDate(periodeStart.getDate() - dager);

  // HCP og SG siste runde i perioden vs første runde i perioden
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

  function snitt(runder: { sgTotal: number | null; sgApp: number | null; sgArg: number | null; sgPutt: number | null }[], felt: "sgTotal" | "sgApp" | "sgArg" | "sgPutt"): number | null {
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
    <div className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6 sm:py-8 md:px-8 md:py-12 md:pb-12">
      <TalentHero
        eyebrow="PlayerHQ · Talent · Sammenligning"
        italic="Sammenlign"
        rest={`deg med en annen på ${mineData.niva}`}
        lead="Velg en spiller på samme nivå for å se hvordan dere ligger mot hverandre. Vil du ikke at andre skal se navnet ditt? Skru på «Anonymiser meg»."
        right={<AnonymiserToggle initial={minAnonymisert} />}
      />

      {/* Søk + dropdown */}
      <section
        aria-label="Velg motspiller"
        className="mb-8 rounded-lg border border-border bg-card p-6"
      >
        <form
          action="/portal/talent/sammenligning"
          method="get"
          className="flex flex-col gap-3 md:flex-row md:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="q"
              className="block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
            >
              Søk etter navn
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q ?? ""}
              placeholder={`Søk blant spillere på ${mineData.niva}`}
              className="mt-2 w-full rounded-md border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="spiller"
              className="block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
            >
              Velg fra liste
            </label>
            <select
              id="spiller"
              name="spiller"
              defaultValue={spiller ?? ""}
              className="mt-2 w-full rounded-md border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
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
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <ArrowLeftRight size={16} strokeWidth={1.5} aria-hidden />
            Sammenlign
          </button>
        </form>
        {q && kandidater.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Ingen treff på &laquo;{q}&raquo; på {mineData.niva}-nivå.
          </p>
        ) : null}
      </section>

      {!valgt || !annen ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <Users
            size={32}
            strokeWidth={1.5}
            className="mx-auto text-muted-foreground"
            aria-hidden
          />
          <p className="mt-4 text-sm text-muted-foreground">
            Velg en spiller fra lista eller søk for å se sammenligning.
          </p>
        </div>
      ) : (
        <>
          {/* Overlapping radar */}
          <section
            aria-label="Radar-sammenligning"
            className="mb-8 grid grid-cols-1 gap-6 rounded-lg border border-border bg-card p-6 md:grid-cols-2 md:p-8"
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
                size={420}
              />
            </div>
            <div className="flex flex-col justify-center gap-4">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl font-medium tracking-tight">
                  {mittNavn}
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  {mineData.klubb ?? "—"}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl font-medium tracking-tight text-muted-foreground">
                  {annenNavn}
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  {valgt.klubb ?? "—"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Sammenligningen er kun synlig for deg. Notater og personlige
                detaljer deles aldri uten samtykke.
              </p>
              <Link
                href="/portal/talent/sammenligning"
                className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground hover:opacity-90"
              >
                Tilbakestill
              </Link>
            </div>
          </section>

          {/* Side-by-side bar-grafer */}
          <section aria-label="Akser i detalj">
            <h2 className="mb-6 font-display text-2xl font-medium tracking-tight">
              Akser side om side
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          {/* HCP og SG delta over valgt periode */}
          <section aria-label="Fremgang over tid" className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-medium tracking-tight">
                Din fremgang
              </h2>
              <PeriodePicker aktiv={periodeValgt} q={q} spiller={spiller} />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {sgDeltas.map((d) => (
                <SgDeltaKort key={d.label} delta={d} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Alltid vis fremgang-seksjon for innlogget spiller */}
      {!valgt && (
        <section aria-label="Fremgang over tid" className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-medium tracking-tight">
              Din fremgang
            </h2>
            <PeriodePicker aktiv={periodeValgt} q={q} spiller={spiller} />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {sgDeltas.map((d) => (
              <SgDeltaKort key={d.label} delta={d} />
            ))}
          </div>
        </section>
      )}
    </div>
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
    { key: "30d", label: "30 dager" },
    { key: "90d", label: "90 dager" },
    { key: "1ar", label: "1 år" },
  ];
  return (
    <div className="flex gap-1 rounded-md border border-border bg-card p-1">
      {perioder.map((p) => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (spiller) params.set("spiller", spiller);
        params.set("periode", p.key);
        return (
          <a
            key={p.key}
            href={`/portal/talent/sammenligning?${params.toString()}`}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
              p.key === aktiv
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
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
  const fmtSg = (v: number | null) => {
    if (v === null) return "—";
    return (v >= 0 ? "+" : "") + v.toFixed(2).replace(".", ",");
  };
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {delta.label}
      </div>
      <div
        className={`mt-2 font-mono text-2xl font-medium tabular-nums ${
          diff === null
            ? "text-muted-foreground"
            : pos
              ? "text-primary"
              : "text-destructive"
        }`}
      >
        {diff === null ? "—" : (pos ? "+" : "") + diff.toFixed(2).replace(".", ",")}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
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
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="font-display text-lg font-medium leading-snug">{label}</h3>
      <div className="mt-4 space-y-3">
        <Row
          label={youLabel}
          value={youValue}
          pct={youPct}
          colorClass="bg-primary"
        />
        <Row
          label={otherLabel}
          value={otherValue}
          pct={otherPct}
          colorClass="bg-muted-foreground"
        />
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
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium">{label}</span>
        <span className="font-mono tabular-nums text-muted-foreground">
          {value === null ? "—" : value.toFixed(1)} / 10
        </span>
      </div>
      <div
        className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary"
        role="presentation"
      >
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
