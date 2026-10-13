import { notFound } from "next/navigation";
import Link from "next/link";
import { ForelderSkall } from "@/components/precision/ForelderSkall";
import { ForelderBarnValg } from "@/components/forelder/ForelderBarnValg";
import { FoHode, FoKort, FoSkjerm, FoFotnote } from "@/components/forelder/fo-presisjon";
import { hentForelderBookingDetalj } from "@/lib/forelder-booking-detalj";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking · Forelder", robots: { index: false, follow: false } };
export default async function ForelderBookingPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const data = await hentForelderBookingDetalj(bookingId);
  if (!data) notFound();
  return <ForelderSkall barnId={data.childId}><ForelderBarnValg barn={[{ id: data.childId, navn: data.barnNavn }]} valgt={data.childId} />
    <FoSkjerm><FoHode caps={`Booking · ${data.barnNavn}`} tittel={data.tjeneste} under={data.status} />
      <FoKort><dl className="support-booking-fakta">
        {[["Dato", data.dato], ["Tid", data.tid], ["Sted", data.sted], ...(data.adresse ? [["Adresse", data.adresse]] : []), ["Coach", data.coach ?? "Ikke registrert"], ["Pris i bookingen", data.pris], ["Betaling", data.betaling]].map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}
      </dl></FoKort>
      <Link className="pa-btn pa-btn--primary pa-btn--full" href={data.kontaktHref}>Kontakt om endring eller avbestilling</Link>
      <Link className="pa-btn pa-btn--secondary pa-btn--full" href={`/forelder/bookinger?barn=${encodeURIComponent(data.childId)}`}>Tilbake til bookinger</Link>
      <FoFotnote>Status og pris er fra den registrerte bookingen. Betaling bekreftes først når betalingen er registrert.</FoFotnote>
    </FoSkjerm></ForelderSkall>;
}
