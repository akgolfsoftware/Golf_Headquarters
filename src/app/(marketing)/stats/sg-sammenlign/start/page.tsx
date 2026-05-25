/**
 * /stats/sg-sammenlign/start — onboarding-skjema (auth-protected)
 *
 * 3-stegs flyt på én side:
 *   1. Velg referansespiller (topp 100 PgaPlayerSeason)
 *   2. Velg input-modus: oppgi snittscore (vi estimerer SG) ELLER egne SG-tall
 *   3. Submit → server action lagrer + redirect til resultatside
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { startSammenligning } from "../actions";
import { SgStartSkjema, type RefSpiller } from "./skjema";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ feil?: string }>;
};

export default async function SgStartPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?next=/stats/sg-sammenlign/start");
  }

  // Hent topp 100 PGA-spillere etter sgTotal (lite filter — bare aktive)
  const refSpillere = await prisma.pgaPlayerSeason.findMany({
    where: {
      tour: "pga",
      sgTotal: { not: null },
      rounds: { gte: 20 },
    },
    orderBy: { sgTotal: "desc" },
    take: 100,
    select: {
      dgPlayerId: true,
      playerName: true,
      year: true,
      sgTotal: true,
      country: true,
    },
  });

  const spillereForUI: RefSpiller[] = refSpillere.map((r) => ({
    dgPlayerId: r.dgPlayerId,
    name: r.playerName,
    country: r.country,
    sgTotal: r.sgTotal!,
    year: r.year,
  }));

  const { feil } = await searchParams;

  return (
    <div className="bg-background text-foreground">
      <div className="border-b border-border bg-secondary/20">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <Link
            href="/stats/sg-sammenlign"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Tilbake
          </Link>
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="text-center">
          <AthleticEyebrow tone="lime">Start sammenligning</AthleticEyebrow>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Velg{" "}
            <em className="font-normal italic text-primary">referansespiller</em>
            {" "}og legg inn{" "}
            <em className="font-normal italic text-primary">din SG</em>.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
            Hvis du ikke har egne SG-tall — bare oppgi snittscoren din, så
            estimerer vi fordelingen ved hjelp av Broadie-data.
          </p>
        </div>

        {spillereForUI.length === 0 ? (
          <div className="mt-10 rounded-lg border border-dashed border-border bg-card/40 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              PGA Tour-data er ikke synket ennå. Prøv igjen om litt.
            </p>
          </div>
        ) : (
          <div className="mt-10">
            <SgStartSkjema
              referanseSpillere={spillereForUI}
              action={startSammenligning}
              feil={feil}
            />
          </div>
        )}
      </section>
    </div>
  );
}
