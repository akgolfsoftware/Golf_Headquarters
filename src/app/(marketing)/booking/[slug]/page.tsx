/**
 * /booking/[slug] — videresending (Anders 19.10.2026).
 *
 * Tjeneste og tid velges i BK-01 (`/booking`, BK01Booking). Adressen beholdes
 * fordi Stripe sender kunden hit ved avbrutt betaling (`cancel_url` i
 * ./bekreft/actions.ts) og fordi gamle lenker peker hit. Kunden lander i
 * bookingflyten med tjenesten forhåndsvalgt.
 */
import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function ServiceBookingPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/booking?tjeneste=${encodeURIComponent(slug)}`);
}
