/**
 * /booking/[slug]/bekreft — videresending (Anders 19.10.2026).
 *
 * Bekreft og betal er steg 4 i BK-01 (`/booking`, BK01Booking). Den gamle
 * bekreftsiden er fjernet; adressen sender til bookingflyten med tjenesten
 * forhåndsvalgt. Tidspunktet (`start`/`coach`) tas ikke med: BK-01 henter
 * ledige tider på nytt, så en gammel lenke kan ikke låse en tid som er tatt.
 *
 * Server-handlingen `createBookingCheckout` blir liggende i ./actions — BK-01
 * importerer den derfra.
 */
import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function BekreftPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/booking?tjeneste=${encodeURIComponent(slug)}`);
}
