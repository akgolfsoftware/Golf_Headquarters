/**
 * AgencyOS — Hjelp + support (`/admin/hjelp`), v2.
 * Port av `(legacy)/hjelp/page.tsx` (2026-07-14, AgencyOS Bølge 3.3) — samme
 * statiske innhold (kategorier/artikler/kontakt-CTA), ny v2-presentasjon i
 * `AdminHjelpV2`.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminHjelpV2, type HjelpArtikkel, type HjelpKategori } from "@/components/admin/v2/AdminHjelpV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hjelp · AgencyOS (v2)" };

const KATEGORIER: HjelpKategori[] = [
  { id: "komme-i-gang", title: "Komme i gang", count: 8, ikon: "sparkles" },
  { id: "trening", title: "Trening", count: 14, ikon: "target" },
  { id: "coaching", title: "Coaching", count: 12, ikon: "book-open" },
  { id: "booking-betaling", title: "Booking + betaling", count: 9, ikon: "credit-card" },
  { id: "kontoinnstillinger", title: "Kontoinnstillinger", count: 6, ikon: "settings" },
];

const ARTIKLER: HjelpArtikkel[] = [
  { id: "logg-runde-golfbox", title: "Hvordan logger jeg en runde fra GolfBox?", category: "Trening", readMin: 3, snippet: "Eksporter scorekort som CSV fra GolfBox, last opp i PlayerHQ og runden registreres automatisk på spilleren." },
  { id: "pyramide-fokus", title: "Hva er pyramide-fokus?", category: "Trening", readMin: 5, snippet: "Pyramide-fokus er AK Golf sin treningsmodell — bredt fundament av basistreninger, smalere topp med konkurransesimulering." },
  { id: "bytt-coach", title: "Slik bytter du coach", category: "Coaching", readMin: 2, snippet: "Be om bytte fra profilsiden. Nåværende coach får varsel, ny coach matcher etter tilgjengelighet og sertifisering." },
  { id: "live-session", title: "Slik bruker du Live Session", category: "Coaching", readMin: 6, snippet: "Live Session lar coach og spiller dele Trackman-data i sanntid. Krever Pro-abonnement og oppdatert mobilapp." },
];

export default async function HjelpAdminPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const totalArtikler = KATEGORIER.reduce((sum, c) => sum + c.count, 0);

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminHjelpV2 kategorier={KATEGORIER} artikler={ARTIKLER} totalArtikler={totalArtikler} />
    </V2Shell>
  );
}
