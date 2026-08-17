import { getCurrentUserRaw } from "@/lib/auth/getCurrentUser";
import { WangFellesside, type Fane } from "./_components/wang-fellesside";
import { hentWangGruppe } from "./_data/hent-wang-gruppe";

// Fellesside for WANG Toppidrett Fredrikstad – golfgruppa. ÅPEN uten innlogging
// fra 2026-08-11 slik at lenken kan deles med elever og foreldre. Det er trygt
// fordi siden ikke viser navn: `hentWangGruppe()` kalles uten `medElevnavn`, så
// elevlista er tom, og fellessiden renderer ingen roster. Legger du til noe her
// som viser personer, må sperren i proxy.ts tilbake FØR den koden merges.
// Fortsatt noindex (layout) — delbar via lenke, ikke via Google. Kobler ekte
// gruppedata fra AgencyOS (perioder, samlinger) oppå skjermtekst-demoen;
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
  const start: Fane = FANER.includes(fane as Fane)
    ? (fane as Fane)
    : "oversikt";
  // Innlogging er valgfri mens sperren er av. Er noen innlogget, viser vi
  // fortsatt deres EGNE fokusområder (personlige, aldri gruppa som helhet);
  // uinnlogget besøkende får fellesdataen uten personlig lag.
  const bruker = await getCurrentUserRaw();
  const live = await hentWangGruppe({ brukerId: bruker?.id });
  return <WangFellesside startFane={start} live={live} />;
}
