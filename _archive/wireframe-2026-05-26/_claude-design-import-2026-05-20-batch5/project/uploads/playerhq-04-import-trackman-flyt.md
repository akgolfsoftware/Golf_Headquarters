# PlayerHQ — Importer Trackman-flyt

**Trigger:** "Koble Trackman"-knapp i Integrasjoner-siden eller fra Workbench når en økt mangler data.

## Kontekst
Markus har Trackman Player Hub-konto. Vil at alle range-økter og runder synces automatisk inn i PlayerHQ. Trinnvis veiviser, 3 steg.

## Formål
- OAuth-koble Trackman-konto
- Velge hvilke datatyper som skal synces
- Vise bekreftelse + første sync-status

## Layout — Wizard 3 steg

### Steg 1 — Velkommen / forklaring
- Stor lime-runding 96px med Trackman-logo (eller TM-monogram)
- Tittel "Koble Trackman-konto" Inter Tight 700 28px
- Underlinje "Vi henter range-økter, runder og bag-data automatisk"
- 3 punkter med Lucide CheckCircle2 ikoner:
  - Automatisk sync hver natt
  - Range-økter dukker opp i økt-loggen
  - Du eier dataene — koble fra når som helst
- Forest-knapp "Logg inn med Trackman" + outline "Avbryt"

### Steg 2 — Velg datatyper
- Tittel "Hva vil du synce?"
- Checkbox-liste:
  - [x] Range-økter (anbefalt)
  - [x] Runder
  - [x] Klubb-data
  - [ ] Combine-tester
  - [ ] Bay-statistikk
- Info-rad: "Du kan endre dette senere i Innstillinger"
- Forest "Fortsett" + outline "Tilbake"

### Steg 3 — Bekreftelse
- Stor Lucide CircleCheck 64px i lime
- Tittel "Trackman koblet"
- Underlinje "Første sync starter nå (1-2 minutter)"
- Progress-bar med live-tekst "Synker 23 av 142 økter..."
- Når ferdig: "Sync fullført — 142 økter hentet" + "Se mine økter"-knapp som tar Markus til workbench

## Branding
Cream bg, forest header, lime success-runding. Trackman-logo orange = eneste avvik fra paletten (offisielt logo).
