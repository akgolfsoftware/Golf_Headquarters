/**
 * Book time, steg 1 og 2 (/portal/booking/ny) — Precision Athletics PH-23
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-23.jsx).
 *
 * Samme query-drevne steg-modell og server-logikk som før (tjeneste → dag → tid →
 * /portal/booking/ny/bekreft): guards, queries, getAvailableSlots og lokasjonsoppløsning er
 * uendret i byggBookingNyData. URL-kontrakten ?service=&dato=&betaling= er uendret.
 * Betaling: credits-modus trekker klipp, betaling-modus går via Stripe Checkout.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { byggBookingNyData } from "@/lib/portal-booking/ny-wizard-data";
import { hentUleste } from "@/lib/portal-booking/uleste";
import { dagerFremover } from "@/lib/portal-booking/ph23-format";
import { pakkeNavn } from "@/lib/domain/abonnement";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23Ny } from "@/components/portal/precision/PH23Booking";
import { KnappLenke, TomTilstand } from "@/components/precision/pa";
import { Side, SideHode } from "@/components/precision/pa-a4";
import { Target } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Book time · PlayerHQ" };

type Props = {
  searchParams: Promise<{ dato?: string; service?: string; betaling?: string }>;
};

export default async function NyBookingPage({ searchParams }: Props) {
  const { dato, service, betaling } = await searchParams;
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });
  const [resultat, uleste] = await Promise.all([
    byggBookingNyData({ eierId: user.id, eierTier: user.tier, wizardBase: "/portal/booking/ny", dato, service, betaling }),
    hentUleste(user.id),
  ]);

  if (resultat.ingenTjenester) {
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
        <Side max={720}>
          <SideHode kicker="Meg · Booking" title="Book time" />
          <TomTilstand icon={Target} title="Ingen tjenester tilgjengelig" text="Ingen coaching-tjenester er aktive i øyeblikket. Kontakt support@akgolf.no." actions={<KnappLenke variant="secondary" href="/portal/booking">Tilbake til booking</KnappLenke>} />
        </Side>
      </PlayerHQSkall>
    );
  }

  const d = resultat.data;
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH23Ny
        data={d}
        dager={dagerFremover(14, new Date(d.valgtDatoIso))}
        klipp={{ total: d.monthlyCredits, igjen: d.creditsRemaining, pakke: pakkeNavn(d.monthlyCredits), fornyesTekst: d.fornyerLabel }}
      />
    </PlayerHQSkall>
  );
}
