# REACT-PORT · Open Design → akgolf-hq

**Oppdatert:** 2026-07-26  
**Fasit:** Open Design «Designsystem-plan komplett»  
**Detaljplan rest:** `docs/design-system/plan-resterende-port.md`

## Status

| Bølge | Innhold | Status |
|-------|---------|--------|
| F PR1–3 | Tokens, core, KPI, domain-kjerne | ✅ main |
| 1 Forms | Skjemafelt parity | ✅ #145 |
| 2 Domain top 5 | Spiller/økt/oppgave/anbefaling/live | ✅ #146 |
| 3 Produktflater | Cockpit · plan · workbench | ✅ #147 |
| 4/7 Overlays+nav | Modal/ark/toast/FAB 44px | ✅ #148 |
| 8 Kalender lab | UkeGrid, måned, agenda, dagstripe | ✅ lab |
| 9 Golfdata lab | SgTotal, Diagnose, NesteFokus … | ✅ lab |
| 10 TrackMan lab | Dispersion, trajectory, sammendrag | ✅ lab |
| 11 Feedback/structure | AiTipKort, ListeIkon, Stegviser, Skilje + lab | ✅ lab |
| 12a Admin-kalender | Notion-toolbar, segment ikke lime | ✅ |
| 12b SG / analyse | SgKategorier, Diagnose, NesteFokus, SlagLekkasje | ✅ |
| 12c–d Dype flater | TrackMan-detalj, booking-lister | ⬜ |
| 13 Marketing rest | Priser/kontakt chrome | ⬜ delvis #139 |
| 14 Hardening | Full reg-test | ⬜ |

## Lab

`/design-system` (intern) — `DesignLabV2`.

## Komponentfiler

| Familie | Repo |
|---------|------|
| Core/forms | `core.tsx`, `skjema.tsx` |
| Domain | `domene.tsx`, `domene2.tsx` |
| Kalender | `kalender.tsx` |
| Golfdata/data | `datavis.tsx` |
| TrackMan/spesial | `spesialviz.tsx` |
| Overlays/struktur | `overlays.tsx`, `struktur.tsx` |
| Feedback | `tilbakemelding.tsx` (+ `struktur.tsx`, `domene.tsx`) |

## Merk

Mange komponenter fantes allerede som TSX med `T`-tokens. Rest-porten er **lab + visuell parity + kabling til produkt** — ikke bare å «finne opp» filer på nytt.
