import { HvorforDette, Kort, TallHero } from "akgolf-hq-komponenter";

const boks = { maxWidth: 440 };

/** Lukket «Hvorfor dette tallet»-utvidelse: kilde, beregning og forbehold ligger bak summary-raden (details). */
export function Standard() {
  return (
    <div style={boks}>
      <HvorforDette
        kilde="10 siste runder registrert i PlayerHQ, 14.09.2026"
        beregning="Slag tapt eller vunnet per kategori mot ditt eget snitt siste 12 måneder, summert per runde."
        forbehold="Runder uten slag-for-slag-registrering telles ikke. Under 10 runder gir bredt spenn."
      />
    </div>
  );
}

/** Under et regnet tall i et kort — der den hører hjemme. */
export function UnderTall() {
  return (
    <div style={boks}>
      <Kort eyebrow="SG totalt · siste 10 runder">
        <TallHero value="+1,8" delta="+0,4" dir="up" sub="Mot eget snitt siste 12 måneder · kilde: PlayerHQ, 14.09.2026" />
        <HvorforDette
          kilde="10 siste runder registrert i PlayerHQ, 14.09.2026"
          beregning="Slag tapt eller vunnet per kategori mot ditt eget snitt siste 12 måneder, summert per runde."
          forbehold="Runder uten slag-for-slag-registrering telles ikke. Under 10 runder gir bredt spenn."
        />
      </Kort>
    </div>
  );
}
