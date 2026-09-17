import { Kort, ListeIkon, Rad, RadMeta, UlestPrikk } from "akgolf-hq-komponenter";

const boks = { maxWidth: 520 };

/** I listerader: prikken foran telleren i RadMeta på uleste rader, ingenting på leste. */
export function IListe() {
  const aapne = () => {};
  return (
    <div style={boks}>
      <Kort eyebrow="Innboks" pad="15px 17px">
        <Rad leading={<ListeIkon icon="mail" />} title="Foreldre · Rohjan" sub="Spørsmål om samlingen i oktober" meta={<RadMeta><UlestPrikk />2 nye</RadMeta>} onClick={aapne} />
        <Rad leading={<ListeIkon icon="sparkles" tone="forest" />} title="Caddie har et forslag til torsdag" sub="Wedge 60–100 m · 40 min" meta={<RadMeta><UlestPrikk />1 ny</RadMeta>} onClick={aapne} />
        <Rad leading={<ListeIkon icon="calendar" />} title="Samling 3.–5. oktober" sub="Team Norway U18 · påmelding innen fredag" meta={<RadMeta>i går</RadMeta>} onClick={aapne} last />
      </Kort>
    </div>
  );
}

/** Alene: 7 px i fyll-farge — en rolig markør, aldri et rødt varsel. */
export function Alene() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <UlestPrikk />
      <span style={{ fontFamily: "var(--tl-font-sans)", fontSize: 12.5, color: "var(--tl-mute)" }}>Ulest</span>
    </div>
  );
}
