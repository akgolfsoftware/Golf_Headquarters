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
          className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
          Tilbake til turneringer
        </Link>
      </div>

      {remainingQuota === 0 ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-destructive">
            Månedsgrense nådd
          </div>
          <p className="mt-2 text-[15px] font-semibold text-foreground">
            Du har lagt til 10 manuelle turneringer denne måneden
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Vent til neste måned, eller spør coachen din om å legge til turneringen
            i hovedkatalogen.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-secondary/40 px-4 py-3">
            <span className="text-sm text-muted-foreground">
              Manuelle turneringer igjen denne måneden
            </span>
            <span className="font-mono text-[15px] font-bold tabular-nums text-foreground">
              {remainingQuota}
              <span className="text-muted-foreground">/10</span>
            </span>
          </div>
          <NyManuellTurneringForm />
        </>
      )}
    </div>
  );
}
