import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const PYR_BG: Record<PyramidArea, string> = {
  FYS: "bg-pyr-fys/15 text-pyr-fys",
  TEK: "bg-pyr-tek/15 text-pyr-tek",
  SLAG: "bg-pyr-slag/30 text-foreground",
  SPILL: "bg-pyr-spill/15 text-pyr-spill",
  TURN: "bg-pyr-turn/15 text-pyr-turn",
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
          Tester ({tests.length})
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Standardiserte tester for å måle progresjon over tid.
        </p>
      </div>

      {tests.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ingen tester registrert i databasen.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tests.map((t) => {
            const stats = sisteResultatPerTest.get(t.id);
            return (
              <Link
                key={t.id}
                href={`/portal/tren/tester/${t.id}`}
                className="block rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-base font-semibold leading-tight text-foreground">
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
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
                  <span className="text-muted-foreground">
                    {stats?.antall ?? 0} resultat{stats?.antall === 1 ? "" : "er"}
                  </span>
                  {stats ? (
                    <span className="tabular-nums font-semibold text-foreground">
                      Siste: {stats.score.toFixed(1).replace(".", ",")}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Ikke tatt</span>
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
