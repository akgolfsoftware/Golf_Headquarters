/**
 * PH21OktSendt — bekreftelse på ønsket økt i PlayerHQSkall.
 * Samme siste forespørsel, status og tidslinje. Uten forespørsel vises en tom tilstand.
 */

import Link from "next/link";
import { Send } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { prisma } from "@/lib/prisma";
import type { SessionRequestStatus } from "@/generated/prisma/client";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { TomTilstand } from "@/components/precision/pa";
import { OnskeligOktBekreftetV2, type BekreftetSteg } from "@/components/portal/v2/OnskeligOktBekreftetV2";

export const dynamic = "force-dynamic";

const AREA_LABEL: Record<string, string> = {
  FYS: "Fysisk", TEK: "Teknisk", SLAG: "Slag", SPILL: "Spill", TURN: "Turnering",
};

function extractNote(reason: string): string | null {
  const lines = reason.split("\n").map((l) => l.trim());
  const msg = lines.find((l) => l.startsWith("Melding:"))?.slice("Melding:".length).trim();
  const detail = lines.find((l) => l.startsWith("Detalj:"))?.slice("Detalj:".length).trim();
  return msg || detail || null;
}

function extractType(reason: string): string | null {
  const line = reason.split("\n").map((l) => l.trim()).find((l) => l.startsWith("Type:"));
  return line ? line.slice("Type:".length).trim() : null;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildSteps(status: SessionRequestStatus, coachFirst: string, createdAt: Date): BekreftetSteg[] {
  const sentWhen = createdAt.toLocaleString("nb-NO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).replace(",", " ·").toUpperCase();
  const approved = status === "APPROVED";
  const declined = status === "DECLINED";
  const cancelled = status === "CANCELLED";
  return [
    { state: "done", icon: "check", title: "Du sendte ønske", meta: `${cap(coachFirst)} har mottatt ønsket ditt`, when: sentWhen },
    {
      state: approved || declined ? "done" : cancelled ? "pending" : "active",
      icon: "clock",
      title: declined ? "Coach kunne ikke" : "Coach foreslår tider",
      meta: declined
        ? `${cap(coachFirst)} hadde ikke ledig tid denne gangen — prøv et nytt ønske.`
        : `${cap(coachFirst)} sjekker kalenderen og sender alternative tidspunkter tilbake.`,
      when: cancelled ? undefined : "FORVENTET INNEN 24 T PÅ HVERDAGER",
    },
    { state: approved ? "done" : "pending", icon: "circle", title: "Du bekrefter", meta: "Velg et av tidspunktene coachen foreslår, eller be om et nytt forslag." },
    { state: approved ? "active" : "pending", icon: "calendar", title: "Time er booket", meta: "Vises i kalenderen din når den er bekreftet." },
  ];
}

export default async function OnskeligOktBekreftetPage() {
  const user = await requirePortalUser();
  const [request, ulest] = await Promise.all([
    prisma.sessionRequest.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { coach: { select: { name: true } } },
    }),
    getUnreadNotifications(user.id, 1),
  ]);

  if (!request) {
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
        <div className="pa-side ph21s">
          <Link href="/portal/gjennomfore" className="ph-tilbake">Gjør</Link>
          <TomTilstand icon={Send} title="Ingen ønsker ennå" text="Du har ikke sendt noe ønske om økt. Send et ønske, så hjelper coachen deg å finne en tid." />
          <Link href="/portal/onskeligokt" className="pa-btn pa-btn--primary pa-btn--full">Be om økt</Link>
        </div>
      </PlayerHQSkall>
    );
  }

  const coachName = request.coach?.name ?? null;
  const coachFirst = coachName?.split(" ")[0] ?? "coachen";
  const sentLabel = request.createdAt.toLocaleString("nb-NO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).replace(",", " ·");

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <Link href="/portal/gjennomfore" className="ph-tilbake">Gjør</Link>
        <OnskeligOktBekreftetV2
          data={{
            sentLabel,
            coachName,
            omraade: request.preferredArea ? AREA_LABEL[request.preferredArea] ?? request.preferredArea : null,
            onsketTid: request.preferredDate
              ? request.preferredDate.toLocaleString("nb-NO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
              : null,
            oktType: extractType(request.reason),
            notat: extractNote(request.reason),
            shortId: request.id.slice(-8).toUpperCase(),
            steg: buildSteps(request.status as SessionRequestStatus, coachFirst, request.createdAt),
          }}
        />
      </div>
    </PlayerHQSkall>
  );
}
