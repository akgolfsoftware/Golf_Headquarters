import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { BindAktivBruker } from "@/components/auth/bind-aktiv-bruker";
import { PaperTilstand, PaperIkon } from "@/components/system/side-tilstand";
import { CoachArsplan } from "./coach-arsplan";
import {
  hentWangGruppe,
  WangGruppeHentefeil,
} from "../_data/hent-wang-gruppe";
import { erWangGruppeTrener } from "../_data/wang-tilgang";

// WANG Årsplan (Coach) – trenerverktøy. SPERRET for ADMIN/COACH: siden viser
// roster med elevnavn og IUP-lenker — PII om mindreårige. To lag foran den,
// `proxy.ts` og `requirePortalUser` under; ingen av dem skal fjernes alene.
// Mellom 2026-08-15 og denne endringen var begge av, og navnene lå åpent for
// alle med lenken. Fellessiden (/team-wang) er åpen ved siden av, men den er
// navnefri. Fortsatt noindex.
//
// Plattform-COACH uten WANG-gruppemedlemskap får notFound — ikke hele
// WANG-elevlista. DB-feil gir feilside, ikke demonstrasjons-elever.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WANG Årsplan — Coach",
  description:
    "Trenerens periodiserte årsplan for golfgruppa ved WANG Toppidrett Fredrikstad.",
  robots: { index: false, follow: false },
};

function WangGruppeUtilgjengelig() {
  return (
    <PaperTilstand
      dataSlug="wang-gruppe-utilgjengelig"
      ikon={PaperIkon.teknisk}
      tittel="Kunne ikke hente WANG-gruppa"
      tekst="Tjenesten svarte ikke. Ingen elevliste vises, og vi viser ikke demonstrasjonsdata i stedet for ekte elever."
      virkerLabel="Imens"
      virkerLinjer={[
        { label: "Innloggingen din", verdi: "beholdt" },
        { label: "Elevdata", verdi: "ikke vist" },
        { label: "Demonstrasjonsplan", verdi: "ikke brukt som elevdata" },
      ]}
      knapper={[
        { label: "Prøv igjen", href: "/team-wang/coach", primary: true },
        { label: "Til fellessiden", href: "/team-wang" },
      ]}
      kode="503 · gruppe kunne ikke hentes"
    />
  );
}

export default async function WangCoachPage() {
  const bruker = await requirePortalUser({
    allow: ["ADMIN", "COACH"],
    redirectTo: `/team-wang/logg-inn?next=${encodeURIComponent("/team-wang/coach")}`,
  });
  let erTrener: boolean;
  try {
    erTrener = await erWangGruppeTrener(bruker);
  } catch (e) {
    if (e instanceof WangGruppeHentefeil) return <WangGruppeUtilgjengelig />;
    throw e;
  }
  if (!erTrener) notFound();

  let live = null;
  try {
    live = await hentWangGruppe({ medElevnavn: true });
  } catch (e) {
    if (e instanceof WangGruppeHentefeil) return <WangGruppeUtilgjengelig />;
    throw e;
  }

  const coachNavn = bruker.name?.trim() || bruker.email;
  const coachRolle = bruker.role === "ADMIN" ? "Administrator" : "Trener golf";

  return (
    <>
      <BindAktivBruker userId={bruker.id} />
      <CoachArsplan live={live} coachNavn={coachNavn} coachRolle={coachRolle} />
    </>
  );
}
