/**
 * Booking-wizard (/portal/booking/ny) — v2 (retning C), Team G-A 17. juli 2026.
 *
 * RESTYLING ONLY av legacy-wizarden: samme query-drevne steg-modell
 * (service → dato → tid → /portal/booking/ny/bekreft via slot-lenkene) og
 * NØYAKTIG samme server-logikk — guards, redirects, queries, getAvailableSlots
 * og lokasjonsoppløsning er kopiert uendret. Kun presentasjonen er ny
 * (V2Shell + BookingNyV2). URL-kontrakten ?service=&dato= er uendret.
 *
 * Utvidet 2026-08-28 (Anders: spilleren skal ALDRI sendes ut av appen for å
 * booke): to moduser. «credits» = som før (forhåndsbetalte timer). «betaling»
 * = betal per time med kort (opprettBookingMedKort → Stripe Checkout →
 * webhook bekrefter). Betaling brukes når spilleren ikke har brukbare
 * credits (ingen pakke, eller brukt opp), eller når ?betaling=1 er satt
 * (drop-in-lenken fra booking-huben). Redirecten til /coaching er fjernet —
 * TALENT-nivået har rett til å booke enkelttimer (BUSINESS-RULES).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { byggBookingNyData } from "@/lib/portal-booking/ny-wizard-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke, Kort, TomTilstand } from "@/components/v2";
import { BookingNyV2 } from "@/components/portal/v2/BookingNyV2";

type Props = {
  searchParams: Promise<{ dato?: string; service?: string; betaling?: string }>;
};

export default async function NyBookingPage({ searchParams }: Props) {
  const { dato, service, betaling } = await searchParams;
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });

  const resultat = await byggBookingNyData({
    eierId: user.id,
    eierTier: user.tier,
    wizardBase: "/portal/booking/ny",
    dato,
    service,
    betaling,
  });

  if (resultat.ingenTjenester) {
    return (
      <V2Shell aktiv="plan" bredde="kolonne" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/portal/booking">Booking</TilbakeLenke>
        <Kort>
          <TomTilstand
            icon="target"
            title="Ingen tjenester tilgjengelig"
            sub="Ingen coaching-tjenester er aktive i øyeblikket. Kontakt support@akgolf.no."
          />
        </Kort>
      </V2Shell>
    );
  }

  return (
    <V2Shell aktiv="plan" bredde="kolonne" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/booking">Booking</TilbakeLenke>
      <BookingNyV2 data={resultat.data} />
    </V2Shell>
  );
}
