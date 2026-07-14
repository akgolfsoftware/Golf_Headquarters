# UX-arkitektur — AK Golf Platform

> **Versjon 2.0** (12. juni 2026) — erstatter den tidligere v1.0. Forskjellen: v2.0 er bygd på
> faktisk kodelesing av alle ~403 `page.tsx`-filer, trykk telt i koden, og egen verifikasjon av
> strukturpåstander (`next.config.ts`-redirects, døde nav-komponenter, dobbeltimplementasjoner) —
> ikke anslåtte tall.
>
> **Hva dette er:** Én beslutningsklar plan for hvordan hele plattformen skal henge sammen med
> færrest mulig skjermer og færrest mulig trykk. Hver beholdt skjerm har en eksistensbegrunnelse;
> ingen skjerm fjernes uten at innholdet flytter et dokumentert sted.
>
> **Ingen kodeendringer er gjort.** Dette er kartet, ikke jobben. Du skal kunne si «kjør punkt 1–3»
> rett fra Del 5.
>
> **Detaljerte rutetabeller** (Del 1, alle skjermer med 7 attributter) ligger i vedleggene:
> - [docs/ux/01-kartlegging-marketing-stats.md](ux/01-kartlegging-marketing-stats.md)
> - [docs/ux/02-kartlegging-playerhq.md](ux/02-kartlegging-playerhq.md)
> - [docs/ux/03-kartlegging-coachhq.md](ux/03-kartlegging-coachhq.md)
> - [docs/ux/04-kartlegging-forelder-auth-live.md](ux/04-kartlegging-forelder-auth-live.md)
>
> **Designfilosofi som styrer alt:** **(1)** Minst mulig trykk — hver kjernehandling har et
> trykkbudsjett, hvert trykk over er et funn. **(2)** Hver skjerm må forsvare sin eksistens. **(3)**
> Logikk i alt — brukeren skal aldri lure på hvor hen er, hva hen kan gjøre, hva som skjer ved trykk.
>
> Metode: 7 parallelle kartleggingsagenter (én per overflate-klynge) + egen verifikasjon.

---

## Sammendrag — de fem funnene som styrer alt

Plattformen har **god skjelett-arkitektur** men **frakoblet nervesystem**. De fleste kjerne-flytene
treffer trykkbudsjettet allerede i dag (se Del 2). Problemet er ikke at skjermene er feil — det er at
*navigasjonslaget* og *oppryddingen* henger etter beslutningene som allerede er tatt i koden.

**A. Rute-konsolideringen er halvferdig — strukturen er besluttet, skyggekoden er ikke ryddet.**
`next.config.ts` har ~50 redirects som allerede har valgt kanon-rutene (`analysere`, `kalender`,
`anlegg`, `spillere`, `innboks`, `godkjenninger`, `okonomi`). Men de gamle `page.tsx`-filene ligger
igjen og serveres aldri: `admin/facilities/page.tsx`, `admin/locations/page.tsx`,
`portal/tren/kalender/page.tsx`, `portal/trackman/*`, `admin/analytics/page.tsx`. Verifisert:
filene finnes, redirecten skygger dem. **Dette er mekanisk opprydding med null UX-risiko** — bare
slett skyggefilene. (`next.config.ts:37–140` har full lista.)

**B. Navigasjonslaget er den største UX-gjelden — tre konkrete brudd i AgencyOS.**
1. **To ulike sidebars som er uenige.** Desktop bruker `agencyos-sidebar.tsx` (et utvalg ruter),
   mobil bruker `mobile-drawer.tsx` (full liste). Den gamle `admin/sidebar.tsx` er **død** (importert
   ingensteds — verifisert). Resultat: 13 ruter (`okonomi`, `integrasjoner`, `agents`, `audit-log`,
   `email-templates`, `team`, `runder`, `tilstander`, m.fl.) er **usynlige på desktop**, kun nåbare via ⌘K.
2. **Fanenavet rendres ikke.** `src/app/admin/agencyos/_tab-nav.tsx` importeres ingensteds (verifisert
   — `agency-cockpit.tsx` laster den ikke). Fem ferdigbygde skjermer (`agencyos/live`, `/uka`,
   `/okonomi`, `/spillere`, `/caddie`) er dermed **uoppnåelige**.
3. **Hub-mellommenn sidebaren hopper forbi.** `stall`, `planlegge`, `gjennomfore`, `talent`,
   `organisasjon`, `kommunikasjon`, `analysere` er hub-sider som sidebaren ikke lenker til (den går rett
   til løvnodene). ~10 verktøy (`okter`, `teknisk-plan`, `trackman`, `recording`,
   `talent/discovery|kohort|region|ressurser`, `videoer`, `kapasitet`) er bare nåbare via en
   foreldreløs hub.

   PlayerHQ er motsatt sunt: 5-tabs bottom-nav er ren og konsistent. Men har sin egen variant av
   problemet — 8 foreldreløse innstillings-sider og en utilgjengelig Stripe-flyt (funn D).

**C. Kjernen er dobbeltimplementert flere steder.**
- **Live Session finnes i to versjoner på samme URL:** en monolitt (`live-shell.tsx`, 1755 linjer) og
  en rute-splittet variant (`/brief`, `/active`, `/summary` med ekte PAUSED/ABANDONED + autosave).
  Hovedinngangen treffer **monolitten**, som *ikke* persisterer pause/avbrudd → en økt som lukkes i
  ACTIVE henger som ACTIVE for alltid. Den gode flyten er praktisk talt foreldreløs.
- **TrackMan-detalj finnes 3 steder**, **SG-statistikk 3 steder**, **innstillinger i 3 IA-er**.
  (Detaljer i Del 3 + vedlegg 02.)

**D. Stripe-flyten har hull i begge ender** (forretningskritisk).
Gjestebooking lager ingen konto, men kvitteringen lenker til innlogget portal (`/portal/meg/bookinger`)
→ blindvei. Abonnement-cancel kaster spiller til marketing (`/coaching?cancelled=1`). Abonnement-hubben
fanger verken suksess (`?ok=1`) eller feilet betaling (`past_due`). Den *ekte* checkout-wizarden
(`oppgrader/flyt`) er foreldreløs — bare mailto-varianten er (knapt) nåbar.

**E. Stats-imperiet (45 skjermer) mangler navigasjonsskjelett.**
Ingen `layout.tsx`, ingen vedvarende nav. Hubben lenker til ~13 av 45; resten er foreldreløse. Den ene
nav-komponenten (`StatsCmdK`) er bygd men montert ingensteds. «For stort» er egentlig «for frakoblet».

**Konklusjon:** Den dyreste jobben er ikke å bygge eller fjerne skjermer — det er å **fullføre
beslutninger som allerede er halvveis tatt**: rydde skyggekode, slå sammen de to sidebarene, rendre
fanenavet, velge én live-implementasjon, og koble Stripe-flyten ende-til-ende.

---

## Del 1 — Kartlegging (sammendrag per overflate)

Fulle rutetabeller med alle 7 attributter (jobb · primærhandling · elementtetthet · trykkavstand ·
auth · datakilder · nav inn/ut) ligger i vedleggene. Her er bildet på tvers.

### Skjermtelling (faktiske `page.tsx`-filer, talt i koden)

| Overflate | Rute-rot | Filer | Auth-gate | Hovedsidebar/nav |
|---|---|---|---|---|
| **Marketing** | `(marketing)/*` (ekskl. stats) | 27 | Åpen | `marketing-header.tsx` + `marketing-footer.tsx` |
| **Stats** | `(marketing)/stats/*` | 45 | Åpen (2 auth-gated) | **Ingen** (arver marketing-chrome) |
| **PlayerHQ** | `portal/*` (ekskl. fullscreen) | 140 | `PortalShell` → PLAYER/COACH/ADMIN/GUEST | bottom-nav (5) + `sidebar.tsx` |
| **PlayerHQ Live** | `portal/(fullscreen)/*` | 9 | per-page `requirePortalUser` | **Ingen** (isolert fullskjerm) |
| **AgencyOS** | `admin/*` | 139 | `AdminShell` → ADMIN/COACH | `agencyos-sidebar.tsx` (desktop) + `mobile-drawer.tsx` |
| **Foreldreportal** | `forelder/*` | 11 | PARENT | `forelder/sidebar.tsx` (10) |
| **Auth/Onboarding** | `auth/*` `onboard/*` `inviter/*` | 14 | Åpen / token / rolle | — |
| **Diverse/intern** | `meg/*` `intern/*` `(internal)/*` `team-gfgk` `offline` | 18 | Blandet (se funn) | — |
| **Sum** | | **403** | | |

> **Viktig:** Av disse 403 er en betydelig andel (a) dynamiske detaljruter (`[id]`, `[slug]`) som er
> legitime, (b) redirect-stubs eller skyggekode som aldri serveres, eller (c) foreldreløse
> ferdig-bygde flater. «Antall navigasjonsflater en bruker faktisk møter» er langt lavere enn 403 —
> se Del 5 for før/etter-estimat.

### Per-overflate i én setning (eksistensbegrunnelse på hovedflatene)

**Marketing (27):** Selger Academy og driver booking. Kjerne-trakt (`/` → `/coaching` →
`/booking`) er sunn. **Men:** 7 sider er foreldreløse (`/junior`, `/priser`, `/cases`, `/suksess`,
`/faq`, `/blogg`, `/turneringer`) fordi den rike footeren lever i `forside.tsx` som ikke er montert som
side. `/cases/[slug]` er en garantert 404. Hele booking-trakta er gated bak `BOOKING_ACTIVE`-flagg.

**Stats (45):** SEO-bibliotek av enkeltsider uten skjelett (funn E). PGA-metrikker (8),
verktøy/kalkulatorer (6) og personlig-SG (3) er hver gruppe åpenbare faner-kandidater.

**PlayerHQ (140 + 9 live):** Spillerens verktøy. 5-tabs IA er ren. Men `next.config` redirecter
allerede `tren`→`planlegge`, `trackman`→`analysere`, `analyse`→`analysere` — mens skyggefilene
ligger igjen. Coach-forfatterverktøy (`coach/ovelser`, `coach/plans/.../ny-okt`) er feilplassert i
spillerportalen (dublett mot `/admin`). Innstillinger spredt på 9 sider, 8 foreldreløse.

**AgencyOS (139):** Coachens kontrolltårn. Mest komplette, mest frakoblede overflate (funn B).
~70 reelle ruter, men cockpit + desktop-sidebar eksponerer under halvparten.

**Foreldreportal (11):** Innsynsportal. Sunnest av alle — `/forelder` viser barnets neste økt på
**0 trykk** (budsjett truffet). `okonomi`/`fakturaer` er bevisst sammendrag+full, ikke dublett.

**Auth/Onboarding (14):** Solid. Rolle-basert redirect, GDPR-vergesamtykke, BankID. 7-stegs
onboarding (fasit har 5 — bevisst).

**Diverse (18):** `/meg` (Anders' personlige assistent) er separat fra `/portal/meg`. **Prod-flagg:**
`intern/komponenter/*` (7 sider) og `team-gfgk` mangler auth-gate; `test/[testId]/live` er en mockup
uten data lenket i prod.

---

## Del 2 — Brukerflyter med trykktelling

Trykk telt i faktisk kode (knapper / `Link href`). «Inngang» = app-åpning eller innlogging.
**Hovedfunn: de fire happy-path-flytene treffer budsjettet allerede.** Gjelden ligger i feilveiene.

### Flyt 1 — Spiller: åpne app → gjennomfør økt → oppsummering

**Trykkbudsjett:** app-åpning → start dagens økt: **maks 2**. Logg ett resultat: **1**.
**Faktisk: 2 ✓ og 1 ✓.**

```
APP-ÅPNING (/portal)
   │  [Start dagens økt]                     ← TRYKK 1   (player-home → /portal/live/[id])
   ▼
LIVE INTRO  (/portal/(fullscreen)/live/[id])    ← isolert fullskjerm, ingen chrome
   │  [Start økt] / Mellomrom                 ← TRYKK 2   (startSession: PLANNED → ACTIVE)
   ▼
ACTIVE ──[Logg rep]──► +1 resultat            ← 1 TRYKK pr. resultat ✓
   │                                             (auto-avansement når mål nådd)
   ▼
FERDIG → BETWEEN → SUMMARY
   │  [Lagre og avslutt] → completeSession
   ▼
/portal/tren/[id]  (eller /feiring/[planId])

FEILVEIER:
   • Tom plan        → drills.length===0 → «Ingen drills» + «Tilbake til plan»   ✓ håndtert
   • GRATIS-tier     → page-redirect → /portal/meg/abonnement                    ✓ håndtert
   • Avbrutt/PAUSED  → HER ER GJELDEN:
       – Rute-splittet flyt HAR ekte håndtering: startSession ser PAUSED→{paused},
         ABANDONED→/brief?avbrutt=1 (toast), resumeLiveSession leser snapshot.       ✓
       – MONOLITTEN (hovedinngangen) har den IKKE: «Avbryt» = ren <Link href="/portal/tren">.
         Ingen ABANDONED-skriving, ingen delvis-logg. Lukker du fanen henger økta ACTIVE.   ✗
       – Offline-banner i monolitten er kosmetisk («lagres lokalt» uten reell kø).           ✗
```

> **Inngangs-inkonsistens:** Fra Gjennomføre-fanen peker `startHref` til `/portal/gjennomfore/[id]`
> (ett ekstra hopp), ikke direkte til `/portal/live/[id]` som fra hjem. Rett opp → spar 1 trykk i den
> inngangen. (`src/lib/.../gjennomfore-data.ts`.)

### Flyt 2 — Coach: mandag morgen → oversikt → justering → publisering

**Trykkbudsjett:** oversikt → godkjent ett forslag: **maks 2**. Se enkeltspillers status: **maks 2**.

```
INNLOGGING → /admin → redirect → /admin/agencyos  (cockpit, 0 trykk)
   │
   ├─ Godkjenn forslag:
   │     cockpit «Åpne forespørsel» → /admin/foresporsler   ← TRYKK 1
   │     [Godta]                                            ← TRYKK 2   → 2 ✓
   │     (PlanAction-godkjenning: sidebar «Innboks»→Godkjenninger (1) → Godkjenn (1) = 2 ✓)
   │
   └─ Se enkeltspillers status:
         sidebar «Alle spillere» → /admin/spillere   ← TRYKK 1  (2 hvis gruppen må utvides)
         klikk spiller → /admin/spillere/[id]        ← TRYKK 2   → 2 ✓ / 3 ✗ (avhenger av sidebar-state)

FEILVEIER:
   • Desktop-coach når ALDRI okonomi/agents/integrasjoner/audit uten ⌘K (funn B1).            ✗
   • Justering → publisering bor i Workbench (sidebar «Workbench» = 1 trykk) ✓, men
     plan-kanban er statisk (drag-drop skjer i Workbench — bevisst, dokumentert).
```

> Happy-path treffer budsjettet. **Risikoen er reachability** (funn B), ikke trykktall.

### Flyt 3 — Forelder: innlogging → barnets status og neste økt

**Trykkbudsjett:** se barnets neste økt: **0 trykk — synlig direkte ved innlogging.**
**Faktisk: 0 ✓.**

```
INNLOGGING → (rolle PARENT) → /forelder
   │
   ▼
OVERSIKT viser umiddelbart:  KPI (3) + «Kommende» (booking + økt neste 7 dager)   ← 0 TRYKK ✓
   (oversikt.tsx fletter kommendeBookinger + kommendeOkter)

FEILVEIER:
   • Ikke PARENT            → layout requirePortalUser({allow:["PARENT"]}) → rolle-redirect    ✓
   • Mindreårig u/samtykke  → /auth/samtykke-venter + guardian-consent-token-flyt              ✓
   • Ingen barn koblet      → hentForelderOversikt → fokusBarn:null, KPI nullet                ✓
```

> Foreldreportalen er den best designede flyten i hele plattformen. Eneste merknad: 10 sidebar-
> oppføringer er tungt for en ren innsynsrolle (se konsolidering D9).

### Flyt 4 — Ny besøkende: landingsside → booking → betaling → onboarding

**Trykkbudsjett:** landing → betalt booking: **maks 5 skjermer.** **Faktisk: 4 app-skjermer ✓**
(+ Stripe-hosted side mellom bekreft og kvittering).

```
/booking (velg lokasjon)
   ▼ skjerm 1
/booking/[slug] (velg dag + ledig tid)
   ▼ skjerm 2
/booking/[slug]/bekreft (gjeste-skjema: navn/e-post/tlf)
   │ [Betal kr X →] → createBookingCheckout → Stripe Checkout (hosted)
   ▼ skjerm 3 (+ Stripe-side)
✔ /booking/kvittering/[bookingId]  (pending-refresh poller til webhook setter CONFIRMED)
   ▼ skjerm 4

FEILVEIER:
   • Feilet/avbrutt betaling → Stripe cancel_url → /booking/[slug] (tilbake til tid)   ✓
     Validerings-/checkout-feil → setError inline i bekreft-form                       ✓
   • ONBOARDING-BLINDVEI (funn D): gjestebooking lager INGEN konto. Kvitteringen lenker
     til /portal/meg/bookinger som krever innlogging gjesten ikke har.                 ✗
     → Mangler «opprett konto»-bro etter betalt booking.
```

> Skjerm-budsjettet er truffet. Den manglende biten er *broen fra betalt gjestebooking inn i
> portalen* — i dag stopper besøkende ved kvitteringen.

### Trykkbudsjett-oppsummering (faktisk i dag)

| Kjernehandling | Budsjett | Faktisk i dag | Status |
|---|---|---|---|
| Spiller: app → start dagens økt | 2 | 2 | ✓ |
| Spiller: logg ett resultat i Live | 1 | 1 | ✓ |
| Spiller: start økt fra Gjennomføre-fanen | 2 | 3 | ✗ (ekstra hopp) |
| Coach: oversikt → godkjent forslag | 2 | 2 | ✓ |
| Coach: se enkeltspillers status | 2 | 2–3 | ~ (sidebar-state) |
| Coach: nå System-flater på desktop | (≤2) | ∞ / kun ⌘K | ✗ (funn B1) |
| Forelder: se barnets neste økt | 0 | 0 | ✓ |
| Besøkende: landing → betalt booking | 5 skjermer | 4 skjermer | ✓ |
| Besøkende: betalt booking → inn i portal | (sømløs) | blindvei | ✗ (funn D) |

---

## Del 3 — Gap-analyse

### Blindveier (skjermer uten meningsfull vei videre)

| Skjerm | Problem | Fil |
|---|---|---|
| Gjestebooking-kvittering | Lenker til innlogget `/portal/meg/bookinger` — login-vegg for gjest | `(marketing)/booking/kvittering/[bookingId]/page.tsx:100` |
| Abonnement-cancel | `cancel_url` = `/coaching?cancelled=1` (marketing, ikke der bruker var) | `api/stripe/checkout/route.ts:98` |
| Monolitt-live «Avbryt» | `<Link href="/portal/tren">` uten ABANDONED-skriving → hengende ACTIVE | `live-shell.tsx:541` |
| `/admin/queue` + `/admin/oppfolging` | Identisk innhold, ingen utlenker, ikke i sidebar | `admin/queue/page.tsx` |
| `/admin/brief` | Full morgenbrief, men cockpit har egen inline-brief; kun nåbar via ⌘K | `admin/brief/page.tsx` |
| `/portal/analysere/hull` | Ren lese-flate, ingen CTA/utlenke; sidebar leder hit | `portal/analysere/hull/page.tsx` |
| `/portal/mal/baner` | Placeholder «kommer i V2», klikkbar fra `/portal/mal:157` | `portal/mal/baner/page.tsx:16` |
| `/blogg/[slug]`, `/cookies`, `/personvern` | Ingen interne utlenker / konverterings-CTA | marketing |
| Stats-detaljsider (`[slug]`) | Ingen lenker til søsken; krever nettleser-tilbake hver gang | stats |

### Foreldreløse sider (ruter ingen navigasjon peker til)

**Bygd, ferdig, men uoppnåelig fra UI** — de største blokkene:

- **AgencyOS-fanesett (5):** `agencyos/live`, `/uka`, `/okonomi`, `/spillere`, `/caddie` — fordi
  `_tab-nav.tsx` ikke rendres (verifisert).
- **AgencyOS desktop-foreldreløse (13):** `okonomi`, `integrasjoner`, `agents`, `audit-log`,
  `email-templates`, `team`, `runder`, `tilstander`, `kommunikasjon`, `organisasjon`, `analysere`,
  `klubb/innstillinger` — nåbare på mobil-skuff, usynlige på desktop-sidebar (funn B1).
- **AgencyOS hub-foreldreløse (~10):** `okter`, `teknisk-plan`, `trackman`, `recording`,
  `talent/discovery|kohort|region|ressurser`, `workspace/prosjekter`, `videoer`, `kapasitet` — bak en
  foreldreløs hub.
- **AgencyOS helt isolert:** `queue`, `oppfolging`, `brief`, `recording`, `locations`,
  `stats/overview`, `stats/moderering`, `reach`, `hjelp`, `godkjenn-portal/*`.
- **PlayerHQ innstillinger (8):** `meg/innstillinger/{anlegg,eksport,okter,personvern,sikkerhet,
  sprak,varsler}` + `meg/sikkerhet` — parent-siden reimplementerer innholdet inline og lenker ikke til dem.
- **PlayerHQ Stripe (4):** `meg/abonnement/{avbestill,faktura/[id],kort/ny,oppgrader/flyt}` — den
  ekte checkout-wizarden er 100 % utilgjengelig fra abonnement-hubben.
- **PlayerHQ ferdigbygde, ubrukte:** `reach`, `spiller/[spillerId]`, `agent-pipeline`,
  `booking/anlegg/[anleggId]`, `coach/sporsmal/[id]`, `onskeligokt` (ingen synlig Link).
- **Live rute-splittet flyt:** `/active`, `/logger`, `/summary`, `/tapper` — entry-knapper går til
  monolitt-roten, ikke hit (funn C).
- **Marketing (7):** `/junior`, `/priser`, `/cases`, `/suksess`, `/faq`, `/blogg`, `/turneringer`.
- **Stats (~12):** `leaderboards`, `uka`, `sok`, `tour/[slug]`, `quiz`, `min-progresjon`,
  `wrapped/[slug]`, `pga/putt-explorer`, `verktoy/{avstand,score-til-hcp,whs-kalkulator}`, `2026`.

### Manglende tom-/feiltilstander (sjekket i komponentkode)

| Sted | Mangler | Fil |
|---|---|---|
| Abonnement-hub | Leser ikke `?ok=1` → ingen bekreftelse etter checkout | `portal/meg/abonnement/page.tsx` |
| Abonnement-hub | Ingen «betaling feilet»/`past_due`-tilstand → spiller mister tilgang uten forklaring | samme + `api/stripe/webhook/route.ts:115` |
| Booking-reschedule | Redirecter med `?error=…` men hub leser ikke `searchParams` → feil vises aldri | `portal/meg/bookinger/page.tsx` |
| Monolitt-live | PAUSED/ABANDONED kun reducer-flag, ingen persistens | `live-shell.tsx:199` |
| `stats/moderering` | Bygd på hardkodet `STUB_*`-data — falske turneringer i prod | `admin/stats/moderering/page.tsx` |
| `admin/tilstander` | Hardkodede spillernavn (bryter navne-kanon Øyvind Rohjan) | `admin/tilstander/page.tsx` |
| `godkjenninger/[id]` | Fallback til hardkodet eksempel-data hvis ingen PlanAction | `admin/godkjenninger/[id]/page.tsx` |
| `test/[testId]/live` | Statisk mockup uten data/auth, lenket i prod | `portal/(fullscreen)/test/[testId]/live/page.tsx` |
| PlayerHQ talent | `talent`, `roadmap`, `mitt-niva` viser statisk/demo uten ærlig tom-tilstand | `portal/talent/*` |

> **Positivt:** De fleste list-sider HAR `EmptyState` (runder, trackman, sg-hub, tester, drills,
> fys/teknisk-plan, milepaeler). Booking- og turneringssidene i marketing har forbilledlige
> tom-tilstander. Foreldreportalen håndterer «ingen barn».

### Navigasjonsinkonsistens PlayerHQ vs AgencyOS

| Dimensjon | PlayerHQ | AgencyOS | Funn |
|---|---|---|---|
| Mobil-nav | Ren 5-tabs bottom-nav | Mobil-skuff (full liste) | Ulik modell |
| Desktop-nav | Sidebar matcher bottom-nav + barn | `agencyos-sidebar` (utvalg) ≠ mobil-skuff | **Desktop≠mobil i admin** (funn B1) |
| Død nav-kode | — | `admin/sidebar.tsx` (ubrukt) | Slett |
| Hub-mønster | Ingen mellommenn (tabs inline) | Hub-sider sidebaren hopper forbi | **Inkonsistent** (funn B3) |

### Mobilflyt (primærhandling nåbar med tommel på 390px)

- **PlayerHQ:** ✓ bottom-nav fast nederst med `env(safe-area-inset-bottom)`; `min-h-14`-touch-mål.
- **AgencyOS:** ~ mobil-skuff dekker mer enn desktop, men er hovednavet på liten skjerm — paradokset
  er at *mobil* er mer komplett enn *desktop* her.
- **Foreldre:** ✓ `ForelderMobileNav`.
- **Live:** ✓ isolert fullskjerm, tap-mål store (range-tapper).

### Dupliserte UI-mønstre som burde vært delt komponent

- **Marketing:** `SectionEyebrow`/`SectionH2`/`Em` re-deklarert i ≥6 filer; «closing CTA forest-
  gradient»-blokk klippet-og-limt i 6 sider; `MarketingHero` finnes men brukes ikke overalt.
  `const CASES` duplisert i `cases` + `suksess`.
- **PlayerHQ:** tre statistikk-flater, tre TrackMan-detaljer, tre innstillings-IA-er (se Del 4).
- **AgencyOS:** to håndvedlikeholdte nav-lister (sidebar + drawer) — samme data, to kilder.
- **Stripe:** to oppgraderingsveier (mailto vs ekte checkout).
- **Live:** to fulle implementasjoner av samme økt-flyt.

### Designsystem-avvik (mot `.claude/rules/design-porting-gate.md` + `docs/design-system-lint.md`)

Designsystemet håndheves av ESLint (`no-restricted-syntax`: hardkodet hex, off-grid spacing,
`font-serif`). De strukturelle funnene over er IA-avvik, ikke token-avvik — token-disiplinen er i
hovedsak intakt (warn-scope, ~320 kjente drift-warnings under opprydding). De konkrete
*innholds*-avvikene som bryter prosjektregler: hardkodede demonavn i `admin/tilstander` (navne-kanon),
stub-data i `stats/moderering` («aldri liksom-tall»). Disse er ført som tom-/feiltilstand-funn over.

> Merk: regelfila Anders refererte til (`.claude/rules/design-system.md`) finnes ikke — den faktiske
> designsystem-fasiten er CLAUDE.md-tokenseksjonen + `docs/design-system-lint.md` +
> `.claude/rules/design-porting-gate.md`. Vurdert mot disse.

---

## Del 4 — Konsolideringsanalyse (kjernen)

Vurdert mot sammenslåingskriteriene. **Slå sammen** når skjermen er navigasjonsmellommann, har <3
meningsfulle elementer, alltid brukes i sekvens, er delmengde av en annen, eller deler persona+modus+
kontekst. **Aldri** når auth-nivå skiller, mental modus skiller (planlegging vs gjennomføring — Live
forblir isolert fullskjerm uansett), eller sammenslåingen gir >1 primærhandling på mobil.

Kandidatene er sortert i to klasser: **(M) mekanisk opprydding** (beslutning allerede tatt i
`next.config.ts` — bare slett skyggekode, ~0 risiko) og **(D) designbeslutning** (krever et valg).

### Klasse M — mekanisk opprydding (besluttet, ikke utført)

| # | Skjermer | Tiltak | Effekt | Berørte filer | Risiko |
|---|---|---|---|---|---|
| M1 | `admin/facilities`, `admin/locations` | Slett skyggefiler — `next.config:55–57` redirecter begge → `/admin/anlegg` (anlegg er kanon) | rydder 3-veis navforvirring | `admin/facilities/`, `admin/locations/` | Lav |
| M2 | `portal/tren/kalender` | Slett skyggefil — `next.config:86` redirecter → `/portal/gjennomfore?tab=kalender` | −1 skjult dublett | `portal/tren/kalender/page.tsx` | Lav |
| M3 | `portal/trackman/*` | Slett skyggefiler — `next.config:92` redirecter → `/portal/analysere?tab=trackman` | rydder TrackMan-forvirring | `portal/trackman/` | Lav |
| M4 | `admin/analytics` | Slett skyggefil — `next.config:47` redirecter → `/admin/analysere` (fila har full levende kode = dødvekt) | −1 forvirrende synonym | `admin/analytics/page.tsx` | Lav |
| M5 | `portal/{stats,analyse,innsikt,profil}` + `portal/coach/notater` | Slett redirect-stubs som `next.config` allerede dekker | rydder legacy | div. stubs | Lav |
| M6 | `admin/sidebar.tsx` | Slett — død komponent (importert ingensteds, verifisert) | − dødkode | `components/admin/sidebar.tsx` | Lav |
| M7 | `admin/queue` ↔ `admin/oppfolging` | Behold `oppfolging` (matcher design-URL), gjør `queue` → redirect | −1 død tvilling | `admin/queue/page.tsx` | Lav |

### Klasse D — designbeslutninger (krever valg)

#### D1 — AgencyOS: én delt nav-kilde (HØYEST verdi)
- **Skjermer:** løser 13 desktop-foreldreløse + 5 fanesett + ~10 hub-foreldreløse på én gang.
- **Nytt mønster:** én `lib/admin-nav.ts`-config som *både* `agencyos-sidebar.tsx` og
  `mobile-drawer.tsx` rendrer. Legg inn System-gruppe (Økonomi, Integrasjoner, Agenter, Audit,
  E-postmaler, Team, Klubb) + Analyse-utvidelse (Runder, Compliance, Reach). Rendre `_tab-nav.tsx` i
  cockpiten (eller ny `agencyos/layout.tsx`). Gjør gruppe-headere klikkbare til hub, ELLER løft de
  viktige løvnodene (okter, teknisk-plan, trackman, talent-undersider) inn som sidebar-barn og
  pensjoner hub-kortene.
- **Trykk spart:** ∞ → 1–2 for ~25 skjermer.
- **Berørte filer:** `components/admin/agencyos-sidebar.tsx`, `mobile-drawer.tsx`, ny `lib/admin-nav.ts`,
  `components/admin/cockpit/agency-cockpit.tsx`, `app/admin/agencyos/_tab-nav.tsx`.
- **Risiko:** Middels (sidebaren er fasit-portet; nav-struktur-endring må design-gates).

#### D2 — Live Session: velg én implementasjon
- **Skjermer:** monolitt (`live-shell.tsx`) vs rute-splittet (`/brief`,`/active`,`/summary`).
- **Nytt mønster:** behold **rute-splittet** (ekte PAUSED/ABANDONED/autosave via `actions.ts` +
  `liveSnapshot`); pek alle entry-lenker dit; slett monolitten. Slå `/active` + `/logger` til én
  (begge rendrer `LiveActive`).
- **Trykk spart:** 0 i happy-path, men **fjerner PAUSED-blindveien** (funn C) og ~1900 linjer dødkode.
- **Berørte filer:** `portal/(fullscreen)/live/[sessionId]/{page,live-shell}.tsx`, entry-lenker i
  `dagens-fokus-card.tsx`, `sesjon-detalj.tsx`, `live-intro-modal.tsx`, `tren/[sessionId]/page.tsx`,
  `workbench/day-view.tsx`.
- **Risiko:** Middels–høy (monolitten er hovedinngangen i dag; hele flyten må re-testes).
- **ALDRI:** konsolider live-flyten inn i en annen skjerm. Den skal forbli isolert fullskjerm.

#### D3 — PlayerHQ: innstillinger → én side med seksjoner
- **Skjermer:** behold `meg/innstillinger/page.tsx`; slett/redirect de 7 foreldreløse subpene +
  `meg/sikkerhet` + `innstillinger-accordion.tsx`.
- **Nytt mønster:** én scroll-side med `SetGroup`-seksjoner (Varsler/Integrasjoner/App/Personvern/
  Sikkerhet/Anlegg/Eksport) + bottom-sheets for redigering (mønsteret finnes alt inline).
- **Trykk spart:** 8 ruter → 0 ekstra; eliminerer 8 foreldreløse skjermer.
- **Berørte filer:** `app/portal/meg/innstillinger/{anlegg,eksport,okter,personvern,sikkerhet,sprak,
  varsler}/`, `app/portal/meg/sikkerhet/`, `components/portal/innstillinger/innstillinger-accordion.tsx`.
- **Risiko:** Lav (innhold dels reimplementert i parent; gjenbruk eksisterende `actions.ts`).

#### D4 — PlayerHQ: koble Stripe-flyten ende-til-ende
- **Skjermer:** abonnement-hub må *lenke til* de 4 foreldreløse Stripe-skjermene; fjern mailto-
  `oppgrader`, behold `oppgrader/flyt`.
- **Nytt mønster:** abonnement-hub med handlingsrad (Oppgrader / Endre kort / Avbestill / Fakturaer)
  + les `searchParams` (`ok=1`/`cancelled`/`past_due`) → bekreftelses-/feil-banner. Rett `cancel_url`
  → `/portal/meg/abonnement?cancelled=1`. Legg «opprett konto»-bro på gjestebooking-kvitteringen.
- **Trykk spart:** gjør 4 forretningskritiske betalingsskjermer nåbare; fjerner 2 blindveier.
- **Berørte filer:** `app/portal/meg/abonnement/page.tsx`, `.../oppgrader/page.tsx`,
  `api/stripe/checkout/route.ts`, `(marketing)/booking/kvittering/[bookingId]/page.tsx`.
- **Risiko:** Middels (ekte betaling; test webhook + redirect-vakter).

#### D5 — PlayerHQ: flytt coach-forfatterverktøy til AgencyOS
- **Skjermer:** `portal/coach/{ovelser,ovelser/ny,ovelser/[id]/rediger,plans/[planId]/ny-okt,
  plans/perioder}` (alle COACH/ADMIN-gated) + `portal/{reach,spiller/[spillerId],agent-pipeline}`.
- **Nytt mønster:** fjern coach-only forfatterverktøy fra spillerportalen (spilleren ser kun tildelt
  resultat, lese-visning). Coach jobber i `/admin/drills`, `/admin/plans`, `/admin/reach` som finnes.
  Fjerner auth-vegg-blindveien der spiller trykker «Øvelser»-kortet i coach-hubben.
- **Trykk spart:** coach-hub 8 → 6 kort; fjerner blindvei.
- **Berørte filer:** `app/portal/coach/{ovelser,plans/[planId]/ny-okt,plans/perioder}/`,
  `app/portal/{reach,spiller,agent-pipeline}/`, `coach/page.tsx:64`, `coach/layout.tsx`.
- **Risiko:** Middels (verifiser `/admin`-paritet før sletting).

#### D6 — Stats: faner + skjelett
- **Skjermer:** PGA-metrikker (8 → 1 med metrikk-tabs, deler alt `pga-kategori-page.tsx`); verktøy
  (6 → 1 med verktøy-velger); personlig SG (`sg-sammenlign`+`min-progresjon`+`sg-estimator` 3 → 1 med
  faner). Behold SEO-løvnoder (artikler, turneringsdetalj, spillerprofil, wrapped).
- **Nytt mønster:** legg på `stats/layout.tsx` med vedvarende nav (eller montér `StatsCmdK`); fiks
  brutt `sesong/2025`-lenke i hubben.
- **Trykk spart:** ~25 navigasjonsflater → ~6–8; −1 trykk per metrikk/verktøy-bytte.
- **Berørte filer:** `(marketing)/stats/pga/*`, `stats/verktoy/*`, `stats/{sg-sammenlign,min-
  progresjon}/`, ny `stats/layout.tsx`, `stats/page.tsx`.
- **Risiko:** Middels (bevar delbare resultat-URLer `/resultat/[id]`).

#### D7 — Marketing: monter footeren + fiks foreldreløse
- **Skjermer:** 7 foreldreløse (`junior`, `priser`, `cases`, `suksess`, `faq`, `blogg`, `turneringer`).
- **Nytt mønster:** den rike footeren lever i `forside.tsx` (ikke montert som side). Enten monter den,
  eller flytt lenkene til `marketing-footer.tsx`. Legg «Priser» i header (konverterings-kritisk). Slå
  `cases`+`suksess` → én «Resultater»-side (begge tynne, deler `const CASES`); fiks/fjern brutt
  `/cases/[slug]`-lenke. Vurder `faq` → akkordion på `/kontakt`.
- **Trykk spart:** gjør 7 sider nåbare; −2 ruter (cases+suksess→1, faq→0).
- **Berørte filer:** `components/marketing/{marketing-footer,marketing-header,forside}.tsx`,
  `(marketing)/{cases,suksess,faq}/`.
- **Risiko:** Lav.

#### D8 — PlayerHQ: fullfør «Analyse samlet»-konsolideringen
- **Skjermer:** master-plan sier «Analysere + TrackMan + Runder + SG = én flate med faner».
  `next.config` redirecter alt inn til `/portal/analysere?tab=…`, og `analysere-faner.tsx` har fanene
  — men rendrer dem som *parallell* implementasjon i stedet for å lenke til kanon-flatene
  (`mal/sg-hub`, `mal/runder`). Resultat: dobbel datakilde for SG/Runder/TrackMan.
- **Nytt mønster:** velg `mal/sg-hub` som kanonisk SG-flate; la analysere-fanen lenke INN dit.
  Slå `mal/statistikk` + `statistikk` + (redirectet) `stats` til ÉN. SG-hub sub-flater (6 ruter:
  conditions/equipment/strategy/yardage/benchmark/best-vs-now) → inline ekspanderbare kort / bottom
  sheet i `mal/sg-hub`.
- **Trykk spart:** −1 trykk per SG-underflate (6 → 0 ekstra); fjerner dobbel rendering.
- **Berørte filer:** `portal/analysere/analysere-faner.tsx`, `portal/mal/sg-hub/*`,
  `portal/{statistikk,mal/statistikk}/`.
- **Risiko:** Middels (noen sub-flater har egne actions/PDF-routes).

#### D9 — Foreldreportal: trim sidebar
- **Skjermer:** `okonomi` + `fakturaer` → én side med to faner (sammendrag + full historikk).
- **Trykk spart:** kortere sidebar (10 → ~8 oppføringer).
- **Berørte filer:** `forelder/{okonomi,fakturaer}/`, `components/forelder/sidebar.tsx`.
- **Risiko:** Lav.

#### D10 — Prod-sikkerhet: gate interne flater
- **Skjermer:** `intern/komponenter/*` (7), `team-gfgk`, `test/[testId]/live` (mockup).
- **Tiltak:** gate ADMIN (som `(internal)/*` allerede er) eller fjern fra prod-nav.
- **Risiko:** Lav (men sikkerhet — bør gjøres tidlig).

---

## Del 5 — Målbildet

### Navigasjonstre per overflate — FØR → ETTER

#### AgencyOS (størst endring)

```
FØR (desktop-sidebar viser ~24 av ~70 ruter; mobil viser flere; hubs hopper forbi):

  agencyos (cockpit) ──lenker kun──► foresporsler
  sidebar:  Oversikt · Stall · Talent · Workbench · Planlegge · Gjennomføre ·
            Analysere(utvalg) · Innboks · System(Rapporter,Admin)
  USYNLIG på desktop:  okonomi, integrasjoner, agents, audit-log, email-templates,
                       team, runder, tilstander, kommunikasjon, klubb, +5 fanesett,
                       +10 hub-løvnoder
  DØD:  admin/sidebar.tsx

ETTER (én delt nav-kilde; fanenav rendret; hubs pensjonert):

  agencyos (cockpit + fanenav: Live · Uka · Økonomi · Spillere · Caddie)
  sidebar (= mobil-skuff, fra lib/admin-nav.ts):
    Daglig      → Oversikt · Min uke · Oppgaver · Tildelt meg
    Stall       → Spillere · Grupper · Talent(radar,discovery,kohort,sammenligning,WAGR)
    Operasjon   → Workbench · Planlegge(plans,maler,drills,okter,teknisk,turneringer) ·
                  Gjennomføre(kalender,bookinger,anlegg,availability,services,trackman,recording,kapasitet)
    Analyse     → Stall-analyse · Lag-snitt · Tester · Runder · Compliance · Reach · Rapporter
    Innboks     → Forespørsler · Godkjenninger
    System      → Økonomi · Team · Integrasjoner · Agenter · E-postmaler · Audit-log · Innstillinger
  (Intern QA: godkjenn-portal, stats/overview → flyttet til /admin/intern/* eller fjernet)
```

#### PlayerHQ (sunt skjelett, rydd dybden)

```
FØR:  bottom-nav 5 tabs ✓  +  sidebar med 9 tren-barn + Meg med 9 innstillingssider (8 foreldreløse)
      + 3 statistikk-flater + 3 TrackMan-detaljer + coach-forfatterverktøy feilplassert

ETTER:  bottom-nav 5 tabs (uendret — Oversikt · Planlegg · Gjør · Analyser · Coach)
        Analyser  = én flate, faner (SG · Runder · TrackMan · Tester · Innsikt) → kanon-flatene
        Meg       = profil + abonnement(koblet Stripe-rad) + ÉN innstillingsside m/ seksjoner
        Coach     = Meldinger · Notater · Planer · Videoer · AI · Be om økt  (forfatterverktøy → /admin)
        Live      = ÉN rute-splittet flyt (isolert fullskjerm, ekte PAUSED/ABANDONED)
```

#### Marketing + Stats

```
FØR:  header(6) + montert footer(smal)  →  7 foreldreløse sider; forside.tsx(rik footer) ubrukt som side
      stats: 45 sider, ingen layout, hub lenker ~13

ETTER:  header + Priser;  footer = rik (montert);  cases+suksess→Resultater;  faq→/kontakt
        stats: stats/layout.tsx m/ nav;  PGA 8→1(tabs);  verktøy 6→1;  personlig-SG 3→1
```

### Antall skjermer: før → etter (estimat)

> Tellingen er `page.tsx`-filer. «Etter» fjerner skyggekode/redirect-stubs, slår sammen faner og
> kobler foreldreløse. Detaljruter (`[id]`/`[slug]`) som er legitime beholdes.

| Overflate | Før (filer) | Etter (estimat) | Hovedreduksjon |
|---|---|---|---|
| Marketing | 27 | ~24 | cases+suksess→1, faq→0 (D7) |
| Stats | 45 | ~22 | PGA/verktøy/SG-faner (D6) |
| PlayerHQ portal | 140 | ~105 | innstillinger 8→1, Stripe-koble, SG-sub 6→1, skyggekode (D3,D4,D8,M2,M3,M5) |
| PlayerHQ Live | 9 | ~5 | én implementasjon (D2) |
| AgencyOS | 139 | ~115 | skyggekode (M1,M4,M6,M7), hub-pensjon, QA→intern (D1) |
| Foreldreportal | 11 | ~10 | okonomi+fakturaer→1 (D9) |
| Auth/onboarding | 14 | 14 | (uendret — sunt) |
| Diverse/intern | 18 | ~12 | gate/fjern intern (D10) |
| **Sum** | **403** | **~307** | **~96 skjermer (−24 %)** |

> Reduksjonen er konsentrert i navngitte sammenslåinger, ikke spredt sletting. Ingen skjerm fjernes
> uten at innholdet flytter et dokumentert sted (se D1–D10/M1–M7).

### Trykkbudsjett-tabell: i dag → etter målbildet

| Kjernehandling | Budsjett | I dag | Etter |
|---|---|---|---|
| Spiller: app → start dagens økt | 2 | 2 ✓ | 2 ✓ |
| Spiller: start fra Gjennomføre-fanen | 2 | 3 ✗ | 2 ✓ (rett `startHref`) |
| Spiller: logg ett resultat | 1 | 1 ✓ | 1 ✓ |
| Spiller: avbryt økt trygt (PAUSED) | (persistert) | mister data ✗ | persistert ✓ (D2) |
| Coach: oversikt → godkjent forslag | 2 | 2 ✓ | 2 ✓ |
| Coach: se enkeltspillers status | 2 | 2–3 ~ | 2 ✓ (D1) |
| Coach: nå System-flate på desktop | ≤2 | ∞ ✗ | 1–2 ✓ (D1) |
| Forelder: barnets neste økt | 0 | 0 ✓ | 0 ✓ |
| Besøkende: landing → betalt booking | 5 skj. | 4 ✓ | 4 ✓ |
| Besøkende: booking → inn i portal | sømløs | blindvei ✗ | konto-bro ✓ (D4) |
| Spiller: endre abonnement (Stripe) | nåbar | foreldreløs ✗ | 1–2 ✓ (D4) |

### Maks 5 prioriterte endringer (rangert: trykk spart × bruksfrekvens)

> Rangering veier hvor mange brukere×ganger handlingen treffes mot hvor mye den forbedres.
> Omfang: S = liten (timer), M = middels (dag), L = stor (flere dager).

**1. D1 — AgencyOS: én delt nav-kilde + rendre fanenav.**
Hvorfor: coach bruker dette daglig; 13 desktop-foreldreløse + 5 fanesett + 10 hub-løvnoder løses i ett
grep. Største reachability-gevinst i hele plattformen.
Berørte: `agencyos-sidebar.tsx`, `mobile-drawer.tsx`, ny `lib/admin-nav.ts`, `agency-cockpit.tsx`,
`_tab-nav.tsx`. Slett `admin/sidebar.tsx`. **Omfang: L.**

**2. D4 — PlayerHQ: koble Stripe-flyten + onboarding-bro.**
Hvorfor: direkte inntekt. Den ekte betalingsflyten er fullt bygd men 100 % utilgjengelig; cancel kaster
spiller ut; gjestebooking ender i blindvei. Lav frekvens, men maksimal konsekvens per hendelse.
Berørte: `portal/meg/abonnement/page.tsx`, `oppgrader/page.tsx`, `api/stripe/checkout/route.ts`,
`booking/kvittering/[bookingId]/page.tsx`. **Omfang: M.**

**3. D2 — Live Session: velg rute-splittet, fiks PAUSED/ABANDONED.**
Hvorfor: spillerens mest brukte handling; dagens hovedinngang mister data ved avbrudd og etterlater
hengende ACTIVE-økter. Fjerner ~1900 linjer dødkode samtidig.
Berørte: `live-shell.tsx` (slett), entry-lenker (5 filer), behold rute-splittet flyt. **Omfang: L.**

**4. M1–M7 — Mekanisk skyggekode-opprydding.**
Hvorfor: null UX-risiko, høy ryddegevinst — beslutningene er allerede tatt i `next.config.ts`. Fjerner
`facilities`/`locations`/`tren/kalender`/`trackman`/`analytics`-skyggefiler + død `admin/sidebar.tsx` +
`queue`-tvilling. Gjør resten av kartet lesbart.
Berørte: se M1–M7-tabellen. **Omfang: S.**

**5. D3 — PlayerHQ: innstillinger → én side med seksjoner.**
Hvorfor: 8 foreldreløse sider + 3 konkurrerende innstillings-IA-er → én ryddig flate. Middels frekvens,
stor ryddegevinst, lav risiko.
Berørte: `portal/meg/innstillinger/*` (7 subpages), `meg/sikkerhet/`, `innstillinger-accordion.tsx`.
**Omfang: M.**

> Etter topp-5: D6 (stats-faner), D5 (flytt coach-verktøy), D7 (marketing-footer), D8 (analyse-faner),
> D9 (forelder-trim), D10 (gate intern) — alle lav–middels risiko, lavere frekvens.

---

## Vedlegg — fulle rutetabeller (Del 1 i detalj)

- [01 — Marketing + Stats](ux/01-kartlegging-marketing-stats.md)
- [02 — PlayerHQ (kjerne + Meg + Coach)](ux/02-kartlegging-playerhq.md)
- [03 — AgencyOS (admin)](ux/03-kartlegging-coachhq.md)
- [04 — Foreldreportal + Auth + Live Session + diverse](ux/04-kartlegging-forelder-auth-live.md)
