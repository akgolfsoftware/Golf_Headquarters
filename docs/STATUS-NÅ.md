# STATUS NÅ — AK Golf HQ

> **Hva dette er:** ett snapshot av hvor plattformen står akkurat nå. Oppdater datoen + relevante linjer når noe vesentlig endrer seg.

**Sist oppdatert:** 2026-08-10 formiddag.

**Bygget:** `main` er **grønt**. Den var rød med 114 feil fra 09.08 (syntaksfeil fra
automatisk slug-tagging skjulte 79 typefeil, som igjen skjulte 17 lint- og 14 fargefeil).
Rettet i [#385](https://github.com/akgolfsoftware/Golf_Headquarters/pull/385) — `npm run verify`
grønt, 943/943 tester.

**Vercel Preview virker igjen (verifisert 10.08 kl. 11:24).** Preview hadde vært rød siden 05.08:
`DIRECT_URL` manglet, så `postinstall: prisma generate` veltet `npm install` før bygget startet.
Alle preview-deployer fra #384 til og med 10.08 formiddag er ERROR, mens hver produksjonsdeploy er
READY — derfor ble det ikke oppdaget.

**Env-variablene er nå satt for Preview.** Målt, ikke antatt: nøyaktig samme kode som feilet
kl. 10:41 bygde READY kl. 11:24 (PR #390, uten at #389 var merget og uten kodeendring i
`prisma.config.ts`). Og databasen svarer — `/stats/spillere` (ren Prisma) gir **200**, der den ga
500 tidligere samme dag.

[#389](https://github.com/akgolfsoftware/Golf_Headquarters/pull/389) gjør i tillegg
`prisma.config.ts` tolerant for manglende `DIRECT_URL`. Den er ikke lenger blokkerende, men bør
merges likevel — den hindrer at et manglende env-navn igjen kan velte `npm install`.

**Konsekvens for sign-off:** galleriet kan nå kjøres mot en preview-URL. Det som gjenstår er
legitimasjonen — `scripts/signoff-gallery.mjs` krever `SCREENTEST_PASSWORD`/`SHOT_PASSWORD` for
testbrukerne, og passordets status er uavklart etter hendelsen 03.08 (se §Funnet i klikk-testen).

**Paper-port (viktigst nå):** styrende plan er **`docs/port/PIXEL-PERFECT-PLAN-COMPLETE.md`**
(PP-0…PP-10). Wave A–I i `WAVE-STATUS-MASTER.md` er chrome-historikk, ikke pixel.

- **Design/tegning: FERDIG.** 79 fasit-HTML i Claude Design `605a48cc` (33 `fase1/` + 46
  `fase2/`) + 8 templates + 138 komponenter. W1–W6 er alle tegnet; ingen in-scope skjerm mangler
  fasit. Speilet `designsystem/paper/` er verifisert i synk 10.08.
- **Kode: 52 `[~]`** (chrome portet, ikke pixel), **35 `[ ]`** (ikke bygget, inkl. 8
  templates-rader).
- **Pixel sign-off: 0 av 79.** Bevis side om side finnes for 11 skjermer i
  **`docs/port/SIGNOFF-GALLERI-2026-08-10.md`** (33 bilder, mobil + desktop, lys + mørk).
- **Bygget etter galleriet:** PP-1.3 Analyse (13 → 4 kort) og PP-1.6 oransje innlogging
  ([#387](https://github.com/akgolfsoftware/Golf_Headquarters/pull/387)) · PP-2.1 Konsoll
  ombygget til tråd + rail til åtte punkter
  ([#388](https://github.com/akgolfsoftware/Golf_Headquarters/pull/388)) · PP-2.2 Innboks
  ([#389](https://github.com/akgolfsoftware/Golf_Headquarters/pull/389), åpen) · PP-1.1/1.2/1.4/1.5
  ([#390](https://github.com/akgolfsoftware/Golf_Headquarters/pull/390), åpen).
  **Ingen av dem er signert** — galleriets bilder er fra før endringene og må tas på nytt.
- **Gjenstår:** PP-2.3 Spillere · PP-2.4 Kalender · PP-3 (live/WB/forelder) · de 35 `[ ]` ·
  mal-varianter W3–W5 · PP-10 regresjon. PP-1.7 offentlig booking er låst til slutt (Acuity).

Masterbrain drill-seed er tømt. Appen er fortsatt ikke klar for betalende brukere før P0-aktivering
(Stripe/DNS/Resend + spiller-login).

## Levende kilder (én av hver rolle — start her)

| Rolle | Dokument |
|---|---|
| **Snapshot (denne)** | `docs/STATUS-NÅ.md` |
| **Designdekning per skjerm** (hvilke har Paper-fasit) | `docs/port/fasit-liste-paper.md` |
| **Porteringsplan + ferdig-definisjon per skjerm** | `docs/port/plan-designport-alle-skjermer.md` |
| **Uavklart / parkert / løst** | `docs/AAPNE-SPORSMAAL.md` |
| **Låste forretningsregler** (fasit) | `docs/platform/BUSINESS-RULES.md` |
| **Full plattformkontekst** (5 min) | `docs/platform/AGENT-BRIEF.md` |
| **Design-gap (produkt)** | `docs/port/fasit-liste-paper.md` (79 fasit-HTML — dekker alle in-scope ruter, 1:1 eller via mal) |
| **Styrende portplan** | `docs/port/PIXEL-PERFECT-PLAN-COMPLETE.md` (PP-0…PP-10) |
| **Ferdigstillingsplan** | Cursor-plan «Ferdigstill AK Golf HQ» (Fase A lansering → Fase B loop) |

Historiske bygg-spor (SKJERM-STATUS, SKJERM-BYGGEPLAN, BYGGELOGG-FLAGG, KONFLIKTER) er slettet 05.08.2026 — de lever i git-historikken, ikke bygg mot dem.

---

## Kort sagt

### Paper design (2026-08-10)
- **Styrende plan:** [`docs/port/PIXEL-PERFECT-PLAN-COMPLETE.md`](port/PIXEL-PERFECT-PLAN-COMPLETE.md) (PP-0…PP-10)
- **Chrome-historikk:** [`docs/port/WAVE-STATUS-MASTER.md`](port/WAVE-STATUS-MASTER.md) — Wave A–I portet
- Tegning ferdig (79 fasit) · kode 52 `[~]` / 35 `[ ]` · **0 signert**
- **Gjenstår:** sign-off (blokkert av Preview-env) · PP-2.3/2.4 · PP-3 · de 35 `[ ]` · mal-varianter

Appen er **deployet og kjører** på `akgolf-hq.vercel.app`. PlayerHQ + AgencyOS + Forelder + Auth har **0 design-GAP** (verifisert 23. jul). Coaching-/business-motoren (ukesyklus, godkjenningskø, churn, kapasitet-som-penger, m.m.) er levert i juli. **Den er IKKE klar for betalende/ekte brukere ennå** — største hinder er at registrerte spillere aldri har logget inn, pluss Resend DKIM / DNS / Stripe-panel hos Anders. Betaling starter **1. september 2026** (`BETALING_STARTER` i `src/lib/feature-flags.ts:18`, verifisert 2026-08-02) — koden gir alle PRO gratis frem til da. Dette dokumentet sa tidligere 1. august; datoen i koden er fasit.

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
- **Designport steg 7 (PlayerHQ mot Claude Paper) — AVVIK FUNNET 2026-08-04:** PR #275–#278
  (Hjem/Planlegge/Analysere/Meg) er merget med riktige tokens, men **matcher ikke fasitens
  layout/interaksjon** (Anders verifiserte selv med skjermbilder). Alle fire mangler
  «Én ting nå»; Hjem mangler artefaktkolonne og tom tilstand; Planlegge har 5 konkurrerende
  CTA-er. Ombyggingsplan PR-A–F + full avviksliste:
  `docs/port/plan-designport-alle-skjermer.md` §Avviksliste. Ny fast regel: skjermbilde-gate
  (app/fasit side om side) før merge av enhver skjerm-PR. Nye produktbeslutninger 2026-08-04:
  tester planlegges i Workbench med resultat-sync til TalentHQ; DataGolf-skjermene skal inn i
  PlayerHQ (`.claude/rules/beslutninger.md` §august 2026). Åpne PR-er: [#279](https://github.com/akgolfsoftware/Golf_Headquarters/pull/279)
  (lint-gate), [#280](https://github.com/akgolfsoftware/Golf_Headquarters/pull/280) (triage-skript),
  [#281](https://github.com/akgolfsoftware/Golf_Headquarters/pull/281) (Booking-oversikt).
- **P0 lansering:** spiller-aktivering, push-opt-in, e2e-smoke på ★-kjernen (Funker `†` → `✓`).
- **Bølge 4-rest:** live offline-kø for drills + reps til DB + summary write-back.
- **Bølge 5:** treningsanalyse-modul + AgencyOS-kalender drill-lesevisning — **ikke startet**.
- **Bølge 6-rest:** nivåplasserings-quiz i onboarding (profil-wizard finnes; quiz mangler).
- **Soft-haker i MASTER:** mange skjermer har Design ✓ men Mob/iPad `✓✓–`, Flyt/Data `~`, eller Funker `†`.
- **Klikk-testing:** ~23 av ~261 skjermer (resten kun dødlenke-sjekket). **2026-08-02:** hele
  ★-kjernen klikk-testet mot prod på 390px og 1280px (`tests/e2e/kjerne-klikk.spec.ts`).
  AgencyOS: cockpit, innboks, spillere, turneringer, bookinger, kalender, godkjenninger.
  PlayerHQ: hjem, planlegge, workbench, gjennomføre, analysere, meg — alle 200 med ekte innhold og
  ærlige tomtilstander, ingen feilside. Testspilleren ble opprettet med
  `scripts/opprett-e2e-testspiller-2026-08-02.ts`. Én åpen feil funnet: hydreringsfeil på Workbench.

## Blokkert — P0 før ekte/betalende brukere

### Hos Anders (panel/DNS)
1. **Resend DKIM** for `send.akgolf.no` (SPF+MX OK; DKIM mangler → spam-risiko).
2. **`akgolf.no` → Vercel** (peker i dag til Acuity på DNS-nivå).
3. **Live Stripe-nøkler** verifisert i Vercel (+ webhook).
4. **Google Calendar** re-koble (`/admin/settings/calendar` — tokens PAUSED).
5. **Aktiverings-e-post** til registrerte spillere (etter DKIM).

### Stripe-herding 2026-08-02/03 (kvalitetsaudit tiltak 10) — kode og tabell i prod, kun Anders' sjekk gjenstår
- **Event-dedup:** tabellen `processed_webhook_events` finnes i prod (verifisert 2026-08-03: 5 kolonner,
  unik indeks på (source, eventId), RLS på, null policies — deny-by-default mot PostgREST). Webhooken
  markerer eventet som behandlet FØR den kjører, og slipper kvitteringen igjen hvis behandlingen feiler.
  Replay fra Stripe-dashbordet gir nå «duplicate» i stedet for ny e-post.
- **Sideeffekter betinget på `result.count`:** bekreftelses-e-post, kalender-push og coach-varsel
  kjører kun når bookingen faktisk gikk PENDING → CONFIRMED. Før hang de bare på at eventet kom —
  det var den ekte dobbel-e-post-bugen.
- **`WebhookFailure` har fått en konsument:** `/api/cron/webhook-retry` (hver 30. min) kjører feilede
  events på nytt og varsler når et event gir opp etter 5 forsøk. Tabellen ble tidligere kun skrevet til.
- **GJENSTÅR (Anders, under 5 min):** verifiser i Stripe-dashbordet at webhook-endepunktet abonnerer på de
  13 event-typene koden håndterer i `src/lib/stripe/handle-event.ts` (subscription created/updated/deleted,
  checkout.session completed/expired, payment_intent succeeded/payment_failed/canceled, invoice
  paid/payment_succeeded/payment_failed/finalized, charge.refunded), og kjør én testbetaling som ender som
  ny rad i `Payment`-tabellen.

### Kode / data (agent)
- Aktiveringsflyt + at `lastLoginAt` settes ved innlogging.
- Push-opt-in-prompt ved første PlayerHQ-besøk (motor finnes, 0 abonnementer).
- Betaling 1. september: `gratisForAlle()` slår av automatisk; verifiser cutover.

### Funnet i klikk-testen 2026-08-02 — status 2026-08-03
- **CSP blokkerer en app-chunk i prod — fortsatt åpent, bevisst ikke fikset videre:** på
  `/admin/spillere` blir `/_next/static/chunks/0vgmow81h3vwc.js` (Lucide-ikoner: `Menu`,
  `chevron-left`) avvist av `script-src`-direktivet i `src/proxy.ts:65` — `'strict-dynamic'` slår
  av `'self'`. Reproduserbart 3/3 mot prod. Ikonene rendres likevel (23 lucide-svg i DOM), så synlig
  skade er liten, men det er en ekte blokkering med konsollstøy og ekstra last.
  **Forsøkt fikset 2026-08-02 og rullet tilbake:** hypotesen var at CSP-headeren måtte ligge på
  request (der Next leter etter nonce-en). Måling avkreftet den — `/auth/login` serverte 44
  script-tagger, alle med nonce, både med og uten endringen. Årsaken ligger sannsynligvis i
  Turbopacks dynamiske chunk-lasting etter hydrering, ikke i server-rendret HTML. En fiks her ville
  kreve å røre CSP uten bevist effekt — ikke gjort 2026-08-03 av samme grunn.
- **Hydreringsfeil på Workbench — FIKSET 2026-08-03 (PR #253 + #261):** brødsmulen i `WorkbenchV2.tsx`
  leste år/måned med `new Date()` direkte i render — ulikt resultat på server (UTC) og klient (Oslo)
  nær et månedsskifte, som ga React #418. Fikset ved å lese fra `data.weekStartISO` (stabil serverdata,
  samme mønster som resten av komponenten) i stedet. Verifisert med kontrollert før/etter-måling
  (server=UTC/klient=Oslo på samme simulerte tidspunkt: mismatch før, identisk etter) og med 3/3 ekte
  kjøringer mot prod uten konsollfeil. `KJENTE_FEIL`-lista i `tests/e2e/kjerne-klikk.spec.ts` er tom igjen.
- **Lokal dev — Mac Mini løst, MacBook Air fortsatt sensurert:** Mac Mini har intakt `.env.local` i
  hovedrepoet; symlinket inn i denne øktens git-worktree 2026-08-03 (`ln -sf`, ingen hemmeligheter
  kopiert). MacBook Air har fortsatt 23 av 77 verdier som `[SENSURERT]` og kan ikke kjøre `next dev`.
- **Spiller-testbrukere:** `screentest@akgolf.test` (opprettet 2026-08-02) fikk et passord-mismatch
  mellom `.env.local` og Supabase under denne økten (uklart om SQL- eller dashbord-oppdateringen
  faktisk traff riktig konto) — ikke løst, status ukjent. Ny bruker `demo@akgolf.test` opprettet
  2026-08-03 (rolle PLAYER, tier PRO, «Øyvind Rohjan») og brukt til å verifisere hydreringsfiksen.
  `coachtest@akgolf.test` (AgencyOS-sporet) er upåvirket av dette, men lokal `.env.local` sin
  `SCREENTEST_PASSWORD` stemmer trolig ikke lenger med den kontoen heller — CI/prod-røyktesten bruker
  egne GitHub-secrets og er upåvirket.
  **NB — sikkerhetshendelse:** `SCREENTEST_PASSWORD`s daværende verdi ble utilsiktet eksponert i
  klartekst i en Claude Code-samtale 2026-08-03 (Playwright-feilsøkingsartefakt som fanget
  passordfeltet). Artefaktene ble slettet lokalt, men verdien bør regnes som kompromittert uansett
  hva den til slutt endte opp som.

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
