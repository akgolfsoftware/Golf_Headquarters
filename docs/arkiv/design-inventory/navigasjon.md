# Navigasjon / IA-kart (basert på hele skjerm-oversikten)

> Sitemap + foreldre/barn + nøkkelflyt. Strukturen er utledet fra rute-treet (`src/app/`) +
> `MASTER-SKJERMPLAN.md`. Nav-komponent-filer siteres der de er kjent; ellers `UVERIFISERT`.

## Topp-navigasjon per flate

### PlayerHQ — 5-tab bunnbar (mobil) / venstre-rail (desktop)
Nav-komponent: `src/components/shared/mobile-bottom-nav` + `athletic/tab-bar` (UVERIFISERT eksakt linje).
```
/portal                 Hjem ★            (Workbench-hjem)
/portal/planlegge       Planlegge ★   →   /portal/planlegge/workbench (hub: tek/seson/maler/std/gantt/uke/okt)
/portal/gjennomfore     Gjennomføre ★ →   /portal/(fullscreen)/live/[id]/{brief,active,summary,logger,tapper}
/portal/analysere       Analysere ★   →   /portal/mal/sg-hub(+subs), /portal/statistikk, /portal/mal/runder, /trackman, /tren/tester
/portal/meg             Meg ★         →   profil, abonnement, helse, innstillinger(+subs), utstyrsbag, dokumenter, help
```
Sidespor (ikke i bunnbar): `/portal/coach/*` (coach-dialog), `/portal/talent/*` (elite, utsatt), `/portal/booking/*`, `/portal/varsler`.

### AgencyOS — venstre sidebar (desktop) / skuff (mobil — MANGLER)
Nav-komponent: `src/components/admin/agencyos-sidebar.tsx` (UVERIFISERT linje). Mobil-skuff: ikke bygget.
```
/admin/agencyos         Cockpit ★      (hub-faner: live/uka/spillere/okonomi/caddie)
  Stall:        /admin/spillere ★ → /admin/spillere/[id] ★ → workbench ★/fremgang/tester/plan ; /admin/grupper ; /admin/talent/*
  Planlegge:    /admin/plans, /admin/plan-templates, /admin/drills, /admin/tournaments ★, /admin/teknisk-plan
  Gjennomføre:  /admin/kalender, /admin/bookinger ★, /admin/anlegg, /admin/availability, /admin/services, /admin/live/[id]/*
  Innsikt:      /admin/analyse, /admin/lag-snitt, /admin/tester, /admin/foresporsler, /admin/godkjenninger, /admin/reports, /admin/okonomi
  Innboks ★:    /admin/innboks
  Admin:        /admin/settings(+subs), /admin/team, /admin/organisasjon, /admin/integrasjoner
```
> NB: dublett-adresser (`/admin/calendar`↔`/admin/kalender`, `/admin/finance`↔`/admin/okonomi`, `/admin/messages`↔`/admin/innboks`, `/admin/approvals`↔`/admin/godkjenninger`, `/admin/plans/templates`↔`/admin/plan-templates`) — redirects, bør konsolideres.

### Marketing (akgolf.no) — topp-nav
```
/                       Forside ★
/coaching /coacher(/[slug]) /junior /priser /playerhq /om-oss /kontakt /jobb /faq /suksess /treningsfilosofi /cases
/anlegg(/[slug]) /blogg(/[slug]) /turneringer(/[slug])
/booking(/[slug])(/bekreft) /booking/kvittering/[id]      (kjøpsflyt)
/stats/*                EGET SPOR — egen stats-sub-nav (45 sider): forside/uka, spillere, turneringer, leaderboards, pga, verktøy, sammenlign, blogg/quiz/wrapped
/cookies /personvern /vilkar
```

### Forelder — egen nav
```
/forelder → barn(/[childId]), bookinger, coach, fakturaer, okonomi, samtykke, ukerapport, innstillinger, varsler
/inviter/forelder/[token]   (invitasjon, utenfor nav)
```

### Auth — lineære flyter (ingen vedvarende nav)
`/auth/login ↔ signup ↔ forgot-password → check-email → reset-password` · `/auth/bankid` · `/auth/onboarding(/forelder)` · `/auth/guardian-consent/[token]` → `/auth/samtykke-venter`

## Modaler / sheets / parallelle ruter
Mange «skjermer» er modaler/sheets (ikke egne ruter): f.eks. del-runde, eksport, golfbox-import, trackman-import,
profil-rediger, tier-paywall-sheet (`src/components/shared/*-modal.tsx`, `tier-paywall-sheet.tsx`). Wizard-steg
(booking, ny-runde, tester, onboarding) er steg-tilstander i én rute. Disse telles per skjerm i flate-filene
(`children`-feltet). Ekte `@modal`/parallel routes: UVERIFISERT — sjekkes i flate-passene.

## Nøkkelflyt (entry → steg → exit)
1. **Onboarding → hjem:** `/auth/signup` → `/auth/onboarding` (8 steg) → `/portal`.
2. **Logg inn:** `/auth/login` → (Supabase auth) → `next` | `/portal`.
3. **Planlegg økt (coach/spiller):** Workbench `/…/workbench` → dra mal/økt inn (uke time-grid) → publiser (DRAFT→PENDING_PLAYER).
4. **Gjennomfør live-økt:** `/portal/gjennomfore` → `/portal/live/[id]` → brief → active (logg drills) → completeSession → summary.
5. **Coach godkjenn:** `/admin/innboks` | `/admin/foresporsler` → `/admin/godkjenninger(/[id])`.
6. **Forelder neste-økt:** `/forelder` → `/forelder/barn/[childId]` (0 ekstra trykk til neste økt — mål).
7. **Besøkende → kjøp:** `/(marketing)` → `/(marketing)/booking/[slug]` → bekreft → kvittering.
8. **Stats-funnel → PlayerHQ:** `/(marketing)/stats` → benchmark-teaser → `/(marketing)/playerhq` → `/auth/signup`.

> Trykk-budsjett + reachability-detaljer: se `docs/ux-arkitektur.md`. Eksakte nav-komponent-linjer
> verifiseres i flate-passene.
