import { AnbefalingsKort } from "akgolf-hq-komponenter";

const boks = { maxWidth: 520 };

/** AI-forslag med alle fire felt: Hvorfor, Hva, Forventet effekt og Hvorfor nå. Alltid anbefaling, aldri sperre. */
export function Standard() {
  return (
    <div style={boks}>
      <AnbefalingsKort
        type="Justér plan"
        kilde="AI Caddie · basert på 214 TrackMan-slag siste 14 dager"
        hvorfor="Carry-spredningen på 7-jern er nede i 8,4 m (mål: 9,0 m) og har vært stabil i 14 dager. P4-oppgaven er i praksis ferdig."
        hva="Marker «P4 — venstre arm parallell» som fullført og flytt fokus til P6 halvveis ned."
        effekt="Frigjør ca. 2 timer i uken til nærspill, der SG-gapet er størst."
        hvorforNaa="Uken før Srixon Tour 5 — nedtrappingen gir rom for nærspill."
      />
    </div>
  );
}

/** Uten «Hvorfor nå»: tre felt, annen type. Effekten er merket som anslag. */
export function NyOkt() {
  return (
    <div style={boks}>
      <AnbefalingsKort
        type="Ny økt"
        kilde="AI Caddie · basert på 8 runder siden 1. august"
        hvorfor="Putter fra 3–6 fot går inn 62 % av gangene, mot 78 % i juni."
        hva="Legg inn 30 min putting torsdag: 40 putter fra 4 fot, tell treff."
        effekt="Anslag: −0,4 slag per runde på putting innen fire uker."
        hvorforNaa={null}
      />
    </div>
  );
}
