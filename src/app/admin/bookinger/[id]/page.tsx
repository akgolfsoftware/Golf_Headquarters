/**
 * AG-06 Bookingen (/admin/bookinger/[id]), pakke 3 i nytt design (natt 17.10).
 * Samme guard (ADMIN/COACH) og scope som lista (`coachBookingScope`): coach ser
 * egne bookinger, head coach alle. notFound() når bookingen ikke finnes eller
 * ligger utenfor scope. Handlingene ligger i AG06Bookingen.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachBookingScope } from "@/lib/auth/booking-scope";
import { prisma } from "@/lib/prisma";
import { naaMs } from "../data";
import { AG06Bookingen, type AG06BookingenData } from "@/components/admin/precision/AG06Bookingen";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking · AgencyOS" };

const OSLO = { timeZone: "Europe/Oslo" } as const;
const DATO_LANG = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", ...OSLO });
const DATO_KORT = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", ...OSLO });
const KL = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", ...OSLO });
const ISO = new Intl.DateTimeFormat("sv-SE", OSLO);

const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const kr = (ore: number) => `${(ore / 100).toLocaleString("nb-NO", { maximumFractionDigits: 0 })} kr`;

function betaling(b: { priceOre: number; giftCardOre: number; stripePaymentIntentId: string | null; subscriptionId: string | null; paymentMethod: string | null }): string {
  if (b.giftCardOre > 0) {
    const rest = b.priceOre > 0 ? (b.stripePaymentIntentId ? " + betalt med kort" : " + resten ikke betalt") : "";
    return `Gavekort ${kr(b.giftCardOre)}${rest}`;
  }
  if (b.stripePaymentIntentId) return "Betalt";
  if (b.subscriptionId) return "Klipp";
  if (b.paymentMethod === "FAKTURA") return "Faktura";
  if (b.priceOre <= 0) return "Gratis";
  return "Ikke betalt";
}

export default async function AdminBookingDetaljPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;

  const r = await prisma.booking.findFirst({
    where: { id, ...coachBookingScope(user) },
    include: {
      user: { select: { id: true, name: true } },
      coach: { select: { name: true } },
      serviceType: { select: { name: true } },
      facility: { select: { name: true } },
      location: { select: { name: true } },
    },
  });
  if (!r) notFound();

  const b: AG06BookingenData = {
    id: r.id,
    hvem: r.user?.name ?? r.guestName ?? "Gjest",
    tjeneste: r.serviceType.name,
    status: r.status as AG06BookingenData["status"],
    datoLang: stor(DATO_LANG.format(r.startAt)),
    tid: KL.format(r.startAt),
    datoIso: ISO.format(r.startAt),
    varighetMin: Math.round((r.endAt.getTime() - r.startAt.getTime()) / 60000),
    sted: [r.facility?.name, r.location?.name].filter(Boolean).join(", ") || "—",
    coach: r.coach?.name ?? null,
    betaling: betaling(r),
    pris: kr(r.priceOre + r.giftCardOre),
    kontakt: r.user ? null : ([r.guestEmail, r.guestPhone].filter(Boolean).join(" · ") || null),
    spillerHref: r.user ? `/admin/spillere/${r.user.id}` : null,
    notat: r.notes,
    bestilt: DATO_KORT.format(r.createdAt),
    forslag: r.proposedStartAt ? `${DATO_KORT.format(r.proposedStartAt)} kl. ${KL.format(r.proposedStartAt)}` : null,
    kommende: r.startAt.getTime() > naaMs(),
    harKonto: r.userId != null,
    kanLageBetalingslenke:
      r.status === "CONFIRMED" && r.paymentMethod === "STRIPE" && r.priceOre > 0 && !r.stripePaymentIntentId,
  };

  return <AG06Bookingen navn={user.name ?? "Coach"} b={b} />;
}
