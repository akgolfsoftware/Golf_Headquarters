import { SamtaleBoble, SamtaleSkriver } from "akgolf-hq-komponenter";

const kolonne = { display: "flex", flexDirection: "column" as const, gap: 12, maxWidth: 560 };

/** «Skriver …»-indikatoren: AI-skive og boble med tre blinkende prikker (statisk fanget: prikkene står dempet). */
export function Standard() {
  return (
    <div style={kolonne}>
      <SamtaleSkriver />
    </div>
  );
}

/** Rett etter spillerens melding, mens svaret lages. */
export function EtterMelding() {
  return (
    <div style={kolonne}>
      <SamtaleBoble rolle="user" initialer="ØR">
        Jeg spilte 76 i dag. Putting var dårlig — 34 putter.
      </SamtaleBoble>
      <SamtaleSkriver />
    </div>
  );
}

/** I en tråd: forrige svar, ny melding, og indikatoren nederst der neste svar kommer. */
export function ITrad() {
  return (
    <div style={kolonne}>
      <SamtaleBoble rolle="assistant">
        34 putter er fire over snittet ditt. Var det lengdekontroll eller lesing som sviktet?
      </SamtaleBoble>
      <SamtaleBoble rolle="user" initialer="ØR">
        Lengde. Tre treputter fra over 10 meter.
      </SamtaleBoble>
      <SamtaleSkriver />
    </div>
  );
}
