# AK Golf HQ — Utviklingsplan mot lansering

> **SUPERSEDERT 25.08.2026:** `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` er gjeldende
> lanseringsplan. Innholdet under er historikk fra planleggingen 24.08, ikke gjeldende status.

**Status:** Plan låst 24.08.2026  
**Mål:** Lanseringsklar, komplett kjerne — ikke alt, men det som betyr mest.  
**Visuell retning:** Train-lock (mørk, ren, mobil-først) som hovedlook for Player HQ + AgencyOS.

---

## Overordnet prinsipp

Plattformen skal hjelpe treneren og spilleren til å ta **bedre beslutninger med minst mulig støy**.

- Spilleren skal vite **én ting** han skal fokusere på i dag.
- Treneren skal se **hva som faktisk krever handling**.
- Data (TrackMan, runder, tester) skal bli til **tydelig innsikt**, ikke bare tall.

Alt arbeid må tjene dette.

---

## Prioritert rekkefølge

| # | Område | Mål | Status |
|---|--------|-----|--------|
| 1 | Visuell lås | Train-lock som eneste hovedretning | Besluttet |
| 2 | Player HQ «I dag» | Én tydelig handling + stabil opplevelse | Pågår |
| 3 | Analyse + Spredning | Enkel, nyttig TrackMan-innsikt | Modell + komponent klar |
| 4 | Agency Workbench | Planlegging som sparer tid | Domain + kontrakt komplett 24.08 — klar for implementering |
| 5 | TrackMan-integrasjon | Rå data → innsikt på 1 trykk | Neste |
| 6 | Stabilitet & tom-tilstander | Alt som er synlig skal føles ferdig | Løpende |
| 7 | Resten (Foreldre, Club, lys overalt, avansert statistikk) | Etter kjerne er skarp | Senere |

---

## Fase A — Kjerne klar (mål: lanseringsklar Player + basis Agency)

### A1. Player HQ «I dag»
- [ ] Én primær handling tydelig (OneThingNow-prinsippet)
- [ ] Composer + mic fungerer
- [ ] Tom / hvile / feil-tilstander er ferdige
- [ ] Konsistent Train-lock tokens overalt

### A2. Analyse + Spredningsverktøy
- [ ] DispersionMap-komponenten er plassert i TrackMan-økt-detalj
- [ ] Viser 1σ-ellipse + tre-bøtte (68/27/5) + bias
- [ ] Enkel setning under: «Innspill stabilt. Putt er lekkasjen.» (eller tilsvarende)
- [ ] Klikk på prikk åpner enkelt-slag

### A3. TrackMan-flyt
- [ ] Liste over økter
- [ ] Økt-detalj med spredning + nøkkel-KPI
- [ ] Ingen unødvendig støy

### A4. Agency Workbench (minimum)
**Spesifikasjon + domain-tester komplett 24.08.2026** → `docs/natt/workbench/`

- [x] Domain types + pure operations (types.ts, operations.ts)
- [x] Domain unit tests (operations.test.ts) — create/move/publish/budget/overlap
- [x] UI state machine + Norwegian labels
- [x] Store/API-kontrakt + Player HQ-integrasjon
- [x] STEP-1-EXECUTION.md + oppdatert Claude Code-prompt
- [ ] Uke-visning fungerer (implementering i repo)
- [ ] Kan opprette / flytte økt
- [ ] Kilder (maler / øvelsesbank) er tilgjengelig
- [ ] Publiser-flyt er tydelig
- [ ] Player «I dag» viser kun publiserte økter

---

## Fase B — Lanseringsklar polish

- [ ] Alle synlige skjermer har konsistent topbar / dock / tom-tilstand
- [ ] Ingen gamle navn (Konsoll, Maskinrom osv.)
- [ ] Feilhåndtering og laster-states er på plass
- [ ] Grunnleggende autentisering og navigasjon er stabil
- [ ] Performance er akseptabel på mobil

---

## Eksplisitt utsatt (ikke nå)

- Full Foreldre-app
- Club OS / Agenticos
- Lys modus på absolutt alle skjermer
- Avansert 3D / predictive tracer / full ShotLink-kopi
- Nye designsystem-varianter
- Google-synk og ⌘K (kan komme etter lansering)

---

## Suksesskriterier for «lanseringsklar, men komplett»

1. Spilleren kan åpne appen og vite hva han skal gjøre i dag.
2. TrackMan-økt gir umiddelbar, forståelig innsikt (spredning + bias).
3. Treneren kan planlegge en uke uten å forlate Workbench.
4. Alt som er synlig føles bevisst designet (ingen grå «kommer snart»-hull i kjernen).
5. Ingen tvil om visuell retning.

---

## Neste konkrete steg (anbefalt rekkefølge — pågår)

**Steg 1 (FERDIG 25.08):** ~~Kjør `docs/natt/workbench/arkiv/CLAUDE-CODE-PROMPT.md` + følg `STEP-1-EXECUTION.md`~~
→ Levert: domain i repo, server actions, Agency uke, create/move/publish (Loop 1+2).
Gjeldende plan videre: `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md`.

**Steg 2:** Player «I dag» binder mot `loadPlayerDay` (kun PUBLISHED).

**Steg 3:** DispersionMap inn i TrackMan-økt-detalj (A2).

Smoke-test som lukker kjernen: coach oppretter → publiserer → spiller ser i «I dag».

Når disse tre er gjort, er A1–A4 i praksis lukket.

---

**Dokumentet oppdateres når beslutninger tas eller faser fullføres.**
