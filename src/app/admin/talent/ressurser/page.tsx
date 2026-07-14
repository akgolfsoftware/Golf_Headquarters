/**
 * AgencyOS — Talent · Ressurs-bibliotek (`/admin/talent/ressurser`), v2.
 * Port av `(legacy)/talent/ressurser/page.tsx` (2026-07-14, AgencyOS
 * Bølge 3.22) — samme `TalentRessurs`-datamodell og filter-logikk.
 * `(legacy)/talent/ressurser/actions.ts` bor fortsatt der — delt
 * `leggTilRessurs`-server-action, uendret.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminTalentRessurserV2 } from "@/components/admin/v2/AdminTalentRessurserV2";
import { leggTilRessurs } from "@/app/admin/(legacy)/talent/ressurser/actions";

const KATEGORIER = ["video", "artikkel", "podcast"] as const;
const NIVAER = ["U10", "U12", "U14", "U16", "U18", "Senior"] as const;
const FOKUS = ["teknikk", "mental", "taktikk", "fysisk", "motivasjon"] as const;

export default async function TalentRessurser({ searchParams }: { searchParams: Promise<{ kategori?: string; niva?: string; fokus?: string }> }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const isAdmin = user.role === "ADMIN";

  const sp = await searchParams;
  const valgtKategori = (KATEGORIER as readonly string[]).includes(sp.kategori ?? "") ? (sp.kategori as string) : null;
  const valgtNiva = (NIVAER as readonly string[]).includes(sp.niva ?? "") ? sp.niva! : null;
  const valgtFokus = (FOKUS as readonly string[]).includes(sp.fokus ?? "") ? sp.fokus! : null;

  const ressurser = await prisma.talentRessurs.findMany({
    where: {
      ...(valgtKategori ? { kategori: valgtKategori } : {}),
      ...(valgtNiva ? { niva: valgtNiva } : {}),
      ...(valgtFokus ? { fokus: valgtFokus } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminTalentRessurserV2
        ressurser={ressurser}
        isAdmin={isAdmin}
        valgtKategori={valgtKategori}
        valgtNiva={valgtNiva}
        valgtFokus={valgtFokus}
        leggTilRessurs={leggTilRessurs}
      />
    </V2Shell>
  );
}
