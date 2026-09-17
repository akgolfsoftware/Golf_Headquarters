import { SamtaleBoble } from "akgolf-hq-komponenter";

const kolonne = { display: "flex", flexDirection: "column" as const, gap: 12, maxWidth: 560 };

/** Caddie-samtale: assistent til venstre, spiller til høyre. */
export function Samtale() {
  return (
    <div style={kolonne}>
      <SamtaleBoble rolle="assistant">
        Du har spilt tre runder siden sist. Approach-slagene fra 80–120 meter koster mest: i snitt 0,6
        slag per runde mot ditt eget snitt. Vil du at jeg legger inn en wedge-økt på torsdag?
      </SamtaleBoble>
      <SamtaleBoble rolle="user" initialer="ØR">
        Ja, men hold den under 45 minutter. Jeg har styrke etterpå.
      </SamtaleBoble>
      <SamtaleBoble rolle="assistant">
        Lagt inn som utkast: 40 minutter, 60 slag fra 90 meter med Trackman-mål på Carry ± 5 meter.
        Coachen din ser forslaget før det publiseres.
      </SamtaleBoble>
    </div>
  );
}

/** Lang melding: tekst bryter inne i boblen, aldri ut av den. */
export function LangMelding() {
  return (
    <div style={kolonne}>
      <SamtaleBoble rolle="user" initialer="ØR">
        Jeg lurer på om jeg bør bytte til en 60-graders wedge før turneringen i helgen, eller om det er
        for sent å endre utstyr nå. Sist gang jeg byttet kølle rett før en turnering gikk det dårlig, og
        jeg vil ikke gjøre samme feil igjen. Hva sier tallene fra de siste TrackMan-øktene?
      </SamtaleBoble>
    </div>
  );
}
