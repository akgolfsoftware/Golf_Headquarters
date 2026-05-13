/**
 * PlayerHQ · Mål · Runder
 *
 * Migrert til endelig design (wireframe/design-files-v2/final/13-runder.html).
 * Pro-versjon med 4 KPI-kort (snitt, vs par, beste, SG total), filter-row,
 * og tabell med tee-pill, score, vs-par-pill, SG og detaljer-link.
 */
import { Flag, Search, ChevronDown, Plus, Download } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NyRundeModal } from "./ny-runde-modal";

function formatSg(v: number | null | undefined): string {
  if (v == null) return "—";
  const formatted = v.toFixed(1).replace(".", ",");
  return v > 0 ? `+${formatted}` : formatted;
}

function vsParClass(diff: number): string {
  if (diff < 0) return "bg-primary/12 text-primary";
  if (diff === 0) return "bg-secondary text-muted-foreground";
  if (diff <= 5) return "bg-accent/30 text-accent-foreground";
  return "bg-destructive/15 text-destructive";
}

export default async function RunderPage() {
  const user = await requirePortalUser();

  const [rounds, courses] = await Promise.all([
    prisma.round.findMany({
      where: { userId: user.id },
      orderBy: { playedAt: "desc" },
      include: { course: true },
      take: 50,
    }),
    prisma.courseDefinition.findMany({ orderBy: { name: "asc" } }),
  ]);

  // KPI-aggregat (kun hvis vi har runder)
  const total = rounds.length;
  const snittScore =
    total === 0 ? null : rounds.reduce((s, r) => s + r.score, 0) / total;
  const snittVsPar =
    total === 0
      ? null
      : rounds.reduce((s, r) => s + (r.score - r.course.par), 0) / total;
  const beste =
    total === 0
      ? null
      : rounds.reduce(
          (best, r) =>
            r.score - r.course.par < best.diff
              ? {
                  score: r.score,
                  diff: r.score - r.course.par,
                  course: r.course.name,
                  date: r.playedAt,
                }
              : best,
          {
            score: rounds[0].score,
            diff: rounds[0].score - rounds[0].course.par,
            course: rounds[0].course.name,
            date: rounds[0].playedAt,
          },
        );
  const sgTotalSnitt = (() => {
    const med = rounds.filter((r) => r.sgTotal != null);
    if (med.length === 0) return null;
    return med.reduce((s, r) => s + (r.sgTotal ?? 0), 0) / med.length;
  })();

  return (
    <div className="space-y-8">
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
        actions={
          <NyRundeModal
            courses={courses.map((c) => ({
              id: c.id,
              name: c.name,
              par: c.par,
            }))}
          />
        }
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
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                <Plus size={12} strokeWidth={1.75} /> Logg din første runde
              </button>
              <span className="font-mono text-[11px] text-muted-foreground">
                eller
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground"
              >
                <Download size={12} strokeWidth={1.75} /> Importer fra GolfBox
              </button>
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
              unit={beste ? `${beste.diff > 0 ? "+" : ""}${beste.diff} · ${beste.course}` : ""}
              sub={
                beste
                  ? beste.date.toLocaleDateString("nb-NO", {
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
                className="w-full rounded-md border border-border bg-card py-2 pl-10 pr-4 text-sm outline-none focus:border-primary"
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
            <div className="ml-auto inline-flex gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-transparent px-4 py-2 text-xs font-semibold text-foreground"
              >
                <Download size={12} strokeWidth={1.75} /> Importer fra GolfBox
              </button>
            </div>
          </div>

          {/* Tabell */}
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div
              className="hidden border-b border-border bg-muted/40 px-6 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground sm:grid"
              style={{
                gridTemplateColumns:
                  "100px 1.4fr 70px 80px 80px 80px",
                gap: "12px",
              }}
            >
              <div>Dato</div>
              <div>Bane</div>
              <div>Score</div>
              <div>Vs par</div>
              <div>SG total</div>
              <div />
            </div>

            <ul>
              {rounds.map((r) => {
                const diff = r.score - r.course.par;
                return (
                  <li
                    key={r.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <div className="grid grid-cols-1 items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30 sm:grid-cols-[100px_1.4fr_70px_80px_80px_80px]">
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {r.playedAt.toLocaleDateString("nb-NO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <div className="font-medium text-foreground">
                        {r.course.name}
                      </div>
                      <span className="font-mono text-base font-semibold text-foreground tabular-nums">
                        {r.score}
                      </span>
                      <span
                        className={`inline-flex w-fit items-center justify-center rounded-sm px-2 py-1 font-mono text-xs font-semibold tabular-nums ${vsParClass(diff)}`}
                      >
                        {diff > 0 ? "+" : ""}
                        {diff}
                      </span>
                      <span
                        className={`font-mono text-sm font-semibold tabular-nums ${
                          r.sgTotal != null && r.sgTotal > 0
                            ? "text-primary"
                            : r.sgTotal != null && r.sgTotal < 0
                              ? "text-destructive"
                              : "text-muted-foreground"
                        }`}
                      >
                        {formatSg(r.sgTotal)}
                      </span>
                      <span className="text-xs font-medium text-primary">
                        Detaljer →
                      </span>
                    </div>
                  </li>
                );
              })}
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
