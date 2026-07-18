/**
 * PlayerHQ · Trening · Turnering — detalj (/portal/tren/turneringer/[id]) — v2.
 * v2-port 16. juli 2026: `TurneringDetaljV2` erstatter hybrid-designet, ruten
 * flyttet ut av (legacy). Auth-guard (PLAYER/COACH/ADMIN), loadTurneringDetalj-
 * loaderen og server actions (meldDegPa/meldDegAv via inline "use server")
 * er uendret. Not-found-branch beholdt med ærlig tomtilstand.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadTurneringDetalj } from "@/lib/portal-turnering/turnering-detalj-data";
import { meldDegPa, meldDegAv } from "@/app/portal/(legacy)/tren/turneringer/actions";
import { startTurneringsrunde } from "./actions";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke, TomTilstand, CTAPill, Kort } from "@/components/v2";
import {
  TurneringDetaljV2,
  type TurneringDetaljV2Data,
} from "@/components/portal/v2/TurneringDetaljV2";

export const dynamic = "force-dynamic";

export default async function TurneringDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const data = await loadTurneringDetalj(user.id, id);

  // Not-found branch — ærlig tomtilstand, aldri demo-innhold.
  if (!data) {
    return (
      <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/portal/tren/turneringer">Turneringer</TilbakeLenke>
        <Kort>
          <TomTilstand
            icon="trophy"
            title="Ingen turnering tilgjengelig"
            sub="Turneringen ble ikke funnet eller du har ikke tilgang."
          />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Link href="/portal/tren/turneringer" style={{ textDecoration: "none" }}>
              <CTAPill icon="arrow-right">Se alle turneringer</CTAPill>
            </Link>
          </div>
        </Kort>
      </V2Shell>
    );
  }

  const pameldt = data.entry?.state.active === true;

  async function pameldAction() {
    "use server";
    await meldDegPa(id);
  }

  async function avmeldAction() {
    "use server";
    const me = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
    const entry = await prisma.tournamentEntry.findFirst({
      where: { userId: me.id, tournamentId: id },
      select: { id: true },
    });
    if (entry) await meldDegAv(entry.id);
  }

  async function startRundeAction() {
    "use server";
    await startTurneringsrunde(id);
  }

  // «Start turneringsrunde» kun for en aktivt påmeldt spiller, når turneringen
  // er relevant nå, en bane finnes, og det ikke alt er startet en runde.
  const kanStarteRunde =
    pameldt && data.erRelevantNa && data.rundeBaneId != null && data.liveRunde == null;

  const v2Data: TurneringDetaljV2Data = {
    navn: data.name,
    datoLang: data.dateLong,
    sted: data.venue,
    format: data.format,
    tour: data.tour,
    status: data.status,
    offisiellUrl: data.officialUrl,
    coachNotat: data.entry?.notes ?? null,
    coachNavn: "Anders Kristiansen",
    entry: data.entry
      ? {
          statusLabel: data.entry.state.label,
          statusTone: data.entry.state.tone,
          kategori: data.entry.category,
          notater: data.entry.notes,
          paameldtTekst: data.entry.registeredLong,
        }
      : null,
    historikk: data.history.map((h) => ({
      id: h.id,
      aar: h.year,
      plassering: h.position,
      score: h.score,
    })),
  };

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/tren/turneringer">Turneringer</TilbakeLenke>
      <TurneringDetaljV2
        data={v2Data}
        pameldt={pameldt}
        pameldAction={pameldAction}
        avmeldAction={avmeldAction}
        turneringsrunde={
          data.liveRunde
            ? {
                rundeId: data.liveRunde.id,
                fort: data.liveRunde.fort,
                score: data.liveRunde.score,
                hullAntall: data.liveRunde.hullAntall,
              }
            : null
        }
        kanStarteRunde={kanStarteRunde}
        startRundeAction={startRundeAction}
      />
    </V2Shell>
  );
}
