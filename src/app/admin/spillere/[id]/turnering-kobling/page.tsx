/**
 * AgencyOS — Koble spiller til turneringsidentitet
 * (/admin/spillere/[id]/turnering-kobling)
 *
 * Manuell kobling User.publicPlayerId ↔ PublicPlayer når auto-navnematch
 * ikke treffer. Etter kobling speiles eksisterende resultater til profilen.
 *
 * Precision Athletics (29.09.2026): samme tilgang (requirePortalUser +
 * coachScopedPlayerWhere) og samme handlinger; bare visningen er byttet.
 */

import { notFound } from "next/navigation";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { KnappLenke } from "@/components/precision/pa";
import { SideHode } from "@/components/precision/pa-a4";
import "@/styles/precision-a8.css";

import { foreslaPublicPlayers } from "./actions";
import { TurneringKoblingKlient } from "./kobling-klient";

export const dynamic = "force-dynamic";

export default async function TurneringKoblingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;

  const player = await prisma.user.findFirst({
    where: { AND: [coachScopedPlayerWhere(user), { id }] },
    select: {
      id: true,
      name: true,
      role: true,
      publicPlayerId: true,
      publicPlayer: {
        select: {
          id: true,
          name: true,
          tier: true,
          country: true,
          birthYear: true,
          _count: { select: { entries: true } },
        },
      },
    },
  });
  if (!player || player.role !== "PLAYER") notFound();

  const forslagRes = await foreslaPublicPlayers(player.id);
  const forslag = forslagRes.ok ? forslagRes.treff : [];

  const current = player.publicPlayer
    ? {
        id: player.publicPlayer.id,
        name: player.publicPlayer.name,
        tier: player.publicPlayer.tier,
        country: player.publicPlayer.country,
        birthYear: player.publicPlayer.birthYear,
        entriesCount: player.publicPlayer._count.entries,
      }
    : null;

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <div className="a8-side" style={{ maxWidth: 820 }}>
        <SideHode
          kicker="Stall · Spiller 360 · Turneringsprofil"
          title={player.name}
          sub="Koble denne PlayerHQ-kontoen til en person i turneringsbasen. Da speiles GolfBox-resultater automatisk til spillerens profil."
          actions={<KnappLenke variant="secondary" icon={ArrowLeft} iconName="arrow-left" href={`/admin/spillere/${player.id}`}>Spiller 360</KnappLenke>}
        />
        <TurneringKoblingKlient
          spillerId={player.id}
          spillerNavn={player.name}
          current={current}
          initialForslag={forslag.filter((f) => !current || f.id !== current.id)}
        />
      </div>
    </AgencyOSSkall>
  );
}
