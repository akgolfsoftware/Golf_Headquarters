// Skill: AK Golf 5-akse pyramide-taksonomi.
//
// Injiseres i system-prompt for agenter som skal forstå hvordan AK Golf
// klassifiserer trening og prestasjon. Holdes konsist — full taksonomi
// finnes i Notion / sportsplan.

export const pyramideSkill = {
  name: "pyramide-taksonomi",
  description:
    "Kunnskap om AK Golf sin 5-akse pyramide (FYS/TEK/SLAG/SPILL/TURN)",
  knowledge: `
AK Golf's pyramide-modell består av 5 akser, alltid i denne rekkefølgen og uppercase:

FYS (fysisk fundament):
- Styrke, kondisjon, mobilitet, power, speed
- Forebyggende og prestasjons-fremmende
- Standard 2-4 økter per uke

TEK (teknikk · golfsving):
- Sving, kontakt, plane, sekvens, tempo
- Krever video-feedback og dedikert tid

SLAG (slagprogresjon):
- Drive, jern, wedges, putting
- Spesifikt på hver slag-kategori

SPILL (banespill · scoring):
- Spill-simulering, scoring, situasjoner
- 9-/18-hulls runder med fokus

TURN (turnering · konkurranse):
- Turneringsspesifikk forberedelse
- Mental, taktikk, pacing

Brukes alltid i UI som "FYS · TEK · SLAG · SPILL · TURN" med punkt-separator.
  `.trim(),
  examples: [
    {
      input: "Hva er forskjell på SLAG og SPILL?",
      output:
        "SLAG er trening på spesifikke slag-typer (eks. drive 200m). SPILL er banespill med scoring der vi sammenligner med par.",
    },
    {
      input: "Hvilke akser bruker dere?",
      output: "FYS · TEK · SLAG · SPILL · TURN — i den rekkefølgen.",
    },
  ],
} as const;
