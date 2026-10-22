import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnSpillerProfil, hentTnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import { osloDag } from "@/components/team-norway/skjermer/felles";
import { TnIupLaastSkjerm } from "@/components/team-norway/skjermer/tn-iup-laast-skjerm";
import { TnIupTurneringerVisning } from "@/components/team-norway/skjermer/tn-iup-faner-visning";

export const dynamic = "force-dynamic";

/** IUP › Turneringer (wireframes utkast-tn/trenerflate §2 og §4): brutto snitt i år mot i fjor, graf og tabell. */
export default async function SpillerTurneringerPage({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "TALENT" });
  const tilgang = await hentTnSpillerTilgang(bruker, spillerId);
  if (!tilgang) return <TnIupLaastSkjerm bruker={bruker} spillerId={spillerId} aktiv="turneringer" />;
  const aar = osloDag(new Date()).aar;
  const [iAar, iFjor] = await Promise.all([hentTnSpillerProfil(bruker, spillerId, aar), hentTnSpillerProfil(bruker, spillerId, aar - 1)]);
  if (!iAar) notFound();
  return <TnIupTurneringerVisning brukerNavn={bruker.name} kontekst={tilgang.kontekst} spillerId={spillerId} spillerNavn={tilgang.spillerNavn} aar={aar} iAar={iAar} iFjor={iFjor} />;
}
