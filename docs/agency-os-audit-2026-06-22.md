# AgencyOS — komplett audit (2026-06-22)

> **Read-only kartlegging.** Ingen kode er endret. Hver påstand er verifisert mot faktisk kode med fil:linje-referanse. Rapporten er produsert av fem parallelle research-agenter (én per stegområde), syntetisert til ett dokument. AK-terminologi beholdt. Repo: `akgolf-hq` (Anders kaller det «akgolf-platform»).

---

## Topp-oppsummering (les denne først)

1. **AgencyOS er ikke en egen modul — det er merkevaren/skallet rundt HELE `/admin`-treet** (rebrand av «CoachHQ»). ~62 rute-mapper under `src/app/admin/`. Agent-laget bor i `src/lib/agents/` (7 deterministiske cron/event-agenter) + `src/lib/ai/agents/` (6 LLM-agenter). Cockpit-dashbordet er `src/app/admin/agencyos/`. `coachhq/`-komponentene er DELVIS LEVENDE (brukt av coach-workbench + spiller-detalj), ikke arkiv.

2. **Automatiserings-løftet (DATA → SIGNALER → SKILLS → AGENTER → PlanAction → COACH-INNBOKS) er bygd, men selve loopen er en blindvei.** «Godkjenn» (`acceptPlanAction`, `src/lib/agents/actions.ts:22`) bytter KUN status `PENDING→ACCEPTED` — den anvender ALDRI forslaget på treningsplanen. Ingen kode noe sted leser `PlanAction.status === "ACCEPTED"` for å gjøre noe. En godkjent endring blir aldri skrevet inn i spillerens plan.

3. **Bare `plan-watcher` kjører på cron i prod** (man 06:00, `vercel.json`). `training-gap` — den ENESTE agenten som produserer coach-forslag (`TRAINING_GAP`) — mangler cron-entry → den action-typen oppstår aldri i prod. De øvrige (round/test/trackman/periodiserings/achievement) er event-trigget fra PlayerHQ når spilleren logger data.

4. **«Skills»-laget som prompten beskriver (weakness/periodization/progression/pyramid/drill-selection/junior-guard) finnes ikke under de navnene.** Faktiske «skills» = 3 kunnskapsblokker (pyramide, Bompa-periodisering, SG-tolkning) limt inn i LLM-prompter. `junior-guard` finnes ikke i det hele tatt. De 6 LLM-agentene i `src/lib/ai/agents/` er nesten ren død kode (kalt kun fra én testfil) — `/admin/brief` bruker en EGEN generator, ikke `daily-brief.ts`.

5. **CBAC er definert, men praktisk talt ikke håndhevet.** `src/lib/auth/cbac.ts` definerer 10 capabilities + `can()`, men `can()` kalles på ÉN read-only plass (`settings/tilgang/page.tsx:85`) kun for å VISE en matrise. All reell gating er ren rolle-sjekk (`requirePortalUser({allow: [...]})`). Konkret lekkasje: `VIEW_FINANCE` er ADMIN-only i modellen, men COACH slipper inn på `/admin/okonomi` (rute-gaten er `["ADMIN","COACH"]`).

6. **SG er den farligste «ser ekte ut»-flaten.** Den kalibrerte SG-motoren `beregnSg` (`src/lib/domain/sg.ts:210`) kalles KUN fra tester — aldri fra rundeskriving. `Round.sgTotal` er enten brukertastet sum eller tilfeldig seedet demo-tall. Motoren er produksjonsklar, men frakoblet skrivebanen.

7. **Flere prompt-antakelser stemmer ikke med koden (verifisert):** `getStudent360`, «9 grupper», `lib/portal/signals`/`coaching-signals`, `tournament-agent`, «Endre og godkjenn», «Utsett/Defer», batch-godkjenning og auto-apply FINNES IKKE som beskrevet. De de-facto ekvivalentene er dokumentert i seksjonene under.

8. **Diverse skall og kjente bugs:** Mission Control (`agencyos/live`) + `tilstander` er statiske demo-skjermer med hardkodet innhold/gamle navn. Flere ruter er rene redirects (`calendar→kalender`, `approvals→godkjenninger`, `messages→innboks`, `board→spillere`). Agent-detalj-siden er ødelagt (slug-mismatch → alle «Detaljer»-lenker gir 404, og den leser feil loggmodell `AuditLog` i stedet for `AgentRun`).

---

## Innholdsfortegnelse

- [Del 1 — Overflate: hva AgencyOS er + komplett rute-/action-/modell-/CBAC-kart (Steg 1+2)](#del-1)
- [Del 2 — Spilleroppfølging: 360, signaler, degradering, coach-flater (Steg 3)](#del-2)
- [Del 3 — Automatisering: agenter, runner, skills, PlanAction, logg (Steg 4)](#del-3)
- [Del 4 — Coach-handlinger og beslutning: innboks, godkjenning, config, varsler (Steg 5)](#del-4)
- [Del 5 — Kobling til plattformen + tilstand og hull (Steg 6+7)](#del-5)
- [Konsolidert: åpne spørsmål til Anders](#aapne-sporsmaal)

---

<a id="del-1"></a>
# AgencyOS Audit — Seksjon 1: Overflate-kartlegging

Read-only audit av coach-admin-produktet «AgencyOS» i `akgolf-hq`. Alle påstander har fil:linje-referanse. Verifisert mot kode 2026-06-22.

---

## 1. Hva AgencyOS faktisk ER

**Konklusjon:** AgencyOS er ikke en egen modul/mappe — det er **merkevaren/skallet rundt hele `/admin`-treet** (rebrand av gamle «CoachHQ»). Coach-produktet bor i sin helhet under `src/app/admin/`. Det finnes IKKE en `app/admin/(authed)/`-gruppe — rutene ligger rett under `src/app/admin/` (verifisert: `ls src/app/admin/` gir 60+ rute-mapper på toppnivå, ingen route-group-parenteser).

**Hvor «AgencyOS»-navnet faktisk er forankret:**

| Markør | Fil:linje | Hva det er |
|---|---|---|
| Skall/branding | `src/components/admin/admin-shell.tsx:29` | `AdminShell` — kommentar: «AgencyOS-skall — fasit agencyos-app». Wrapper for hele `/admin`. |
| Mobil-topbar tekst | `src/components/admin/admin-shell.tsx:167` | Viser ordet «AgencyOS». |
| Nav-config | `src/lib/admin-nav.ts:33` | «Delt nav-config for AgencyOS». |
| Cockpit-rute | `src/app/admin/agencyos/page.tsx:20` | `AgencyOSPage` — selve dashbordet/«cockpit». |
| Cockpit-data | `src/lib/agencyos/daily-brief-data.tsx` | `loadDailyBrief` → `CockpitData` (eneste fil i `src/lib/agencyos/`). |
| Cockpit-UI | `src/components/admin/cockpit/agency-cockpit.tsx` | `<AgencyCockpit>` (rendres av agencyos/page.tsx:23). |
| Delte AgencyOS-primitiver | `src/components/admin/agencyos/ui.tsx` | `AgPage`, `AgPageHead`, `AgChip`, `AgAvatar`, `agBtnClass` — brukt av godkjenninger/foresporsler/kalender m.fl. |

**`src/lib/agencyos/`** inneholder KUN `daily-brief-data.tsx` (cockpit-datakilde). Ikke et eget «agent-lag».

**`src/app/admin/agencyos/`** er en egen rute-undermappe = selve dashbordet med faner. Egen `layout.tsx` (fane-rad) + sider:
- `agencyos/page.tsx` (Oversikt/cockpit)
- `agencyos/uka/page.tsx`, `agencyos/live/page.tsx`, `agencyos/spillere/page.tsx`, `agencyos/okonomi/page.tsx`, `agencyos/caddie/page.tsx`, `agencyos/caddie/aktivitet/page.tsx`
- `agencyos/_tab-nav.tsx` — fane-rad-komponent.

**Forhold til CoachHQ (`src/components/coachhq/`):** DELVIS LEVENDE, ikke ren arkiv.
- Levende: `coach-workbench/page.tsx:13-22` importerer aktivt fra `@/components/coachhq/workbench` (CoachWorkbenchTopBar, CoachTabs, CoachWorkbenchShell osv.) + `caddie-chat` + `idag-panel`.
- Levende: `spillere/[id]/` bruker `coachhq/spiller-dna-panel.tsx`, `coach-direktiver-panel.tsx`, `spiller-fasilitet-panel.tsx` (jf. actions `lagreSpillerDNA`, `lagreCoachDirektiv`).
- «CoachHQ» som UI-tekst er utfaset (låst beslutning: bruk «AgencyOS»), men `coachhq/`-komponentmappen er fortsatt importert kode, ikke død.

**Forhold til PlayerHQ:** Separat produkt under `src/app/portal/`. Deler designtokens (`globals.css`), `athletic/`-komponenter, auth og Prisma-schema. Workbench er delt kjerne (coach-Workbench under `/admin/spillere/[id]/workbench`, spiller-Workbench under portal).

---

## 2. Komplett rute-kart under `src/app/admin/`

Toppnivå-mapper (62 dirs). Kjerne = i `buildAdminNav` (`src/lib/admin-nav.ts`). Status «I NAV» = synlig i sidebar; «IKKE I NAV» = bare nåbar via URL/dyplenke; «REDIRECT» = ren videresending; «ALIAS» = re-eksporterer annen side.

| Rute (`/admin/…`) | page.tsx | Formål (fra fil-doc/eyebrow) | I nav? | Kjerne/Perifer | Status |
|---|---|---|---|---|---|
| `agencyos` | ✓ | Cockpit/Oversikt — 3-kol Bloomberg-dashbord, ekte `loadDailyBrief` (`agencyos/page.tsx:1-24`) | ✓ «Oversikt» | KJERNE | Aktiv |
| `agencyos/uka` | ✓ | Cockpit-fane: ukesoversikt | via fane | KJERNE | Aktiv |
| `agencyos/live` | ✓ | Cockpit-fane: live-økter | via fane | KJERNE | Aktiv |
| `agencyos/spillere` | ✓ | Cockpit-fane: spillere | via fane | KJERNE | Aktiv |
| `agencyos/okonomi` | ✓ | Cockpit-fane: økonomi | via fane | KJERNE | Aktiv |
| `agencyos/caddie` (+`/aktivitet`) | ✓ | Cockpit-fane: AI-Caddie aktivitet | via fane | KJERNE | Aktiv (redirect-mål for `/admin/stall/caddie/:id`, next.config:124) |
| `spillere` | ✓ | Alle spillere-tabell, ekte Prisma (`spillere/page.tsx:1-19`) | ✓ «Spillere» | KJERNE | Aktiv (`?view=tavle` = tavle-modus) |
| `spillere/[id]` (+`/rediger`,`/ny`,`/workbench`) | ✓ | Spiller-detalj/DNA/direktiv/fasilitet; ny+rediger; coach-Workbench | via spillere | KJERNE | Aktiv |
| `stall` | ✓ | Roster-tabell + 360°-panel, ekte Prisma (`stall/page.tsx:1-9`) | ✓ «Stall» | KJERNE | Aktiv (overlapper delvis `spillere`) |
| `grupper` | ✓ | Stall · Grupper (eyebrow) | ✓ «Grupper» | KJERNE | Aktiv |
| `talent` (+`/radar/[id]`,`/discovery`,`/ressurser`,`/wagr-import`,`[playerId]`) | ✓ | Talent-radar/discovery/WAGR-import | ✓ «Talent»-gruppe | KJERNE | Aktiv |
| `coach-workbench` | ✓ | Coach Workbench (CoachHQ-komponenter); redirecter til seg selv hvis ingen spiller (`coach-workbench/page.tsx:14`) | via «Workbench» (fallback) | KJERNE | Aktiv (Workbench-href bygges i admin-shell.tsx:132) |
| `handlingssenter` | ✓ | Oppgave-kanban/tabell/liste fra `OppgaveCache` (Notion-sync) (`handlingssenter/page.tsx:1-11`) | ✓ «Handlingssenter» | KJERNE | Aktiv |
| `workspace` (+`/oppgaver`,`/tildelt-meg`,`/notion`) | ✓ | «Min uke»: ukeoversikt + oppgaver + tildelt-meg | ✓ «Min uke»-gruppe | KJERNE | Aktiv (Notion-redirect-mål, next.config:61-64) |
| `plans` (+`/[planId]`,`/new`,`/templates`) | ✓ | Treningsplaner (Planlegge) | ✓ «Treningsplaner» | KJERNE | Aktiv (rik action-fil, se §4) |
| `plan-templates` | ✓ | Plan-maler (eyebrow «Planlegge · Plan-maler») | ✓ «Plan-maler» | KJERNE | Aktiv |
| `drills` | ✓ | Drill-bibliotek (eyebrow «Planlegge · Drill-bibliotek») | ✓ «Drill-bibliotek» | KJERNE | Aktiv |
| `okter` | ✓ | Økter (ukesvisning, eyebrow `/admin/okter · uke`) | ✓ «Økter» | KJERNE | Aktiv |
| `teknisk-plan` | ✓ | Teknisk plan (eyebrow «Verktøy») | ✓ «Teknisk plan» | KJERNE | Aktiv |
| `tournaments` | ✓ | Turneringer (Planlegge) | ✓ «Turneringer» | KJERNE | Aktiv (rik action-fil) |
| `kalender` | ✓ | Kalender, uke/dag-visning, ekte booking (`kalender/page.tsx:1-7`) | ✓ «Kalender» | KJERNE | Aktiv |
| `calendar` | ✓ | **`permanentRedirect("/admin/kalender")`** (`calendar/page.tsx:1-4`) | nei | DUBLETT | REDIRECT (+next.config:43-44) |
| `bookinger` (+`/ny`) | ✓ | Bookinger (Gjennomføre) | ✓ «Bookinger» | KJERNE | Aktiv (`/admin/bookings`→hit, next.config:37) |
| `anlegg` (+`/[id]`) | ✓ | Anlegg/fasiliteter, Mapbox (Gjennomføre) | ✓ «Anlegg» | KJERNE | Aktiv (`/admin/locations`,`/facilities`→hit) |
| `availability` | ✓ | Coach-tilgjengelighet (Gjennomføre) | ✓ «Tilgjengelighet» | KJERNE | Aktiv |
| `services` | ✓ | Tjeneste-typer (Gjennomføre) | ✓ «Tjenester» | KJERNE | Aktiv |
| `trackman` | ✓ | TrackMan-økter (Gjennomføre) | ✓ «TrackMan» | KJERNE | Aktiv |
| `kapasitet` | ✓ | Kapasitet per uke (Gjennomføre) | ✓ «Kapasitet» | KJERNE | Aktiv (`/admin/capacity`→hit) |
| `recording` | ✓ | Opptak/waveform (Gjennomføre) | ✓ «Opptak» | KJERNE | Aktiv |
| `analyse` | ✓ | Stall-analyse: KPI + pyramide + per-gruppe (`analyse/page.tsx:1-21`) | ✓ «Stall-analyse» | KJERNE | Aktiv |
| `analysere` (+`/compliance`) | ✓ | Innsikt-HUB (hubs-coach) + compliance-underside (`analysere/page.tsx:1-4`) | compliance i nav | KJERNE | Aktiv (hub IKKE direkte i nav; compliance er) |
| `analytics` | nei (kun `actions.ts`) | `exportAnalyticsReport` — ingen page; `/admin/analytics`→`/admin/analysere` (next.config:47) | nei | DUBLETT | REDIRECT (kun action-fil ligger igjen) |
| `lag-snitt` | ✓ | Lag-snitt, pyramide-barer (Analysere) | ✓ «Lag-snitt» | KJERNE | Aktiv (radklikk-mål fra analyse) |
| `risiko` | ✓ | Risiko (eyebrow «AgencyOS · Risiko») | ✓ «Risiko» | KJERNE | Aktiv |
| `tester` (+`/[id]`,`/benchmarks`,`/foreslatte`,`/tildel/[spillerId]`) | ✓ | Tester (Analysere) | ✓ «Tester» | KJERNE | Aktiv |
| `runder` | ✓ | Runder (Analysere) | ✓ «Runder» | KJERNE | Aktiv |
| `reach` | ✓ | Reach/engasjement-aggregat per spiller (`reach/page.tsx:1-23`) | ✓ «Reach» | KJERNE | Aktiv |
| `reports` | ✓ | Rapporter (System · Rapporter) | ✓ «Rapporter» | KJERNE | Aktiv |
| `foresporsler` | ✓ | Forespørsler: `SessionRequest` PENDING (`foresporsler/page.tsx:1-10`) | ✓ «Forespørsler» | KJERNE | Aktiv (mobil bell-mål, admin-shell.tsx:170) |
| `godkjenninger` | ✓ | Godkjenninger: `PlanAction` PENDING (`godkjenninger/page.tsx:1-10`) | ✓ «Godkjenninger» | KJERNE | Aktiv (gjenbruker `approvals/approval-actions`) |
| `approvals` | ✓ | **`permanentRedirect("/admin/godkjenninger")`** (`approvals/page.tsx:1-4`) | nei | DUBLETT | REDIRECT (men `approvals/actions.ts` + `approval-actions` er LEVENDE, brukt av godkjenninger) |
| `godkjenn-portal` (+`/koblinger`) | ✓ | Helt ANNET: manuell QA-godkjenning av 142 PlayerHQ-ruter mot design-handoff; `redirect("/auth/login")` hvis ikke ADMIN (`godkjenn-portal/page.tsx:1-15`) | nei | PERIFER (intern verktøy) | Aktiv (gated, ikke i nav) |
| `innboks` | ✓ | Meldinger master-detalj + svar (`innboks/page.tsx:1-13`) | ✓ «Meldinger» | KJERNE | Aktiv (kanonisk meldingsflate) |
| `messages` (+`/_components`,`actions.ts`) | ✓ | **`permanentRedirect("/admin/innboks")`** (`messages/page.tsx:1-4`) | nei | DUBLETT | REDIRECT (men `_components` + `messages/actions.ts:sendMelding` GJENBRUKES av innboks) |
| `kommunikasjon` | ✓ | Kommunikasjon-hub: faner Innboks/E-postmaler/Notion (`kommunikasjon/page.tsx:1-4`) | nei | PERIFER/overlapp | Aktiv (ikke i nav; overlapper innboks+email-templates) |
| `email-templates` (+`/[id]/rediger`) | ✓ | E-postmaler CRUD (eyebrow «Admin · Maler») | ✓ «E-postmaler» | KJERNE (System) | Aktiv |
| `queue` | ✓ | Oppfølgingskø «hvem trenger samtale» — kanban (`queue/page.tsx:1-13`) | nei | PERIFER (ikke i nav) | Aktiv |
| `oppfolging` | ✓ | **ALIAS** — re-eksporterer `queue/page.tsx` (`oppfolging/page.tsx:1-13`) | nei | DUBLETT | ALIAS av queue |
| `brief` | ✓ | Daglig AI-brief (Anthropic-generert) (`brief/page.tsx:1-15`) | nei | PERIFER (overlapper cockpit) | Aktiv (ikke i nav) |
| `okonomi` | ✓ | Økonomi (eyebrow «Økonomi») | ✓ «Økonomi» | KJERNE (System) | Aktiv |
| `finance` | ✓ | Finans-side (engelsk navn) | nei | mulig DUBLETT av okonomi | Aktiv? (ikke i nav — verifiser i §senere) |
| `team` | ✓ | Team/coacher card-grid (`team/page.tsx:1-8`) | ✓ «Team» | KJERNE (System) | Aktiv |
| `integrasjoner` | ✓ | Integrasjoner/verktøy (eyebrow «AgencyOS · Verktøy») | ✓ «Integrasjoner» | KJERNE (System) | Aktiv |
| `agents` (+`/[agentId]`) | ✓ | AI-agenter (eyebrow «AgencyOS · Agenter») | ✓ «AI-agenter» | KJERNE (System) | Aktiv |
| `audit-log` | ✓ | Audit-logg (System) | ✓ «Audit-logg» | KJERNE (System) | Aktiv (`/admin/audit`→hit) |
| `settings` (+`/tilgang`,`/api`,`/calendar`) | ✓ | Innstillinger (System); `tilgang` = CBAC-matrise (read-only) | ✓ «Innstillinger» | KJERNE (System) | Aktiv |
| `board` | ✓ | **`redirect("/admin/spillere?view=tavle")`** (`board/page.tsx:1-9`) | nei | DUBLETT | REDIRECT (men `board/actions.ts:endreSpillerStatus` LEVENDE) |
| `profile` | ✓ | Coach personalia (title «Personalia») | nei | PERIFER | Aktiv (`/admin/meg`→hit) |
| `mer` | ✓ | Mobil «Mer»-meny, speiler sidebar (`mer/page.tsx` doc) | mobil-nav | KJERNE (mobil) | Aktiv |
| `planlegge` | ✓ | Planlegge-landing (ett trykkpunkt → Workbench per låst beslutning) | nei direkte | KJERNE-flyt | Aktiv |
| `gjennomfore` | ✓ | Gjennomføre-hub (eyebrow «AGENCYOS · COACH») | nei direkte | HUB | Aktiv |
| `organisasjon` | ✓ | Organisasjon (eyebrow «AGENCYOS · HEAD COACH») | nei | PERIFER | Aktiv |
| `oppfolging` | (se over) | | | | |
| `caddie` | ✓ | Caddie (toppnivå, vs agencyos/caddie) | nei | mulig DUBLETT | Aktiv? (verifiser overlapp med agencyos/caddie) |
| `klubb/innstillinger` | ✓ | Klubb-innstillinger (kun underside, ingen topp-page) | nei | PERIFER | Aktiv |
| `stats/overview`, `stats/moderering` | ✓ | Stats-oversikt + moderering (kun undersider) | nei | PERIFER | Aktiv |
| `live/[sessionId]/{brief,active,summary}` | ✓ | Live-økt-flyt (Spor B) — brief/aktiv/oppsummering | nei (dyplenke) | KJERNE-flyt | Aktiv (egne actions m/ CBAC, se §6) |
| `hjelp` | ✓ | Hjelp/dok (eyebrow «/admin/hjelp») | nei | PERIFER | Aktiv |
| `tilstander` | ✓ | Design-system tilstander-galleri (eyebrow «Design-system · Tilstander») | nei | INTERN/dev | Aktiv |
| `videoer` | ✓ | Coaching-videoer (eyebrow «Coaching-videoer») | nei | PERIFER | Aktiv |
| `oppfolging`/`queue`/`brief`/`profile`/`mer` | | (jf. over) | | | |

**Duplikat-/dødt-rute-sammendrag (verifisert):**
- **Rene redirects (page bare videresender):** `calendar`→kalender, `approvals`→godkjenninger, `messages`→innboks, `board`→spillere?view=tavle. `analytics` har ingen page (kun action-fil) + next.config-redirect.
- **Alias (re-eksport):** `oppfolging` = `queue`.
- **next.config 301-er (server-nivå):** `bookings→bookinger`, `groups→grupper`, `elever→spillere`, `calendar→kalender`, `capacity→kapasitet`, `analytics→analysere`, `audit→audit-log`, `locations/facilities→anlegg`, `messages→innboks`, `meg→profile`, `notion-prosjekter/oppgaver→workspace/*` (`next.config` linje 37-67).
- **Levende kode bak «døde» mapper:** `approvals/`, `messages/`, `board/` har redirect-page MEN actions/komponenter som GJENBRUKES av den aktive ruta. Ikke trygt å slette uten å flytte koden først.
- **Overlapp-kandidater (ikke redirect, men funksjonell dublett — krever beslutning):** `analyse` vs `analysere` vs `analytics`; `stall` vs `spillere`; `okonomi` vs `finance`; `caddie` vs `agencyos/caddie`; `kommunikasjon` vs `innboks`+`email-templates`; `brief` vs `agencyos` (cockpit); `queue`/`oppfolging` ikke i nav.

---

## 3. Layout / shell / navigasjon

| Element | Fil:linje | Detalj |
|---|---|---|
| Rot-layout (auth-gate) | `src/app/admin/layout.tsx:11` | `requirePortalUser({ allow: ["ADMIN","COACH"] })` → ellers redirect login/portal. Wrapper = `<AdminShell>`. |
| Skall | `src/components/admin/admin-shell.tsx:29-205` | Server-komponent; gjør EGEN `requirePortalUser` (linje 30) + 10 parallelle Prisma-tellinger (linje 41-88) for badge-tall. |
| Tema (lys/mørk) | `admin-shell.tsx:34` | `isDark = cookie('ak-admin-theme') !== 'light'` → **standard MØRK**. `.dark`-klasse + `colorScheme` settes på `#agencyos-root` (linje 138-143). |
| Tema-toggle | `src/components/admin/admin-theme-toggle.tsx:11-40` | Sol/måne-knapp; flipper `.dark` live + setter cookie `ak-admin-theme` (max-age 1 år) uten reload (linje 14-23). Anders låste opp toggle 2026-06-22. |
| Desktop-sidebar | `src/components/admin/agencyos-sidebar.tsx` | Rendret når `md:` (admin-shell.tsx:151-159); bygges fra `buildAdminNav`. |
| Desktop-topbar | `src/components/admin/agencyos-topbar.tsx` | scope-velger (spillere/grupper) + tema-toggle + varsel (admin-shell.tsx:184-192). |
| Mobil-topbar | `admin-shell.tsx:162-183` | brand + «AgencyOS» + bjelle→`/admin/foresporsler` + tema-toggle. |
| Mobil-bunn-nav | `src/components/admin/agencyos-mobile-nav.tsx` | `inboxPending = requests+approvals` (admin-shell.tsx:201). |
| Global søk | `src/components/admin/global-search-modal.tsx` | montert i shell (admin-shell.tsx:202). |
| Nav-kilde (én sannhet) | `src/lib/admin-nav.ts:81-250` | `buildAdminNav(workbenchHref)` → 6 seksjoner: Daglig, Stall & talent, Operasjon, Analyse, Innboks, System. Badge-tall fra `SidebarCounts`. `leafActive()` (linje 74-79) styrer aktiv-markering inkl. `match`-aliaser. |

Workbench-href er dynamisk: første spiller → `/admin/spillere/{id}/workbench`, ellers `/admin/coach-workbench` (`admin-shell.tsx:132-134`).

---

## 4. Server actions — oversikt

Alle `actions.ts` under `src/app/admin/` (47 filer). Gating: ~43 bruker `requirePortalUser({ allow: ["COACH","ADMIN"] })`-mønsteret (se §6). Kjerne-flatene:

### Spillere
| Action | Fil:linje | Hva |
|---|---|---|
| `lagreSpillerDNA` | `spillere/[id]/actions.ts:73` | Lagrer spiller-DNA-panel (CoachHQ-komponent). |
| `lagreCoachDirektiv` | `spillere/[id]/actions.ts:131` | Oppretter coach-direktiv (`CoachDrillDirectiv`/`CoachNote`). |
| `slettCoachDirektiv` | `spillere/[id]/actions.ts:194` | Sletter direktiv. |
| `lagreSpillerFasiliteter` | `spillere/[id]/actions.ts:250` | Lagrer spillerens fasilitet-prefs. |
| `createSpiller` | `spillere/ny/actions.ts:123` | Oppretter ny PLAYER (`User`). |
| (rediger) | `spillere/[id]/rediger/actions.ts` | Redigerer spiller. |
| `endreSpillerStatus` | `board/actions.ts:34` | Endrer spiller-status (brukt av tavle-visning). |

### Planer (rikest flate)
| Action | Fil:linje | Hva |
|---|---|---|
| `togglePlanActive` | `plans/actions.ts:28` | Aktiver/deaktiver `TrainingPlan`. |
| `dupliserPlan` | `plans/actions.ts:41` | Dupliserer plan. |
| `createPlan` | `plans/actions.ts:91` | Ny plan. |
| `deletePlan` | `plans/actions.ts:108` | Slett plan. |
| `flyttOkt` | `plans/[planId]/actions.ts:68` | Flytt økt (`PlanSession`/`TrainingPlanSession`) til ny dato. |
| `sendTilSpiller` | `plans/[planId]/actions.ts:113` | Send plan til spiller (status-flyt). |
| `godkjennPlan` | `plans/[planId]/actions.ts:140` | Godkjenn plan. |
| `markerSomNyttUtkast`/`pausePlan`/`resumePlan`/`endPlan`/`arkiverPlan`/`slettPlan` | `plans/[planId]/actions.ts:168/202/228/258/442/468` | Plan livssyklus-overganger. |
| `markPlanCompleted` | `plans/[planId]/actions.ts:299` | Fullfør plan. |
| `rateEffectiveness` | `plans/[planId]/actions.ts:352` | Lagre `PlanEffectiveness`. |
| `cancelSession`/`oppdaterOkt`/`leggTilOkt`/`slettOkt`/`sendOktFeedback` | `plans/[planId]/actions.ts:410/507/750/635/562` | Økt-CRUD + feedback. |
| `kopierPlan` | `plans/[planId]/actions.ts:671` | Kopier plan. |
| `opprettExerciseDefinition` | `plans/[planId]/actions.ts:798` | Ny `ExerciseDefinition`. |
| `lagreSomMal` | `plans/[planId]/actions.ts:824` | Lagre plan som `PlanTemplate`. |
| `assignPlanToPlayers` | `plans/[planId]/actions.ts:970` | Tildel plan til flere spillere. |

### Agenter (AI-lag)
| Action | Fil:linje | Hva |
|---|---|---|
| `triggerPlanWatcherManually` | `agents/actions.ts:7` | Kjør plan-watcher-agent manuelt (genererer `PlanAction`/`AgentRun`). |
| `gisFeedback` | `agents/[agentId]/actions.ts:13` | Gi feedback på agent-output. |

### Godkjenninger / forespørsler / handlingssenter
| Action | Fil:linje | Hva |
|---|---|---|
| `approveRequestDetailed` | `approvals/actions.ts:43` | Godkjenn `PlanAction` (med detalj). Gjenbrukt av `/admin/godkjenninger`. |
| `declineRequestDetailed` | `approvals/actions.ts:80` | Avvis m/ grunn. |
| `requestMoreInfo` | `approvals/actions.ts:111` | Be om mer info. |
| `avslaaForespørsel` | `foresporsler/actions.ts:13` | Avslå `SessionRequest`. |
| `markerSomPlanlagt` | `foresporsler/actions.ts:29` | Marker forespørsel planlagt. |
| `markInboxItemDone`/`markInboxItemsRead` | `innboks/actions.ts:48/117` | Innboks-statushåndtering. |
| `sendMelding` | `messages/actions.ts:32` | Send melding (gjenbrukt av innboks). |
| (handlingssenter) | klient-side (`handlingssenter-client.tsx`) | Ingen egen `actions.ts` — `OppgaveCache` fra Notion-sync. |

### Øvrige kjerne-flater (oppsummert)
- **Tester:** `tester/[id]/actions.ts:18 lagreCoachNotat`, `tester/benchmarks/actions.ts`, `tester/foreslatte/actions.ts`, `tester/tildel/[spillerId]/actions.ts`.
- **Turneringer:** `tournaments/actions.ts` — 11 actions (createTournament:26 … meldPaSpillere:144, mergeTurneringer:306, exportTournamentsReport:422).
- **Kalender:** `calendar/actions.ts` — opprettOktPaaTid:31, moveSession:133, createSessionFromCalendar:180, cancelSession:188.
- **Tilgjengelighet:** `availability/actions.ts` — addSlot/updateSlot/deleteSlot (21/35/52).
- **Drill:** `drills/actions.ts` — createDrill/updateDrill/duplicateDrill/deleteDrill (143/174/213/276).
- **Analyse (read-actions):** `analyse/actions.ts` — 8 lese-funksjoner (getAnalysisOverview:144 … getCelleSessions:540). `analytics/actions.ts:45 exportAnalyticsReport`. `brief/actions.ts:43 exportBriefReport`.
- **Live-økt (Spor B):** `live/[sessionId]/{brief,active,summary}/actions.ts` — egne actions, eneste som bruker `hasRole` direkte (se §6).
- **Team:** `team/actions.ts:33 inviterCoach`. **Godkjenn-portal (QA):** `godkjenn-portal/actions.ts:9 setApprovalStatus` (`PageApproval`).

---

## 5. Prisma-modeller AgencyOS rører (sentrale)

| Modell | Rolle for AgencyOS |
|---|---|
| `User` | Coach/spiller/admin; rolle styrer tilgang (`UserRole`). |
| `Group` / `GroupMember` | Stall/grupper + medlemskap. |
| `TrainingPlan` | Treningsplan (kjernen i Planlegge/Workbench). |
| `PlanSession` / `TrainingPlanSession` | Plan-økter (to spor; jf. Spor A/B i minne). |
| `PlanTemplate` / `PlanTemplateSession` | Plan-maler. |
| `PlanAction` | Agent-/coach-godkjenninger (driver `/admin/godkjenninger` PENDING-tellingen, admin-shell.tsx:57). |
| `PlanAdjustment` / `PlanChangeRequest` / `PlanSuggestion` / `PlanEffectiveness` | Plan-endringer, forslag, effektivitet. |
| `AgentRun` / `AiPlanGeneration` | AI-agent-kjøringer + plan-generering. |
| `SessionRequest` | Booking-/økt-ønsker fra spillere (driver `/admin/foresporsler`, admin-shell.tsx:56). |
| `Booking` | Bookinger (kalender, dagens økter, tellinger admin-shell.tsx:55-60). |
| `OppgaveCache` / `ProsjektCache` | Notion-synket oppgaver/prosjekter (handlingssenter + workspace, admin-shell.tsx:61). |
| `Round` / `HoleScore` / `Shot` | Runder + slag (Analysere/Runder). |
| `TestDefinition` / `TestResult` / `TestSession` / `TestAssignment` | Tester. |
| `TrackManSession` / `TrackManShot` | TrackMan-data. |
| `SgBaseline` / `SgInsight` / `BrukerSgInput` | Strokes Gained. |
| `Tournament` / `TournamentEntry` / `TournamentResult` / `TournamentPreparation` | Turneringer. |
| `Notification` | Coach-varsler (uleste i topbar, admin-shell.tsx:64). |
| `CoachNote` / `CoachDrillDirectiv` / `CoachAvailability` | Coach-notater/direktiv/tilgjengelighet. |
| `TechnicalPlan` (+`Position`/`ClubTarget`/`Audit`) | Teknisk plan. |
| `TalentTracking` / `TalentRessurs` / `WagrSnapshot` / `PublicPlayer*` | Talent/WAGR. |
| `EmailTemplate` | E-postmaler. |
| `AuditLog` | Audit-logg. |
| `PageApproval` | QA-godkjenning (godkjenn-portal — internt, ikke coach-arbeidsflyt). |
| `TrainingSessionV2` / `TrainingDrillV2` / `DrillLogV2` | Live-økt Spor B. |
| `Subscription` / `Payment` | Økonomi/abonnement. |

---

## 6. CBAC-oversikt — DEFINERT vs HÅNDHEVET

**Hovedfunn:** `src/lib/auth/cbac.ts` definerer 10 capabilities og en `can(role, capability)`-funksjon, **men capability-laget håndheves nesten ingensteds.** All reell tilgangsstyring i `/admin` skjer via `requirePortalUser({ allow: UserRole[] })` → `hasRole()` — altså ren ROLLE-sjekk (ADMIN/COACH/PLAYER/PARENT/GUEST), aldri capability-sjekk.

**Bevis:**
- `can()` kalles KUN ett sted: `settings/tilgang/page.tsx:85` — og det er en **read-only visningsmatrise** (viser hvilke roller som «har» hvilke capabilities), ikke en gate.
- Filer som i det hele tatt importerer `@/lib/auth/cbac`: bare 4 — `settings/tilgang/page.tsx` (display) + de tre `live/[sessionId]/{brief,active,summary}/actions.ts`. De tre live-filene bruker `hasRole(me.role, ["COACH","ADMIN"])` (f.eks. `live/[sessionId]/active/actions.ts:38`), **ikke** `can()`/capabilities.
- `requirePortalUser.ts:29` er det eneste stedet `hasRole` driver faktisk gating — og det tar `UserRole[]`, ikke capabilities.

| Capability (`cbac.ts:6-17`) | Tildelt rolle(r) | Hvor HÅNDHEVET | Status |
|---|---|---|---|
| `VIEW_OWN_PROFILE` | alle | ingen `can()`-gate | DEFINERT, ikke håndhevet via CBAC |
| `EDIT_OWN_PROFILE` | alle unntatt GUEST | ingen | DEFINERT, ikke håndhevet |
| `VIEW_OWN_BOOKINGS` | PLAYER/PARENT/COACH | ingen | DEFINERT, ikke håndhevet |
| `CREATE_BOOKING` | PLAYER/PARENT/COACH | ingen | DEFINERT, ikke håndhevet |
| `VIEW_CHILDREN` | PARENT | ingen | DEFINERT, ikke håndhevet |
| `VIEW_ALL_PLAYERS` | COACH/ADMIN | ingen (rute gated på rolle via `requirePortalUser`) | DEFINERT, ikke håndhevet via CBAC |
| `EDIT_PLAYER_PLAN` | COACH/ADMIN | ingen | DEFINERT, ikke håndhevet |
| `VIEW_FINANCE` | ADMIN (kun via `Object.values` på linje 43) | ingen — `/admin/okonomi` gated på rolle, ikke capability | DEFINERT, ikke håndhevet |
| `MANAGE_FACILITIES` | ADMIN | ingen | DEFINERT, ikke håndhevet |
| `MANAGE_USERS` | ADMIN | ingen | DEFINERT, ikke håndhevet |

**Faktisk gate-mekanikk:**
- Rute-nivå: hver `/admin`-side + `layout.tsx` kaller `requirePortalUser({ allow: ["ADMIN","COACH"] })` (layout.tsx:11). Noen sider strammer til `["ADMIN"]` (f.eks. `godkjenn-portal` redirecter til login hvis ikke admin, godkjenn-portal/page.tsx).
- Action-nivå: tellinger viser ~43 `requirePortalUser({ allow: ["COACH","ADMIN"] })`, 5 `["ADMIN","COACH"]`, 2 rene `["ADMIN"]`.
- **Konsekvens:** capability-systemet er en ubrukt abstraksjon. F.eks. `VIEW_FINANCE`/`MANAGE_USERS`/`MANAGE_FACILITIES` (kun ADMIN i tabellen) håndheves IKKE — en COACH som når `/admin/okonomi` eller `/admin/team` slipper inn fordi rute-gaten er `["ADMIN","COACH"]`, ikke en `VIEW_FINANCE`-sjekk. Skillet ADMIN-vs-COACH for finans/brukeradmin er dermed teoretisk, ikke håndhevet.

**Åpent sikkerhets-/IA-spørsmål:** Skal COACH ha tilgang til `/admin/okonomi`, `/admin/team` (inviterCoach), `/admin/settings`? I dag: ja (rolle-gate `["ADMIN","COACH"]`), selv om capability-modellen sier nei. Dette bør avklares i en senere audit-seksjon.

---

<a id="del-2"></a>

# Seksjon 3 — Hvordan AgencyOS lar coachen følge opp spillere

READ-ONLY audit. Alle påstander har `fil:linje`. Koden er fasit.

---

## 0. Prompt-antakelser vs virkelighet (les først)

Audit-prompten antok et `getStudent360` med «9 grupper» og et signal-lag i
`src/lib/portal/signals` + `src/lib/portal/coaching-signals`. **Ingen av disse finnes.**

| Prompt-antakelse | Status i koden | Ekte ekvivalent |
|---|---|---|
| `getStudent360` | FINNES IKKE (0 treff i `src/`) | `loadSpillerDetaljOversikt` i `src/lib/admin-spiller/spiller-detalj-data.ts:86` + selve siden `src/app/admin/spillere/[id]/page.tsx:209` (`SpillerProfilPage`) som henter resten direkte |
| «9 grupper» av data | FINNES IKKE som navngitt struktur | Spiller-360-siden henter ~9 datablokker via ett `Promise.all` (se §1), men de er ikke en formell «gruppe»-abstraksjon. Den eneste «9»-en i koden er «9 tilstander» i `/admin/tilstander` (statisk design-showcase, urelatert) |
| `lib/portal/signals` | FINNES IKKE | `prisma.signal`-modellen (`prisma/schema.prisma:1375`) skrevet av cron/trigger-agenter i `src/lib/agents/` (se §2). Ingen `portal/`-signal-mappe |
| `lib/portal/coaching-signals` | FINNES IKKE | Det er INGEN dedikert «coaching-signals»-modul. «Coach-flagg» er **utledet inline** på hver flate (se §2–3) |

**Konklusjon:** Det finnes ikke et formelt, sentralisert «signal-lag» for coach-oppfølging.
Det finnes (a) en lavnivå `Signal`-telemetri-tabell skrevet av agenter, og (b) et
**de-facto signal-lag** som regnes ut på nytt, lokalt, i hver oppfølgingsflate fra rådata
(plan-økter, `lastLoginAt`, `userStatus`, `leaves`, SG). Tersklene er IKKE delt — hver flate
har sine egne (se §2 sammenligningstabell).

---

## 1. Spiller-360 / oversikt

To filer utgjør spillerprofilen `/admin/spillere/[id]`:

- `src/lib/admin-spiller/spiller-detalj-data.ts` → `loadSpillerDetaljOversikt(playerId)`
  (`:86`) — KPI + pyramide + uke + neste booking + comms.
- `src/app/admin/spillere/[id]/page.tsx` → `SpillerProfilPage` (`:209`) — henter
  identitet, runder, tester, aktiv plan, pending PlanAction, turneringspåmeldinger,
  uke-økter; utleder hero, coach-flagg og meldingskort.

`map-spiller-detalj.ts` finnes også, men er en **alternativ mapper** (til en eldre
`<SpillerDetalj>`-komponent) og kalles ikke fra `page.tsx` — page.tsx renderer sin egen
JSX direkte. (Verifisert: `page.tsx` importerer kun `loadSpillerDetaljOversikt`, ikke
`mapSpillerDetalj`.)

### 1a. Datagrupper på spiller-360 (det nærmeste man kommer «9 grupper»)

| # | Datagruppe | Kilde-spørring (fil:linje) | Hvordan det vises |
|---|---|---|---|
| 1 | Identitet/HCP/ambisjon/klubb/fødselsdato/siste innlogging + gruppemedlemskap | `page.tsx:218` `prisma.user.findUnique` (select inkl. `groupMemberships`) | Hero: avatar-initialer, eyebrow (`gruppe · ambisjon · HCP`), navn, mono-meta (`alder · medlem siden · dg til turnering`) `:435–457` |
| 2 | KPI siste 30 d: økter (done/plan/diff), timer trent + delta, SG-trend + rundeantall | `loadSpillerDetaljOversikt` → `trainingPlanSession.findMany` ×3 + `round.findMany` (`spiller-detalj-data.ts:111–129`) | Brukes til pyramide/uke/comms; KPI-tallene eksponeres i `oversikt.kpi` men page.tsx viser dem ikke i egne KPI-tiles (de bor i mapper-varianten). Pyramide + uke + comms vises |
| 3 | Pyramide-adherence (denne uka, per akse, done/plan-timer + alarm <50 %) | `spiller-detalj-data.ts:184–209` (fra `ukeSessions`) | Venstre kolonne «Treningspyramide» `:483–509`: 5 barer (TURN→SPILL→SLAG→TEK→FYS) + accent-innsikt «X ligger N pp bak» |
| 4 | Siste runder (4 stk) | `page.tsx:245` `prisma.round.findMany take:4` | Tabell «Siste runder & tester» `:516–557` (dato, hendelse, resultat, SG) |
| 5 | Siste tester (4 stk) | `page.tsx:257` `prisma.testResult.findMany take:4` | Samme tabell, slått sammen+sortert m/ runder `:371–388` |
| 6 | Aktiv treningsplan + økt-status | `page.tsx:263` `prisma.trainingPlan.findFirst isActive` | Høyre kolonne «Aktiv plan» `:562–587`: navn, uke-span, % fullført, progress-bar |
| 7 | Pending PlanAction (AI/agent-forslag) | `page.tsx:274` `prisma.planAction.findFirst status:PENDING` | «Meldinger»-kort `:610–630` (zod-validert `suggestion`); fallback til `oversikt.comms[0]` |
| 8 | Turneringspåmeldinger (neste) | `page.tsx:279` `prisma.tournamentEntry.findMany PLANNED/CONFIRMED` | Hero-meta «N dg til {turnering}» `:304–322` |
| 9 | Uke-økter passert (for coach-flagg) | `page.tsx:288` `trainingPlanSession.findMany` denne uka < nå | Coach-flagg-kort (se §2) |
| (+) | Comms/varsler (siste 3 notifications) | `spiller-detalj-data.ts:151` `prisma.notification.findMany take:3` | Fallback i Meldinger-kort + `oversikt.comms` |
| (+) | Neste booking + ukens bekreftede bookinger | `spiller-detalj-data.ts:131–149` | Uke-grid pips + neste-booking (eksponert i `oversikt`, vises i mapper-varianten) |

Så: ~9 hovedblokker hvis man teller `page.tsx`-spørringene, men **ingen kode kaller det
«grupper» eller «9»**. Det er ren `Promise.all`-fan-out.

### 1b. Andre faner på spiller-360 (`/admin/spillere/[id]/...`)
Underruter finnes: `effekt-tab.tsx` (PlanEffectiveness-tidslinje m/ SG-delta + coach-rating,
`:1`), `workbench/`, `plan/`, `profil/`, `tester/`, `tildel-test/`, `fremgang/`, `rediger/`.
Disse er separate sider, ikke en del av 360-oversikten.

### 1c. Server actions på spiller-360 (`actions.ts`)
- `lagreSpillerDNA` (`:73`): dominant miss, SG-breakdown, prioritert fokus, svakhetsprofil
  — lagres i `user.preferences`-JSON (venter Prisma-migrasjon, `:96–110`).
- `lagreCoachDirektiv` / `slettCoachDirektiv` (`:131`, `:194`): PIN/BLOCK/PRIORITER per drill
  → `coachDrillDirectiv`-tabell.
- `lagreSpillerFasiliteter` (`:250`): hvilket utstyr spilleren har tilgang til.

---

## 2. Signaler — det de-facto signal-laget

### 2a. `prisma.signal`-tabellen (lavnivå telemetri — IKKE coach-vendt)
Modell: `prisma/schema.prisma:1375`. Felter: `kind` (fri streng), `value`, `payload`,
`computedAt`. Kommentaren lister `kind`: `SG_TOTAL | SG_AREA | HCP_TREND | CLUB_AVG |
PYRAMID_AREA | STREAK`.

**Skrives av** (kun 3 steder):
| Agent (fil) | Skriver `kind` | Når |
|---|---|---|
| `round-agent.ts:34` | `SG_TOTAL, SG_OTT, SG_APP, SG_ARG, SG_PUTT` (snitt siste 30 d) | etter `Round.create` (via `triggerRoundAgent`) |
| `test-agent.ts:34,45` | `TEST_TREND` + test-spesifikke | etter test |
| `trackman-agent.ts:44` | `CLUB_AVG` | etter TrackMan-økt |

**Leses av** (de fleste er PlayerHQ/AI, ikke AgencyOS-oppfølging):
- AI-plan: `context.ts:449`, `week-suggest.ts:127`, `tournament-prep.ts:105`.
- PlayerHQ: `portal/mal/...`, `agent-pipeline`.
- **AgencyOS-oppfølging som faktisk leser Signal:**
  - `queue/page.tsx:67` — siste `SG_TOTAL` → «score-fall»-tag (terskel < −0,5).
  - `innboks-data.tsx:168,176` — siste `SG_TOTAL` (KPI «SG 7 D») + `PYRAMID_AREA` (KPI «PYRAMIDE») i meldings-kontekstpanelet.
  - `admin-brief.ts:50` — `signal.count` siste 7 d (kun et telleverk i daglig brief).
  - `agents/page.tsx:50` — `signal.count` (agent-dashboard).

Så `Signal`-tabellen mater 2 av oppfølgingsflatene (queue + innboks-kontekst) med ÉN verdi
hver. Den er ikke et rikt signal-lag for oppfølging.

### 2b. Utledede coach-flagg (det coachen faktisk ser) — beregnes inline per flate
Dette er kjernen. Hver flate regner ut sine egne flagg fra rådata. **Tersklene er IKKE delte.**

| Flagg / signal | Beregning | Terskel | Vises hvor (fil:linje) |
|---|---|---|---|
| «N økter bak» | `trainingPlanSession` denne uka m/ `status=PLANNED` (passert) | `bak >= 1` | Spiller-360 coach-flagg `page.tsx:332`; `/admin/spillere`-tabell `spillere/page.tsx:83` |
| «N dg inaktiv» (360) | `(nå − lastLoginAt)` i dager | `>= 5` (og kun hvis ingen økt-bak) | Spiller-360 coach-flagg `page.tsx:345` |
| «Bak plan» (stall) | økter denne uka, `done < planned·0,5` (eller status SKADET/PERMISJON) | `done < 0,5·planned` | `stallen-data.ts:160–163` (`/admin/stall`-data) |
| «Inaktiv» (stall) | `userStatus=INAKTIV` ELLER `daysSinceLogin >= 14` ELLER null | `>= 14 d` | `stallen-data.ts:155–157` |
| «Ønsker veil.» | pending `SessionRequest` | `>= 1` pending | `stallen-data.ts:154` |
| Pyramide-akse-alarm (stall) | akse-adherence % denne uka | `pct < 40` | `stallen-data.ts:321` |
| Pyramide-alarm (360) | `done/plan` per akse | `ratio < 0,5` | `spiller-detalj-data.ts:207` |
| «Risiko»-nivå 0–4 | skade/permisjon/dager-siden-økt + aktiv plan | se §3 risiko | `/admin/risiko` `risiko/page.tsx:169–182` |
| Queue «Risiko/Watch/Sjekk inn» | antall samtidige grunner (ingen plan, inaktiv >14 d, SG-fall <−0,5) | `>=3 risk, =2 watch, =1 check` | `queue/page.tsx:85–138` |
| Cockpit «N DG INAKTIV» | `(nå − lastLoginAt)` | `< −5 d` for å vises, `alert` ved `>=7 d` | `daily-brief-data.tsx:178,362–392` |
| Cockpit «FORESPØRSEL» | pending `SessionRequest` | `>= 1` | `daily-brief-data.tsx:342` |

**Inkonsistens verdt å merke:** «inaktiv» har minst tre forskjellige terskler i tre flater
— 5 d (360), 14 d (stall + queue), 5 d (cockpit fokus). «Økter bak» bruker `PLANNED`-status
i én flate (`page.tsx`, `spillere/page.tsx`) og `done<0,5·planned` i en annen (`stallen-data.ts`).
Det finnes ingen delt helper — hver flate eier sin egen definisjon.

---

## 3. Degradering / varsler

Det er **ingen egen «degradation»-modul** (0 treff på `degrad`). «Degradering» finnes som to
mekanismer:

### 3a. PlanAction — agent-genererte forslag (det nærmeste et varsel-system)
`PlanAction`-tabellen er den faktiske «varsel-køen». Skrives av cron-agenter:

| Agent (fil) | actionType | Trigger / terskel | Hva skjer |
|---|---|---|---|
| `training-gap.ts:121` | `TRAINING_GAP` | Svakeste SG-område får < 20 % av treningstid siste 4 uker (krever ≥3 runder m/ SG, alle 4 områder målt) `:22,99` | Lager `PlanAction PENDING`; ved endret svakeste-område settes gammel til `SUPERSEDED` `:115` |
| `plan-watcher.ts:51` | `PYRAMID_ADJUST` | Akse er > 8 pp under mål-allokering forrige uke (mål: FYS15/TEK20/SLAG35/SPILL20/TURN10) `:12,49` | Lager `PlanAction PENDING` per akse |

**KRITISK FUNN:** `training-gap` er IKKE registrert som cron i `vercel.json` (0 treff).
Bare `plan-watcher` kjører (`/api/cron/plan-watcher`, «0 6 * * 1» = mandag 06:00). `training-gap`
finnes i cron-route-mappingen (`api/cron/[agent]/route.ts:36`) men har ingen schedule-entry,
så `TRAINING_GAP`-flagg genereres aldri automatisk i prod (kun ved manuelt agent-trigger).

PlanAction PENDING vises for coachen i: `/admin/godkjenninger` (+`[id]`),
`/admin/approvals`, `/admin/agents`, `/admin/workspace/tildelt-meg`, spiller-360
«Meldinger»-kort (`page.tsx:274`), cockpit innboks «GODKJENN» (`daily-brief-data.tsx:281`),
og daglig brief KPI (`admin-brief.ts:46`).

### 3b. Status-degradering på User
`User.userStatus` (`AKTIV/INAKTIV/SKADET/PERMISJON`) + `Leave`-tabellen (skade/permisjon)
driver risiko-/status-flagg i `/admin/risiko` (`risiko/page.tsx:158–191`) og `/admin/stall`
(`stallen-data.ts:147`). Settes manuelt/av andre flater — ingen auto-degraderings-agent
oppdaterer `userStatus` basert på inaktivitet.

---

## 4. Coach-oppfølgingsflater (rute for rute)

| Rute | Fil | Hva coachen får | Datakilde | Merknad |
|---|---|---|---|---|
| `/admin/agencyos` (Cockpit) | `agencyos/page.tsx` + `lib/agencyos/daily-brief-data.tsx` | 3-kolonne Bloomberg-cockpit: dagens timeline (bookinger), innboks (req+godkjenn+notifs), oppgaver (Notion), **«Trenger oppmerksomhet»** (forespørsler + inaktive spillere m/ pin), 4 KPI (aktive spillere, økter i dag, ventende godkjenn, MRR), stall-SG + plan-etterlevelse | Ekte Prisma (Booking, User, PlanAction, SessionRequest, OppgaveCache, Subscription, Round, TrainingPlanSession) | Rikeste oppfølgingsflate. «Fokus»-spiller = inaktiv ≥5 d eller pending forespørsel `:340–397` |
| `/admin/queue` (= `/admin/oppfolging`, alias) | `queue/page.tsx`; `oppfolging/page.tsx:9` re-eksporterer | Kanban «Hvem trenger en samtale»: Risiko / Watch / Sjekk inn / Løst. Per spiller: signal, SG-stat, tags, hurtigaksjoner | `prisma.user` + `trainingPlans(isActive)` + `signals(SG_TOTAL)` `:63–73` | Klassifisering = antall samtidige grunner `:135`. «Løst»-kolonne alltid tom (`ok:[] :142`, TODO). «Generer AI-aksjoner» disabled `:204` |
| `/admin/spillere` (Stallen / liste) | `spillere/page.tsx` → `SpillereTabell` | Sortbar spiller-tabell «sortert på hastighet»: navn, gruppe, HCP, SG-sparkline+delta, siste aktivitet, status, neste økt. `?view=tavle` for board | Egen inline-loader (User + bookinger groupBy + uke-økter) `:100` | Status-heuristikk inline `:78–90`. `trengerDeg`-teller `:224`. **Egen** logikk, ikke `loadStallen` |
| `/admin/stall` | `stall/page.tsx` → `StallClient`; `lib/admin/stallen-data.ts` (`loadStallen`) | Roster-tabell + 360-panel. Filter (WANG/GFGK/AKA), tellere (bakPlan/inaktive), SG-trend, pyramide-adherence per akse | Ekte Prisma (User, enrollments, sgInputs/rounds, SessionRequest, plan-økter) | `stall/page.tsx` bruker IKKE `loadStallen` — den har sin egen inline-loader m/ plassholdere («adh: 88 %» `:188`, FYS pct 60 `:157`). `loadStallen` (rik) ser ut til å være ubrukt av denne siden — verifiser hvem som kaller `loadStallen` |
| `/admin/board` | `board/page.tsx:7` | — | redirect → `/admin/spillere?view=tavle` | Ren redirect |
| `/admin/risiko` | `risiko/page.tsx` | Stall-heatmap (8-kol grid, risiko-farge per spiller) + liste «Trenger oppfølging nå» m/ årsak + nivå-chip | Ekte Prisma (User, leaves, trainingPlans, `trainingPlanSessionLog` siste økt) `:95–146` | Egen 0–4 risiko-formel `:169–182`. Bevisst FYS-formel-uavhengig `:7` |
| `/admin/tilstander` | `tilstander/page.tsx` | **Statisk design-system-showcase** av 9 økt-tilstander | HARDKODET demo (`Mathias Pedersen`, `Sondre Berg`, «Elite» `:42–160`) | IKKE en ekte oppfølgingsflate. Gamle navn (bryter navne-kanon), «Bruk i Figma»-knapp disabled `:184`. Bør flagges som drop-off/demo |
| `/admin/handlingssenter` | `handlingssenter/page.tsx` + client | Kanban/tabell/liste over oppgaver (todo/doing/done/backlog) m/ prioritet, frist, tildelt | `prisma.oppgaveCache` (Notion-sync) `:81` | Generelle oppgaver, ikke spiller-spesifikk oppfølging. Ærlig tom-tilstand når Notion ikke koblet |
| `/admin/agencyos/live` (Mission Control) | `agencyos/live/data.ts` + `mission-control.tsx` | Personlig «Meg»-OS: e-post/meldinger/kalender/Notion-mock | **STATISK seed** verbatim fra design-handover `:1–8` (`SCENE_DATE="Onsdag 3. juni 2026"`) | Visuelt skall, live-integrasjon ikke koblet. Ikke spiller-oppfølging |
| `/admin/agencyos/spillere`, `/uka`, `/okonomi`, `/caddie` | underruter | Cockpit-faner (IA-beslutning, fane-rad fra `agencyos/layout.tsx`) | varierende | Del av cockpit-IA |
| `/admin/talent` | `talent/page.tsx` | Talent Coach: SkillRadar + PercentileGauge + PyramidProgress + H2H | `prisma.talentTracking` (egen tabell) `:6` | Talentutvikling/percentil, ikke daglig oppfølging. Spiller-selector fra URL |
| `/admin/brief` | `brief/page.tsx` + `_fokus-spiller.tsx` + `admin-brief.ts` | Daglig AI-brief (timer, runder, godkjenn, meldinger, signals-teller) + fokus-spiller | `getBriefData` `admin-brief.ts:18` | Bruker `signal.count` kun som teller `:50`, ikke per-spiller |

### 4a. Det finnes IKKE en «Elever»-flate ved det navnet
Det er ingen `/admin/elever`-rute (board-kommentaren `:5` nevner en tidligere «elever»-liste
som er slått sammen til `/admin/spillere`). «Elever»-ekvivalenten = `/admin/spillere` + `/admin/stall`.

### 4b. Duplikatproblem (verdt å notere for arkitektur)
Det er **tre uavhengige spiller-roster-loadere** med hver sin status-logikk:
1. `spillere/page.tsx` (inline) — `/admin/spillere`.
2. `stall/page.tsx` (inline, med plassholdere) — `/admin/stall`.
3. `lib/admin/stallen-data.ts` `loadStallen` (rikeste, enrollment-scoped) — ser ubrukt ut av
   `stall/page.tsx`; bør verifiseres hvem som faktisk kaller den.
Pluss queue + cockpit + risiko som hver re-implementerer «inaktiv/bak plan». Ingen delt
signal-helper.

---

## Kort oppsummering

- **Prompt-antakelsene stemmer ikke.** `getStudent360`, «9 grupper», `lib/portal/signals`
  og `lib/portal/coaching-signals` finnes ikke. Ekte spiller-360 = `loadSpillerDetaljOversikt`
  (`src/lib/admin-spiller/spiller-detalj-data.ts:86`) + `src/app/admin/spillere/[id]/page.tsx`.
- **To signal-lag:** (1) `prisma.signal`-telemetri (SG/test/trackman-snitt skrevet av 3 agenter,
  konsumert tynt av queue + innboks-kontekst), og (2) et **de-facto coach-flagg-lag** som regnes
  inline på hver flate fra plan-økter + `lastLoginAt` + `userStatus`/`leaves` + SG. Tersklene er
  ikke delt → «inaktiv» er 5/14/5 dager i tre ulike flater.
- **Varsel-systemet = `PlanAction`** (TRAINING_GAP + PYRAMID_ADJUST). MEN `training-gap` har
  INGEN cron-entry i `vercel.json` — bare `plan-watcher` kjører (man. 06:00). TRAINING_GAP-flagg
  genereres aldri automatisk i prod.
- **Rikeste oppfølgingsflater:** Cockpit (`/admin/agencyos`) og Queue (`/admin/queue` =
  `/admin/oppfolging`). Stall/spillere = roster. Risiko = heatmap m/ egen 0–4-formel.
- **Demo/skall (ikke ekte oppfølging):** `/admin/tilstander` (statisk, gamle navn) og
  `/admin/agencyos/live` (statisk seed, «3. juni 2026»).

## Åpne spørsmål

1. **`training-gap` uten cron:** Er det bevisst at TRAINING_GAP-agenten ikke kjører automatisk
   (mangler i `vercel.json`), eller er det en glipp? Den er fullt implementert men dør stille.
2. **Tre roster-loadere + ubrukt `loadStallen`:** Skal `loadStallen` (den rike, enrollment-scopede)
   bli den ene kilden, og `stall/page.tsx` + `spillere/page.tsx`-inline-loaderne konsolideres?
   Hvem kaller faktisk `loadStallen` i dag?
3. **Inkonsistente «inaktiv»/«bak plan»-terskler** (5 vs 14 d; PLANNED-status vs done<0,5·planned):
   Skal disse samles i én delt signal-helper, eller er flate-spesifikke terskler ønsket?
4. **`/admin/tilstander`** har hardkodet demo med gamle navn (Mathias Pedersen, Sondre Berg,
   «Elite») som bryter navne-kanon og «ingen demo-data»-regelen. Skal den kobles til ekte data,
   merkes som ren design-referanse, eller fjernes?
5. **`map-spiller-detalj.ts`** ser ut til å være død kode (page.tsx bruker den ikke). Slettes?
6. **`prisma.signal` vs utledede flagg:** Skal de utledede coach-flaggene (inaktiv, økter-bak)
   persisteres som `Signal`-rader så de kan telles/historiseres, eller forblir de rene
   read-time-beregninger?

---

<a id="del-3"></a>

# Seksjon 4 — Automatiserings-pipelinen i AgencyOS

DATA → SIGNALER → (SKILLS) → AGENTER → PlanAction → COACH-INNBOKS

READ-ONLY audit. Hver påstand har fil:linje. Skiller hardt mellom **KOBLET I PROD**
(cron i `vercel.json` eller trigger fra server action) og **IMPLEMENTERT MEN IKKE TRIGGET**.

---

## 0. Kjerne-funn (TL;DR)

1. **To helt adskilte agent-univers** som nesten ikke møtes:
   - **Determ­inistiske cron/event-agenter** i `src/lib/agents/*` — skriver `Signal` + `PlanAction`. Dette er det som faktisk driver coach-innboksen.
   - **LLM-«agenter»** i `src/lib/ai/agents/*` — returnerer tekst/objekter til kalleren, skriver **ALDRI** `Signal`/`PlanAction`, og er nesten ikke wiret inn. Flere er ren foundation.
2. **`training-gap` har ingen cron-entry** i `vercel.json` (verifisert). Den er registrert i runner-mappen (`api/cron/[agent]/route.ts:36`) men kalles aldri av Vercel. Den er den ENESTE agenten som produserer `TRAINING_GAP`-actions → den action-typen oppstår aldri i prod i dag.
3. **Bare ÉN ekte planleggings-cron kjører:** `plan-watcher` (man 06:00). Alle de andre `src/lib/agents/`-agentene er event-trigget fra PlayerHQ server actions (når spiller logger runde/test/TrackMan/plan), ikke cron.
4. **«tournament-agent» finnes ikke.** Turneringsdekning er splittet: cron-jobbene `turneringer-*` synker bare ekstern turneringsdata (DataGolf/NGF), de rører ikke `PlanAction`. Periodisering frem mot turnering ligger i `performance-peaking.ts` (LLM, ikke wiret) og `tournament-prep.ts` (wiret til PlayerHQ, lager Plan/økter — ikke PlanAction).
5. **Agent-detalj-siden er ødelagt:** lista (`/admin/agents`) lenker til slugs `round-agent`, `plan-watcher` osv., men detalj-siden (`[agentId]/page.tsx:24`) kjenner bare `brief/periodisering/vinn-tilbake/win-back/ai-plan` → alle «Detaljer»-lenker fra lista gir `notFound()` (404). Detalj-siden henter dessuten kjøringer fra `AuditLog`, ikke `AgentRun`.
6. **«Skills» (weakness/periodization/progression/pyramid/drill-selection/junior-guard) finnes ikke under de navnene.** Faktiske skills er 3 kunnskapsblokker (`pyramide`, `bompa`, `sg-interpretation`) injisert i LLM-system-prompter. Mapping i §4.

---

## 1. Cron-agenter — full tabell

Datakilde for trigger: `vercel.json` (crons) + `src/app/api/cron/[agent]/route.ts:31-56` (AGENTS-map) + `src/lib/agents/triggers.ts` (event-triggere).

Alle `runAgent(...)`-wrappede agenter logger til `AgentRun` (se §6). Agenter merket «event» nedenfor kjøres synkront fra en PlayerHQ server action, IKKE av cron.

| Agent | Fil:linje | Trigger (cron / event + koblet?) | Input (leser) | Logikk / terskel | Output |
|---|---|---|---|---|---|
| **plan-watcher** | `src/lib/agents/plan-watcher.ts:20` | Cron `0 6 * * 1` (man 06:00). **KOBLET** — `vercel.json` + map `route.ts:32`. Også manuell admin-knapp (§3). | `TrainingPlan` (isActive) + `sessions` COMPLETED forrige uke (`:28-38`) | Faktisk %-fordeling per pyramide-område vs `MAL_PROSENT` (FYS15/TEK20/SLAG35/SPILL20/TURN10, `:12-18`). Lager forslag hvis `mål − faktisk > 8` prosentpoeng (`:49`). Hopper over planer uten økter (`:42`). | `PlanAction` type **PYRAMID_ADJUST** per område over terskel (`:51-65`). `planActionsWritten` |
| **round-agent** | `src/lib/agents/round-agent.ts:10` | **Event** (ikke cron). `triggerRoundAgent` fra `portal/mal/runder/actions.ts:75,341`. Trigger kaller også achievement-agent (`triggers.ts:11-18`). **KOBLET via PlayerHQ.** | `Round` siste 30 d for én bruker (`:15-18`) | `aggregateSg(runder)` (`@/lib/sg`). Ingen terskel — skriver det som finnes. | `Signal` kind **SG_TOTAL / SG_OTT / SG_APP / SG_ARG / SG_PUTT** (`:24-28`), payload `{rundeAntall}`. `signalsWritten` |
| **test-agent** | `src/lib/agents/test-agent.ts:9` | **Event.** `triggerTestAgent` fra `portal/tren/tester/actions.ts:49`, `tester/ny/actions.ts:83`, `(fullscreen-test)/.../gjennomfor/actions.ts:121`. Kaller også achievement-agent (`triggers.ts:20-27`). **KOBLET via PlayerHQ.** | Alle `TestResult` for bruker, gruppert per test (`:11-23`) | Trend = siste score − snitt av forrige 3 (`:32`). Krever ≥1 tidligere resultat (`:31`). | `Signal` kind **TEST_TREND**, payload `{testId,testNavn,latest,baseline}` (`:33-37`). `signalsWritten` |
| **trackman-agent** | `src/lib/agents/trackman-agent.ts:11` | **Event.** `triggerTrackManAgent` fra `portal/mal/trackman/actions.ts:63,100`. **KOBLET via PlayerHQ.** | Siste `TrackManSession.rawJson` for bruker (`:13-17`) | Grupperer rader per `Club`-felt, snitt-distanse per kølle (`:27-45`). Tolererer varierende CSV-headere. | `Signal` kind **CLUB_AVG** per kølle, payload `{klubb,antallSlag,sessionId}` (`:42-52`). `signalsWritten` |
| **periodiseringsagent** | `src/lib/agents/periodiserings-agent.ts:17` | **Event.** `triggerPeriodiseringsAgent(planId)` fra `portal/ny-okt/actions.ts:105`. **KOBLET via PlayerHQ.** (Agent-navn i DB = `"periodiseringsagent"`, `:7`.) | `TrainingPlan` + sessions for planId (`:21-24`) | Hvis planen alt har sesjoner → gjør ingenting (`:27-30`). Ellers foreslår standard-allokering. | `PlanAction` type **PYRAMID_ADJUST** med `{fordeling: MAL_PROSENT}` (`:32-44`). `planActionsWritten` |
| **achievement-agent** | `src/lib/agents/achievement-agent.ts:15` | **Event.** Kalt INNI `triggerRoundAgent`/`triggerTestAgent` (`triggers.ts:13,22`). **KOBLET via PlayerHQ.** | `Round`, `TestResult`, `TrainingPlanSessionLog` for bruker (`:23-30`) | Milepæler: FIRST_ROUND, FIRST_TEST (`:34-35`); SG_POSITIVE_30D hvis ≥3 runder m/ snitt-SG>0 (`:41-44`); STREAK_7 / STREAK_14 fra `computeStreak` (`:47-51`). Dedup mot eksisterende `kind` (`:53`). | `Achievement`-rader (IKKE PlanAction/Signal). `output.newAchievements` (`:65`) |
| **training-gap** | `src/lib/agents/training-gap.ts:33` | Tiltenkt cron (kommentar `:1`). **IKKE KOBLET** — finnes i map `route.ts:36` men **mangler i `vercel.json`**. Triggers aldri i prod. Ingen manuell knapp. | Per `User role=PLAYER`: `Round` siste 8 uker m/ SG (`:46-53`) + `hentTreningsVolum` siste 4 uker (`:90`) | Svakeste SG-område (lavest snitt, `:86-88`). Krever ≥3 runder (`:54`) + måling i ALLE 4 områder (`:76-77`). Flagg hvis svakeste områdes andel av treningstid `< 0.20` (`:99`). Dedup: hvis PENDING TRAINING_GAP finnes for samme område → skip; hvis annet område → sett gammel til **SUPERSEDED** og lag ny (`:102-119`). | `PlanAction` type **TRAINING_GAP** med rik payload (`:121-136`). `planActionsWritten` |

### Cron-jobber som IKKE er PlanAction-agenter (kontekst — produserer data/signaler oppstrøms, ikke coach-forslag)
Alle i `vercel.json` + `route.ts:31-56`:

| Cron path | Schedule | Funksjon | Skriver |
|---|---|---|---|
| `booking-reminders` | `0 * * * *` (hver time) | `runBookingReminders` | Notifikasjoner/bookingvarsler (ikke PlanAction) |
| `cleanup-recordings` | `0 3 * * *` | `runCleanupRecordings` | Sletter opptak |
| `refresh-calendar-watches` | `0 2 * * *` | `runRefreshCalendarWatches` | Google Calendar watch-fornying |
| `sg-insights` | `0 4 * * *` | `runSgInsights` (`@/lib/sg-hub/insight-engine`) | SG-innsikt (egen mekanisme, ikke PlanAction) |
| `datagolf-sync` | `0 5 * * 1` | `syncDataGolf` | Ekstern benchmark-data |
| `club-trends` | `0 3 * * 1` | `runClubTrends` | Klubb-trender |
| `benchmark-sync` | `0 6 * * 1` | `runBenchmarkSync` | NGF-testfasiter (DataGolf) |
| `check-stuck-bookings` | `*/15 * * * *` | (egen route `api/cron/check-stuck-bookings`) | Booking-opprydding |
| `cleanup-deleted-accounts` | `30 3 * * *` | (egen route) | GDPR-sletting |
| `turneringer-schedule` | `0 4 * * *` | `syncDataGolfSchedules` | Turneringskalender (ekstern) |
| `turneringer-players` | `0 5 * * 1` | `syncNorwegianPlayers` | Norske spillere |
| `turneringer-live` | `*/10 * * * *` | `syncLiveLeaderboards` | Live-leaderboard |
| `turneringer-ngf` | `30 4 * * *` | `syncNgfSchedule` | NGF-kalender |
| `pga-skill-ratings` / `pga-putt-distance` / `pga-approach` | man-cron | `syncPga*` | PGA-benchmark-statistikk |
| `meg-morgenbrief` / `meg-kveldsjournal` / `meg-loftesjekk` / `meg-crm-nudge` | div. | `@/lib/meg/briefs` | Meg-assistent (personlig OS, eget produkt — IKKE AgencyOS coach-pipeline) |

**Konklusjon turneringer:** ingen agent ved navn `tournament-agent`. De fire `turneringer-*`-cronene synker bare ekstern data inn i DB. Selve «peaking»-logikken frem mot turnering finnes som LLM-agent `performance-peaking.ts` (ikke wiret) og som `tournament-prep.ts` (wiret til PlayerHQ-knapp, lager Plan/økter, ikke PlanAction). Se §4.

---

## 2. agent-runner.ts — hvordan agentene kjøres

Fil: `src/lib/agents/agent-runner.ts`.

- **Mønster:** hver determ. agent pakker hele jobben i `runAgent(agentName, userId, fn)` (`:14`). `fn` returnerer `{signalsWritten?, planActionsWritten?, output?}` (`:6-10`).
- **Logg ved suksess:** lager `AgentRun` med `status:"OK"`, `duration` = `Date.now()-start` (`:19,32`), og `output` = enten eksplisitt `result.output` ELLER `{signalsWritten, planActionsWritten}` (`:22-26`). Skrives til DB (`:27-35`).
- **Logg ved feil:** fanger exception, lager `AgentRun` med `status:"ERROR"`, `error` = melding kappet til 500 tegn (`:38-47`), og **re-thrower** (`:48`). Dvs. feil propagerer til kalleren (cron-route returnerer 500; event-trigger fanges i triggers.ts try/catch).
- **Rekkefølge:** ingen orkestrering i runneren selv. Sekvensiering skjer i `triggers.ts` (round→achievement, test→achievement) og i cron-routen (én agent per HTTP-kall). Ingen parallell-fan-out.
- **Idempotens / dedup:** **Ikke i runneren.** Runneren skriver blindt. Dedup ligger per-agent:
  - `training-gap`: eksplisitt PENDING-sjekk + SUPERSEDED (`training-gap.ts:102-119`). ✔
  - `achievement-agent`: dedup mot eksisterende `kind` + `skipDuplicates` (`achievement-agent.ts:53,62`). ✔
  - `plan-watcher`, `periodiseringsagent`, `round/test/trackman`: **ingen dedup.** Kjøres plan-watcher to mandager på rad uten endring, lages duplikate PYRAMID_ADJUST-PENDING-rader. Signal-agenter lager nye Signal-rader hver kjøring (by design — tidsserie).

---

## 3. triggers.ts + manuell trigger

Fil: `src/lib/agents/triggers.ts`.

- Eksporterer 4 event-triggere, alle med try/catch som **svelger** feil (logger til console, kaster ikke) — «fire-and-forget» (`:11-43`, kommentar `:1-4`).
  - `triggerRoundAgent` → round-agent + achievement-agent (`:11-18`)
  - `triggerTestAgent` → test-agent + achievement-agent (`:20-27`)
  - `triggerTrackManAgent` → trackman-agent (`:29-35`)
  - `triggerPeriodiseringsAgent(planId)` → periodiseringsagent (`:37-43`)
- **Hvem kaller (verifisert):**
  - `portal/mal/runder/actions.ts:75,341` (logg runde)
  - `portal/tren/tester/actions.ts:49`, `tester/ny/actions.ts:83`, `(fullscreen-test)/.../gjennomfor/actions.ts:121` (logg test)
  - `portal/mal/trackman/actions.ts:63,100` (TrackMan-import)
  - `portal/ny-okt/actions.ts:105` (ny plan)
- **Merk:** `triggers.ts` inneholder INGEN event-bus eller UI-trigger. Det er rene funksjons-kall fra PlayerHQ. Det finnes ingen kobling fra `triggers.ts` til `admin/agents/manual-trigger.tsx`.

**Manuell trigger (UI):** `src/app/admin/agents/manual-trigger.tsx` (kun ADMIN, `page.tsx:171`) →
server action `triggerPlanWatcherManually` i `admin/agents/actions.ts:7-12` → `runPlanWatcher()`.
**Bare plan-watcher** kan trigges manuelt; de andre 6 agentene har ingen manuell knapp.
`manual-trigger.tsx:14` viser `res.planActionsWritten`.

---

## 4. «Skills» / regler — ekte navn vs prompt-begrep

### 4a. De faktiske «Skills» (kunnskapsblokker injisert i LLM-prompter)
Fil: `src/lib/ai/skills/index.ts`. Kun **3** skills i `ALL_SKILLS` (`:25-29`):

| Skill (faktisk) | Fil | Hva | Brukt av |
|---|---|---|---|
| `pyramideSkill` | `skills/pyramide-taksonomi.ts` | Pyramide-taksonomi-kunnskap (FYS/TEK/SLAG/SPILL/TURN) | caddie, daily-brief, plan-revision, performance-peaking (via ALL_SKILLS / direkte import) |
| `bompaSkill` | `skills/bompa-perioder.ts` | Bompa periodiserings-modell | performance-peaking, plan-revision, caddie |
| `sgInterpretationSkill` | `skills/sg-interpretation.ts` | SG-tolkning mot benchmark | sg-interpretation-agent, caddie, daily-brief |

Disse er IKKE kjørbar logikk — de er strenger som limes inn i `system`-prompten (`SKILLS_BLOCK`, f.eks. `daily-brief.ts:15-17`).

### 4b. Prompt-begrepene → hva som faktisk dekker dem

| Prompt-begrep | Faktisk dekning | Fil | Type | Wiret? |
|---|---|---|---|---|
| **periodization** | `performance-peaking.ts` (LLM, Bompa-faser frem mot turnering) + `periodiserings-agent.ts` (determ., initial allokering) + skill `bompa-perioder` | begge | LLM + determ. | peaking: NEI (kun via test-fil/index). periodiserings-agent: JA (event) |
| **pyramid** | skill `pyramide-taksonomi.ts` + `@/lib/pyramide` (helpers brukt av plan-watcher) | — | kunnskap + helper | JA (plan-watcher bruker `@/lib/pyramide`) |
| **weakness** | `training-gap.ts` (svakeste SG-område) + `sg-interpretation.ts` (svakeste kategori + drill-forslag, `:svakesteKategori`) | begge | determ. + LLM | training-gap: NEI (ingen cron). sg-interpretation: NEI (kun index/test) |
| **drill-selection** | `sg-interpretation.ts` returnerer `anbefalteDrills` (`:type SgInterpretationResult`). PlanAction-typen `DRILL_SUGGEST` finnes i enum men **ingen agent genererer den** | `ai/agents/sg-interpretation.ts` | LLM | NEI |
| **progression** | Ingen dedikert modul funnet. Nærmeste: `effectiveness.ts` (`ai-plan/`) + achievement-streaks | `ai-plan/effectiveness.ts` | determ. | — |
| **junior-guard** | **Ikke funnet** under noe agent/skill-navn. (Junior-logikk finnes ev. i constraints, ikke i agent-pipelinen.) | — | — | — |

Andre relevante regel-/motor-moduler:
- `src/lib/ai-plan/`: `context.ts` (bygger spiller-kontekst for AI-plan), `generate.ts` (kaller Claude, returnerer plan-JSON via tool_use — skriver **ikke** PlanAction, kun plan-objekt, `generate.ts:118,158`), `effectiveness.ts`, `tournament-prep.ts`, `week-suggest.ts`, `system-prompt.ts`, `coach-prompt.ts`.
- `src/lib/portal/training/`: `ak-taxonomy.ts`, `periode-constraints.ts`, `session-generator.ts`, `date-parser.ts` — determ. regelmotorer for økt-generering (ikke en del av Signal→PlanAction-løypa).

### 4c. LLM-agentene (`src/lib/ai/agents/*`) — status

Felles mønster: `import { anthropic, isAiEnabled }` fra `../client`, **demo-fallback** når `ANTHROPIC_API_KEY` mangler (`client.ts:17-22`, `isAiEnabled` `:36`). Modell `claude-sonnet-4-6` (`client.ts:24`). Ingen av dem skriver `Signal`/`PlanAction`/`AgentRun` — de **returnerer** objekter til kalleren.

| LLM-agent | Fil | Gjør | Input | Output | LLM? | Wiret i prod? |
|---|---|---|---|---|---|---|
| caddie | `ai/agents/caddie.ts:?` | Chat-assistent for coach m/ tools+skills+memory | meldinger + userId | chat-svar + tool-logg | Ja (tool-loop) | Foundation — kommentar `:6-10` sier UI bygges separat. Ikke funnet wiret. |
| caddie-with-spiller | `ai/agents/caddie-with-spiller.ts` | Caddie m/ spiller-kontekst injisert | — | chat | Ja | Som over |
| daily-brief | `ai/agents/daily-brief.ts:71` | 200-ords coach-brief + metrics (flagg: INAKTIV/HRV/OVERDUE_TEST, neste turnering) | `coachId,dato`; leser TrainingSessionV2, CoachingSession, Round, HealthEntry, TestResult, TournamentEntry | `{brief, metrics}` | Ja (m/ demo-fallback) | **NEI** — `/admin/brief` bruker en EGEN generator (`@/lib/admin-brief` + `@/lib/anthropic`, `brief/page.tsx:38-43`), ikke denne. `genererDailyBrief` kalles kun i test (`__tests__/ai/agents-index.test.ts`). |
| plan-revision | `ai/agents/plan-revision.ts:?` | Foreslår plan-justeringer for trigger (siste-runde/skade-flagg/turnering-prep) | `planId,trigger,context` | `PlanRevisionForslag` (endringer + rasjonale) | Ja | NEI (kun index/test) |
| vinn-tilbake | `ai/agents/vinn-tilbake.ts:37` | Finner inaktive spillere (>30 d) + personlig melding | `coachId`; CoachingSession, TrainingSessionV2, Round, Goal | `InaktivSpillerForslag[]` | Ja (m/ demo) | NEI (kun index/test) |
| sg-interpretation | `ai/agents/sg-interpretation.ts:?` | Tolker SG + foreslår 3-5 drills | `spillerId` | `SgInterpretationResult` | Ja | NEI (kun index/test) |
| performance-peaking | `ai/agents/performance-peaking.ts:?` | Uke-for-uke Bompa-plan frem mot turnering | spiller+turnering | `PeakingPlanResult` (fase/volum/intensitet per uke) | Ja | NEI (turneringer-actions bruker `ai-plan/tournament-prep` i stedet) |

---

## 5. PlanAction-generering — actionType → agent → payload → prioritet

Enum dokumentert i `schema.prisma:1394-1396`: PYRAMID_ADJUST, SESSION_ADD, SESSION_REMOVE,
INTENSITY_ADJUST, TAPER_ENGAGE, WITHDRAW, DRILL_SUGGEST, TEST_SCHEDULE, PEER_COMPARE,
RECOVERY_ADD. UI kjenner i tillegg ESCALATION, DELOAD (`agents/[agentId]/page.tsx:82-83`),
og innboksen SESSION_SWAP, TOURNAMENT_ENTRY, PLAN_CHANGE (`godkjenninger/page.tsx:24-31`).

**Hvilke som faktisk genereres i dag:**

| actionType | Generert av (agent) | suggestion-payload (Json) | Status |
|---|---|---|---|
| **PYRAMID_ADJUST** | `plan-watcher` (`plan-watcher.ts:51-65`) | `{omrade, omradeNavn, faktiskProsent, malProsent, forklaring}` | **PROD** (cron man 06:00) |
| **PYRAMID_ADJUST** | `periodiseringsagent` (`periodiserings-agent.ts:32-44`) | `{forklaring, fordeling: MAL_PROSENT}` | **PROD** (event ved ny plan) |
| **TRAINING_GAP** | `training-gap` (`training-gap.ts:121-136`) | `{svakestOmraade, svakestLabel, snittSg, andelTrening, totalMinutterSiste4Uker, svakestMinutterSiste4Uker, forklaring}` | **IMPLEMENTERT, IKKE TRIGGET** (ingen cron) |
| Alle andre (SESSION_*, INTENSITY_ADJUST, TAPER_ENGAGE, WITHDRAW, DRILL_SUGGEST, TEST_SCHEDULE, PEER_COMPARE, RECOVERY_ADD, ESCALATION, DELOAD, SESSION_SWAP, TOURNAMENT_ENTRY, PLAN_CHANGE) | **INGEN agent genererer dem** | — | Kun labels i UI; oppstår ikke fra pipelinen. (Kan i prinsippet seedes/skrives manuelt, men ingen kode-sti funnet.) |

`TRAINING_GAP` mangler i schema-kommentaren (`:1394-1396`) men er en gyldig fri-tekst `actionType String` — DB godtar den.

**Prioritet / rekkefølge:**
- PlanAction har **ingen** prioritets-/severity-kolonne (`schema.prisma:1390-1410`). Rekkefølge bestemmes utelukkende av `createdAt` (`@@index([userId,status,createdAt])` `:1408`).
- Coach-innboksen sorterer `orderBy createdAt desc` (`godkjenninger/page.tsx:76`).
- «Haster»-flagg utledes i UI fra `actionType` (ikke fra data): WITHDRAW / *ESCALATION* / TAPER_ENGAGE / SESSION_SWAP → urgent (`godkjenninger/page.tsx:35-42`). Siden ingen agent genererer disse i dag, blir ingen forslag «Haster» i praksis.
- `daily-brief`-LLM-agenten har sin EGEN severity-sortering (1-5) på flagg (`daily-brief.ts:241-242`) — men den driver ikke innboksen.

---

## 6. Logg (AgentRun) + visning i UI

**Skriving:** kun `agent-runner.ts:27-35` (OK) og `:39-47` (ERROR). Felter: `agentName, userId?,
status (OK|ERROR), duration (ms), output Json?, error String?, createdAt` (`schema.prisma:1412-1424`).
Indeks `[agentName, createdAt]` (`:1422`).

**Hvem skriver hva:**
- De 7 `src/lib/agents/`-agentene (via `runAgent`) → `AgentRun`.
- LLM-agentene i `src/lib/ai/agents/` skriver **ikke** AgentRun.
- Coach-feedback skrives til `AuditLog` (ikke AgentRun): `agents/[agentId]/actions.ts:25-34` (`action:"agent.feedback"`).

**Visning i UI:**

| Skjerm | Fil | Leser fra | Viser |
|---|---|---|---|
| Agent-oversikt | `admin/agents/page.tsx` | `AgentRun` siste 30 (`:52-55`) + `Signal.count`, `PlanAction.count`, PENDING-count, forslag-i-dag (`:48-58`) | Statisk `AGENT_INFO`-tabell (6 agenter, `:9-40`) m/ aggregert ok/error/snitt-tid per agent (`:63-70`) + «Siste 30 kjøringer»-tabell (`:197-223`). **Mangler** `training-gap` i `AGENT_INFO`. |
| Agent-detalj | `admin/agents/[agentId]/page.tsx` | **`AuditLog`** der `action` starter med `agent.<id>` (`:97-106`) + `PlanAction` der `agentName=agentId` (`:107-115`) | Konfig + siste forslag + audit-kjøringer + feedback-form. **BUG:** `AGENT_KONFIG`-slugs (`:24` brief/periodisering/vinn-tilbake/win-back/ai-plan) matcher IKKE lista-slugs → `notFound()` for alle lenker fra `/admin/agents`. Henter dessuten kjøringer fra AuditLog, ikke AgentRun → tom for de ekte agentene. |
| Coach-innboks (godkjenninger) | `admin/godkjenninger/page.tsx` | `PlanAction` PENDING (`:70-77`) | Kort per forslag, zod-validert suggestion (`:44-51,80`), Godkjenn/Avvis (`ApprovalActions`) |
| Godkjenning-detalj | `admin/godkjenninger/[id]/page.tsx` | `PlanAction` | Detalj + coach-note-flyt (`approvals/actions.ts`) |
| Daglig brief | `admin/brief/page.tsx` | `PlanAction` PENDING siste (`:69-74`) + egen AI-brief | Seksjon 03 «Agentenes anbefalinger» fra ekte PlanAction (`:339-396`) |
| Spiller-Workbench (coach) | `admin/plans/[planId]/plan-actions.tsx`, `admin/spillere/[id]/page.tsx`, `admin/workspace/tildelt-meg/page.tsx` | `PlanAction` | Forslag i plan-/spiller-kontekst |
| PlayerHQ pipeline | `portal/agent-pipeline/page.tsx:11-17` | `Signal` + `PlanAction` + `AgentRun` (`runs`) for spilleren | Spillerens eget innsyn i signaler/forslag/kjøringer |

**Godkjenn/avvis-flyt (coach-innboks):**
- Enkel: `acceptPlanAction`/`rejectPlanAction` i `src/lib/agents/actions.ts:7-49` → setter status ACCEPTED/REJECTED, revalidate `/portal` + `/portal/agent-pipeline`. **Merk (`actions.ts:19-21`):** PYRAMID_ADJUST-aksept gjør INGEN faktisk plan-endring — bare markerer ACCEPTED. Kommentaren sier periodiseringsagenten «kan» hente accepted actions og lage sesjoner, men **den koden finnes ikke** (periodiserings-agenten leser bare planId, ikke accepted actions). → **Aksept er i praksis en no-op utover statusbytte.**
- Detaljert: `admin/approvals/actions.ts` — `approveRequestDetailed`/`declineRequestDetailed`/`requestMoreInfo` skriver `suggestion.coachLog[]` revisjonsspor (`:24-41`) og (ved info-request) lager `Notification` til spilleren (`:138-146`). Heller ingen plan-mutasjon ved aksept.

---

## 7. Åpne spørsmål / risiko til Anders

1. **`training-gap` er død i prod.** Den ENESTE produsenten av `TRAINING_GAP`-forslag har ingen cron i `vercel.json`. Skal den ha en cron-entry (f.eks. man 06:30 etter plan-watcher)?
2. **Aksept gjør ingenting.** Når coach godkjenner et PYRAMID_ADJUST/TRAINING_GAP-forslag, endres bare status — ingen økter legges til, ingen plan justeres (`agents/actions.ts:19-25`). Er det meningen at godkjenning skal materialisere endringen, eller er innboksen kun «les og kvitter»?
3. **Agent-detalj-siden er ødelagt (404 + feil datakilde).** Slug-mismatch (`[agentId]/page.tsx:24` vs `page.tsx:9-40`) + leser AuditLog i stedet for AgentRun. Skal detalj-siden kobles til de ekte agentene?
4. **LLM-agentene (`src/lib/ai/agents/*`) er en parallell, ubrukt verden.** daily-brief, vinn-tilbake, sg-interpretation, plan-revision, performance-peaking er bygd og demo-fallback-klare, men ingen UI/cron kaller dem (kun tester). `/admin/brief` har en egen brief-generator. Skal disse wires inn, eller er de eksperiment som bør arkiveres? (Risiko: token-/vedlikeholds-kost på død kode.)
5. **«junior-guard» finnes ikke.** Hvis det skal være en sikkerhets-/alders-regel i pipelinen, må den bygges. I dag er det ingen agent/skill som heter det.
6. **Ingen prioritet på PlanAction.** Innboksen sorterer på tid og fabrikkerer «Haster» fra actionType — men de actionType-ene som trigger «Haster» genereres aldri. Trenger pipelinen en ekte severity/prioritet?
7. **Ingen dedup på plan-watcher/periodiserings-agent.** Gjentatte kjøringer kan lage duplikate PENDING PYRAMID_ADJUST. Bør de få samme PENDING-sjekk som training-gap har?
8. **Skill-mapping:** bekreft at Anders' begreper (weakness/progression/drill-selection) skal realiseres som ekte moduler, eller om de dekkes «godt nok» av training-gap + sg-interpretation + effectiveness.

---

<a id="del-4"></a>

# Seksjon 5 — Coach-handlinger og beslutning i AgencyOS (agent-innboks / godkjenninger)

READ-ONLY audit. Hver påstand har fil:linje. Verifisert mot kode 2026-06-22. Ingen endringer gjort.

---

## 0. Rute-kart: hva er ekte vs. alias/redirect/annet

| Rute | Status | Hva den faktisk er | Bevis |
|---|---|---|---|
| `/admin/godkjenninger` | **EKTE — hovedflaten** | Agent-innboksen. Lister PENDING `PlanAction`. | `src/app/admin/godkjenninger/page.tsx:67-136` |
| `/admin/godkjenninger/[id]` | **EKTE — detaljvisning** | Én PlanAction med utvidede handlinger. | `src/app/admin/godkjenninger/[id]/page.tsx:59-105` |
| `/admin/approvals` | **REDIRECT** | `permanentRedirect("/admin/godkjenninger")`. | `src/app/admin/approvals/page.tsx:1-5` |
| `/admin/approvals/[id]` | **EKTE (datakilde)** | Re-eksporteres ikke, men detalj-siden over importerer client + actions herfra. URL-en redirectes ikke (kun rot-`/approvals`). | `src/app/admin/approvals/[id]/page.tsx:245`, `approval-detail-client.tsx` |
| `/admin/queue` | **EKTE — annen flate** | «Oppfølgingskø»: klassifiserer SPILLERE (risk/watch/check) fra `User`+`Signal`. **Ingen PlanAction.** | `src/app/admin/queue/page.tsx:60-138` |
| `/admin/oppfolging` | **ALIAS** | Re-eksporterer `queue/page.tsx`. | `src/app/admin/oppfolging/page.tsx:9-13` |
| `/admin/handlingssenter` | **EKTE — annen flate** | Notion-oppgave-kanban fra `OppgaveCache`. **Ikke PlanAction.** | `src/app/admin/handlingssenter/page.tsx:78-139` |
| `/admin/innboks` | **EKTE — annen flate** | Meldinger (chat), ikke agent-godkjenninger. | `src/app/admin/innboks/page.tsx` |
| `/admin/godkjenn-portal` | **EKTE — DEV/design-QA** | Godkjenning av PlayerHQ-SIDER mot design-handoff (`PageApproval`, 142 ruter). **Helt urelatert til PlanAction.** | `src/app/admin/godkjenn-portal/page.tsx:1-50`, `actions.ts:23` |
| `/admin/agents` + `/admin/agents/[agentId]` | **EKTE — agent-konfig/logg** | Agent-oversikt + detalj. Se seksjon 5. | `src/app/admin/agents/page.tsx`, `[agentId]/page.tsx` |

**Nav-plassering:** «Følg opp» finnes ikke som gruppe-label; godkjenninger ligger i nav-gruppen **«Innboks»** → item «Godkjenninger» → `/admin/godkjenninger`, med lime badge fra tellingen `prisma.planAction.count({ where: { status: "PENDING" } })`.
Bevis: `src/lib/admin-nav.ts:225-233` (item), `src/components/admin/admin-shell.tsx:57` (`planAction.count` PENDING) → `admin-shell.tsx:97` (`approvals: approvalCount`).

---

## 1. Agent-innboks / godkjenninger — layout & datahenting

**Datakilde** (`godkjenninger/page.tsx:70-77`):
```
prisma.planAction.findMany({
  where: { status: "PENDING" },
  include: { user: {id,name}, plan: {id,name} },
  orderBy: { createdAt: "desc" },
})
```
- **Sortering:** nyeste først (`createdAt desc`). Linje 76.
- **Gruppering:** INGEN gruppering per spiller — flat liste, én kort-rad per PlanAction. Linje 101-132.
- **Filtrering:** kun `status PENDING`. ACCEPTED/REJECTED vises ikke her (de finnes i agent-detalj og PlayerHQ-pipeline).

**Kort-rendering** (`page.tsx:107-132`):
- Avatar med initialer avledet fra `user.name` (`initials()`, linje 53-57).
- Tittel: `suggestion.title ?? suggestion.tittel ?? ACTION_LABEL[actionType] ?? actionType` (linje 86). `suggestion`-JSON valideres med **zod** `safeParse` (linje 44-51, 80) — følger CLAUDE.md-regelen.
- Detalj: `suggestion.forklaring ?? suggestion.detail ?? «Gjelder planen …»` (linje 87).
- «Haster»-chip + venstre lime-kant for `WITHDRAW | *ESCALATION* | TAPER_ENGAGE | SESSION_SWAP` (`erHaster()`, linje 35-42).
- **Payload-rendering per actionType:** det finnes en `ACTION_LABEL`-oppslagstabell (linje 16-32) som oversetter `actionType` → norsk etikett, men **ingen type-spesifikk payload-visning** (alle typer rendres med samme tittel/forklaring-mal). Diff-tabeller, før/etter-verdier, fordeling osv. fra `suggestion` vises IKKE på listenivå.
- Tom tilstand: «Ingenting venter på deg» (linje 102-106).

**Handlinger på listenivå:** `<ApprovalActions actionId playerId />` (linje 128) → Godkjenn / Avvis / Se profil.

---

## 2. Handlinger — ekte server-actions, data-effekt, spiller-synlig effekt

Det finnes **TO sett** av actions, brukt av hhv. listen og detaljsiden:

### A) Listenivå (`/admin/godkjenninger` + agent-detalj + queue-kort)
Komponent: `src/app/admin/approvals/approval-actions.tsx` (Godkjenn / Avvis / Se profil).
Kaller: `acceptPlanAction` / `rejectPlanAction` fra `src/lib/agents/actions.ts`.

### B) Detaljnivå (`/admin/godkjenninger/[id]`)
Komponent: `src/app/admin/approvals/[id]/approval-detail-client.tsx` (Godkjenn / Avslå med begrunnelse / Be om mer info / Send melding).
Kaller: `approveRequestDetailed` / `declineRequestDetailed` / `requestMoreInfo` fra `src/app/admin/approvals/actions.ts`.

### Handlingstabell

| Handling | Hvor (UI) | Server-action (fil:linje) | Data-effekt | Spiller-synlig effekt |
|---|---|---|---|---|
| **Godkjenn** (enkel) | Liste-kort, agent-detalj, queue | `acceptPlanAction` — `src/lib/agents/actions.ts:7-29` | `status → ACCEPTED`. **Forslaget anvendes IKKE på TrainingPlan** (kun statusbytte). `revalidatePath("/portal", "/portal/agent-pipeline")`. | Ser `ACCEPTED`-pill på `/portal/agent-pipeline` (page.tsx:152-162). **INGEN notifikasjon sendes.** Ingen faktisk planendring skjer i datamodellen. |
| **Godkjenn** (detalj, m/valgfri kommentar) | Detaljside | `approveRequestDetailed` — `src/app/admin/approvals/actions.ts:43-78` | `status → ACCEPTED`. Hvis kommentar: legges i `suggestion.coachLog[]` (linje 58-66, `attachCoachNote` 24-41). Idempotent: returnerer hvis ikke PENDING (53-56). `redirect("/admin/godkjenninger")`. | Samme som over: ACCEPTED-pill i pipeline. **INGEN notifikasjon.** coachLog vises ikke i PlayerHQ. |
| **Avvis** (enkel) | Liste-kort, agent-detalj | `rejectPlanAction` — `src/lib/agents/actions.ts:31-49` | `status → REJECTED`. Ingen begrunnelse lagres. | `REJECTED`-pill i pipeline. **INGEN notifikasjon.** |
| **Avslå med begrunnelse** | Detaljside (modal, min. 3 tegn) | `declineRequestDetailed` — `src/app/admin/approvals/actions.ts:80-109` | `status → REJECTED` + begrunnelse i `suggestion.coachLog[]` (kind:"decline"). `redirect`. | REJECTED-pill i pipeline. Begrunnelsen lagres på saken men **vises ikke til spiller** og **ingen notifikasjon** sendes (kommentaren i koden sier «deles med spilleren», men det er IKKE implementert — ingen Notification opprettes her). |
| **Be om mer info** | Detaljside (modal) | `requestMoreInfo` — `src/app/admin/approvals/actions.ts:111-150` | **Beholder PENDING** (linje 129). Legger spørsmål i `suggestion.coachLog[]` (kind:"info_request"). **Oppretter `Notification`** til spilleren (type `approval_question`, link `/portal/agent-pipeline`). Linje 138-146. | Spilleren FÅR in-app-varsel «Coach trenger mer info». Saken forblir ventende. |
| **Send melding** | Detaljside / queue-kort | Ingen action — `<Link>` til `/admin/spillere/{id}?compose=1` | Ingen direkte data-effekt. | — |
| **Se profil** | Liste-kort | Ingen action — `<Link>` til `/admin/spillere/{id}` | — | — |

### Verifisering mot prompt-antakelsene (ærlighet om gap)

- **«Endre og godkjenn» finnes IKKE.** Detaljsidens `Edit3`-ikon er merket **«Be om mer info»** (`approval-detail-client.tsx:183-195`), ikke en redigér-og-anvend-flyt. Det finnes ingen action som muterer `suggestion`-innholdet før godkjenning og anvender det. Bekreftet konsistent med 3-status-modellen.
- **«Utsett / Defer» finnes IKKE** som egen status/handling. Det nærmeste er «Be om mer info», som lar saken bli stående PENDING — men det er en avklarings-loop, ikke en utsettelse. Datamodellen har kun PENDING/ACCEPTED/REJECTED (`prisma/schema.prisma:1397` kommentar + `status @default("PENDING")`).
- **KRITISK GAP — godkjenning anvender ingenting.** `acceptPlanAction` flipper bare status (`actions.ts:22-25`). Kommentaren i koden innrømmer det: «forenklet — bare marker som godkjent. Faktisk planjustering kan kjøres av periodiseringsagenten som henter accepted actions …» (linje 19-21). **Den agenten finnes ikke:** ingen agent leser ACCEPTED PlanActions. `periodiserings-agent.ts` og `plan-watcher.ts` kun OPPRETTER PENDING actions; ingen `where status ACCEPTED` finnes noe sted i `src/lib/agents/`. En godkjent plan-endring blir altså aldri faktisk skrevet inn i `TrainingPlan`/sesjoner. Bekreftet med `rg "ACCEPTED" src/lib/agents/` → kun statusbytte i actions.ts.

---

## 3. Batch-godkjenning — FINNES IKKE

`rg -i "batch|godkjenn alle|approveAll|approve-all|bulk|godkjenn-alle"` over `src/` gir ingen treff knyttet til PlanAction-godkjenning. Treffene som finnes (`bulk-kobl-button`, `inbox-kit`, `tournament-enroll`, `del-runde-modal` osv.) er urelaterte (årsplan-kobling, runde-deling, turneringspåmelding).
- Ingen «godkjenn alle», ingen «godkjenn alle lav-risiko», ingen mandag-morgen-massegodkjenning.
- Hver PlanAction behandles individuelt via `acceptPlanAction`/`rejectPlanAction`.
- **Konklusjon: åpen idé, ikke implementert.** (Mandag-cron `plan-watcher` GENERERER forslag mandag 06:00, men coach må godkjenne dem én og én.)

---

## 4. Auto-apply-regler — FINNES IKKE (for PlanAction)

`rg -i "auto.?apply|autoApply|auto-godkjenn|autogod"` over `src/` gir ingen treff for PlanAction.
- Ingen PlanAction anvendes uten coach-godkjenning. Alle agent-genererte actions opprettes som `PENDING` (default i schema, og eksplisitt i `periodiserings-agent.ts:32-44`, `plan-watcher.ts:51`, `training-gap.ts:121`).
- **Merk avgrensning:** Det FINNES en separat auto-apply-mekanisme i Caddie-AI-assistenten (`src/lib/caddie/approval-executor.ts`) — men det er et annet system (verktøy-kall fra chat-assistent, egen `ToolApprovalState`), ikke PlanAction-godkjenning. Utenfor scope for denne flaten, men verdt å notere at ordet «approval» brukes i to ubeslektede systemer.
- **Konklusjon for PlanAction: fraværende.** Ingen betingelser, ingen logging, ingen auto-apply.

---

## 5. Agent-konfigurering (`/admin/agents` + `[agentId]`)

### Oversikt `/admin/agents/page.tsx`
- **Stat-grid:** Aktive agenter, Forslag i dag (`planAction.count` siste døgn), Venter på godkjenning (PENDING-telling, lenker til `/admin/godkjenninger`). Linje 48-92.
- **Agent-tabell:** 6 hardkodede agenter i `AGENT_INFO` (round-agent, test-agent, trackman-agent, plan-watcher, periodiseringsagent, achievement-agent). Status (Aktiv/Feil/Ingen data) avledes fra `AgentRun`-kjøringer, ikke konfigurerbart. Linje 9-40, 113-165.
- **Manuell trigger:** KUN admin. Én knapp som kjører `plan-watcher` umiddelbart (`triggerPlanWatcherManually` → `runPlanWatcher`). Linje 171; `manual-trigger.tsx`; `agents/actions.ts:7-12`. Ingen trigger for de andre 5 agentene.
- **Siste 30 kjøringer:** read-only tabell fra `AgentRun`. Linje 173-229.

### Detalj `/admin/agents/[agentId]/page.tsx`
NB: detalj-siden bruker et HELT ANNET sett agent-slugs (`AGENT_KONFIG`: brief, periodisering, vinn-tilbake, win-back, ai-plan — linje 24-60) enn oversiktstabellens slugs. **Lenkene fra oversikten (`/admin/agents/round-agent` osv., page.tsx:155) treffer ikke `AGENT_KONFIG` → `notFound()`** (linje 93-94). Sannsynlig drift/bug: oversikt og detalj er ikke synket på slug-navn.
- Viser: konfig-tekst (statisk beskrivelse), KPI (status/sist kjørt/antall logg-rader), siste 10 PlanActions fra agenten (m/ inline `ApprovalActions` hvis PENDING — linje 216-220), siste 20 audit-rader med feedback-form.
- **Feedback-form** (`[agentId]/feedback-form.tsx` + `actions.ts`): tommel opp/ned (1/-1) + valgfri kommentar per kjøring → lagres som ny `AuditLog`-rad (`gisFeedback`, action `agent.feedback`). Linje 13-38. Dette er læringssignal-innsamling, ikke styring.

### Hva coachen FAKTISK kan konfigurere vs. visning-only

| Kapabilitet | Status |
|---|---|
| Toggle agent av/på per spiller | **NEI** — finnes ikke |
| Terskler / sensitivitet | **NEI** — alle terskler hardkodet i agent-kode (f.eks. queue: >14d inaktiv, SG < -0.5) |
| Agent-logg-visning | **JA** — `AgentRun` (oversikt) + `AuditLog` (detalj), read-only |
| Signal-dashboard | **DELVIS** — stat-grid + signal-telling, read-only; spiller ser egne signaler i `/portal/agent-pipeline` |
| Feedback-form | **JA** — tommel + kommentar, men kun innsamling (ingen tilbakekobling til agent-adferd) |
| Manuell trigger | **JA, men kun plan-watcher, kun admin** |

**Konklusjon:** Agent-flatene er nesten utelukkende **visning + feedback-innsamling**. Eneste konfigurerbare handling er admin-manuell-kjøring av plan-watcher. Ingen per-spiller-toggle, ingen terskeljustering. «Justere regler»-knappen i queue lenker til `/admin/settings` og «Generer AI-aksjoner» er `disabled` med tittel «kommer i v2» (`queue/page.tsx:195-209`).

---

## 6. Notifikasjoner — varsles spilleren ved godkjenning?

**Notification-modell:** `prisma/schema.prisma:1777`. Felter brukt: `userId, type, title, body, link, readAt`.
Sentral lib: `src/lib/notifications.ts` (`prisma.notification.create`/`createMany`) + `src/lib/notifications/index.ts`.

**Ved PlanAction-godkjenning:**

| Handling | Sender notifikasjon? | Bevis |
|---|---|---|
| Godkjenn (`acceptPlanAction`) | **NEI** | `src/lib/agents/actions.ts` — ingen `notification.create`. Bekreftet `rg notification` → 0 treff. |
| Godkjenn detalj (`approveRequestDetailed`) | **NEI** | `approvals/actions.ts:43-78` — ingen Notification. |
| Avvis (`rejectPlanAction`) | **NEI** | `actions.ts:31-49`. |
| Avslå m/begrunnelse (`declineRequestDetailed`) | **NEI** | `approvals/actions.ts:80-109` — coachLog lagres, men ingen Notification (til tross for koment «deles med spilleren»). |
| **Be om mer info (`requestMoreInfo`)** | **JA** | `approvals/actions.ts:138-146` — eneste action som oppretter `Notification` (type `approval_question`). |

**Hvordan spilleren ser den godkjente endringen i PlayerHQ:**
- Via `/portal/agent-pipeline` (`src/app/portal/agent-pipeline/page.tsx:140-174`): lister spillerens egne PlanActions med status-pill (PENDING/ACCEPTED/REJECTED) + `suggestion.forklaring`. Spilleren må selv åpne siden — det skjer **ingen push/varsel** ved godkjenning eller avvisning.
- Den godkjente endringen vises **kun som en ACCEPTED-pill** — ikke som en faktisk plan-/sesjon-endring i `/portal/tren`, fordi forslaget aldri anvendes på TrainingPlan (jf. seksjon 2 gap).

---

## Oppsummering av gap (ærlig)

1. **«Endre og godkjenn» — finnes ikke.** Edit-ikonet er «Be om mer info».
2. **«Utsett/Defer» — finnes ikke.** 3-status-modell. Nærmeste er «Be om mer info» (beholder PENDING).
3. **Batch-godkjenning — finnes ikke.** Individuell behandling, åpen idé.
4. **Auto-apply (PlanAction) — finnes ikke.** Alle forslag krever manuell coach-godkjenning. (Caddie-AI har egen, ubeslektet auto-execute.)
5. **STØRSTE GAP: godkjenning anvender ingenting.** `acceptPlanAction` flipper bare status; ingen agent leser ACCEPTED-actions for å skrive endringen inn i TrainingPlan. Koden forventer en «periodiseringsagent» som henter accepted — den finnes ikke.
6. **Notifikasjoner: kun «Be om mer info» varsler spilleren.** Godkjenn/Avvis er stille — spilleren ser kun status-pill i agent-pipeline hvis hen selv besøker siden.
7. **Slug-drift agenter:** oversiktstabellens lenker (`round-agent` osv.) treffer ikke detalj-sidens `AGENT_KONFIG` (`brief`/`periodisering`/...) → `notFound()`. Sannsynlig bug.
8. **Konfigurering: nesten alt er visning-only.** Eneste handling: admin manuell-trigger av plan-watcher. Ingen per-spiller-toggle eller terskeljustering.

## Åpne spørsmål til Anders / videre verifisering
- Skal godkjenning faktisk MUTERE treningsplanen (bygge sesjoner fra `suggestion`), eller er status-flagget bevisst nok i v1?
- Skal Godkjenn/Avvis varsle spilleren (i dag stille)? Avslags-begrunnelsen lagres men deles ikke — bug eller bevisst?
- Er slug-mismatchen mellom `/admin/agents` (page.tsx `AGENT_INFO`) og `[agentId]` (`AGENT_KONFIG`) en kjent dødlenke?
- Er `/admin/godkjenn-portal` (design-QA, 142 PlayerHQ-ruter) ment å leve videre i prod, eller er det et dev-verktøy som bør skjules?

---

<a id="del-5"></a>

# AgencyOS-audit — Steg 6 & 7: Kobling til plattformen + tilstand og hull

READ-ONLY kartlegging. Alle påstander har fil:linje. Stier er relative til repo-rot
`/Users/anderskristiansen/Developer/akgolf-hq/`. Skrevet 2026-06-22.

**Hovedkonklusjon i én setning:** AgencyOS er nesten utelukkende en *lese-flate* over en delt
Prisma-DB. De fleste skriver skjer i PlayerHQ eller via cron; den ekte coach→spiller-planflyten
(TrainingPlan-status) virker, men den *agent-baserte* forslagsflyten (PlanAction / `acceptPlanAction`)
er en blindvei som ingen konsumerer.

---

## STEG 6.1 — Coach ↔ spiller-flyt

Det finnes **TO uavhengige planflyter** som lett forveksles. Den ene virker, den andre er en stub.

### Flyt A (EKTE, virker) — TrainingPlan status-maskin

Coachen bygger/sender plan i AgencyOS; spilleren ser den i PlayerHQ via delt DB.

| Dataobjekt | Skrevet av (fil:linje) | Lest av (fil:linje) | Retning |
|---|---|---|---|
| `TrainingPlan` (opprett) | Coach: `src/app/admin/plans/actions.ts:91` (`createPlan`, setter `createdById`) | Spiller: `src/app/portal/page-actions.ts:52` (`findFirst {userId, isActive:true}`) | Coach → Spiller |
| `TrainingPlan.status` = `PENDING_PLAYER` | Coach: `src/app/admin/plans/[planId]/actions.ts:118` (`sendTilSpiller`) | Spiller-flate `/portal/spiller/plans/[planId]` (revalidert `:134`) | Coach → Spiller |
| `TrainingPlan.isActive` = true | Coach: `src/app/admin/plans/[planId]/actions.ts:145` (`godkjennPlan`) | Spiller leser aktiv plan `page-actions.ts:53` | Coach → Spiller |
| `TrainingPlan.status` = `REJECTED` + `playerComment` | Spiller (ber om endring) → coach rydder via `markerSomNyttUtkast` `:168` | Coach: synlig i `/admin/plans` | Spiller → Coach |
| `TrainingPlanSession` (økter) | Coach: `leggTilOkt` `:750`/`:763`, `oppdaterOkt` `:507`/`:526`, `flyttOkt` `:68`/`:79`, `slettOkt` `:635`/`:653`, `cancelSession` `:410`/`:422` | Spiller: `src/lib/portal/training/session-generator.ts`, `src/app/portal/planlegge/*` | Coach → Spiller |
| `assignPlanToPlayers` (mal → flere spillere) | Coach: `src/app/admin/plans/[planId]/actions.ts:970` | Spiller leser tildelt plan | Coach → Spiller |

Denne flyten er **produksjonsklar**: ekte status-overganger (DRAFT → PENDING_PLAYER →
REJECTED/aktiv), audit-logg på hvert steg (`auditLog.create` `:123`, `:150`, `:181`), og
spilleren leser samme rader via delt DB. Workbench (`src/components/coachhq/workbench/actions.ts`)
opererer på de samme `TrainingPlanSession`-radene.

### Flyt B (STUB, virker IKKE) — PlanAction / agent-forslag

Dette er den «AI-agent godkjenner»-flyten. Den er kosmetisk: status flippes, men **ingenting
anvender forslaget på planen**.

| Dataobjekt | Skrevet av (fil:linje) | Lest av (fil:linje) | Retning |
|---|---|---|---|
| `PlanAction` (forslag, status `PENDING`) | Agent `plan-watcher` `src/lib/agents/plan-watcher.ts:57`; `training-gap` `src/lib/agents/training-gap.ts:121`; `periodiserings-agent` `src/lib/agents/periodiserings-agent.ts:32` | Coach: `src/app/admin/godkjenninger/page.tsx` (filtrerer `status: "PENDING"`); Spiller: `src/app/portal/agent-pipeline/page.tsx:17` | Agent → Coach + Spiller |
| `PlanAction.status` = `ACCEPTED`/`REJECTED` | Coach-knapp: `src/app/admin/approvals/approval-actions.tsx:16` → `acceptPlanAction` (`src/lib/agents/actions.ts:7`); Spiller kan også (allow `["PLAYER","COACH","ADMIN"]`, `actions.ts:8`) | **INGEN konsumerer ACCEPTED** (se under) | Coach/Spiller → DB (blindvei) |
| `Signal` (aggregater: SG, klubbsnitt, test-trend) | Agenter (round/test/trackman/sg-insights) | Spiller: `agent-pipeline/page.tsx:12`; coach: `/admin/brief`, `/admin/agents` | Agent → begge |

**`acceptPlanAction` er en no-op** (`src/lib/agents/actions.ts:22-25`): den setter kun
`status: "ACCEPTED"`. Kommentaren (`actions.ts:19-21`) påstår at «periodiseringsagenten henter
accepted actions og oppretter sesjoner» — **dette er feil**. `periodiserings-agent.ts` leser
*aldri* ACCEPTED PlanActions; den bare *oppretter* en ny PlanAction selv (`:32`). Søk på
`status === "ACCEPTED"` for PlanAction gir kun ett treff — en visningslabel i
`src/lib/admin-caddie/co-agent-data.tsx:475-476` («GODKJENT»). Ingen kode oversetter et godkjent
forslag til en faktisk `TrainingPlanSession`- eller `TrainingPlan`-endring. **Loopen er
dødende.** (Bekrefter funn (b) fra de andre seksjonene.)

### Spillerens innsyn i agent-forslag — `src/app/portal/agent-pipeline/page.tsx`

Eksisterer og er ekte koblet: viser spillerens egne `Signal` (siste 30), `PlanAction` med
status-chip og forklaring, og — kun for ADMIN — siste `AgentRun`-kjøringer (`:22-28`). Spilleren
kan i prinsippet godkjenne sine egne forslag (samme no-op). Tom-tilstand sier eksplisitt «Kommer
typisk etter mandag-cron» (`:137`) — men siden `plan-watcher` kun fyrer mandag og `training-gap`
**aldri** fyrer (mangler cron, se Steg 6.2), vil flaten ofte stå tom i prod.

---

## STEG 6.2 — Kilder som mater AgencyOS

| Kilde | Modell | Skrives av (fil:linje) | Lest av AgencyOS (fil:linje) | Agent trigget? (fil:linje) | Ekte vs stub |
|---|---|---|---|---|---|
| **Tester** | `TestResult` (+ `TestAssignment`) | Spiller: `src/app/portal/(fullscreen-test)/tren/tester/[testId]/gjennomfor/actions.ts:88`, `…/tren/tester/ny/actions.ts:71`, `…/tren/tester/actions.ts:38`. Coach skriver KUN notat: `src/app/admin/tester/[id]/actions.ts:27` | `src/app/admin/tester/page.tsx`, `…/tester/[id]/` | JA — `triggerTestAgent` på alle 3 spiller-create (`gjennomfor:119`, `ny:86`, `actions:51`). Agent `src/lib/agents/test-agent.ts:9` → `Signal` `TEST_TREND` (`:42`). Coach-notat trigger ingen agent | **Ekte.** Score regnes server-side fra protokoll; lukker `TestAssignment` + varsler coach |
| **TrackMan** | `TrackManSession` | Spiller: `src/app/portal/mal/trackman/actions.ts:52` (CSV) / `:89` (HTML). Coach på vegne av spiller via `onBehalfOfUserId` | `src/app/admin/trackman/page.tsx:54`, `src/lib/dashboard-data.ts`, `…/spillere/[id]/` | JA — `triggerTrackManAgent` (`:63`, `:100`). Agent `src/lib/agents/trackman-agent.ts:11` → `Signal` `CLUB_AVG` (`:54`) | **Ekte import** (`parse-csv.ts:138` Papa.parse; `parse-html-report.ts:66`). MEN AgencyOS-filterchipene er stub (`trackman-actions.tsx:6` toast «kommer snart»). `TrackManShot`-tabellen skrives aldri |
| **Runder** | `Round` (+ `HoleScore`, `RoundShot`) | KUN PlayerHQ: `src/app/portal/mal/runder/ny/actions.ts:44`, `…/runder/actions.ts:44`, `…/analysere/actions.ts:597`, GolfBox-import `…/runder/actions.ts:329`. INGEN `round.create` i `src/app/admin/` | `src/app/admin/runder/page.tsx:52` (les-only) | DELVIS — `triggerRoundAgent` i `…/runder/actions.ts:75` og `:341`, MEN analyse-runden (`analysere/actions.ts:597`) trigger ingen agent. Agent `src/lib/agents/round-agent.ts:10` → `Signal` SG_* (`:34`) | **GolfBox-rundeimport = STUB** (`previewGolfBoxRounds` `runder/actions.ts:228` returnerer hardkodet liste; `:329` skriver ekte rader fra stub). Manuell logging ekte |
| **Booking** | `Booking` + `SessionRequest` | `SessionRequest`: spiller `src/app/portal/onskeligokt/actions.ts:27`, drill `…/drills/actions.ts:53`. `Booking`: marketing `…/booking/[slug]/bekreft/actions.ts:112`, credit `src/lib/booking/credit-booking.ts:109`, caddie `src/lib/caddie/approval-executor.ts:119`, **AgencyOS** `src/app/admin/calendar/actions.ts:85` + `…/anlegg/[id]/actions.ts:83` | `SessionRequest`: `src/app/admin/foresporsler/page.tsx:39`. `Booking`: `src/app/admin/bookinger/page.tsx:78`. AgencyOS skriver status `…/foresporsler/actions.ts:17` (DECLINED)/`:33` (APPROVED) | Create trigger ingen agent. `booking-reminders` er cron (`src/lib/agents/booking-reminders.ts:15`), ikke create-trigget | **Ekte.** `/admin/foresporsler` viser kun `SessionRequest` (jf. design-porting-gate-unntak) |
| **Kalender** | `GoogleCalendarSubscription` (`prisma/schema.prisma:1799`) + `GoogleCalendarConnection` (`:1833`) | Webhook Google→oss: `src/app/api/google-calendar/webhook/route.ts:103` (kansellering), `:129` (flytting) skriver `Booking.update`. Watch-oppsett `src/lib/google-calendar.ts` | `src/app/admin/kalender/page.tsx`, `…/calendar/` | JA — cron `refresh-calendar-watches` (`src/lib/agents/refresh-calendar-watches.ts:18`) fornyer watches <24t (`:23`) | **Ekte to-veis sync.** HMAC-verifisert token, ekte incremental `events.list` |

### Cron-inventar (vercel.json) og foreldreløse agenter

22 cron-entries treffer i hovedsak én dynamisk handler `src/app/api/cron/[agent]/route.ts`
(navn→funksjon i `AGENTS`-objektet, `:31-56`, CRON_SECRET-beskyttet). Relevante for AgencyOS-laget:
`plan-watcher` (man 06:00), `booking-reminders` (hver time), `refresh-calendar-watches` (02:00),
`sg-insights` (04:00), `cleanup-recordings` (03:00), `benchmark-sync`/`datagolf-sync`/`club-trends`
(man), `check-stuck-bookings` (hvert 15. min).

**FORELDRELØS AGENT — bekreftet funn (c):** `training-gap` er registrert i
`src/app/api/cron/[agent]/route.ts:36` (`runTrainingGap`) men har **ingen** `/api/cron/training-gap`
i `vercel.json`. Den er den *eneste* agenten som lager handlingsforslag til coach
(`PlanAction` kind `TRAINING_GAP`, `training-gap.ts:121`), men fyrer aldri automatisk i prod — kan
kun trigges manuelt med CRON_SECRET-header. Implementasjonen er ferdig; kun cron-wiringen mangler.

Create-triggede agenter (`round`, `test`, `trackman`, `periodiserings`, `achievement` via
`src/lib/agents/triggers.ts`) skal **ikke** ha cron og er ikke foreldreløse.

---

## STEG 6.3 — Stub/mock vs produksjonsklart

### SG-tallene — den viktigste «ser ekte ut, er det ikke»

**`Round.sgTotal` / `sgBreakdown` er IKKE beregnet av SG-motoren.** Den kalibrerte motoren
`beregnSg` (`src/lib/domain/sg.ts:210`) er ekte (Team Norway IUP- + Broadie-benchmarks, kalibrert
2026-06-10), men kalles **kun fra tester** (`src/lib/__tests__/domain/sg.test.ts`) — aldri fra noen
rundeskriving. Konkret:

- **Manuell runde:** `logRoundManual` (`src/app/portal/mal/runder/ny/actions.ts:38-56`) tar
  `sgOtt/App/Arg/Putt` som *brukerinntastede tall* og setter `sgTotal` = ren sum av dem
  (`:39-41`). Ingen shot-data → ingen `beregnSg`.
- **Detaljert shot-logger:** `saveRoundStats` (`src/app/portal/analysere/actions.ts:582`) lagrer
  `Shot`-rader (`:622`) men beregner **aldri** SG fra dem — `sgTotal` settes ikke her.
- **Seed/demo:** `src/app/portal/…`-uavhengig genereres SG tilfeldig:
  `sgTotal = -1.5 + trend*3 + rand(-1,1)` (`scripts/seed-akgolf-demo.ts:103`,
  `scripts/seed-screentest.ts:102`). Score avledes baklengs av SG (`:110`).

AgencyOS-flatene (`/admin/runder`, stall-SG-KPI, `multi-compare`, `agent-pipeline`) leser disse
verdiene i god tro. **Konklusjon: SG i AgencyOS er enten brukertastet eller tilfeldig seedet — ikke
motorberegnet.** SG-*motoren* er produksjonsklar, men *frakoblet* skrivebanen.

### Andre stub-flater i AgencyOS

| Flate/felt | Ekte vs stub | Fil:linje |
|---|---|---|
| Mission Control `/admin/agencyos/live` | **STUB** — statisk seed (e-post/meldinger/kalender/Notion), ingen integrasjon | `src/app/admin/agencyos/live/page.tsx:1-21`, `…/live/data.ts:2,97,202` |
| Tilstander `/admin/tilstander` | **STUB** — design-system-showcase, fiktive spillere hardkodet | `src/app/admin/tilstander/page.tsx` |
| Analytics-eksport (PDF/CSV/XLSX) | **STUB** — fabrikkert `downloadUrl`; `/api/exports/` finnes ikke → 404 | `src/app/admin/analytics/actions.ts` (`return`) |
| Turneringer-eksport | **STUB** — samme, fabrikkert URL | `src/app/admin/tournaments/actions.ts:438` |
| Cockpit SG-ticker-stripe | **MANGLER** — fasit har lime SG-ticker; appen har fane-rad | `arkiv/BYGGELOGG-FLAGG.md` A-3 |
| TrackMan-filtre (Miljø/Kilde) | **STUB** — toast «kommer snart» | `src/app/admin/trackman/trackman-actions.tsx:12-13` |
| Tester-detalj: Del + PDF | **STUB** — «kommer snart» | `src/app/admin/tester/[id]/tester-detail-actions.tsx:16,25` |
| Grupper-handlinger (5×) | **STUB** — «kommer snart» | `…/grupper/[id]/gruppe-actions.tsx:23,35,47,59`, `…/grupper/grupper-actions.tsx:10` |
| Workspace/Runder/Oppgaver-filtre | **STUB** — «kommer snart» | `workspace/workspace-actions.tsx:14`, `runder/runder-actions.tsx:10`, `workspace/oppgaver/oppgaver-actions.tsx:68` |
| Meldinger: Ring/Mer/Vedlegg/Bilde | **STUB** — ikke-funksjonelle | `…/messages/_components/conversation.tsx:191-201,314-332` |
| Plan-bygger: gruppe-tildeling | **STUB** — «kommer snart · lagret som utkast» | `…/plans/new/plan-builder-client.tsx:653` |
| Coach-workbench: Tester overdue | **STUB** — `testerOverdue = 0` «skjelett — TODO» | `…/coach-workbench/page.tsx:147` |
| Queue: «Løste saker»-kolonne | **STUB** — `const ok = []` «TODO: hent fra database» (mangler `CoachingTask`) | `…/queue/page.tsx:140-142` |
| Settings/Security: økter + login-historikk | **STUB** — tom «TODO: audit-logg for auth» | `…/settings/security/page.tsx:10,79` |
| Settings/API: integrasjoner + webhooks | **STUB** — «TODO: egen modell» | `…/settings/api/page.tsx:159` |
| Plan-template-rediger: drill-bibliotek | **STUB** — eksplisitt «read-only stub» | `…/plans/templates/[id]/rediger/rediger-client.tsx:468` |
| Talent/Region: Norges-kart | **STUB** — forenklet SVG | `…/talent/region/page.tsx:4,182` |
| AI-minne `memory.ts` | **STUB** — in-memory, resettes ved restart «TODO: Prisma `AiMemory`» | `src/lib/ai/memory.ts:7,20,30` |
| Workbench-innsikter | **DELVIS** — deterministiske regler + hardkodet idealpyramide | `src/lib/ai/get-workbench-insights.ts:7-8,30` |
| Klubb-innstillinger: `dagligLederEmail` | **PLACEHOLDER** — hardkodet `"—"` | `…/klubb/innstillinger/page.tsx:49` |
| Recording: pipeline-steg | **PLACEHOLDER** — statiske idle-steg | `…/recording/page.tsx:135-137` |
| Plans/[planId]: SG-utvikling-KPI | **PLACEHOLDER** — `value="—" sub="Krever round-data"` | `…/plans/[planId]/page.tsx:252,365` |

**Ærlige tom-tilstander (IKKE stub — fabrikkerer ikke data):** moderering (`stats/moderering/page.tsx:25-44`),
queue-risiko, cockpit stall-SG/plan-adherence (LØST 2026-06-22, nå ekte). De fleste `"—"` i admin
er korrekte null-fallbacks (`?? "—"`), ikke placeholdere.

### LLM-agentene i `src/lib/ai/agents/` — bekrefter funn (d)

7 filer. Kun 2 er faktisk koblet; 5 er død kode (definert + testet, aldri kalt fra route/UI):

| Agent | Status | Bruk |
|---|---|---|
| `caddie.ts` | BRUKT | `src/components/coachhq/workbench/actions.ts:13` |
| `caddie-with-spiller.ts` | BRUKT | `src/components/coachhq/workbench/actions.ts:9` |
| `daily-brief.ts` | DØD | kun test + barrel |
| `plan-revision.ts` | DØD | kun test + barrel |
| `sg-interpretation.ts` | DØD | kun test + barrel |
| `vinn-tilbake.ts` | DØD | kun test + barrel |
| `performance-peaking.ts` | DØD | kun test + barrel |

Barrelen `src/lib/ai/agents/index.ts` importeres kun av sin egen test. (NB: de *deterministiske*
agentene i `src/lib/agents/` er en separat, faktisk brukt motor — ikke forveksle.)

---

## STEG 5 — CBAC-mangler (bekrefter + utdyper funn (a))

**`can(role, capability)` håndheves ingensteds som gate.** `Capability`-enumet definerer 10
capabilities (`src/lib/auth/cbac.ts:6-17`) med rolle→capability-mapping (`:21-50`), men `can()`
(`:52`) kalles på **nøyaktig ett sted i hele kodebasen**:
`src/app/admin/settings/tilgang/page.tsx:85` — og der kun for å *vise en matrise* over hvilke
roller som har hvilke capabilities, ikke for å nekte tilgang.

Reell gating skjer via `requirePortalUser({ allow: [...] })` (bruker `hasRole`, `cbac.ts:56`) — ren
rolle-sjekk. Det betyr at den finkornede capability-modellen er **dekorativ**. Konkrete avvik der
rolle-gaten er løsere enn capability-modellen tilsier:

| Capability | Definert for (cbac.ts) | Rute som burde gatet på den | Faktisk gate | Avvik |
|---|---|---|---|---|
| `VIEW_FINANCE` | **kun ADMIN** (`:43`, via `Object.values`) | `/admin/okonomi` (`page.tsx:153`), `/admin/agencyos/okonomi` (`:38`) | `allow: ["COACH","ADMIN"]` | **COACH ser økonomi** selv om VIEW_FINANCE er ADMIN-only |
| `MANAGE_FACILITIES` | kun ADMIN | `/admin/anlegg/*`, fasilitet-handlinger | rolle-gate (COACH+ADMIN typisk) | Capability ignorert |
| `MANAGE_USERS` | kun ADMIN | bruker-/tilgang-admin | rolle-gate | Capability ignorert |
| `EDIT_PLAYER_PLAN` | COACH+ADMIN | plan-redigering | rolle-gate (sammenfaller tilfeldig) | Aldri sjekket via `can()` |
| `VIEW_ALL_PLAYERS` | COACH+ADMIN | `/admin/spillere` | rolle-gate (sammenfaller) | Aldri sjekket via `can()` |

Alle 10 capabilities unntatt ingen håndheves via `can()`. De som *tilfeldigvis* sammenfaller med
rolle-gaten (f.eks. `EDIT_PLAYER_PLAN` = COACH+ADMIN = de fleste `/admin`-allow-lister) gir ikke
sikkerhetshull i dag, men `VIEW_FINANCE` gjør det: capability-intensjonen (kun ADMIN) brytes av at
COACH slipper inn på `/admin/okonomi`. Hvis Anders vil at COACH *ikke* skal se økonomi, er dette en
reell lekkasje. (Verifiser om dette er tilsiktet — kan være bevisst at coach ser egen omsetning.)

Bruken av `hasRole` direkte i live-økt-actions (`src/app/admin/live/[sessionId]/*/actions.ts`)
bekrefter mønsteret: CBAC-modulen brukes for `hasRole`, aldri for `can`.

---

## STEG 7 — Tilstand & hull (AgencyOS-laget)

### FERDIG / i prod
- Coach→spiller TrainingPlan-flyt (DRAFT→PENDING_PLAYER→aktiv/REJECTED) med audit-logg.
- Workbench (delt planleggings-kjerne) skriver ekte `TrainingPlanSession`.
- Tester-, TrackMan-, runde-, booking-, kalender-innlesing til AgencyOS som lese-flater.
- Create-triggede deterministiske agenter (round/test/trackman) skriver ekte `Signal`.
- Google Calendar to-veis sync (webhook + watch-fornyelse).
- SG-*motoren* (`beregnSg`) er kalibrert og test-dekket.
- Caddie (2 LLM-agenter) koblet i Workbench.
- `/admin/godkjenninger` og `/admin/foresporsler` leser/skriver ekte status.

### DELVIS (UI bygget, data mock/frakoblet)
- **SG-tall:** motoren finnes, men `Round.sgTotal` er brukertastet/seedet, ikke beregnet.
- **Agent-forslagsflyt (PlanAction):** forslag opprettes og vises, men `acceptPlanAction` er no-op
  — godkjenning anvendes aldri på planen.
- **Mission Control / Tilstander:** statiske design-skall.
- **Analytics- og turnerings-eksport:** stub-URL-er som 404-er (`/api/exports/` mangler).
- **AI-minne:** in-memory, ikke persistert.
- **Workbench-innsikter:** deterministiske regler + hardkodet idealpyramide.
- **~15 «kommer snart»-knapper:** filtre, del/eksport, gruppe-handlinger, meldings-vedlegg.

### MANGLER
- Cron for `training-gap` (eneste coach-forslagsagent kjører aldri i prod).
- Konsument for ACCEPTED `PlanAction` (loopen ender blindt).
- SG-beregning fra shot-data (`beregnSg` aldri wiret til runde-/shot-skriving).
- `TrackManShot`-tabell skrives aldri; AgencyOS-TrackMan-filtre.
- `CoachingTask`-modell (queue «løste saker» mangler datakilde).
- Auth-audit-logg (settings/security tom).
- Ekte sanntid — AgencyOS «kontrolltårn» er polling, ikke Supabase Realtime (per `DATA-INVENTORY.md` §7).
- Reell CBAC-håndheving (`can()` aldri brukt som gate).

---

## STEG 6.6 — TODO/restanser i docs (AgencyOS-relevant)

- **`docs/AAPNE-SPORSMAAL.md` A3:** `acceptPlanAction` bytter kun status, ingen faktisk planendring;
  ingen coach-godkjenningsinnboks; LLM-agent-dybde uavklart. **B4 (PARKERT):** «Delvis mock-flater i
  AgencyOS (godkjenninger, økonomi, innboks, analytics) — ikke anta tallene er ekte.»
- **`docs/STATUS-NÅ.md`:** «Delvis mock i AgencyOS: godkjenninger, økonomi, innboks/meldinger,
  analytics — UI bygget, ikke full datakobling.» Mobil-nav ikke samlet med desktop.
- **`docs/arkiv/BYGGELOGG-FLAGG.md` A-1/A-3:** stall-SG + plan-adherence LØST; SG-ticker-stripe mangler;
  long-tail-skjermer (`/plan/[planId]`, `/rediger`, `/tildel-test`, `/audit-log`, `/reach`,
  `/compliance`, `/risiko`, `/lag-snitt`, `/team`, `/integrasjoner`, `/email-templates`) ikke verifisert.
- **`docs/DATA-INVENTORY.md`:** «motoren er bygd men frakoblet»; TrackMan-filtre stub; ekte sanntid
  finnes ikke; `analyzeSession`/bag-view uten callere; `TrackManShot` skrives aldri; achievement-katalog
  hardkodet.

---

## Åpne spørsmål (krever Anders / produkt-avklaring)

1. **SG-motoren frakoblet:** Skal `beregnSg` wires til shot-loggeren (`saveRoundStats`) så SG
   faktisk beregnes, eller er brukertastet SG bevisst for beta?
2. **PlanAction-loopen:** Skal `acceptPlanAction` faktisk anvende forslaget (opprette/justere
   `TrainingPlanSession`), eller skal hele PlanAction-flyten erstattes av den ekte
   TrainingPlan-status-flyten? (To parallelle systemer for «coach godkjenner» — én av dem er død.)
3. **`training-gap` cron:** Skal den wires i `vercel.json`, eller er agenten avviklet?
4. **COACH + økonomi:** Er det tilsiktet at COACH ser `/admin/okonomi` (bryter VIEW_FINANCE=ADMIN)?
5. **CBAC:** Skal `can()` faktisk håndheves, eller er capability-modellen aspirasjonell og skal
   fjernes for å unngå falsk trygghet?
6. **5 døde LLM-agenter:** Skal de kobles til UI eller slettes?
---

<a id="aapne-sporsmaal"></a>

# Konsolidert: åpne spørsmål til Anders

Samlet og avduplisert på tvers av alle fem seksjonene. Sortert etter alvorlighet/verdi. Hvert punkt er en produkt-/retningsbeslutning auditen ikke kan ta selv.

## A. Kjernemekanikk (blokkerer at AgencyOS gjør jobben sin)

1. **Skal «Godkjenn» faktisk anvende forslaget?** I dag er `acceptPlanAction` en no-op (kun status-flipp). Enten må den skrive endringen inn i `TrainingPlan`/`TrainingPlanSession`, ELLER så er hele `PlanAction`-systemet dødt til fordel for `TrainingPlan`-status-flyten (send→godkjenn) som faktisk virker. Hvilken vei? *(Seksjon 4 §0, Seksjon 5 §2, Seksjon 5-kobling 6.1)*

2. **Skal `training-gap` få cron?** Den er den ENESTE agenten som lager coach-forslag, men mangler i `vercel.json` → fyrer aldri i prod. Koble inn (man-morgen?) eller avvikle? *(Seksjon 3 §3, Seksjon 4 §1)*

3. **Skal `beregnSg` kobles til rundeskrivingen?** SG-motoren er kalibrert og prod-klar, men `Round.sgTotal` er brukertastet/seedet. Skal shot-loggeren (`saveRoundStats`) beregne ekte SG, eller er brukertastet SG bevisst for beta? *(Seksjon 6-7 §6.3)*

## B. Tilgang og sikkerhet

4. **Skal CBAC håndheves eller fjernes?** Capability-laget gir i dag falsk trygghet (definert, men aldri sjekket). Enten håndhev `can()` på ruter/actions, eller fjern modellen så ingen tror den beskytter noe. *(Seksjon 1 §6, Seksjon 6-7 §5)*

5. **Er COACH-tilgang til `/admin/okonomi` (+ `/team`, `/settings`) tilsiktet?** Rolle-gaten slipper COACH inn der capability-modellen (`VIEW_FINANCE`/`MANAGE_USERS` = ADMIN-only) sier nei. *(Seksjon 1 §6, Seksjon 6-7 §5)*

## C. Coach-arbeidsflyt (funksjoner du beskrev, som ikke finnes ennå)

6. **Mandag-morgen-workflowen:** batch-godkjenning, «godkjenn alle lav-risiko», «Endre og godkjenn», «Utsett/Defer» og auto-apply-regler FINNES IKKE i dag (innboksen behandler én og én, 3-status-modell). Skal disse bygges? *(Seksjon 5 §2–§4)*

7. **Skal Godkjenn/Avvis varsle spilleren?** I dag sender kun «Be om mer info» en `Notification`; godkjenning/avvisning er tause, og spilleren må selv besøke `/portal/agent-pipeline` for å se status. *(Seksjon 5 §6, Seksjon 6-7 §6.1)*

## D. Død kode / opprydding

8. **De 5–6 LLM-agentene i `src/lib/ai/agents/`** (caddie unntatt) er ubrukt — koble inn eller slette? *(Seksjon 4 §0+§4)*

9. **Agent-detalj-siden** (`/admin/agents/[agentId]`) er ødelagt (slug-mismatch → 404, leser `AuditLog` ikke `AgentRun`). Kjent? Fikse? *(Seksjon 4 §6, Seksjon 5 §5)*

10. **Statiske demo-skall** (`agencyos/live` Mission Control, `tilstander`) — bygge ekte eller fjerne? *(Seksjon 3 §4, Seksjon 6-7 §6.3)*

11. **Funksjonelle dubletter** som IKKE bare er redirect: `analyse`/`analysere`/`analytics`, `stall`/`spillere`, `okonomi`/`finance`, `kommunikasjon`/`innboks`, `caddie`/`agencyos-caddie`, `brief`/cockpit. Konsolidere? *(Seksjon 1 §2)*

12. **Terskel-inkonsistens:** «inaktiv» = 5 d (spiller-360/cockpit) vs 14 d (stall/queue); «økter bak» bruker ulik formel på ulike flater. Standardisere i én delt helper? *(Seksjon 3 §2)*

13. **Sannsynlig død kode:** `map-spiller-detalj.ts`, `loadStallen`, og analytics/turnerings-eksport som peker på `/api/exports/*` som ikke finnes (404). Bekrefte + rydde? *(Seksjon 3 §1+§5, Seksjon 6-7 §6.3)*

---

*Audit utført 2026-06-22. Metode: fem parallelle read-only research-agenter (overflate · oppfølging · automatisering · handlinger · kobling/tilstand), hver verifisert mot kildekoden, syntetisert her. Ingen kode endret. For hver påstand: se fil:linje i seksjonene over.*
