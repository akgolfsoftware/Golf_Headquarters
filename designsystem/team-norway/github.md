repo: akgolfsoftware/talenthq
branch: main

## Last sync
date: 2026-08-30T15:07:20Z
note: lest, ikke portert — brukt til å avstemme Team Norways merkefarger, skjermliste og terminologi mot dette designsystemet

### Updated in this project
- Bekreftet at TN-rødt `#BA0C2F` og `#EF2B2D` i talenthq er flaggpaletter, ikke logoens farge — `#D70232` beholdt
- Hentet den navngitte TN-skjermlisten fra `CoachShell.tsx` (5 egne ruter + 9 delte)
- Rettet pyramiden til de kanoniske kortformene TURN/SPILL/SLAG/TEK/FYS
- Fant 16 TN-testprotokoller i `ProtocolScorecard.prompt.md` — må avstemmes mot «11 tester» i AK Golf HQ

## Screen map
| Skjerm i dette prosjektet | Kilde i talenthq |
|---|---|
| `templates/arsplan/` | — (periodisering fra akgolf-hq `grunnlag-funn.md`) |
| `templates/tester/` | `client/src/ds/components/scorecards/ProtocolScorecard.prompt.md` |
| `components/brand/PyramidDiagram.jsx` | — (kortformer fra akgolf-hq `grunnlag-funn.md`) |
| `docs/team-norway-workdesk-skjermplan.md` | `client/src/ds/CoachShell.tsx`, `DESIGN.md`, `client/public/logos/`, `client/public/ds-logos/` |
