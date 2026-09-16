import { TidsVelger } from "akgolf-hq-komponenter";

const boks = { maxWidth: 340 };

/** Starttid med ± 15 min og forslag fra spillerens faste tider. Valgt tid er fylt. */
export function Starttid() {
  return (
    <div style={boks}>
      <TidsVelger label="Starttid" valgt="07:15" forslag={["06:30", "07:15", "08:00", "16:30", "17:15"]} />
    </div>
  );
}

/** Ettermiddagsøkt etter skoletid: andre forslag, annen valgt tid. */
export function Ettermiddag() {
  return (
    <div style={boks}>
      <TidsVelger label="Starttid" valgt="16:30" forslag={["15:00", "16:30", "17:15", "18:00"]} />
    </div>
  );
}
