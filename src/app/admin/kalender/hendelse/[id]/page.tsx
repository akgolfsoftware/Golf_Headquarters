/**
 * Kalenderhendelse i Precision, 29.09.2026: se, endre og slett. Synlig for
 * alle coacher (delt kalendervisning, som før). Endre og slett vises bare for
 * eieren eller ADMIN — håndhevet også i oppdaterHendelse/slettHendelse.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { KnappLenke } from "@/components/precision/pa";
import { Side, SideHode } from "@/components/precision/pa-a4";
import { HendelseDetalj } from "@/components/admin/precision/AG05Hendelse";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hendelse · AgencyOS" };

const FMT = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
const p2 = (n: number) => String(n).padStart(2, "0");
const dato = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const kl = (d: Date) => `${p2(d.getHours())}:${p2(d.getMinutes())}`;

export default async function HendelseDetaljPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;

  const hendelse = await prisma.calendarEvent.findUnique({
    where: { id },
    select: { id: true, title: true, startAt: true, endAt: true, notes: true, coachId: true },
  });
  if (!hendelse) notFound();

  const kanEndre = user.role === "ADMIN" || hendelse.coachId === user.id;

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <Side max={760}>
        <SideHode
          kicker="Kalender · hendelse"
          title={hendelse.title}
          actions={<KnappLenke href="/admin/kalender" variant="ghost">Til kalenderen</KnappLenke>}
        />
        <HendelseDetalj
          id={hendelse.id}
          tid={`${FMT.format(hendelse.startAt)} – ${FMT.format(hendelse.endAt)}`}
          notat={hendelse.notes}
          kanEndre={kanEndre}
          verdier={{
            tittel: hendelse.title,
            startDato: dato(hendelse.startAt),
            startTid: kl(hendelse.startAt),
            sluttDato: dato(hendelse.endAt),
            sluttTid: kl(hendelse.endAt),
            notat: hendelse.notes ?? "",
          }}
        />
      </Side>
    </AgencyOSSkall>
  );
}
