import { Diagnose } from "akgolf-hq-komponenter";

/** Analytikerkjeden: symptom → bevis (deg mot referanse) → resept med CTA til planlegging. */
export function Standard() {
  return (
    <Diagnose
      symptom="Mister 0,8 slag på innspill 100–150 m"
      bevis={{ enhet: "%", spiller: { label: "Deg", verdi: 52 }, baseline: { label: "Kat. A-snitt", verdi: 68 } }}
      grunnlag="14 runder · 62 innspill · GIR fra 100–150 m"
      resept={{ akse: "SLAG", kode: "3 økter/uke", tekst: "Kravtrening på innspill 100–150 m — tre økter per uke, mål 65 % green i regulering innen uke 44." }}
      ctaTekst="Planlegg dette"
      ctaHref="/portal/planlegge"
    />
  );
}

/** Uten CTA (galleri/lab): ingen død knapp, resten av kjeden står. */
export function UtenCta() {
  return (
    <Diagnose
      symptom="Mister 0,6 slag på putter 3–6 ft"
      bevis={{ enhet: "%", spiller: { label: "Deg", verdi: 81 }, baseline: { label: "Kat. A-krav", verdi: 88 } }}
      grunnlag="20 runder · 96 putter fra 3–6 ft"
      resept={{ akse: "SLAG", kode: "Putt-gate", tekst: "Gate-drill 3–6 ft med 50 putter per økt, to økter per uke. Mål: 88 % innen 1. november." }}
    />
  );
}

/** Fysisk akse med annen enhet: hopphøyde i cm mot testkravet. */
export function FysiskAkse() {
  return (
    <Diagnose
      symptom="Club Speed har stått stille i seks måneder"
      bevis={{ enhet: "cm", spiller: { label: "Deg", verdi: 38 }, baseline: { label: "Kat. A-krav", verdi: 45 } }}
      grunnlag="CMJ-test 02.09.2026 · TrackMan 26 slag"
      resept={{ akse: "FYS", kode: "Uke 38–45", tekst: "Åtte uker styrke og spenst før hastighetstrening — Club Speed følger hopphøyden." }}
      ctaTekst="Legg inn styrkeøkter"
      ctaHref="/portal/planlegge"
    />
  );
}

/** Uten bevis: grunnlaget mangler og diagnosen merkes usikker. */
export function UtenBevis() {
  return (
    <Diagnose
      symptom="Scoren spriker mer i turnering enn i trening"
      bevis={null}
      grunnlag=""
      resept={{ akse: "TURN", tekst: "Registrer de neste fire turneringsrundene slag for slag, så kan gapet måles." }}
      ctaTekst="Registrer runde"
      ctaHref="/portal/live"
    />
  );
}
