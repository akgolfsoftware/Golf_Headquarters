/**
 * PlayerHQ — Talent (K5) — feature-gated layout
 *
 * - Sjekker FEATURES.TALENT — hvis av → notFound()
 * - requirePortalUser({ allow: ["PLAYER"] })
 * - Sjekker om spilleren har en TalentTracking-rad. Hvis ikke: vis en
 *   vennlig "ikke i programmet"-melding i stedet for å gi tilgang.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { Target } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { FEATURES } from "@/lib/features";
import { prisma } from "@/lib/prisma";

export default async function TalentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!FEATURES.TALENT) {
    notFound();
  }

  const user = await requirePortalUser({ allow: ["PLAYER"] });

  const tracking = await prisma.talentTracking.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!tracking) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-start gap-6 px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-24">
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          <Target size={14} strokeWidth={1.5} aria-hidden />
          PlayerHQ · Talent
        </span>
        <h1 className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl md:text-5xl">
          Du er <em className="italic text-primary">ikke i talent-programmet</em>{" "}
          ennå
        </h1>
        <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
          Talent-modulen er forbeholdt spillere som er invitert inn i AK Golf
          sitt talentutviklings­program. Når du blir tatt opp får du tilgang til
          din egen utviklingsplan, radar mot kohort-snitt og sammenligning med
          andre spillere på samme nivå.
        </p>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          Lurer du på hva som skal til? Ta kontakt med coachen din eller besøk
          PlayerHQ-forsiden for å se hva som er tilgjengelig for deg nå.
        </p>
        <Link
          href="/portal"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Tilbake til PlayerHQ
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
