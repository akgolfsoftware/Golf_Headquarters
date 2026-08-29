"use client";

/**
 * Foreldreportal · forside «I dag» — pikselport PX-5.
 * Fasit: designsystem/train-lock/FO-01 Forelder les.dc.html
 * (+ FO-01L Forelder les lys.dc.html — lys/mørk gjøres av tokens).
 * Ren LESEVISNING: dagens økt-kort, «Oppmøte · uke NN»-liste med warm hake
 * for fullført og «I DAG»-caps for dagens rad, «Neste»-kort og fotnoten om
 * hva foresatte ser. De gamle fem fanene (Paper PP-3) er erstattet av denne
 * lesevisningen — underskjermene nås via navigasjonen (FORELDER_MER).
 */

import { TL } from "@/lib/v2/train-lock";
import {
  FoSkjerm,
  FoHode,
  FoCaps,
  FoKort,
  FoRad,
  FoHake,
  FoFotnote,
  FoTom,
} from "@/components/forelder/fo-kit";

/* ── Datakontrakt (alt server-formatert — komponenten er ren visning) ── */

export type ForelderIdagOktRad = {
  id: string;
  /** «Man · Styrke + putt». */
  tittel: string;
  /** «fullført» / «i dag 09.00» / «17.00». */
  sub: string;
  status: "FULLFORT" | "I_DAG" | "ANNET";
};

export type ForelderIdagData = {
  /** Barnets fornavn (caps «Forelder · Øyvind»). Null = ingen barn koblet. */
  childFirstName: string | null;
  /** Dagens økt-kort — null når ingen økt i dag. */
  dagensOkt: {
    /** «Lørdag 22.» */
    dagLabel: string;
    tittel: string;
    /** «09.00–13.00 · GFGK». */
    detalj: string;
  } | null;
  ukenummer: number;
  okter: ForelderIdagOktRad[];
  /** «Neste»-kortet — neste booking («Banespill · 29.08 · 09.00»). */
  neste: string | null;
  coachNavn: string | null;
};

export function ForelderV2({ data }: { data: ForelderIdagData }) {
  const { childFirstName, dagensOkt, ukenummer, okter, neste, coachNavn } = data;

  if (!childFirstName) {
    return (
      <FoSkjerm>
        <FoHode caps="Forelder" tittel="I dag" badge="Lesevisning" />
        <FoTom
          tittel="Ingen barn er koblet ennå"
          sub="Coachen sender invitasjon når barnet er registrert i klubben."
        />
      </FoSkjerm>
    );
  }

  return (
    <FoSkjerm>
      <FoHode
        caps={`Forelder · ${childFirstName}`}
        tittel="I dag"
        badge="Lesevisning"
      />

      {/* Dagens økt-kort (FO-01) */}
      {dagensOkt && (
        <FoKort pad="16px 20px" style={{ marginTop: 14 }}>
          <FoCaps>{dagensOkt.dagLabel}</FoCaps>
          <div
            style={{
              marginTop: 6,
              fontFamily: TL.font.sans,
              fontSize: 22,
              fontWeight: 700,
              color: TL.text,
            }}
          >
            {dagensOkt.tittel}
          </div>
          <div
            style={{
              marginTop: 2,
              fontFamily: TL.font.sans,
              fontSize: 13,
              color: TL.mute,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {dagensOkt.detalj}
          </div>
        </FoKort>
      )}

      {/* Oppmøte · uke NN */}
      <div style={{ marginTop: 14 }}>
        <FoCaps>Oppmøte · uke {ukenummer}</FoCaps>
      </div>
      {okter.length === 0 ? (
        <FoTom
          tittel="Ingen økter denne uka"
          sub="Ukas plan dukker opp her når coachen har lagt den inn."
        />
      ) : (
        <div>
          {okter.map((o) => (
            <FoRad
              key={o.id}
              title={o.tittel}
              sub={o.sub}
              right={
                o.status === "FULLFORT" ? (
                  <span style={{ alignSelf: "center" }}>
                    <FoHake />
                  </span>
                ) : o.status === "I_DAG" ? (
                  <span
                    style={{
                      alignSelf: "center",
                      fontFamily: TL.font.sans,
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: TL.mute,
                      whiteSpace: "nowrap",
                    }}
                  >
                    I dag
                  </span>
                ) : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Neste-kortet */}
      {neste && (
        <FoKort pad="14px 18px" style={{ marginTop: 14 }}>
          <FoCaps>Neste</FoCaps>
          <div
            style={{
              marginTop: 6,
              fontFamily: TL.font.sans,
              fontSize: 15,
              fontWeight: 600,
              color: TL.text,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {neste}
          </div>
        </FoKort>
      )}

      <FoFotnote size={11} style={{ marginTop: 12 }}>
        Du ser plan og oppmøte. Trening, samtaler og analyse er mellom{" "}
        {childFirstName} og {coachNavn ?? "coachen"}.
      </FoFotnote>
    </FoSkjerm>
  );
}
