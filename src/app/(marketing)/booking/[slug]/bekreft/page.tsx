/**
 * /booking/[slug]/bekreft — gammel adresse, nå en videresending til
 * `/booking?tjeneste=<slug>`. Bekreftelsen er steg 4 i den ene bookingflyten
 * (BK-01/BK-02). Server-actionen `createBookingCheckout` (./actions) er uendret.
 */
import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function BekreftPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/booking?tjeneste=${encodeURIComponent(slug)}`);
}
