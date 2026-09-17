import { SGSplittKort } from "akgolf-hq-komponenter";

const boks = { maxWidth: 420 };

/** SG per kategori mot spillerens eget snitt: grønn over null, rød under. Kategoriene i klarspråk. */
export function Standard() {
  return (
    <div style={boks}>
      <SGSplittKort
        kategorier={[
          { k: "OTT", sg: 0.3 },
          { k: "APP", sg: 0.6 },
          { k: "ARG", sg: -0.4 },
          { k: "PUTT", sg: -1.2 },
        ]}
        baseline="eget snitt, 30 dager"
      />
    </div>
  );
}

/** Manglende kategori (ingen runder med nærspill registrert): tankestrek i grått. */
export function MedManglende() {
  return (
    <div style={boks}>
      <SGSplittKort
        kategorier={[
          { k: "OTT", sg: 0.8 },
          { k: "APP", sg: -0.2 },
          { k: "ARG", sg: null },
          { k: "PUTT", sg: 0.4 },
        ]}
        baseline="eget snitt, 90 dager"
      />
    </div>
  );
}
