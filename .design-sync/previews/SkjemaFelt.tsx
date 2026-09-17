import { Inndata, SkjemaFelt, TekstOmraade, Velger } from "akgolf-hq-komponenter";

const boks = { maxWidth: 360 };

/** Etikett eies av SkjemaFelt — barnet får label={null} så den ikke tegnes to ganger. */
export function MedHjelp() {
  return (
    <div style={boks}>
      <SkjemaFelt label="Handicap" hjelp="Bruk komma som desimaltegn, f.eks. 4,2.">
        <Inndata label={null} defaultValue="4,2" mono />
      </SkjemaFelt>
    </div>
  );
}

/**
 * Feiltilstand: rød kant på kontrollen og én rød melding under — ingen hjelpetekst samtidig.
 * Feilen settes på feltet selv — settes den på SkjemaFelt, klones den inn i barnet OG
 * tegnes av wrapperen, så meldingen kommer to ganger (kildefeil, notert i learnings).
 * hjelp={null} er nødvendig: udefinert hjelp faller tilbake til SkjemaFelts standardtekst.
 */
export function MedFeil() {
  return (
    <div style={boks}>
      <SkjemaFelt label="Fødselsår" hjelp={null}>
        <Inndata label={null} defaultValue="09" mono feil="Fødselsår må ha fire siffer." />
      </SkjemaFelt>
    </div>
  );
}

export function MedVelger() {
  return (
    <div style={boks}>
      <SkjemaFelt label="Klubb" hjelp="Klubben du representerer i turneringer.">
        <Velger label={null} options={["Gamle Fredrikstad GK", "Onsøy GK", "Borregaard GK"]} defaultValue="Onsøy GK" />
      </SkjemaFelt>
    </div>
  );
}

export function MedTekstOmraade() {
  return (
    <div style={{ maxWidth: 440 }}>
      <SkjemaFelt label="Treningsmål" hjelp="Ett mål per periode. Coachen ser det i Workbench.">
        <TekstOmraade label={null} rows={3} defaultValue="Under 31 putt per runde i snitt over de neste fem turneringsrundene." />
      </SkjemaFelt>
    </div>
  );
}
