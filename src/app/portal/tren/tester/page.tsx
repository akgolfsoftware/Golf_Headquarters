import Link from "next/link";
import { Target } from "lucide-react";
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

const PYR_BG: Record<PyramidArea, string> = {
  FYS: "bg-secondary text-muted-foreground",
  TEK: "bg-secondary text-muted-foreground",
  SLAG: "bg-accent/30 text-accent-foreground",
  SPILL: "bg-secondary text-muted-foreground",
  TURN: "bg-secondary text-muted-foreground",
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

  const sisteResultatPerTest = new Map<
    string,
    { score: number; takenAt: Date; antall: number }
  >();
  for (const r of mineResultater) {
    const eksisterende = sisteResultatPerTest.get(r.testId);
    if (!eksisterende) {
      sisteResultatPerTest.set(r.testId, {
        score: r.score,
        takenAt: r.takenAt,
        antall: 1,
      });
    } else {
      eksisterende.antall += 1;
    }
  }

  const totalResultater = mineResultater.length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Trening · Tester"
        titleLead="Mål"
        titleItalic="progresjonen"
        titleTrail="din"
        sub={`${tests.length} standardisert${tests.length === 1 ? "" : "e"} test${tests.length === 1 ? "" : "er"} — ${totalResultater} resultat${totalResultater === 1 ? "" : "er"} logget så langt.`}
      />

      {tests.length === 0 ? (
        <EmptyState
          icon={Target}
          titleItalic="Ingen tester"
          titleTrail="er klare ennå"
          sub="Tester legges inn av coachen din. Sjekk innom igjen senere."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tests.map((t) => {
            const stats = sisteResultatPerTest.get(t.id);
            return (
              <Link
                key={t.id}
                href={`/portal/tren/tester/${t.id}`}
                className="group block rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold leading-tight tracking-tight text-foreground">
                    {t.name}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                      PYR_BG[t.pyramidArea]
                    }`}
                  >
                    {PYR_LABEL[t.pyramidArea]}
                  </span>
                </div>

                {t.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs">
                  <span className="text-muted-foreground">
                    {stats?.antall ?? 0} resultat{stats?.antall === 1 ? "" : "er"}
                  </span>
                  {stats ? (
                    <span className="font-mono font-semibold tabular-nums text-foreground">
                      Siste:{" "}
                      <span className="text-primary">
                        {stats.score.toFixed(1).replace(".", ",")}
                      </span>
                    </span>
                  ) : (
                    <span className="font-mono text-muted-foreground">
                      Ikke tatt
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
