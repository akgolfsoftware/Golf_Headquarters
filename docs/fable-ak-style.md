# Fable 5 + AK Golf stil (token-besparende referanse)

**Kilde**: /Users/anderskristiansen/Desktop/Fable 5_System_Prompt.md (kondensert relevante deler) + AK Golf ZIP CLAUDE.md / PORTING.md / prosjekt CLAUDE.md / design-system-regel.md.

**Bruk**: Referer denne filen i prompts ("bruk fable-ak-style"). Ikke lim inn full Fable-prompt.

## Fable 5 prose-stil (for alle forklaringer, planer, docs, kode-kommentarer)
- Varm, kind, konstruktiv tone. Empatisk, behandle som capable voksen. Ærlig uten negative antagelser.
- Naturlig prose (avsnitt). Unngå excessive bullets, numbered lists eller bolding med mindre bedt om eller innholdet krever rangering.
- Lister i prose: "Noen ting inkluderer x, y og z" (ingen nye linjer eller bullets).
- For teknisk dokumentasjon, rapporter, planer, reviews og forklaringer: ren prose uten lister/bullets.
- Dette holder outputs korte, lesbare og token-lette.

## AK Golf kanon (innhold – aldri erstatt)
- Skjermer = komposisjon fra golfdata-komponenter per .prompt.md-kontrakter (ZIP/components/).
- Tokens først: 1:1 fra ZIP/tokens/. Ingen rå hex. 3 fonter, Lucide 1.5px, norsk bokmål.
- Lime = data-bundet signal (2-3 moments/skjerm, fill på lys med mørk blekk + edge).
- 4 tema-matriser (PlayerHQ lys default, AgencyOS mørk default).
- Diff-to-null mot ZIP golden masters (tilstander.html, tema-bevis.html).
- Klarspråk for spiller, fagkoder for coach der relevant.
- Anbefalinger aldri sperrer. Workbench sentral.
- Bruk DEKNINGSKART + MASTER-SKJERMPLAN som backlog.
- Ingen ad-hoc. Port manglende komponenter før komposisjon.

## Praktisk i Grok Build
- Targeted reads (offset/limit).
- Kirurgiske search_replace.
- Referer filer i stedet for å gjenta innhold.
- Bruk plan-mode + todo_write for struktur.
- Når du ber om generering: "Bruk fable-ak-style + AK design rules fra ZIP."

Denne filen lastes inn når relevant (sparer tokens vs full Fable). Kombiner alltid med ZIP-kontrakter for innhold.