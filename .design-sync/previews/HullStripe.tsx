import { HullStripe, Kort } from "akgolf-hq-komponenter";

/* Par 72: 4 par 3, 4 par 5. `runde` legger avviket per hull på paren. */
const PAR = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4];
const runde = (avvik: number[]) => PAR.map((par, i) => ({ nr: i + 1, par, score: par + avvik[i] }));

/** Kanonisk bruk i et kort: 73 slag (+1) — tre birdier, to bogeyer og én dobbel. */
export function Runde() {
  return (
    <Kort eyebrow="Runde · 14.09.2026 · 73 (+1)">
      <HullStripe hull={runde([0, -1, 0, 0, 1, 0, 0, -1, 0, 1, 0, 0, -1, 2, 0, 0, 0, 0])} />
    </Kort>
  );
}

/** Sterk runde uten legende: 68 (−4), fire birdier, null bogeyer. */
export function BesteRunde() {
  return (
    <Kort eyebrow="Beste runde 2026 · 68 (−4)">
      <HullStripe visLegende={false} hull={runde([0, -1, 0, -1, 0, 0, 0, 0, -1, 0, 0, 0, -1, 0, 0, 0, 0, 0])} />
    </Kort>
  );
}

/** Tung dag: 80 (+8) med tre dobbelbogeyer — rød rute får sterkere fyll. */
export function TungDag() {
  return (
    <Kort eyebrow="Runde · 06.09.2026 · 80 (+8)">
      <HullStripe hull={runde([1, 0, 2, 1, 0, 1, 0, 0, 1, 0, 1, 0, 2, 0, -1, 2, 0, -1])} />
    </Kort>
  );
}

/** Ingen hull logget ennå. */
export function Tom() {
  return (
    <Kort eyebrow="Runde">
      <HullStripe hull={[]} />
    </Kort>
  );
}
