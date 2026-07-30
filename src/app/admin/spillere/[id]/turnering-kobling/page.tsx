/**
 * AgencyOS — Koble spiller til turneringsidentitet
 * (/admin/spillere/[id]/turnering-kobling)
 *
 * Manuell kobling User.publicPlayerId ↔ PublicPlayer når auto-navnematch
 * ikke treffer. Etter kobling speiles eksisterende resultater til profilen.
 */

import { notFound } from "next/navigation";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke, Tittel, Caps } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
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
    <V2Shell
      aktiv="spillere"
      nav={AGENCYOS_NAV}
      navn={user.name ?? "Coach"}
      avatarUrl={user.avatarUrl}
    >
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 48px" }}>
        <TilbakeLenke href={`/admin/spillere/${player.id}`}>
          Tilbake til spiller
        </TilbakeLenke>
        <div style={{ marginTop: 16, marginBottom: 6 }}>
          <Caps size={10} style={{ color: T.mut }}>
            Turnering · kobling
          </Caps>
        </div>
        <div style={{ marginBottom: 8 }}>
          <Tittel em="kobling">{player.name}</Tittel>
        </div>
        <p
          style={{
            margin: "0 0 24px",
            fontFamily: T.ui,
            fontSize: 13.5,
            color: T.fg2,
            lineHeight: 1.5,
            maxWidth: 520,
          }}
        >
          Koble denne PlayerHQ-kontoen til en person i turneringsbasen. Da
          speiles GolfBox-resultater automatisk til spillerens profil.
        </p>

        <TurneringKoblingKlient
          spillerId={player.id}
          spillerNavn={player.name}
          current={current}
          initialForslag={forslag.filter(
            (f) => !current || f.id !== current.id,
          )}
        />
      </div>
    </V2Shell>
  );
}
