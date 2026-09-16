import { Tidslinje } from "akgolf-hq-komponenter";

const MND = [{ ved: 0, tekst: "Jan" }, { ved: 9, tekst: "Mar" }, { ved: 17, tekst: "Mai" }, { ved: 26, tekst: "Jul" }, { ved: 35, tekst: "Sep" }, { ved: 44, tekst: "Nov" }];

/** Punktene tegnes oppå barene — legg dem etter bartekstens slutt så etiketten forblir lesbar. */
const OYVIND = {
  etikett: "Øyvind Rohjan",
  barer: [
    { fra: 0, til: 14, akse: "FYS", tekst: "Grunnperiode" },
    { fra: 14, til: 26, akse: "TEK", tekst: "Spesialisering" },
    { fra: 26, til: 42, akse: "SPILL", tekst: "Turneringsperiode" },
    { fra: 42, til: 52, akse: "SLAG", tekst: "Evaluering" },
  ],
  punkter: [
    { ved: 24, variant: "turnering", etikett: "Norgescup 1" },
    { ved: 36, variant: "peak", etikett: "NM junior" },
    { ved: 40, variant: "turnering", etikett: "Norgescup-finale" },
  ],
};

const WANG = {
  etikett: "WANG Toppidrett",
  barer: [
    { fra: 0, til: 16, akse: "FYS", tekst: "Grunnperiode" },
    { fra: 16, til: 38, akse: "TURN", tekst: "Turneringsperiode" },
    { fra: 38, til: 52, akse: "SLAG", tekst: "Evaluering" },
  ],
  punkter: [
    { ved: 8, variant: "turnering", etikett: "Samling" },
    { ved: 33, variant: "peak", etikett: "Lag-NM" },
  ],
};

/** Årsplanen som baner: perioder som barer, turneringer som punkter (fylt = topp), nå-linjen i uke 38. */
export function Sesong2026() {
  return <Tidslinje total={52} ticks={MND} naa={38} baner={[OYVIND, WANG]} />;
}

/** Nærbilde på tolv uker: ukerytmen BYGG → BYGG → TOPP → DELOAD som barer, nå i uke 36. */
export function Ukerytme() {
  return (
    <Tidslinje
      total={12}
      ticks={[{ ved: 0, tekst: "Uke 27" }, { ved: 3, tekst: "Uke 30" }, { ved: 6, tekst: "Uke 33" }, { ved: 9, tekst: "Uke 36" }]}
      naa={9.5}
      etikettBredde={110}
      baner={[
        {
          etikett: "Øyvind Rohjan",
          barer: [
            { fra: 0, til: 2, akse: "SLAG", tekst: "Byggeuke" },
            { fra: 2, til: 4, akse: "SLAG", tekst: "Byggeuke" },
            { fra: 4, til: 6, akse: "TURN", tekst: "Toppuke" },
            { fra: 6, til: 8, akse: "FYS", tekst: "Avlastingsuke" },
            { fra: 8, til: 10, akse: "SLAG", tekst: "Byggeuke" },
            { fra: 10, til: 12, akse: "TURN", tekst: "Toppuke" },
          ],
          punkter: [{ ved: 5.6, variant: "turnering", etikett: "Norgescup 2" }, { ved: 11.6, variant: "peak", etikett: "Norgescup-finale" }],
        },
      ]}
    />
  );
}

/** Uten nå-linje (null) — historisk sesong sett i ettertid. */
export function UtenNaa() {
  return <Tidslinje total={52} ticks={MND} naa={null} baner={[OYVIND]} />;
}
