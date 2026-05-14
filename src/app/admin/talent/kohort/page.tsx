/**
 * /admin/talent/kohort — K3 Kohort-analyse
 *
 * Grupperer alle TalentTracking-rader per nivå (U10..Senior).
 * For hver kohort: antall, snitt-radar (5 akser), progresjon siste 3 mnd.
 * Designet hentet fra src/app/talent-kohort-demo/page.tsx — produksjons-versjon.
 *
 * Roller: COACH, ADMIN.
 */

import Link from "next/link";
import { ArrowRight, Layers, TrendingUp, Users } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

const NIVAER = ["U10", "U12", "U14", "U16", "U18", "Senior"] as const;
type Niva = (typeof NIVAER)[number];

type RadarKey = "fysisk" | "teknikk" | "taktikk" | "mental" | "motivasjon";
const RADAR_AKSER: { key: RadarKey; label: string }[] = [
  { key: "fysisk", label: "Fysisk" },
  { key: "teknikk", label: "Teknikk" },
  { key: "taktikk", label: "Taktikk" },
  { key: "mental", label: "Mental" },
  { key: "motivasjon", label: "Motivasjon" },
];

type KohortAgg = {
  niva: Niva;
  antall: number;
  snitt: Record<RadarKey, number | null>;
  total: number | null;
  progresjon: number; // antall registrert siste 90 dager
};

function avg(values: Array<number | null | undefined>): number | null {
  const filtered = values.filter((v): v is number => typeof v === "number");
  if (filtered.length === 0) return null;
  return filtered.reduce((sum, v) => sum + v, 0) / filtered.length;
}

function fmt1(n: number | null): string {
  if (n == null) return "—";
  return n.toFixed(1).replace(".", ",");
}

export default async function TalentKohort() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const tracking = await prisma.talentTracking.findMany({
    select: {
      niva: true,
      fysisk: true,
      teknikk: true,
      taktikk: true,
      mental: true,
      motivasjon: true,
      inkludertFra: true,
    },
  });

  const tre_mnd_siden = new Date();
  tre_mnd_siden.setMonth(tre_mnd_siden.getMonth() - 3);

  const kohorter: KohortAgg[] = NIVAER.map((niva) => {
    const rader = tracking.filter((t) => t.niva === niva);
    const snitt: Record<RadarKey, number | null> = {
      fysisk: avg(rader.map((r) => r.fysisk)),
      teknikk: avg(rader.map((r) => r.teknikk)),
      taktikk: avg(rader.map((r) => r.taktikk)),
      mental: avg(rader.map((r) => r.mental)),
      motivasjon: avg(rader.map((r) => r.motivasjon)),
    };
    const totalSnitt = avg(Object.values(snitt));
    const progresjon = rader.filter(
      (r) => new Date(r.inkludertFra) >= tre_mnd_siden,
    ).length;
    return {
      niva,
      antall: rader.length,
      snitt,
      total: totalSnitt,
      progresjon,
    };
  });

  const totalSpillere = tracking.length;
  const ikkeTomKohort = kohorter.filter((k) => k.antall > 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Talent · Kohort-analyse"
        titleItalic="Kohorter"
        titleTrail="på nivå"
        sub={`${totalSpillere} talent fordelt på U10–Senior. Snitt-radar og 90-dagers progresjon per nivå.`}
        actions={
          <Link
            href="/admin/talent"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowRight className="h-4 w-4 rotate-180" strokeWidth={1.5} />
            Tilbake til talent
          </Link>
        }
      />

      {totalSpillere === 0 ? (
        <EmptyState
          icon={Users}
          titleItalic="Ingen"
          titleTrail="talent registrert"
          sub="Talent-spillere må registreres via TalentTracking før kohort-analyse er meningsfull."
        />
      ) : (
        <>
          {/* Kohort-kort */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {kohorter.map((k) => (
              <div
                key={k.niva}
                className={`rounded-lg border p-6 ${k.antall > 0 ? "border-border bg-card" : "border-border bg-secondary/30"}`}
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  {k.niva}
                </div>
                <div className="mt-2 font-mono text-[28px] font-semibold leading-none tabular-nums">
                  {k.antall}
                </div>
                <div className="mt-2 font-mono text-[10px] text-muted-foreground">
                  snitt {fmt1(k.total)}/10
                </div>
                {k.progresjon > 0 && (
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-medium text-foreground">
                    <TrendingUp className="h-3 w-3" strokeWidth={1.5} />
                    +{k.progresjon} siste 90d
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* Tabell-grid: nivå × dimensjoner */}
          <section className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="border-b border-border bg-secondary px-6 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                <Layers className="mr-1 inline h-3 w-3" strokeWidth={1.5} />
                Snitt-radar per nivå (1–10)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      Nivå
                    </th>
                    <th className="px-4 py-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      Antall
                    </th>
                    {RADAR_AKSER.map((a) => (
                      <th
                        key={a.key}
                        className="px-4 py-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
                      >
                        {a.label}
                      </th>
                    ))}
                    <th className="px-4 py-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      Total
                    </th>
                    <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      90d
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {kohorter.map((k) => (
                    <tr
                      key={k.niva}
                      className={`border-b border-border last:border-b-0 ${k.antall === 0 ? "opacity-50" : ""}`}
                    >
                      <td className="px-6 py-4 font-semibold">{k.niva}</td>
                      <td className="px-4 py-4 font-mono tabular-nums">
                        {k.antall}
                      </td>
                      {RADAR_AKSER.map((a) => (
                        <td
                          key={a.key}
                          className="px-4 py-4 font-mono tabular-nums"
                        >
                          {fmt1(k.snitt[a.key])}
                        </td>
                      ))}
                      <td className="px-4 py-4 font-mono font-semibold tabular-nums text-primary">
                        {fmt1(k.total)}
                      </td>
                      <td className="px-6 py-4 font-mono tabular-nums text-muted-foreground">
                        +{k.progresjon}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {ikkeTomKohort.length === 0 && (
            <p className="text-[12px] text-muted-foreground">
              Ingen radar-data registrert ennå — vis nivå-fordeling.
            </p>
          )}
        </>
      )}
    </div>
  );
}
