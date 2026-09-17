import { TigerFive } from "akgolf-hq-komponenter";

/** Fem kjernemetrikker for én runde. `invertert` = lavere er bedre, så trenden dømmes riktig vei. */
export function Standard() {
  return (
    <TigerFive
      metrikker={[
        { navn: "Bogeyfrie 9-hull", verdi: "3", status: "god", trend: "+1" },
        { navn: "Doble eller verre", verdi: "2", status: "varsel", trend: "+1", invertert: true },
        { navn: "3-putt", verdi: "1", status: "god", trend: "−2", invertert: true },
        { navn: "Bogey på par 5", verdi: "0", status: "god", trend: "0" },
        { navn: "Straffeslag", verdi: "4", status: "risiko", trend: "+2", invertert: true },
      ]}
    />
  );
}

/** Sterk runde: alle fem grønne, trendene peker riktig vei. */
export function SterkRunde() {
  return (
    <TigerFive
      metrikker={[
        { navn: "Bogeyfrie 9-hull", verdi: "5", status: "god", trend: "+2" },
        { navn: "Doble eller verre", verdi: "0", status: "god", trend: "−1", invertert: true },
        { navn: "3-putt", verdi: "0", status: "god", trend: "−1", invertert: true },
        { navn: "Bogey på par 5", verdi: "0", status: "god", trend: "0" },
        { navn: "Straffeslag", verdi: "0", status: "god", trend: "−2", invertert: true },
      ]}
    />
  );
}

/** Sesongsnitt per runde med enhet; nye metrikker uten trend viser tankestrek. */
export function SesongSnitt() {
  return (
    <TigerFive
      metrikker={[
        { navn: "Bogeyfrie 9-hull", verdi: "2,4", enhet: "per runde", status: "noytral", trend: null },
        { navn: "Doble eller verre", verdi: "1,1", enhet: "per runde", status: "varsel", trend: "+0,3", invertert: true },
        { navn: "3-putt", verdi: "0,8", enhet: "per runde", status: "god", trend: "−0,4", invertert: true },
        { navn: "Bogey på par 5", verdi: "0,6", enhet: "per runde", status: "varsel", trend: null },
        { navn: "Straffeslag", verdi: "1,9", enhet: "per runde", status: "risiko", trend: "+0,5", invertert: true },
      ]}
    />
  );
}
