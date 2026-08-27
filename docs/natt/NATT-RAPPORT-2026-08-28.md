# Natt-rapport 28.08.2026

Gren: `claude/natt-lansering-2026-08-28` (ikke main).
Plan: `docs/LANSERINGSPLAN-KOMPLETT-2026-08-27.md` (fila ligger i `docs/`, ikke `docs/natt/`).

## Punktliste (planens rekkefølge)

1. T7 — Kalender + booking-lag
2. T8 — Grupper
3. QA-1 — Web-hygiene
4. C6 — Jarvis-merge-motor
5. C7 — AgenticOS cockpit-queue (J-A / J-B hoppes)
6. T12 — AgenticOS + Jarvis + Caddie-port
7. C1 — Måned/år i Workbench
8. C10 — DataGolf + økonomi
9. C9 — Foreldre-kort FO-01
10. P1 — Meg-familien
11. P2 — Analyse-familien
12. P3 — Tren + planlegge + resten
13. P4 — Live-løypa + gjennomføring
14. AD-1 — Admin-rest
15. F1 — Forelder-helporten
16. C8 — Lys-pass
17. W5-auth — Auth-skallet
18. V1 — Betalings-cutover-verifisering
19. V2 — Full smoke + release

P0-listen i planens §4 er Anders-panel, ikke kode.

---

## FERDIG OG VERIFISERT

### T7 — Kalender + booking-lag

Én kalender på `/admin/kalender` (Dag / Uke / Måned) med C3-lagene. Booking er et lag. Google urørt.

Pensjonert med redirect: `/admin/kalender/lag`, `/admin/bookinger` (lista), `/admin/agencyos/uka`, `/admin/uka`, `/admin/kalender/maned`. Beholdt: `/admin/bookinger/[id]`, `/admin/bookinger/ny`, `/admin/availability`.

Verify/test-bevis 28.08:

```
check-action-auth: OK.
check-critical-imports: OK.
OK: ingen døde doc-lenker i levende styringsdokumenter.
The service worker will precache 540 URLs, totaling 15.8 MB.
VERIFY_EXIT:0

ℹ tests 1749
ℹ pass 1749
ℹ fail 0
TEST_EXIT:0
```

Skjermbilde-gate (390+1280, lys+mørk) er IKKE gjort — krever Anders før merge.

### T8 — Grupper

Train-lock-port av gruppeliste, gruppedetalj, timeplan og AK-stigen. Workbench-fane i gruppe-fanene. `lPhase`-etiketter i årsplan er allerede GRUNN/SPESIAL/TURNERING (`LPHASE_LABEL`). Stall-dag (A-10) gjenbrukt via lenke fra gruppedetalj. Årsplan-canvas (`WorkbenchAarsplan`) er delt med spiller-workbench og ble ikke portet isolert (unngå T/TL-blanding i canvas). Ny-gruppe-modalen er fortsatt Paper-tokens.

Verify/test-bevis 28.08:

```
check-action-auth: OK.
check-token-gap: ingen Presis-farger, ingen hex i style={{}}, className eller SVG.
check-critical-imports: OK.
VERIFY_EXIT:0

ℹ tests 1749
ℹ pass 1749
ℹ fail 0
TEST_EXIT:0
```

### QA-1 — Web-hygiene

(a) Sonner-Toaster montert i admin-layout. (b) Telefon på kontaktsiden er `tel:+4748216540`. (c) GFGK-junior-footer bruker løpende årstall. (d) `MobileMenu` slettes ikke (hard regel 5 — fila er allerede ubrukt). (e) Fane-titler på cockpit, stall, plan, innsikt, turneringer, oppsett, tester, TrackMan, stall-dag, tilgjengelighet, I dag, Plan, Analyse, Meg, Gjennomføre, Forelder. (f) Dobbel e-post på kontakt slått sammen til én mailto.

Verify/test-bevis 28.08:

```
check-action-auth: OK.
check-token-gap: ingen Presis-farger, ingen hex i style={{}}, className eller SVG.
VERIFY_EXIT:0

ℹ tests 1749
ℹ pass 1749
TEST_EXIT:0
```

### C6 — Jarvis-merge-motor

Eval-gate (ACWR 0,8–1,3 · kollisjon · motorer adskilt · drills komplette) + proveniens. Jarvis merger aldri. `src/lib/jarvis/` urørt. Testdata: Filip 4/4 ÅPEN, Jonas ACWR 1,46 STENGT.

Verify/test-bevis 28.08:

```
VERIFY_EXIT:0
ℹ tests 1760
ℹ pass 1760
TEST_EXIT:0
```

### C7 — AgenticOS cockpit-queue

AO-12 policy A3/B1/C3 som ren funksjon: start-godkjenning for sky/sensitiv area/skriv; research uten skriv = Cockpit-badge; Workbench-write forbudt. J-A og J-B hoppet.

Verify/test-bevis 28.08:

```
VERIFY_EXIT:0
ℹ tests 1766
ℹ pass 1766
TEST_EXIT:0
```

### C9 — Foreldre-kort FO-01

Neste økt fra Workbench (PUBLISHED / IN_PROGRESS, aldri DRAFT). Kun fornavn. Tom tilstand hvis ingenting er publisert.

Verify/test-bevis 28.08:

```
VERIFY_EXIT:0
ℹ tests 1770
ℹ pass 1770
TEST_EXIT:0
```

---

## IKKE TATT DENNE NATTEN (gått gjennom, for store / avhengige)

- **T12** — AgenticOS + Jarvis + Caddie-port. Motoren (C6+C7) er inne; selve skjermporten gjenstår.
- **C1** — Måned/år i Workbench.
- **C10** — DataGolf + økonomi (Tripletex-lesing finnes; Invoice-modell og D2 booking→faktura krever Anders).
- **P1–P4** — Player-porten (53 Paper-ruter).
- **AD-1** — Admin-rest (T7 er inne, så fil-kollisjon mot kalender er unngått).
- **F1** — Forelder-helporten (kjent bug i `hentForelderUkerapport` tas der).
- **C8** — Lys-pass (skal kjøres sist).
- **V2** — Full smoke + release (menneske).

---

## FEILET

*(tom)*

---

## KREVER ANDERS

- **W5-auth** — krever designbestilling før kode (planen sier det).
- **V1** — Stripe live-cutover og prod-verifisering. Anders: Stripe live (P0).
- **P0-listen** — DKIM, DNS til Vercel, Stripe live, aktiverings-e-post, SCREENTEST_PASSWORD.
- **§5-beslutninger** som haster før 1. sep: freemium-presisering (TALENT-listen).
- **C7 J-A / J-B** — hvor `/meg` lenkes, og Gmail-send vs. «Utkast opprettet». Hoppes.
- **T12 J-C** — om `/admin/godkjenninger` skal inn i AgenticOS-flaten. Hoppes.
- **Skjermbilde-gate** for alle skjerm-PR-er — Anders må se 390 + 1280, lys + mørk, før merge.
- **MobileMenu-sletting** (QA-1 d) — hard regel 5: slettes ikke av agent. Fila er allerede ubrukt.
- **C10 D2 booking→faktura** — Invoice-modell mangler.

---

## Logg

Nattøkt på `claude/natt-lansering-2026-08-28`. T7, T8, QA-1, C6, C7 og C9 levert og verifisert. T12 og videre er for store for samme natt; motorene til T12 (C6+C7) ligger klare.
