# Forenklingsplan — AK Golf Platform (13. juni 2026)

> **Hva dette er:** Én beslutningsklar plan for å gjøre plattformen enklest og mest effektiv — for
> spilleren (mobil) og for Anders som coach+eier (desktop). Bygd på faktisk kodelesing 13. juni, ikke
> anslag. Speiler metoden i `docs/ux-arkitektur.md` v2.0 (trykktelling, fil+linje-verifikasjon), men
> **re-verifiserer mot dagens kode** — mye endret seg 13. juni (KimiCode-merge, AgencyOS Fase 4,
> sletting av to nav-komponenter, ny `admin-nav.ts`, live-monolitt slettet, Stripe-flyt koblet).
> **Designsystemet er LÅST** (`design-system-lint.md` + `design-porting-gate.md`) — ingen nye
> farger/fonter foreslås. **Ingen kodeendringer er gjort.**

---

## 0. Hovedbudskap

v2.0 sine fem funn (A–E) er **delvis innfridd av dagens arbeid** — men dagens merge introduserte
**én kritisk regresjon** og lot coach+eier-spesifikke flyter stå åpne.

- ✅ **Løst i dag:** AgencyOS-nav samlet i én kilde (B1 i hovedsak løst), Live route-splittet
  (monolitt slettet), Stripe-flyt koblet ende-til-ende, død `sidebar.tsx`/`mobile-drawer.tsx` borte.
- 🔴 **Ny regresjon (P0):** Spilleren kan ikke lenger **starte dagens økt** fra hjem/Gjennomføre —
  knappen peker på en ren leseside uten vei inn i Live.
- 🟠 **Coach+eier-gap:** bulk-tildeling til **hel gruppe** finnes ikke (kun spiller-for-spiller, ~14
  trykk), og økter-på-tvers har visning men ikke inline-handling.
- 🟡 **Restanse:** mekanisk skyggekode (M1–M4, M7) ikke ryddet; mobil-nav ikke samlet med desktop.

---

## 1. Funksjonskart — faktiske navigerbare hovedflater i dag

| Produkt | Tema | Hovednav | Kjernefunksjon |
|---|---|---|---|
| **Marketing** `(marketing)/` | lyst | header (Coaching·PlayerHQ·Anlegg·Booking) + footer | Selge + booking (nå → Acuity) |
| **Stats** `(marketing)/stats/` | lyst | ingen vedvarende nav (hub→tilbake) | SEO-statistikk |
| **PlayerHQ** `/portal` | lyst | **bunn-nav 5: Oversikt · Planlegg · Analyser · Coach · Meg** | Spillerens daglige verktøy |
| **PlayerHQ Live** `/portal/(fullscreen)/live` | lyst | isolert fullskjerm (brief→active→summary) | Gjennomføre økt |
| **AgencyOS** `/admin` | mørkt | **sidebar fra `lib/admin-nav.ts` — 6 seksjoner** (under) | Coachens kontrolltårn |
| **Forelder** `/forelder` | lyst | egen sidebar (10) | Innsyn i barnets status |

**AgencyOS sidebar-seksjoner (én kilde, `src/lib/admin-nav.ts:79–231`):** Daglig (Oversikt, Min uke) ·
Stall & talent (Spillere, Grupper, Talent) · Operasjon (Workbench, Planlegge, Gjennomføre) · Analyse
(Stall-analyse, Lag-snitt, Tester, Runder, Compliance, Reach, Rapporter) · Innboks (Forespørsler,
Godkjenninger, Meldinger) · System (Økonomi, Team, Integrasjoner, AI-agenter, E-postmaler, Audit,
Innstillinger).

**Dødkode-rester (orphan, ingen importerer):** `src/components/portal/live-okt/` (3 filer),
`src/components/shared/mobile-bottom-nav.tsx` (gammel Tren/Kalender/Mål-IA), `player-home.tsx`,
`live/[sessionId]/active/actions.ts` (duplikat).

---

## 2. Bekreftede funn (fil+linje) — A–E re-verifisert + M/D-status

### A. Rute-konsolidering / skyggekode — **fortsatt ÅPEN** (mekanisk)
Redirectene i `next.config.ts` finnes, men de levende skyggefilene er IKKE slettet:
- `src/app/admin/facilities/page.tsx` (15 KB) + `admin/locations/page.tsx` (11 KB) — `next.config.ts:55–57` (M1 ÅPEN)
- `src/app/portal/tren/kalender/page.tsx` + `kalender-interaktiv.tsx` (561 l) — `next.config.ts:86` (M2 ÅPEN)
- `src/app/portal/trackman/[sessionId]/*` — `next.config.ts:92` (M3 ÅPEN)
- `src/app/admin/analytics/page.tsx` (28 KB) — `next.config.ts:47` (M4 ÅPEN)
- `portal/stats` + `portal/analyse`-stubs gjenstår (M5 DELVIS — innsikt/profil/coach/notater slettet)
- `admin/queue` (live) vs `admin/oppfolging` (alias) — ingen redirect; **begge nå nav-foreldreløse** (M7 ÅPEN)

### B. Navigasjonslaget (AgencyOS) — **i hovedsak LØST, to rester**
- ✅ Én delt kilde: `src/lib/admin-nav.ts` driver desktop-sidebaren (`agencyos-sidebar.tsx:8,44`). Død
  `admin/sidebar.tsx` + `mobile-drawer.tsx` slettet (commit b65569ae). (B1/M6/D1 LØST)
- ✅ 11 av 13 tidligere desktop-usynlige ruter er nå i sidebaren (økonomi `admin-nav.ts:221`, team :222,
  integrasjoner :223, agents :224, email-templates :225, audit :226, runder :188, compliance :189 …).
  Drift/økonomi nås fra desktop på **1 trykk**.
- ✅ Fanenav rendres: `admin/agencyos/_tab-nav.tsx:6–13` (I dag·Live·Uka·Spillere·Økonomi·Caddie) via
  `agencyos/layout.tsx:9` — men kun for `/admin/agencyos/*`-undertreet.
- 🟠 **Mobil-nav er IKKE samlet med desktop:** `agencyos-mobile-nav.tsx:32` har egen hardkodet 5-fane-
  liste (Oversikt·Stall·Kalender·Innboks·Mer), leser IKKE `admin-nav.ts`. Filens egen kommentar
  (`admin-nav.ts:30`) hevder «én kilde for desktop OG mobil» — **ikke sant i koden**.
- 🟠 **4 ruter fortsatt kun ⌘K på desktop:** `tilstander`, `organisasjon`, `kommunikasjon`, `klubb`
  (ikke i `admin-nav.ts`).

### C. Dobbeltimplementasjon (Live) — **LØST**, men ny inngangs-regresjon (se D under)
- ✅ `live-shell.tsx`-monolitten slettet; Live er rute-splittet `page.tsx:48–58` (status-router) →
  `/brief`,`/active`,`/summary`; `/logger` slått til `/active` (D2 LØST).
- 🔴 **PAUSED/ABANDONED fortsatt uløst:** `SessionStatusV2` (`schema.prisma:51–57`) har kun
  PLANNED/IN_PROGRESS/COMPLETED/CANCELLED/SKIPPED. `LiveActive.tsx:50,109` pause = ren klient-state,
  ingen persistens. Avbrutt økt henger **IN_PROGRESS for alltid** (`actions.ts` har ingen abandon-skriving).

### D. 🔴 NY REGRESSION — spiller kan ikke starte dagens økt (P0, høyest frekvens)
KimiCode-mergen koblet hovedinngangen feil:
- `/portal` → `TodayCard.tsx:113` «Start dagens økt» → `session.href`, satt i `portal/actions.ts:217`
  til **`/portal/gjennomfore/${id}`**.
- `/portal/gjennomfore/[id]/page.tsx` er en **ren leseside** (egen kommentar linje 5–7) — eneste knapper
  «Kontakt coach» + «Se i planen» (linje 124–131). **Ingen lenke inn i `/portal/live`.**
- Gjennomføre-fanen samme: `gjennomfore-data.ts:90` `startHref → /portal/gjennomfore/${id}`.
- De eneste fungerende inngangene til `/portal/live/[id]` er gamle Spor A-flater (`tren/[sessionId]/
  page.tsx:204`, `sesjon-detalj.tsx:100`, `dagens-fokus-card.tsx:111`) — ikke hovedknappen.
- **Konsekvens:** en vanlig spiller kan i praksis ikke starte økt fra hjem. Verre enn v2.0.

### D (Stripe) — **LØST**
Abonnement-hub leser `searchParams` (ok/cancelled) → banners + handlingsrad til alle 4 Stripe-skjermer
(`meg/abonnement/page.tsx:61–102`); `oppgrader` mailto fjernet; `cancel_url=?cancelled=1`
(`api/stripe/checkout/route.ts:97`); gjest→konto-bro på kvittering (`booking/kvittering/[bookingId]/
page.tsx:33–119`). (D4 LØST)

### E. Stats-imperiet — **ÅPEN**
Ingen `stats/layout.tsx`; PGA fortsatt 8 separate dirs; personlig-SG spredt. (D6 ÅPEN)

### M/D-status samlet
- **LØST:** M6, D1, D2, D4
- **DELVIS:** M5, D3 (innstillinger-parent konsolidert, 7+ subsider lever), D7 (footer montert, foreldreløse ikke løst), D10 (`(internal)` ADMIN-gated, men `/intern` kun login-gated + `team-gfgk` offentlig)
- **ÅPEN:** M1, M2, M3, M4, M7, D5, D6, D8, D9

---

## 3. Coach-/eier-arbeidsflyt (desktop) — verifisert

| Arbeidsflyt | Status | Trykk i dag | Fil:linje |
|---|---|---|---|
| **Alle spillere i alle grupper, én flate** | ✅ FINNES | **1** (sidebar «Spillere») | `admin/spillere/page.tsx:101` (findMany role=PLAYER, take 400) + `spillere-tabell.tsx` (HCP, SG-sparkline, status-dot, neste økt inline) |
| **— filtrer på gruppe** | 🟠 svakt | — | `spillere-tabell.tsx:65` filter er 3 HARDKODEDE bøtter (WANG/GFGK/Junior) via tekstmatch, ikke faktiske `Group` |
| **Bulk-tildeling til HEL gruppe** | 🟠 GAP | **~14** | `assign-plan-modal.tsx` + `assignPlanToPlayers` (`plans/[planId]/actions.ts:970`) tar en LISTE spiller-ID-er — men ingen «velg gruppe»-mål; man huker av enkeltvis. Test-tildeling per spiller (`tester/tildel/[spillerId]`) |
| **Se økter på tvers** | 🟠 DELVIS | 1 (navigerer bort) | Cockpit-timeline (`daily-brief-data.tsx:140` alle dagens bookinger) + Uka-grid (`agencyos/uka/page.tsx:39`) VISER alle spilleres økter — men kort er rene `<Link>` (`daily-brief-data.tsx:230`), **ingen inline-handling**. Inline finnes kun på innboks/fokus-kolonnen (`_cockpit-interactive.tsx:357,719`) og er klient-optimistisk (linje 17: «ingen server-mutasjon»). `sendOktFeedback` finnes (`actions.ts:562`) men kun fra detalj |
| Innlogging → cockpit | ✅ | 1 | auth-redirect → `/admin/agencyos` |
| Cockpit → økonomi/drift | ✅ | 1 | `admin-nav.ts:221` (ingen egen `/admin/drift` — dekkes av økonomi + agencyos/okonomi-fane) |

**Kjernen for deg som coach+eier:** Oversikten finnes (1 trykk, rik inline-status). De to tingene som
faktisk koster deg tid daglig — **tildele til en hel gruppe** og **handle på økter rett fra tvers-
visningen** — er ikke bygd ferdig. Byggeklossene finnes (`assignPlanToPlayers` tar allerede array;
`GroupMembership`-relasjonen finnes; `sendOktFeedback` finnes; inline-mønsteret finnes på innboks).

---

## 4. Spiller-arbeidsflyt (mobil) — verifisert

| Handling | Budsjett | I dag | Status | Fil:linje |
|---|---|---|---|---|
| App → start dagens økt | 2 | **brutt** | 🔴 | `TodayCard.tsx:113` → `portal/actions.ts:217` → leseside uten live-lenke |
| Start fra Gjennomføre-fanen | 2 | **brutt** | 🔴 | `gjennomfore-data.ts:90` samme leseside |
| Logg ett resultat i live | 1 | flertrykk per drill | ~ | `DrillLogger.tsx:134–165` (4 rep-tellere + fullfør — bevisst, ikke 1-trykk) |
| Avbryt økt trygt | persistert | mister data | 🔴 | ingen PAUSED/ABANDONED (`schema.prisma:51`) |
| Live-motoren i seg selv | — | virker | ✅ | brief→active→summary, timer, wake-lock, rep-logg |
| Bunn-nav | — | 5 faner | ✅ | `bottom-nav.tsx:21` Oversikt·Planlegg·Analyser·Coach·Meg (ingen «Gjennomføre»-fane) |

**Kjernen for spilleren:** Live-flaten er god, men **veien inn er brutt** — den viktigste daglige
handlingen virker ikke fra hjem. Dette er det mest haster å rette.

---

## 5. Prioritert tiltaksliste (trykk × frekvens · M=mekanisk / D=design · omfang S/M/L)

| # | Tiltak | Klasse | Hvorfor (trykk×frekvens) | Omfang | Berørte filer |
|---|---|---|---|---|---|
| **1** | 🔴 **Koble «Start dagens økt» inn i Live igjen** | D | Spillerens #1 daglige handling — nå brutt. Pek `TodayCard`/`gjennomfore` start-href til `/portal/live/[id]`, ELLER gi Gjennomføre-detaljsiden en ekte «Start økt»-knapp → live | **S–M** | `portal/actions.ts:217`, `gjennomfore-data.ts:90`, `gjennomfore/[id]/page.tsx` |
| **2** | **Bulk-tildeling til hel gruppe** | D | Coach+eier sparer ~14→~3 trykk hver planlegging. Bygg «velg gruppe → ekspander til medlemmer → tildel» på `assignPlanToPlayers` + `GroupMembership`. Gjelder plan + test + økt | **M** | `assign-plan-modal.tsx`, `plans/[planId]/actions.ts:970`, `grupper/[id]/page.tsx`, `tester/tildel/*` |
| **3** | **Inline-handling på økter-på-tvers** | D | Coach handler daglig fra oversikt uten å navigere bort. Gi timeline-/uke-kort inline «Gi feedback/Marker» (koble `sendOktFeedback`), server-koble innboks/fokus-handlingene | **M** | `agency-cockpit.tsx`, `_cockpit-interactive.tsx:17`, `daily-brief-data.tsx:230`, `agencyos/uka/page.tsx` |
| **4** | **PAUSED/ABANDONED-persistens i Live** | D | Hindrer datatap + hengende ACTIVE-økter. Utvid `SessionStatusV2` + abandon/resume-action | **M–L** | `schema.prisma:51` (+migrasjon m/ RLS), `live/[sessionId]/actions.ts`, `LiveActive.tsx` |
| **5** | **Fullfør én nav-kilde + rydd ⌘K-rester** | D | Mobil-coach får samme nav som desktop. La `agencyos-mobile-nav.tsx` lese `admin-nav.ts`; avgjør `tilstander/organisasjon/kommunikasjon/klubb` (inn i nav eller fjern) | **S–M** | `agencyos-mobile-nav.tsx:32`, `admin-nav.ts` |
| **6** | **M1–M4, M7 — slett skyggekode** | M | Null UX-risiko, gjør kartet lesbart. Slett facilities/locations/tren-kalender/trackman/analytics-skyggefiler; rydd queue/oppfolging | **S** | se A over + `next.config.ts` |
| **7** | **Dynamiske gruppe-filter på /admin/spillere** | D | Eier med flere grupper trenger ekte grupper, ikke 3 faste bøtter | **S** | `spillere-tabell.tsx:65`, `spillere/page.tsx:68` |
| **8** | **Prod-sikkerhet: gate `/intern` (ADMIN) + `team-gfgk`** | M | `team-gfgk` er offentlig nå; `/intern` kun login-gated | **S** | `proxy.ts:111`, ev. `intern/layout.tsx` |
| **9** | D3 innstillinger-subsider · D5 coach-verktøy→/admin · D6 stats-faner · D7 marketing-foreldreløse · D8 analyse-faner · D9 forelder-trim | D | Lavere frekvens — rydd etter topp-8 | M hver | se v2.0 Del 4 |

---

## 6. Åpne spørsmål til deg (Anders)

1. **Player-entry (P0):** Bekrefter du at dette skal fikses umiddelbart (egen liten PR), eller skal det
   inn i en større live-opprydding sammen med PAUSED/ABANDONED (#1+#4)?
2. **Bulk-tildeling:** Skal «tildel til hel gruppe» gjelde **plan, test OG økt** — og er gruppe-valg
   (ikke spiller-avhuking) den primære coach-flyten du vil ha? Skal det også kunne tildele til flere
   grupper samtidig?
3. **Gruppe-modell:** Vil du at /admin/spillere skal vise **alle faktiske grupper** som filter (ikke
   bare WANG/GFGK/Junior)? Hvor mange aktive grupper har du i praksis?
4. **⌘K-rester:** `tilstander`, `organisasjon`, `kommunikasjon`, `klubb` — bruker du noen av dem? (Inn i
   sidebaren, eller fjern.)
5. **queue vs oppfolging:** Begge er nå usynlige i nav. Hvilken vil du beholde som «oppfølgingskø», og
   skal den tilbake i sidebaren?
6. **Coach-verktøy i spillerportalen (D5):** OK å fjerne `portal/coach/{ovelser,plans/perioder,ny-okt}`
   + `portal/{reach,spiller,agent-pipeline}` (du jobber i `/admin` uansett)?
7. **Mobil for coach:** Hvor mye jobber du fra mobil i AgencyOS? (Avgjør om #5 mobil-nav-paritet er
   høy eller lav prioritet.)

---

*Baseline: `docs/ux-arkitektur.md` v2.0 + vedlegg `docs/ux/01–04`. Restanse utenom skjermer:
`docs/restanse-review-2026-06-13.md`. Skjermstatus: `docs/MASTER-SKJERMPLAN.md`.*
