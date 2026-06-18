/**
 * PlayerHQ · Trening · Tester · Ny test
 *
 * Server-page som verifiserer innlogging og henter alle TestDefinition-er
 * spilleren kan velge mellom. Wizarden i `wizard.tsx` håndterer flyten:
 * Type → Detaljer → Resultat → Bekreft.
 *
 * Hybrid design: editorial header (font-display italic i primary-farge)
 * etterfulgt av NyTestWizard (uendret).
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { NyTestWizard } from "./wizard";

export default async function NyTestPage() {
  const user = await requirePortalUser();

  const tests = await prisma.testDefinition.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      pyramidArea: true,
      description: true,
    },
  });

  // Siste resultat per test for å vise delta i bekreft-steget.
  const sisteResultater = await prisma.testResult.findMany({
    where: { userId: user.id },
    orderBy: { takenAt: "desc" },
    select: { testId: true, score: true, takenAt: true },
  });
  const sistePerTest = new Map<string, { score: number; takenAt: string }>();
  for (const r of sisteResultater) {
    if (!sistePerTest.has(r.testId)) {
      sistePerTest.set(r.testId, {
        score: r.score,
        takenAt: r.takenAt.toISOString(),
      });
    }
  }

  return (
    <div className="space-y-6 pb-20 md:space-y-8 md:pb-0">
      {/* Tilbake-lenke — mono pill-stil */}
      <div>
        <Link
          href="/portal/tren/tester"
          className="inline-flex h-11 items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={12} strokeWidth={1.75} aria-hidden />
          Tilbake til tester
        </Link>
      </div>

      {/* Editorial header — hybrid design-system mønster */}
      <header>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Trening · Tester
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Logg{" "}
          <em className="font-display not-italic italic text-primary">
            ny test
          </em>
          {user.name ? `, ${user.name.split(" ")[0]}.` : "."}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Gå gjennom de fire stegene — type, detaljer, resultat og bekreft.
        </p>
      </header>

      <NyTestWizard
        tests={tests}
        sistePerTest={Object.fromEntries(sistePerTest)}
        spillerNavn={user.name ?? "Spiller"}
      />
    </div>
  );
}
