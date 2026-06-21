# KONFLIKTER.md — Design vs kode

Steg 2 av handover-prompten. Avvik mellom det BYGGEORDRE/designet beskriver og det som finnes i koden.
**Regel:** Datastruktur/enums/rute-segmenter → koden vinner. Visuelt/layout/tekst/flyt/knapp-destinasjon →
designet vinner. Workbench → spør Anders ved kollisjon.

Kolonner: **Alvorlighet** (Blokkerende / Høy / Lav) · **Beslutning** (Kode / Design / **Anders**).
Oppdatert 2026-06-21 med full kodebase-revisjon (7 parallelle agenter). K-01–K-11 var Phase 0-shell; status nedenfor er re-verifisert.

---

## ✅ ANDERS' BESLUTNINGER (2026-06-21) — låst

1. **K-09 Anlegg-kanon → `/admin/anlegg`.** Port inn det beste fra `facilities/[id]` (868 l) FØR den fjernes. REPEK all nav (`admin-nav.ts:190`, `gjennomfore`, `mer`, `facilities:209`, søk) direkte til `/admin/anlegg`.
2. **K-14 Handlingssenter = samle-flate.** Rydd dobbel-redirect (proxy.ts vs next.config.ts); de ekte sidene skal være nåbare. Konsolider innboks+kommunikasjon+queue+foresporsler+godkjenninger.
3. **K-02 Plan-maler → `/admin/plan-templates` kanon.** Flytt/fjern rester av `plans/templates/[id]/*`.
4. **K-07 PlayerHQ kalender:** Claude avgjør kanon fra koden (ekte vs redirect-fil).
5. **K-15 Pris → 300 kr/mnd (ingen endring).** Kodens 300 er riktig; den nye MASTER-pakkens «299/2690» **overstyres** — ikke endre Stripe/pris-UI til 299. (Oppdater evt. handover-tekst, ikke koden.)
6. **K-18 analytics (død) + K-16 baneguide → FJERN** (godkjent).

### Fortsatt åpne (uendret regel)
7. **K-11 Workbench:** all funksjonsendring krever Anders' godkjenning.
8. **K-12 FYS-resultatformel:** parkert — plassholder-tall, ingen referanseverdier hardkodes.
9. **K-04 A–K snittscore-bånd:** 0 kode; venter på Anders' 11 grenser.

Alt annet enn 7–9 tar jeg som rene visuelle/layout/tekst-valg selv (per konflikt-styringen).

---

# A · RUTE-KONFLIKTER

## K-16 · Banekart/baneguide (UpGame-stil) — FJERN (Høy · Design)
Bekreftet baneguide som skal bort i V1 (MASTER §5):
- `src/app/portal/mal/baner/page.tsx` (bane-bibliotek) + `baner/[id]/page.tsx` + `[id]/tabs.tsx` (faner «Hull-for-hull / Tidslinje / Strategi-notater / Foto», hardkodet «Vind fra vest favoriserer hull 9–12…»).
- Inngang: «Baner»-fane i `src/app/portal/mal/layout.tsx:10`.
- **Anbefaling: FJERN** alle tre + «Baner»-fanen.
- ⚠ **IKKE forveksl:** `portal/mal/runder/[id]/upgame-import-modal.tsx` er CSV-import av UpGame-RUNDEDATA, ikke baneguide → **BEHOLD**.

## K-17 · Dublett-kalendere — nesten løst, 2 lenker repekes (Lav · Design)
- Ekte: `admin/kalender/` (uke) + `kalender/maned/` + `kalender/uke/` (redirect). Stubs `admin/calendar/*` redirecter allerede.
- **REPEK:** `src/components/admin/calendar-view-toggle.tsx:12` og `admin/kalender/kalender.tsx:204` lenker «Måned» → `/admin/calendar/maned` (ekstra hopp). Repek → `/admin/kalender/maned`, så kan `admin/calendar/*`-stubbene fjernes.

## K-09 · Anlegg-dublett (Høy · **Anders** → /admin/anlegg)
Fire ekte ruter: `admin/anlegg`(+[id]), `admin/facilities`(+[id]), `admin/locations`, `admin/services` (egen ting, behold).

**✅ GJORT (commit 824b990c):** Nav repeket til `/admin/anlegg` (admin-nav:190, gjennomfore:95, mer:81, search:66-67 → én Anlegg-rad). Typo `/admin/bookings`→`/admin/bookinger` i anlegg/[id] (K-20). next.config redirecter allerede `/locations`+`/facilities` → `/anlegg` — dobbel-hopp borte.

**KORRIGERT FUNN (motsier «868 l mest komplette CRUD»):**
- Ekte **Facility-CRUD** (`createFacility`/`updateFacility`/`deleteFacility`) + Location-CRUD bor i **`locations/actions.ts` + `locations/location-form.tsx`** — DELT infrastruktur brukt av anlegg/page (LocationForm) + facilities/page. **Kan IKKE slettes** — må flyttes.
- `facilities/[id]/page.tsx` (868 l) er **IKKE CRUD** — en read-only uke/måned-kalender på *lokasjons*-nivå bookinger (Booking mangler facilityId, demo-kommentar linje 393) + **hardkodet demo-gruppedata** (WANG/GFGK). Unik kapabilitet (uke/måned-grid) overlapper `/admin/kalender`. **Anbefaling: DROPP (ikke port) — porting ville dratt demo-cruft inn i kanon-flaten.**
- `facilities/page.tsx` + `facility-quick-add` + `multi-facility-week` = gammel fasilitet-liste; ikke importert utenfor `facilities/`.

**✅ FERDIG (commit f77438a4):** Flyttet `locations/actions.ts` → `anlegg/location-actions.ts` + `location-form.tsx` → `anlegg/location-form.tsx` (CRUD bevart; LocationForm gir fasilitet-add i anlegg-flaten). Slettet `locations/page.tsx` + hele `facilities/` (liste + [id]-demokalender + helpers). revalidatePath/redirect → `/admin/anlegg`. next.config-redirects beholdt (`/locations`+`/facilities` → `/anlegg`). Build grønn. **K-09 lukket.**

## K-02 · Plan-maler-dublett (Høy · **Anders**) — se STOPP #3
`admin/plan-templates/*` (ekte) er kanon. `admin/plans/templates/page.tsx` er redirect-stub, men `plans/templates/[id]/effectiveness|rediger|ny` finnes fortsatt som ekte filer. **REPEK inbound:** `admin/spillere/[id]/effekt-tab.tsx:153`, `plans/[planId]/actions.ts:933`. Flytt/fjern resten.

## K-18 · Analyse-flater — én er død kode (Høy · Design + Anders)
Fem ulike flater (ikke ren dublett): `analyse` (Stall-analyse, ekte) · `lag-snitt` (Pyramide/gruppe, ekte) · `analysere` (innsikt-HUB) · `analytics` (848 l, redirectet) · `reports` (ekte CSV).

**✅ analytics FJERNET (commit 6e524a3f):** `analytics/page.tsx` (848 l, redirectet av next.config:47) + `loading.tsx` slettet. Den ene inbound-lenken «Se effekt-historikk» (`template-detail:179`, `/admin/analytics?templateId=X` — templateId tapt i redirecten) → `/admin/plan-templates/[id]/effectiveness` (ekte side). **KORREKSJON:** `analytics/actions.ts` var IKKE død — `eksport-modal` importerer `exportAnalyticsReport` derfra. Beholdt (kun server-actions-modul nå, ingen rute). next.config-redirects beholdt.

**GJENSTÅR (Fase 4):** samle `analyse`+`lag-snitt`+`reports`+`tester`+`runder` til én fane-flate; `analysere`-hub blir overflødig (REDIRECT inn) når fane-flaten finnes. Skjermbygg, ikke rute-fiks.

## K-14 · Handlingssenter + dobbel-redirect (Blokkerende · **Anders**) — se STOPP #2
- `proxy.ts` (kjører først): `/admin/queue`→`innboks?tab=oppfolging`, `/admin/approvals`→`innboks?tab=godkjennelser`, `/admin/messages`→`innboks?tab=meldinger`.
- `next.config.ts` (nås aldri): `/admin/approvals`→`godkjenninger`, `/admin/messages`→`innboks`. **Motstridende → de ekte sidene `godkjenninger` + `queue` er uoppnåelige via engelske URL-er** (queue kun nåbar via `admin/oppfolging` som re-eksporterer).
- Ekte filer: `innboks` (193 l), `godkjenninger`(+[id]), `queue` (492 l), `foresporsler` (kun SessionRequest), `kommunikasjon` (foreldreløs), `handlingssenter` (Notion-kanban, foreldreløs).
**✅ REDIRECT-BUG FIKSET (commit 4a0dc736) + KORRIGERT FUNN:** `innboks/page.tsx` leser **ikke `?tab`** — den viser kun meldingstråder. Proxy-redirectene var derfor *aktivt ødelagte*: `/admin/queue` + `/admin/approvals` havnet på meldings-innboksen (oppfølgingskø + 6 «venter på godkjenning»-lenker pekte feil). Fjernet proxy-blokken → `/admin/approvals` → `/admin/godkjenninger` (next.config), `/admin/messages` → `/admin/innboks`, `/admin/queue` når sin ekte 492-l side. Build grønn.

**KORREKSJON av anbefalingen:** `innboks` ER den fungerende samle-flaten (ikke `handlingssenter`, som er en *separat* Notion-oppgave-kanban). I nav er «Innboks» allerede en gruppe (Forespørsler + Godkjenninger + Meldinger). **GJENSTÅR (Fase 4 skjermbygg):** den fulle «Handlingssenter som én skjerm» fra design-fasit `Flyt - AgencyOS Handlingssenter` — der avgjøres `handlingssenter`(Notion) vs `kommunikasjon`(foreldreløs) vs `innboks`. Ikke en rute-fiks.

## K-19 · Fysisk-trening egne sider → ett Workbench-kort (Høy · Design)
`portal/tren/fys-plan/page.tsx` + `[planId]/page.tsx` + `actions.ts`. **Anbefaling:** behold serverlogikk/data, fjern egne FYS-nav-punkter, eksponer som ett «generelt»-kort i Workbench (MASTER §5). NB: FYS-formel parkert (K-12).

## K-10 · /(internal)/demos/* + /intern/komponenter/* (Lav · Kode) — uendret
Dev-only, ikke i produkt-nav, auth-beskyttet (`proxy.ts:111`), robots-blokkert. **Behold/ignorer i SKJERM-STATUS.** (NB: gamle demo-navn lever her — se K-22.)

## K-20 · Feilstavede/kuttede ruter — status (Lav→Høy · Kode)
Verifisert nå-status per repek-par:

| Kilde-lenke | Mål finnes? | Status / anbefaling |
|---|---|---|
| `/portal/mal/*` (forside-knapper) | JA (alle ekte) | ✅ OK nå (var døde i handover) |
| `/admin/elever/[id]` | nei (heter `spillere`) | **~18 inbound** bruker fortsatt `/admin/elever/*`; virker via `next.config`-redirect (ett hopp). **REPEK** → `/admin/spillere/[id]` |
| `/admin/bookings` (typo) | nei | `api/stripe/webhook/route.ts:76` lager varsel-link hit; virker via redirect. **REPEK** → `/admin/bookinger` |
| `/portal/abonnement` | **nei (404)** | Eneste forekomst i **død** komponent `components/portal/booking/booking-hub.tsx` (ikke importert). **FJERN død komponent** |
| `/admin/calendar/maned` | redirect-stub | REPEK 2 lenker (K-17) |
| `/admin/plans/templates*` | rester ekte | REPEK 2 lenker (K-02) |

`src/lib/all-routes.ts` er auto-generert og lister stale `/portal/workbench-v2` (finnes ikke) — regenereres med `scripts/extract-routes.ts`.

**✅ GJORT (commit 6485b5e9):** 18 `/admin/elever`→`/admin/spillere` (alle href + revalidatePath); `/elever/[id]/plan` (404) → `/admin/spillere/[id]/workbench`; stripe-webhook `/admin/bookings`→`/admin/bookinger`; `booking-hub.tsx` `DEFAULT_UPGRADE_HREF /portal/abonnement`→`/portal/meg/abonnement`. **KORREKSJON:** `booking-hub.tsx` er IKKE død — `booking-hub-hybrid` importerer typene (HubBooking/HubCredits/HubCoach). Beholdt (fikset lenken i stedet for å slette). Build grønn. **K-20 lukket.**

## K-21 · Døde knapper — ~12 toast-stubs gjenstår (Lav · Design)
Opprydding 18. juni fikset forside + drill-kort + sidebar-pekere. **Gjenstående bekreftet døde** (bevisste «kommer snart»-toasts, ikke 404):
- `admin/grupper/[id]` (`gruppe-actions.tsx`): 4 av 5 («Legg til spiller», «Se alle», «Detaljer», «Åpne»).
- `admin/workspace/oppgaver` (`oppgaver-actions.tsx`): hele flaten (Notion-avhengig — kan være tilsiktet utsatt).
- `admin/gjennomfore` (`gjennomfore-actions.tsx`): «I dag» (toast).
- `admin/tester/[id]` (`tester-detail-actions.tsx`): «Del med spiller» + «Eksporter PDF».
**Anbefaling:** Koble eller fjern hver i Fase 7 (døde-knapper-pass). Notion-avhengige flagges separat.

---

# B · NAVN / IA / TIER

## K-22 · «CoachHQ» i synlig UI → AgencyOS (Høy · Design)
~12 synlige strenger. Viktigst (delt komponent, mest synlig): **`src/components/shared/sidebar-brand.tsx:38`** (`coach: "COACHHQ"` — eyebrow i ALLE admin-sidebars). Andre: eyebrow «COACHHQ · …» i `admin/organisasjon:36`, `analysere:36`, `kommunikasjon:40`, `gjennomfore:37`, `audit-log:80`, `godkjenn-portal:59`, `queue:178`; app-bytter-rad `admin/agencyos/live/data.ts:187`; onboard-wizardene `onboard/klubb/klubb-wizard.tsx:762,873` + `coach-wizard.tsx:588` («gå til Coach HQ»). **✅ GJORT (commit b8f691e5):** Alle 14 synlige strenger → «AgencyOS» (sidebar-brand, 7 eyebrows, app-bytter-label, 3 onboard-wizard-tekster, break-tabell-desc, benchmark-sync:183). Build grønn. **K-22 lukket.** Bevisst urørt (internt, ikke synlig): kode-kommentarer/JSDoc, søke-alias `keywords:["coachhq"]`, intern `key:"coachhq"`, og mappenavn `components/coachhq/` (kosmetisk, 9 importer — kan renames senere).

## K-03 · Tier.ELITE eksisterer + LEKKER til UI (Høy · Design + Kode)
Enum `Tier { GRATIS PRO ELITE }` beholdes teknisk (kan ikke slettes uten migrasjon — koden vinner). **MEN ELITE vises 6 steder (skal aldri):**
- `admin/plans/[planId]/assign-plan-modal.tsx:223` (egen ELITE-pill) · `lib/admin/stallen-data.ts:122` (`TIER_MAP.ELITE`) · `lib/admin/innboks-data.tsx:209` · `lib/admin-workbench/workbench-data.tsx:40` · `components/portal/workbench/player-hero-image.tsx:90` (ELITE-pill i PlayerHQ-hero) · **`admin/hjelp/page.tsx:68` hjelpeartikkel «Pro vs Elite — hva er forskjellen?»** (markedsfører ELITE som nivå — slett).
- Også rå `{tier}` uten klamping: `components/portal/sidebar.tsx:222`.

**✅ GJORT (commit 4729283b):** Alle tier-visninger klampet → **PRO** (ELITE var betalt; feature-flags behandler det som betalt): assign-plan-modal-pill, stallen-data TIER_MAP, innboks-data, workbench-data tierLabel(), player-hero-image-pill, sidebar tier-badge (kun GRATIS→GRATIS, ellers PRO). Hjelp-artikkelen «Pro vs Elite» slettet. Build grønn. **K-03 lukket** (enum beholdes teknisk, men aldri synlig). player-hero-v2/spiller-hero/portal-avatar-button gated allerede på PRO/GRATIS (rendret aldri ELITE). meg-hybrid/profil-rediger klamper ELITE→GRATIS (compliant, urørt — liten visnings-inkonsistens for et tier som aldri forekommer).
- OK (annen betydning, behold): ELITE som coaching-spesialitet (`coach-wizard:54`), HCP-klasse (`domain/hcp.ts`), gruppenavn (GFGK Elite).

## K-15 · Pris 300 vs 299 (Høy · **Anders**) — se STOPP #5
Koden bruker `300` konsekvent (`feature-flags.ts:8`, `admin/agencyos/okonomi/page.tsx:26`, marketing). BYGGEORDRE/MASTER sier 299/mnd + 2690/år. **Avklar — påvirker Stripe + all pris-UI.**

## K-01 · PlayerHQ nav-etiketter (Lav · Design) — uendret
Bunn-nav viser «Planlegge/Gjennomføre»; BYGGEORDRE vil ha «Plan/Gjør». Ruter uendret, kun visningsnavn. `src/components/portal/bottom-nav.tsx:23-24`. Fikses i Fase 2.

## K-23 · PlayerHQ-nav er ALLEREDE forent (Løst — ingen handling)
Re-verifisert: `portal-shell.tsx` rendrer samme `MAIN_ITEMS` (Hjem·Plan·Gjør·Analyse·Meg) på bunn-nav (`md:hidden`), desktop-sidebar (`hidden md:flex`) og hamburger-drawer. **Ingen mobil≠desktop-avvik lenger; ingen kuttede `/portal/mal/*`-lenker i sidebar.** BYGGEORDRE/BRIEF antar dette må fikses — det er allerede gjort (utover etikett-forkortingen i K-01).

## K-06 · AgencyOS-skall matcher 54px-modellen + død nav-kode (Lav · Kode)
- AgencyOS: `agencyos-sidebar.tsx:70` (`w-[54px]`-rail → 244px hover) + `agencyos-mobile-nav.tsx:32` (bunn-nav Oversikt·Stall·Kalender·Innboks·Mer). ✅ matcher låst modell.
- **Død kode:** `components/shared/mobile-bottom-nav.tsx` + `athletic/shell/bottom-nav.tsx` importeres ingen steder. Kanonisk PlayerHQ-bunn-nav = `components/portal/bottom-nav.tsx`. **Anbefaling: slett de to døde** (arkitektur-doc er utdatert her).

## K-22b · Gamle demo-navn (Lav · Design)
Seed/fixtures er **rene** (kun ekte «Markus Røinås Pedersen» — behold). Gjenstår i intern komponent-galleri: «Andreas Kragerud» (`intern/komponenter/agency-kit:107`, `team-bookinger:9,64`), «Andreas» (`daglig-brief:131`, `forelder:9`), «MARKUS R.P.» (`inbox-tester:132`); + `admin/agencyos/live/data.ts:117` («Andreas P.», demo-melding). **Anbefaling:** bytt til kanon (Anders Kristiansen / Øyvind Rohjan) i Fase 7 — lav prio (kun `/intern/*`).

---

# C · TEKST / ORDBOK (Del B er fasit)

## K-24 · Forbudte ord i synlig UI (Lav · Design)
Skilt fra intern kode (enum/rute-segment/variabel = IKKE konflikt). Ekte synlig UI:
- **«elev/elever»→spiller:** `admin/tilstander/page.tsx:38,97,135,141,142`, `portal/booking/coach/[coachId]/page.tsx:220,223`, `admin/teknisk-plan:79`, `admin/innboks:126`. (Rute `/admin/elever` er separat IA-sak, se K-20.)
- **«kortspill»→nærspill:** `portal/booking/anlegg/[anleggId]:108`, `portal/meg/innstillinger/anlegg/fasilitet-profil-form.tsx:87`, `portal/mal/bygger/actions.ts:320,323` (AI-prompt). Marketing: junior/coacher/blogg.
- **«session»→økt:** `admin/hjelp:76,80` («Live Session»), `portal/meg/profil-form.tsx:308`.
- **«stats»→statistikk:** `admin/stats/overview:36,329` + `stats/moderering:21` (browser-titler «Stats … | Admin», engelsk), `components/portal/statistikk/statistikk.tsx:15` (eyebrow «STATS · …»).
- **«goal»→mål:** `admin/reach/page.tsx:246` (`label: "Goals"`).
- **Engelske feilmeldinger:** 0 funnet (UI-feil er på norsk). ✅
**Anbefaling:** rett synlige strenger i berørt fase; ikke rør enum/rute-segment.

## K-25 · Emoji + hjemmetegnede ikoner (Lav→Høy · Design)
- **Emoji/Unicode-symbol i UI (~9 steder):** `admin/innboks/actions.ts:81` («✓ Behandlet»), `godkjenn-portal/koblinger:137` + `review:165` (✓), `workbench-hybrid/CoachSkillWizard:713` + `Statusbar:31` (✓), `test-modul-v2/coach-tester-stall-screen:90,139` (⚠), marketing-stats 🇳🇴, ★ som «beste runde» (`runde-liste:53`, `runde-queue-list:85`). → bytt til Lucide.
- **Hjemmetegnet ikon-bibliotek (Høy):** **`src/components/stats/icon.tsx` — 33 inline-SVG-ikoner («Lucide-inspired»), brukt i 12 filer** (hele marketing-stats). Direkte brudd på «Lucide = eneste ikon-bibliotek». Også `planlegge-v2/icons.tsx`. Grenseland: `stats/flag-glyph.tsx` (landflagg — Lucide har ingen → bevisst unntak).
**Anbefaling:** erstatt `stats/icon.tsx` med Lucide; behold flag-glyph som unntak. Charts/grafer med inline-SVG er IKKE konflikt.

## K-26 · Hardkodede hex i stedet for tokens (Høy · Design)
997 hex-treff i .tsx (eks. token-filer); ~647 i live UI. **Verdiene er rene token-duplikater** (`#005840`=primary 72×, `#d1f843`=accent/lime 48×, `#fafaf7`=background, `#0a1f17`=foreground, `#f1eee5`=secondary, `#a32d2d`=destructive, `#5e5c57`=muted-foreground, `#b8852a`=warning, `#1a7d56`=success). Verste live-filer: `portal/tren/turneringer/[id]/turnering-client.tsx` (47), `onboard/klubb/klubb-wizard.tsx` (35), `onboard/coach/coach-wizard.tsx` (34), `portal/trening/putte-laboratoriet/putte-lab-client.tsx` (26), `portal/meg/innstillinger/integrasjoner` (23), `portal/coach/page.tsx` (21). **Anbefaling:** konverter live PlayerHQ-filer til token-klasser/`var(--*)` (designsystem-regel forbyr løse hex). Demo-flater (`(internal)/demos/*`, ~162) = lavest prio. `flag-glyph.tsx`-hex = nasjonale flaggfarger, unntak.

---

# D · DATA-INTEGRITET (Kode)

## K-13 · Drill-kategori-bug — 809/930 driller usynlige (Høy · Kode)
`ExerciseDefinition.minKategori/maxKategori` har omvendt range på flertallet av driller → matcher ingen spiller i AI-plan-filteret (`ai-plan/context.ts:228-308`). QA: `npm run qa:drills` (`scripts/drill-qa.ts:147`). **Anbefaling:** fiks-script som snur min/maks der `idx(min) > idx(max)` (Fase 4-tester/drills). Også: 0 video-dekning, blokk-skjevhet. Re-verifiser tall mot live DB.

## K-05 · To live-session-system (Lav · Kode) — uendret
Spor A (`TrainingPlanSession`, `/portal/live`) + Spor B (`TrainingSessionV2`, `/admin/live`) sameksisterer BEVISST. Ikke merge uoppfordret. Bygg Spor A visuelt fra «Live-okt v2»-referansen.

## K-27 · Frakoblede ferdige moduler (Lav · Kode — info)
Bygd men null konsument (jf. DATA-INVENTORY): `domain/sg.ts` (per-slag-SG), `sg-benchmarks.ts` (krise-diagnose), `portal-trackman/session-analysis.ts` (TrackMan bag-analyse — fordi `TrackManShot` aldri fylles). **Ikke konflikt med design**, men nøkkel-info: rik analyse finnes, men datakilden mangler. Kobles i kjernemotor-/TrackMan-fasen.

---

## Uendrede Phase 0-poster (re-verifisert)
- **K-04** A–K snittscore-bånd → STOPP #8 (0 kode, venter 11 grenser).
- **K-07** PlayerHQ kalender-kanon → STOPP #4 (ikke re-verifisert dypt — bekreft mot skjermkart).
- **K-08** `/portal/tren/ovelser` (redirect) vs `/portal/coach/ovelser` (aktiv) → drill-kort peker nå riktig `/portal/drills` (K-21). Bekreft endelig kanon mot skjermkart.
- **K-11** Workbench → STOPP #6 (Blokkerende, all funksjonsendring til Anders).
- **K-12** FYS-resultatformel → STOPP #7 (parkert, plassholder-tall).

---

## Åpne spørsmål — send til Anders (samlet)
1. **Anlegg-kanon** (K-09): `/admin/anlegg` eller `/admin/locations`? Skal `facilities/[id]` (868 l) porteres inn først?
2. **Handlingssenter** (K-14): bekreft `handlingssenter` som samle-flate + hvilket redirect-lag som ryddes.
3. **Plan-maler** (K-02): bekreft `/admin/plan-templates` kanon.
4. **PlayerHQ kalender** (K-07): `/portal/kalender` eller `/portal/tren/kalender`?
5. **Pris** (K-15): 299 kr/mnd (brief) eller 300 kr (kode)?
6. **A–K-grenser** (K-04): de 11 snittscore-grensene (når klart).
7. **Workbench** (K-11): godkjenning kreves per funksjonsendring.

> Etter din avklaring på 1–5 fortsetter jeg autonomt gjennom Fase 1→7 (rene visuelle/layout/tekst-valg tar jeg selv), og stopper igjen før Workbench-kollisjon og før prod-deploy/Stripe-live.
