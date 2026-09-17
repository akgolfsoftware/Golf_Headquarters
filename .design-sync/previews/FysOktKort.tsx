import { Caps, FysOktKort, Kort } from "akgolf-hq-komponenter";

const kolonne = { display: "flex", flexDirection: "column" as const, gap: 8, maxWidth: 480 };

/** De fire økt-typene: ikon i FYS-tone, type + varighet i mono, muskelgrupper til høyre. */
export function Typer() {
  return (
    <div style={kolonne}>
      <FysOktKort tittel="Underkropp maks" type="styrke" varighet="45 min" muskelgrupper={["Sete/hofte", "Lår"]} />
      <FysOktKort tittel="Rotasjon med medisinball" type="rotasjon" varighet="30 min" muskelgrupper={["Kjerne", "Skrå mage"]} />
      <FysOktKort tittel="Hofte og brystrygg" type="mobilitet" varighet="20 min" muskelgrupper={["Hofte", "Brystrygg"]} />
      <FysOktKort tittel="Intervaller 4 × 4" type="kondisjon" varighet="40 min" muskelgrupper={[]} />
    </div>
  );
}

/** loftet: brikken under drag — skalert, rotert og med skygge. */
export function Loftet() {
  return (
    <div style={{ maxWidth: 480, padding: "24px 28px" }}>
      <FysOktKort tittel="Underkropp maks" type="styrke" varighet="45 min" muskelgrupper={["Sete/hofte", "Lår"]} loftet />
    </div>
  );
}

/** Lang tittel klippes med ellipse; chipene bryter i to rader innenfor 150 px. */
export function LangTittel() {
  return (
    <div style={kolonne}>
      <FysOktKort
        tittel="Underkropp — knebøy, markløft og utfall med progresjon"
        type="styrke"
        varighet="60 min"
        muskelgrupper={["Sete/hofte", "Lår", "Bakside lår", "Kjerne"]}
      />
    </div>
  );
}

/** Paletten i Workbench: brikkene ligger i et kort og dras rett inn på dagene i uka. */
export function IPalett() {
  return (
    <div style={{ maxWidth: 480 }}>
      <Kort eyebrow="Økter denne uka" action={<Caps size={9}>3 økter</Caps>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <FysOktKort tittel="Underkropp maks" type="styrke" varighet="45 min" muskelgrupper={["Sete/hofte", "Lår"]} />
          <FysOktKort tittel="Overkropp og kjerne" type="styrke" varighet="40 min" muskelgrupper={["Bryst", "Rygg", "Kjerne"]} />
          <FysOktKort tittel="Rotasjon med medisinball" type="rotasjon" varighet="30 min" muskelgrupper={["Kjerne"]} />
        </div>
      </Kort>
    </div>
  );
}
