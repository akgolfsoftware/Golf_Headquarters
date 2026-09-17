import { SgTotal } from "akgolf-hq-komponenter";

/** SG Total mot navngitt baseline, alltid med antall runder. Trenden dømmer fargen på deltaet. */
export function Standard() {
  return (
    <SgTotal
      verdi="+1,2"
      enhet="slag"
      baseline="Broadie scratch"
      runder={10}
      trend="+0,4"
      begrunnelse="Innspill løfter totalen — putting trekker fortsatt ned."
    />
  );
}

/** Negativ verdi og fallende trend, målt mot spilleren selv. */
export function Negativ() {
  return (
    <SgTotal
      verdi="−0,8"
      enhet="slag"
      baseline="eget snitt 2025"
      runder={14}
      trend="−0,3"
      begrunnelse="Tre-putt fra 6–10 m koster mest — 4 av 14 runder hadde tre eller flere."
    />
  );
}

/** Med benchmark-linje under begrunnelsen. */
export function MedBenchmark() {
  return (
    <SgTotal
      verdi="+0,3"
      enhet="slag"
      baseline="Broadie scratch"
      runder={20}
      trend="+0,1"
      begrunnelse="Jevnt over alle fire kategorier — ingen enkelt lekkasje."
      benchmark="Stall-snitt −0,2 · Kat. A-krav +0,5 · 20 runder, 01.08–14.09.2026"
    />
  );
}

/** Runder med score, men uten slag for slag: SG kan ikke beregnes — tankestrek, ingen trend. */
export function UtenSg() {
  return (
    <SgTotal
      verdi={null}
      trend={null}
      runder={3}
      baseline="Broadie scratch"
      begrunnelse="Tre runder er logget med score fra GolfBox, men uten slag for slag. SG beregnes fra første runde registrert i appen."
    />
  );
}
