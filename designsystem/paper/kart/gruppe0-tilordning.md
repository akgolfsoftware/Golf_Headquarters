# Gruppe 0 — tilordning, skrevet før migrering

**Skrevet 28.07.2026, før en linje ble endret.** Kravet i `kart/lagmigrering.md`: tilordningen skrives ned på forhånd, ellers dokumenterer sjekken bare det som skjedde. Alle tall **[målt]** med `guidelines/lagsjekk.mjs`.

Filer: `primitives/Avatar.jsx` (6) · `primitives/StatusBadge.jsx` (8) · `primitives/SectionLabel.jsx` (1) · `actions/Button.jsx` (5) = **20 klasser** [målt].

## Tilordningsprinsipp

- **akhq-base** — grunnstil: strukturen komponenten alltid har, og tilstander av den (`:hover`, `:focus-visible`, `:disabled`) som hører til grunnformen.
- **akhq-container** — tilpasning til omgivelsen: `@container`, og `@media (pointer: coarse)` (samme kategori — komponenten svarer på konteksten, ikke på et forfattervalg).
- **akhq-modifier** — eksplisitte forfattervalg: alt med `--` i navnet.

## Avatar.jsx

| Klasse | Lag | Grunn |
|---|---|---|
| `.akhq-avatar` | base | grunnform |
| `.akhq-avatar img` | base | grunnform, etterkommer |
| `.akhq-avatar--sm` `--md` `--lg` | modifier | størrelse er forfattervalg |
| `.akhq-avatar--ink` `--outline` | modifier | tone er forfattervalg |

## StatusBadge.jsx

| Klasse | Lag | Grunn |
|---|---|---|
| `.akhq-badge` | base | grunnform |
| `.akhq-badge-dot` | base | delelement, ikke variant — bindestrek, ikke dobbel |
| `.akhq-badge--up` `--warn` `--info` `--mut` `--ny` `--tag` | modifier | tone/kind er forfattervalg |

`--tag` er fargeløs permanent (AK-vokabularet skal aldri fargekodes) — det er en bindende regel om *innhold*, ikke om lag.

## SectionLabel.jsx

| Klasse | Lag | Grunn |
|---|---|---|
| `.akhq-slabel` | base | eneste klasse |

## Button.jsx

| Klasse | Lag | Grunn |
|---|---|---|
| `.akhq-btn` + `:focus-visible` + `:disabled` | base | grunnform og dens tilstander |
| `.akhq-btn--ghost` `--primary` `--danger` (+ hover/active) | modifier | variant er forfattervalg |
| `.akhq-btn--sm` | modifier | størrelse er forfattervalg |
| `@media (pointer: coarse)` | container | tilpasning til inndataenhet |

**Høyden får tilgjengelighetsgulv i samme operasjon.** I dag setter `@media (pointer: coarse)` `height: 44px` direkte, og `--sm` er deklarert etter — så i det lagdelte oppsettet ville `akhq-modifier` vunnet og gitt 32 px på berøring. Løses med prinsippets unntak: `height: max(var(--h), var(--floor))`, der `--floor` settes i container-laget. Gulvet holder uansett modifikator, større eksplisitte verdier virker fortsatt.

**`danger` flyttes inn i `akhq-base`-filen som lagret `akhq-modifier`-regel**, og kommentaren om at den måtte ligge ulagret fjernes — årsaken er borte for Buttons del. Konsumenter kan fortsatt ikke style Button fra egne lag før hele biblioteket er migrert, så kryssfil-regelen står.

## Verifisering

1. `node guidelines/lagsjekk.mjs` — 0 klasser utenfor lag i disse fire filene.
2. Lagmedlemskap per klasse mot tabellene over.
3. Null visuell endring på **tilstander**: Button i hover / focus-visible / active / disabled × ghost, primary, danger, sm × begge moduser. Badge i alle seks toner. Avatar i tre størrelser × tre toner.
4. **Berøringsgulvet testes i BEGGE ender**, ellers kan det bestå av feil grunn — en hardkodet 44, eller en `--h` som ikke mates gjennom, gir samme utfall som en fungerende `max()`:
   - `.akhq-btn--sm` under `pointer: coarse` → **44 px** (gulvet løfter over modifikatoren).
   - En variant med `--h` **større** enn gulvet → **beholder sin egen høyde**, ikke 44. Da er mekanismen bevist, ikke bare utfallet.
   `.akhq-btn--lg` finnes ikke i dag, så testen settes opp i kortet med `style={{"--h":"56px"}}` på en instans — den måler `max()` uten å innføre en variant biblioteket ikke har behov for.

   **Gulvsiden måles med `--floor` inline, ikke via `pointer: coarse`.** Verifikatøren kan ikke emulere coarse pointer, så kravet «`sm` gir 44 px under coarse» var en regel tildelt en aktør som ikke kan utføre den — samme rollefeil som reload-kravet, og den ser ut som slurv hver gang. Stand-in: en instans med `size="sm" style={{"--floor":"44px"}}` skal gi **44 px** selv om `--sm` setter `--h: 32px` i et senere lag. Det er samme `max()` med samme lagforhold; bare kilden til gulvet er byttet til en verifikatøren kan styre. Det `pointer: coarse`-spørringen selv gjør — sette `--floor: 44px` — er én deklarasjon som er lesbar i bundelen, og den er bekreftet å ligge i `akhq-container`.

## Avgrensning: mekanismen er verifisert, utløseren er kildelest

Dette står som **avgrensning, ikke mangel** — løsningen er riktig gitt verktøybegrensningen, men rekkevidden må være eksplisitt, ellers får «touch-gulvet er testet» mer vekt enn det har. Touch-mål er et WCAG 2.1 AA-krav (2.5.5 / 2.5.8) og siteres i audit.

**Verifisert ved render (28.07.2026):** `max(var(--h), var(--floor))` virker begge veier. `--h: 56px` → 56,0 px (eksplisitt verdi over gulvet beholdes), `--sm` + `--floor: 44px` → 44 px (gulvet løfter over en modifikator i et senere lag). Mekanismen er bevist, ikke bare utfallet.

**Kildelest, ikke rendret:** at `@media (pointer: coarse)` faktisk setter `--floor: 44px` i en ekte berøringskontekst. Verifikatøren kan ikke simulere coarse pointer, så denne delen hviler på at deklarasjonen er lest i den kompilerte bundelen og bekreftet å ligge i `@layer akhq-container`. Det er sterkt belegg for at regelen finnes og har riktig kaskadeposisjon — og ingen måling av at nettleseren anvender den på en berøringsenhet.

**Konsekvens:** gruppe 0 kan meldes ferdig, men **touch-gulvet er ikke audit-belegg**. Den ekte verifiseringen ligger i Fase D, på faktisk enhet, sammen med WCAG 2.1 AA-auditen — se `kart/fase-d-enhetsverifisering.md`. Regn den ikke som gjort fordi mekanismen er bevist i biblioteket: mekanisme og utløser er to påstander, og bare den første er målt her.
