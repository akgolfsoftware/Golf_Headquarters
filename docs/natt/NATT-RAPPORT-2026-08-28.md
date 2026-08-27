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

---

## Logg

### T7 — pågår

Samler `/admin/kalender` og måned-flaten til én Train-lock-kalender (C3-laget som kjerne). Booking-lista og `agencyos/uka` pensjoneres med redirect. Google-synk røres ikke. `/admin/bookinger/[id]`, `/admin/bookinger/ny` og `/admin/availability` beholdes som skrive-/detaljflater (wizard og tilgjengelighet er for store til å bli ekte bunnark uten å ødelegge flyten).
