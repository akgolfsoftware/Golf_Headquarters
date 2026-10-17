// PlayerHQ Ny utfordring — Precision Athletics, pakke 16 (utkast utfordringer.html, 16.10.2026).
/**
 * Deltakere bare fra egne grupper; coach og ADMIN også fra stallen (hentGyldigeDeltakerIder, samme
 * regel som opprettUtfordring sjekker). Øvelser med samme tilgang som Øvelsesbanken.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getUnreadNotifications } from "@/app/portal/actions";
import { hentGyldigeDeltakerIder, ovelseTilgangWhere } from "@/lib/portal/utfordring-tilgang";
import { utfordringAkse } from "@/lib/portal/utfordring-akse";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHNyUtfordring, type UtfValg } from "@/components/portal/precision/PHUtfordringer";
import { opprettUtfordring } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ny utfordring · PlayerHQ" };

export default async function NyUtfordringPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"], kreverTilgang: "FULL" });
  const [gyldige, egneGrupper, ovelser, uleste] = await Promise.all([
    hentGyldigeDeltakerIder(user),
    prisma.groupMember.findMany({ where: { userId: user.id, endedAt: null }, select: { groupId: true } }),
    prisma.exerciseDefinition.findMany({
      where: await ovelseTilgangWhere(user),
      select: { id: true, name: true, pyramidArea: true, higherIsBetter: true },
      orderBy: { name: "asc" },
      take: 300,
    }),
    getUnreadNotifications(user.id, 1),
  ]);

  const [personer, medlemskap] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: [...gyldige] } }, select: { id: true, name: true } }),
    prisma.groupMember.findMany({
      where: { groupId: { in: egneGrupper.map((g) => g.groupId) }, endedAt: null, userId: { in: [...gyldige] } },
      select: { userId: true, group: { select: { name: true } } },
    }),
  ]);
  const grupperPer = new Map<string, string[]>();
  for (const m of medlemskap) grupperPer.set(m.userId, [...(grupperPer.get(m.userId) ?? []), m.group.name]);
  const deltakere: UtfValg[] = personer
    .map((p) => {
      const g = grupperPer.get(p.id) ?? [];
      return { id: p.id, navn: p.name ?? "—", grupper: g, kilde: g.length ? g.join(" · ") : "Stallen din" };
    })
    .sort((a, b) => a.navn.localeCompare(b.navn, "nb"));
  const grupper = [...new Set(medlemskap.map((m) => m.group.name))].sort((a, b) => a.localeCompare(b, "nb"));

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PHNyUtfordring
        deltakere={deltakere}
        grupper={grupper}
        ovelser={ovelser.map((o) => ({ id: o.id, navn: o.name, akse: utfordringAkse(o.pyramidArea), higherIsBetter: o.higherIsBetter }))}
        opprett={opprettUtfordring}
      />
    </PlayerHQSkall>
  );
}
