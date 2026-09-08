---
name: claw-design
description: Claw Design — designsystemet til Team Norway Golf. Bruk denne skillen når du skal tegne grensesnitt, maler eller ressurser i Team Norway-drakt, enten for produksjon eller for prototyper og mockups.
user-invocable: true
---

# Fasit

Denne filen inneholder **ingen** designverdier. Den peker på de tre stedene som er
fasit, i denne rekkefølgen ved uenighet:

1. **`tokens/`** — farger, typografi, rom, effekter. Alle verdier hentes herfra som
   `var(--token)`. Rå hex og rå px er avvik, ikke stil.
2. **`components/`** — komponentkoden med sine `.d.ts`. Hvordan en knapp, et merke
   eller et nøkkeltall faktisk ser ut, er definert der og ikke beskrevet noe annet sted.
3. **`readme.md`** — beslutningene og begrunnelsene: hva som er identitet, hva som er
   status, hva som er rolle.

`guidelines/`-kortene viser praksisen. `templates/` viser den anvendt.

Tidligere utgaver av denne filen oppgav egne fontnavn og egne formregler. Det var en
andre fasit som motsa `tokens/`, og er fjernet. Finner du en designverdi skrevet ut i
prosa noe sted, er den utdatert per definisjon — les tokenet.

# Slik jobber du

Les `readme.md` først, så `tokens/`, så komponenten du trenger. Skal du lage et visuelt
artefakt, kopier ressursene du refererer og skriv statisk HTML. Skal du inn i
produksjonskode, kopier ressursene og les reglene her for å bli ekspert på merkevaren.

Blir skillen kalt uten annen beskjed: spør hva som skal bygges, still oppfølgings-
spørsmål, og opptre som designer som leverer HTML-artefakter eller produksjonskode
avhengig av behovet.

# De fem reglene som ikke står i et token

Alt annet leses fra `tokens/`. Disse fem er beslutninger, ikke verdier:

- **Merkevarerød er identitet, aldri status.** Logo, den vertikale skinnen, og «denne
  utøveren». Status bruker `--status-red`, `--status-green`, `--status-amber`.
- **Den vertikale navy-og-rød-streken er signaturelementet.** Gjenbruk den. Ikke oppfinn
  nye venstrekant-aksenter.
- **Mørk flate er en rolle, ikke et tema.** Hero, seksjonsskille, presentasjon. Det
  finnes ingen mørk modus.
- **`--ink-400` er lyseste gråtone som får bære tekst**, også i etiketter på 9–11 px.
  `--ink-300` og lysere er streker og flater.
- **Hvert tall har en kildelinje.** Format: «Målt dd.mm.åååå · protokoll vN · initialer».
  En rad uten maskinlesbar kilde sier «venter på data» — aldri et tall.

Aldri emoji. Aldri `ease-in` på grensesnitt. Norsk bokmål.
