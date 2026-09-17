import { Textarea } from "akgolf-hq-komponenter";

const boks = { maxWidth: 440 };
const etikett = { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 };

/** Tomt felt med plassholder, tre rader. Etiketten er en vanlig <label> — Textarea har ingen egen. */
export function Tom() {
  return (
    <div style={boks}>
      <label htmlFor="ta-maal" style={etikett}>Treningsmål</label>
      <Textarea id="ta-maal" rows={3} placeholder="Hva vil du ha på plass innen 1. november?" />
    </div>
  );
}

/** Spillerens notat etter økt, standard fire rader. Feltet kan ikke dras i størrelse (resize-none). */
export function Utfylt() {
  return (
    <div style={boks}>
      <label htmlFor="ta-notat" style={etikett}>Notat til coach</label>
      <Textarea
        id="ta-notat"
        defaultValue="Traff 7 av 10 fairways på Onsøy i dag. Driveren føles trygg, men innspillene fra 100–120 meter lander for kort — Carry lå 6–8 meter under målet på TrackMan."
      />
    </div>
  );
}

/** rows={2} for korte svar. */
export function ToRader() {
  return (
    <div style={boks}>
      <label htmlFor="ta-fokus" style={etikett}>Fokus for økta</label>
      <Textarea id="ta-fokus" rows={2} defaultValue="Attack Angle opp mot +2° med driver, samme tempo som i går." />
    </div>
  );
}

export function Deaktivert() {
  return (
    <div style={boks}>
      <label htmlFor="ta-periode" style={etikett}>Fokus for perioden</label>
      <Textarea
        id="ta-periode"
        rows={3}
        disabled
        defaultValue="Satt av coach: nærspill og putting fram til 1. oktober. Endres i neste samtale."
      />
    </div>
  );
}
