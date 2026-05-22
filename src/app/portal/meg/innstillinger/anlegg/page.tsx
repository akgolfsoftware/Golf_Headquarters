/**
 * /portal/meg/innstillinger/anlegg
 *
 * Spiller registrerer tilgjengelige fasiliteter og utstyr.
 * Brukes for å filtrere drill-biblioteket slik at spilleren kun ser
 * øvelser som kan gjøres med det utstyret/anlegget de faktisk har tilgang til.
 *
 * Eksempel: Spiller med 12×12m puttinggree får aldri foreslått lag-putts på 25m.
 */

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { DrillFasilitet } from "@/generated/prisma/client";
import { FasilitetProfilForm } from "./fasilitet-profil-form";

export const dynamic = "force-dynamic";

export default async function AnleggPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT", "COACH", "ADMIN"] });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tilgjengeligeFasiliteter: true },
  });

  const tilgjengelig: DrillFasilitet[] = dbUser?.tilgjengeligeFasiliteter ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/portal/meg/innstillinger"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Innstillinger
        </Link>
        <span>/</span>
        <span className="text-foreground">Mitt treningsanlegg</span>
      </nav>

      <header className="space-y-2">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          Utstyr og anlegg
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Hva har du tilgang til?
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Registrer utstyret og anlegget du har tilgang til. Drill-biblioteket
          og AI-treningsplanen din bruker dette til å kun foreslå øvelser du
          faktisk kan gjøre — uten å sende deg til en bunker du ikke har, eller
          en 25m putting-green når du bare har 10m.
        </p>
      </header>

      <FasilitetProfilForm initial={tilgjengelig} />
    </div>
  );
}
