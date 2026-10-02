import { avsnitt, esc } from "./precision-epost";
import { datoTekst, klokkeTekst } from "./booking-bekreftelse";
import { cancellationDeadlineFromUtcWallClock } from "../booking/policy";

type BookingContent = {
  id: string; startAt: Date; priceOre: number; subscriptionId: string | null;
  stripePaymentIntentId?: string | null; guestName?: string | null;
  user?: { name: string | null } | null; coach?: { name: string | null } | null;
  serviceType: { name: string }; location?: { name: string };
};

/** Lagret maltekst er redigerbar innledning; faktaradene bygges fortsatt fra bookingen. */
export function bookingTemplateContent(
  template: { subject: string; body: string }, booking: BookingContent, appUrl: string,
  extra: Record<string, string> = {},
) {
  const deadline = cancellationDeadlineFromUtcWallClock(booking.startAt);
  const vars: Record<string, string> = {
    name: booking.user?.name ?? booking.guestName ?? "der",
    serviceTypeName: booking.serviceType.name,
    date: datoTekst(booking.startAt), time: klokkeTekst(booking.startAt),
    location: booking.location?.name ?? "—",
    priceFormatted: booking.subscriptionId ? "Inkludert i abonnement" : `${(booking.priceOre / 100).toLocaleString("nb-NO")} kr`,
    paymentRef: booking.subscriptionId ? "Trukket fra månedlig saldo" : booking.stripePaymentIntentId ?? "",
    cancelDeadline: `${datoTekst(deadline)} kl. ${klokkeTekst(deadline)}`,
    bookingId: booking.id, appUrl, ...extra,
  };
  Object.assign(vars, {
    spillerNavn: vars.name, spillerFornavn: vars.name.trim().split(/\s+/)[0] || "der",
    coachNavn: booking.coach?.name ?? "—", okt_navn: vars.serviceTypeName,
    okt_dato: vars.date, okt_tid: vars.time, okt_lokasjon: vars.location, pris: vars.priceFormatted, link: appUrl,
  });
  const substitute = (text: string) => text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => vars[key] ?? "");
  return {
    subject: substitute(template.subject).replace(/[\r\n]+/g, " "),
    introHtml: substitute(template.body).split(/\n\n+/).map(p => avsnitt(
      esc(p.trim()).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br />"),
    )).join(""),
  };
}
