/**
 * Spillerens økt-ark for en Workbench-økt — PH-03 Øktark i Precision Athletics
 * (Claude Design 7d7c2994). Start / Fullfør / Hopp over på en publisert økt.
 * Aldri DRAFT — usynlig eller «Fant ikke økten» er identiske svar (unngår å
 * lekke at et utkast finnes, CLAUDE.md invariant 3).
 */

import { CircleAlert, Eye } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadPlayerSession } from "@/lib/workbench/wb-actions";
import { UI } from "@/lib/domain/workbench/labels";
import { OktArk } from "@/components/portal/workbench/OktArk";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FeilTilstand, KnappLenke, TomTilstand } from "@/components/precision/pa";

export const dynamic = "force-dynamic";
export const metadata = { title: "Øktark · PlayerHQ" };

export default async function WorkbenchOktPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  const { sessionId } = await params;
  const [res, uleste] = await Promise.all([
    loadPlayerSession(sessionId),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  const coachId = res.ok && res.data && res.data.coachId !== user.id ? res.data.coachId : null;
  const coachNavn = coachId ? (await prisma.user.findUnique({ where: { id: coachId }, select: { name: true } }))?.name ?? null : null;
  const tilbake = <KnappLenke href="/portal" variant="secondary">{UI.backToToday}</KnappLenke>;

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      {!res.ok ? (
        <div className="pa-side"><FeilTilstand icon={CircleAlert} title="Kunne ikke hente økten" text={res.error} retry={tilbake} /></div>
      ) : !res.data ? (
        <div className="pa-side"><TomTilstand icon={Eye} title={UI.sessionNotFoundTitle} text={UI.sessionNotFoundBody} actions={tilbake} /></div>
      ) : (
        <OktArk session={res.data} coachNavn={coachNavn} />
      )}
    </PlayerHQSkall>
  );
}
