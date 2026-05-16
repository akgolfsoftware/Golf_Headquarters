/**
 * PlayerHQ · Trening · Tester
 *
 * Migrert til endelig design (wireframe/design-files-v2/final/12-tester.html).
 * Tabs (Team Norway / Mine), KPI-strip med gjennomført + snitt + beste kategori, filter-row
 * og tabell med kategori-pill, rangering-pill, "Ta test"-knapp.
 */
import Link from "next/link";
import { Target, Plus } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TesterListe } from "@/components/portal/tester-liste";

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
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

      {/* Tabs (Team Norway / Mine) — Mine er Pro-locked og vises som disabled */}
      <div className="inline-flex w-fit gap-0.5 rounded-md bg-secondary p-1">
        <span className="rounded-sm bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm">
          Team Norway{" "}
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
        <TesterListe
          tests={tests.map((t) => ({
            id: t.id,
            name: t.name,
            pyramidArea: t.pyramidArea,
            protocol: t.protocol,
          }))}
          stats={Object.fromEntries(
            Array.from(statsPerTest.entries()).map(([id, s]) => [
              id,
              { takenAt: s.takenAt.toISOString(), beste: s.beste, antall: s.antall },
            ]),
          )}
        />
      )}
    </div>
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
