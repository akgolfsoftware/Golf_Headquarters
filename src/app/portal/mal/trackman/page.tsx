import Link from "next/link";
import { Activity, ArrowRight, ChevronRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/empty-state";
import { TrackmanImportModal } from "@/components/shared/trackman-import-modal";
import { CsvImportModal } from "./csv-import-modal";
import { HtmlImportModal } from "./html-import-modal";
import type { TrackManEnvironment } from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// TrackMan — liste over alle importerte økter
// Sortert nyeste først. Klikk på en rad → [id]/page.tsx (sesjonsdetalj).
// Ingen hardkodede tall — tom tilstand hvis ingen økt er importert.
// ---------------------------------------------------------------------------

const ENV_LABEL: Record<TrackManEnvironment, string> = {
  SIMULATOR_INDOOR: "Simulator innendørs",
  NET_INDOOR: "Nett innendørs",
  RANGE_OUTDOOR_MAT: "Range utendørs (matte)",
  RANGE_OUTDOOR_GRASS: "Range utendørs (gress)",
  COURSE_PRACTICE: "Banen (trening)",
  COURSE_COMPETITION: "Banen (konkurranse)",
};

const SOURCE_LABEL: Record<string, string> = {
  "csv-import": "CSV",
  "html-import": "HTML",
  api: "TrackMan API",
};

export default async function TrackManListePage() {
  const user = await requirePortalUser();

  const okter = await prisma.trackManSession.findMany({
    where: { userId: user.id },
    orderBy: { recordedAt: "desc" },
    select: {
      id: true,
      recordedAt: true,
      source: true,
      shotCount: true,
      environment: true,
    },
  });

  if (okter.length === 0) {
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

  return (
    <div className="mx-auto max-w-[1240px] space-y-4 px-4 pb-20 sm:px-6 md:pb-0">
      {/* Topptekst */}
      <div>
        <span className="mb-2 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          TrackMan · sesjonsanalyse
        </span>
        <h1 className="font-display text-[28px] font-medium italic leading-tight tracking-tight md:text-[36px]">
          <em>Range-analyse</em> per kølle
        </h1>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          {okter.length} {okter.length === 1 ? "økt" : "økter"} registrert · nyeste først
        </p>
      </div>

      {/* Import-knapper */}
      <div className="flex flex-wrap gap-2">
        <TrackmanImportModal variant="primary" label="Importer ny økt" />
        <CsvImportModal />
        <HtmlImportModal />
      </div>

      {/* Sesjonsliste */}
      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        <ul className="divide-y divide-border">
          {okter.map((okt) => {
            const dato = okt.recordedAt.toLocaleDateString("nb-NO", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
            const datoLang = okt.recordedAt.toLocaleDateString("nb-NO", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            const kilde = SOURCE_LABEL[okt.source] ?? okt.source;
            const miljo = okt.environment ? ENV_LABEL[okt.environment] : null;

            return (
              <li key={okt.id}>
                <Link
                  href={`/portal/mal/trackman/${okt.id}`}
                  className="group flex items-center gap-4 px-4 py-3.5 transition hover:bg-secondary"
                >
                  {/* Dato-badge */}
                  <div className="flex w-[52px] shrink-0 flex-col items-center rounded-lg bg-secondary px-2 py-1.5 text-center group-hover:bg-background">
                    <span className="font-mono text-[16px] font-bold leading-none tabular-nums text-foreground">
                      {okt.recordedAt.getDate().toString().padStart(2, "0")}
                    </span>
                    <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                      {okt.recordedAt.toLocaleDateString("nb-NO", { month: "short" })}
                    </span>
                  </div>

                  {/* Hoveddel */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold leading-snug text-foreground">
                      {datoLang}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {okt.shotCount} slag · {kilde}
                      {miljo ? ` · ${miljo}` : ""}
                    </p>
                  </div>

                  {/* Høyre */}
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="hidden font-mono text-[10px] text-muted-foreground sm:block">
                      {dato}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Coach-vurdering */}
      <div className="flex justify-end">
        <Link
          href="/portal/coach/melding?type=trackman-vurdering"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium hover:bg-secondary"
        >
          Be om coach-vurdering
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
