# AK Golf HQ — designgrunnlag (kode-verifisert 2026-06-29)

> Globalt grunnlag for skjerm-for-skjerm redesign. Per-skjerm-detaljer ligger i flate-filene (`10`–`50`). Hver påstand er fil:linje-verifisert eller merket `UVERIFISERT`.

## 0. Toppsammendrag
- **Stack:** Next.js 16 (App Router, proxy-middleware), React 19, Prisma 7 + Supabase (Postgres), Tailwind v4 (`@theme` i `globals.css`, ingen `tailwind.config`), shadcn/ui. Inter / Inter Tight / JetBrains Mono.
- **Flater (5):** Marketing `/` (lyst), PlayerHQ `/portal` (lyst), AgencyOS `/admin` (mørkt), Forelder `/forelder` (lyst), Auth `/auth` + diverse topp-nivå.
- **Antall skjermer:** **421 `page.tsx`** — portal 153 · admin 146 · marketing 72 (inkl. stats-underapp ~42) · forelder 11 · auth+misc ~35.
- **Dominerende designsystem:** terminal/lime-systemet med lime `#D1F843` som eneste aksent. AgencyOS mørk canvas retunet til varm nær-svart `#0A0B0A` (2026-06-28, `globals.css:61`). PlayerHQ/Marketing/Forelder lyst cream `#FAFAF7`.
- **Største designgjeld:** (1) **142 tsx-filer med hardkodet hex** utenfor tokens — verst i `(internal)/demos` + `onboard`-wizards. (2) **13 tsx-filer med emoji** (forbudt i UI). (3) Legacy **`CoachHQ`-rester** (13 filer, bl.a. `src/components/coachhq/`) ved siden av kanon-AgencyOS. (4) **ELITE-tier** lekker i type-unioner selv om dødt. (5) Konkurrerende Workbench-implementasjoner (`workbench/`, `workbench-hybrid/`, `coachhq/workbench/`, `portal/workbench/`).

## 1. Flater og ruter (struktur + antall — full enumerering i flate-filene)
| Flate | Rot | Tema | Ruter | Nøkkel-undertrær |
|---|---|---|---|---|
| Marketing | `src/app/(marketing)` | Lyst | 72 | rot + ~30 sider · **stats/** ~42 (arver marketing-layout, `UVERIFISERT` om foreldreløs) |
| PlayerHQ | `src/app/portal` | Lyst | 153 | `mal/` 24 · `tren/`+`(fullscreen)/` 27 · `meg/` ~40 · resten ~62 |
| AgencyOS | `src/app/admin` | Mørkt | 146 | flat `/admin` (ingen route-group, `admin/layout.tsx`) · agencyos/live/kalender, spillere/talent/tester/risiko, plans/workspace/teknisk-plan, drift |
| Forelder | `src/app/forelder` | Lyst | 11 | barn, bookinger, fakturaer, samtykke, ukerapport, varsler |
| Auth + misc | `src/app/auth` m.fl. | Blandet | ~35 | auth/* · `(internal)/demos` · `intern/komponenter` · `kommando` · `onboard` · `team-gfgk` · `dev-banekart` |

Foreldreløse/interne kandidater (verifiser i flate-fil): `(internal)/demos/*`, `intern/komponenter/*`, `dev-banekart` (midlertidig), `team-gfgk`, `meg` (topp-nivå, ikke `/portal/meg`).

## 2. Navigasjon per flate (lest fra nav-komponenten)
- **PlayerHQ bunnnav** (`src/components/portal/bottom-nav.tsx`): **Hjem** `/portal` · **Plan** `/portal/planlegge` · **Gjør** `/portal/gjennomfore` · **Analyse** `/portal/analysere` · **Meg** `/portal/meg`. (5 faner.) Sidebar/sub-nav: `src/components/portal/{sidebar,sub-nav,mobile-sidebar-drawer}.tsx`.
- **AgencyOS** (`src/components/admin/agencyos-sidebar.tsx:12`): 54px ikon-rail → 244px på hover; ordmerke «AgencyOS» (`:81`). Mobil: `agencyos-mobile-nav.tsx`; topbar: `agencyos-topbar.tsx`. `UVERIFISERT`: full faneliste i rekkefølge — les `agencyos-sidebar.tsx`.
- **Forelder** (`src/components/forelder/sidebar.tsx`): `UVERIFISERT` faneliste — les fila.
- **Marketing/stats:** marketing-header (`UVERIFISERT` fil). Stats arver marketing-layout (ingen egen `stats/layout.tsx`).

## 3. Designsystem og tokens
- **Kilde:** `src/app/globals.css` (`:root` lyst + `.dark` mørkt + `@theme inline`-mapping) speilet i `src/lib/design-tokens.ts`. **Én kanonisk kilde** (globals.css), men med **historiske aliaser** (`--t-*` terminal-stack, `--color-*` cockpit-tokens) som lever side om side.
- **Lyst (`:root`):** bg cream `#FAFAF7`, card `#FFFFFF`, ink `#0A1F17`, primary forest `#005840`, accent lime `#D1F843`, border `#E5E3DD`.
- **Mørkt (`.dark`, retunet 2026-06-28):** bg `#0A0B0A`, card `#171817`, border `#262725`, fg `#F0F0F0`, primary=lime. Data: up `#4FD08A` / down `#F0683E` / warn `#E8B43C` / info `#5AA9F0`.
- **Sprik:** «terminal-lys/lime» dominerer hele appen i dag; «heritage-grønn `#005840`» er primary-action-fargen i lyst tema (CTA/forest), ikke et konkurrerende system — men **forest-tonet mørk** (`#07100C`) er nettopp byttet ut, så eldre kode kan fortsatt referere forest-mørke `--color-*`-rails (sidebar-tokens `--color-coach-sidebar #0A1F17` står bevisst igjen, `globals.css:213`).
- **Fonter:** Inter + Inter Tight + JetBrains Mono lastet (`UVERIFISERT` eksakt `next/font`-konfig — sjekk `src/app/layout.tsx`).
- **Kvalitetsskann:** **142** tsx/jsx-filer med hardkodet hex (verst: `(internal)/demos/plan-bygger/[steg]` 51, `demos/ny-okt/[steg]` 39, `demos/newplan/[steg]` 30, `onboard/coach/coach-wizard` 28, `portal/tren/turneringer/[id]/turnering-client` 26, `onboard/klubb/klubb-wizard` 26). **13** filer med emoji (forbudt). Døde knapper / TODO / tilstands-skann: `UVERIFISERT` (kjør per flate-fil).

## 4. Komponentbibliotek
- `src/components/athletic/` — branded kjerne (Hero, Eyebrow, Card, KpiCard/KpiStrip, Badge, calendars/, data/shot-map). Sannhet for AK-DNA.
- `src/components/ui/` — shadcn-primitiver (ESLint-håndhevet).
- `src/components/{admin,portal,forelder}/` — flate-spesifikke (nav, shells, hero-er).
- `src/components/{shared,workbench,workbench-hybrid}/` — delt + planleggings-hub.
- **Duplikater/varianter (gjeld):** Workbench finnes i `workbench/`, `workbench-hybrid/`, `coachhq/workbench/`, `portal/workbench/`. Player-hero i både `coachhq/workbench/spiller-hero.tsx` og `portal/workbench/player-hero-v2.tsx` (begge med `Tier="...|ELITE"`). `UVERIFISERT` full dublett-kartlegging.

## 5. Gating
- **Abonnement:** `enum Tier { GRATIS, PRO, ELITE }` (`prisma/schema.prisma:24-27`). **ELITE er dødt** (CLAUDE.md + `booking-hub.tsx:93`) men **lekker i type-unioner** (`coachhq/workbench/spiller-hero.tsx:28`, `portal/workbench/player-hero-v2.tsx:27`) — skal fjernes fra UI-typer. Stripe-kobling: `UVERIFISERT` (sjekk `/portal/meg/abonnement/*` + `connect-src ... api.stripe.com`, `proxy.ts:51`).
- **Roller:** `enum UserRole { ADMIN, COACH, PLAYER, PARENT, GUEST }` (`schema:16`). Admin-tilgang via `AdminShell` i `admin/layout.tsx` (ikke route-group). CBAC/capability-gating brukt på admin finans/anlegg/bruker-sider (capability, ikke rolle-liste — jf. prosjekt-memory). `UVERIFISERT`: hvilke capabilities er definert men ikke håndhevet.

## 6. AK-domenet i UI (begrep → skjerm)
- **SG (OTT/APP/ARG/PUTT):** `/portal/mal/sg-hub` + `/portal/statistikk` + `/admin/analyse`/`lag-snitt`. **Dispersion/banekart:** `/portal/baneguide/*` (fase 1-5).
- **TrackMan:** `/portal/mal/trackman/*`, `/portal/trackman/[sessionId]`.
- **AK-formel økt-ID / pyramide (FYS/TEK/SLAG/SPILL/TURN) / L-faser:** Workbench (`/admin/coach-workbench`, `/portal/planlegge/workbench`) + plan-skjermer.
- **A–K nivå:** `/portal/talent/*`, admin spiller-flater.
- **Tester/PEI:** `/admin/tester/*`, `/portal/tren/tester`.
- `UVERIFISERT`: eksakt rendering av CS-nivå, M0–M5, PR1–PR5, P-posisjoner — kartlegges i flate-filene.

## 7. Konfliktrapport (løst mot koden)
1. **AgencyOS vs CoachHQ:** **AgencyOS er kanon** — 195 filer nevner det, sidebar-ordmerke «AgencyOS» (`agencyos-sidebar.tsx:81`). CoachHQ = legacy i 13 filer (bl.a. `src/components/coachhq/`) — skal bort fra ny UI.
2. **Coach-appens rute:** **flat `/admin`** — ingen route-group i `src/app/admin/`; vakthold via `AdminShell` i `admin/layout.tsx`.
3. **PlayerHQ nav-faner:** Hjem · Plan · Gjør · Analyse · Meg (`bottom-nav.tsx`) — se §2.
4. **PlayerHQ-tema:** **lyst cream** `#FAFAF7` — ingen `.dark` på portal-shell.
5. **Antall flater / Stats:** 5 flater + **Stats som halv-foreldreløs sub-app**. `(marketing)/stats/*` (45 ruter) har **eget designspor**: scoped `stats.css` med egne `--s-*`-tokens (`(marketing)/stats/stats.css:9-32`) + eget komponentbibliotek `src/components/stats/` (28 komp.) + egne `.dc.html` («Stats-plattform (eget spor)»). MEN ingen `stats/layout.tsx` (arver marketing-shell), og **ingen nav lenker dit** — `marketing-header.tsx:5`: «Stats og Turneringer ikke med i v1, aktiveres etter launch». Tiltenkt `StatsCmdK`-nav er ikke montert. Auth-grense uklar: `/stats/min-progresjon` + `/stats/sg-sammenlign/*` krever innlogging i offentlig marketing-flate (IA-spørsmål: hører personlig SG hjemme i PlayerHQ?). `--s-*` dupliserer globals' lyse HEX som egne aliaser.
6. **Auth-mekanisme:** **Supabase SSR i `src/proxy.ts`** (Next 16 proxy-middleware) via `updateSession` (`@/lib/supabase/proxy`). Leverandør: Supabase.

## 8. Redesign-prioritering
| Skjermgruppe | Flate | Prioritet | Hvorfor |
|---|---|---|---|
| `(internal)/demos/*`, `intern/komponenter/*` | Misc | **P3 / fjern** | Interne, 51+39+30 hardkodet hex — ikke produkt |
| Emoji-filer (13) + ELITE-type-lekkasje | Tvers | **P0** | Bryter låste regler — rask opprydding |
| AgencyOS cockpit/kalender/live | Admin | **P0** | Coachens daglige løkke; ny nær-svart canvas skal verifiseres |
| PlayerHQ kjerne (Hjem, analysere, mal/sg-hub, baneguide) | Portal | **P0** | Mest brukte spiller-flater |
| Workbench (begge) + dublett-konsolidering | Admin+Portal | **P1** | 4 konkurrerende implementasjoner |
| Marketing kjerne (/, priser, coaching, anlegg) | Marketing | **P1** | Salgsankere |
| Stats-underapp (~42) | Marketing | **P2** | Stor, men sekundær; avklar flate-status |
| Forelder | Forelder | **P2** | Liten, rolig; samtykke/faktura viktigst |
| Meg/innstillinger-undersider | Portal | **P3** | Mange tynne settings-skjermer |

> Full per-skjerm-prioritet i flate-filene. Denne tabellen grupperer.


## 9. Oppgaveflyter (kode-verifisert 2026-06-29)

> Ende-til-ende-flyter per rolle, verifisert mot dagens kode. Detaljert knapp-for-knapp-kartlegging av døde knapper i `docs/flyt-inventar/` (17. juni, ~94 døde knapper) — under er flytenes fullførbarhet + de kritiske blindveiene.

### Spiller — onboarding → plan
- Inngang: `completeOnboarding()` → `redirect("/portal")` (`auth/onboarding/actions.ts:211`).
- Sekvens: `/portal` → «Plan» (`bottom-nav.tsx:23`) → `/portal/planlegge` → `redirect("/portal/planlegge/workbench")` (`planlegge/page.tsx:16`).
- **Fullførbar: DELVIS.** Onboarding oppretter ingen plan/økt; fersk spiller får `planId = null` → **tom workbench** (`load-context.ts:33`). Ingenting dødt, men spilleren kan ikke gjøre noe før coach (eller AI-periodiser) lager en plan.

### Spiller — daglig økt (kjerne-loop)
- Inngang: hjem «Start dagens økt» rendres kun når `today` finnes (`HybridHomePage.tsx:357`).
- Sekvens: `/portal/live/[id]` (status-router `(fullscreen)/live/[sessionId]/page.tsx`) → brief «START ØKT» → active (`startSession()`) → «Logg rep» (DrillLogger) → «Fullfør drill/økt» (`completeSession()`) → `/portal/live/[id]/summary` → lukk → `/portal/planlegge`.
- **Fullførbar: JA — fullt koblet.** Forgrening: GRATIS-tier sendes til `/portal/meg/abonnement` (`active/page.tsx:22`). **Hull:** logging fanger KUN reps (`DrillLogger.tsx`) — ingen video/foto/notat (funksjonen finnes ikke, ikke en tom onClick).

### Spiller — fremgang/stats
- `/portal/mal/*` finnes (sg-hub, runder, statistikk). Runder-CTA + «Logg runde» → gyldige `/portal/mal/runder/*`.
- **Fullførbar: DELVIS.** To **døde lenker** på `/portal/analysere`: trackman-kort → `/portal/analysere/trackman/[id]` (404, ingen redirect, `HybridAnalysePage.tsx:455`) og tester-CTA → `/portal/analysere/tester` (404, kun `/tester/:id` redirectes, `:487`).

### Spiller — AI-tips → handling
- **Fullførbar: DELVIS.** AiCaddieCard på `/portal/analysere` er en **blindvei** (kun tekst, ingen CTA, `HybridAnalysePage.tsx:299-330`). `/portal/ai/foresla-drill`+`foresla-turnering` er **foreldreløse** (komponentene som lenker dit rendres ikke i noen live-rute). Eneste ekte tip→handling: `mal-bygger` → oppretter Goal → `/portal/mal`.

### Spiller — mål
- **Fullførbar: JA (opprettelse virker).** `/portal/mal` `NyGoalModal` → `createGoal()` → `prisma.goal.create`. **Men:** ingen mål-inngang fra hjem-siden (redesignet hjem dropper mål-CTAene; `GoalsProgress/TodayCard/QuickLinks` er foreldreløse). Nås via sidebar «Plan → Mål».

### Coach — innlogging → oversikt
- `/admin` (guard `requirePortalUser({allow:["ADMIN","COACH"]})`, `admin/layout.tsx:11`) → `redirect("/admin/agencyos")` cockpit.
- **Fullførbar: JA.** Alle cockpit-handlingslenker resolver til ekte ruter. Ingen døde knapper.

### Coach — bygg plan → publiser
- Workbench (`/admin/spillere/[id]/workbench`) → `publishWorkbenchPlan` → **PENDING_PLAYER** + varsel → spiller `godtaPlan` → ACCEPTED. Loop lukkes.
- **Fullførbar: JA.** Hull: «Lagre som mal» i plan-builder er **demo-stub** (`plan-builder-client.tsx:718`); `assignPlanToPlayers` lager **inaktiv DRAFT** (tildel ≠ aktiver, `[planId]/actions.ts:1048`); mal-detalj har ingen «bruk på spiller»-knapp (kun via Workbench).

### Coach — 360-profil
- `/admin/spillere/[id]` + faner (fremgang/plan/profil/tester/rediger/workbench), alle med ekte Prisma-data.
- **Fullførbar: JA.** Ingen døde knapper — hver CTA peker på eksisterende rute.

### Coach — agent-innboks
- Ekte innboks = `/admin/godkjenninger` (PlanAction). `acceptPlanAction`/`rejectPlanAction` + `acceptAndApplyPlanAction` skriver ekte planendringer + logger AgentRun.
- **Fullførbar: JA (godkjenn/avvis), DELVIS (rediger).** Ingen redigering av utkast før godkjenning; batch kun for `DRILL_SWAP`/`REST_DAY_ADD` (`approvals/actions.ts:74`). **Splittede innbokser:** godkjenninger + `/admin/drills/forslag` (CaddieDraft) + caddie — ikke unifisert.

### Coach — test-/dataregistrering
- **Fullførbar: NEI (coach kan ikke registrere testresultat).** Alle register-knapper er døde — eneste `testResult.create` er spiller-side. 3 døde knapper på `tester/[id]` (`tester-detail-actions.tsx:16,25,34`); `tester/page.tsx:199` «Registrer test» → `/admin/tester/tildel` (mangler page → 404). **TrackMan i admin er read-only** (filter-chips = toast-stubs `trackman-actions.tsx:10-13`); ekte import finnes kun spiller-side (`onBehalfOfUserId` finnes men er ikke koblet inn i noen /admin-skjerm).

### Forelder — innlogging → barnets fremgang
- PARENT login → `/portal` → `redirect("/forelder")` (`portal/page.tsx:18`) → `/forelder/barn` → `/forelder/barn/[childId]` (faner Oversikt/Uke/Mål/Økonomi).
- **Fullførbar: JA.** Alle 10 sidebar-lenker resolver. Mindre: mål-fremdrift er hardkodet 40 % plassholder (`[childId]/page.tsx:329`).

### Besøkende — landing → tilbud → Stripe
- Abonnement: `/coaching` `SubscribeButton` → POST `/api/stripe/checkout` (ekte Stripe `checkout.sessions.create`, `route.ts:93`).
- **Fullførbar: DELVIS.** Checkout er **gated bak innlogging** (401 → `/auth/signup?subscribe=`), og **`?subscribe=` droppes** av signup (`signup/page.tsx:13` leser kun `?epost=`) → en ekte ny besøkende kan ikke betale i én flyt. Booking er ekte Stripe + gjeste-vennlig, men bak `BOOKING_ACTIVE`-flagg (default ekstern Acuity, `booking/page.tsx:57`). Krever `STRIPE_PRICE_ID_*`-env.

### Auth — registrer → verifiser → onboard
- **Fullførbar: DELVIS.** Signup → (session? `/auth/onboarding` : `/auth/check-email`). **Ingen e-post-bekreftelse-handler** finnes (`verifyOtp` = 0 treff; eneste callback er Google OAuth). Fungerer kun rent hvis Supabase «Confirm email» er AV. `/onboard/coach` + `/onboard/klubb` er funksjonelle men **uten inngående lenke** (kun direkte-URL).

### Auth — logg inn
- **Fullførbar: DELVIS.** Login pusher alle til `/portal` (eller `next`). Rolle-ruting skjer i `/portal/page.tsx` (PARENT→/forelder, GUEST→/admin/kalender), men **COACH/ADMIN auto-rutes IKKE til `/admin`** — de lander på spiller-dashbordet (`portal/layout.tsx` har ingen rolle-guard). Apple-OAuth er død kode (aldri rendret).

### Auth — glemt passord
- **Fullførbar: JA.** `resetPasswordForEmail` → `/auth/reset-password` → `updateUser({password})` → `/portal`.

### Blindveier (må løses i redesign)
1. **Spiller-hjem:** mål-CTAer foreldreløse; AiCaddieCard tekst-blindvei.
2. **`/portal/analysere`:** trackman-detalj + tester-indeks → 404.
3. **`/portal/ai/*`:** ingen spiller-vendt inngang (foreldreløse).
4. **Live-logging:** kun reps, ingen video/foto/notat.
5. **Coach test-registrering:** 3 døde knapper på `tester/[id]` + `tester/tildel` 404; TrackMan-import ikke koblet i admin.
6. **`assignPlanToPlayers`:** tildeling lager inaktiv DRAFT (forventning «tildel = aktiv»?).
7. **Besøkende betaling:** `?subscribe=` droppes → kan ikke betale i én flyt; booking bak flagg.
8. **Auth:** ingen e-post-bekreftelse-handler; COACH/ADMIN ikke auto-rutet til /admin; `/onboard/*` uten inngang.
9. **~94 døde knapper totalt** — full liste i `docs/flyt-inventar/`.


## 10. Avviks- og spec-revisjon (kode-verifisert 2026-06-29)

# Kapittel 10 — Avviks- og spec-revisjon

> Kode-verifisert 2026-06-29. Hver påstand peker til `fil:linje` eller er merket `UVERIFISERT`.
> Syntese over 7 kategorier. Kategori 5/6/7 dedupliserer funn fra skjermkortene i
> `docs/design/{10,20,30,40,50}-*.md` (filene ble konsolidert under arbeidet — opprinnelige
> 11/20/21/22/23/30/31/32/33/40/50-numre lever nå i 10-marketing, 11-marketing-stats,
> 20-portal, 30-admin, 40-forelder, 50-auth).
>
> Format per funn:
> ```
> - [P0/P1/P2] tittel
>   Forventet:  (hva spec/docs/domene sier)
>   Faktisk:    (hva koden gjør) — fil:linje
>   Konsekvens: (for bruker/design)
> ```

---

## 1. Kode mot dokumentasjon

- [P0] Forsiden viser priser som motsier den låste pris-regelen
  Forventet:  CLAUDE.md + BUSINESS-RULES: PlayerHQ-tilgang er **gratis eller 300 kr/mnd**, ingen tier-nivåer. «Performance / Performance Pro» er **coaching-pakker**, ikke app-nivåer.
  Faktisk:    Forsiden rendrer `PRISER` som tre app-«nivåer» (Gratis 0 / Performance 1 200 / Performance Pro 2 220) — `src/app/(marketing)/page.tsx` (PRISER-const, ca. linje 15–115; pris-seksjon).
  Konsekvens: Markedssiden selger en pris-/nivåmodell appen ikke har; direkte motstrid mot låst beslutning. (`/priser` gjør det riktig — `src/app/(marketing)/priser/page.tsx` — så forsiden er den avvikende.)

- [P0] «Performance Pro» brukt som app-nivå-label (forbudt per design-porting-gate)
  Forventet:  design-porting-gate (LÅST): tier-pill/label skal aldri vise «Performance Pro» som app-nivå.
  Faktisk:    `tierLabel()` returnerer «Performance Pro» for PRO-tier i forelder-økonomi — `src/app/forelder/okonomi/page.tsx` (tierLabel). Samme mønster i admin-økt-galleri `gjennomfore/okter` (økt-meta «Performance Pro») — `src/app/admin/gjennomfore/okter/page.tsx`.
  Konsekvens: Bruker ser et app-nivå som ikke finnes; bryter eksplisitt låst label-regel.

- [P1] Emoji i UI (brand-regel: kun Lucide, aldri emoji)
  Forventet:  CLAUDE.md / designsystem.md: «Aldri emoji i UI — bruk Lucide-ikoner.»
  Faktisk:    `BENTO`-kortene på forsiden bruker emoji-ikoner 📈📋💬🧪⭐📡 — `src/app/(marketing)/page.tsx:16,24,31,38,45(⭐),52`. Emoji-tegn i data/UI også i `src/components/test-modul-v2/coach-tester-stall-screen.tsx:90,139` («43d ⚠», «31d ⚠») og ✓/✕-glyfer i `src/app/admin/godkjenn-portal/koblinger/page.tsx:137`, `src/app/admin/spillere/spillere-tabell.tsx:223`. (Forelder hjem bruker glyfer ▲▼■ for SG-retning i stedet for Lucide — `40-forelder.md:21`.)
  Konsekvens: Synlig brand-brudd på høyest-traffikkerte siden + i coach-tabeller.

- [P1] Design-kilde-regel brutt: produksjonsfiler refererer forbudte arkiv-kilder
  Forventet:  design-porting-gate (LÅST): all design-referanse MÅ peke til `public/design-handover/`. Forbudt: `wireframe/`, `design-files-v2/`, `design-package/`, `docs/design-handoff-komplett/`.
  Faktisk:    Kommentar-referanser til forbudte kilder i: `src/app/portal/mal/leaderboard/page.tsx` (`wireframe/design-files-v2/playerhq-A/03-mal-leaderboard.html`), live-tapper `src/app/portal/(fullscreen)/.../tapper` (`wireframe/design-package/.../02-live-tapper.html`), admin-økt `gjennomfore/okter/[id]` (`wireframe/design-files-v2/final/05-okter.html`), `admin/team` (`wireframe/design-files-v2/final/08-team.html`), `admin/hjelp` (`wireframe/design-files-v2/final/11-hjelp.html`), plan-detalj `admin/spillere/[id]/plan/[planId]` (Claude Design-bundle, ikke-handover), og hele `(internal)/demos/*` (bygget fra `wireframe/design-files-v2/`).
  Konsekvens: Diff-/port-arbeid måler mot feil fasit; regelbrudd som skal flagges ved første touch.

- [P1] Spacing-token-brudd / hardkodet hex i ny UI (designsystem.md forbyr)
  Forventet:  designsystem.md: ingen hardkodet hex i komponenter/ny UI; bruk tokens.
  Faktisk:    Omfattende hardkodet hex/rgba i inline-style på tvers av flater — bl.a. plan-detalj `bg-purple-100/bg-emerald-100/bg-sky-100` (`admin/spillere/[id]/plan/[planId]`), forelder barn-hero `#003d2d`+rgba (`forelder/barn/[childId]`), live-økt-komponenter `#005840/#D1F843/#0A1F17/#1A7D56` (`portal/(fullscreen)` live), shot-by-shot `stroke="#005840"` (`portal/mal/runder/[id]/shot-by-shot`), `#FBFAF5`-gradient på flere admin plan-flater. Full liste i `20-portal.md:2221`, `30-admin.md:833,860`, `40-forelder.md:55,138,172`.
  Konsekvens: Tema-/token-disiplin brytes bredt; mørk/lys-konsistens og fremtidig token-endring blir skjør.

---

## 2. Interne motsetninger på tvers av flater

- [P1] Shell-/header-fragmentering i AgencyOS (tre konkurrerende idiomer)
  Forventet:  Én konsistent AgencyOS-shell (mørk terminal, `AgPage`/`AgPageHead`).
  Faktisk:    Tre idiomer side om side: fersk `AgPageHead`-port, eldre `AdminHero`, og `HubFrame`/`hub-frame` CSS-øyer — `30-admin.md:251,1243`. Tilsvarende i PlayerHQ/Meg: moderne `MeSub`-skall vs. eldre «ChevronLeft + PlayerHero» — `20-portal.md:844`.
  Konsekvens: Samme produkt får 3 ulike hero/KPI-uttrykk; visuell inkonsistens.

- [P1] Tema-brudd: lyst `bg-background`-idiom inne i mørk AgencyOS
  Forventet:  AgencyOS = mørkt (`#0A0B0A`). PlayerHQ = lyst. (CLAUDE.md låst.)
  Faktisk:    Live-økt brief/summary bruker lyst fullside-idiom mens /active bruker riktig `AgPage` — `admin/live/[sessionId]/brief/page.tsx`, `.../summary/page.tsx` (`30-admin.md:204,234`). `admin/spillere/[id]/fremgang` og `.../plan` bruker lyst/generisk idiom — `30-admin.md:332,377`. `workspace/*`-flater bruker cream-gradient — `30-admin.md:833`.
  Konsekvens: Brukeren faller ut av mørk-tema midt i en flyt; bryter låst tema-regel per produkt.

- [P1] Auth-intern visuell drift
  Forventet:  Konsistent terminal-lys-auth-fasit (mørk + «ak»-lime-merke).
  Faktisk:    `auth/check-email` bruker lyst kort + «AK Golf»-ordmerke, ikke terminal-skallet login/signup/forgot/reset deler — `50-auth.md:62`. To forelder-samtykke-flater (`inviter/forelder/[token]` vs `auth/guardian-consent/[token]`) har ulik visuell tyngde for overlappende formål — `50-auth.md:162,494`.
  Konsekvens: Inkonsistent førsteinntrykk i auth-flyten.

- [P2] Talent-modul: akse-vokabular i konflikt med pyramide-kanon
  Forventet:  Pyramide = FYS/TEK/SLAG/SPILL/TURN (taxonomy.ts).
  Faktisk:    `admin/talent` merker radar-aksene FYS/TEK/SLAG/SPILL/TURN men mapper dem til `talentTracking.{fysisk,teknikk,taktikk,mental,motivasjon}` — `30-admin.md:548,550`. To radar-implementasjoner/akse-sett i samme modul.
  Konsekvens: Domene-forvirring — etikettene lyver om hva tallene er.

---

## 3. AK-domene-invarianter (håndhevet vs. brutt)

Kilder lest: `src/lib/taxonomy.ts`, `src/lib/portal/training/ak-taxonomy.ts`,
`src/lib/portal/training/periode-constraints.ts`, `src/lib/domain/cs-progression.ts`,
`docs/ak-formel-review-2026-06-28.md`. Merk: prompten nevnte `src/lib/cs-progression.ts` og
`src/lib/periode-constraints.ts` — faktiske stier er `src/lib/domain/cs-progression.ts` og
`src/lib/portal/training/periode-constraints.ts`.

- [P1] TEK min 15 % i pyramide-fordeling — DEFINERT, men ikke håndhevet per økt
  Forventet:  AK-formel-review §2D + periode-constraints: minimum pyramide-andel per periode (GRUNN TEK min 25 %, SPESIALISERING TEK min 15 %).
  Faktisk:    `PERIODE_CONSTRAINTS` definerer `minPyramide` (GRUNN TEK 25, SPESIALISERING TEK 15) — `src/lib/portal/training/periode-constraints.ts:67,75`. MEN `validerEnkeltOkt()` sjekker KUN max per økt, ikke min: «Vi advarer ikke på minimum per økt, kun per uke» — `periode-constraints.ts:155`. Og per-uke-valideringen (`validateSessionConstraints`) sjekker kun `volumPerUke.maxMin`, ikke `minPyramide` — `periode-constraints.ts:197–207`. Minimum håndheves dermed INGEN steder.
  Konsekvens: En coach kan lage en SPESIALISERING-uke med 0 % TEK uten advarsel; invarianten er kosmetisk.

- [P1] CS gjelder kun fra L_KOLLE (skjules for L_KROPP/L_ARM) — IKKE håndhevet i oppgave-UI
  Forventet:  AK-formel-review §A.3: «CS gjelder kun fra L_KOLLE. L_KROPP/L_ARM → CS er N/A og skal skjules.» §B: lås for høy fart for tidlig; advar ved CS > `LFASE_ANBEFALT_CS`.
  Faktisk:    Oppgave-modalen viser CS-nivå-dropdown ubetinget, uavhengig av valgt `lFase` — `src/components/teknisk-plan/oppgave-modal.tsx:367–376` (lFase-select og CS-select er sidestilte felt, ingen gating). Ingen `LFASE_ANBEFALT_CS`-sjekk i fila. `LFASE_ANBEFALT_CS` er definert i `src/lib/portal/training/ak-taxonomy.ts:133–139` men brukes ikke til å skjule/advare her.
  Konsekvens: Coach kan kode «CS100» på en L_KROPP-oppgave (uten kølle) — meningsløst og pedagogisk feil; kjernen i AK-formelen håndheves ikke.

- [P1] Manglende `maxClubSpeed` per spiller — CS% kan ikke kalibreres til mph
  Forventet:  AK-formel-review §A: lagre spillerens MAX club speed per kølle så CS% → faktisk mph («CS70, 7-jern = 66 mph»). [NY] `PlayerClubSpeed`.
  Faktisk:    Ingen `maxClubSpeed`/`PlayerClubSpeed`/`maxMph`-felt finnes i kodebasen (grep i `src/` + `prisma/` → 0 treff). `CS_NIVAER` er ren prosent uten mph-anker — `src/lib/taxonomy.ts:145–152`.
  Konsekvens: «CS70» betyr ulikt for hver spiller; mph-mål kan ikke genereres. Bekreftet hovedsvakhet (review §A).

- [P1] Periode-constraints definert med to ulike enum-sett (taxonomy vs periode-constraints)
  Forventet:  Én kanonisk periode-modell med volum-tak/CS-tak per GRUNN/SPES/TURN/EVAL/FERIE.
  Faktisk:    To uavhengige constraint-tabeller: (a) `PERIODE_TYPER` over `LPhase` = {GRUNN, SPESIAL, TURNERING} med `csMax`/`maxVolumMin`/`lFaserTillatt`/`turneringsLaas` — `src/lib/taxonomy.ts:208–233`; (b) `PERIODE_CONSTRAINTS` over `PeriodeType` = {GRUNN, SPESIALISERING, TURNERING, EVALUERING, FERIE} med pyramide-min/max + praksis + volum — `src/lib/portal/training/periode-constraints.ts:64–105`. Ulike navn (SPESIAL vs SPESIALISERING), ulik dekning (EVAL/FERIE mangler i (a)), og kun (a) har CS-tak.
  Konsekvens: To kilder til sannhet for periode-regler; CS-tak (`csMax`) håndheves bare via `validerPeriodBlock` (taxonomy.ts:327) mens pyramide/volum håndheves via en annen funksjon — risiko for at validering kjører mot feil tabell.

- [P2] CS50-minimum for balltrening — INGEN slik invariant i koden
  Forventet:  Prompten ber verifisere «CS50-minimum for balltrening».
  Faktisk:    `CS_NIVAER` starter på CS50 («Supersakte, kun form») — `taxonomy.ts:146`. `LFASE_ANBEFALT_CS` gir L_KROPP/L_ARM = CS50/CS60 (`ak-taxonomy.ts:134–135`), altså CS50 er laveste eksisterende verdi, men det finnes ingen regel som krever ≥ CS50 spesifikt for balltrening (L_BALL anbefaler CS80–90). `UVERIFISERT` som eksplisitt håndhevet invariant — eksisterer kun implisitt som lavest mulige enum-verdi.
  Konsekvens: Ingen kode å bryte; men heller ingen håndheving hvis regelen var ment.

- [P2] Aldersregel (ukentlige timer ≤ alder) — IKKE implementert
  Forventet:  Prompten ber verifisere «aldersregel (ukentlige timer ≤ alder)».
  Faktisk:    Ingen kode kobler ukentlig volum mot spillerens alder. Alder beregnes (`calcAge` i `src/lib/admin-workbench/workbench-data.tsx:328`; `calculateAge` i guardian-consent) men brukes kun til visning/samtykke, aldri til volum-validering. `validateSessionConstraints` tar ikke alder som parameter — `periode-constraints.ts:164`. `UVERIFISERT`/fraværende.
  Konsekvens: Volum-tak er periode-basert, ikke alders-basert; en 12-åring og en 25-åring får samme tak. Invarianten håndheves ikke.

- [P2] Belastnings-motor (CTL/ATL/TSB) vises, men beregnes ikke
  Forventet:  AK-formel-review §E: motor som regner CTL/ATL/TSB fra TrainingLog + søvn.
  Faktisk:    `load-calendar` viser CTL/ATL/TSB, men ingen `LoadMetric`-motor finnes (review §E, bekreftet). CS-skadevarsel `MULIG_SKADE` eksisterer isolert — `src/lib/domain/cs-progression.ts:156–161` (fall > 3 mph siste uke) — men er ikke koblet til en belastnings-agent.
  Konsekvens: Belastningstall i UI har ingen ekte motor bak; potensielt fabrikert/tomt.

---

## 4. Gating-hull (PRO/CBAC/ELITE)

- [P0] Uautentisert dev-rute i prod-bygg
  Forventet:  Alle ikke-offentlige ruter gates.
  Faktisk:    `/dev-banekart` har INGEN gate og er ikke proxy-beskyttet (`/dev-banekart` ikke i `erBeskyttet` i `src/proxy.ts`) — `50-auth.md:320,490`. Offentlig URL leser `prisma.bane`.
  Konsekvens: Sikkerhets-/ryddesak — offentlig uautentisert dev-rute eksponerer banedata.

- [P1] `/intern/komponenter/*` har ingen rolle-gate (kun proxy-auth)
  Forventet:  Intern-galleriet skal gates/fjernes før lansering (galleri-page sier dette selv).
  Faktisk:    Ingen `intern/layout.tsx` med rolle-gate; enhver innlogget bruker (også PLAYER/PARENT) når mock-galleriene — `50-auth.md:334,339`. `(internal)/demos/*` gates riktig (ADMIN-only) via `(internal)/layout.tsx`, men `/intern/komponenter` gjør det ikke.
  Konsekvens: Mock-data-skjermer (med navne-kanon-brudd) synlige for alle innloggede.

- [P2] ELITE-tier-lekkasje i type-signaturer (dødt enum)
  Forventet:  CLAUDE.md: «ELITE finnes ikke — vis aldri i UI.»
  Faktisk:    UI rendrer aldri ELITE som tekst (alle steder mapper ELITE → «PRO»: `admin/plans/[planId]/assign-plan-modal.tsx:230`, `lib/admin/stallen-data.ts:123`, `lib/admin/innboks-data.tsx:208`). MEN `Tier`-typen inkluderer fortsatt `"ELITE"` i flere komponent-props: `components/portal/workbench/player-hero-v2.tsx:27`, `coachhq/workbench/spiller-hero.tsx:28`, `portal/workbench/player-hero-image.tsx:23`, `portal/portal-avatar-button.tsx:13`. Coach-onboarding `coach-wizard.tsx:54` har «ELITE» i SPESIALITETER — men det er en coaching-spesialitet (turnering/elite-coaching), IKKE tier-enum → ikke et brudd.
  Konsekvens: Ingen synlig UI-lekkasje (mapping fanger det), men død enum-verdi lever videre i typer — risiko for fremtidig regresjon hvis et nytt sted glemmer å mappe.

- [P2] Rå `player.tier`-streng vist i coach-SG-hub
  Forventet:  Tier vises aldri som rå enum; ELITE skjules.
  Faktisk:    `portal/mal/sg-hub/coach/[spillerId]` viser rå `player.tier`-streng i stat-kort uten mapping — `20-portal.md:324,329,331`.
  Konsekvens: Hvis en spiller har tier=ELITE i DB, vises «ELITE» rått her (gating-hull i denne ene flaten).

---

## 5. Døde/uferdige flater, TODO, mock-data vist som ekte

(Syntese fra skjermkortene — dedupliserte.)

- [P1] `admin/agencyos/live` (Mission Control) — 100 % statisk DEMO presentert som dashboard
  Faktisk:    ~1126 linjer, all data fra `./data` (EMAILS/MESSAGES/EVENTS/TASKS…), ingen Prisma — `30-admin.md:42–54`. Har DEMO-banner (ærlig), men er største enkeltrute-gjeld.

- [P1] Leaderboard — mange inerte placeholder-kontroller + TODO-data
  Faktisk:    Badges (streak/test/momentum) hardkodet TODO, ukentlig delta TODO, søk/pagination/sesong inerte (disabled), «Neste oppdatering søndag» statisk — `20-portal.md:395`.

- [P1] `admin/workspace/oppgaver/[id]` — mye hardkodet demo som ekte oppgave-detalj
  Faktisk:    `ACTIVITY_FEED`, `SUB_TASKS`, beskrivelse, «OPPRETTET 22.05», «4 t igjen», estimat hardkodet — `30-admin.md:1026`.

- [P1] `admin/gjennomfore/okter/[id]` — ekte booking-skall, demo-innhold
  Faktisk:    `SESSION_DRILLS`, notater, «siste 5 økter», live-strip-tall HARDKODET; hardkoder «{Fornavn} {X}.P.»-navn (gammelt mønster) — `30-admin.md:1135,1142`.

- [P1] `admin/organisasjon` — HubCards med fabrikerte tall
  Faktisk:    «3 aktive»/«3 LIVE» agenter, «12 maler», «Sist endret 22. mai», «Anders K. · Head Coach», «pro@akgolf.no» hardkodet — `30-admin.md:1929,1936`.

- [P1] `admin/hjelp` — ingen DB, fabrikerte stats + forbudt design-kilde
  Faktisk:    `CATEGORIES`/`ARTICLES` statisk; «Sett 1 247 ganger» fabrikert; artikler er døde `#id`-ankere — `30-admin.md:1989,1996`.

- [P1] `admin/tilstander` — ingen DB, alt hardkodet demo + navne-kanon-brudd
  Faktisk:    Bruker uautoriserte navn (Eline Krogh, Joachim Trønnes, Henrik Næss…) + «Performance Pro» som økt-meta — `30-admin.md:2019,2026`.

- [P1] `meg/page.tsx` (Telegram-assistent) — eksplisitt «funksjonell v1», venter på design — `50-auth.md:264`.

- [P2] Døde knapper / inerte affordances
  Faktisk:    shot-by-shot: 3 av 4 ikon-knapper (Rediger/Eksporter/Mer) uten onClick/href — `20-portal.md:140`. Avbestill-«Pause» er død knapp — `20-portal.md` (avbestill). `agencyos/uka` + `kalender` har GripVertical/«Uke»-toggle som antyder drag/visning som ikke finnes — `30-admin.md:65,158`. `agencyos/spillere`-søkefelt er attrapp `<span>` — `30-admin.md:35`.

- [P2] Caddie-aktivitet — confidence-tall er syntetisk (`0.7 + (i*7%28)/100`) vist som ekte — `30-admin.md:136,143`.

- [P2] `admin/board` → `/admin/spillere?view=tavle`, men tavle-visning er ikke verifisert implementert (server rendrer kun tabell) — mulig dead redirect — `30-admin.md:471`.

- [P2] `admin/settings` analytics: `execSync` med hardkodet maskinsti `/Users/anderskristiansen/...` (brekker på andre miljøer) — `30-admin.md:1966`.

- [P2] Sesongmål-fremdriftsbarer hardkodet uten kilde: forelder `width:"40%"`-placeholder (`forelder/barn/[childId]`, `40-forelder.md:55`) og admin spiller-profil `pct=50` hardkodet (`30-admin.md:294,297`) — vist som ekte fremdrift.

---

## 6. Duplisering (ruter/komponenter/flater)

- [P1] To roster-flater for samme jobb: `/admin/stall` vs `/admin/spillere`
  Faktisk:    Begge er smart-sortert stall-oversikt; `/admin/stall` legger til høyre 360°-panel men overlapper sterkt — `30-admin.md:437`.

- [P1] Duplisert sikkerhetsskjerm med ULIK score-formel
  Faktisk:    `/portal/meg/sikkerhet` (score 65/40) vs `/portal/meg/innstillinger/sikkerhet` (score 80/55) — to inngangsdører, motstridende tall — `20-portal.md:1025,1109,1112`.

- [P1] Plan-bygger duplisert tre steder, hvorav 2 fra forbudt kilde
  Faktisk:    `(internal)/demos/plan-bygger`, `.../plan-bygger/[steg]`, `.../newplan/[steg]` — alle bygget fra `wireframe/design-files-v2/`; funksjonen skal bo i Workbench (låst) — `50-auth.md:416,428,438`.

- [P2] To tildel-test-modaler: `/admin/spillere/[id]/tildel-test` (TildelTestModalScreen) vs `/admin/tester/tildel/[spillerId]` (TildelModal) — `30-admin.md:372,777`.

- [P2] To profil-rediger-ruter for samme datasett: `/portal/meg/profil` vs eldre rediger-inngang — `20-portal.md:884,888`.

- [P2] To økonomi-inngangsposter i forelder-shell: `/forelder/okonomi` og `/forelder/fakturaer` lister begge betalinger — `40-forelder.md:5,89,138`.

- [P2] Marketing-seksjonsprimitiver kopiert lokalt i 3+ filer (priser/coaching/playerhq) i stedet for `marketing-sections.tsx`; `/playerhq` dupliserer hele hero-blokken — `10-marketing.md:3,57,74`.

- [P2] Egen pyramide-render i `forelder/barn/[childId]` duplikerer `PyramidProgress` — `40-forelder.md:55`.

- [P2] Engelsk/norsk rute-aliaser: `/admin/calendar*`→`/admin/kalender*`, `/admin/oppfolging`→`/admin/queue`, `/admin/board`-redirect; flere spiller-CTA-er peker på engelske ruter (`/admin/plans`, `/admin/approvals`, `/admin/tournaments`) i stedet for norske — `30-admin.md:186,282,459`.

---

## 7. Data uten ekte kilde (fabrikerte tall presentert som ekte)

- [P1] `/admin/stall`: `adh:"88 %"` (adherence ikke i schema) og `FYS pct:60` plassholder — liksom-tall — `30-admin.md:430,437`.

- [P1] `/admin/organisasjon` + `/admin/hjelp` + `/admin/tilstander`: fabrikerte counts/stats/navn (se §5) presentert som ekte.

- [P2] Forsiden: coach-preview-rader + marquee + BAND-tall hardkodet inline — `10-marketing.md:16`.

- [P2] `portal/coach/[coachId]`: rating «4,9» / snittsvar «4 t» / MORAD-sertifiseringer fabrikert — `20-portal.md:2223`.

- [P2] `portal/mal/statistikk/[metric]` + `portal/mal/sg-hub/benchmark`: «Snitt A1» / «Team Norway»-benchmark vist som ekte referanse, men data er kun spillerens egne vs Tour — potensielt misvisende label — `20-portal.md:229,2223`.

- [P2] `admin/talent`: percentil-proxy, LEVEL_LADDER, journey-tall avledet/syntetisk — `30-admin.md:548`; `30-admin.md:2223`.

- [P2] `admin/wagr-import`: «Sikker match» hardkodet (match-konfidens-felt mangler); snapshot-dato «12. mai 2026» hardkodet i footnote — `30-admin.md:698,685`.

- [P2] `admin/caddie/aktivitet`: confidence syntetisk (se §5).

---

## TOPP-10 viktigste funn (P0 → P2)

1. **[P0] Forsiden selger feil pris-/nivåmodell** — 3 app-«nivåer» (Gratis/Performance/Performance Pro) motsier låst regel «gratis eller 300 kr/mnd, Performance = coaching-pakke». `src/app/(marketing)/page.tsx`. (§1)
2. **[P0] «Performance Pro» som app-nivå-label** — forbudt per design-porting-gate; i `forelder/okonomi/page.tsx` (`tierLabel`) + `admin/gjennomfore/okter`. (§1)
3. **[P0] Uautentisert dev-rute `/dev-banekart` i prod** — ingen gate, ikke proxy-beskyttet; eksponerer banedata. `src/proxy.ts`. (§4)
4. **[P0] Emoji-ikoner på forsiden** (📈📋💬🧪⭐📡) — brand-brudd «aldri emoji i UI». `src/app/(marketing)/page.tsx:16,24,31,38,45,52`. (§1)
5. **[P1] CS-gating brutt i oppgave-UI** — CS-dropdown vises ubetinget; ingen skjuling for L_KROPP/L_ARM, ingen advarsel ved CS > anbefalt. `src/components/teknisk-plan/oppgave-modal.tsx:367–376`. Kjernen i AK-formelen håndheves ikke. (§3)
6. **[P1] TEK-minimum (15 %/25 %) håndheves ingen steder** — `minPyramide` definert men `validerEnkeltOkt` sjekker kun max, per-uke kun volum. `src/lib/portal/training/periode-constraints.ts:155,197`. (§3)
7. **[P1] `maxClubSpeed` mangler helt** — CS% kan ikke kalibreres til mph; 0 treff på `PlayerClubSpeed`/`maxMph` i `src/`+`prisma/`. `src/lib/taxonomy.ts:145`. (§3)
8. **[P1] To uavhengige periode-constraint-tabeller** med ulike enum-navn/dekning (taxonomy.ts `PERIODE_TYPER` vs periode-constraints.ts `PERIODE_CONSTRAINTS`) — kun den ene har CS-tak. (§3)
9. **[P1] Forbudte design-kilder referert i prod-filer** — `wireframe/`/`design-files-v2/` i leaderboard, tapper, admin team/hjelp/økter, alle `(internal)/demos/*`. (§1)
10. **[P1] Tema-/shell-fragmentering** — lyst `bg-background`-idiom inne i mørk AgencyOS (live brief/summary, fremgang, plan, workspace) + tre konkurrerende header-idiomer. (§2)
