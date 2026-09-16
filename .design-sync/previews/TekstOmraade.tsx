import { TekstOmraade } from "akgolf-hq-komponenter";

const boks = { maxWidth: 440 };

export function Tom() {
  return (
    <div style={boks}>
      <TekstOmraade label="Treningsmål" defaultValue="" rows={3} placeholder="Hva vil du ha på plass innen 1. november?" />
    </div>
  );
}

/** Spillerens notat etter økt, slik det sendes til coach. */
export function Utfylt() {
  return (
    <div style={boks}>
      <TekstOmraade
        label="Notat til coach"
        defaultValue="Traff 7 av 10 fairways på Onsøy i dag. Driveren føles trygg, men innspillene fra 100–120 meter lander for kort — Carry lå 6–8 meter under målet på TrackMan."
      />
    </div>
  );
}

export function Feil() {
  return (
    <div style={boks}>
      <TekstOmraade label="Treningsmål" defaultValue="Bli bedre" rows={3} feil="Skriv minst én hel setning om hva du vil oppnå." />
    </div>
  );
}

export function Deaktivert() {
  return (
    <div style={boks}>
      <TekstOmraade label="Fokus for perioden" rows={3} disabled defaultValue="Satt av coach: nærspill og putting fram til 1. oktober. Endres i neste samtale." />
    </div>
  );
}
