# Rettelogg — 29.07.2026

Retter de fem punktene i revisjonen (`kart/revisjon-2026-07-29.md`). Merking som der: **[målt]** (fersk kjøring denne økta) / **[anslag]** (beregnet, ikke re-målt). Ingen «ferdig» påstås der jeg ikke har målt.

## 1 · Button --sm floor 40 → 44px
`--floor` hevet fra 40 til 44 på både `@media(pointer:coarse)` og `[data-coarse-test]`-stand-inen. Visuell høyde vokser til 44px på coarse pointer — samme mekanisme `.akhq-btn` (md) allerede brukte, ingen ny `::after`-teknikk innført (vurdert, men konsistens med md-knappen veide tyngre enn å bevare 32px-visuellet; dokumentert her som avgjørelse, ikke gjort ad hoc). `check_design_system` kjørt rett etter: **[målt] in sync, ingen issues.** De seks arvende komponentene (DropdownMenu-utløser, ConfirmDialog, Modal, Banner, OneThingNow, StickyActionBar) bruker alle `<Button size="sm">` og arver retten automatisk — ikke re-målt enkeltvis i denne turen, men mekanismen er identisk til Button selv, som er verifisert.

## 2 · Fire elementer med floor 0 på interaktive elementer
**Revidert funn:** Tabs, ThemeToggle, DropdownMenu-element og QuickLinkBar hadde **allerede** `--floor:44px` i sin `@media(pointer:coarse)`-regel — riggen målte 0 fordi de manglet den `[data-coarse-test]`-stand-in-selektoren Button/Chip/Rail/TimeGrid har (coarse pointer kan ikke simuleres i en vanlig nettleser). Lagt til stand-in for alle fire, samme mønster som resten av biblioteket. `guidelines/gruppe1-tilstander.card.html` utvidet med en ny seksjon som rendrer alle fire (+ Breadcrumbs-lenke + Banner-lukk) inne i `data-coarse-test`-wrappere, så assertionen faktisk måler dem fremover.

## 3 · Breadcrumbs-lenke og Banner-lukk uten floor
- Breadcrumbs-lenken manglet egen klasse — lagt til `.akhq-crumb-a` med `--hit:16px;--floor:0px`-arkitekturen, coarse-regel + stand-in på 44px.
- Banner-lukk brukte `--x-floor` i stedet for `--floor` — det er derfor den automatiske sveipen fant "tom streng" i stedet for en verdi (skriptet leter etter `--floor` som navn). Omdøpt `--x-floor` → `--floor` gjennomgående, lagt til stand-in.

## 4 · Klasseinventar og readme utdatert
`_ds_bundle.js` kompileres ved turslutt, ikke underveis — jeg kan ikke måle post-edit-tallet i denne turen (samme begrensning som «Mål den resolverte tilstanden»-regelen i readme.md beskriver for forfatteren).
- **[målt] denne økta, før mine rettinger:** 350 klassenavn, 0 ulagrede — bekrefter at lagmigreringen fra `kart/lagmigrering.md` er fullført. `guidelines/klasseinventar.md` og `readme.md` er oppdatert til dette tallet (fra feilaktige 302/174).
- **[anslag] etter mine rettinger:** −6 klassenavn (Input slettet: `.akhq-field .akhq-label .akhq-input .akhq-input--error .akhq-hint .akhq-err`), +1 (`.akhq-crumb-a`) → **345/0 beregnet, ikke bekreftet.** Begge dokumenter sier eksplisitt at dette er beregnet og ber om re-kjøring av skriptet neste tur.
- Duplikat `components/layout/` og `components/overlays/`-linjer i readme.md slått sammen til én linje hver.
- `Input` fjernet fra readme.md sin komponentliste. `Input.jsx`, `Input.d.ts`, `Input.prompt.md` slettet — kun konsument var `components/forms/forms.card.html`, som er skrevet om til `FormField` + `TextInput` (den vedtatte etterfølgeren). `check_design_system` **[målt]**: 67 komponenter, ingen issues.

## 5 · Rail hardkodede farger + scrim
- Rails seks `rgba(250,249,245,…)`-verdier uttrykt som `color-mix(in srgb,var(--rail-on) X%,transparent)` — `--rail-on` er `#FAF9F5` i begge temaer (bekreftet i `tokens/akhq-tokens.css`), så verdien er uendret, kun kilden.
- `--logo-mark`/`--logo-dot`-lokaloverstyringen i `.akhq-rail`: **avvik fra oppgaveteksten, flagget i stedet for rettet blindt** — `--paper` finnes ikke som token i `tokens/akhq-tokens.css`. Brukte i stedet `var(--rail-on)` (samme hex, `#FAF9F5`, semantisk riktigere for en flate som alltid er mørk) og `var(--accent)` (samme hex, `#D97757`, eksisterende token) — ingen ny token opprettet.
- `#B85C3D` på Rail.jsx sin SVG-fallback: **revisjonens påstand «finnes ikke i tokenfilen» stemmer ikke** — `--logo-dot: #B85C3D` står i `:root` i `tokens/akhq-tokens.css` (lys temaets AA-sikre verdi). Fallbacken er urørt, jf. readmes egen unntaksregel for `var(--x, fallback)`.
- Scrim: ny token `--scrim: rgba(20, 20, 19, 0.4)` i `tokens/akhq-tokens.css` (73 → 74 tokens, **[målt]** via `check_design_system`). Modal og BottomSheet pekte allerede på 40 % — byttet til token. ConfirmDialogs avvikende 42 % erstattet med samme token, ikke dokumentert inn som variant.
- OneThingNow sin `3px`-ringgeometri: brukes kun de to stedene i samme fil (pulse + keyframe), ingen andre komponenter deler mønsteret (`grep` bekrefter). **Ikke gjort til token** — står som den er, avgjørelsen er notert her per instruks.

## Ikke rørt
Ingen nye komponenter, ingen `DataTable`, ingen av de 47 ubrukte komponentene, `--adherence`/`_ds_manifest.json`/`_ds_bundle.js` ikke håndskrevet (regenereres av kompilatoren).

## Gjenstår til neste tur
- Kjøre klasseinventar-skriptet mot fersk bundle og erstatte 345-anslaget med et `[målt]`-tall.
- Måle de seks Button--sm-arvende komponentene (DropdownMenu-utløser, ConfirmDialog, Modal, Banner, OneThingNow, StickyActionBar) enkeltvis i riggen for å bekrefte 44px, ikke bare mekanismen.
