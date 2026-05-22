/**
 * CoachHQ — Effekt-detalj for én PlanTemplate.
 *
 * Viser alle PlanEffectiveness-rader for denne malen, med SG-deltas,
 * completion-rate, ratings og notater. KPI-strip og trend-graf hjelper coach
 * å vurdere om malen faktisk virker.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  LineChart as LineChartIcon,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";

type Params = Promise<{ id: string }>;

function formatDelta(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2).replace(".", ",")}`;
}

function formatProsent(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return `${Math.round(v * 100)} %`;
}

function deltaKlasse(v: number | null): string {
  if (v === null) return "text-muted-foreground";
  if (v > 0.05) return "text-primary";
  if (v < -0.05) return "text-destructive";
  return "text-muted-foreground";
}

function snitt(verdier: (number | null)[]): number | null {
  const filtered = verdier.filter((v): v is number => v !== null);
  if (filtered.length === 0) return null;
  return filtered.reduce((sum, v) => sum + v, 0) / filtered.length;
}

function manedNokkel(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function manedLabel(nokkel: string): string {
  const [aar, maaned] = nokkel.split("-");
  const m = Number(maaned);
  const NAVN = [
    "jan",
    "feb",
    "mar",
    "apr",
    "mai",
    "jun",
    "jul",
    "aug",
    "sep",
    "okt",
    "nov",
    "des",
  ];
  return `${NAVN[m - 1] ?? maaned} ${aar?.slice(2) ?? ""}`;
}

export default async function TemplateEffectiveness({
  params,
}: {
  params: Params;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const template = await prisma.planTemplate.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      varighetUker: true,
      kategori: true,
      lPhase: true,
      usageCount: true,
      effectivenessAvg: true,
    },
  });
  if (!template) notFound();

  const rader = await prisma.planEffectiveness.findMany({
    where: { templateId: id },
    orderBy: { computedAt: "desc" },
    select: {
      id: true,
      planId: true,
      userId: true,
      sgTotalDelta: true,
      sgOttDelta: true,
      sgAppDelta: true,
      sgArgDelta: true,
      sgPuttDelta: true,
      completionRate: true,
      selfRating: true,
      coachRating: true,
      notes: true,
      computedAt: true,
      plan: { select: { id: true, name: true, startDate: true, endDate: true } },
      user: { select: { id: true, name: true } },
    },
  });

  // KPI-strip
  const snittCompletion = snitt(rader.map((r) => r.completionRate));
  const snittSgTotal = snitt(rader.map((r) => r.sgTotalDelta));
  const snittSgPutt = snitt(rader.map((r) => r.sgPuttDelta));

  // Trend per måned (snitt SG-Total-delta gruppert på computedAt)
  const perManed = new Map<string, number[]>();
  for (const r of rader) {
    if (r.sgTotalDelta === null) continue;
    const key = manedNokkel(r.computedAt);
    const arr = perManed.get(key) ?? [];
    arr.push(r.sgTotalDelta);
    perManed.set(key, arr);
  }
  const trend = Array.from(perManed.entries())
    .map(([key, arr]) => ({
      maned: key,
      snitt: arr.reduce((sum, v) => sum + v, 0) / arr.length,
      antall: arr.length,
    }))
    .sort((a, b) => a.maned.localeCompare(b.maned));

  const maxAbs = trend.reduce((m, t) => Math.max(m, Math.abs(t.snitt)), 0.1);

  return (
    <div className="space-y-8">
      <Link
        href={`/admin/plans/templates/${id}/rediger`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Tilbake til mal
      </Link>

      <PageHeader
        eyebrow={`CoachHQ · Maler · ${template.kategori} · ${template.lPhase}`}
        titleLead="Effekt av mal"
        titleItalic={template.name}
        sub={
          template.description ??
          "Pre/post SG-deltas, completion-rate og ratings fra alle fullførte planer som har brukt denne malen."
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Brukt totalt"
          value={String(template.usageCount)}
          sub="ganger"
          icon={Users}
        />
        <KpiCard
          label="Snitt completion"
          value={formatProsent(snittCompletion)}
          sub="av planlagte økter"
          icon={CheckCircle2}
        />
        <KpiCard
          label="Snitt SG-Total"
          value={formatDelta(snittSgTotal)}
          sub="delta etter plan"
          icon={snittSgTotal !== null && snittSgTotal >= 0 ? TrendingUp : TrendingDown}
          tone={snittSgTotal !== null ? deltaKlasse(snittSgTotal) : ""}
        />
        <KpiCard
          label="Snitt SG-Putt"
          value={formatDelta(snittSgPutt)}
          sub="delta etter plan"
          icon={snittSgPutt !== null && snittSgPutt >= 0 ? TrendingUp : TrendingDown}
          tone={snittSgPutt !== null ? deltaKlasse(snittSgPutt) : ""}
        />
      </div>

      {/* Trend-graf */}
      {trend.length > 0 && (
        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <LineChartIcon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <h2 className="font-display text-[16px] font-semibold leading-tight">
              Snitt SG-Total-delta per måned
            </h2>
          </div>
          <div className="flex h-40 items-end gap-3">
            {trend.map((t) => {
              const høyde = Math.min(100, (Math.abs(t.snitt) / maxAbs) * 100);
              const positiv = t.snitt >= 0;
              return (
                <div
                  key={t.maned}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span
                    className={`font-mono text-[10px] tabular-nums ${
                      positiv ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {formatDelta(t.snitt)}
                  </span>
                  <div className="flex h-24 w-full items-end justify-center">
                    <div
                      className={`w-full rounded-sm ${
                        positiv ? "bg-primary" : "bg-destructive"
                      }`}
                      style={{ height: `${Math.max(4, høyde)}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                    {manedLabel(t.maned)}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground tabular-nums">
                    n={t.antall}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tabell */}
      <section className="rounded-lg border border-border bg-card">
        <header className="border-b border-border px-6 py-4">
          <h2 className="font-display text-[16px] font-semibold leading-tight">
            Detaljer per plan
          </h2>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {rader.length} {rader.length === 1 ? "rad" : "rader"} med
            effekt-data.
          </p>
        </header>

        {rader.length === 0 ? (
          <div className="p-12 text-center text-[13px] text-muted-foreground">
            Ingen fullførte planer har brukt denne malen ennå.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-background/50 text-left font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Spiller</th>
                  <th className="px-3 py-3 font-medium">Plan</th>
                  <th className="px-3 py-3 font-medium">Periode</th>
                  <th className="px-3 py-3 text-right font-medium">Completion</th>
                  <th className="px-3 py-3 text-right font-medium">SG-T</th>
                  <th className="px-3 py-3 text-right font-medium">OTT</th>
                  <th className="px-3 py-3 text-right font-medium">APP</th>
                  <th className="px-3 py-3 text-right font-medium">ARG</th>
                  <th className="px-3 py-3 text-right font-medium">PUTT</th>
                  <th className="px-3 py-3 text-right font-medium">Self/Coach</th>
                  <th className="px-6 py-3 font-medium">Notater</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rader.map((r) => {
                  const periode = `${r.plan.startDate.toLocaleDateString("nb-NO", {
                    day: "2-digit",
                    month: "short",
                  })} – ${
                    r.plan.endDate
                      ? r.plan.endDate.toLocaleDateString("nb-NO", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "pågår"
                  }`;
                  return (
                    <tr
                      key={r.id}
                      className="transition-colors hover:bg-background/40"
                    >
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/spillere/${r.user.id}?tab=treningsplan`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {r.user.name}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        <Link
                          href={`/admin/plans/${r.plan.id}`}
                          className="hover:text-foreground hover:underline"
                        >
                          {r.plan.name}
                        </Link>
                      </td>
                      <td className="px-3 py-3 font-mono tabular-nums text-muted-foreground">
                        {periode}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums">
                        {formatProsent(r.completionRate)}
                      </td>
                      <td
                        className={`px-3 py-3 text-right font-mono font-semibold tabular-nums ${deltaKlasse(r.sgTotalDelta)}`}
                      >
                        {formatDelta(r.sgTotalDelta)}
                      </td>
                      <td
                        className={`px-3 py-3 text-right font-mono tabular-nums ${deltaKlasse(r.sgOttDelta)}`}
                      >
                        {formatDelta(r.sgOttDelta)}
                      </td>
                      <td
                        className={`px-3 py-3 text-right font-mono tabular-nums ${deltaKlasse(r.sgAppDelta)}`}
                      >
                        {formatDelta(r.sgAppDelta)}
                      </td>
                      <td
                        className={`px-3 py-3 text-right font-mono tabular-nums ${deltaKlasse(r.sgArgDelta)}`}
                      >
                        {formatDelta(r.sgArgDelta)}
                      </td>
                      <td
                        className={`px-3 py-3 text-right font-mono tabular-nums ${deltaKlasse(r.sgPuttDelta)}`}
                      >
                        {formatDelta(r.sgPuttDelta)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-muted-foreground">
                        {r.selfRating ? r.selfRating.toFixed(1).replace(".", ",") : "—"}
                        {" / "}
                        {r.coachRating
                          ? r.coachRating.toFixed(1).replace(".", ",")
                          : "—"}
                      </td>
                      <td
                        className="max-w-[220px] truncate px-6 py-3 text-muted-foreground"
                        title={r.notes ?? undefined}
                      >
                        {r.notes ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Users;
  tone?: string;
}) {
  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
        {label}
      </div>
      <div
        className={`font-mono text-[28px] font-semibold leading-none tabular-nums ${tone ?? "text-foreground"}`}
      >
        {value}
      </div>
      <div className="mt-2 text-[12px] text-muted-foreground">{sub}</div>
    </article>
  );
}
