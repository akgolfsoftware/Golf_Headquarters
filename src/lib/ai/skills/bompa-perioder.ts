// Skill: Bompa-periodisering tilpasset golf.
//
// Brukes av agenter som diskuterer treningsplan-design og periodisering.
// Verdiene under er AK Golf sin tolkning av Tudor Bompa sin modell —
// se Notion (Mac O'Grady Knowledge Base) for fullstendig referanse.

export const bompaSkill = {
  name: "bompa-perioder",
  description: "Bompa-periodisering-modellen tilpasset golf",
  knowledge: `
Bompa-modellen har 6 periode-typer i en sesong:

1. GRUNNTRENING (4-12 uker)
   - Høyt volum, lav intensitet
   - Fokus FYS (50%) + TEK (30%) + SLAG (20%)
   - Mål: bygge fundament

2. OPPBYGGING (4-6 uker)
   - Volum stabilt, intensitet øker
   - FYS (30%) + TEK (40%) + SLAG (20%) + SPILL (10%)
   - Mål: progresjon

3. SPESIALISERING (4-8 uker)
   - Volum reduserer, intensitet høy
   - TEK (30%) + SLAG (40%) + SPILL (30%)
   - Mål: peak-forberedelse

4. KONKURRANSE (variabel)
   - Vedlikehold + tournament-prep
   - SPILL (40%) + SLAG (30%) + TURN (20%) + TEK (10%)
   - Mål: peak prestasjon

5. OVERGANG (2-4 uker, etter sesong)
   - Lav intensitet, mental restitusjon
   - FYS lett (50%) + mental (50%)
   - Mål: gjenoppbygge

6. HVILE (1-3 uker)
   - Aktiv hvile, ikke trening
   - Mobilitet, gå, svømme
   - Mål: full restitusjon

Periodisering for én turnering:
- Uke -8 til -4: Spesialisering
- Uke -3 til -1: Konkurransetaper
- Konkurranseuken: kun touch + mental
- Uken etter: Overgang
  `.trim(),
} as const;
