import type { Metadata } from "next";

import { CoachArsplan } from "./coach-arsplan";
import { hentWangGruppe } from "../_data/hent-wang-gruppe";

// WANG Årsplan (Coach) – trenerverktøy. ÅPEN tilgang pr nå (Anders' beslutning:
// innloggingskravet fjernet midlertidig for demo/deling). Fortsatt noindex.
// Kobler ekte perioder og elevliste fra AgencyOS-gruppa oppå skjermtekst-demoen;
// live-henting er try/catch-pakket, så bygg krever aldri nåbar database.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WANG Årsplan — Coach",
  description: "Trenerens periodiserte årsplan for golfgruppa ved WANG Toppidrett Fredrikstad.",
  robots: { index: false, follow: false },
};

export default async function WangCoachPage() {
  const live = await hentWangGruppe();
  return <CoachArsplan live={live} />;
}
