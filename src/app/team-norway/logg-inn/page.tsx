import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUserRaw } from "@/lib/auth/getCurrentUser";
import { avvisningsmelding, lesAvvisningsgrunn } from "@/lib/auth/domene-sperre";
import { TnLoggInnSkjema } from "./tn-logg-inn-skjema";

/**
 * Innlogging for Team Norway-flaten. Står utenfor rutegruppen (trener), så
 * domenesperren ikke sender brukeren i ring. Avvist bruker (feil domene eller
 * ikke i trenerteamet) kommer hit med `?avvist=domene|rolle` og får en tydelig
 * melding og en knapp for å logge ut.
 *
 * Ikke tegnet i «Team Norway App delivery» (bc3e41fc). Bygget med de samme
 * byggeklossene (TnLogo, TnInput, TnKnapp) og tokenene fra TN-skallet.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Logg inn — Team Norway Golf",
  description: "Innlogging for trenerteamet i Team Norway Golf.",
  robots: { index: false, follow: false },
};

export default async function TeamNorwayLoggInnPage({ searchParams }: { searchParams: Promise<{ avvist?: string | string[] }> }) {
  const { avvist } = await searchParams;
  const grunn = lesAvvisningsgrunn(avvist);
  const bruker = await getCurrentUserRaw();
  // Innlogget uten avvisning: prøv flaten. Porten sender tilbake hit med
  // ?avvist= hvis kontoen ikke slipper inn, så dette går aldri i ring.
  if (bruker && !grunn) redirect("/team-norway");
  const melding = grunn ? avvisningsmelding("team-norway", grunn) : null;
  return <TnLoggInnSkjema avvisning={melding} innloggetSom={grunn && bruker ? bruker.email : null} />;
}
