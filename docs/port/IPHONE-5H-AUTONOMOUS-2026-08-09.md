# iPhone-dag — 5-timers autonom plan (2026-08-09)

**Kontekst:** Anders jobber remote fra iPhone. Ingen manuelle Mac-steg midt i vinduet.  
**Claude Design zip:** speilet inn i `designsystem/paper/` fra `AK Golf HQ — Claude Paper (1).zip` (702 filer, 2026-08-09).  
**Push til GitHub:** sandbox har ikke write — leveres som handoff-pakke / Mac-script etter vindu.

## Parallelle spor (samtidig)

```text
SPOR A — Backend / booking / data     SPOR B — Frontend Paper fidelity
SPOR C — Masterbrain / putting        SPOR D — Docs + Design-prompt
```

## Tidsboks (ca. 5 t)

| Time | SPOR A (backend) | SPOR B (frontend) | SPOR C/D |
|---:|---|---|---|
| 0–1 | Speil zip · verifiser booking modules · test policy/hold/colors | Audit fase1 ↔ app for Hjem/Plan/Analyse/Kalender | Skriv denne plan + Claude Design-prompt |
| 1–2 | Multi-coach facility API hardening · metrics hooks | AgencyOS kalender coach-striper + legend polish | PuttingSignals types + mapper tests |
| 2–3 | Cancel/reschedule policy edge cases · availability+hold | Booking hub / ny-booking wizard Paper | Empty drill bank honesty audit |
| 3–4 | Admin bookinger/ny multi-coach data load | Live brief/summary Paper light fidelity | TrackMan visual gap notes |
| 4–5 | Unit tests grønn · handoff-bundle | Logo surface pass (ink/paper) | Oppdater COMPLETE-REMAINING + STATUS |

## Må-ikke (uten Anders / Design)

- Ikke tegne/kode ~300 ruter uten fasit som «ferdig Paper»
- Ikke re-seed drill bank
- Ikke endre pricing / BETALING_STARTER
- Ikke kreve Mac terminal midt i løpet

## Leveranse ved time 5

1. Kode-commits lokalt i sandbox  
2. `docs/port/CLAUDE-DESIGN-PROMPT-FULL-PROSJEKT.md` (komplett prompt)  
3. Handoff tarball/script for Mac når Anders er tilbake  
4. Kort STATUS i `docs/STATUS-NÅ.md` eller denne filens sluttseksjon

## Claude Design zip — hva den inneholder (09.08)

| Mappe | Innhold |
|---|---|
| `fase1/` | 33 HTML-fasit (PlayerHQ kjerne, Live, Workbench, AgencyOS kjerne, auth, booking, forelder) |
| `fase2/playerhq/` | 11 W1-skjermer (drills, tester, turnering, okt-detalj, …) |
| `components/` | Full komponentbibliotek (golfdata, trackman, calendar, …) |
| `tokens/`, `guidelines/`, `templates/` | Paper tokens + maler |
| **Mangler** | W2 Analysere-dybde, W3–W6 batcher (skal tegnes i Claude Design) |


---

## Live progress (agent)

| Tid | Done |
|---|---|
| start | Zip speilet (702) · docs plan+prompt skrevet |
| +30m | Booking tests 20/20 (policy, hold, colors, facility-scope) |
| +45m | PolicyBanner · facility-scope · PutteLab mind-token · COMPLETE plan note |

### Pågår resten av vinduet
- Fidelity pass mot fase1 kalender/konsoll (data-od-id / én CTA)
- PuttingSignals mapper harden hvis finnes
- Handoff-bundle for Mac


| +2h | Knapp+CTAPill default → T.handling (Paper monopoly) |
| +2h | Auth/runde/admin solid lime CTA → handling (18 filer) |
| +2h | PuttingFocusBanner på Analysere · putting-signals v1 |
| +2h | book_cancel metric · fasit zip låst 07.08 |


---

## FULLFØRT 2026-08-09 ~17:30 CEST

Se `docs/port/IPHONE-5H-COMPLETE-2026-08-09.md`.

