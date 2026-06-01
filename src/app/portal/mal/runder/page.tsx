/**
 * PlayerHQ · Mål · Runder — liste-siden.
 *
 * Port av design-fasit (SKJERMER-RUNDE-2-PLAYERHQ): runde-liste i queue-mønster
 * (dato + bane + score + vs-par + SG + ★beste), klikk → runde-detalj.
 * Aggregering ligger i lib/portal-runder/runder-list-data; siden gjør kun rendering.
 * Pro-versjon med 4 KPI-kort, filter-row og import/eksport-handlinger.
 */
import { Flag, Search, ChevronDown } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getRunderListModel } from "@/lib/portal-runder/runder-list-data";
import { RundeQueueList } from "@/components/portal/runder/runde-queue-list";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { NyRundeModal } from "./ny-runde-modal";
import { EksporterRunderModal } from "./eksporter-modal";
import { GolfBoxImportModal } from "@/components/shared/golfbox-import-modal";
import { TrackmanImportModal } from "@/components/shared/trackman-import-modal";

function formatSg(v: number | null | undefined): string {
  if (v == null) return "—";
  const formatted = v.toFixed(1).replace(".", ",");
  return v > 0 ? `+${formatted}` : formatted;
}

export default async function RunderPage() {
  const user = await requirePortalUser();
  const { rows, kpis, courses } = await getRunderListModel(user.id);
  const { total, snittScore, snittVsPar, beste, sgTotalSnitt } = kpis;

  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-4 pb-20 sm:px-6 md:space-y-8 md:pb-0">
      <PageHeader
        eyebrow="PlayerHQ · /portal/mal/runder"
        titleLead=""
        titleItalic={total > 0 ? `${total} runder` : "0 runder"}
        titleTrail={
          user.name ? `denne sesongen, ${user.name.split(" ")[0]}.` : "denne sesongen."
        }
        sub={
          total === 0
            ? "Ingen registrerte runder ennå. Logg din første runde for å se trender."
            : `Siste ${total} runder · sortert etter dato`
        }
        actions={<NyRundeModal courses={courses} />}
      />

      {courses.length === 0 && (
        <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          Ingen baner finnes i databasen. En administrator må opprette baner før
          du kan registrere runder.
        </div>
      )}

      {total === 0 ? (
        <EmptyState
          icon={Flag}
          titleItalic="Ingen runder"
          titleTrail="logget ennå"
          sub="Logg din første 18-hulls runde manuelt, eller koble til GolfBox for å importere automatisk fra din historikk."
          cta={
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <NyRundeModal courses={courses} />
              <span className="font-mono text-[11px] text-muted-foreground">
                eller
              </span>
              <GolfBoxImportModal variant="secondary" />
            </div>
          }
        />
      ) : (
        <>
          {/* KPI-strip */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Snitt-score"
              value={snittScore?.toFixed(1).replace(".", ",") ?? "—"}
              sub={`${total} runder`}
            />
            <KpiCard
              label="Vs par snitt"
              value={
                snittVsPar == null
                  ? "—"
                  : `${snittVsPar > 0 ? "+" : ""}${snittVsPar.toFixed(1).replace(".", ",")}`
              }
              sub="snitt over par"
            />
            <KpiCard
              label="Beste runde"
              value={beste ? `${beste.score}` : "—"}
              unit={
                beste ? `${beste.vsPar > 0 ? "+" : ""}${beste.vsPar} · ${beste.courseName}` : ""
              }
              sub={
                beste
                  ? beste.playedAt.toLocaleDateString("nb-NO", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : ""
              }
            />
            <KpiCard
              label="SG total snitt"
              value={formatSg(sgTotalSnitt)}
              sub="basert på registrert data"
            />
          </div>

          {/* Filter-row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-52">
              <Search
                size={13}
                strokeWidth={1.75}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                aria-label="Søk bane"
                placeholder="Søk bane..."
                className="h-11 w-full rounded-md border border-border bg-card py-2 pl-10 pr-4 text-base outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-primary sm:h-auto sm:text-sm"
              />
            </div>
            <Chip>
              Bane: Alle <ChevronDown size={11} strokeWidth={1.75} />
            </Chip>
            <Chip>
              Periode: Sesongen <ChevronDown size={11} strokeWidth={1.75} />
            </Chip>
            <Chip>
              Tee: Alle <ChevronDown size={11} strokeWidth={1.75} />
            </Chip>
            <div className="inline-flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto">
              <EksporterRunderModal />
              <GolfBoxImportModal variant="secondary" />
              <TrackmanImportModal variant="secondary" label="Importer TrackMan" />
            </div>
          </div>

          {/* Rundeliste — queue-mønster */}
          <RundeQueueList rows={rows} />
        </>
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs text-foreground">
      {children}
    </span>
  );
}

function KpiCard({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1 font-mono text-3xl font-semibold leading-tight text-foreground tabular-nums">
        <span>{value}</span>
        {unit && (
          <span className="font-mono text-xs font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      <div className="mt-2 font-mono text-[11px] text-primary">{sub}</div>
    </div>
  );
}
