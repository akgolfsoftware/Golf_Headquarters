import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { CoachArsplan } from "./coach-arsplan";
import { hentWangGruppe } from "../_data/hent-wang-gruppe";

// WANG Årsplan (Coach) – trenerverktøy. Auth-gatet (elevdata om mindreårige) +
// kobler ekte perioder og elevliste fra AgencyOS-gruppa oppå skjermtekst-demoen.
// Cookie-basert auth → dynamisk; live-henting er try/catch-pakket, så bygg
// krever aldri nåbar database.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WANG Årsplan — Coach",
  description: "Trenerens periodiserte årsplan for golfgruppa ved WANG Toppidrett Fredrikstad.",
  robots: { index: false, follow: false },
};

export default async function WangCoachPage() {
  const bruker = await getCurrentUser();
  if (!bruker) redirect("/auth/login?next=/team-wang/coach");

  const live = await hentWangGruppe();
  return <CoachArsplan live={live} />;
}
