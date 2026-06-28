# AK Golf HQ — skjerm- & komponentrevisjon (handover-audit, 2026-06-28)

> Svar på handover `AgencyOS_integrasjon_og_merge`. Kartlegging → fasit → gap-analyse. INGEN kode skrevet.
> Fokus: AgencyOS (/admin) + de 14 tiltenkte flatene + prototype-modulene; oversikt på øvrige flater.
> Metode: 4 parallelle kode-søk + sesjonskontekst. Kilde = faktisk repo (ÉN Next.js-app, ikke monorepo).
> NB: «STUB»-flagging er heuristisk (om page.tsx tydelig henter Prisma) — verifiser hver enkelt før bygging.

## Sammendrag
- **/admin (AgencyOS): 145 skjermer.** ~137 EKTE (Prisma/AI), ~3 delvis, ~4–14 stub-undersider, 3 døde redirects.
- **Alle 5 prototype-moduler FINNES:** Agenter, Agent-team, Prosjekter, Utviklingsplan (teknisk plan), Workbench 2.0 (hybrid).
- **13 av 14 tiltenkte flater finnes.** Mangler: Umatchede resultater · Coach-varsler-senter · Stats-publiserings-API.
- **Designsystem solid:** ~97 athletic-komponenter, CmdPalette (⌘K), DataState (tom/laster/feil). Mangler: MasteryRing, StreakTracker.
- **Korrigering av handover:** ikke monorepo (ingen apps//packages/). Fasit-filene (_ds/, 20-KOMPONENT-SPEC, 40-SKJERM-INVENTAR, AgencyOS.dc.html i rot) finnes ikke; ekte DS = `src/components/athletic` + `globals.css`.

**Topp 5 gap (prioritert):**
1. **P0 · Tilstandsdekning** — kun **3 `error.tsx` i HELE appen**; 139/145 admin-segmenter mangler loading/error/empty.
2. **P1 · 3 manglende skjermer** — Umatchede resultater (koble import→spiller), Coach-varsler-senter, Stats-publiserings-API.
3. **P1 · Fullfør STUB-undersider** — live/uka/caddie-faner, talent-undersider, board, recording, analysere, reach, organisasjon, kommunikasjon, videoer, kapasitet.
4. **P1 · Komponent-gap** — MasteryRing + StreakTracker mangler; EmptyState/Skeleton/ErrorState er fragmentert (i `ui/`, ikke samlet i athletic-DS).
5. **P2 · Refaktor** — hardkodet hex (179 filer; verst onboarding.css 67, workbench-hybrid/theme.ts 29, planlegge-v2, demos); dupliserte ruter.

---

## 1. Inventar (Oppgave A)

### 1.1 Ruter & skjermer (/admin — gruppert per sidebar)
~95 % EKTE Prisma. Under listes kun status pr. gruppe + de som IKKE er ekte (handlingspunkter):

| Gruppe | Sider | EKTE | STUB/DELVIS (verifiser) | DØD |
|---|---|---|---|---|
| Daglig | 14 | cockpit, oppgaver, tildelt-meg, oppgave-detalj | agencyos/live, agencyos/uka, agencyos/caddie(+dashbord/aktivitet), agencyos/okonomi, workspace (Notion+sample), workspace/prosjekter | — |
| AI & arbeid | 5 | agenter, agent-team, prosjekter, agents(+[id]) | — | — |
| Stall & talent | 27 | spillere(+alle [id]-undersider), stall, grupper(+[id]), talent/radar, talent-hub | talent: discovery, kohort, sammenligning, region, ressurser, wagr-import, wagr-benchmark | — |
| Operasjon | 45 | coach-workbench, handlingssenter, plans(+maler), drills(+forslag), teknisk-plan, tournaments, bookinger, anlegg, availability, services, trackman, gjennomfore, live/active | board, planlegge(hub), kalender/uke+maned, calendar/maned, recording, live/brief+summary | — |
| Analyse | 15 | analyse, risiko, lag-snitt, tester(+benchmarks/foreslatte/tildel), runder, reports, queue, oppfolging | analysere(+compliance), reach | — |
| Innboks | 11 | innboks, foresporsler, godkjenninger(+[id]), godkjenn-portal(+review/koblinger), approvals(+[id]) | — | messages (redirect) |
| System | 14 | okonomi, team(+inviter), settings(+security/tilgang/calendar/api), integrasjoner, email-templates, audit-log(+[id]) | — | finance (redirect) |
| Ikke i nav | 14 | brief (AI), profile, mer, klubb/innstillinger | tilstander (demo), hjelp, organisasjon, kommunikasjon, videoer, caddie, kapasitet, stats/overview, stats/moderering | /admin (redirect) |

**Dupliserte ruter:** `kalender`/`calendar` · `plans/templates`/`plan-templates` · `queue`/`oppfolging` (samme data).
**Arkitektur:** 0/145 «use client» — alle server components. Auth: requirePortalUser (~130), requireCapability (økonomi/anlegg/team), canAccessMissionControl (agenter).

**Øvrige flater (oversikt):** /portal (PlayerHQ) ~153 sider, ekte + hybrid-design. /forelder 11 sider, read-only, komplett. /(marketing) ~72. /stats ligger under `src/app/(marketing)/stats/` (~20 sider, ekte + ⌘K).

### 1.2 Komponenter
~97 athletic-komponenter + ui/-primitiver. Grupper: primitiver (Button/Badge/Avatar/Eyebrow/PulseDot), data-viz (KpiCard/KpiRing/SgBar/PyramidProgress/Sparkline/StatTile + ~12 charts + 10 kalendere), feedback (**DataState** = loading/error/empty, StatusPill), shell (Sidebar/AgencySidebar/Topbar/LiveBar/BottomNav/**CmdPalette ⌘K**/TabBar), kort (Insight/Tournament/Wellness/Coach/QuickAction), hero, editorial, itinerary, 9 page-patterns (GoalsHub/NotificationCenter/AuditLog/Import/LiveSession/Consent…), generisk DataTable.
- **Finnes:** Button, Badge, Avatar, Eyebrow, KpiCard, KpiRing, SgBar, PyramidProgress, StatusPill, CmdPalette, DataState.
- **Mangler/fragmentert:** **MasteryRing** ❌, **StreakTracker** ❌ (kun StreakCalendar). **EmptyState/Skeleton** ligger i `ui/`, ikke eksportert fra `athletic/index.ts`. **StatTable** kun delvis (generisk DataTable + StatTile).

### 1.3 Tilstandsdekning
- **Kritisk:** kun **3 `error.tsx`** i hele appen (root + admin + portal). ~25 `loading.tsx`, 3 `not-found.tsx`.
- /admin: 7 loading, 1 error, 1 not-found → **139/145 segmenter uten egen tilstand**. /portal: 15 loading, 1 error.
- Tilstands-komponenter brukes i kun **96 av 1362 filer (7 %)**. Wizard-/admin-paneler mangler ofte fallback.

### 1.4 Tema/merkevare
- **0 rå merkevare-hex** (#17446F/#2E857D/#EF2B2D) i UI — godt tokenisert (WANG/Team Norway via typer/seed). ✅
- **MEN hardkodet hex generelt: 179 filer.** Verst: onboarding.css (67), demos/plan-bygger (51), demos/ny-okt (39), planlegge-v2/styles (37), workbench.css (32), workbench-hybrid/theme.ts (29). Token-refaktor-kandidater. Teknisk-plan.css (egne hex + cream-rester) hører hjemme her (tidligere funn).

---

## 2. Gap-analyse (Oppgave C)

### 2.1 Manglende skjermer
| Skjerm | Flate | Brukerjobb | Data | Prioritet | Kompleksitet |
|---|---|---|---|---|---|
| Umatchede resultater (koble import → spiller, fuzzy-forslag) | /admin | Rydde importerte resultater uten profil | importrad + User (fuzzy match) | **P0/P1** | M |
| Coach-varsler-senter | /admin | Coach ser vitneforespørsler/signaler/forfall samlet | Notification/Signal/PlanAction | **P1** | S/M |
| Stats-publiserings-API + nøkkelstyring | /admin | Styre hva som eksponeres offentlig + API-nøkkel | public-API-config, ApiKey | **P1** | M |
| (Fullfør STUB) live/uka/caddie-faner, talent-undersider, board, recording, analysere, reach, organisasjon, kommunikasjon, videoer, kapasitet | /admin | Diverse | varierer | **P1/P2** | S–M hver |

### 2.2 Manglende komponenter
- **MasteryRing** — mestrings-ring per ferdighet/drill (gamification). Brukes i spiller-progresjon/teknisk plan. Ny.
- **StreakTracker** — streak-visning (ikke kalender). Variant av StreakCalendar / ny liten komponent.
- **StatTable (komplett)** — konsolider DataTable + StatTile til én spec'd stat-tabell-variant.
- **Tilstands-trio i DS** — eksporter EmptyState + Skeleton + ErrorState fra `athletic/index.ts` (samles med DataState) så «fire tilstander» er ett importpunkt.

### 2.3 Komponenter som må refaktoreres
- **EmptyState/Skeleton** flyttes/eksporteres fra `ui/` → `athletic/` (fragmentert i dag).
- **Token-migrering** av verste hex-filer: onboarding.css, workbench-hybrid/theme.ts, planlegge-v2/styles, workbench.css, teknisk-plan.css (+ cream-rester) → CSS-variabler. Demo-sidene (internal/demos) er lavprioritet.
- **Dupliserte ruter** konsolideres: velg kanon for kalender/calendar, plans-templates/plan-templates, queue/oppfolging — slett/redirect den andre.

### 2.4 Tilstands- & kvalitetsgap
- **P0:** kun 3 `error.tsx` i hele appen → legg til error-grense per dataflate (særlig admin-undersider).
- Utvid loading/empty-dekning: 139/145 admin-segmenter mangler egen tilstand; tilstands-komponenter brukt i 7 % av filer.
- Døde lenker: 9 `href="#"` (5 i design-system-demo) + 1 tom `onClick` + 66 TODO/FIXME — rydd de utenfor demo.
- Emoji: 28 treff, mest marketing (akseptert) + kommentarer — lav prioritet.
- Brutto/netto: ikke verifisert i denne runden (åpent spørsmål).

---

## 3. Anbefalt rekkefølge (faseplan)
**Fase P0 — robusthet & fasit (lav risiko, høy verdi):**
1. Tilstands-trio i athletic-DS (eksporter EmptyState/Skeleton/ErrorState) → 2. legg `error.tsx` + `loading.tsx` per admin-/portal-dataflate (bruk DataState). 3. Token-migrering av verste hex-filer + teknisk-plan.css.
**Fase P1 — lukk skjerm-gap:**
4. Umatchede resultater · 5. Coach-varsler-senter · 6. Stats-publiserings-API. 7. Fullfør/avklar STUB-undersider (eller fjern fra nav). 8. MasteryRing + StreakTracker.
**Fase P2 — opprydding:**
9. Konsolider dupliserte ruter. 10. Rydd døde lenker/TODO utenfor demo.
*Avhengighet:* tilstands-trio (P0.1) bør komme før skjerm-bygging, så nye skjermer arver fire tilstander gratis.

## 4. Åpne spørsmål til Anders
1. **Dupliserte ruter** (kalender/calendar, plans/templates+plan-templates, queue/oppfolging) — hvilken er kanon? Skal de andre slettes/redirectes?
2. **STUB-undersider** (talent/discovery, kohort, region, ressurser, wagr; analysere; reach; board; kommunikasjon; videoer; kapasitet; live/brief+summary) — bygge ut, eller fjerne fra nav til de er ekte?
3. **Branding-velger (AK/WANG/TN)** — trengs en UI-velger, eller holder token-bytte på rot?
4. **Umatchede resultater** — finnes import-flyten (TrackMan/DataGolf) allerede, så det bare mangler koble-UI? Hvor ligger importrad-modellen?
5. **Stats-publisering** — hva skal eksponeres offentlig, og trengs API-nøkkel-styring nå?
6. **Prioritet:** skal P0 (tilstandsdekning/robusthet) gå FØRST, før nye skjermer? (Anbefalt.)
7. Skal STUB-flaggene verifiseres én-for-én før vi handler (noen kan være ekte)?
