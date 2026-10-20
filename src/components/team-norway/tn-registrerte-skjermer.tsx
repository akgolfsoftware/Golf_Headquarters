import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnArbeidskontekst, type TnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { TnInviterSpiller } from "./tn-inviter-spiller";
import { TnSkraKort, TnSkraTopp } from "./tn-skra-topp";
import { TnShell, tnRolleNavn, type TnAktivSide } from "./tn-shell";
import { TnKort } from "./core";

type Skjerm = "inviter";


async function Chrome({ aktiv, brukerNavn, kontekst, tilbake, children }: { aktiv: TnAktivSide; brukerNavn: string; kontekst: TnArbeidskontekst; tilbake?: { href: string; label: string }; children: ReactNode }) {
  const visDataGolf = !kontekst.erSpiller && (await innloggetKanSeDataGolf());
  return (
    <TnShell aktiv={aktiv} brukerNavn={brukerNavn} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater={!kontekst.erSpiller} kanAdministrere={kontekst.kanAdministrere} visDataGolf={visDataGolf} tilbake={tilbake}>
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
    tekst: "Testresultater og målinger fra fellestesting. Antall tester per spiller står i Spillerutvikling og sier hvor mye som faktisk er målt.",
    kilde: "Kilde: TN-batteriet, fellestesting",
  },
  {
    nummer: "Kriterium 3",
    tittel: "Prosess og adferd",
    tekst: "Trenerens vurdering av arbeid, oppmøte og holdning, på skalaen 1–5 som fireukerssjekken (Anders 20.10.2026).",
    kilde: "Kilde: trenerens vurdering 1–5",
  },
] as const;

export async function TnRegistrertSkjerm({ skjerm }: { skjerm: Skjerm }) {
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "INGEN" });
  const brukerNavn = bruker.name ?? "Ukjent";

  if (skjerm === "inviter") {
    const kontekst = await hentTnArbeidskontekst(bruker);
    if (!kontekst?.kanAdministrere) notFound();
    return <Chrome aktiv="inviter" brukerNavn={brukerNavn} kontekst={kontekst}><TnSkraTopp bilde="spiller-ved-vannet" etikett="Inviter spiller" overlinje={`Administrasjon · ${kontekst.gruppe.name}`} tittel="Inviter spiller" ingress="Inviter spillere til Team Norway og følg status for hver invitasjon." /><TnSkraKort><TnKort><TnInviterSpiller groupId={kontekst.gruppe.id} /></TnKort></TnSkraKort></Chrome>;
  }

  notFound();
}
