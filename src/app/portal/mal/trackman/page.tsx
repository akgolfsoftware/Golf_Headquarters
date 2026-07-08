import Link from "next/link";
import { Activity, ArrowRight, ChevronRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { Button, Card, Eyebrow } from "@/components/athletic/golfdata";
import { EmptyState } from "@/components/shared/empty-state";
import { TrackmanImportModal } from "@/components/shared/trackman-import-modal";
import { CsvImportModal } from "./csv-import-modal";
import { HtmlImportModal } from "./html-import-modal";
import { TrackManTrendSeksjon, byggTrendData } from "./trend-seksjon";
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

  const [okter, clubSignaler] = await Promise.all([
    prisma.trackManSession.findMany({
      where: { userId: user.id },
      orderBy: { recordedAt: "desc" },
      select: {
        id: true,
        recordedAt: true,
        source: true,
        shotCount: true,
        environment: true,
        rawJson: true,
      },
    }),
    prisma.signal.findMany({
      where: { userId: user.id, kind: "CLUB_AVG" },
      select: { value: true, payload: true, computedAt: true },
      orderBy: { computedAt: "asc" },
    }),
  ]);

  if (okter.length === 0) {
    return (
      <div className="golfdata-scope mx-auto w-full max-w-[460px] space-y-6 px-4 py-6 sm:px-0 md:max-w-[720px]">
        <div>
          <Eyebrow className="mb-2" style={{ fontSize: "var(--text-11)", letterSpacing: "0.14em" }}>
            TrackMan · sesjonsanalyse
          </Eyebrow>
          <h1 className="font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[40px]">
            <span className="font-normal italic text-primary">Range-analyse</span>{" "}
            per kølle
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
    <div className="golfdata-scope mx-auto w-full max-w-[460px] space-y-6 px-4 py-6 sm:px-0 md:max-w-[720px] md:pb-0">
      {/* Topptekst */}
      <div>
        <Eyebrow className="mb-2" style={{ fontSize: "var(--text-11)", letterSpacing: "0.14em" }}>
          TrackMan · sesjonsanalyse
        </Eyebrow>
        <h1 className="font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[40px]">
          <span className="font-normal italic text-primary">Range-analyse</span>{" "}
          per kølle
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

      {/* Trend-seksjon (vises kun ved ≥ 2 sesjoner) */}
      <TrackManTrendSeksjon data={byggTrendData(okter, clubSignaler)} />

      {/* Sesjonsliste */}
      <div className="space-y-2">
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
            <Link key={okt.id} href={`/portal/mal/trackman/${okt.id}`} className="block">
              <Card interactive compact>
                <div className="flex items-center gap-4">
                  {/* Dato-badge */}
                  <div className="flex w-[52px] shrink-0 flex-col items-center rounded-lg bg-secondary px-2 py-1.5 text-center">
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
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Coach-vurdering */}
      <div className="flex justify-end pb-20 md:pb-0">
        <Button
          as={Link}
          href="/portal/coach/melding?type=trackman-vurdering"
          variant="secondary"
          size="sm"
          iconRight={<ArrowRight className="h-3.5 w-3.5" />}
        >
          Be om coach-vurdering
        </Button>
      </div>
    </div>
  );
}
