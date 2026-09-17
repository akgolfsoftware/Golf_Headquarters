import { EgentreningVindu } from "akgolf-hq-komponenter";

/** Gruppeøkt der en del av tiden er satt av til egentrening: vinduet markeres på øktas tidslinje. */
const boks = { maxWidth: 520 };

/** Onsdagens WANG-fellesøkt: siste 45 minutter er egentrening, ikke planlagt ennå. */
export function Standard() {
  return (
    <div style={boks}>
      <EgentreningVindu
        gruppeokt="WANG — fellesøkt"
        dag="Onsdag 16. sep"
        tid="17:00–19:00"
        vindu="18:00–18:45"
        vinduAndel={[0.5, 0.875]}
        onPlanlegg={() => {}}
      />
    </div>
  );
}

/** Spilleren har lagt sin egen økt i vinduet: status i stedet for handling. */
export function Planlagt() {
  return (
    <div style={boks}>
      <EgentreningVindu
        gruppeokt="GFGK junior — fellesøkt"
        dag="Torsdag 17. sep"
        tid="18:00–20:00"
        vindu="18:00–18:30"
        vinduAndel={[0, 0.25]}
        planlagt
      />
    </div>
  );
}

/** Langt vindu midt i en samlingsdag. */
export function Samlingsdag() {
  return (
    <div style={boks}>
      <EgentreningVindu
        gruppeokt="Team Norway — samling, dag 2"
        dag="Lørdag 3. okt"
        tid="09:00–15:00"
        vindu="12:00–14:00"
        vinduAndel={[0.5, 0.833]}
        onPlanlegg={() => {}}
      />
    </div>
  );
}
