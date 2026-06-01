/**
 * PlayerHQ · Meg · Utstyrsbag (/portal/meg/utstyrsbag). Mobil-først (430px).
 *
 * Spillerens kølle-utstyr fra EquipmentBag-modellen. Server component henter
 * ekte data og sender inn — visning/redigering i UtstyrsbagView (client).
 * Behold auth-guard (PLAYER/COACH/ADMIN) og server-action (lagreUtstyrsbag).
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { UtstyrsbagView } from "./utstyrsbag-view";
import type { UtstyrsbagInput } from "./actions";

export default async function UtstyrsbagPage() {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN"],
  });

  const bag = await prisma.equipmentBag.findUnique({
    where: { userId: user.id },
  });

  const initial: UtstyrsbagInput = {
    driver: bag?.driver ?? undefined,
    fairwayWoods: bag?.fairwayWoods ?? undefined,
    hybrids: bag?.hybrids ?? undefined,
    irons: bag?.irons ?? undefined,
    wedges: bag?.wedges ?? undefined,
    putter: bag?.putter ?? undefined,
    ball: bag?.ball ?? undefined,
    bag: bag?.bag ?? undefined,
    notes: bag?.notes ?? undefined,
  };

  return (
    <div className="mx-auto w-full max-w-[480px] pb-8">
      {/* topbar — tilbake + tittel */}
      <div className="flex items-center gap-3 border-b border-border px-2 py-3">
        <Link
          href="/portal/meg"
          className="inline-flex items-center gap-1.5 px-1 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
          Profil
        </Link>
        <h1 className="font-display text-[17px] font-bold tracking-[-0.015em] text-foreground">
          Utstyrsbag
        </h1>
      </div>

      <div className="px-2 pb-4 pt-3">
        <p className="mb-3 px-1 text-[13px] leading-relaxed text-muted-foreground">
          Logg kølle-utstyret ditt slik at coach kan tilpasse anbefalinger og
          fitting. Alle felter er valgfrie.
        </p>
        <UtstyrsbagView initial={initial} finnes={bag != null} />
      </div>
    </div>
  );
}
