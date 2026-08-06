# templates/ er ikke designfasit lenger

**Satt 01.08.2026 · Bølge 1**

De åtte malene i denne mappen er **erstattet av chat-først**, ikke bare av nyere versjoner.
Bruk dem som historikk. Ikke kod etter dem, og ikke bruk dem som referanse for nye skjermer.

## Hvorfor

To grunner, og den andre er den viktigste.

**1. De ble målt og felt.** `kart/designreview-open-design-2026-07-31.md` ga skjermene 4/10:
tre uforenlige railer på tvers av tolv filer, filterchips som alle har `data-filter="alle"`,
`href="#"`-rader, `visKollisjon: () => {}`, aside-paneler som ser radbundet ut men er statiske
plakater, primærhandlinger som `display:none`-es under 1180px.

**2. Flatene skal ikke finnes.** Beslutningen 31.07 låste AgencyOS til fem flater
(Konsoll · Kø · Spillere · Kalender · Maskinrom) og PlayerHQ til fire
(I dag · Plan · Analyse · Meg). Alt annet er **artefakter som åpnes fra tråden**.
Å reparere en mal for en flate som er avviklet, er å polere noe som skal bort.

## Hva erstatter hva

| Utgått mal | Erstattes av |
|---|---|
| `agencyos-hjem` | `fase1/agencyos-konsoll-desktop.html` — tråd, ikke meny |
| `agencyos-dashboard` | samme. Ikke bygg to konkurrerende hjem |
| `agencyos-stall` | flaten **Spillere** (ikke tegnet ennå) + spillerprofil som artefakt |
| `agencyos-ko` | flaten **Kø** (ikke tegnet ennå). Proveniens per rad herfra er verdt å ta med |
| `agencyos-workbench` | artefakt fra tråden, ikke flate |
| `agencyos-kalender` | `fase1/kalender-desktop.html` + `kalender-mobil.html` |
| `agencyos-alt` | kommandopaletten (⌘K, tre nivåer) i konsoll-filene |
| `playerhq-idag` | `fase1/playerhq-chat-desktop.html` + `playerhq-chat-mobil.html` |

## Det samme gjelder `uploads/`

Gamle prototyper, inkludert Presis-varianter (`#005840`, `#D1F843`). Historikk, ikke fasit.

## Hva som er fasit

| Lag | Sted |
|---|---|
| Tokens | `tokens/akhq-tokens.css` — **v3.1, eneste kilde**. Ved konflikt vinner denne |
| Komponenter | `components/` — 106 stk., token-drevne, med tilstander |
| Skjermer | `fase1/` |
| Beslutninger og målinger | `kart/` |

Mappen er beholdt, ikke slettet, fordi `index.html` og flere `kart/`-dokumenter lenker hit.
En død lenke er verre enn en merket mal.
