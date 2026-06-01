import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/empty-state";
import { TrackmanImportModal } from "@/components/shared/trackman-import-modal";
import { analyzeSession } from "@/lib/portal-trackman/session-analysis";
import { SessionHeader } from "@/components/portal/trackman/session-header";
import { SessionAnalysisClient } from "@/components/portal/trackman/session-analysis-client";
import { CsvImportModal } from "./csv-import-modal";
import { HtmlImportModal } from "./html-import-modal";

// ---------------------------------------------------------------------------
// TrackMan sesjonsanalyse (Bag-view)
// FASIT: public/design-handover/playerhq/components-trackman.html
//
// Server component: laster siste økt + alle slag, aggregerer per kølle
// (lib/portal-trackman/session-analysis) og rendrer header (AI-funn) +
// interaktiv bag/dispersjon/parameter-klient. Ingen falske tall — mangler
// data → utledet/tom tilstand.
// ---------------------------------------------------------------------------

export default async function TrackManSessionPage() {
  const user = await requirePortalUser();

  // Antall økter totalt (for footer-lenke) + siste økt med slag
  const [total, latest] = await Promise.all([
    prisma.trackManSession.count({ where: { userId: user.id } }),
    prisma.trackManSession.findFirst({
      where: { userId: user.id },
      orderBy: { recordedAt: "desc" },
      include: { shots: true },
    }),
  ]);

  // Tom tilstand — ingen TrackMan-data importert ennå
  if (!latest) {
    return (
      <div className="mx-auto max-w-[1240px] space-y-6 px-4 pb-20 sm:px-6 md:pb-0">
        <div>
          <span className="mb-2 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            TrackMan · sesjonsanalyse
          </span>
          <h1 className="font-display text-[28px] font-medium italic leading-tight tracking-tight md:text-[36px]">
            <em>Range-analyse</em> per kølle
          </h1>
        </div>
        <EmptyState
          icon={Activity}
          titleItalic="Ingen TrackMan-data"
          titleTrail="importert ennå"
          sub="Importer din første økt for å se spredning, stabilitet og full parameter-tabell per kølle."
          cta={
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <TrackmanImportModal variant="primary" label="Importer TrackMan" />
                <CsvImportModal />
                <HtmlImportModal />
              </div>
              <p className="rounded-md bg-secondary px-4 py-2 text-left font-mono text-[11px] leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Eksporter fra TrackMan:</strong>
                <br />
                CSV: Sessions → velg økt → Export → CSV
                <br />
                HTML: Åpne Multi Group Report i nettleseren → Lagre som HTML
              </p>
            </div>
          }
        />
      </div>
    );
  }

  const analysis = analyzeSession({
    id: latest.id,
    recordedAt: latest.recordedAt,
    shotCount: latest.shotCount,
    shots: latest.shots,
  });

  const eyebrowDate = latest.recordedAt.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const importedLabel = latest.recordedAt.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
  });
  const sourceLabel =
    latest.source === "api"
      ? `TrackMan API · ${importedLabel}`
      : `CSV importert ${importedLabel}`;

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <div className="mx-auto max-w-[1360px] space-y-4 px-4 py-2 sm:px-6">
        <SessionHeader
          eyebrowDate={eyebrowDate}
          shotCount={analysis.shotCount}
          durationMin={analysis.durationMin}
          sessionStability={analysis.sessionStability}
          findings={analysis.findings}
          sourceLabel={sourceLabel}
        />

        <SessionAnalysisClient clubs={analysis.clubs} />

        {/* Import-handlinger + lenke til alle økter */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] border border-border bg-card px-4 py-3.5">
          <div className="flex flex-wrap gap-2">
            <TrackmanImportModal variant="primary" label="Importer ny økt" />
            <CsvImportModal />
            <HtmlImportModal />
          </div>
          <Link
            href="/portal/coach/melding?type=trackman-vurdering"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium hover:bg-secondary"
          >
            Be om coach-vurdering
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <p className="px-1 text-center font-mono text-[11px] text-muted-foreground">
          Datakilde · {analysis.clubsWithData} køller med data ·{" "}
          {total} {total === 1 ? "økt" : "økter"} totalt registrert
        </p>
      </div>
    </div>
  );
}
