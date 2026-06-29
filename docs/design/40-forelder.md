# Forelder (/forelder) — skjermkort (kode-verifisert 2026-06-29)

11 ruter under `/forelder` (`src/app/forelder/`). PARENT-rolle, alltid LYST tema (ingen `.dark`), mobil-først (`max-w-[440–480px]`). Dominerende mønster: read-only innsyn i barnets data ("Foreldre-portalen er kun for innsyn") med editorial H1 + terminal-data-cards, hentet via `hentBarnForForelder` / `hentForelderUkerapport` (`src/lib/forelder.ts`). Ingen server actions skriver i denne flaten utenom samtykke-flaten (`lagreSamtykker` / `beOmDataSletting`). Delt shell: `src/app/forelder/layout.tsx` (sidebar + topbar med ordmerke «Foreldreportal» + `UserMenu`), med delt feil-/lastegrense `src/app/forelder/error.tsx` + `src/app/forelder/loading.tsx` (ÉN root-grense, dekker alle 11 ruter — ingen per-rute error.tsx/loading.tsx finnes).

Inngang (PARENT → barn-kobling): hver rute gates med `requirePortalUser({ allow: ["PARENT"] })` (`src/lib/auth/requirePortalUser.ts`). Forelder kobles til barn via `prisma.parentRelation` (`parentId_childId`-unik). `hentBarnForForelder(parentUserId)` (`src/lib/forelder.ts:8`) lister alle koblede barn; `assertBarnTilhorerForelder(parentUserId, childId)` (`src/lib/forelder.ts:31`) sjekker eierskap per barn-detalj og brukes KUN i `/forelder/barn/[childId]` (→ `notFound()` ved manglende relasjon). Resten av rutene aggregerer over alle barnets `childIds` uten per-id-gate (relasjonen er allerede filteret).

Faner i `src/components/forelder/sidebar.tsx` (rekkefølge, desktop `<aside>` `src/components/forelder/sidebar.tsx:32` + mobil bunn-nav `:71`): Oversikt (`/forelder`) · Mine barn (`/forelder/barn`) · Bookinger (`/forelder/bookinger`) · Okonomi (`/forelder/okonomi`) · Coach (`/forelder/coach`) · Ukerapport (`/forelder/ukerapport`) · Fakturaer (`/forelder/fakturaer`) · Varsler (`/forelder/varsler`) · Samtykker (`/forelder/samtykke`) · Innstillinger (`/forelder/innstillinger`). Merk: `okonomi` (CreditCard) og `fakturaer` (Receipt) er to separate nav-innganger til delvis overlappende betalings-data.

Tverrgående funn:
- **«Performance Pro» som tier-label (forbudt app-nivå):** `src/app/forelder/okonomi/page.tsx:67-69` `tierLabel()` returnerer **«Performance Pro»** for `tier === "PRO"`. Verifisert på DENNE branchen — fortsatt til stede (ikke fikset her). Design-porting-gate (LÅST) forbyr «Performance Pro» som app-nivå-label; Performance/Pro er coaching-pakker, ikke app-nivåer. Bør rettes ved første touch.
- **Hardkodet hex/rgba (token-disiplin-brudd):** to flater bryter `designsystem.md`-regelen om ingen hardkodet hex i ny UI: `barn/[childId]` (forest-hero `#003d2d`, `var(--lime)`, `rgba(...)`, gradient) og `fakturaer` («Neste forfall»-boks `rgba(184,133,42,...)` inline). `okonomi`, `barn`, `bookinger`, `innstillinger`, `samtykke` bruker tokens rent.
- **Hardkodet 40%-plassholder:** `src/app/forelder/barn/[childId]/page.tsx:329` sesongmål-fremdriftsbar er hardkodet `width: "40%"` (kommentert «placeholder — ingen currentValue i modellen») men rendres som om det var ekte data. Misvisende.
- **SG-glyfer ▲▼■:** `hjem-terminal.tsx:70` SG-trend-tekst og `byggNarrativ` bruker geometriske trekant-/firkant-glyfer (▲ opp / ▼ ned / ■ stabil). Disse er geometriske tegn, IKKE emoji — brand-sanksjonert per readme. Ikke et brudd.
- **Hero/toggle-inkonsistens:** tre ulike hero-idiomer på tvers — `ForelderHero`-primitiv (barn, okonomi, coach, varsler, innstillinger), bar editorial `<h1>` (bookinger, fakturaer, samtykke, ukerapport, hjem-terminal-header), og forest-gradient mørk hero-kort (`barn/[childId]`). Toggle-idiom spriker også: dekorative/disabled toggles (samtykke visuell oversikt, varsler) vs. ekte checkboxes (samtykke-skjema lenger ned).

---

### /forelder
- Fil: `src/app/forelder/page.tsx` → `src/components/forelder/hjem-terminal.tsx` · Flate: Forelderportal (lyst) · Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })`
- Jobb: Read-only forklarende hjem — samtykke-status + narrativ ukerapport + 8-ukers SG-trend + coach-notat for fokus-barnet (første koblede).
- Data vist (felt → kilde): alt fra `hentForelderUkerapport(user.id)` (`src/lib/forelder.ts:329`), som kjører 6 parallelle Prisma-queries for barn[0]: `prisma.user.findUnique` (dateOfBirth, guardianConsentGivenAt → `consentActive`, `childAge`); `prisma.trainingSessionV2.findMany` (denne uka, status+drills.pyramide → `oktFullfort`/`oktPlanlagt`/`fokusOmrade`/`oppmotePct`/`trentTimer`); `prisma.trainingSessionV2.findMany` (14 d COMPLETED → `streak`); `prisma.round.findMany` (8 uker, sgTotal → `trend8uker[]`/`sgTrendDelta`/`sgRetning`/`ukeSg`); `prisma.notification.findFirst` (type=melding → `coachNote`); `prisma.testResult.findFirst` (høyeste score → `hoydepunkt`). Narrativ bygges i `byggNarrativ()` (`hjem-terminal.tsx:23`).
- Handlinger: ingen server actions (read-only). Klient: `Link` «Administrer» → `/forelder/samtykke`. Ellers ingen interaksjon.
- Tilstander: empty (ingen barn → `data == null` → tekst-fallback `page.tsx:13`) finnes; coachNote/hoydepunkt rendres betinget. loading/error via delt `src/app/forelder/loading.tsx` + `error.tsx`. success — ikke relevant (read-only).
- Komponenter: `ForelderHjemTerminal` + intern `Kpi` (`src/components/forelder/hjem-terminal.tsx`). Lucide: `CheckCircle2`, `ShieldAlert`. Ingen athletic-primitiver.
- Flyt: landings-flate; «Administrer» → samtykke-flyt. Ingen forrige steg (rot).
- AK-domene vist: SG (8-ukers søyleserie + trend-delta med ▲▼■-glyf), pyramide-fokusområde (`fokusOmrade` på norsk: «teknikk»/«slag» osv.), oppmøte-% + streak, samtykke-status — alt forklart i hverdagsspråk for ikke-fagperson via `byggNarrativ`.
- Designfil-referanse: `public/design-handover/Forelderportal (terminal-lys).dc.html` (eksplisitt fasit i fil-kommentar `hjem-terminal.tsx:3`).
- Nåværende designkvalitet: ferdig — tett mot fasit, tokens. Mindre: SG-søyle bruker inline `linear-gradient(... hsl(var(--accent)) ...)` (token via CSS-var, akseptabelt).
- Redesign-prioritet: P2

---

### /forelder/barn
- Fil: `src/app/forelder/barn/page.tsx` · Flate: Forelderportal (lyst) · Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })`
- Jobb: Liste alle koblede barn som store klikkbare fremgangskort (pyramide-snapshot + nøkkeltall) → detalj på `/forelder/barn/[childId]`.
- Data vist (felt → kilde): `hentBarnForForelder(user.id)` → barn[] (navn, hcp, relationship). 3 parallelle queries over alle `childIds`: `prisma.trainingPlanSession.findMany` (PLANNED/ACTIVE, scheduledAt ≥ now → neste økt per barn `:98`); `prisma.trainingPlanSessionLog.findMany` (completedAt siste 30 d → økt-antall + pyramide-fordeling per barn `:112`); `prisma.payment.findMany` (PENDING/FAILED → utestående per barn `:127`). HCP/relationship fra barnets user.
- Handlinger: ingen server actions. Klient: hele kortet er én `Link` → `/forelder/barn/{id}`.
- Tilstander: empty (0 barn → dedikert dashed-kort m/ `UserRound` `:67`) finnes; per-kort empty (0 økter → «Ingen fullførte økter ennå» `:255`). loading/error via delt grense. success — ikke relevant.
- Komponenter: `ForelderHero`, `PyramidProgress`/`PyramidRow` (`@/components/athletic`); lokal `Stat`, `SectionLabel`. Lucide: ArrowRight, CalendarClock, Coins, Layers, TrendingUp, UserRound.
- Flyt: hub for barn-valg; → barn-detalj-faner. Forrige: Oversikt.
- AK-domene vist: pyramide (FYS/TEK/SLAG/SPILL/TURN med prosent + antall via `PyramidProgress`), HCP, økt-telling (30 d), utestående beløp (øre→kr) — ren athletic-presentasjon for forelder.
- Designfil-referanse: kommentar peker til `public/design-handover/_prompts/SKJERMER-RUNDE-8-FORELDRE-MARKETING-MISC.md` (prompt, ikke .dc.html `:5`). Nærmeste rendrede fasit: `Forelderportal (terminal-lys).dc.html`.
- Nåværende designkvalitet: ferdig — ren athletic-bruk, tokens, ingen hex. Konsistent med DS.
- Redesign-prioritet: P2

---

### /forelder/barn/[childId]
- Fil: `src/app/forelder/barn/[childId]/page.tsx` · Flate: Forelderportal (lyst, men hero er forest-gradient mørk) · Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })` + `assertBarnTilhorerForelder(user.id, childId)` (`:95`) → `notFound()` ved manglende relasjon eller `role !== "PLAYER"` (`:121`).
- Jobb: Read-only barn-profil med fane-navigasjon (oversikt/uke/mål/økonomi) over treningsplan, runder, mål og betalinger.
- Data vist (felt → kilde): `prisma.user.findUnique` (`:98`) med include: `trainingPlans` (isActive, sessions+log), `goals` (ACTIVE), `rounds` (score, sgTotal), `payments`. Tilleggsspørring `prisma.trainingPlanSessionLog.findMany` (`:128`, siste 28 d → `totalMinutter`/`snittRating`). Aktiv tab via `?tab=` (`:91`). Pyramide-fordeling utledet fra `aktivPlan.sessions` (`:185`).
- Handlinger: ingen server actions. Klient: fane-rad = `?tab=`-`Link`er (`:347`); «Mine barn»-tilbake `:202`.
- Tilstander: notFound (gating) finnes; per-seksjon empty («Ingen aktiv plan», «Ingen runder registrert», «Ingen mål satt», «Ingen fakturaer registrert») finnes. loading/error via delt grense. success — ikke relevant.
- Komponenter: lokal `HybridKpi`. Lucide: ArrowLeft, Calendar, Target, Star, TrendingUp, CreditCard, Activity, Flag. **Pyramide rendret lokalt** (egne bars `:273`, IKKE `PyramidProgress` — duplikat).
- Flyt: barn-detalj; faner bytter seksjon innen samme rute. Forrige: Mine barn.
- AK-domene vist: HCP, SG (snitt sgTotal `:177` + per runde), pyramide-balanse (% per akse), sesongmål (type + targetValue), økt-rating (n/5), PaymentStatus.
- Designfil-referanse: ingen direkte .dc.html-match; nærmeste `Forelderportal (terminal-lys).dc.html`.
- Nåværende designkvalitet: inkonsistent — sterkest gjeld i flaten. (1) Hero hardkoder hex/rgba: `#003d2d` (`:213`,`:220`), `var(--lime)` (`:221`), `rgba(255,255,255,...)` (`:234`,`:255`), `rgba(0,0,0,0.25)` (`:251`), `linear-gradient` (`:213`) — bryter token-regelen. (2) Sesongmål-fremdriftsbar `width: "40%"` hardkodet placeholder (`:329`, gradient `var(--forest),#8db000`) — vises som ekte data. (3) Egen pyramide-render duplikerer `PyramidProgress`. (4) Tier-label hardkodet «PlayerHQ» (`:170`).
- Redesign-prioritet: P1

---

### /forelder/bookinger
- Fil: `src/app/forelder/bookinger/page.tsx` · Flate: Forelderportal (lyst) · Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })`; `export const dynamic = "force-dynamic"` (`:19`).
- Jobb: Read-only innsyn i barnas bookede timer — mini ukekalender + kommende/tidligere bookinger som kort.
- Data vist (felt → kilde): `hentBarnForForelder` → `childIds`. 2 parallelle queries: `prisma.booking.findMany` (kommende: startAt ≥ now, PENDING/CONFIRMED, take 30 `:68`) + `prisma.booking.findMany` (tidligere: startAt < now ELLER COMPLETED/CANCELLED, take 20 `:82`), begge med include serviceType (name/durationMin), location (name), coach (name). Ukekalender-prikker fra `bookingDays`-set (`:127`).
- Handlinger: ingen server actions. Klient: **ingen funksjonelle** — kalender-chevrons og kort er ikke-klikkbare (bevisst read-only; «Spilleren booker selv fra sin profil»).
- Tilstander: empty (0 barn → `IngenBarn` `:53`; 0 kommende → dashed `CalendarDays`-kort `:225`) finnes; tidligere vises betinget (`:245`). loading/error via delt grense.
- Komponenter: `AthleticEyebrow` (`@/components/athletic`); lokal `BookingCard`, `IngenBarn`. Lucide: CalendarDays, ChevronLeft, ChevronRight.
- Flyt: ren innsyns-flate, ingen utgang utover global nav.
- AK-domene vist: booking/økt-type, coach, lokasjon, BookingStatus (Bekreftet/Fullført/Avlyst/Planlagt). Ingen SG/fremgang her.
- Designfil-referanse: ingen direkte .dc.html; nærmeste `Flyt - Forelder og Marketing (terminal-lys).dc.html` / `Forelderportal (terminal-lys).dc.html`.
- Nåværende designkvalitet: ferdig — tokens, athletic eyebrow, ingen hex. UX-gjeld: kalender-chevrons (`:152`-`:157`) ser interaktive ut men gjør ingenting (ingen disabled/aria-hint).
- Redesign-prioritet: P2

---

### /forelder/okonomi
- Fil: `src/app/forelder/okonomi/page.tsx` · Flate: Forelderportal (lyst) · Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })`; `dynamic = "force-dynamic"` (`:34`).
- Jobb: Read-only sammendrag av barnas økonomi — abonnement-status (tier/credits/neste trekk) + utestående + siste betalinger; full historikk på `/forelder/fakturaer`.
- Data vist (felt → kilde): `hentBarnForForelder` → `childIds`. 2 parallelle queries: `prisma.subscription.findMany` (tier, status, currentPeriodEnd, monthlyCredits, creditsRemaining `:103`) + `prisma.payment.findMany` (take 30, status/type/description `:114`). Avledet: utestående (PENDING/FAILED-sum `:133`), betalt totalt (SUCCEEDED `:137`), aktive pakker (monthlyCredits>0 `:142`).
- Handlinger: ingen server actions. Klient: utestående-varselbanner + «Se alle» → `/forelder/fakturaer`.
- Tilstander: empty (0 barn → `IngenBarn` `:88`; 0 betalinger → Wallet-tomtilstand `:243`) finnes; utestående-banner betinget (`:161`). loading/error via delt grense.
- Komponenter: `ForelderHero`, `AthleticBadge`, `KpiCard`, `KpiStrip` (`@/components/athletic`); lokal `PanelHead`, `AbonnementRad`, `IngenBarn`. Lucide: AlertTriangle, ChevronRight, Coins, CreditCard, ReceiptText, Sparkles, Wallet.
- Flyt: økonomi-sammendrag → `/forelder/fakturaer` (full historikk). Overlapper fakturaer i scope.
- AK-domene vist: Tier, SubscriptionStatus, credits (igjen/månedlig), PaymentStatus, øre→kr. Ingen SG/fremgang.
- Designfil-referanse: nærmeste `Forelderportal (terminal-lys).dc.html` (ingen dedikert økonomi-.dc.html i gjeldende handover).
- Nåværende designkvalitet: inkonsistent — to brudd: (1) `tierLabel()` (`:67-69`) returnerer **«Performance Pro»** for PRO-tier — design-porting-gate (LÅST) forbyr eksplisitt dette som app-nivå-label (verifisert til stede på denne branchen). (2) Overlapper `/forelder/fakturaer` i scope (begge lister betalinger). Ellers ren athletic-bruk, ingen hex.
- Redesign-prioritet: P1 (tekst-bruddet bør rettes ved første touch)

---

### /forelder/coach
- Fil: `src/app/forelder/coach/page.tsx` · Flate: Forelderportal (lyst) — **stub** · Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })`; `dynamic = "force-dynamic"` (`:12`).
- Jobb: Placeholder for coach-dialog — setter forventning («kommer Q3 2026») + CTA til support.
- Data vist (felt → kilde): ingen Prisma-queries — kun statisk EmptyState-tekst.
- Handlinger: ingen server actions. Klient: `mailto:support@akgolf.no` CTA (`:33`).
- Tilstander: kun empty/coming-soon (`EmptyState`). Ingen data, ingen loading-/error-avhengighet utover delt grense.
- Komponenter: `ForelderHero`, `EmptyState` (`@/components/shared/empty-state`). Lucide: MessageSquare, Users.
- Flyt: blindvei (venter på funksjon); CTA ut til e-post.
- AK-domene vist: ingen.
- Designfil-referanse: ingen prototype (funksjon ikke bygget). Nærmeste konseptuelle: `Flyt - Coach-dialog (terminal-lys).dc.html`.
- Nåværende designkvalitet: ferdig som stub — ren `EmptyState`-bruk.
- Redesign-prioritet: P3 (stub; venter på funksjon)

---

### /forelder/ukerapport
- Fil: `src/app/forelder/ukerapport/page.tsx` · Flate: Forelderportal (lyst) · Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })`; `dynamic = "force-dynamic"` (`:13`).
- Jobb: Read-only ukesoppsummering — «Denne uka» (3 stat) + coach-kommentar + ukens høydepunkt.
- Data vist (felt → kilde): `hentForelderUkerapport(user.id)` (samme 6-query-helper som `/forelder`): `ukenummer`, `childFirstName`, `oktFullfort`, `trentTimer`, `ukeSg`, `coachNote` (body/author), `hoydepunkt` (testNavn/score). Ingen egne queries i page — alt via helper.
- Handlinger: ingen server actions, ingen klient-interaksjon.
- Tilstander: empty (ingen barn → `d == null` → tekst-fallback `:24`) finnes; coachNote/hoydepunkt rendres betinget (`:62`,`:77`). loading/error via delt grense.
- Komponenter: lokal `Stat`. Lucide: Star. Ingen athletic-primitiver.
- Flyt: ren rapport-flate; ingen utgang.
- AK-domene vist: SG (uke-SG med fortegn `:34`), økt-telling, trente timer, test/høydepunkt-score — forklart enkelt for forelder.
- Designfil-referanse: `public/design-handover/Onboarding-gap og Forelder long-tail (terminal-lys).dc.html` (fil-kommentar `:3`, rute `/foreldre/rapport/[id]`).
- Nåværende designkvalitet: ferdig — tett mot fasit, tokens, ingen hex. Smal `max-w-[440px]`.
- Redesign-prioritet: P2

---

### /forelder/fakturaer
- Fil: `src/app/forelder/fakturaer/page.tsx` · Flate: Forelderportal (lyst) · Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })` (ingen `dynamic`-eksport).
- Jobb: Read-only fakturahistorikk på tvers av barn med KPI (betalt hittil / neste forfall) + datert betalingsliste.
- Data vist (felt → kilde): `hentBarnForForelder` → `childIds`. `prisma.payment.findMany` (`:42`, take 50, include user (name) + booking.serviceType (name)). Avledet KPI: `totalBetalt` (SUCCEEDED-sum `:59`), `nesteForfall` (første PENDING/FAILED `:63`).
- Handlinger: ingen server actions. Klient: `mailto:hei@akgolf.no` (`:197`). **Ingen nedlasting/PDF** av faktura.
- Tilstander: empty (0 betalinger → «Ingen fakturaer registrert» `:136`; 0 barn → `childIds` tom → tom liste) finnes. loading/error via delt grense.
- Komponenter: ingen athletic-import — alt lokalt (rene tekst/box-celler). Lokal `ore()`, `statusPille()`. Lucide: ingen.
- Flyt: full historikk-flate; nås fra `/forelder/okonomi` («Se alle»). Overlapper okonomi i scope.
- AK-domene vist: PaymentStatus (Betalt/Refundert/Feilet/Venter), øre→kr, booking-servicetype. Ingen SG/fremgang.
- Designfil-referanse: nærmeste `Forelderportal (terminal-lys).dc.html` (ingen dedikert billing-.dc.html i gjeldende handover; arkivert `40-foreldre-billing.html` er forbudt referanse).
- Nåværende designkvalitet: ferdig, men: (1) «Neste forfall»-boks hardkoder `rgba(184,133,42,...)` inline (`:100-103`) i stedet for `bg-warning/*`-token (token-brudd). (2) Scope overlapper `/forelder/okonomi`.
- Redesign-prioritet: P2

---

### /forelder/varsler
- Fil: `src/app/forelder/varsler/page.tsx` · Flate: Forelderportal (lyst) · Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })` (ingen `dynamic`-eksport).
- Jobb: Varsel-preferanser per barn (foreløpig read-only toggles) + feed av siste varsler for barna.
- Data vist (felt → kilde): `hentBarnForForelder` → `childIds`. `prisma.notification.findMany` (`:37`, take 8, include user (name)). Toggle-rader fra statisk `KANALER`-liste (`:24`).
- Handlinger: ingen server actions. Klient: **ingen funksjonelle** — checkboxes er `disabled defaultChecked` (`:108-114`), funksjon kommer i «Spor 1».
- Tilstander: empty (0 barn → «Ingen barn koblet ennå» `:73`; 0 varsler → «Ingen varsler å vise» `:139`) finnes. loading/error via delt grense. Toggles disabled → ingen success/error.
- Komponenter: `ForelderHero`. Lucide: Bell, Mail, MessageSquare, Calendar, CheckCircle2.
- Flyt: ren innsyns-/preferanse-flate (ikke koblet); e-post-varsel implisitt via `user.email`.
- AK-domene vist: NotificationType (MESSAGE/BOOKING/PAYMENT/…), per-barn relationship. Ingen SG/fremgang.
- Designfil-referanse: nærmeste `Forelderportal (terminal-lys).dc.html` (arkivert `39-foreldre-varsler.html` forbudt).
- Nåværende designkvalitet: halvferdig — toggles er rene disabled-checkboxes (ikke DS-switch som i samtykke/innstillinger), gir inkonsistent toggle-idiom på tvers av forelder-flatene. Funksjon ikke koblet (Spor 1).
- Redesign-prioritet: P2

---

### /forelder/samtykke
- Fil: `src/app/forelder/samtykke/page.tsx` (+ `samtykke-form.tsx`, `data-actions.tsx`, `actions.ts`) · Flate: Forelderportal (lyst) — **GDPR-kjerneflate** · Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })`.
- Jobb: Administrer datasamtykker per barn (foto/video, datadeling, nyhetsbrev, tredjepart) + GDPR-handlinger (eksport/sletting) + datapolicy.
- Data vist (felt → kilde): `prisma.parentRelation.findMany` (`:51`, approved=true, include child.preferences → samtykke-flagg); `prisma.dataExportRequest.findFirst` (`:67`, type=DELETE → siste slette-kvittering). `alleAktive` beregnes fra `requiredKeys` (dataDeling/fotoBruk/thirdParty `:74`).
- Handlinger: **eneste skrivende flate i forelderportalen.** `lagreSamtykker` (server action, `./actions.ts`, kalt fra `SamtykkeForm` — skriver child.preferences); `beOmDataSletting` (server action, kalt fra `DataActions` — oppretter DELETE i `dataExportRequest`). Klient: ekte checkboxes → lagre (`router.refresh`), GDPR-eksport-lenke → `/forelder/samtykke/eksport`, slette-knapp m/ kvittering.
- Tilstander: success (form «Samtykker lagret»; sletting: kvitteringsbanner) finnes; error (form + data-actions catch) finnes; empty (0 barn → «Ingen tilknyttede barn» `:157`) finnes; loading (`useTransition` pending «Lagrer …»/«Sender forespørsel …») finnes. **Mest komplette tilstandsdekning i flaten.**
- Komponenter: `SamtykkeForm` (client), `DataActions` (client). Lucide: Activity, Check, Mail, Package, Shield, Video.
- Flyt: GDPR-administrasjon; nås fra Oversikt «Administrer»-CTA. → `/forelder/samtykke/eksport`.
- AK-domene vist: ingen golf-domene; GDPR/samtykke-domene (preferences, AuditLog, dataExportRequest, Supabase Frankfurt).
- Designfil-referanse: `public/design-handover/Onboarding-gap og Forelder long-tail (terminal-lys).dc.html` (samtykke/onboarding-fasit; arkivert `38-foreldre-samtykke.html` forbudt).
- Nåværende designkvalitet: ferdig (mest moden flate). Friksjon: **to toggle-idiomer** på samme side — øverste «Datatillatelser»-toggles er dekorative/`aria-hidden` (`:131-136`, ikke styrbare) mens de ekte kontrollene er checkboxes lenger ned i `SamtykkeForm`; kan forvirre (ser klikkbare ut øverst). `DataActions` bruker hardkodet rgba inline (destructive/success-toner) i stedet for tokens.
- Redesign-prioritet: P1 (GDPR-kritisk + dobbelt toggle-idiom bør samles)

---

### /forelder/innstillinger
- Fil: `src/app/forelder/innstillinger/page.tsx` · Flate: Forelderportal (lyst) · Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })`; `dynamic = "force-dynamic"` (`:30`).
- Jobb: Konto, koblede barn (samtykke-kontekst), varseltyper og kontosikkerhet for forelder-rollen.
- Data vist (felt → kilde): `requirePortalUser` → user (name/email/phone/avatarUrl); `hentBarnForForelder(user.id)` → barn[] (navn, relationship). Statisk `VARSEL_TYPER`-liste (`:33`, read-only «På»-status). Ingen egne Prisma-queries i page utover helper.
- Handlinger: ingen server actions (alt lenker ut). Klient: «Rediger» → `/portal/meg`; «Se alle» → `/forelder/barn`; passord/2FA → `/portal/meg/innstillinger/sikkerhet`; «Logg ut» → `/auth/login`.
- Tilstander: empty (0 barn → tekst `:127`) finnes. loading/error via delt grense. success/error MANGLER på sidenivå (ingen redigering — alt lenker ut).
- Komponenter: `ForelderHero`, `AthleticBadge`; lokal `InfoRad`, `KontoLenke`. Lucide: Bell, ChevronRight, Lock, LogOut, Mail, Phone, ShieldCheck, User, Users.
- Flyt: konto-hub; sender forelder UT av forelder-shell til delte `/portal/meg/*`-flater for profil/passord/2FA (kontekst-hopp).
- AK-domene vist: ingen golf-domene; konto + samtykke-kontekst (koblede barn med «Koblet»-badge).
- Designfil-referanse: nærmeste `Forelderportal (terminal-lys).dc.html`.
- Nåværende designkvalitet: ferdig — konsistent panel-mønster, tokens, athletic-badges. Merk: konto-handlinger lenker til `/portal/meg/*` (PlayerHQ-flate) — forelder forlater forelder-shell (delt konto-flate, kan oppleves som kontekst-hopp).
- Redesign-prioritet: P2
