# Paper-portstatus — designet og godkjent

**Oppdatert:** 2026-08-09  
**Wave-port:** se `WAVE-STATUS-MASTER.md` (A–D chrome i sandbox; pixel DONE ≠ chrome)  

**Godkjent av:** Anders (eksplisitt «ja» per PR-batch)  
**Kilde design:** Claude Design `605a48cc` · lokalt speil `designsystem/paper/`  
**Kilde kode:** `main` · visual seeds i `tests/e2e/paper-visual/`

Dette er den **levende lista** over hva som er tegnet (fasit), portert til app, og merget
etter Anders' ja. Oppdater denne fila ved hver nye batch — ikke bare fasit-lista.

---

## Kort status

| | Antall |
|---|---:|
| Paper-fasitfiler på disk | **44** |
| Unike ruter med fasit (mobil+desktop = 1) | **~38** |
| **Portert + merget til main (godkjent)** | **~40 flater** (eldre batch) |
| **Wave A–D fidelity re-port (sandbox 09.08)** | **Chrome ✅ · pixel DONE ❌ · main ❌** |
| Fasit uten full app-port | **0** (fangstsheet = komponent, ferdig) |
| Bevisst blokkert (PR-E, PR-F) | **2 beslutninger** |
| App-skjermer uten Paper-fasit i det hele tatt | **~300+** |

---

## Godkjent og i main (portet)

Hver rad: fasit → rute → merge-PR. Visual seed finnes under `tests/e2e/paper-visual/`.

### PlayerHQ — kjerne

| Fasit | Rute | PR |
|---|---|---|
| `playerhq-chat-desktop/mobil.html` | `/portal` | #307 |
| `playerhq-plan.html` | `/portal/planlegge` | #308 |
| `playerhq-analyse.html` | `/portal/analysere` | #309 |
| `playerhq-meg.html` | `/portal/meg` | #310 |
| `playerhq-booking.html` | `/portal/booking` | #328 |

### PlayerHQ — live / gjennomføre

| Fasit | Rute | PR |
|---|---|---|
| `playerhq-live-tapper.html` | `/portal/.../live/.../tapper` | #311 |
| `playerhq-live-brief.html` | `/portal/.../live/.../brief` | #312 |
| `playerhq-live-okt.html` | `/portal/.../live/.../active` | #313 |
| `playerhq-live-summary.html` | `/portal/.../live/.../summary` | #314 |
| `playerhq-runde-live.html` | `/portal/.../runde/live` | #315 |
| `playerhq-runde-logg.html` | `/portal/.../runde/logg` | #316 |
| `playerhq-test-gjennomfor.html` | `/portal/.../tester/.../gjennomfor` | #317 |

### PlayerHQ — W1 (godkjent wireframe 05.08.2026)

| Fasit | Rute | PR |
|---|---|---|
| `playerhq-okt-detalj.html` | `/portal/gjennomfore/[id]` | #318 |
| `playerhq-feiring.html` | `/portal/tren/feiring/[planId]` | #319 |
| `playerhq-fys-plan.html` | `/portal/tren/fys-plan` | #320 |
| `playerhq-teknisk-plan.html` | `/portal/tren/teknisk-plan/[planId]` | #321 |
| `playerhq-drills.html` | `/portal/drills` | #322 |
| `playerhq-drill-detalj.html` | `/portal/drills/[id]` | #323 |
| `playerhq-tester-hub.html` | `/portal/tren/tester` | #324 |
| `playerhq-test-detalj.html` | `/portal/tren/tester/[testId]` | #325 |
| `playerhq-turneringer.html` | `/portal/tren/turneringer` | #326 |
| `playerhq-turnering-detalj.html` | `/portal/tren/turneringer/[id]` | #327 |

### Workbench

| Fasit | Rute / plassering | PR |
|---|---|---|
| `workbench-mobil.html` | `/portal/planlegge/workbench` | #329 |
| `workbench-desktop.html` | `/admin/spillere/[id]/workbench` | #329 |
| `workbench-turnering.html` | Zoom-fane «Turnering» i WorkbenchV2 | #342 |

### AgencyOS

| Fasit | Rute | PR |
|---|---|---|
| `agencyos-konsoll-desktop/mobil.html` | `/admin/agencyos` | #330 |
| `agencyos-innboks.html` (+ mobil) | `/admin/innboks` | #331 |
| `agencyos-kalender.html` (+ mobil) | `/admin/kalender` | #332 |
| `agencyos-spillere.html` (+ mobil) | `/admin/spillere` | #333 |
| `spillerprofil.html` | `/admin/spillere/[id]` | #334 |
| `agencyos-okonomi.html` | `/admin/agencyos/okonomi` | #335 |
| `agencyos-innstillinger.html` | `/admin/settings` | #336 |
| `agencyos-agenticos.html` | `/admin/agent-team` | #337 |
| `agencyos-live-session.html` | `/admin/agencyos/live` | #341 |
| `agencyos-ak-stigen.html` | `/admin/agencyos/ak-stigen` (ny rute) | #343 |

### Felles / auth / marketing

| Fasit | Rute | PR |
|---|---|---|
| `innlogging.html` | `/auth/login` | #338 |
| `foreldreportal.html` | `/forelder` | #339 |
| `booking.html` | `/booking` | #340 |
| (uten egen fasit-fil) | `/auth/logget-ut` | #345 |
| `fangstsheet.html` | Komponent (`FangstModal`), ikke rute | #344 |

### Speil / infra (ikke skjerm)

| PR | Hva |
|---|---|
| #306 | Paper-speil i repo |
| #304 | Grok Build-brief |
| #302 | Claude Code slash-kommandoer + feillogg (docs) |
| #223 | Sikkerhet (GDPR m.m.) + Paper UI på GDPR-kø |

---

## Blokkert — krever Anders-beslutning

| Sak | Hvorfor | Blokkerer |
|---|---|---|
| **PR-E** — testantall | 20 / 21 / 25 protokoller uavklart | Testbatteri i Workbench (full dybde) |
| **PR-F** — DataGolf | Plassering av `/stats/*` i PlayerHQ | Stats-skjermer |

---

## Hva som gjenstår (uten fasit)

Ca. **300+** app-skjermer har **ingen** dedikert Paper-fasit. Plan: **W2–W6** i
`skjermplan-tegnet-og-wireframe.md` (wireframe først, deretter port).

**W2 i gang (2026-08-06):** Analysere-dybde (hull, runder, gameplan, …) — se skjermplanen §W2.
Hub `/portal/analysere` er allerede i main (#309).

Se `fasit-liste-paper.md` §«Hva som IKKE har fasit» for områdeoversikt.

---

## Ferdig-definisjon (uendret)

En skjerm er **godkjent i main** når:

1. Fasit finnes i `designsystem/paper/` (eller eksplisitt unntak)
2. Primærhandling bruker `T.handling` der «Én ting nå» gjelder
3. Visual seed i `tests/e2e/paper-visual/`
4. Draft-PR → Anders sier **ja** → merge til main

---

## Historikk

| Dato | Hendelse |
|---|---|
| 2026-08-03 | Paper vinner alltid (invariant) |
| 2026-08-04 | Live/runde-fasiter + avvik A1–A4 |
| 2026-08-05 | W1-wireframes batch-godkjent |
| 2026-08-06 | Full fasit-port: PlayerHQ + AgencyOS + felles (#307–#345) · #290 lukket · #223/#302 merget |
| 2026-08-06 | W2 startet (Analysere-dybde) · skjermplan Del A markert ferdig |
