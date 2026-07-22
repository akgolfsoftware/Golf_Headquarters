/**
 * Bytt tid på booking — B-pakke.
 * Nåværende status først, deretter dato → tid, én grønn bekreft i slot-picker.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/booking/availability";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, TilbakeLenke, StatusPill, TomTilstand } from "@/components/v2";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { RescheduleDatoVelger } from "./reschedule-dato-velger";
import { RescheduleSlotPicker } from "./reschedule-slot-picker";

type Props = {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ dato?: string }>;
};

export default async function ReschedulePage({ params, searchParams }: Props) {
  const { bookingId } = await params;
  const { dato: datoParam } = await searchParams;
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      serviceType: {
        select: {
          id: true,
          slug: true,
          name: true,
          durationMin: true,
        },
      },
      location: { select: { name: true } },
    },
  });
  if (!booking) notFound();

  const erStaff = user.role === "ADMIN" || user.role === "COACH";
  if (booking.userId !== user.id && !erStaff) notFound();

  // eslint-disable-next-line react-hooks/purity
  const tidTilStart = booking.startAt.getTime() - Date.now();
  if (!erStaff && tidTilStart <= 24 * 60 * 60 * 1000) {
    redirect("/portal/meg/bookinger?error=24t");
  }

  if (booking.status === "CANCELLED") {
    redirect("/portal/meg/bookinger?error=cancelled");
  }

  const valgtDato = parseDatoQuery(datoParam) ?? startOfDay(addDays(new Date(), 1));
  const slots = await getAvailableSlots(booking.serviceType.id, valgtDato);

  const naa = booking.startAt.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const naaTid = booking.startAt.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: T.gap,
        }}
      >
        <TilbakeLenke href="/portal/meg/bookinger">Bookinger</TilbakeLenke>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <Caps>Bookinger · Bytt tid</Caps>
            <div style={{ marginTop: 10 }}>
              <Tittel em={booking.serviceType.name}>Bytt tid på</Tittel>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, margin: "8px 0 0", lineHeight: 1.45 }}>
              Velg ny dato og tid under.
            </p>
          </div>
          <StatusPill tone="info">Nå: {naaTid}</StatusPill>
        </div>

        <Kort>
          <Caps style={{ marginBottom: 8 }}>Nåværende tid</Caps>
          <div style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 600, color: T.fg }}>
            {naa} kl {naaTid}
          </div>
          <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, marginTop: 4 }}>
            {booking.serviceType.durationMin} min · {booking.location.name}
          </div>
        </Kort>

        <Kort>
          <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.5 }}>
            <strong style={{ color: T.fg }}>Regel:</strong> Bytting er gratis frem til 24 timer før start.
            Etter det kan ikke tidspunktet endres, og bookingen er ikke refunderbar.
          </p>
        </Kort>

        <div>
          <Caps style={{ marginBottom: 10 }}>1. Velg ny dato</Caps>
          <RescheduleDatoVelger valgtDato={valgtDato} bookingId={booking.id} dager={14} />
        </div>

        <div>
          <Caps style={{ marginBottom: 10 }}>2. Velg tid</Caps>
          {slots.length === 0 ? (
            <Kort>
              <TomTilstand
                icon="calendar"
                title="Ingen ledige tider denne dagen"
                sub="Prøv en annen dato over — så finner vi en ledig slot."
              />
            </Kort>
          ) : (
            <RescheduleSlotPicker
              bookingId={booking.id}
              slots={slots.map((s) => ({
                start: s.start.toISOString(),
                coachId: s.coachId,
                coachName: s.coachName,
              }))}
            />
          )}
        </div>
      </div>
    </V2Shell>
  );
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function parseDatoQuery(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return startOfDay(d);
}
