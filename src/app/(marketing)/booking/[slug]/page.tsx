/**
 * /booking/[slug] — gammel adresse, nå en videresending til `/booking?tjeneste=<slug>`
 * (BK-01/BK-02 i Precision Athletics). Stripes cancel_url peker fortsatt hit, så
 * kunden som avbryter betalingen lander på tidsvalget for samme tjeneste.
 * Pausen håndteres av `/booking`.
 */
import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function ServiceBookingPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/booking?tjeneste=${encodeURIComponent(slug)}`);
}
