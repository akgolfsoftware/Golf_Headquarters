import { SgTrendKort } from "akgolf-hq-komponenter";

const OPP = [-1.4, -0.9, -1.1, -0.3, 0.2, -0.4, 0.6, 0.4, 1.0, 1.2].map((sg) => ({ sg }));
const NED = [1.1, 0.8, 0.9, 0.4, 0.5, -0.1, 0.2, -0.3, -0.6, -0.8].map((sg) => ({ sg }));

/** Ti runder med hendelsesmarkører; siste punkt farges etter fortegn (grønn over null). */
export function Standard() {
  return (
    <SgTrendKort
      punkter={OPP}
      hendelser={[{ idx: 3, navn: "NGF-test" }, { idx: 7, navn: "Ny driver" }]}
      baseline="Broadie scratch"
    />
  );
}

/** Fallende: siste punkt under null blir rødt. */
export function Fallende() {
  return <SgTrendKort punkter={NED} hendelser={[{ idx: 5, navn: "Skade" }]} baseline="eget snitt 2025" />;
}

/** Uten hendelser og lavere høyde — for lister og sidepaneler. */
export function UtenHendelser() {
  return <SgTrendKort punkter={OPP} hendelser={[]} height={100} />;
}

/** Færre enn to runder → tom tilstand med baseline i teksten. */
export function ForFaaRunder() {
  return <SgTrendKort punkter={[{ sg: 0.4 }]} hendelser={[]} baseline="Broadie scratch" />;
}
