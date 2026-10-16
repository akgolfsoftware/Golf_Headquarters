"use client";

/** Foreldreportal · Dialog med coach. Siste melding og mailto er beholdt. Ikke en chat.
 * Historisk sitering: designsystem/train-lock/FO-04 Coach.dc.html og FO-04L Coach lys.dc.html.
 */

import { useState } from "react";
import {
  FoSkjerm, FoHode, FoCaps, FoKort, FoAvatar, FoCtaPrimar, FoCtaSekundar, FoFotnote, FoTom,
} from "@/components/forelder/fo-presisjon";

export interface ForelderCoachData {
  antallBarn: number;
  parentName?: string;
  childFirstName: string | null;
  coachNavn: string | null;
  coachAvatarUrl: string | null;
  coachEpost: string | null;
  sisteMelding: { title: string; body: string | null; dato: string } | null;
  supportEpost: string;
}

export function ForelderCoachV2({ data }: { data: ForelderCoachData }) {
  const { antallBarn, parentName, childFirstName, coachNavn, coachEpost, sisteMelding, supportEpost } = data;
  const fornavn = (parentName ?? "").split(" ")[0] || "deg";
  const [visKontakt, setVisKontakt] = useState(false);
  const epost = coachEpost ?? supportEpost;

  return (
    <FoSkjerm>
      <FoHode caps={`Forelder · ${fornavn}`} tittel="Dialog" under="Fra siste og kommende booking" />
      {antallBarn === 0 ? (
        <FoTom tittel="Ingen barn er koblet ennå" sub="Coachen sender invitasjon når barnet er registrert i klubben." />
      ) : !coachNavn ? (
        <FoTom tittel="Ingen coach registrert ennå" sub="Coachen vises her når barnet har hatt eller har en booket time." />
      ) : (
        <FoKort>
          <div className="fo-person">
            <FoAvatar navn={coachNavn} />
            <div>
              <p className="fo-navn">{coachNavn}</p>
              <p className="fo-meta">{childFirstName ? `Coach for ${childFirstName}` : "Coach"}</p>
            </div>
          </div>
          {sisteMelding && (
            <div className="fo-skille">
              <FoCaps>Siste melding · {sisteMelding.dato}</FoCaps>
              <p className="fo-under">{sisteMelding.body ?? sisteMelding.title}</p>
            </div>
          )}
          <FoCtaPrimar onClick={() => { window.location.href = `mailto:${epost}`; }}>Kontakt coach</FoCtaPrimar>
          <FoCtaSekundar onClick={() => setVisKontakt((v) => !v)}>{visKontakt ? epost : "Se kontaktinfo"}</FoCtaSekundar>
        </FoKort>
      )}
      <FoFotnote>Dette er ikke en samtaletråd. Meldinger fra coachen vises her når de sendes; svar går på e-post eller telefon.</FoFotnote>
    </FoSkjerm>
  );
}
