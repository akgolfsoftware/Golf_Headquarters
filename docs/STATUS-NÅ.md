# STATUS NÅ — AK Golf HQ

> **Hva dette er:** ett snapshot av hvor plattformen står akkurat nå. Oppdater datoen + relevante linjer når noe vesentlig endrer seg.

**Sist oppdatert:** 2026-07-24 (ferdigstillingsplan: dokumentsynk + Fase A/B-arbeid. Design-GAP i PlayerHQ/AgencyOS/Forelder/Auth = 0. Appen er fortsatt ikke klar for betalende brukere før P0-aktivering.)

## Levende kilder (én av hver rolle — start her)

| Rolle | Dokument |
|---|---|
| **Snapshot (denne)** | `docs/STATUS-NÅ.md` |
| **Skjerm-status** (autoritativ, 6 haker/skjerm + «Veien til 100%») | `docs/MASTER-SKJERMPLAN.md` |
| **Uavklart / parkert / løst** | `docs/AAPNE-SPORSMAAL.md` |
| **Låste forretningsregler** (fasit) | `docs/platform/BUSINESS-RULES.md` |
| **Full plattformkontekst** (5 min) | `docs/platform/AGENT-BRIEF.md` |
| **Design-gap (produkt)** | `docs/design-system/plattform-design-2026-07-21/GJENSTAENDE-SKJERMER.md` |
| **Ferdigstillingsplan** | Cursor-plan «Ferdigstill AK Golf HQ» (Fase A lansering → Fase B loop) |

Historiske bygg-spor (SKJERM-STATUS, SKJERM-BYGGEPLAN, BYGGELOGG-FLAGG, KONFLIKTER) er flyttet til `docs/arkiv/` — ikke bygg mot dem.

---

## Kort sagt
Appen er **deployet og kjører** på `akgolf-hq.vercel.app`. PlayerHQ + AgencyOS + Forelder + Auth har **0 design-GAP** (verifisert 23. jul). Coaching-/business-motoren (ukesyklus, godkjenningskø, churn, kapasitet-som-penger, m.m.) er levert i juli. **Den er IKKE klar for betalende/ekte brukere ennå** — største hinder er at registrerte spillere aldri har logget inn, pluss Resend DKIM / DNS / Stripe-panel hos Anders. Betaling starter **1. august** (`BETALING_STARTER` i `feature-flags.ts`) — koden gir alle PRO gratis frem til da.

Push til `main` deployer automatisk via **Vercel git-integrasjon**. GitHub Actions `deploy.yml` er manuell (`workflow_dispatch`) — kjør ALDRI `vercel deploy --prod` manuelt.

## Ferdig / solid (verifisert)
- **Design/ruter (kjerneprodukter):** 0 GAP i PlayerHQ, AgencyOS, Forelder, Auth (se GJENSTAENDE-SKJERMER 23. jul). Drop-off A (skjermbilder) og B (komponenter) lukket.
- **Deployet live:** prod på `akgolf-hq.vercel.app`.
- **PlayerHQ – 5 hovedskjermer + datakobling:** Hjem, Planlegge, Gjennomføre, Analysere, Meg + SG-Hub, Runder, TrackMan, Statistikk, Booking, Drills, Workbench, Live.
- **Workbench:** `WorkbenchV2` + `@/components/v2` (ikke lenger `workbench-hybrid`/golfdata). Composer, maler, publiser, dupliser uke, periode/dag, CANON-chips.
- **Live-økt UI:** brief → active → summary med drill-sjekkliste, timer, rep-knapper. **Gjenstår:** offline-synk for drill-reps + DB-persist (ikke bare sessionStorage).
- **AgencyOS:** cockpit, stall/spillere, innboks, godkjenninger, økonomi, analyse — ekte Prisma-data.
- **SG-motor:** Broadie OTT/APP/ARG + Team Norway IUP PUTT, kalibrert.
- **Veikart-motor (juli):** A1 én godkjenningskø · C1 automatisk ukesyklus · B1 kapasitet-som-penger · B2 churn-radar · B3 lead-løype · B4 purring · B5 månedsrapport · C3/C4 test/runde→plan · C5 spiller-loop (push + én-trykks status).
- **`/portal/ny-okt`:** **LØST 2026-07-17** — `createAdHocSession` skriver ekte `TrainingPlanSession` (se AAPNE D2).
- **D1 live/skjult:** **LØST 2026-07-15** — Mission Control / PlayerHQ Talent fjernet fra meny.
- **D6a/b/c:** hull-for-hull, shot-map, live turneringsrunde — **bygget 2026-07-17**.
- **Foreldreportal:** 11/11 ruter med ekte data (siste mock `/forelder/coach` fikset 15. jul).
- **Moderering/GDPR-kø:** bygget (D5).

## I arbeid / delvis (ferdigstillingsplan Fase A+B)
- **P0 lansering:** spiller-aktivering, push-opt-in, e2e-smoke på ★-kjernen (Funker `†` → `✓`).
- **Bølge 4-rest:** live offline-kø for drills + reps til DB + summary write-back.
- **Bølge 5:** treningsanalyse-modul + AgencyOS-kalender drill-lesevisning — **ikke startet**.
- **Bølge 6-rest:** nivåplasserings-quiz i onboarding (profil-wizard finnes; quiz mangler).
- **Soft-haker i MASTER:** mange skjermer har Design ✓ men Mob/iPad `✓✓–`, Flyt/Data `~`, eller Funker `†`.
- **Klikk-testing:** ~23 av ~261 skjermer (resten kun dødlenke-sjekket).

## Blokkert — P0 før ekte/betalende brukere

### Hos Anders (panel/DNS)
1. **Resend DKIM** for `send.akgolf.no` (SPF+MX OK; DKIM mangler → spam-risiko).
2. **`akgolf.no` → Vercel** (peker i dag til Acuity på DNS-nivå).
3. **Live Stripe-nøkler** verifisert i Vercel (+ webhook).
4. **Google Calendar** re-koble (`/admin/settings/calendar` — tokens PAUSED).
5. **Aktiverings-e-post** til registrerte spillere (etter DKIM).

### Kode / data (agent)
- Aktiveringsflyt + at `lastLoginAt` settes ved innlogging.
- Push-opt-in-prompt ved første PlayerHQ-besøk (motor finnes, 0 abonnementer).
- Betaling 1. august: `gratisForAlle()` slår av automatisk; verifiser cutover.

### Åpne produktbeslutninger (ikke lanseringsblokkere)
- **A4 Fase 2:** anbefalingsmotor for periode-fordeling (venter data).
- **D8:** ekte banekart-geometri (blokkert på datakilde).
- **Elite Fase 2 / talent-dispersion:** bevisst utsatt.
- **Marketing (~50) + offentlig stats (~40):** egen merkevare-bølge.
- **Bølge 7 AI Coach:** først etter at loopen produserer gjennomføringsdata.

## Verifisert vs. antatt
- **Verifisert 2026-07-24 (kode/docs):** design-GAP = 0 i kjerneprodukter; Workbench = V2; live UI utover 4a; D2/D5/D6 løst; Bolk 2/4/5 i MASTER lukket; veikart C/B/A-punkter levert i statusloggen.
- **Sist DB-sjekket 2026-07-14:** 31 spillere / 0 innlogginger / 0 push — re-sjekk ved aktivering.
- **Antatt / panel:** Stripe live, Resend DKIM, Google Calendar, DNS `akgolf.no`.
