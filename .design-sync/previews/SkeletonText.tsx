import { Kort, SkeletonText } from "akgolf-hq-komponenter";

const boks = { maxWidth: 440 };

/** Standard: tre linjer à 12 px, siste linje 4/6 bredde. */
export function Standard() {
  return (
    <div style={boks}>
      <SkeletonText />
    </div>
  );
}

/** lines styrer antallet — én linje for en kort tekst som laster. */
export function EnLinje() {
  return (
    <div style={boks}>
      <SkeletonText lines={1} />
    </div>
  );
}

export function FemLinjer() {
  return (
    <div style={boks}>
      <SkeletonText lines={5} />
    </div>
  );
}

/** Avsnitt som venter inne i et kort — slik Caddie-svaret ser ut før det kommer. */
export function IKort() {
  return (
    <div style={boks}>
      <Kort eyebrow="Caddie">
        <SkeletonText lines={4} />
      </Kort>
    </div>
  );
}
