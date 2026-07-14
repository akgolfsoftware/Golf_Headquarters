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
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke, Tittel, Caps } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
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
    <V2Shell aktiv="kalender" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/kalender">Kalender</TilbakeLenke>
      <div style={{ marginTop: 12, marginBottom: 20 }}>
        <Caps>Hendelse</Caps>
        <div style={{ marginTop: 6 }}>
          <Tittel mobile={false}>{hendelse.title}</Tittel>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 420 }}>
        <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2 }}>
          {fmt(hendelse.startAt)} – {fmt(hendelse.endAt)}
        </span>
        {hendelse.notes && (
          <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, marginTop: 8 }}>{hendelse.notes}</span>
        )}
      </div>

      {kanSlette && (
        <div style={{ marginTop: 24 }}>
          <SlettKnapp id={hendelse.id} />
        </div>
      )}
    </V2Shell>
  );
}
