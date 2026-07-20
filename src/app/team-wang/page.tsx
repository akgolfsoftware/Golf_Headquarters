import { WangFellesside, type Fane } from "./_components/wang-fellesside";
import { hentWangGruppe } from "./_data/hent-wang-gruppe";

// Fellesside for WANG Toppidrett Fredrikstad – golfgruppa. ÅPEN tilgang pr nå
// (Anders' beslutning: innloggingskravet fjernet midlertidig for demo/deling).
// Fortsatt noindex (layout) — elevdata om mindreårige holdes utenfor søkemotorer.
// Kobler ekte gruppedata fra AgencyOS (elevliste, perioder, samlinger) oppå
// skjermtekst-demoen; live-henting er try/catch-pakket, så bygg krever aldri
// nåbar database. force-dynamic gir ferske DB-data per forespørsel.
export const dynamic = "force-dynamic";

const FANER: Fane[] = ["oversikt", "plan", "skole", "foreldre"];

export default async function TeamWangPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}) {
  const { fane } = await searchParams;
  const start: Fane = FANER.includes(fane as Fane) ? (fane as Fane) : "oversikt";
  const live = await hentWangGruppe();
  return <WangFellesside startFane={start} live={live} />;
}
