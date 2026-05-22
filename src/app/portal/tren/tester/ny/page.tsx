/**
 * PlayerHQ · Trening · Tester · Ny test
 *
 * Server-page som verifiserer innlogging og henter alle TestDefinition-er
 * spilleren kan velge mellom. Wizarden i `wizard.tsx` håndterer flyten:
 * Type → Detaljer → Resultat → Bekreft.
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
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
      <div>
        <Link
          href="/portal/tren/tester"
          className="inline-flex h-11 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={12} strokeWidth={1.75} /> Tilbake til tester
        </Link>
      </div>

      <PageHeader
        eyebrow="PlayerHQ · /portal/tren/tester/ny"
        titleLead="Logg"
        titleItalic="ny test"
        titleTrail={user.name ? `, ${user.name.split(" ")[0]}.` : "."}
        sub="Gå gjennom de fire stegene — type, detaljer, resultat og bekreft."
      />

      <NyTestWizard
        tests={tests}
        sistePerTest={Object.fromEntries(sistePerTest)}
        spillerNavn={user.name ?? "Spiller"}
      />
    </div>
  );
}
