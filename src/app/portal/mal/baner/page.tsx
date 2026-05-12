/**
 * PlayerHQ · Mål · Baner
 *
 * Migrert til produksjonsdesign med PageHeader (italic Instrument Serif),
 * semantiske tokens og 8pt-grid. EmptyState når ingen baner finnes.
 */

import { MapPinned } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default async function BanerPage() {
  const user = await requirePortalUser();

  const [courses, runder] = await Promise.all([
    prisma.courseDefinition.findMany({ orderBy: { name: "asc" } }),
    prisma.round.findMany({
      where: { userId: user.id },
      select: { courseId: true, sgTotal: true },
    }),
  ]);

  // Aggreger SG per bane for innlogget bruker
  const sgPerBane = new Map<
    string,
    { antall: number; sgSum: number; sgCount: number }
  >();
  for (const r of runder) {
    const eksisterende =
      sgPerBane.get(r.courseId) ?? { antall: 0, sgSum: 0, sgCount: 0 };
    eksisterende.antall += 1;
    if (r.sgTotal != null) {
      eksisterende.sgSum += r.sgTotal;
      eksisterende.sgCount += 1;
    }
    sgPerBane.set(r.courseId, eksisterende);
  }

  const subTekst =
    courses.length === 0
      ? "Ingen baner i databasen ennå."
      : `${courses.length} baner registrert. Statistikk vises for dine runder.`;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Baner"
        titleLead="Banebibliotek"
        titleItalic="og resultater"
        sub={subTekst}
      />

      {user.role === "ADMIN" && (
        <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          Bane-administrasjon (CRUD) bygges i CoachHQ Fase 2.x. Per nå kan du
          legge til baner direkte i databasen.
        </div>
      )}

      {courses.length === 0 ? (
        <EmptyState
          icon={MapPinned}
          titleItalic="Ingen baner"
          titleTrail="registrert"
          sub="Når baner er importert eller lagt inn av administrator dukker de opp her — med dine SG-snitt per bane."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => {
            const stats = sgPerBane.get(c.id);
            const sgSnitt =
              stats && stats.sgCount > 0 ? stats.sgSum / stats.sgCount : null;
            return (
              <div
                key={c.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="font-display text-base font-semibold text-foreground">
                  {c.name}
                </div>
                <div className="mt-2 flex gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  <span>par {c.par}</span>
                  {c.rating && <span>rating {c.rating}</span>}
                  {c.slope && <span>slope {c.slope}</span>}
                </div>
                <div className="mt-4 flex justify-between border-t border-border pt-4 text-xs">
                  <span className="text-muted-foreground">
                    {stats?.antall ?? 0} runder
                  </span>
                  <span className="tabular-nums text-foreground">
                    SG{" "}
                    {sgSnitt != null
                      ? (sgSnitt >= 0 ? "+" : "") +
                        sgSnitt.toFixed(1).replace(".", ",")
                      : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
