# Forelderportal — skjermkort (kode-verifisert 2026-06-29)

11 ruter under `/forelder` (`src/app/forelder/`). PARENT-rolle, alltid LYST tema (ingen `.dark`), mobil-først (`max-w-[440–480px]`). Dominerende mønster: read-only innsyn i barnets data ("Foreldre-portalen er kun for innsyn") med editorial H1 + terminal-data-cards, hentet via `hentBarnForForelder`/`hentForelderUkerapport` (`src/lib/forelder.ts`). Største gjeld: inkonsekvent hero-bruk (3 varianter: `ForelderHero`, bar `<h1>`, gradient-kort), hardkodet hex/rgba i `okonomi` + `barn/[childId]` (bryter token-regelen), og «Performance Pro» som tier-label i `okonomi` (forbudt app-nivå-tekst per design-porting-gate). Samtykke-flyt (GDPR) er mest moden; Coach er stub (Q3 2026).

Nav (`src/components/forelder/sidebar.tsx`, desktop `<aside>` + mobil bunn-nav): Oversikt · Mine barn · Bookinger · Okonomi · Coach · Ukerapport · Fakturaer · Varsler · Samtykker · Innstillinger. Merk drift: nav bruker `/forelder/okonomi` (CreditCard-ikon "Okonomi") + `/forelder/fakturaer` (Receipt) som to separate inngangsposter til delvis overlappende økonomi-data. Shell: `src/app/forelder/layout.tsx` (sidebar + topbar med ordmerke "Foreldreportal" + `UserMenu`).

---

### /forelder
- Fil: `src/app/forelder/page.tsx` → `src/components/forelder/hjem-terminal.tsx`
- Flate: Forelderportal (PlayerHQ-familie, lyst)
- Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })`
- Jobb (1 setning): Read-only forklarende hjem — samtykke-status + narrativ ukerapport + 8-ukers SG-trend + coach-notat for ett barn.
- Data vist (felt → kilde): childName/childAge, ukenummer, consentActive, oktFullfort/oktPlanlagt, fokusOmrade, sgRetning, oppmotePct, sgTrendDelta, streak, trend8uker[], coachNote → `hentForelderUkerapport(user.id)` (`@/lib/forelder`). Narrativ bygges i `byggNarrativ()`.
- Komponenter: lokal `ForelderHjemTerminal` + intern `Kpi`. Lucide: `CheckCircle2`, `ShieldAlert`. Ingen athletic-primitiver brukt her.
- Layout og hierarki: eyebrow (mono-caps "Forelderportal · uke N") → display H1 (barnets navn) → (1) samtykke-status-kort (lime `bg-accent/15` aktiv / `bg-warning/10` mangler, primær CTA "Administrer" → /forelder/samtykke) → (2) ukerapport-kort med 3 KPI → (3) 8-ukers SG-søylediagram → (4) coach-notat. Ingen nav i siden (global shell).
- Tilstander: empty (ingen barn koblet → tekst-fallback i page.tsx) finnes; loading via `loading.tsx`; coachNote/trend rendres betinget. error/success — IKKE relevant (read-only).
- Interaksjoner: "Administrer" → `/forelder/samtykke`. Ellers ingen handlinger.
- AK-domene vist: SG (strokes gained, trend + 8-ukers serie), pyramide-fokusområde (fokusOmrade), oppmøte/streak, samtykke-status.
- Designfil-referanse: `public/design-handover/Forelderportal (terminal-lys).dc.html` (eksplisitt nevnt i fil-kommentar som fasit).
- Nåværende designkvalitet: ferdig — tett mot fasit. Mindre: SG-søyle bruker inline `linear-gradient(... hsl(var(--accent)) ...)` (token via CSS-var, akseptabelt) og glyph-piler (▲▼■) i sgTekst i stedet for lucide.
- Redesign-prioritet: P2

---

### /forelder/barn
- Fil: `src/app/forelder/barn/page.tsx`
- Flate: Forelderportal (lyst)
- Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })`
- Jobb (1 setning): Liste over alle koblede barn som store klikkbare fremgangskort (pyramide-snapshot + nøkkeltall) → detalj på `/forelder/barn/[childId]`.
- Data vist (felt → kilde): barn[] (`hentBarnForForelder`); per barn neste planlagte økt (`trainingPlanSession`, status PLANNED/ACTIVE), fullførte økter siste 30 d + pyramide-fordeling (`trainingPlanSessionLog`), utestående betaling PENDING/FAILED (`payment`). HCP, relationship fra barnets user.
- Komponenter: `ForelderHero`, `PyramidProgress`/`PyramidRow` (`@/components/athletic`); lokal `Stat`, `SectionLabel`. Lucide: ArrowRight, CalendarClock, Coins, Layers, TrendingUp, UserRound.
- Layout og hierarki: `ForelderHero` (eyebrow + "Mine *barn*") → ul med kort: topp (avatar-initial + navn + HCP + ArrowRight) → pyramide-snapshot (siste 30 d) → 3-kolonne dl (Økter · Neste · Utestående, sistnevnte rød ved alert). Hele kortet er én `Link`.
- Tilstander: empty (0 barn → dedikert dashed-kort med UserRound) finnes; per-kort empty (0 økter → "Ingen fullførte økter ennå"). loading via `loading.tsx`. error MANGLER (ikke relevant read-only).
- Interaksjoner: kort → `/forelder/barn/{id}`.
- AK-domene vist: pyramide (FYS/TEK/SLAG/SPILL/TURN med prosent+antall), HCP, økt-telling, utestående beløp (øre→kr).
- Designfil-referanse: peker i kommentar til `public/design-handover/_prompts/SKJERMER-RUNDE-8-FORELDRE-MARKETING-MISC.md` (prompt, ikke .dc.html). Nærmeste rendrede fasit: `Forelderportal (terminal-lys).dc.html`.
- Nåværende designkvalitet: ferdig — ren athletic-bruk, tokens, ingen hex. Konsistent med DS.
- Redesign-prioritet: P2

---

### /forelder/barn/[childId]
- Fil: `src/app/forelder/barn/[childId]/page.tsx`
- Flate: Forelderportal (lyst, men hero er forest-gradient mørk)
- Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })` + `assertBarnTilhorerForelder(user.id, childId)` → `notFound()` hvis ikke tilhører/ikke PLAYER.
- Jobb (1 setning): Read-only barn-profil med fane-navigasjon (oversikt/uke/mål/økonomi) over treningsplan, runder, mål og betalinger.
- Data vist (felt → kilde): barn.user (navn, hcp, homeClub), trainingPlans (aktiv, sessions+log), goals (ACTIVE), rounds (score, sgTotal), payments; aggregert uke-data (totalMinutter, snittRating) fra `trainingPlanSessionLog` siste 28 d. Tab via `?tab=`.
- Komponenter: lokal `HybridKpi`. Lucide: ArrowLeft, Calendar, Target, Star, TrendingUp, CreditCard, Activity, Flag. Pyramide rendret lokalt (egne bars, IKKE `PyramidProgress`).
- Layout og hierarki: tilbake-lenke → forest-gradient hero-kort (avatar + navn + HCP/tier/klubb + 3 KPI: HCP/Runder/Snitt SG) → pyramide-balanse-kort → sesongmål-kort (betinget) → fane-rad (border-b) → tab-innhold. Primær nav = faner.
- Tilstander: notFound (gating) finnes; per-seksjon empty ("Ingen aktiv plan", "Ingen runder registrert", "Ingen mål satt", "Ingen fakturaer registrert") finnes. loading/error MANGLER på tab-nivå (server-render).
- Interaksjoner: faner → `?tab=`-lenker; tilbake → `/forelder/barn`.
- AK-domene vist: HCP, SG (sgTotal snitt + per runde), pyramide-balanse (FYS/TEK/SLAG/SPILL/TURN %), sesongmål (type, targetValue), økt-rating (n/5), PaymentStatus.
- Designfil-referanse: ingen direkte .dc.html match; nærmeste `Forelderportal (terminal-lys).dc.html`.
- Nåværende designkvalitet: inkonsistent — sterkest gjeld i flaten. (1) Hero bruker hardkodet hex/rgba (`#003d2d`, `var(--lime)`, `var(--forest)`, `rgba(0,0,0,0.25)`, `linear-gradient`) i strid med token-regelen (designsystem.md forbyr hardkodet hex i ny UI). (2) Sesongmål-fremdriftsbar er hardkodet `width: "40%"` placeholder (kommentert "ingen currentValue i modellen") — vises som ekte data. (3) Egen pyramide-render duplikerer `PyramidProgress`. (4) Tier-label hardkodet "PlayerHQ".
- Redesign-prioritet: P1

---

### /forelder/bookinger
- Fil: `src/app/forelder/bookinger/page.tsx`
- Flate: Forelderportal (lyst)
- Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })`; `export const dynamic = "force-dynamic"`
- Jobb (1 setning): Read-only innsyn i barnas bookede timer — mini ukekalender + kommende/tidligere bookinger som kort.
- Data vist (felt → kilde): `prisma.booking` per barn (serviceType.name/durationMin, location.name, coach.name, status, startAt); kommende (gte now, PENDING/CONFIRMED) + tidligere (lt now el. COMPLETED/CANCELLED). barn via `hentBarnForForelder`.
- Komponenter: `AthleticEyebrow` (`@/components/athletic`); lokal `BookingCard`, `IngenBarn`. Lucide: CalendarDays, ChevronLeft, ChevronRight.
- Layout og hierarki: editorial H1 ("Bookinger & *øktplan*") → mini ukekalender-kort (måned + chevrons (dekorative, ikke-funksjonelle) + 7-dagers grid med booking-prikker + legende økt/turnering) → "Kommende bookinger" liste → "Tidligere bookinger" (dempet) → lesemodus-notis.
- Tilstander: empty (0 barn → `IngenBarn`; 0 kommende → dashed CalendarDays-kort) finnes; tidligere vises betinget. loading via `loading.tsx`. error MANGLER.
- Interaksjoner: ingen funksjonelle — chevrons og kort er ikke-klikkbare (bevisst read-only). "Spilleren booker selv fra sin profil".
- AK-domene vist: booking/økt-type, coach, lokasjon, BookingStatus.
- Designfil-referanse: ingen direkte .dc.html; nærmeste `Flyt - Forelder og Marketing (terminal-lys).dc.html` / `Forelderportal (terminal-lys).dc.html`.
- Nåværende designkvalitet: ferdig — tokens, athletic eyebrow, ingen hex. Mindre UX-gjeld: kalender-chevrons ser interaktive ut men gjør ingenting (ingen disabled/aria-hint).
- Redesign-prioritet: P2

---

### /forelder/okonomi
- Fil: `src/app/forelder/okonomi/page.tsx`
- Flate: Forelderportal (lyst)
- Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })`; `dynamic = "force-dynamic"`
- Jobb (1 setning): Read-only sammendrag av barnas økonomi — abonnement-status (tier/credits/neste trekk) + utestående + siste betalinger; full historikk på /forelder/fakturaer.
- Data vist (felt → kilde): `prisma.subscription` (tier, status, currentPeriodEnd, monthlyCredits, creditsRemaining) + `prisma.payment` per barn. KPI: utestående (PENDING/FAILED-sum), betalt totalt (SUCCEEDED), aktive pakker (monthlyCredits>0).
- Komponenter: `ForelderHero`, `AthleticBadge`, `KpiCard`, `KpiStrip` (`@/components/athletic`); lokal `PanelHead`, `AbonnementRad`, `IngenBarn`. Lucide: AlertTriangle, ChevronRight, Coins, CreditCard, ReceiptText, Sparkles, Wallet.
- Layout og hierarki: `ForelderHero` ("Abonnement *og betaling*") → utestående-varselbanner (betinget, lenke til /fakturaer) → 3 KpiCard-strip → abonnement-per-barn-panel → siste 4 betalinger-panel ("Se alle" → /fakturaer) → lesemodus-notis.
- Tilstander: empty (0 barn → `IngenBarn`; 0 betalinger → Wallet-tomtilstand) finnes; utestående-banner betinget. loading via `loading.tsx`. error MANGLER.
- Interaksjoner: varselbanner + "Se alle" → `/forelder/fakturaer`.
- AK-domene vist: Tier, SubscriptionStatus, credits (igjen/månedlig), PaymentStatus, øre→kr.
- Designfil-referanse: nærmeste `Forelderportal (terminal-lys).dc.html` (ingen dedikert økonomi-.dc.html i gjeldende handover).
- Nåværende designkvalitet: inkonsistent — to brudd: (1) `tierLabel()` returnerer **"Performance Pro"** for PRO-tier — design-porting-gate (LÅST) forbyr eksplisitt «Performance Pro» som app-nivå-label; Performance/Pro er coaching-pakker, ikke app-nivåer. (2) Overlapper /forelder/fakturaer i scope (begge lister betalinger). Ellers ren athletic-bruk, ingen hex.
- Redesign-prioritet: P1 (tekst-bruddet bør rettes ved første touch)

---

### /forelder/coach
- Fil: `src/app/forelder/coach/page.tsx`
- Flate: Forelderportal (lyst) — **stub**
- Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })`; `dynamic = "force-dynamic"`
- Jobb (1 setning): Placeholder for coach-dialog — setter forventning ("kommer Q3 2026") + CTA til support.
- Komponenter: `ForelderHero`, `EmptyState` (`@/components/shared/empty-state`). Lucide: MessageSquare, Users.
- Layout og hierarki: `ForelderHero` ("Dialog med *coach*") → `EmptyState` (MessageSquare, "Coach-dialog kommer Q3 2026", CTA mailto support).
- Tilstander: kun empty/coming-soon. Ingen data, ingen interaksjon utover mailto.
- AK-domene vist: ingen.
- Designfil-referanse: ingen prototype (funksjon ikke bygget).
- Nåværende designkvalitet: ferdig som stub — ren `EmptyState`-bruk.
- Redesign-prioritet: P3 (stub; venter på funksjon)

---

### /forelder/ukerapport
- Fil: `src/app/forelder/ukerapport/page.tsx`
- Flate: Forelderportal (lyst)
- Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })`; `dynamic = "force-dynamic"`
- Jobb (1 setning): Read-only ukesoppsummering — "Denne uka" (3 stat) + coach-kommentar + ukens høydepunkt.
- Data vist (felt → kilde): ukenummer, childFirstName, oktFullfort, trentTimer, ukeSg, coachNote (body/author), hoydepunkt (testNavn/score) → `hentForelderUkerapport(user.id)`.
- Komponenter: lokal `Stat`. Lucide: Star.
- Layout og hierarki: eyebrow (mono "Uke N · navn") → H1 "Ukerapport" → "Denne uka"-kort (3 stat: Økter/Trent/SG) → coach-kommentar-kort (betinget) → høydepunkt-kort (betinget).
- Tilstander: empty (ingen barn → tekst-fallback) finnes; coachNote/hoydepunkt betinget. loading via `loading.tsx`. error MANGLER.
- Interaksjoner: ingen.
- AK-domene vist: SG (uke-SG med fortegn), økt-telling, trente timer, test/høydepunkt-score.
- Designfil-referanse: `public/design-handover/Onboarding-gap og Forelder long-tail (terminal-lys).dc.html` (nevnt i fil-kommentar, rute /foreldre/rapport/[id]).
- Nåværende designkvalitet: ferdig — tett mot fasit, tokens, ingen hex. Smal `max-w-[440px]`.
- Redesign-prioritet: P2

---

### /forelder/fakturaer
- Fil: `src/app/forelder/fakturaer/page.tsx`
- Flate: Forelderportal (lyst)
- Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })`
- Jobb (1 setning): Read-only fakturahistorikk på tvers av barn med KPI (betalt hittil / neste forfall) + datert betalingsliste.
- Data vist (felt → kilde): `prisma.payment` per barn (amountOre, status, description, booking.serviceType.name, type, createdAt, user.name), take 50. KPI: totalBetalt (SUCCEEDED), nesteForfall (PENDING/FAILED).
- Komponenter: ingen athletic-import; alt lokalt. Lucide: ingen (rene tekst/box-celler). Lokal `ore()`, `statusPille()`.
- Layout og hierarki: editorial H1 ("Fakturaer & *økonomi*") → 2-kolonne KPI (Betalt hittil / Neste forfall, sistnevnte warning-tonet boks) → fakturahistorikk-liste (dato-boks + beskrivelse + beløp + status-pille) → lesemodus-notis (mailto hei@akgolf.no).
- Tilstander: empty (0 betalinger → "Ingen fakturaer registrert"; 0 barn → childIds tom → tom liste) finnes. loading via `loading.tsx`. error MANGLER.
- Interaksjoner: mailto-lenke. Ingen nedlasting/PDF av faktura.
- AK-domene vist: PaymentStatus, øre→kr, booking-servicetype.
- Designfil-referanse: nærmeste `Forelderportal (terminal-lys).dc.html` (ingen dedikert billing-.dc.html i gjeldende handover; arkiverte `40-foreldre-billing.html` er forbudt referanse).
- Nåværende designkvalitet: ferdig, men: (1) "Neste forfall"-boks bruker hardkodet `rgba(184,133,42,...)` inline i stedet for `bg-warning/*`-token (mindre token-brudd). (2) Scope overlapper /forelder/okonomi.
- Redesign-prioritet: P2

---

### /forelder/varsler
- Fil: `src/app/forelder/varsler/page.tsx`
- Flate: Forelderportal (lyst)
- Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })`
- Jobb (1 setning): Varsel-preferanser per barn (foreløpig read-only toggles) + feed av siste varsler for barna.
- Data vist (felt → kilde): `prisma.notification` per barn (title, body, type, createdAt, user.name), take 8. barn via `hentBarnForForelder`. Toggles fra statisk `KANALER`-liste.
- Komponenter: `ForelderHero`. Lucide: Bell, Mail, MessageSquare, Calendar, CheckCircle2.
- Layout og hierarki: `ForelderHero` ("Velg hva du vil *varsles om*") → "kommer i Spor 1"-info-banner (viser user.email) → per-barn toggle-kort (4 kanaler, checkboxes **disabled defaultChecked**) → "Siste varsler"-feed (ikon per type).
- Tilstander: empty (0 barn; 0 varsler → "Ingen varsler å vise") finnes. loading via `loading.tsx`. Toggles er disabled (funksjon ikke koblet) — ingen success/error.
- Interaksjoner: ingen funksjonelle (toggles disabled); mailto via e-post implisitt.
- AK-domene vist: NotificationType (MESSAGE/BOOKING/PAYMENT/…), per-barn relationship.
- Designfil-referanse: nærmeste `Forelderportal (terminal-lys).dc.html` (arkivert `39-foreldre-varsler.html` forbudt).
- Nåværende designkvalitet: halvferdig — toggles er rene disabled-checkboxes (ikke DS-switch som i samtykke/innstillinger), gir inkonsistent toggle-idiom på tvers av forelder-flatene. Funksjon ikke koblet (Spor 1).
- Redesign-prioritet: P2

---

### /forelder/samtykke
- Fil: `src/app/forelder/samtykke/page.tsx` (+ `samtykke-form.tsx`, `data-actions.tsx`, `actions.ts`)
- Flate: Forelderportal (lyst) — **GDPR-kjerneflate**
- Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })`
- Jobb (1 setning): Administrer datasamtykker per barn (foto/video, datadeling, nyhetsbrev, tredjepart) + GDPR-handlinger (eksport/sletting) + datapolicy.
- Data vist (felt → kilde): `prisma.parentRelation` (approved) → child.preferences (samtykke-flagg); siste DELETE-forespørsel fra `prisma.dataExportRequest`. `alleAktive` beregnes fra requiredKeys (dataDeling/fotoBruk/thirdParty).
- Komponenter: `SamtykkeForm` (client, server-action `lagreSamtykker`), `DataActions` (client, `beOmDataSletting`). Lucide: Activity, Check, Mail, Package, Shield, Video.
- Layout og hierarki: H1 ("Personvern & *samtykke*") → "alle aktive"-suksessbanner (betinget) → visuell datatillatelse-oversikt (4 rader m/ ikon + **dekorativ** toggle, `aria-hidden`) → verge-ansvar-info → per-barn samtykke-skjemaer (ekte checkboxes + "Lagre samtykker") → `DataActions` (GDPR-eksport-lenke + slette-knapp m/ kvittering) → datapolicy (EU/EØS, Supabase Frankfurt, mailto personvern@akgolf.no, AuditLog).
- Tilstander: success (form: "Samtykker lagret"; sletting: kvitteringsbanner) finnes; error (form + data-actions catch) finnes; empty (0 barn → "Ingen tilknyttede barn") finnes; loading (`useTransition` pending: "Lagrer …"/"Sender forespørsel …") finnes. **Mest komplette tilstandsdekning i flaten.**
- Interaksjoner: checkbox-toggle → lagre (server-action + router.refresh); GDPR-eksport → `/forelder/samtykke/eksport`; slette → `beOmDataSletting`.
- AK-domene vist: ingen golf-domene; GDPR/samtykke-domene (preferences, AuditLog, dataExportRequest).
- Designfil-referanse: `public/design-handover/Onboarding-gap og Forelder long-tail (terminal-lys).dc.html` (samtykke/onboarding-fasit; arkivert `38-foreldre-samtykke.html` forbudt).
- Nåværende designkvalitet: ferdig (mest moden flate). Mindre friksjon: **to toggle-idiomer** på samme side — øverste visuelle toggles er dekorative (aria-hidden, ikke styrbare) mens de ekte kontrollene er checkboxes lenger ned; kan forvirre (ser ut som man kan trykke øverst). `DataActions` bruker hardkodet rgba inline (destructive/success-toner) i stedet for tokens.
- Redesign-prioritet: P1 (GDPR-kritisk + dobbelt toggle-idiom bør samles)

---

### /forelder/innstillinger
- Fil: `src/app/forelder/innstillinger/page.tsx`
- Flate: Forelderportal (lyst)
- Rolle/gating: `requirePortalUser({ allow: ["PARENT"] })`; `dynamic = "force-dynamic"`
- Jobb (1 setning): Konto, koblede barn (samtykke-kontekst), varseltyper og kontosikkerhet for forelder-rollen.
- Data vist (felt → kilde): user (name/email/phone/avatarUrl) fra `requirePortalUser`; barn[] (`hentBarnForForelder`); statisk `VARSEL_TYPER`-liste (read-only "På"-status).
- Komponenter: `ForelderHero`, `AthleticBadge`; lokal `InfoRad`, `KontoLenke`. Lucide: Bell, ChevronRight, Lock, LogOut, Mail, Phone, ShieldCheck, User, Users.
- Layout og hierarki: `ForelderHero` ("Konto og *varsler*", med avatar) → kontaktinfo-panel ("Rediger" → /portal/meg) → koblede-barn-panel ("Se alle" → /forelder/barn, badge "Koblet") → varsler-panel (4 typer, read-only "På", badge "På e-post") → konto-panel (Endre passord, 2FA, Logg ut).
- Tilstander: empty (0 barn → tekst) finnes. loading via `loading.tsx`. success/error MANGLER (ingen redigering i siden — alt lenker ut).
- Interaksjoner: "Rediger" → `/portal/meg`; "Se alle" → `/forelder/barn`; passord/2FA → `/portal/meg/innstillinger/sikkerhet`; Logg ut → `/auth/login`.
- AK-domene vist: ingen golf-domene; konto + samtykke-kontekst (koblede barn).
- Designfil-referanse: nærmeste `Forelderportal (terminal-lys).dc.html`.
- Nåværende designkvalitet: ferdig — konsistent panel-mønster, tokens, athletic-badges. Merk: konto-handlinger lenker til `/portal/meg/*` (PlayerHQ-flate) — forelder sendes ut av forelder-shell for passord/2FA/profil (delt konto-flate, kan oppleves som kontekst-hopp).
- Redesign-prioritet: P2
