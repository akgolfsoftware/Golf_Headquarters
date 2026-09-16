import { PillVelger } from "akgolf-hq-komponenter";

/** Periodevelger: aktiv = fylt pille i tekstfargen, 28 px høy. */
export function Periode() {
  return (
    <PillVelger
      options={[
        { v: "7d", l: "7 dager" },
        { v: "30d", l: "30 dager" },
        { v: "90d", l: "90 dager" },
        { v: "sesong", l: "Sesong" },
      ]}
      value="30d"
    />
  );
}

export function Visning() {
  return (
    <PillVelger
      options={[
        { v: "uke", l: "Uke" },
        { v: "maaned", l: "Måned" },
        { v: "aar", l: "År" },
      ]}
      value="uke"
    />
  );
}
