"use client";

/** Foreldreportal · Ukerapport. Minuttregelen og oppmøtetallet er beholdt.
 * Historisk sitering: designsystem/train-lock/FO-09 Ukerapport.dc.html og FO-09L Ukerapport lys.dc.html.
 */

import type { ForelderUkerapport } from "@/lib/forelder";
import { FoSkjerm, FoHode, FoCaps, FoKort, FoRad, FoTallKort, FoFotnote, FoTom } from "@/components/forelder/fo-presisjon";

export type UkerapportOktRad = { id: string; tittel: string; sub: string };

export function ForelderUkerapportV2({
  data, okter, ukeSpenn, parentName,
}: {
  data: ForelderUkerapport | null;
  okter: UkerapportOktRad[];
  ukeSpenn: string;
  parentName?: string;
}) {
  const fornavn = (parentName ?? "").split(" ")[0] || "deg";

  if (!data) {
    return (
      <FoSkjerm>
        <FoHode caps={`Forelder · ${fornavn}`} tittel="Ukerapport" />
        <FoTom tittel="Ingen barn er koblet ennå" sub="Coachen sender invitasjon når barnet er registrert i klubben." />
        <FoFotnote>Rapporten viser plan og oppmøte. Detaljert analyse deles ikke med foresatte.</FoFotnote>
      </FoSkjerm>
    );
  }

  const { childFirstName, ukenummer, oktFullfort, oktPlanlagt, coachNote } = data;

  return (
    <FoSkjerm>
      <FoHode caps={`Forelder · ${fornavn}`} tittel="Ukerapport" under={`${childFirstName} · uke ${ukenummer} · ${ukeSpenn}`} />
      <div className="fo-to">
        <FoTallKort label="Økter" value={oktFullfort} />
        <FoTallKort label="Oppmøte" value={oktFullfort} suffix={`av ${oktPlanlagt}`} />
      </div>
      <FoTallKort label="Etterlevelse · siste fire uker" value={data.etterlevelseTekst ?? "—"} />
      <FoFotnote>{data.nevnerTekst}</FoFotnote>
      <FoCaps>Gjennomført</FoCaps>
      {okter.length === 0 ? (
        <FoTom tittel="Ingen økter denne uka" sub="Ukas plan og oppmøte dukker opp her når økter er lagt inn." />
      ) : (
        okter.map((o) => <FoRad key={o.id} title={o.tittel} sub={o.sub} />)
      )}
      {coachNote && (
        <FoKort>
          <FoCaps>Notat fra coachen</FoCaps>
          <p className="fo-under">{coachNote.body}</p>
          <p className="fo-meta">{coachNote.author}</p>
        </FoKort>
      )}
      <FoFotnote>Rapporten viser plan og oppmøte. Detaljert analyse deles ikke med foresatte.</FoFotnote>
    </FoSkjerm>
  );
}
