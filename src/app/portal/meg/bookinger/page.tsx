/**
 * PlayerHQ · Mine bookinger (/portal/meg/bookinger) — Precision Athletics PH-23
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-23.jsx, «Mine timer»).
 * Auth og query er som før; bare visningen er ny. Faner: Kommende og Historikk.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentUleste } from "@/lib/portal-booking/uleste";
import { bookingRad } from "@/lib/portal-booking/ph23-rader";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23Bookinger } from "@/components/portal/precision/PH23Booking";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mine bookinger · PlayerHQ" };

const BYTT_FEIL_TEKST: Record<string, string> = {
  "24t": "Kunne ikke bytte tid. Det er under 24 timer til start, og flytting er da stengt.",
  cancelled: "Denne bookingen er avbestilt og kan ikke lenger flyttes.",
};

export default async function MineBookinger({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requirePortalUser({ kreverTilgang: "INGEN", allow: ["PLAYER", "COACH", "ADMIN"] });
  const { error } = await searchParams;

  const [bookings, uleste] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        serviceType: { select: { name: true, durationMin: true } },
        location: { select: { name: true } },
        coach: { select: { name: true } },
      },
      orderBy: { startAt: "desc" },
    }),
    hentUleste(user.id),
  ]);

  const na = new Date();
  const erKommende = (b: (typeof bookings)[number]) => b.startAt >= na && (b.status === "CONFIRMED" || b.status === "PENDING");
  const kommende = bookings.filter(erKommende).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const historikk = bookings.filter((b) => b.startAt < na || b.status === "CANCELLED").slice(0, 20);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH23Bookinger
        tilstand="data"
        feilTekst={error ? BYTT_FEIL_TEKST[error] : undefined}
        kommende={kommende.map((b) => bookingRad(b, b.coach?.name ?? null))}
        historikk={historikk.map((b) => bookingRad(b, b.coach?.name ?? null))}
      />
    </PlayerHQSkall>
  );
}
