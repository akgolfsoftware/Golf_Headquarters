/**
 * PlayerHQ · Mine bookinger — B-pakke (v2 tokens + én primær CTA).
 */
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { BookingerTabs } from "./bookinger-tabs";

import { Caps, Tittel, CTAPill, Kort, StatusPill } from "@/components/v2";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TL } from "@/lib/v2/train-lock";

const BYTT_FEIL_TEKST: Record<string, string> = {
  "24t": "Kunne ikke bytte tid — det er under 24 timer til start, og bytting er da stengt.",
  cancelled: "Denne bookingen er kansellert og kan ikke lenger byttes.",
};

export default async function MineBookinger({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requirePortalUser({ kreverTilgang: "INGEN", allow: ["PLAYER", "COACH", "ADMIN"] });
  const { error } = await searchParams;
  const feilTekst = error ? BYTT_FEIL_TEKST[error] : undefined;

  // Alle bookinger skjer i appen — wizarden velger selv credits/betaling.
  const nyBookingHref = "/portal/booking/ny";

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      serviceType: { select: { name: true, durationMin: true } },
      location: { select: { name: true } },
    },
    orderBy: { startAt: "desc" },
  });

  const idag = new Date();
  const kommende = bookings.filter(
    (b) =>
      b.startAt >= idag &&
      (b.status === "CONFIRMED" || b.status === "PENDING"),
  );
  const historikk = bookings.filter(
    (b) => b.startAt < idag || b.status === "CANCELLED",
  );

  return (
    <V2Shell aktiv="meg" bredde="kolonne" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <Caps>Meg · Bookinger</Caps>
            <div style={{ marginTop: 10 }}>
              <Tittel em="timer">Dine</Tittel>
            </div>
          </div>
          <StatusPill tone={kommende.length > 0 ? "info" : "up"}>
            {kommende.length > 0 ? `${kommende.length} kommende` : "Ingen planlagt"}
          </StatusPill>
        </div>

        {feilTekst && (
          <Kort tint>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <StatusPill tone="warn">Kunne ikke bytte</StatusPill>
              <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text }}>{feilTekst}</span>
            </div>
          </Kort>
        )}

        <Link href={nyBookingHref} style={{ textDecoration: "none", display: "block" }}>
          <CTAPill icon="calendar-plus" full>
            Ny booking
          </CTAPill>
        </Link>

        <Kort>
          <BookingerTabs
            kommende={kommende}
            historikk={historikk}
            nyBookingHref={nyBookingHref}
          />
        </Kort>
      </div>
    </V2Shell>
  );
}
