import type { Metadata } from "next";
import { hentBookingKvittering } from "@/lib/booking/receipt";
import { BK03Kvittering } from "@/components/marketing/precision/BK03Kvittering";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kvittering · AK Golf", robots: { index: false, follow: false } };

export default async function Kvittering({ params, searchParams }: {
  params: Promise<{ bookingId: string }>;
  searchParams?: Promise<{ session_id?: string }>;
}) {
  const [{ bookingId }, query] = await Promise.all([params, searchParams]);
  const receipt = await hentBookingKvittering(bookingId, query?.session_id);
  return <BK03Kvittering tilstand={receipt.state} innlogget={receipt.loggedIn} signupHref="/auth/signup"
    detaljer={receipt.details} bookingerHref={receipt.bookingsHref} />;
}
