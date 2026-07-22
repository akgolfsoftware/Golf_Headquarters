# Punktkatalog — ALLE punkter (ferdig + gjenstår + synlighet)

**Dato:** 2026-07-22  
**Formål:** Én liste over *alt*. Først se alle punkter. **Deretter** setter du hva som er **synlig** i produktet.  
**Synlighet (kolonne S):**  
- `JA` = synlig for bruker nå  
- `NEI` = skjult / ikke i meny (kode kan finnes)  
- `?` = **ikke bestemt ennå** — fylles i runde 2  
- `ANDERS` = krever deg (panel/DNS), ikke app-toggle  

**Status (kolonne St):**  
- `FERDIG` · `DELVIS` · `TODO` · `ANDERS` · `SENERE`

---

## A — Ferdig (kjerne) — synlighet foreslått JA

| ID | Punkt | St | S (forslag) | Merknad |
|---|---|---|---|---|
| A.01 | PlayerHQ 5-hub (Hjem/Plan/Gjør/Analyse/Meg) | FERDIG | JA | Hovedapp |
| A.02 | AgencyOS cockpit + stall + planlegge | FERDIG | JA | Coach |
| A.03 | Forelder-portal | FERDIG | JA | |
| A.04 | Auth (login/signup/reset/samtykke) | FERDIG | JA | |
| A.05 | Workbench (finnes i app) | FERDIG | JA | Flagship |
| A.06 | Live treningsøkt | FERDIG | JA | |
| A.07 | Teknisk plan (P1–P10) | FERDIG | JA | |
| A.08 | TrackMan-hub + **én** import (CSV/HTML) | FERDIG | JA | MVP 2026-07-22 |
| A.09 | Full sving-flate i teknisk plan | FERDIG | JA | |
| A.10 | Test → TM-baseline *forslag* (PlanAction) | FERDIG | ? | UI-godkjenning kan være skjult til L1 |
| A.11 | Runde live + etterpå + kladd | FERDIG | JA | |
| A.12 | Fortsett-runde CTA (Hjem/Gjør/Runder) | FERDIG | JA | |
| A.13 | UpGame-import på runde | FERDIG | JA | |
| A.14 | Stats B-pass (offentlig) | FERDIG | JA | PR #118 |
| A.15 | Designsystem V2 / tokens | FERDIG | — | Ikke meny |
| A.16 | Skills AgencyOS / AgenticOS / workbench … | FERDIG | — | For AI, ikke UI |
| A.17 | Booking (delvis / Acuity hybrid) | DELVIS | JA | |
| A.18 | SG-motor + runde-SG | FERDIG | JA | |

---

## B — P0 Lansering (ikke app-toggle)

| ID | Punkt | St | S | Eier |
|---|---|---|---|---|
| B.01 | DKIM Resend `send.akgolf.no` | TODO | ANDERS | DNS/Resend |
| B.02 | Velkomst/aktivering ~31 spillere | TODO | ANDERS | E-post + evt. kode |
| B.03 | Stripe live vs test nøkler | TODO | ANDERS | Vercel/Stripe |
| B.04 | `akgolf.no` → Vercel (nå Acuity) | TODO | ANDERS | DNS når klar |
| B.05 | Merge PR #118 | TODO | ANDERS | Kun på din «merge» |
| B.06 | Betaling starter 1. aug (flagg i kode) | FERDIG | JA | `feature-flags` |

---

## C — P1 Flagship Workbench

| ID | Punkt | St | S (forslag) |
|---|---|---|---|
| C.01 | Coach: publiser uke → spiller ser | DELVIS | JA |
| C.02 | Spiller: kun publisert plan (ikke utkast-forvirring) | DELVIS | JA |
| C.03 | Notion Calendar → HQ-økt | DELVIS | ? |
| C.04 | iPad/touch DnD verifisert av deg | TODO | — |

---

## D — P1 AgenticOS / AI

| ID | Punkt | St | S (forslag) |
|---|---|---|---|
| D.01 | Godkjenningskø: TM + test-forslag lesbart | DELVIS | ? |
| D.02 | Godkjenn TM-baseline i UI (én knapp) | TODO | ? |
| D.03 | 0 «CoachHQ» i synlig UI-tekst | DELVIS | JA |
| D.04 | Daily brief: runde + TM + test-signaler | DELVIS | ? |
| D.05 | Caddie / AI-hub AgencyOS | FERDIG | ? |
| D.06 | AI-agenter admin-side | FERDIG | ? |

---

## E — P2 TrackMan / teknisk plan polish

| ID | Punkt | St | S (forslag) |
|---|---|---|---|
| E.01 | Duplikat-advarsel ved lik session | TODO | JA (når ferdig) |
| E.02 | Manuell match-override i import | TODO | JA (når ferdig) |
| E.03 | Dispersjon/stabilitet (eksisterende session-UI) | DELVIS | ? |
| E.04 | Legacy TrackMan-ruter → redirect | TODO | — |
| E.05 | Test-resultat: hint om baseline/full sving | TODO | ? |
| E.06 | Smoke/E2E CSV → TmGoal | TODO | — |
| E.07 | Admin TrackMan (samme motor) | FERDIG | JA |

---

## F — P3 Runde / SG

| ID | Punkt | St | S (forslag) |
|---|---|---|---|
| F.01 | Live runde færre trykk (polish) | DELVIS | JA |
| F.02 | Hurtigmodus score (samme motor) | TODO | ? |
| F.03 | UpGame: «SG full/delvis/mangler»-tekst | TODO | JA |
| F.04 | Round-agent synlig i godkjenninger | DELVIS | ? |
| F.05 | GolfBox personlig runde-import | SENERE | NEI til GO |
| F.06 | Arccos / Shot Scope | SENERE | NEI til GO |

---

## G — P4 Marketing + offentlig stats

| ID | Punkt | St | S (forslag) |
|---|---|---|---|
| G.01 | Marketing forside/priser/coaching/blogg V2 | DELVIS | JA (offentlig) |
| G.02 | Stats-hub polish | DELVIS | JA |
| G.03 | SEO nøkkel-landinger | TODO | JA når klart |
| G.04 | PGA / baner / spillere / verktøy | DELVIS | ? |

---

## H — P5 Intern / infrastruktur

| ID | Punkt | St | S (forslag) |
|---|---|---|---|
| H.01 | Open Design daemon (Node) | TODO | — |
| H.02 | Team WANG merkevareside | DELVIS | JA (egen site) |
| H.03 | GFGK junior merkevareside | DELVIS | JA (egen site) |
| H.04 | Intern komponent-lab | DELVIS | NEI (kun intern) |
| H.05 | Meg-assistent (admin) | DELVIS | NEI / admin |
| H.06 | claude-config git-sync | TODO | — |
| H.07 | `/portal/ny-okt` ekte DB-lagring | TODO | ? |
| H.08 | Talent-radar / talent-sider | DELVIS | ? (feature flag finnes) |

---

## I — AgencyOS «Mer»-flater (kan toggles)

Disse finnes i menyen i dag. Sett S i runde 2.

| ID | Punkt (nav) | St | S |
|---|---|---|---|
| I.01 | Godkjenninger | FERDIG | ? |
| I.02 | Handlingssenter | FERDIG | ? |
| I.03 | Daglig brief | FERDIG | ? |
| I.04 | Oppfølgingskø | FERDIG | ? |
| I.05 | Grupper | FERDIG | ? |
| I.06 | Talent-radar | FERDIG | ? |
| I.07 | Talent-sammenligning | FERDIG | ? |
| I.08 | Planer / maler / teknisk plan admin | FERDIG | ? |
| I.09 | Turneringer | FERDIG | ? |
| I.10 | Drills-bibliotek | FERDIG | ? |
| I.11 | Tester | FERDIG | ? |
| I.12 | Rapporter | FERDIG | ? |
| I.13 | Runder (admin) | FERDIG | ? |
| I.14 | Compliance | FERDIG | ? |
| I.15 | Audit-log | FERDIG | ? |
| I.16 | Moderering | FERDIG | ? |
| I.17 | TrackMan admin | FERDIG | ? |
| I.18 | Live / mission | FERDIG | ? |
| I.19 | Caddie AI | FERDIG | ? |
| I.20 | AI-agenter | FERDIG | ? |
| I.21 | Økonomi | FERDIG | ? |
| I.22 | Marketing admin | FERDIG | ? |
| I.23 | E-postmaler | FERDIG | ? |
| I.24 | Kalender-synk Google | FERDIG | ? |
| I.25 | Klubb-innstillinger | FERDIG | ? |

---

## J — PlayerHQ undermenyer / analyse

| ID | Punkt | St | S |
|---|---|---|---|
| J.01 | Runder-liste + detalj | FERDIG | JA |
| J.02 | TrackMan under Analyse/Mål | FERDIG | JA |
| J.03 | SG-hub | FERDIG | JA |
| J.04 | Tester (spiller) | FERDIG | JA |
| J.05 | Drills | FERDIG | JA |
| J.06 | Booking hub | FERDIG | JA |
| J.07 | Fysisk | FERDIG | ? |
| J.08 | Gameplan / baneguide | FERDIG | ? |
| J.09 | DataGolf | FERDIG | ? |
| J.10 | Coach-meldinger | FERDIG | JA |
| J.11 | Venner | FERDIG | ? |
| J.12 | Utfordringer | FERDIG | ? |
| J.13 | Talent (spiller) | DELVIS | ? |
| J.14 | Meg · abonnement / innstillinger / helse | FERDIG | JA |

---

## K — Eksplisitt utenfor (S = NEI til eget GO)

| ID | Punkt | S |
|---|---|---|
| K.01 | Egen FullSving-app/tabell | NEI |
| K.02 | To TrackMan-import-modaler | NEI (fjernet) |
| K.03 | CoachHQ som produktnavn i UI | NEI |
| K.04 | Auto-endring av plan uten godkjenning | NEI |
| K.05 | Force-push main | NEI |

---

## Oppsummering antall

| Gruppe | Antall ID-er |
|---|---|
| A Ferdig kjerne | 18 |
| B P0 | 6 |
| C Workbench | 4 |
| D AgenticOS | 6 |
| E TrackMan polish | 7 |
| F Runde | 6 |
| G Marketing/stats | 4 |
| H Intern | 8 |
| I AgencyOS Mer | 25 |
| J PlayerHQ under | 14 |
| K Forbud | 5 |
| **Totalt** | **~103** |

---

## Runde 2 — sett synlighet

Når du er klar, svar f.eks.:

```
Synlig: A.*, J.01–J.06, I.01, I.10–I.12, C.01–C.02
Skjult: I.06–I.07, I.18, J.13, D.05–D.06
Avventer: resten
```

Eller enklere: **«Skjul talent og live mission»** / **«Vis bare stall + plan + godkjenninger for coach»**.

Kode-fasit for toggles: `src/lib/product-visibility.ts` (oppdateres når du har bestemt).

---

## Runde 3 — bygg det som mangler

Bare TODO/DELVIS med S=JA eller S=? som du velger å prioritere.  
Se leveransebølger i `RESTERENDE-PLAN-KOMPLETT-2026-07-22.md`.
