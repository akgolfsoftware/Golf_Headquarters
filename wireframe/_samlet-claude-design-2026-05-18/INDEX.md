# Claude Design Eksporter — Samlet 2026-05-18

Alle Claude Design-eksporter konsolidert fra hele prosjektet. Totalt **478 filer** (~23 MB).

## Struktur

| Mappe | Innhold | Antall | Hva er det? |
|---|---|---|---|
| `00-final-valg/` | Beslutninger | 4 HTML | `beslutning-design-retning.html` (4 alternativer), 3 final-skjermer (hub, kalender, athletic) |
| `01-pilot/` | 5 pilot-konsepter | 5 HTML | Hub, Hjem, Mål, Analytics, Finance — alternative redesigns |
| `02-coachhq/` | CoachHQ-skjermer | 42 HTML | Alle coach-vendte skjermer (hub, kalender, plan-builder, analytics, finance, settings...) |
| `03-playerhq/` | PlayerHQ-skjermer | 30 HTML | Alle spiller-vendte skjermer (hjem, mål, trening, live-session, profil...) |
| `04-modaler/` | Modaler + spesialvisninger | 30 HTML | Dialog, drawer, periode-modal, økt-plan-modal, fasilitetsdetalj... |
| `05-system/` | System-states | 12 HTML | Empty, loading, error, dialogs (confirm, toast), tier-locked, disabled |
| `06-booking/` | Booking-pakke (egen repo) | 29 HTML | Hele booking-flyten — eksporteres til `akgolf-booking` |
| `07-design-systemer/` | Design-system-dok | 148 MD | DNA, design-system-guide, brand-references, audit-rapporter |
| `08-design2.0/` | 14 mini-batch-mapper | 81 HTML + 67 MD | Strukturert design-pakke organisert i 14 batches (CoachHQ A-D, PlayerHQ A-C, Modal A-E, Redesign A-B) |
| `09-public-deploy/` | Publisert på `/design` | 12 HTML | Tilgjengelig fra `akgolf-hq.vercel.app/design` (mobil-galleri) |
| `10-prompt-outputs/` | Claude Design-prompts → output | 5 HTML | Direkte output fra design-prompts (agencyos-hub, gantt, krysstabell, live-session, spiller-360) |
| `99-iterasjoner-eldre/` | Historisk (v3 + 1005 + 1705) | 10 HTML | Tidligere iterasjoner — beholdt for historikk |

## Gjennomgangsrekkefølge

For å gå gjennom alt systematisk, anbefalt rekkefølge:

1. **`00-final-valg/`** — start her, se hvilken designretning som er valgt
2. **`01-pilot/`** — de 5 piloter som potensielt erstatter hovedrutene
3. **`02-coachhq/` + `03-playerhq/`** — full skjerm-katalog per produkt
4. **`04-modaler/` + `05-system/`** — interaksjonsdetaljer
5. **`08-design2.0/`** — hvis du vil se 14-batch-organiseringen
6. **`07-design-systemer/`** — design-system-dokumentasjon og DNA

## Ikke inkludert (duplikater og historikk)

Følgende mapper utelatt — innholdet finnes allerede her:

- `wireframe/design-package/` — byte-for-byte-kopi av `design-files-v2/`
- `wireframe/design-files/` — eldre versjon (~121 HTML) av samme innhold
- `wireframe/design-files-v2/` — 247 HTML overlapping med `screen-deck/` (kanonisk versjon brukt her)
- `wireframe/design-batches/` — har 0 HTML (kun batch-mapper med markdown)

## Neste steg

Gå gjennom mappene én etter én. For hver skjerm: bestem om den skal **implementeres**, **forkastes**, eller **arkiveres**.

Generert av Claude Code, AK Golf HQ, 2026-05-18.
