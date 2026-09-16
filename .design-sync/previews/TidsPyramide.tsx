import { TidsPyramide } from "akgolf-hq-komponenter";

type Akse = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
type Tid = { akse: Akse; timer: number };

/* Kortet står i en kolonne i appen; radbreddene er prosent av kortet. */
const kolonne = { maxWidth: 440 };
const uke = (turn: number, spill: number, slag: number, tek: number, fys: number): Tid[] => [
  { akse: "TURN", timer: turn }, { akse: "SPILL", timer: spill }, { akse: "SLAG", timer: slag },
  { akse: "TEK", timer: tek }, { akse: "FYS", timer: fys },
]; /* øverst = topp av pyramiden */

/** Kanonisk bruk: treningsuke — mest tid nederst (FYS), minst øverst (TURN). */
export function DenneUken() {
  return (
    <div style={kolonne}>
      <TidsPyramide data={uke(1.5, 3, 4.5, 5.5, 6.5)} periode="denne uken" />
    </div>
  );
}

/** Turneringsuke: mest tid øverst — pyramiden snur. */
export function Turneringsuke() {
  return (
    <div style={kolonne}>
      <TidsPyramide data={uke(8, 4, 2, 1.5, 2)} periode="uke 37 · turnering" />
    </div>
  );
}

/** Måned: større tall, samme form og aksefarger. */
export function Maaned() {
  return (
    <div style={kolonne}>
      <TidsPyramide data={uke(6, 12, 18, 22, 26)} periode="september" />
    </div>
  );
}

/** Ferieuke uten økter: alle rader på minstebredde, totalt 0,0 t. */
export function IngenOkter() {
  return (
    <div style={kolonne}>
      <TidsPyramide data={uke(0, 0, 0, 0, 0)} periode="uke 29 · ferie" />
    </div>
  );
}
