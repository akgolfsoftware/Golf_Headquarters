"use client";

/**
 * Foreldreportal · I dag. FO-01 i Precision Athletics.
 * Lesing av dagens økt, ukas oppmøte, neste booking og fotnoten er beholdt.
 * Historisk sitering, ikke visuell kilde: designsystem/train-lock/FO-01 Forelder les.dc.html
 * og FO-01L Forelder les lys.dc.html. Tegningen er ikke kontrollert i appen.
 */

import {
  FoSkjerm,
  FoHode,
  FoCaps,
  FoKort,
  FoRad,
  FoHake,
  FoFotnote,
  FoTom,
} from "@/components/forelder/fo-presisjon";

export type ForelderIdagOktRad = {
  id: string;
  tittel: string;
  sub: string;
  status: "FULLFORT" | "I_DAG" | "ANNET";
};

export type ForelderIdagData = {
  childFirstName: string | null;
  dagensOkt: { dagLabel: string; tittel: string; detalj: string } | null;
  ukenummer: number;
  okter: ForelderIdagOktRad[];
  neste: string | null;
  coachNavn: string | null;
};

export function ForelderV2({ data }: { data: ForelderIdagData }) {
  const { childFirstName, dagensOkt, ukenummer, okter, neste, coachNavn } = data;

  if (!childFirstName) {
    return (
      <FoSkjerm>
        <FoHode caps="Forelder" tittel="I dag" badge="Lesevisning" />
        <FoTom tittel="Ingen barn er koblet ennå" sub="Coachen sender invitasjon når barnet er registrert i klubben." />
      </FoSkjerm>
    );
  }

  return (
    <FoSkjerm>
      <FoHode caps={`Forelder · ${childFirstName}`} tittel="I dag" badge="Lesevisning" />
      {dagensOkt && (
        <FoKort>
          <FoCaps>{dagensOkt.dagLabel}</FoCaps>
          <p className="fo-navn">{dagensOkt.tittel}</p>
          <p className="fo-meta">{dagensOkt.detalj}</p>
        </FoKort>
      )}
      <FoCaps>Oppmøte · uke {ukenummer}</FoCaps>
      {okter.length === 0 ? (
        <FoTom tittel="Ingen økter denne uka" sub="Ukas plan dukker opp her når coachen har lagt den inn." />
      ) : (
        <div>
          {okter.map((o) => (
            <FoRad
              key={o.id}
              title={o.tittel}
              sub={o.sub}
              right={o.status === "FULLFORT" ? <FoHake /> : o.status === "I_DAG" ? <span className="fo-kicker">I dag</span> : undefined}
            />
          ))}
        </div>
      )}
      {neste && (
        <FoKort>
          <FoCaps>Neste</FoCaps>
          <p className="fo-navn">{neste}</p>
        </FoKort>
      )}
      <FoFotnote>
        Du ser plan og oppmøte. Trening, samtaler og analyse er mellom {childFirstName} og {coachNavn ?? "coachen"}.
      </FoFotnote>
    </FoSkjerm>
  );
}
