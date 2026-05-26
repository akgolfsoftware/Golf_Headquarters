/**
 * /admin/talent — Talent-oversikt (M13 K2)
 *
 * Design: 06 Talent-modul.html · Skjerm 4 (Coach 2D-kart)
 * KPI-strip + 2D SVG talent-kart + nivå-fordeling + spillertabell
 *
 * Roller: ADMIN, COACH.
 */

import Link from "next/link";
import { Search, Sparkles, TrendingUp, Users } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";
import "@/components/talent/talent.css";

const NIVAA_REKKEFOLGE = ["U10", "U12", "U14", "U16", "U18", "Senior"] as const;

type Search = { niva?: string; region?: string };

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function radarSum(t: {
  fysisk: number | null;
  teknikk: number | null;
  taktikk: number | null;
  mental: number | null;
  motivasjon: number | null;
}): number {
  return (
    (t.fysisk ?? 0) +
    (t.teknikk ?? 0) +
    (t.taktikk ?? 0) +
    (t.mental ?? 0) +
    (t.motivasjon ?? 0)
  );
}

function radarSnitt(t: {
  fysisk: number | null;
  teknikk: number | null;
  taktikk: number | null;
  mental: number | null;
  motivasjon: number | null;
}): number | null {
  const verdier = [t.fysisk, t.teknikk, t.taktikk, t.mental, t.motivasjon].filter(
    (v): v is number => typeof v === "number",
  );
  if (verdier.length === 0) return null;
  return verdier.reduce((a, b) => a + b, 0) / verdier.length;
}

function fmtDato(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function TalentOversikt({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const params = await searchParams;
  const valgtNiva = params.niva ?? null;
  const valgtRegion = params.region ?? null;

  const alle = await prisma.talentTracking.findMany({
    include: { user: { select: { id: true, name: true, hcp: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const filtrert = alle.filter((t) => {
    if (valgtNiva && t.niva !== valgtNiva) return false;
    if (valgtRegion && t.region !== valgtRegion) return false;
    return true;
  });

  // KPI-tall
  const totalt = alle.length;
  const fordelingPerNiva: Record<string, number> = {};
  for (const n of NIVAA_REKKEFOLGE) fordelingPerNiva[n] = 0;
  for (const t of alle) {
    if (fordelingPerNiva[t.niva] !== undefined) {
      fordelingPerNiva[t.niva] += 1;
    }
  }

  const snittScorer = alle
    .map((t) => radarSnitt(t))
    .filter((v): v is number => v !== null);
  const snittRadar =
    snittScorer.length > 0
      ? snittScorer.reduce((a, b) => a + b, 0) / snittScorer.length
      : null;

  const sistOppdatert = alle[0]?.updatedAt ?? null;

  // Regioner i datasettet
  const regioner = Array.from(
    new Set(alle.map((t) => t.region).filter((r): r is string => Boolean(r))),
  ).sort();

  function lenke(extra: { niva?: string | null; region?: string | null }) {
    const sp = new URLSearchParams();
    const niva = extra.niva !== undefined ? extra.niva : valgtNiva;
    const region = extra.region !== undefined ? extra.region : valgtRegion;
    if (niva) sp.set("niva", niva);
    if (region) sp.set("region", region);
    const q = sp.toString();
    return q ? `/admin/talent?${q}` : "/admin/talent";
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Talent · M13"
        titleLead="Talent-"
        titleItalic="programmet"
        sub={`${totalt} spillere i tracking. Filtrer på nivå og region for å fokusere oppfølgingen.`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/talent/discovery"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Search className="h-4 w-4" strokeWidth={1.5} />
              Discovery
            </Link>
          </div>
        }
      />

      {/* KPI-strip */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiKort
          icon={Users}
          label="I tracking"
          verdi={totalt.toString()}
          sub="aktive spillere"
        />
        <KpiKort
          icon={TrendingUp}
          label="Snitt radar"
          verdi={snittRadar ? snittRadar.toFixed(1).replace(".", ",") : "—"}
          sub="av 10 mulige"
        />
        <KpiKort
          icon={Sparkles}
          label="Nivåer aktive"
          verdi={Object.values(fordelingPerNiva)
            .filter((v) => v > 0)
            .length.toString()}
          sub={`av ${NIVAA_REKKEFOLGE.length}`}
        />
        <KpiKort
          icon={TrendingUp}
          label="Sist oppdatert"
          verdi={fmtDato(sistOppdatert)}
          sub="tracking-rad"
        />
      </section>

      {/* 2D Talent-kart */}
      {alle.length > 0 && (() => {
        const hcpVals = alle.map((s) => s.user.hcp ?? 10);
        const hcpMin2 = Math.min(...hcpVals, -5);
        const hcpMax2 = Math.max(...hcpVals, 30);
        const hcpSpan2 = Math.max(hcpMax2 - hcpMin2, 1);
        const MAP_W = 900;
        const MAP_H = 420;
        const PAD = 40;
        const mapX2 = (hcp: number) => PAD + ((hcp - hcpMin2) / hcpSpan2) * (MAP_W - 2 * PAD);
        const mapY2 = (score: number) => (MAP_H - PAD) - (score / 10) * (MAP_H - 2 * PAD);
        const yTicks2 = [2, 4, 6, 8, 10];

        return (
          <section className="overflow-hidden rounded-xl border border-border bg-card p-6">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-semibold">
                  Stall-<em className="font-serif italic font-normal text-primary">talent</em> — 2D-kart
                </h3>
                <p className="font-mono text-[10px] text-muted-foreground">
                  X-akse: HCP · Y-akse: Talent-score · Boble = spiller
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/admin/talent/kohort" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary">
                  Kohort
                </Link>
                <Link href="/admin/talent/radar" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                  Radar
                </Link>
              </div>
            </div>

            <div className="mt-4 w-full overflow-x-auto">
              <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="h-auto w-full min-w-[560px]" aria-label="2D talent-kart">
                <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="hsl(var(--background))" rx="8" />
                {yTicks2.map((t) => (
                  <g key={t}>
                    <line x1={PAD} y1={mapY2(t)} x2={MAP_W - PAD} y2={mapY2(t)} stroke="var(--color-border)" strokeWidth="1" />
                    <text x={PAD - 6} y={mapY2(t) + 4} textAnchor="end" fontFamily="monospace" fontSize="10" fill="var(--color-muted-foreground)">{t}</text>
                  </g>
                ))}
                <text x={MAP_W / 2} y={MAP_H - 4} textAnchor="middle" fontFamily="monospace" fontSize="11" fontWeight="700" fill="var(--color-foreground)">HCP</text>
                <text x={14} y={MAP_H / 2} textAnchor="middle" fontFamily="monospace" fontSize="11" fontWeight="700" fill="var(--color-foreground)" transform={`rotate(-90 14 ${MAP_H / 2})`}>TALENT</text>
                {alle.map((s) => {
                  const hcp = s.user.hcp ?? 10;
                  const score = radarSnitt(s) ?? 0;
                  const x = mapX2(hcp);
                  const y = mapY2(score);
                  const fill = "var(--color-accent)";
                  const stroke = "var(--color-primary)";
                  return (
                    <g key={s.id} aria-label={`${s.user.name} HCP ${hcp}`}>
                      <circle cx={x} cy={y} r="16" fill={fill} stroke={stroke} strokeWidth="2" />
                      <text x={x} y={y + 4} textAnchor="middle" fontFamily="var(--font-inter-tight,sans-serif)" fontSize="9" fontWeight="700" fill="var(--color-foreground)">
                        {initials(s.user.name)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </section>
        );
      })()}

      {/* Nivå-fordeling */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Fordeling per nivå
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
          {NIVAA_REKKEFOLGE.map((n) => {
            const aktiv = valgtNiva === n;
            return (
              <Link
                key={n}
                href={lenke({ niva: aktiv ? null : n })}
                className={`rounded-lg border p-6 transition-colors ${
                  aktiv
                    ? "border-primary/40 bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div
                  className={`font-mono text-[10px] uppercase tracking-[0.10em] ${
                    aktiv ? "text-accent" : "text-muted-foreground"
                  }`}
                >
                  {n}
                </div>
                <div className="mt-2 font-mono text-[28px] font-semibold leading-none tabular-nums">
                  {fordelingPerNiva[n]}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Region-chips */}
      {regioner.length > 0 && (
        <section>
          <div className="mb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Region
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={lenke({ region: null })}
              className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${
                !valgtRegion
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Alle
            </Link>
            {regioner.map((r) => {
              const aktiv = valgtRegion === r;
              return (
                <Link
                  key={r}
                  href={lenke({ region: aktiv ? null : r })}
                  className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${
                    aktiv
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Tabell */}
      {filtrert.length === 0 ? (
        <EmptyState
          icon={Users}
          titleItalic="Ingen spillere"
          titleTrail="i tracking ennå"
          sub="Bruk Discovery-siden for å legge til spillere i talent-programmet."
          cta={
            <Link
              href="/admin/talent/discovery"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Åpne Discovery
            </Link>
          }
        />
      ) : (
        <section className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border bg-secondary px-6 py-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {filtrert.length} spillere
            </span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                <th className="px-6 py-4 font-medium">Spiller</th>
                <th className="px-4 py-4 font-medium">Nivå</th>
                <th className="px-4 py-4 font-medium">Klubb</th>
                <th className="px-4 py-4 font-medium">Region</th>
                <th className="px-4 py-4 text-right font-medium">Radar (sum)</th>
                <th className="px-4 py-4 font-medium">Sist møtt</th>
                <th className="px-6 py-4 font-medium">Profil</th>
              </tr>
            </thead>
            <tbody>
              {filtrert.map((t) => {
                const sum = radarSum(t);
                return (
                  <tr
                    key={t.id}
                    className="border-b border-border last:border-b-0 hover:bg-secondary/40"
                  >
                    <td className="px-6 py-4">
                      <div className="text-[13px] font-semibold leading-tight">
                        {t.user.name}
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        HCP {t.user.hcp?.toFixed(1).replace(".", ",") ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[12px]">{t.niva}</td>
                    <td className="px-4 py-4 text-[12px] text-muted-foreground">
                      {t.klubb ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-[12px] text-muted-foreground">
                      {t.region ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-[13px] tabular-nums">
                      {sum > 0 ? `${sum}/50` : "—"}
                    </td>
                    <td className="px-4 py-4 font-mono text-[11px] text-muted-foreground">
                      {fmtDato(t.updatedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/talent/radar/${t.user.id}`}
                        className="text-[12px] font-medium text-primary hover:underline"
                      >
                        Åpne radar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

function KpiKort({
  icon: Icon,
  label,
  verdi,
  sub,
}: {
  icon: typeof Users;
  label: string;
  verdi: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        <Icon className="h-3 w-3" strokeWidth={1.5} />
        {label}
      </div>
      <div className="mt-2 font-mono text-[24px] font-semibold tabular-nums leading-none">
        {verdi}
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
