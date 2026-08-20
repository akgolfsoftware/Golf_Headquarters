# Fundamentavvik — `fase1/_foundation.css` mot skjermfilene

Målt 18.08.2026. **Ingen CSS er rettet.** Rapporten går til eier for beslutning.

## Metode

`_foundation.css` (13 544 tegn) er delt i **45 regler**. For hver av de 35 fase1-filene er hver regel søkt opp i tre tilstander: identisk kropp, samme selektor med annen kropp (**drift**), eller selektor helt fraværende (**utelatt**). Sammenligningen er gjort på normalisert tekst, så ren formatering gir ikke utslag. Merk at motsatt feilmargin finnes: en regel som er skrevet med samme virkning men annen rekkefølge på deklarasjonene teller som drift her.

## Hovedbildet

| Gruppe | Filer | Regler identisk |
|---|---|---|
| Verbatim-bærere | 5 | 44 av 45 |
| Resten | 30 | 12–20 av 45 |

De fem verbatim-bærerne er `agencyos-konsoll-desktop`, `agencyos-konsoll-mobil`, `fangstsheet`, `playerhq-chat-desktop` og `playerhq-chat-mobil`. **Ingen av de 35 filene lenker `_foundation.css`** — alle har limt inn en kopi. Fila er altså ikke en delt kilde i praksis, den er en mal som er kopiert 35 ganger og deretter redigert 30 steder.

## Avvik som er drift — samme selektor, annen kropp

Disse er de samme i alle 30 avvikende filer, altså én systematisk endring hver, ikke 30 individuelle:

| Selektor | Filer | Avvik | Vurdering |
|---|---|---|---|
| `.eyebrow` | 30 | `font-size:10px` → `var(--text-label)` | **Sannsynlig forbedring.** Verdien er identisk (10 px), men tokenisert. Fundamentet er det utdaterte |
| `.num` | 30 | mangler `font-feature-settings:"tnum" 1` | **Drift.** Tabulære sifre står da bare på `font-variant-numeric` — svakere støtte |
| `.btn` | 30 | `min-height` `--tap` → `--tap-lg`, `font-size` 13 → 14 px, mangler `font-family`, `color` og `transition` | **Må avgjøres.** 44 → 48 px og 13 → 14 px er to reelle designforskjeller, ikke opprydding |
| `:root` | 29 | lokal tokenliste avviker fra fundamentets | Forventet — hver fil tar med det den bruker |
| `body` | 30 | ekstra deklarasjoner per skjerm | Forventet |
| `.btn.sm` | 28 · `.tag` 24 · `.btn.now` 18 · `.prose` 17 · `.chip` 15 · `.btn.icon` 12 | | Følger `.btn`-avviket |
| `@media(pointer:coarse)` | 30 (to forekomster hver) | ulikt innhold per fil | **Krever gjennomgang** — dette er berøringsgulvet |

## Avvik som er bevisst utelatelse

Regler som ikke finnes i en fil fordi skjermen ikke bruker mønsteret: `.sheet` og `.sheet-grab` (28 filer uten ark), `.skel` (21), `.empty`/`.emptyh3`/`.emptyp` (25), `.scrim` (15), `.chip[aria-pressed="true"]` (18), `.tag.up`/`.tag.dn`/`.tag.info`. Det er sunt — en skjerm uten tomtilstand trenger ikke tomtilstandsstil.

Fokusregelen ser fraværende ut i selektor-sammenligningen, men **er til stede i alle 35 filene** (tekstsøk på `focus-visible`: 35 av 35). Avviket er i selektorformen, ikke i dekningen.

## Til beslutning

1. **`.btn`: 44 px eller 48 px, 13 px eller 14 px?** Trettifem filer er delt i to leire. Fundamentet sier 44/13, tretti skjermer sier 48/14. Hvilken er fasit?
2. **`.num`: skal `font-feature-settings:"tnum" 1` med?** Fundamentet har det, tretti skjermer ikke.
3. **`.eyebrow`: skal fundamentet oppdateres til `var(--text-label)`?** Skjermene er her nyere enn fundamentet.
4. **Skal `_foundation.css` fortsatt eksistere?** Ingen fil lenker den. Enten blir den en ekte delt kilde som skjermene lenker, eller så er den en historisk mal som bør stemples som sådan — dagens mellomting er det som produserte driften.
5. **`@media(pointer:coarse)`** avviker i alle tretti filene og gjelder berøringsgulvet. Skal jeg lage en egen linje-for-linje-oversikt over den ene regelen?
