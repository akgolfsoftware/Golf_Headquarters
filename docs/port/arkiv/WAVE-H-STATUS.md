> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

# Wave H status — Pattern AgencyOS rest (2026-08-09)

> **Master:** [`WAVE-STATUS-MASTER.md`](./WAVE-STATUS-MASTER.md)

## Scope
AgencyOS-skjermer **uten** Paper HTML-fasit — designet mot designsystemet (plan §6.3 Wave H).

## Levert
- **~80** admin V2-filer med `data-paper-wave-h`
- **~50** med Paper **17px** pattern-topp
- CTA 56px clay der solid handling fantes

### Domener
| Domene | Eksempler |
|---|---|
| **Kø / godkjenning** | Godkjenninger, detalj |
| **Booking** | Bookinger, tilgjengelighet, tjenester, anlegg, slots |
| **Innhold** | Drills, planmaler, planer, planlegge, økter, videoer |
| **Sikkerhet / drift** | Compliance, audit, API-keys, feillogg, tilgang, security |
| **Team** | Team, inviter coach, profiler, grupper |
| **Analyse** | Analyse, runder, reports, benchmarks, lag-snitt, TrackMan |
| **Talent / stats** | Talent discovery/radar, stats overview/moderering |
| **Caddie / live** | Caddie dash/aktivitet/proaktiv, Agency live, live brief/active/summary |
| **Øvrig** | Marketing, reach, recording, workspace, WAGR, uka, wizard |

## DONE-def (uten fasit)
Tokens + shell + 17px topp + clay enTing der primær — **ikke** pixel-diff.

## Gjenstår i H (lave)
Små widgets / wrappers uten egen page-chrome (InviteParent-knapp, SlettSpiller, FokusSpillere, CoachWorkbenchMount, subnav).

## Neste
**Wave I** — marketing/public/stats pattern **eller** Mac push A–H.
