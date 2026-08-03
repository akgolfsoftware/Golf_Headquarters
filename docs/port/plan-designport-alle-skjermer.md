# Plan — port alle skjermer til Claude Paper

**Skrevet:** 02.08.2026 · **Status:** GODKJENT OG I GANG (Anders 2026-08-03) — se svar nederst
**Gjelder:** hele appen — PlayerHQ, AgencyOS, marketing, booking, foreldreportal, WANG, GFGK

Dette er planen for at appens skjermer faktisk skal se ut som Claude Design-prosjektet
**«AK Golf HQ — Claude Paper»** (`claude.ai/design/p/605a48cc-81e8-44bd-94d2-07d50a97370a`).

Ingen kode er endret. Ingen token-fil er rørt. Planen er ikke godkjent.

---

## 0. To ting som må sies først

### 0.1 Paper-designet finnes ikke på disk

Verifisert i fase 1 §6 og bekreftet i dag: de 78 komponentene og fasitskjermene finnes bare
inne i Claude Design-prosjektet. Ikke i repoet, ikke på noen branch —
`chore/paper-speil-lokal` finnes ikke på origin, og `designsystem/paper/` finnes ikke.

**Uten fasit på disk kan ingen skjerm sammenlignes mot noe.** Det er derfor fase 1 stoppet.

Løsningen er ikke noe Anders må gjøre: Claude har lesetilgang til prosjektet via `DesignSync`
og kan laste det ned selv. Det er steg 1.

### 0.2 Planen bryter en låst regel — Anders må si ja til akkurat det

`CLAUDE.md` invariant 2 (låst 31.07.2026) sier at full Paper-port til `src/` skjer **etter** at
FØR/UNDER/ETTER-piloten er evaluert; fram til da ligger appen på v2-tokens + `--handling`
(`#D97757`). Se `docs/gjenstaaende-plan-2026-07-31.md` §1.1.

Denne planen ER den porten. Den skal ikke startes før Anders eksplisitt overstyrer invariant 2.

### 0.3 /design-sync er feil verktøy for dette

`/design-sync` sender komponenter **fra koden til** Claude Design, så designagenten kan tegne
med ekte deler. Den henter aldri design tilbake til appen. Den kan derfor ikke løse denne
oppgaven, og skal ikke kjøres mot `605a48cc` — prosjektet er håndbygget og ville fått
mesteparten av `components/`, `guidelines/` og `tokens/` slettet av opprydningssteget.

---

## Grunnlag (målt, ikke antatt)

Fra `docs/port/fase0`–`fase4`, alle merget til main 02.08.2026:

| Størrelse | Målt | Kilde |
|---|---:|---|
| Token-deklarasjoner i 6 CSS-filer | 758 | fase 1 §0 |
| Ruter som henger på `golfdata-tokens.css` | 209 | fase 1 §1.1 |
| Mørk-tema-mekanismer i parallell (én død) | 3 | fase 1 §2 |
| Døde `[data-theme]`-deklarasjoner | 94 | fase 1 §2 |
| Hardkodede farger i `style={{}}` | 419 i 132 filer | fase 4 |
| …av disse ekte nye farger uten token | 16 | fase 4 |
| …gjennomsiktighetsvarianter (trenger én alpha-skala) | 102 av 118 umatchede | fase 4 |
| Paper-komponenter som skal portes | 78 | fase 1 §6 |
| Paper-fasitskjermer (HTML) | 19 | fase 1 §6 |

Fase 1 §5 anbefaler **vei (b)**: nytt tokensett ved siden av dagens, gradvis migrering, med
avviklingsbetingelse. Denne planen følger den anbefalingen.

---

## Stegene

### Steg 1 — Hent Paper ned i repoet
Last alle komponenter, tokens, fonter og fasitskjermer fra Claude Design til
`designsystem/paper/`. Egen gren + PR. Etter dette er fasiten versjonskontrollert sammen med
koden som skal matche den, og tilgjengelig fra enhver maskin og enhver økt.
**Endrer ingen skjerm.**

### Steg 2 — Fasit-listen
Én tabell: hver Paper-skjerm ↔ hvilken ekte rute i appen den svarer til, bygget fra
`docs/MASTER-SKJERMPLAN.md`. Viser hvilke skjermer som har fasit, og hvilke som må designes
fra bunnen fordi Paper ikke har tegnet dem. Dette er grunnlaget for å tallfeste steg 7–9.
**Endrer ingen skjerm.**

### Steg 3 — Rydd mørk-tema-mekanismene
Tre parallelle systemer, ett dødt (94 deklarasjoner som aldri aktiveres). Velg én mekanisme
(`data-v2-tema` er kandidaten per fase 1 §5). Må skje før nye farger kobles på, ellers arves
feilen inn i det nye settet.

### Steg 4 — Paper-tokens inn ved siden av dagens
Farger, avstander, radius, skygger og fonter fra Paper som eget sett. Dagens sett røres ikke.
Ingen skjerm endrer utseende ennå. Med eksplisitt avviklingsbetingelse:
`golfdata-tokens.css` slettes når siste av de 209 rutene er migrert (fase 1 §5).
Merk `@layer`-regelen fra fase 1: tokenfiler = rene variabeldeklarasjoner, ingen selektorregler.

### Steg 5 — Bygg om de delte byggeklossene
Knapper, kort, felt, tabeller, overskrifter, lister. Hevstangen i hele porten: én riktig knapp
blir riktig på alle skjermene som bruker den, samtidig.

### Steg 6 — Fjern de 419 hardkodede fargene
419 fargeliteraler i 132 filer. 16 trenger nye tokennavn; 102 løses av én felles alpha-skala;
93 av 419 sitter i `boxShadow` og trenger en skygge-skala `T` ikke har i dag (fase 4 §7).
Uten dette steget overstyrer inline style Paper uansett hva steg 4 gjør.

### Steg 7 — Bølge 1: PlayerHQ
Spillerappen, skjerm for skjerm mot fasiten fra steg 2. Størst volum, og flaten som vises i
piloten. Deles i 4–6 PR-er når skjermantallet er kjent.

### Steg 8 — Bølge 2: AgencyOS
Coach-siden, inkludert de 42 legacy-rutene under `src/app/admin/(legacy)/` som i dag henger på
det gamle tokensettet.

### Steg 9 — Bølge 3: resten
Marketing, booking, foreldreportal, WANG (`team-wang`, 3 ruter), GFGK (`gfgk-junior`).

### Steg 10 — Steng døra
Slett det gamle tokensettet. Legg inn automatisk sjekk i `npm run verify` + CI som stopper nye
hardkodede farger. `scripts/check-token-gap.mjs` bygges fra fase 4 §8 (`tmp-gap-3-match.mjs`).
Uten dette siger designet tilbake i løpet av måneder — den gamle hex-gaten ble fjernet
26.07.2026 nettopp fordi den var ute av synk.

---

## Arbeidsmåte

- **Én PR per steg**, aldri én stor. Anders ser resultatet og kan stoppe når som helst.
- **Skjermbilder i hver PR:** før / etter / Paper-fasit side om side. Vurderes med øynene.
- `docs/MASTER-SKJERMPLAN.md` hakes av i SAMME commit som skjermen endres (prosjektregel).
- `npm run verify && npm test` grønt før hver PR. Aldri merge noe rødt.

## Tidsbilde

Steg 1–4 er raske (opprydding + grunnmur). Steg 5–6 er den tyngste enkeltjobben. Steg 7–9 er
der de fleste øktene går. Flere uker med korte økter — ikke én kveld. Ingen timeanslag oppgis,
fordi skjermantallet ikke er kjent før steg 2.

---

## Svar fra Anders (2026-08-03)

1. **Overstyres invariant 2? Ja.** Bekreftet eksplisitt 2026-08-03 kveld etter at steg 1–6 og
   steg 7 PR1 (PR #275) allerede var merget til main på løpende «ja» per PR — denne bekreftelsen
   formaliserer det som i praksis allerede var i gang. `CLAUDE.md` invariant 2 og
   `.claude/rules/beslutninger.md` er oppdatert til å vise dette.
2. **Kjøres steg 1 og 2?** Ja — begge gjort. Paper ligger i `designsystem/paper/` (25
   fasitfiler i `fase1/`), fasit-listen er `docs/port/fasit-liste-paper.md` (19 av 343 skjermer
   har fasit).

## Status per steg (oppdatert 2026-08-03 kveld)

| Steg | Status |
|---|---|
| 1 — Hent Paper ned | Ferdig |
| 2 — Fasit-listen | Ferdig |
| 3 — Rydd mørk-tema | Ferdig (PR #256) |
| 4 — Paper-tokens ved siden av | Ferdig (PR #260) |
| 5A — Farger inn i `--v2-*` | Ferdig (PR #262) |
| 5B — Form: radius/avstand/typografi | Ferdig (PR #270–273) |
| 6 — Fjern 419 hardkodede farger | Ferdig (PR #274) |
| 7 — Bølge 1: PlayerHQ | I gang — PR1 Hjem (#275), PR2 Planlegge (#276), PR3 Analysere (#277) merget. PR4 Meg klar. 2 PR-er igjen (Booking, Workbench mobil) + de 145 skjermene uten fasit |
| 8 — Bølge 2: AgencyOS | Ikke startet |
| 9 — Bølge 3: resten | Ikke startet |
| 10 — Steng døra (lint-gate) | Ikke startet |

## Fortsett fra en annen maskin

```
cd ~/Developer/akgolf-hq && claude
```
Deretter: «les `docs/port/plan-designport-alle-skjermer.md` og kjør steg 1».
