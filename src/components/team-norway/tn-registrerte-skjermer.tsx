import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnArbeidskontekst, type TnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { TnInviterSpiller } from "./tn-inviter-spiller";
import { TnManuellTurnering } from "./tn-manuell-turnering";
import { TnShell, TnSidehode, tnRolleNavn, type TnAktivSide } from "./tn-shell";
import { TnKort } from "./core";

type Skjerm =
  | "turnering-ny"
  | "inviter";


function Chrome({ aktiv, brukerNavn, kontekst, children }: { aktiv: TnAktivSide; brukerNavn: string; kontekst: TnArbeidskontekst; children: ReactNode }) {
  return (
    <TnShell aktiv={aktiv} brukerNavn={brukerNavn} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater={!kontekst.erSpiller} kanAdministrere={kontekst.kanAdministrere}>
      {children}
    </TnShell>
  );
}

/**
 * Uttakskriteriene, hver for seg (Anders, bindende).
 * Resultater, prestasjoner og prosess/adferd summeres aldri til én uttaksscore.
 * Skjermen har derfor ingen sumkolonne, og skal ikke få en.
 */
export const UTTAKSKRITERIER = [
  {
    nummer: "Kriterium 1",
    tittel: "Resultater",
    tekst: "Registrerte bruttoresultater og plasseringer. Grunnlaget ligger i Rangliste og er uendret her.",
    kilde: "Kilde: registrerte turneringsresultater",
  },
  {
    nummer: "Kriterium 2",
    tittel: "Prestasjoner",
    tekst: "Testresultater og målinger fra fellestesting. Antall tester i tabellen over sier hvor mye som faktisk er målt.",
    kilde: "Kilde: TN-batteriet, fellestesting",
  },
  {
    nummer: "Kriterium 3",
    tittel: "Prosess og adferd",
    tekst: "Trenerens vurdering av arbeid, oppmøte og holdning. Ikke registrert i noen modell i dag — feltet står tomt framfor å gjette.",
    kilde: "Kilde: ingen — krever godkjent vurderingsmodell",
  },
] as const;

export async function TnRegistrertSkjerm({ skjerm }: { skjerm: Skjerm }) {
  const bruker = await requirePortalUser({ kreverTilgang: "INGEN" });
  const brukerNavn = bruker.name ?? "Ukjent";

  if (skjerm === "turnering-ny") {
    const kontekst = await hentTnArbeidskontekst(bruker);
    if (!kontekst || !kontekst.erSpiller) notFound();
    return <Chrome aktiv="turneringer" brukerNavn={brukerNavn} kontekst={kontekst}><TnSidehode overlinje="Data · Manuell kilde" tittel="Legg inn turnering selv" ingress="Brukes når turneringen ikke finnes i katalogen." /><TnKort><TnManuellTurnering /></TnKort></Chrome>;
  }

  if (skjerm === "inviter") {
    const kontekst = await hentTnArbeidskontekst(bruker);
    if (!kontekst?.kanAdministrere) notFound();
    return <Chrome aktiv="inviter" brukerNavn={brukerNavn} kontekst={kontekst}><TnSidehode overlinje="Administrasjon · Medlemmer" tittel="Inviter spiller" ingress="Inviter spillere til Team Norway og følg status for hver invitasjon." /><TnKort><TnInviterSpiller groupId={kontekst.gruppe.id} /></TnKort></Chrome>;
  }

  notFound();
}
