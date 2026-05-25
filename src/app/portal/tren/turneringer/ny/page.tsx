/**
 * PlayerHQ · Trening · Turneringer · Ny turnering (manuell innlegg)
 *
 * Skjema for spiller å legge til en turnering som ikke finnes i den
 * DataGolf/NGF-synkroniserte katalogen — typisk lokale matcher,
 * klubbmesterskap, og treningsmatcher.
 *
 * Lagret som Tournament med sourceOrigin=MANUAL, createdByUserId=spillerens id.
 * Vises umiddelbart i /turneringer, /admin/tournaments og /portal/tren/turneringer.
 * Anti-spam: maks 10 manuelle / bruker / kalendermåned.
 */

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { NyManuellTurneringForm } from "./form";

export const dynamic = "force-dynamic";

export default async function NyTurneringPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  // Tell brukerens manuelle turneringer denne måneden — for å vise gjenstående kvote
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const manualThisMonth = await prisma.tournament.count({
    where: {
      createdByUserId: user.id,
      sourceOrigin: "MANUAL",
      createdAt: { gte: monthStart },
    },
  });
  const remainingQuota = Math.max(0, 10 - manualThisMonth);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Trening · Turneringer"
        titleLead="Ny manuell"
        titleItalic="turnering"
        sub="Legg til en turnering som mangler i den synkroniserte katalogen. Coachen kan senere koble den til en kjent kilde."
      />

      <div>
        <Link
          href="/portal/tren/turneringer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Tilbake til turneringer
        </Link>
      </div>

      {remainingQuota === 0 ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive-foreground">
          <p className="font-semibold">Du har nådd månedsgrensen</p>
          <p className="mt-1 text-muted-foreground">
            Du har allerede lagt til 10 manuelle turneringer denne måneden.
            Vent til neste måned, eller spør coachen din om å legge til turneringen
            i hovedkatalogen.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            Du kan legge til {remainingQuota} {remainingQuota === 1 ? "turnering" : "turneringer"} til denne måneden.
          </div>
          <NyManuellTurneringForm />
        </>
      )}
    </div>
  );
}
