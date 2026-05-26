/**
 * PlayerHQ · Mål · TrackMan-økt-detalj
 *
 * Migrert til produksjonsdesign med PageHeader (italic Inter Tight),
 * semantiske tokens og 8pt-grid. EmptyState når per-kølle-stats mangler.
 */

import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";
import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { FEATURES } from "@/lib/features";
import { DispersionPlot } from "./dispersion-plot";

export default async function TrackManDetalj({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!FEATURES.TRACKMAN_DETAIL) notFound();

  const user = await requirePortalUser();
  const { id } = await params;

  const sesjon = await prisma.trackManSession.findUnique({
    where: { id },
  });
  if (!sesjon) notFound();
  if (
    sesjon.userId !== user.id &&
    user.role !== "ADMIN" &&
    user.role !== "COACH"
  ) {
    notFound();
  }

  // Hent CLUB_AVG-signals knyttet til denne sesjonen
  const signals = await prisma.signal.findMany({
    where: {
      userId: sesjon.userId,
      kind: "CLUB_AVG",
    },
    orderBy: { computedAt: "desc" },
  });

  const klubbStats = signals
    .filter((s) => {
      const p = s.payload as { sessionId?: string } | null;
      return p?.sessionId === sesjon.id;
    })
    .map((s) => {
      const p = s.payload as { klubb?: string; antallSlag?: number };
      return {
        klubb: p.klubb ?? "Ukjent",
        snittDistanse: s.value ?? 0,
        antallSlag: p.antallSlag ?? 0,
      };
    });

  const rader = Array.isArray(sesjon.rawJson)
    ? (sesjon.rawJson as Record<string, string>[])
    : [];

  const datoTekst = sesjon.recordedAt.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-[1240px] space-y-8 px-4 sm:px-6">
      <Link
        href="/portal/mal/trackman"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Alle TrackMan-økter
      </Link>

      <PageHeader
        eyebrow={`PlayerHQ · TrackMan · ${sesjon.source}`}
        titleLead="Økt"
        titleItalic={datoTekst}
        sub={`${sesjon.shotCount} slag registrert.`}
      />

      <section className="rounded-lg border border-border bg-card p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Slag-dispersion
        </span>
        <div className="mt-4">
          <DispersionPlot rader={rader} />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Per kølle (snitt-distanse)
        </span>
        {klubbStats.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Wrench}
              titleItalic="Beregner"
              titleTrail="per kølle"
              sub="Per-kølle-statistikk beregnes når trackman-agenten kjører. Trigges automatisk ved CSV-import."
            />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {klubbStats.map((s) => (
              <li
                key={s.klubb}
                className="flex items-center justify-between py-4 text-sm"
              >
                <div>
                  <span className="font-medium text-foreground">{s.klubb}</span>
                  <span className="ml-4 font-mono text-[10px] text-muted-foreground">
                    {s.antallSlag} slag
                  </span>
                </div>
                <span className="font-display text-lg font-semibold tabular-nums">
                  {s.snittDistanse.toFixed(0)} m
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
