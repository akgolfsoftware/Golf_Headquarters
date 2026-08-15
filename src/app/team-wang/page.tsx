import { getCurrentUserRaw } from "@/lib/auth/getCurrentUser";
import { WangFellesside, type Fane } from "./_components/wang-fellesside";
import { hentWangGruppe } from "./_data/hent-wang-gruppe";

// Fellesside for WANG Toppidrett Fredrikstad – golfgruppa. MIDLERTIDIG åpnet
// uten innlogging (Anders 2026-08-15, «pr nå») — reverserer 2026-08-02-
// sperren i proxy.ts. Elevdata om mindreårige er dermed åpent tilgjengelig
// for alle med lenken. Fortsatt noindex (layout) — holdes utenfor
// søkemotorer. Kobler ekte gruppedata fra AgencyOS (elevliste, perioder,
// samlinger) oppå skjermtekst-demoen; live-henting er try/catch-pakket, så
// bygg krever aldri nåbar database. force-dynamic gir ferske DB-data per
// forespørsel.
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
  const live = await hentWangGruppe(bruker?.id);
  return <WangFellesside startFane={start} live={live} />;
}
