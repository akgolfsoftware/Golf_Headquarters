import { SerieVelger } from "akgolf-hq-komponenter";

/** Gjenta økt (serie). «Endringen gjelder» vises bare for en eksisterende serie som ikke er «Aldri». */
const boks = { maxWidth: 400 };

/** Eksisterende ukentlig serie: valget øverst, omfanget under. */
export function HverUke() {
  return (
    <div style={boks}>
      <SerieVelger valgt="uke" eksisterende onChange={() => {}} onOmfang={() => {}} />
    </div>
  );
}

/** Ny økt som ikke er i en serie ennå: omfangsvelgeren er borte. */
export function NyOkt() {
  return (
    <div style={boks}>
      <SerieVelger valgt="touke" eksisterende={false} onChange={() => {}} />
    </div>
  );
}

/** «Aldri»: enkeltøkt, ingen serie og derfor ingen omfang. */
export function Aldri() {
  return (
    <div style={boks}>
      <SerieVelger valgt="aldri" eksisterende onChange={() => {}} />
    </div>
  );
}

/** Egendefinert rytme i en eksisterende serie. */
export function Egendefinert() {
  return (
    <div style={boks}>
      <SerieVelger valgt="egen" eksisterende onChange={() => {}} onOmfang={() => {}} />
    </div>
  );
}
