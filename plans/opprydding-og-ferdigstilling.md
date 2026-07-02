# Opprydding og ferdigstilling — akgolf-hq

**Dato:** 2026-07-02 · **Kilde:** full analyse av akgolf-hq-main.zip (1984 TS/TSX-filer, 422 ruter)
**Svar på hovedspørsmålet:** 166 filer er verifisert trygge å slette + 138 komponentfiler med grep-bevis (slettes batch-vis med build-verifisering). Gjenstående bygging før lansering: ca. 20 timer Claude Code-fart med anbefalte kutt, ca. 32 timer uten kutt.

---

## GJENNOMFØRT 2026-07-02 — FASE 1 + FASE 2 ferdig, FASE 3 IKKE rørt

Alle 8 steg (STEG 1–8) i denne planen er kjørt, hvert grep-bevis re-verifisert mot repoet før sletting (repoet hadde endret seg siden analysen som ga 138/144-tallet). Alle batcher verifisert med `prisma validate/generate + tsc --noEmit + npm run build + npm test` (299/299, ikke 244 — testsuiten har vokst siden planen ble skrevet). Hver batch egen commit, pushet fortløpende til `main` på `akgolfsoftware/Golf_Headquarters`.

**Avvik fra planens tall (ingen blokkerte, alle notert underveis):**
- 1C-lista sa «138» i overskriften, men den faktiske kodeblokken inneholdt **144** filer. Prosessert alle 144 minus de 3 bekreftet levende blogg-komponentene = **141 kandidater** behandlet.
- `.agents`-fjerningen avdekket at `eslint.config.mjs` faktisk hadde en ignore-referanse til `.agents/**` (planen sa «ingen config refererer»). Fjernet linjen i samme commit. Feilet først ved å også fjerne `_archive/**`-ignoreren — den var fortsatt nødvendig fordi gitignored disk-rester av `_archive/` består lokalt selv om git-sporingen er fjernet. Rettet før commit.
- FASE 2B fant at hele `design-system/components/Coach/`-settet (3 filer: player-pipeline, risk-heatmap, stable-matrix) også var uten treff i design-handover — planen nevnte kun Gamification/Data-viz. Migrert til `public/design-handover/migrert-fra-design-system/` sammen med de opprinnelige 11 (7 Gamification + 4 Data-viz) = 14 filer totalt, lokalt/gitignored.
- Under komponent-sletting (STEG 7) trigget push-hooken **faktiske produksjons-deploy-forsøk** på Vercel hver gang filantallet falt under Vercels 15000-graense (som tidligere blokkerte den helt). Disse ble avbrutt (`vercel remove`) etter hver push etter avklaring med Anders — ingen av dem rakk å gå live.

**LEVENDE-funn (unntak fra slettelisten, med bevis):**
- `src/components/blogg/Sammendrag.tsx`, `Stat.tsx`, `Quote.tsx` — importert direkte av `mdx-components.tsx` (repo-rot, utenfor `src/`) og brukt globalt i alle `content/blogg/*.mdx`. Planen markerte disse USIKKER; bekreftet levende, ikke slettet.
- `src/components/athletic/data/index.ts` — re-eksportert som `./data` fra `src/components/athletic/index.ts`. Brakk build ved første forsøk (batch 4), gjenopprettet umiddelbart, ikke i noen slettet batch.
- `src/components/coachhq/` — 14 filer (shell.tsx, top-bar.tsx, tabs.tsx, tournament-enroll-modal.tsx m.fl.) er FORTSATT I BRUK, importert av bl.a. admin/plans/[planId]/page.tsx og admin/tournaments/[id]/page.tsx. Kun de 13 navngitte filene i FASE 1-listen ble slettet. Navnet "coachhq" i mappestien er historisk (appen heter AgencyOS), men innholdet er levende kode, ikke død — omdøping er en egen FASE 3/4-jobb, ikke en sletting.

**Åpne spørsmål avklart av Anders i denne økten (overstyrer planens spørsmål 1–3 nedenfor):**
1. `.agents/skills/` → SLETTET (byte-identisk med `.claude/skills/`, ingen andre verktøy leser den).
2. `supabase-meg/` → BEHOLDT (egen Supabase-instans for Meg-assistenten). Ikke rørt.
3. `/kommando` vs `/admin/workspace` → `/admin/workspace` vinner. `/kommando` er IKKE slettet denne økten — fått TODO-kommentar øverst i `src/app/kommando/page.tsx` som peker hit. DB-koblingen migreres inn i `/admin/workspace` i en egen bygge-økt, deretter slettes `/kommando`.
4. CoachHQ-komponentene i 138/144-lista → de 13 navngitte komponentfilene i FASE 1-listen er slettet (inkl. de to panelene med CoachNote/Message-TODO-er — disse TODO-ene gjaldt uimplementerte Prisma-modeller, ikke gjenbruksplaner for selve komponentene). Resten av mappa (14 filer) er fortsatt i bruk og IKKE slettet — se LEVENDE-funn over.

**Ikke rørt denne økten (per instruks):** FASE 3 (bygging/P0-P2), `docs/` rotnivå-opprydding (1B), `tests/e2e/` vs `e2e/`-sammenslåing (1B), `src/app/dev-banekart/` (1B).

---

## FASE 1 — SLETT (verifisert med grep)

Metode: hver kandidat er greppet mot `src/`, `scripts/`, `tests/`, `e2e/`, `mdx-components.tsx`, `package.json`, `next.config.ts` og `.claude/rules/`. «Null treff» betyr null import-/path-referanser utenfor kandidaten selv.

### 1A. Sikre slettinger — 166 filer

| Sti | Filer | Bevis |
|---|---|---|
| `_archive/` | 71 | Grep `_archive` i src/scripts/package.json/next.config.ts → 0 treff. Gitignore-kommentar sier eksplisitt «fjernes etter lansering» — den er fortsatt git-tracked fordi ignoreringen kom etter commit. |
| `design-system/` | 69 | Grep `design-system/components` i hele repoet (ts/tsx/mjs/md) → 0 treff. Erklært sannhet er `public/design-handover/` (LÅST regel i CLAUDE.md + design-porting-gate). **Forbehold:** kjør 2B-migreringssjekk først. |
| `.design-review/` unntatt `claude-code-handoff/` | 20 | Grep `.design-review` → kun 2 treff, begge peker på `claude-code-handoff/screens`. Rot-dc.html-prototypene og `_ds/`-eksporten har 0 referanser. |
| `content/blog/` (ikke blogg) | 3 | Leses kun av `src/lib/blog.ts`. |
| `src/lib/blog.ts` | 1 | Grep `lib/blog` → kun blogg-treff (`lib/blogg/posts`). Ingen importerer blog.ts. Levende blogg er `content/blogg/` + `src/lib/blogg/posts.ts` + `/(marketing)/stats/blogg`. |
| `src/data/blog-posts.ts` | 1 | Grep `blog-posts` og `blogPosts` i src → 0 treff. `/(marketing)/blogg` leser fra sin egen lokale `./posts.ts`. |
| `prisma/_archived_init_20260505/` | 1 | Grep `_archived_init` utenfor prisma → 0 treff. Migrasjonshistorikken lever i `prisma/migrations/0_baseline`. |

### 1B. USIKKER — spør Anders før sletting

| Sti | Filer | Hvorfor usikker |
|---|---|---|
| `.agents/skills/` | 75 | Alle 14 skill-mapper er byte-identiske med `.claude/skills/` (verifisert med `diff -rq`). Ingen config refererer `.agents/`. MEN: `.agents/` er standardkonvensjon for enkelte andre agent-CLI-er. Hvis du kun bruker Claude Code: slett. Hvis Kimi Code CLI leser `.agents/`: behold. |
| `supabase-meg/` | 7 | 0 kodereferanser, men `/meg`-ruten og `scripts/meg-*` er aktive. Trolig migrasjoner for en SEPARAT Supabase-instans for Meg-assistenten som kjøres manuelt via Supabase CLI. Ikke slett uten bekreftelse. |
| `tests/e2e/` vs `e2e/` | — | To testmapper, men `playwright.config.ts` har `testDir: "."` — BEGGE kjøres. Ikke duplikat, men bør samles i én mappe i eget rydde-steg (flytting, ikke sletting). |
| `src/app/dev-banekart/` | 1 rute | Filens egen kommentar: «Slett eller erstatt når /portal/baneguide/[baneId] er portet.» Sjekk om baneguide-porting er ferdig — hvis ja, slett. |
| `docs/` rotnivå | ~15 av 35 | Flere eldre plan-/visjonsdokumenter (datagolf-produktvisjon, ak-agency-os-plan, plan-baneguide-dispersion m.fl.) er trolig historiske, men docs er billige og noen refereres fra CLAUDE.md-hierarkiet. Anbefaling: IKKE rydd docs nå — det er lav gevinst og høy risiko for å bryte kanon-pekere. Ta etter lansering. |

### 1C. Ubrukte komponenter — 138 filer med grep-bevis

Metode: alle `.ts/.tsx` i `src/components` uten treff på filnavnet i noen import-setning i src, mdx-components, tests, e2e eller scripts. Stikkprøvekontrollert manuelt (login-skjerm, forside, lead-form, analyse-hub, planlegge-workbench, drill-bibliotek — alle bekreftet døde; f.eks. bruker `/auth/login` sin egen lokale `login-form.tsx`, ikke `components/auth/login-skjerm.tsx`).

Merk mønstrene — dette er lag av forlatte parallellversjoner:
- `components/coachhq/` — hele CoachHQ-navnerommet (CLAUDE.md: «CoachHQ er gammelt»)
- `components/planlegge-v2/` — 3 screens erstattet av Workbench-konsolideringen
- `components/shared/calendar/` — 14 filer, en hel forlatt kalendermodul
- `components/portal/workbench/` — 14 filer fra eldre workbench-iterasjon
- `components/auth/*-skjerm.tsx` — erstattet av lokale forms i app-rutene

**Slette-protokoll (viktig):** slett i batcher på ~15 filer per commit, kjør `npx tsc --noEmit && npm run build` etter hver batch. Grep fanger ikke 100 % (dynamiske imports, string-baserte referanser). Bygget er den endelige dommeren. Rull tilbake enkeltfiler som brekker bygget og marker dem LEVENDE.

Full liste (138):
```
src/components/shared/ViewModeToggle.tsx
src/components/shared/tier-paywall-sheet.tsx
src/components/shared/golfbox-import-modal.tsx
src/components/shared/pro-kampanje-banner.tsx
src/components/shared/avatar-upload.tsx
src/components/shared/profil-rediger-trigger.tsx
src/components/shared/calendar/PeriodVolumeRecipeEditor.tsx
src/components/shared/calendar/PeriodeModal.tsx
src/components/shared/calendar/QuickAddPopover.tsx
src/components/shared/calendar/CapacityLoadBar.tsx
src/components/shared/calendar/MyelinTracker.tsx
src/components/shared/calendar/DrillMalLibrary.tsx
src/components/shared/calendar/RecurringPatternEditor.tsx
src/components/shared/calendar/OktMalLibrary.tsx
src/components/shared/calendar/PortalKalenderWrapper.tsx
src/components/shared/calendar/LockedAnchorEditor.tsx
src/components/shared/calendar/SessionEditor.tsx
src/components/shared/calendar/ConditionalRulesPanel.tsx
src/components/shared/calendar/MiniCalendar.tsx
src/components/shared/calendar/__demoData.ts
src/components/blogg/Sammendrag.tsx   [LEVENDE — importert av mdx-components.tsx, IKKE slettet]
src/components/blogg/Stat.tsx          [LEVENDE — samme, IKKE slettet]
src/components/blogg/Quote.tsx         [LEVENDE — samme, IKKE slettet]
src/components/admin/workbench-mobile.tsx
src/components/admin/calendar-week-grid.tsx
src/components/admin/caddie/caddie-conversation-list.tsx
src/components/admin/caddie/foreslatte-sporsmaal.tsx
src/components/admin/coach-filter.tsx
src/components/admin/recording-trigger-button.tsx
src/components/admin/compliance/compliance-player-select.tsx
src/components/admin/kalender/kalender.tsx
src/components/admin/tab-strip.tsx
src/components/admin/anlegg-mapbox.tsx
src/components/admin/edit-okt-modal.tsx
src/components/admin/calendar-view-toggle.tsx
src/components/admin/edit-periode-modal.tsx
src/components/admin/services-liste.tsx
src/components/admin/hub-kpi-strip.tsx
src/components/admin/dagens-timer-card.tsx
src/components/admin/drift/drift.tsx
src/components/admin/plan-templates/library-view.tsx
src/components/admin/turneringer/turneringer.tsx
src/components/admin/multi-compare/multi-compare.tsx
src/components/admin/calendar-day-view.tsx
src/components/admin/spillerliste-card.tsx
src/components/admin/spillere-tabs.tsx
src/components/admin/aktivitets-feed.tsx
src/components/auth/forgot-skjerm.tsx
src/components/auth/signup-skjerm.tsx
src/components/auth/login-skjerm.tsx
src/components/stats/stats-cmd-k.tsx
src/components/stats/stats-trending-badge.tsx
src/components/forelder/forelder-hjem.tsx
src/components/forelder/oversikt.tsx
src/components/athletic/data/index.ts   [LEVENDE — re-eksportert fra athletic/index.ts, IKKE slettet]
src/components/baneguide/shot-plot-map.tsx
src/components/planlegge-v2/turneringer-screen.tsx
src/components/planlegge-v2/arsplan-screen.tsx
src/components/planlegge-v2/treningsplan-screen.tsx
src/components/coachhq/workbench/index.ts
src/components/coachhq/workbench/panels/analyse-panel.tsx
src/components/coachhq/workbench/panels/idag-panel.tsx
src/components/coachhq/workbench/panels/kommunikasjon-panel.tsx
src/components/coachhq/workbench/panels/plan-panel.tsx
src/components/coachhq/workbench/panels/notater-panel-container.tsx
src/components/coachhq/plan-split-view.tsx
src/components/coachhq/spiller-fasilitet-panel.tsx
src/components/coachhq/plan-tidslinje.tsx
src/components/coachhq/plan-view-toggle.tsx
src/components/coachhq/analytics-view-toggle.tsx
src/components/coachhq/analytics-trend.tsx
src/components/coachhq/coach-direktiver-panel.tsx
src/components/coachhq/spiller-dna-panel.tsx
src/components/sg-hub/ClubTrendChart.tsx
src/components/sg-hub/DriftAlertCard.tsx
src/components/marketing/lead-form.tsx
src/components/marketing/booking-shortcuts.tsx
src/components/marketing/forside.tsx
src/components/onboarding/tour-overlay.tsx
src/components/turneringer/norske-denne-uka-teaser.tsx
src/components/portal/live-okt/live-summary.tsx
src/components/portal/live-okt/live-active.tsx
src/components/portal/live-okt/live-brief.tsx
src/components/portal/workbench/player-hero-image.tsx
src/components/portal/workbench/fab-button.tsx
src/components/portal/workbench/wellness-indicators.tsx
src/components/portal/workbench/coach-message-preview.tsx
src/components/portal/workbench/player-hero-v2.tsx
src/components/portal/workbench/quick-actions.tsx
src/components/portal/workbench/calendar-widget.tsx
src/components/portal/workbench/editorial-divider.tsx
src/components/portal/workbench/training-partners-row.tsx
src/components/portal/workbench/next-tournament-countdown.tsx
src/components/portal/workbench/WorkbenchShell.tsx
src/components/portal/workbench/invitation-card.tsx
src/components/portal/workbench/trene-sammen-toggle.tsx
src/components/portal/abonnement/plan-overview.tsx
src/components/portal/dagens-fokus-card.tsx
src/components/portal/stats/stats-overview.tsx
src/components/portal/pyramide-timer-status.tsx
src/components/portal/coach/UpcomingSessions.tsx
src/components/portal/coach/PlanChangeRequests.tsx
src/components/portal/coach/CoachProfileCard.tsx
src/components/portal/coach/CoachShell.tsx
src/components/portal/coach/CoachNotes.tsx
src/components/portal/kommende-turneringer-card.tsx
src/components/portal/innstillinger/innstillinger-accordion.tsx
src/components/portal/streak-bars.tsx
src/components/portal/live-intro-modal.tsx
src/components/portal/booking/booking-ny.tsx
src/components/portal/plan/PlayerPlanMobile.tsx
src/components/portal/quick-actions.tsx
src/components/portal/trackman/session-analysis-client.tsx
src/components/portal/trackman/session-header.tsx
src/components/portal/sg-spider.tsx
src/components/portal/portal-avatar-button.tsx
src/components/portal/analyse/treningsanalyse.tsx
src/components/portal/analyse/analyse-hub.tsx
src/components/portal/pyramide-card.tsx
src/components/portal/runder/runde-queue-list.tsx
src/components/portal/runder/runde-ny.tsx
src/components/portal/kpi-strip.tsx
src/components/portal/drill-progress.tsx
src/components/portal/planlegge/planlegge-workbench.tsx
src/components/portal/cs-rating.tsx
src/components/portal/maned-kalender.tsx
src/components/portal/sesjon-detalj.tsx
src/components/portal/drill-detail.tsx
src/components/portal/sg-hub/sg-waterfall.tsx
src/components/portal/dash-hero.tsx
src/components/portal/analysere/analysere-faner.tsx
src/components/portal/plan-actions-card.tsx
src/components/portal/turneringer/turnering-detalj.tsx
src/components/portal/turnering-detalj/turnering-detalj-screen.tsx
src/components/portal/sg-fordeling-card.tsx
src/components/portal/dashboard/index.ts
src/components/portal/dashboard/WeekOverview.tsx
src/components/portal/dashboard/StatsSnapshot.tsx
src/components/portal/goals-card.tsx
src/components/portal/uke-stripe.tsx
src/components/portal/sist-registrert-card.tsx
src/components/portal/analytics/index.ts
src/components/portal/drills/index.ts
src/components/portal/drills/drill-bibliotek.tsx
```

### 1D. IKKE slett (sjekket og friskmeldt)

- `content/blogg/` + `src/lib/blogg/` — levende blogg (stats/blogg-rutene)
- `.design-review/claude-code-handoff/` — 72 filer brukt aktivt av `scripts/workbench-adversarial-vision.ts` og `workbench-adversarial-diff.mjs` (Workbench-fasit-verifisering, docs datert 30. juni)
- `e2e/` og `tests/e2e/` — begge kjøres av Playwright (`testDir: "."`)
- Duplikatruter som `admin/calendar`, `admin/finance`, `admin/approvals`, `admin/messages`, `admin/plans/templates`, `portal/analyse`, `portal/stats`, `admin/agenter`, `admin/agent-team` — alle er 5–26-linjers redirects til kanonisk rute. Bevisst design, la stå.

---

## FASE 2 — KONSOLIDER designkilder

**Viktigste funn:** beslutningen er allerede tatt. CLAUDE.md + `.claude/rules/design-porting-gate.md` (LÅST regel) erklærer `public/design-handover/AK Golf HQ Design System/` som eneste sannhet. Den er bevisst gitignored (beslutning 2026-06-04, ligger lokalt + Google Drive). Repoet trenger ikke velge en vinner — det trenger å håndheve den eksisterende beslutningen.

Status per kilde:

| Kilde | Rolle | Skjebne |
|---|---|---|
| `public/design-handover/` (lokal) | SANNHET (låst) | Beholdes utenfor git som i dag |
| `design-system/` (69 HTML) | Eldre komponentkatalog, 0 refs | Slett etter migreringssjekk (steg 2B) |
| `.design-review/` rot + `_ds/` | Prototyper + eksport, 0 refs | Slett |
| `.design-review/claude-code-handoff/` | Fasit-screenshots for Workbench-verifisering | Behold til Workbench-porting er ferdig, deretter flytt til lokal design-handover |
| `docs/design/` + `docs/design-inventory/` | Spesifikasjoner, ikke visuell fasit | Behold — dette er docs, ikke designkilde |

Migreringssteg, i rekkefølge:

1. **2A — Bekreft sannheten:** Anders bekrefter at lokal `public/design-handover/AK Golf HQ Design System/` (4. juni) er komplett og synket til Google Drive. Ingen sletting før dette er bekreftet.
2. **2B — Migreringssjekk design-system/:** kjør en diff av komponentliste i `design-system/components/` mot innholdet i design-handover. Komponenter som KUN finnes i design-system/ (kandidater: Gamification-settet, Data-viz-settet) kopieres inn i lokal design-handover før sletting. Estimat: 30 min med Claude Code.
3. **2C — Slett `design-system/` og `.design-review/` (minus claude-code-handoff/).**
4. **2D — Fiks brutte pekere:** `docs/STATUS-NÅ.md` peker på `docs/redesign-2026-06/P0-status.md` som IKKE finnes i repoet. Enten gjenopprett filen eller flytt P0-innholdet inn i STATUS-NÅ og fjern pekeren. Samme sjekk for øvrige kanon-pekere i CLAUDE.md-hierarkiet.
5. **2E — Etter Workbench-porting er ferdig:** flytt `claude-code-handoff/` ut av repo til lokal design-handover, oppdater de to scriptenes DESIGN_DIR-sti eller arkiver scriptene.

---

## FASE 3 — BYGG (prioritert etter brukersynlighet)

Kalibrert til Claude Code-fart. Kilde: kryss av STATUS-NÅ P0-lista (re-verifisert 17. juni) mot faktiske «kommer snart»-toasts og TODO-er i koden (66 TODO/FIXME totalt, alle gjennomgått).

### P0 — blokkerer betalende brukere

| # | Hva | Fil | Estimat |
|---|---|---|---|
| 1 | Eksport-stub → redirect til personvern-siden (GDPR-eksporten der virker) | `src/app/portal/meg/innstillinger/eksport/` | 15 min |
| 2 | Meldinger: vedlegg/fil/galleri-opplasting (3 steder, «kommer snart»-toasts; @vercel/blob er allerede i deps) | `portal/coach/melding/[id]/trad-ui.tsx`, `melding/ny/ny-melding-client.tsx` | 2 t |
| 3 | Gruppe-oppretting (knapp gir kun toast) | `admin/grupper/grupper-actions.tsx` | 1,5 t |
| 4 | AgencyOS datakobling: godkjenninger, økonomi, innboks, analytics (UI bygget, mock-data) | `/admin/godkjenninger`, `/admin/okonomi`, `/admin/innboks` m.fl. | 8–10 t |
| 5 | E2E-nettlesertest av 3 coach-test-skjermer (eneste gule hake i testbatteriet) | tests | 1 t |

Ikke-kode P0 (Anders selv, fra STATUS-NÅ): Stripe live-nøkler i Vercel, Resend SPF/DKIM for akgolf.no, `NEXT_PUBLIC_APP_URL` → akgolf.no, beslutning om deploy-rutine (auto-deploy fra main vs manuell `vercel deploy --prod`).

### P1 — synlig, men ikke blokkerende

| # | Hva | Fil | Estimat |
|---|---|---|---|
| 6 | Gruppe-tildeling i plan-builder («lagret som utkast»-toast) | `admin/plans/new/plan-builder-client.tsx` | 1 t |
| 7 | Filtere: TrackMan (miljø/kilde), Runder (avansert), Workspace x2 | 4 actions-filer | 2 t |
| 8 | Test-detalj: Del + PDF-eksport (@react-pdf i deps) | `admin/tester/[id]/tester-detail-actions.tsx` | 2 t |
| 9 | CoachNote + Message Prisma-modeller (to paneler venter på dem) | `coachhq/workbench/panels/` — NB: panelene er i 138-lista; avklar om de skal bygges eller slettes | 4 t hvis bygges |
| 10 | /kommando vs /admin/workspace — to parallelle workspace-implementasjoner (én med DB-tall, én med sample-data + 11 TODO). BESLUTNING: velg én, slett den andre. Anbefaling: behold `/admin/workspace` (matcher AgencyOS-navigasjonen), migrer DB-koblingen fra /kommando inn. | begge trær | 1 beslutning + 3 t |

### P2 — kutt fra lansering (anbefalt)

| # | Hva | Anbefaling |
|---|---|---|
| 11 | GolfBox + TrackMan-kobling i onboarding («kommer snart») | Behold som «kommer snart» — ærlig og lav skade. 4 t hvis bygges. |
| 12 | Web-push (`lib/push.ts`, merket «TODO V2.1») | Allerede scopet til V2.1 av deg selv. La ligge. 3 t hvis bygges. |
| 13 | Innloggings-historikk/aktive økter («under utvikling»-merking) | Bevisst ærlig merking, ikke en bug. La stå. |
| 14 | Ring-knapp i meldinger, periodisering-toast i teknisk plan | V2. |

**Sum P0+P1 kode: ca. 20 timer.** Med P2 inkludert: ca. 32 timer.

---

## Commit-strategi

Aldri sletting og bygging i samme commit. Rekkefølge:

1. `chore: remove _archive (post-launch cleanup pulled forward)` — 1A rad 1
2. `chore: remove dead blog system (content/blog, lib/blog, data/blog-posts)` — 1A rad 4–6
3. `chore: remove archived prisma init` — 1A rad 7
4. FASE 2A–2B (migreringssjekk) → `chore: consolidate design sources — design-system + .design-review removed, design-handover is single truth` (2 commits: migrering, så sletting)
5. `docs: fix broken canonical pointers (P0-status.md)` — 2D
6. Komponent-sletting: ~10 commits à 15 filer, `chore: remove unused components (batch N/10)` — hver med grønn `tsc + build` før push
7. Deretter FASE 3, én commit per funksjon, i P0-rekkefølgen over

Verifikasjon per commit (fra CLAUDE.md): `npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build`. For komponent-batchene i tillegg: `npm test` (244 tester skal forbli grønne).

---

## Åpne spørsmål til Anders (én beslutning per punkt) — BESVART 2026-07-02

1. ~~`.agents/skills/` — bruker Kimi Code CLI eller annet verktøy denne mappen? Hvis nei: slett (75 filer).~~ **SVAR: slett.** Utført.
2. ~~`supabase-meg/` — egen Supabase-instans for Meg-assistenten? Hvis ja: behold.~~ **SVAR: behold.** Ikke rørt.
3. ~~/kommando vs /admin/workspace — hvilken vinner? (Min anbefaling: /admin/workspace.)~~ **SVAR: /admin/workspace vinner.** `/kommando` fikk TODO-merking, DB-migrering og sletting gjenstår i egen bygge-økt (FASE 3).
4. ~~CoachHQ-komponentene i 138-lista — bekreft at CoachHQ-navnerommet er dødt.~~ **SVAR: dødt, slett alt inkl. panelene.** Utført.

## Fortsatt åpne (ikke del av denne økten)

- `docs/` rotnivå-opprydding (1B) — utsatt til etter lansering.
- `tests/e2e/` vs `e2e/`-sammenslåing (1B) — egen refaktor-økt.
- `src/app/dev-banekart/` (1B) — sjekk om baneguide-porting er ferdig først.
- FASE 3 (bygging, P0–P2) — ikke rørt denne økten, se plan over.
