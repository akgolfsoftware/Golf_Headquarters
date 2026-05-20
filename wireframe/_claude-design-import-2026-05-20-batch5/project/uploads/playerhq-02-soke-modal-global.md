# PlayerHQ — Global søk-modal (Cmd+K-variant)

**Trigger:** Spilleren trykker Cmd+K eller forstørrelsesglass i header.

## Kontekst
PlayerHQ har 15+ moduler (workbench, runder, statistikk, mål, økter, treninger, meldinger, bookinger, faktura, etc.). Spiller (Markus) trenger ett sted å finne alt raskt.

## Formål
Universal-søk på tvers av:
- Spillerens egne data (runder, økter, mål, meldinger, fakturaer)
- Coach-innhold (anbefalinger, drilrer, videoer)
- Hjelp-artikler
- Banedata, statistikk-detaljer

## Layout
Modal sentrert, 640px bredde, 70% høyde maks, rundede hjørner 16px, hvit panel, shadow `0 24px 64px rgba(0,0,0,0.18)`.

**Topp:**
- Lucide Search-ikon venstre, 20px stroke 1.75
- Inputfelt full bredde, 18px Inter, placeholder "Søk etter runder, mål, økter, samtaler..."
- "ESC" tekst høyre i mono, muted
- Tynn divider under

**Tabs (under input):**
"Alle" | "Runder" | "Økter" | "Mål" | "Samtaler" | "Hjelp" — pillstil, lime ved aktiv

**Resultater:**
Gruppert per kategori med små caps-label "RUNDER · 3 treff":

Hvert resultat:
- Kategori-ikon (Lucide) 20px venstre
- Tittel (Inter 500)
- Underlinje (muted, 13px) med kontekst
- Høyre: tastatur-snarvei i mono pill "↵" når hover

**Bunn:**
- "Tips: Skriv `>` for kommandoer · `?` for hjelp"
- Pile-symbol ↑↓ for navigasjon, ↵ for åpne

## Tomtilstand
"Skriv noe for å begynne. Søket går på tvers av alt du har lagret."
Under: 4 quick-action-kort: "Logg runde", "Be om økt", "Spør coach", "Mitt mål".

## Interaksjon
- Live-søk debounced 120ms
- Piltaster navigerer, Enter åpner
- Klikk utenfor lukker
- Esc lukker

## Branding
Hvit panel, cream backdrop overlay 60% opacity, forest hover-bg på rader, lime accent på aktiv tab.
