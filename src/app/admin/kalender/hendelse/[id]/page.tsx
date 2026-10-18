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
import { Topp } from "@/components/admin/agencyos-ny/ny";

import { SlettKnapp } from "./slett-knapp";

export const dynamic = "force-dynamic";

function fmt(d: Date): string {
  return new Intl.DateTimeFormat("nb-NO", {
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
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <div className="agn-s">
        <Topp tilbake={{ href: "/admin/kalender", tekst: "Kalender" }} dato="Hendelse · blokkert tid" tittel={hendelse.title}
          ingress={`${fmt(hendelse.startAt)} – ${fmt(hendelse.endAt)}`} />
        {hendelse.notes && <p className="forklar smal">{hendelse.notes}</p>}
        {kanSlette && <div className="knapper"><SlettKnapp id={hendelse.id} /></div>}
      </div>
    </AgencyOSSkall>
  );
}
