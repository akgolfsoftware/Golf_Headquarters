# Fase D — verifisering på faktisk enhet

Skrevet 28.07.2026, mens sammenhengen var fersk. Samler de påstandene som **ikke kan måles i biblioteket** og derfor ikke skal regnes som oppfylt av en komponentrunde. Hver post har en eier og en grunn til at den ikke kunne gjøres tidligere.

## Hvorfor denne listen finnes

Biblioteket verifiseres i en desktop-preview med musepeker. Flere krav gjelder forhold den konteksten ikke har: berøring, ekte skjermleser, faktisk skjermstørrelse, redusert bevegelse, høykontrastmodus. En sjekk som *ser ut* som den dekker dem — fordi mekanismen bak er bevist — er den farligste varianten, siden den lukker saken uten å ha målt den. Samme klasse som måleriggen som meldte grønt uten å måle, og som «filen inneholder `@layer`» mot «filens regler ligger i `@layer`».

## Poster

### 1. Berøringsgulvet under `pointer: coarse` — WCAG 2.1 AA (2.5.5 / 2.5.8)

**Status i biblioteket:** mekanismen `max(var(--h), var(--floor))` er verifisert ved render begge veier (56 beholdes, 44 løfter over `--sm`), og `@media (pointer: coarse){--floor:44px}` er lest i bundelen og bekreftet i `@layer akhq-container`. **Utløseren er ikke rendret** — verifikatøren kan ikke simulere coarse pointer.

**Å måle på enhet:** at hver interaktiv flate faktisk er ≥ 44 px i ekte berøringskontekst. Ikke bare `Button` i alle størrelser og varianter, men **hvert element som har et `--floor`**: `DropdownMenu`-valg (`--hit: 32px`, `--floor: 44px`), `ListRow` (`--tap`), `TabBar`, `Chip`, `Toggle`, `SegmentControl`, og alle Familie 2-kontroller når de kommer.

**Stand-in-en må ha samme kaskadevekt som det den står for.** Første forsøk matet `--floor` inline. Testen bestod, men av feil grunn: inline styles slår alle `@layer`-regler, så den målte inline-presedens i stedet for at container-laget når gjennom en modifikator i et senere lag. Rettet til `[data-coarse-test]`-kroker deklarert i `@layer akhq-container`, ved siden av `pointer: coarse`-spørringen. **Generelt: en stand-in som bytter kilde må beholde vekten, ellers tester den seg selv.**

**Og en stand-in trenger sin egen selvtest.** Andre forsøk hadde riktig vekt men manglet regelen i den lastede bundelen, og assertionen rapporterte det som *regelbrudd på Chip*. Et element med `--floor: 0` i `[data-coarse-test]` betyr enten at en modifikator nullet gulvet legitimt, eller at container-regelen ikke er lastet i det hele tatt — og de to må skilles, ellers peker et rødt kort på komponenten når feilen ligger i kompileringen. Riggen sjekker nå først at minst ett **interaktivt** element i testkonteksten har `--floor > 0`; er det ikke tilfelle, rapporterer den «riggen virker ikke» og teller ingen brudd.

**Fallgruve å se etter:** en modifikator innført etter migreringen som setter `height` direkte i stedet for `--h`. Den ville vunnet over gulvet og gitt 32 px hitbox — usynlig på desktop, og usynlig for lagsjekken, som måler medlemskap og ikke hvilken egenskap regelen setter.

### 2. Skjermleser — fokuskontraktens ti punkter

`useOverlayLayer` er verifisert som kode og ved tastaturmåling. **Ikke verifisert:** at `inert` + `aria-hidden` faktisk stopper den virtuelle markøren i VoiceOver, NVDA og TalkBack, og at `role="dialog"`/`aria-modal` annonseres som ventet. `modal: true` finnes nettopp for dette, og det er den ene delen av kontrakten en tastaturtest ikke kan nå.

Gjelder: `ConfirmDialog`, `Modal`, `BottomSheet`, og senere `CommandPalette`, `ContextMenu`, `FlyoutPanel`.

### 3. Container queries på ekte skjermstørrelser

Kortene måler containerbredder i en desktop-preview. **Å måle på enhet:** iPad i portrett og landskap, telefon i portrett, PlayerHQs 430 px-kolonne på faktisk mobil. Særlig `4cqi`-skaleringen i `PageHeader` (båndet 650–800 px) og `Panel`s 480 px-terskel, der forfedrenes polstringsbidrag er et intervall og ikke et tall.

### 4. `prefers-reduced-motion` og `prefers-contrast`

Ingen komponent respekterer dem i dag. Å avklare i Fase D, ikke å implementere blindt nå: hvilke overganger som skal stanses (`--dur`/`--ease` er ett sted, så det er en billig endring), og om høykontrastmodus krever egne rammefarger der `color-mix()` i dag gir svake kanter.

### 5. Print

`@media print` finnes ikke i biblioteket. Foreldreportalens betalingsoversikt og økonomirapportene skrives ut i praksis. Egen vurdering, ikke en hale på en komponentrunde.

## Regel

**En post herfra kan ikke lukkes av en komponentverifisering.** Er mekanismen bak bevist i biblioteket, står posten fortsatt åpen — mekanisme og utløser er to påstander. Det er nøyaktig forskjellen mellom «`max()` virker» og «berøringsgulvet er testet».
