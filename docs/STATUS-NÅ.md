# STATUS NÅ — AK Golf HQ

> **Hva dette er:** ett snapshot av hvor plattformen står akkurat nå. Oppdater datoen + relevante linjer når noe vesentlig endrer seg.

**Sist oppdatert:** 2026-08-04 natt (designport steg 7-status oppdatert — se linje under. Forrige:
2026-08-03 kvalitetsaudit tiltak 9+10 fullført: hydreringsfeilen på Workbench fikset og
verifisert 3/3 mot prod (React #418 fjernet fra `KJENTE_FEIL`), `processed_webhook_events` finnes i prod
med RLS, PR #253 merget. CSP-funnet på `/admin/spillere` står fortsatt åpent, dokumentert under. Design-GAP
i PlayerHQ/AgencyOS/Forelder/Auth = 0 (v2/Presis-æraen, egen målestokk fra Paper-porten under). Appen er
fortsatt ikke klar for betalende brukere før P0-aktivering.)

## Levende kilder (én av hver rolle — start her)

| Rolle | Dokument |
|---|---|
| **Snapshot (denne)** | `docs/STATUS-NÅ.md` |
| **Skjerm-status** (autoritativ, 6 haker/skjerm + «Veien til 100%») | `docs/MASTER-SKJERMPLAN.md` |
| **Uavklart / parkert / løst** | `docs/AAPNE-SPORSMAAL.md` |
| **Låste forretningsregler** (fasit) | `docs/platform/BUSINESS-RULES.md` |
| **Full plattformkontekst** (5 min) | `docs/platform/AGENT-BRIEF.md` |
| **Design-gap (produkt)** | `docs/arkiv/2026-08-03-forenkling-bolge2/designdekning-2026-07-29.md` + Claude Paper `kart/status-til-komplett-2026-07-31.md` |
| **Ferdigstillingsplan** | Cursor-plan «Ferdigstill AK Golf HQ» (Fase A lansering → Fase B loop) |

Historiske bygg-spor (SKJERM-STATUS, SKJERM-BYGGEPLAN, BYGGELOGG-FLAGG, KONFLIKTER) er flyttet til `docs/arkiv/` — ikke bygg mot dem.

---

## Kort sagt
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
- **Designport steg 7 (PlayerHQ mot Claude Paper):** de 6 fasit-dekkede rutene er avklart —
  4 merget (Hjem/Planlegge/Analysere/Meg), Booking [PR #281](https://github.com/akgolfsoftware/Golf_Headquarters/pull/281)
  åpen (venter godkjenning), Workbench mobil trengte ingen endring (allerede ferdig fra juli).
  Kartlegging av de 145 skjermene uten fasit ([PR #280](https://github.com/akgolfsoftware/Golf_Headquarters/pull/280),
  åpen): 113/167 PlayerHQ-sider bruker allerede v2-komponenter. Lint-porten mot nye
  hardkodede farger bygget ([PR #279](https://github.com/akgolfsoftware/Golf_Headquarters/pull/279), åpen).
  Full status: `docs/port/plan-designport-alle-skjermer.md`.
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
