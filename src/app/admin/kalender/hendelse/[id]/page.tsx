/**
 * I3 (Bølge 1) — se og slett en kalenderhendelse. Nåbar fra kalenderens
 * hendelse-kort. Synlig for alle coacher (delt kalendervisning, samme
 * mønster som bookinger/serier) — slett-knappen vises kun til eieren
 * eller ADMIN, håndhevet både i UI og i selve slettHendelse-actionen.
 *
 * Server component.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { CoachContent } from "@/components/admin/precision/agency-completion/CoachContent";
import { KnappLenke } from "@/components/precision/pa";
import { SideHode } from "@/components/precision/pa-a4";
import { TL } from "@/lib/v2/train-lock";

import { SlettKnapp } from "./slett-knapp";

export const dynamic = "force-dynamic";

function fmt(d: Date): string {
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function HendelseDetaljPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;

  const hendelse = await prisma.calendarEvent.findUnique({
    where: { id },
    select: { id: true, title: true, startAt: true, endAt: true, notes: true, coachId: true },
  });
  if (!hendelse) notFound();

  const kanSlette = user.role === "ADMIN" || hendelse.coachId === user.id;

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}><CoachContent>
      <SideHode title={hendelse.title} sub="Kalenderhendelse" actions={<KnappLenke variant="ghost" href="/admin/kalender">Til kalenderen</KnappLenke>} />

      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 760 }}>
        <span style={{ fontFamily: TL.font.sans, fontSize: 15, color: TL.mute }}>
          {fmt(hendelse.startAt)} – {fmt(hendelse.endAt)}
        </span>
        {hendelse.notes && (
          <span style={{ fontFamily: TL.font.sans, fontSize: 15, color: TL.mute, marginTop: 8 }}>{hendelse.notes}</span>
        )}
      </div>

      {kanSlette && (
        <div style={{ marginTop: 24 }}>
          <SlettKnapp id={hendelse.id} />
        </div>
      )}
    </CoachContent></AgencyOSSkall>
  );
}
