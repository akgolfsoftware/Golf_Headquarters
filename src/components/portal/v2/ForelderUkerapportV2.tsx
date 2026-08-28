"use client";

/**
 * Foreldreportal · Ukerapport — pikselport PX-5.
 * Fasit: designsystem/train-lock/FO-09 Ukerapport.dc.html
 * (+ FO-09L Ukerapport lys.dc.html — lys/mørk gjøres av tokens).
 * Bento «Økter»/«Oppmøte», «Gjennomført»-liste (hairline-rader), coach-notat
 * i kort, tom-tilstand uten koblet barn. Datamatten i hentForelderUkerapport
 * er urørt — dette er kun visning; øktradene hentes av siden.
 */

import { TL } from "@/lib/v2/train-lock";
import type { ForelderUkerapport } from "@/lib/forelder";
import {
  FoSkjerm,
  FoHode,
  FoCaps,
  FoKort,
  FoRad,
  FoTallKort,
  FoFotnote,
  FoTom,
} from "@/components/forelder/fo-kit";

/** Én gjennomført/planlagt økt denne uka — radene i «Gjennomført»-lista. */
export type UkerapportOktRad = {
  id: string;
  /** «Man · Styrke og putting» — ferdig sammensatt på server. */
  tittel: string;
  /** «16.00–17.30 · fullført» — ferdig formatert på server (Oslo-tid). */
  sub: string;
};

export function ForelderUkerapportV2({
  data,
  okter,
  ukeSpenn,
  parentName,
}: {
  data: ForelderUkerapport | null;
  /** Ukas økter (server-formatert) — FO-09 «Gjennomført»-lista. */
  okter: UkerapportOktRad[];
  /** «18.–24.08.2026» — ferdig formatert ukespenn. */
  ukeSpenn: string;
  parentName?: string;
}) {
  const fornavn = (parentName ?? "").split(" ")[0] || "deg";

  if (!data) {
    return (
      <FoSkjerm>
        <FoHode caps={`Forelder · ${fornavn}`} tittel="Ukerapport" />
        <FoTom
          tittel="Ingen barn er koblet ennå"
          sub="Coachen sender invitasjon når barnet er registrert i klubben."
        />
        <FoFotnote>
          Rapporten viser plan og oppmøte. Detaljert analyse deles ikke med
          foresatte.
        </FoFotnote>
      </FoSkjerm>
    );
  }

  const { childFirstName, ukenummer, oktFullfort, oktPlanlagt, coachNote } = data;

  return (
    <FoSkjerm>
      <FoHode
        caps={`Forelder · ${fornavn}`}
        tittel="Ukerapport"
        under={`${childFirstName} · uke ${ukenummer} · ${ukeSpenn}`}
      />

      {/* Bento: Økter / Oppmøte (FO-09) */}
      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <FoTallKort label="Økter" value={oktFullfort} />
        <FoTallKort
          label="Oppmøte"
          value={oktFullfort}
          suffix={`av ${oktPlanlagt}`}
        />
      </div>

      {/* Gjennomført-lista */}
      <div style={{ marginTop: 22 }}>
        <FoCaps>Gjennomført</FoCaps>
      </div>
      {okter.length === 0 ? (
        <FoTom
          tittel="Ingen økter denne uka"
          sub="Ukas plan og oppmøte dukker opp her når økter er lagt inn."
        />
      ) : (
        okter.map((o) => <FoRad key={o.id} title={o.tittel} sub={o.sub} />)
      )}

      {/* Notat fra coachen */}
      {coachNote && (
        <FoKort pad="16px 18px" style={{ marginTop: 14 }}>
          <FoCaps>Notat fra coachen</FoCaps>
          <div
            style={{
              marginTop: 8,
              fontFamily: TL.font.sans,
              fontSize: 15,
              lineHeight: 1.5,
              color: TL.text,
              textWrap: "pretty",
            }}
          >
            {coachNote.body}
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: TL.font.sans,
              fontSize: 13,
              color: TL.mute,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {coachNote.author}
          </div>
        </FoKort>
      )}

      <FoFotnote>
        Rapporten viser plan og oppmøte. Detaljert analyse deles ikke med
        foresatte.
      </FoFotnote>
    </FoSkjerm>
  );
}
