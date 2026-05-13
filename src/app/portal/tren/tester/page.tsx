/**
 * PlayerHQ · Trening · Tester
 *
 * Migrert til endelig design (wireframe/design-files-v2/final/12-tester.html).
 * Tabs (NGF / Mine), KPI-strip med gjennomført + snitt + beste kategori, filter-row
 * og tabell med kategori-pill, rangering-pill, "Ta test"-knapp.
 */
import Link from "next/link";
import { Target, Search, ChevronDown, Filter, Plus } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const PYR_PILL: Record<PyramidArea, string> = {
  FYS: "bg-primary/10 text-primary",
  TEK: "bg-primary/12 text-primary",
  SLAG: "bg-accent/40 text-accent-foreground",
  SPILL: "bg-accent/20 text-accent-foreground",
  TURN: "bg-secondary text-muted-foreground",
};

const PYR_DOT: Record<PyramidArea, string> = {
  FYS: "bg-primary/80",
  TEK: "bg-primary",
  SLAG: "bg-accent-foreground",
  SPILL: "bg-accent",
  TURN: "bg-muted-foreground",
};

export default async function TesterPage() {
  const user = await requirePortalUser();

  const [tests, mineResultater] = await Promise.all([
    prisma.testDefinition.findMany({ orderBy: { name: "asc" } }),
    prisma.testResult.findMany({
      where: { userId: user.id },
      orderBy: { takenAt: "desc" },
      include: { test: { select: { id: true, name: true } } },
    }),
  ]);

  // Aggreger siste resultat og antall forsøk per test.
  const statsPerTest = new Map<
    string,
    { score: number; takenAt: Date; antall: number; beste: number }
  >();
  for (const r of mineResultater) {
    const eks = statsPerTest.get(r.testId);
    if (!eks) {
      statsPerTest.set(r.testId, {
        score: r.score,
        takenAt: r.takenAt,
        antall: 1,
        beste: r.score,
      });
    } else {
      eks.antall += 1;
      eks.beste = Math.max(eks.beste, r.score);
    }
  }

  const totalResultater = mineResultater.length;
  const gjennomfoert = statsPerTest.size;
  const totalTester = tests.length;

  // Finn beste kategori (mest gjennomførte med høyest snitt).
  const kategoriStats = new Map<PyramidArea, { antall: number; sumScore: number }>();
  for (const t of tests) {
    const stats = statsPerTest.get(t.id);
    if (stats) {
      const cur = kategoriStats.get(t.pyramidArea) ?? { antall: 0, sumScore: 0 };
      cur.antall += stats.antall;
      cur.sumScore += stats.beste;
      kategoriStats.set(t.pyramidArea, cur);
    }
  }
  let besteKategori: PyramidArea | null = null;
  let besteSnitt = 0;
  for (const [omr, s] of kategoriStats) {
    const snitt = s.antall === 0 ? 0 : s.sumScore / s.antall;
    if (snitt > besteSnitt) {
      besteSnitt = snitt;
      besteKategori = omr;
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · /portal/tren/tester"
        titleLead="Mål"
        titleItalic="deg"
        titleTrail={user.name ? `, ${user.name.split(" ")[0]}.` : "."}
        sub={`${gjennomfoert} av ${totalTester} tester gjennomført · ${totalResultater} resultat${totalResultater === 1 ? "" : "er"} logget`}
      />

      {/* Tabs (NGF / Mine) — Mine er Pro-locked og vises som disabled */}
      <div className="inline-flex w-fit gap-0.5 rounded-md bg-secondary p-1">
        <span className="rounded-sm bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm">
          NGF-standard{" "}
          <span className="font-mono text-xs text-primary">{totalTester}</span>
        </span>
        <span className="cursor-not-allowed rounded-sm px-4 py-2 text-sm font-medium text-muted-foreground opacity-65">
          Mine tester{" "}
          <span className="font-mono text-xs">Pro</span>
        </span>
      </div>

      {/* KPI-strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Gjennomført"
          value={`${gjennomfoert}`}
          unit={`/ ${totalTester}`}
          sub={`${totalResultater} forsøk totalt`}
        />
        <KpiCard
          label="Snitt-resultat"
          value={
            statsPerTest.size === 0
              ? "—"
              : (
                  Array.from(statsPerTest.values()).reduce(
                    (s, v) => s + v.beste,
                    0,
                  ) / statsPerTest.size
                )
                  .toFixed(1)
                  .replace(".", ",")
          }
          sub="basert på beste forsøk"
        />
        <KpiCard
          label="Beste kategori"
          value={besteKategori ? PYR_LABEL[besteKategori] : "—"}
          unit={
            besteKategori ? besteSnitt.toFixed(1).replace(".", ",") : undefined
          }
          sub={
            besteKategori
              ? `${kategoriStats.get(besteKategori)?.antall ?? 0} tester`
              : "Ikke nok data"
          }
          small
        />
      </div>

      {/* Filter-row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search
            size={13}
            strokeWidth={1.75}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            aria-label="Søk i tester"
            placeholder="Søk test..."
            className="w-full rounded-md border border-border bg-card py-2 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <Chip>
          Kategori: Alle <ChevronDown size={11} strokeWidth={1.75} />
        </Chip>
        <Chip>
          Status: Alle <ChevronDown size={11} strokeWidth={1.75} />
        </Chip>
        <div className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter size={13} strokeWidth={1.75} />
          Sortér: Sist tatt
        </div>
      </div>

      {tests.length === 0 ? (
        <EmptyState
          icon={Target}
          titleItalic="Ingen tester"
          titleTrail="er klare ennå"
          sub="Tester legges inn av coachen din. Sjekk innom igjen senere."
          cta={
            <Link
              href="/portal/coach/melding?type=ny-test"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Plus size={12} strokeWidth={1.75} /> Be coach legge til
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {/* Tabell-header */}
          <div
            className="hidden border-b border-border bg-muted/40 px-6 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground sm:grid"
            style={{
              gridTemplateColumns: "1.7fr 1fr 0.9fr 1fr 110px",
              gap: "14px",
            }}
          >
            <div>Test</div>
            <div>Sist tatt</div>
            <div>Beste</div>
            <div>Forsøk</div>
            <div />
          </div>

          <ul>
            {tests.map((t) => {
              const stats = statsPerTest.get(t.id);
              return (
                <li
                  key={t.id}
                  className="border-b border-border/60 last:border-0"
                >
                  <Link
                    href={`/portal/tren/tester/${t.id}`}
                    className="grid grid-cols-1 items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30 sm:grid-cols-[1.7fr_1fr_0.9fr_1fr_110px]"
                  >
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-foreground">
                        {t.name}
                      </span>
                      <span
                        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.04em] ${PYR_PILL[t.pyramidArea]}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${PYR_DOT[t.pyramidArea]}`}
                          aria-hidden="true"
                        />
                        {PYR_LABEL[t.pyramidArea]}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-muted-foreground tabular-nums">
                      {stats ? (
                        stats.takenAt.toLocaleDateString("nb-NO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      ) : (
                        <span className="italic">Aldri tatt</span>
                      )}
                    </div>
                    <div className="font-mono text-sm font-semibold text-foreground tabular-nums">
                      {stats ? (
                        stats.beste.toFixed(1).replace(".", ",")
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground tabular-nums">
                      {stats ? `${stats.antall} forsøk` : "Ingen forsøk"}
                    </div>
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                      Ta test →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
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
  small = false,
}: {
  label: string;
  value: string;
  unit?: string;
  sub: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-2 flex items-baseline gap-1 font-display font-semibold leading-tight text-foreground ${
          small ? "text-xl" : "text-3xl"
        }`}
      >
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
