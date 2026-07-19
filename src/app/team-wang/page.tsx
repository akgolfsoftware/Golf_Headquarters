import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { WangFellesside, type Fane } from "./_components/wang-fellesside";
import { hentWangGruppe } from "./_data/hent-wang-gruppe";

// Fellesside for WANG Toppidrett Fredrikstad – golfgruppa. Auth-gatet (elevdata
// om mindreårige) + kobler ekte gruppedata fra AgencyOS (elevliste, perioder,
// samlinger/hendelser) oppå skjermtekst-demoen. Cookie-basert auth → dynamisk;
// live-henting er try/catch-pakket, så bygg krever aldri nåbar database.
export const dynamic = "force-dynamic";

const FANER: Fane[] = ["oversikt", "plan", "skole", "foreldre"];

export default async function TeamWangPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}) {
  const bruker = await getCurrentUser();
  if (!bruker) redirect("/auth/login?next=/team-wang");

  const { fane } = await searchParams;
  const start: Fane = FANER.includes(fane as Fane) ? (fane as Fane) : "oversikt";
  const live = await hentWangGruppe();
  return <WangFellesside startFane={start} live={live} />;
}
