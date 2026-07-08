/**
 * PlayerHQ · Mål · Runder · Ny — Loggfør runde (manuell registrering).
 *
 * Portet FRA fersk Claude Design-fasit (ph-screens.jsx · LogRoundScreen):
 * eyebrow «ANALYSERE · RUNDER · NY» + h1 «Loggfør runde.» (em primary italic)
 * → RundeNyForm (bane/dato, live to-par-accentkort, hull-grid UT/INN, lagre).
 * Lagringslogikk uendret (logRoundManual via formen).
 */
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { RundeNyForm } from "@/components/portal/runde-ny/runde-ny-form";

export default async function NyRundePage() {
  await requirePortalUser();
  const courses = await prisma.courseDefinition.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, par: true },
  });

  return (
    <div className="mx-auto w-full max-w-[460px] px-1 pb-8 pt-3 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6">
      <Link
        href="/portal/mal/runder"
        className="mb-2 inline-flex h-11 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        Alle runder
      </Link>

      <div className="max-w-[760px]">
        <AthleticEyebrow>Analysere · Runder · Ny</AthleticEyebrow>
        <h1 className="mt-2 font-display text-[26px] font-bold leading-[1.04] tracking-[-0.025em] text-foreground md:text-[30px]">
          Loggfør <em className="font-normal italic text-primary">runde.</em>
        </h1>

        <RundeNyForm courses={courses} />
      </div>
    </div>
  );
}
