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
import { calculateAge } from "@/lib/auth/minor";
import { hentKoblingsstatus } from "@/lib/profil-kobling/data";
import { ArrowLeft } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { KnappLenke } from "@/components/precision/pa";
import { SideHode } from "@/components/precision/pa-a4";
import "@/styles/precision-a8.css";

import { foreslaPublicPlayers } from "./actions";
import { TurneringKoblingKlient } from "./kobling-klient";
import { ResultatprofilKlient } from "./resultatprofil-klient";

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
      dateOfBirth: true,
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

  const resultatStatus = await hentKoblingsstatus(player.id);
  const alder = calculateAge(player.dateOfBirth);
  const under16 = alder != null && alder < 16;

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
      <div className="a8-side">
        <SideHode
          kicker="Stall · Spiller 360 · Turneringsprofil"
          title={player.name}
          sub="Resultatprofilen er kilden til offisielle resultater for alle miljøer. Den eldre koblingen lenger ned brukes fortsatt av noen få verktøy og erstatter ikke resultatprofilen."
          actions={<KnappLenke variant="secondary" icon={ArrowLeft} iconName="arrow-left" href={`/admin/spillere/${player.id}`}>Spiller 360</KnappLenke>}
        />
        <ResultatprofilKlient
          spillerId={player.id}
          spillerNavn={player.name}
          under16={under16}
          status={resultatStatus.status === "none" ? { status: "none" } : { status: resultatStatus.status, kandidat: resultatStatus.candidate }}
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
