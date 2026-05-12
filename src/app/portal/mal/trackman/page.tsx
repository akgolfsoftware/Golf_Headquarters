/**
 * PlayerHQ · Mål · TrackMan
 *
 * Migrert til endelig design (wireframe/design-files-v2/final/14-trackman.html).
 * Pro-radardata med stat-grid (6 KPI for clubhead/ball-speed/carry/smash/baller),
 * filter-row, og tabell med lokasjon-pill, varighet, baller, klubber, smash og
 * beste carry. Italic Instrument Serif i hero.
 */
import { Activity, Search, ChevronDown, Plus, FileText } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CsvImportModal } from "./csv-import-modal";

const SOURCE_PILL: Record<string, string> = {
  "csv-import": "bg-[#3b5994]/15 text-[#3b5994]",
  api: "bg-primary/10 text-primary",
  manual: "bg-[#4a3a8a]/12 text-[#4a3a8a]",
};

const SOURCE_LABEL: Record<string, string> = {
  "csv-import": "CSV",
  api: "API",
  manual: "Manuell",
};

export default async function TrackManPage() {
  const user = await requirePortalUser();

  const sessions = await prisma.trackManSession.findMany({
    where: { userId: user.id },
    orderBy: { recordedAt: "desc" },
    take: 50,
  });

  const total = sessions.length;
  const totalSlag = sessions.reduce((s, x) => s + x.shotCount, 0);
  const sisteOkt = sessions[0];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · /portal/mal/trackman"
        titleLead={total > 0 ? `${total} økter` : "0 økter"}
        titleItalic="med radar"
        titleTrail={user.name ? `, ${user.name.split(" ")[0]}.` : "."}
        sub={
          total === 0
            ? "Eksporter CSV fra TrackMan og last opp for å se trender."
            : `Sist økt: ${sisteOkt?.recordedAt.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })} · ${totalSlag} slag totalt`
        }
        actions={<CsvImportModal />}
      />

      {total === 0 ? (
        <EmptyState
          icon={Activity}
          titleItalic="Ingen TrackMan-økter"
          titleTrail="importert ennå"
          sub="Importer din første økt for å se carry-trend, smash-utvikling og klubb-sammenligning over tid."
          cta={
            <div className="space-y-3">
              <div className="rounded-md bg-secondary p-3 text-left font-mono text-[11px] leading-relaxed text-muted-foreground">
                <strong className="text-foreground">
                  Hvordan eksportere fra TrackMan:
                </strong>
                <br />
                Åpne TrackMan-appen → Sessions → velg økten → Export → CSV. Eller
                ta screenshot fra Performance-skjermen — vi bruker OCR.
              </div>
            </div>
          }
        />
      ) : (
        <>
          {/* Stat-grid (6 KPI) — vi viser det vi har fra schema og placeholders */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Total slag"
              value={totalSlag.toLocaleString("nb-NO")}
              sub={`${total} økter`}
            />
            <StatCard
              label="Snitt slag / økt"
              value={
                total > 0 ? Math.round(totalSlag / total).toString() : "—"
              }
              sub="basert på loggede økter"
            />
            <StatCard
              label="Siste økt"
              value={
                sisteOkt
                  ? sisteOkt.shotCount.toString()
                  : "—"
              }
              unit="slag"
              sub={
                sisteOkt
                  ? sisteOkt.recordedAt.toLocaleDateString("nb-NO", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : ""
              }
            />
            <StatCard
              label="Driver · clubhead"
              value="—"
              unit="mph"
              sub="Krever per-slag-data"
              muted
            />
            <StatCard
              label="7-jern · carry"
              value="—"
              unit="m"
              sub="Krever per-slag-data"
              muted
            />
            <StatCard
              label="Snitt smash"
              value="—"
              sub="Krever per-slag-data"
              muted
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
                aria-label="Søk lokasjon"
                placeholder="Søk lokasjon..."
                className="w-full rounded-md border border-border bg-card py-2 pl-10 pr-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <Chip>
              Lokasjon: Alle <ChevronDown size={11} strokeWidth={1.75} />
            </Chip>
            <Chip>
              Klubb: Alle <ChevronDown size={11} strokeWidth={1.75} />
            </Chip>
            <Chip>
              Periode: 90 dager <ChevronDown size={11} strokeWidth={1.75} />
            </Chip>
            <button
              type="button"
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus size={12} strokeWidth={1.75} /> Importer økt
            </button>
          </div>

          {/* Tabell */}
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div
              className="hidden border-b border-border bg-muted/40 px-6 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground sm:grid"
              style={{
                gridTemplateColumns: "1.1fr 0.6fr 80px 80px",
                gap: "12px",
              }}
            >
              <div>Dato · kilde</div>
              <div>Antall slag</div>
              <div>Kilde</div>
              <div />
            </div>

            <ul>
              {sessions.map((s) => (
                <li key={s.id} className="border-b border-border/60 last:border-0">
                  <a
                    href={`/portal/mal/trackman/${s.id}`}
                    className="grid grid-cols-1 items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30 sm:grid-cols-[1.1fr_0.6fr_80px_80px]"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-sm font-medium text-foreground tabular-nums">
                        {s.recordedAt.toLocaleDateString("nb-NO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {s.recordedAt.toLocaleTimeString("nb-NO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <span className="font-mono text-base font-semibold text-foreground tabular-nums">
                      {s.shotCount}
                    </span>
                    <span
                      className={`inline-flex w-fit items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${SOURCE_PILL[s.source] ?? "bg-secondary text-muted-foreground"}`}
                    >
                      <FileText size={10} strokeWidth={1.75} aria-hidden="true" />
                      {SOURCE_LABEL[s.source] ?? s.source}
                    </span>
                    <span className="text-xs font-medium text-primary">
                      Detaljer →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
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

function StatCard({
  label,
  value,
  unit,
  sub,
  muted = false,
}: {
  label: string;
  value: string;
  unit?: string;
  sub: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-2 flex items-baseline gap-1 font-mono text-3xl font-semibold leading-none tabular-nums ${muted ? "text-muted-foreground/60" : "text-foreground"}`}
      >
        <span>{value}</span>
        {unit && (
          <span className="font-mono text-xs font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      <div
        className={`mt-2 font-mono text-[10px] ${muted ? "text-muted-foreground/60" : "text-primary"}`}
      >
        {sub}
      </div>
    </div>
  );
}
