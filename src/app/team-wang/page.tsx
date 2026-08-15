import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { WangFellesside, type Fane } from "./_components/wang-fellesside";
import { hentWangGruppe } from "./_data/hent-wang-gruppe";

// Fellesside for WANG Toppidrett Fredrikstad – golfgruppa. Krever innlogget
// bruker (proxy.ts sperrer /team-wang siden 2026-08-02 — elevdata om
// mindreårige skal aldri være åpent tilgjengelig). Fortsatt noindex (layout)
// — elevdata om mindreårige holdes utenfor søkemotorer. Kobler ekte gruppedata
// fra AgencyOS (elevliste, perioder, samlinger) oppå skjermtekst-demoen;
// live-henting er try/catch-pakket, så bygg krever aldri nåbar database.
// force-dynamic gir ferske DB-data per forespørsel.
export const dynamic = "force-dynamic";

const FANER: Fane[] = ["oversikt", "plan", "skole", "foreldre"];

export default async function TeamWangPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}) {
  const { fane } = await searchParams;
  const start: Fane = FANER.includes(fane as Fane) ? (fane as Fane) : "oversikt";
  // proxy.ts sperrer allerede /team-wang, men vi trenger brukeren her for å
  // hente elevens EGNE fokusområder — de er personlige og hentes aldri for
  // gruppa som helhet.
  const bruker = await requirePortalUser({ redirectTo: "/team-wang/logg-inn" });
  const live = await hentWangGruppe(bruker.id);
  return <WangFellesside startFane={start} live={live} />;
}
