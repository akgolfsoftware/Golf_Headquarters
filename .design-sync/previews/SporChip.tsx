import { Kort, Rad, SporChip } from "akgolf-hq-komponenter";

const rad = { display: "flex", gap: 8, flexWrap: "wrap" as const, alignItems: "center" };
const boks = { maxWidth: 520 };

/** De fire sporene i klarspråk: grønt for på vei og ferdig, gult for står stille, mute for inaktiv. Informasjon, aldri sperre. */
export function Alle() {
  return (
    <div style={rad}>
      <SporChip s="PAA_VEI" />
      <SporChip s="STAGNERER" />
      <SporChip s="FERDIG" />
      <SporChip s="INAKTIV" />
    </div>
  );
}

/** Som meta i en kravliste: hvert krav får sitt spor til høyre for tittelen. */
export function IListe() {
  return (
    <div style={boks}>
      <Kort eyebrow="Krav i P4 · Topp-posisjon" pad="15px 17px">
        <Rad title="Hoftedreining 45° før armene starter ned" sub="300/300 reps · Uten ball" meta={<SporChip s="FERDIG" />} trailing={null} />
        <Rad title="Venstre arm parallell med skulderlinjen i P4" sub="240/300 reps · Lav hastighet" meta={<SporChip s="PAA_VEI" />} trailing={null} />
        <Rad title="Club Path mellom 0 og +3° med driver" sub="120/300 reps · Lav hastighet" meta={<SporChip s="STAGNERER" />} trailing={null} />
        <Rad title="Kølleblad square mot svingplan i P4" sub="0/200 reps" meta={<SporChip s="INAKTIV" />} trailing={null} last />
      </Kort>
    </div>
  );
}
