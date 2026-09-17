import { Kort, ListeIkon, Rad, RadMeta } from "akgolf-hq-komponenter";

const boks = { maxWidth: 520 };
const rad = { display: "flex", gap: 8, flexWrap: "wrap" as const, alignItems: "center" };

/** De fire tonene som ledende flis i listerader: nøytral, forest (Caddie), up og down. Meta i mono til høyre. */
export function Toner() {
  return (
    <div style={boks}>
      <Kort eyebrow="Innboks" pad="15px 17px">
        <Rad leading={<ListeIkon icon="calendar" />} title="Samling 3.–5. oktober" sub="Team Norway U18 · påmelding innen fredag" meta={<RadMeta>i går</RadMeta>} trailing={null} />
        <Rad leading={<ListeIkon icon="sparkles" tone="forest" />} title="Caddie har et forslag til torsdag" sub="Wedge 60–100 m · 40 min" meta={<RadMeta>09:12</RadMeta>} trailing={null} />
        <Rad leading={<ListeIkon icon="trending-up" tone="up" />} title="SG totalt opp 0,4 siste 30 dager" sub="Mot eget snitt · 8 runder" meta={<RadMeta>14.09</RadMeta>} trailing={null} />
        <Rad leading={<ListeIkon icon="trending-down" tone="down" />} title="Putt per runde opp til 33,1" sub="Siste 5 runder · snitt før: 31,4" meta={<RadMeta>12.09</RadMeta>} trailing={null} last />
      </Kort>
    </div>
  );
}

/** Flisene alene: 36 px, radius 10, ikon 18 — dock-flate for nøytral, 16 %-tint for tonene. */
export function Fliser() {
  return (
    <div style={rad}>
      <ListeIkon icon="dumbbell" />
      <ListeIkon icon="flag" />
      <ListeIkon icon="radar" />
      <ListeIkon icon="mail" />
      <ListeIkon icon="trophy" />
      <ListeIkon icon="sparkles" tone="forest" />
      <ListeIkon icon="trending-up" tone="up" />
      <ListeIkon icon="alert-triangle" tone="down" />
    </div>
  );
}
