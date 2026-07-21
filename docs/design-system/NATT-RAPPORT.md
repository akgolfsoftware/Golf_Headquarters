# Natt-rapport — Cherny Workbench / design

**Branch:** `overnight/cherny-workbench-design`  
**Commit:** `c8078472`  
**Dato:** 2026-07-21  
**Status:** delvis levert · draft PR klar · ikke merget til main

---

## Hva du skal sjekke (5 min)

1. **Analysere (PlayerHQ)** — har du SG-data: ser du diagnose + knappen **«Planlegg dette i Workbench»**?  
2. **Workbench** — ser du pyramide / læringstrinn / press på valgt økt (allerede der)?  
3. **Docs** — `docs/design-system/FASIT.md` + `NATT-BRIEF.md` lesbart?  
4. **Merge** — bare når du er fornøyd (si «merge» eksplisitt).

---

## Levert

| Område | Innhold |
|---|---|
| **Domene** | NATT-BRIEF med selvtest: AK-formel, SG, TrackMan, broen |
| **Bro i UI** | AnalysereV2: nesteFokus → resept (AkseChip) → CTA Workbench |
| **Designsystem** | FASIT, 8 familier, wireframe gråtoner, komponentstatus 124/124 |
| **Kanon-rydding** | redesign-v2 + design-inventory → arkiv; skills v2; CoachHQ i go-live |
| **Sikkerhet/CSP** | `unsafe-eval` kun i development |
| **Kvalitet** | `tsc --noEmit` grønn på commit |

## Oppdatert 2026-07-21 (fortsettelse)

| Punkt | Status |
|---|---|
| Claude Design hi-fi SG→Workbench | **Lastet opp** `ui_kits/v2/hifi-sg-workbench-bro.html` |
| Hjem tom dag → Workbench | **Kode:** CTA «Åpne Workbench» + lenke til SG |
| Analysere Planlegg-dette | Allerede i PR |
| F1–F7 store funksjoner | Fortsatt parkert |

**Se mockup:** https://claude.ai/design/p/bb9b2b1d-ce2b-4757-be37-ee2096ba9d0d?file=ui_kits%2Fv2%2Fhifi-sg-workbench-bro.html  
**Lokalt:** `docs/design-system/wireframes/hifi-sg-workbench-bro.html`

## Sikkerhet (mini)

- Ingen secrets i commit  
- Analysere-endring er ren UI over eksisterende `nesteFokus` / `handlingHref`  
- Workbench authz/publish ikke endret i denne commit  

## Domene (kort)

- SG-gap → pyramide (OTT/APP/ARG→SLAG, PUTT→TEK default) → Workbench  
- ARG = nærspill · putt fot i UI · bias ≠ spredning · M/PR på TrackMan  

## Anbefalt neste steg (morgen)

1. Forny Claude Design-auth (`claude` + design-login)  
2. Hi-fi Workbench + analyse-bro i Design-prosjektet  
3. Ev. polish PHQ hjem-CTA «Start økt» / fokus fra samme gap  
4. Merge etter review  

**PR:** https://github.com/akgolfsoftware/Golf_Headquarters/pull/new/overnight/cherny-workbench-design  
