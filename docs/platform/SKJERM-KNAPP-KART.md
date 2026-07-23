# Skjerm → knapp-kart (verifisert mot koden) + forbedrings-lag

> **Hva dette er:** Den autoritative navigasjonsfasiten for AK Golf HQ. Hver knapp → hvilken skjerm,
> hver skjerm → hvordan den nås. Bygget 2026-06-24 ved at fire agenter kartla **alle 406 `page.tsx`-ruter**
> mot faktiske `href`/`Link`/`router.push`/`redirect` i hele `src/`. Dette erstatter det eldre, drevne
> handover-kartet og er kilden Claude Design + Claude Code skal designe/bygge mot.
>
> **Status-koder:** `NAV` = i bunn-nav/sidebar · `SUB-NAV` = i en seksjons fane-rad · `IN-PAGE` = nås kun
> via knapp inne i en skjerm · `ORPHAN` = ingen knapp peker dit · `SHADOW` = redirect-skygge/stale lenke.

---

## Sammendrag (det kartet avslørte)

| Produkt | Ruter | Hovedfunn |
|---|---|---|
| PlayerHQ `/portal` | 150 | 5-fane-IA er sunn. Coach-videoer + Innstillinger MER koblet (2026-06-25). Igjen: coach/booking-deep-links + trackman-orphan = beslutning. |
| AgencyOS `/admin` | 141 | Gruppert sidebar godt koblet. 404-bugs fikset; Tester-actions koblet (2026-06-25). Igjen: anlegg/[id] (fasit-flyt) + QA-flater = beslutning. |
| Marketing `akgolf.no` | ~27 | `/priser` + `/faq` nå i header/mobil-meny (2026-06-25). `/blogg`,`/cases`,`/junior`,`/suksess` = IA-valg. `/turneringer` bevisst ute av v1. |
| Stats `/stats` | ~45 | Strukturelt løst: nav-komponenten (`StatsCmdK`) er aldri montert + ingen stats-layout → ~15 foreldreløse. (Delvis bevisst: ikke i v1.) |
| Forelder/Auth/Booking | ~35 | Forelder rent. 1 ekte 404-blindvei, 4 foreldreløse, 2 dublett-flyter. |

**Tre kategorier å handle på:** (A) ekte bugs som gir 404, (B) foreldreløse skjermer → koble eller pensjoner, (C) dubletter/stale → konsolider.

---

## DEL 1 — Kanonisk navigasjonsfasit (knapp → skjerm)

### PlayerHQ — `/portal` (alltid lys, B28 — se `docs/design-system/TEMA-LYS-MORK.md`). 5 faner: mobil bunn-nav = desktop sidebar.

| Fane | Rute | Undersider (sidebar-children / faner) |
|---|---|---|
| **Hjem** | `/portal` | Varsler (via bjelle i topbar) |
| **Plan** | `/portal/planlegge` → Workbench | Årsplan `/portal/tren/aarsplan` · Treningsplan `/portal/tren/teknisk-plan` · Fysplan `/portal/tren/fys-plan` · Mål `/portal/mal` · Turneringer `/portal/tren/turneringer` · Drills `/portal/drills` · Coach-planer `/portal/coach/plans` · Coach-meldinger `/portal/coach/melding` |
| **Gjør** | `/portal/gjennomfore` | Ny økt `/portal/ny-okt` · Øktlogg `/portal/gjennomfore` · Treningslogg `/portal/trening/logg` · Live (fullskjerm) `/portal/live/[id]/brief→active→summary` |
| **Analyse** | `/portal/analysere` (faner) | Statistikk `/portal/analysere` · Strokes gained `/portal/mal/sg-hub` · Runder `/portal/mal/runder` · TrackMan `/portal/mal/trackman` · Tester `/portal/tren/tester` · Innsikt `/portal/analysere/hull` |
| **Meg** | `/portal/meg` | Profil · Abonnement `/portal/meg/abonnement` · Bookinger `/portal/meg/bookinger` · Helse · Utstyrsbag · Dokumenter · Hjelp · Sikkerhet · Innstillinger |

Coach-hub `/portal/coach` (Pro): SUB-NAV Oversikt/Meldinger/Notater/Spørsmål/Øvelser/SG-hub/AI/Planer/Perioder. Booking-hub `/portal/booking` (credit) nås via coach-flate + hurtighandlinger.

### AgencyOS — `/admin` (mørk default + lys-toggle via `ak-v2-tema`). Cockpit + gruppert sidebar.

Cockpit `/admin/agencyos` fane-rad: **I dag · Live · Uka · Spillere · Økonomi**(admin) **· Caddie**(admin).

| Gruppe | Knapper → skjerm |
|---|---|
| **Daglig** | Oversikt `/admin/agencyos` · Min uke (Ukeoversikt `/admin/workspace` · Oppgaver `/admin/workspace/oppgaver` · Tildelt meg `/admin/workspace/tildelt-meg`) |
| **Stall & talent** | Spillere `/admin/spillere` · Stall `/admin/stall` · Grupper `/admin/grupper` · Talent (Radar `/admin/talent/radar` · Sammenligning `/admin/talent/sammenligning` · WAGR-import `/admin/talent/wagr-import`) |
| **Operasjon** | Workbench `/admin/coach-workbench` · Handlingssenter `/admin/handlingssenter` · Planlegge (Treningsplaner `/admin/plans` · Plan-maler `/admin/plan-templates` · Drill-bibliotek `/admin/drills` · Økter `/admin/okter` · Teknisk plan `/admin/teknisk-plan` · Turneringer `/admin/tournaments`) · Gjennomføre (Kalender `/admin/kalender` · Bookinger `/admin/bookinger` · Anlegg `/admin/anlegg` · Tilgjengelighet `/admin/availability` · Tjenester `/admin/services` · TrackMan `/admin/trackman` · Opptak `/admin/recording`) |
| **Analyse** | Stall-analyse `/admin/analyse` · Risiko `/admin/risiko` · Lag-snitt `/admin/lag-snitt` · Tester `/admin/tester` · Runder `/admin/runder` · Compliance `/admin/analysere/compliance` · Reach `/admin/reach` · Rapporter `/admin/reports` |
| **Innboks** | Forespørsler `/admin/foresporsler` · Godkjenninger `/admin/godkjenninger` · Meldinger `/admin/innboks` |
| **System** | Økonomi `/admin/okonomi` · Team `/admin/team` · Integrasjoner `/admin/integrasjoner` · AI-agenter `/admin/agents` · E-postmaler `/admin/email-templates` · Audit-logg `/admin/audit-log` · Innstillinger `/admin/settings` |

Spiller-detalj `/admin/spillere/[id]`: faner Profil/Fremgang/Tester/Tildel test/Workbench/Plan.

### Forelder — `/forelder` (lys, rent nav)
Oversikt `/forelder` · Mine barn `/forelder/barn` · Bookinger · Økonomi · Fakturaer · Coach · Ukerapport · Varsler · Samtykker `/forelder/samtykke` · Innstillinger.

### Auth/Onboarding (flyt)
Login `/auth/login` (hub) → Signup → Sjekk e-post → Onboarding (`/auth/onboarding`, PARENT→`/onboarding/forelder`) → portal/forelder. Glemt/Reset passord (e-post). Foreldresamtykke `/auth/guardian-consent/[token]` (e-post).

### Marketing — `akgolf.no`
Header: Coaching · Treningsfilosofi · PlayerHQ · Anlegg · Om oss · (CTA: Logg inn · Book tid). Footer: Coaching · Booking · PlayerHQ · Coacher · Anlegg · Jobb · Kontakt · Personvern · Vilkår · Cookies. Booking-flyt: `/booking` → `/booking/[slug]` → `/bekreft` → Stripe → `/kvittering/[id]`.

### Stats — `/stats` (eget spor, ikke i v1-marketing-nav)
Hub `/stats` → PGA-metrikker · Norske spillere/baner/turneringer · Verktøy · SG-sammenlign. Trenger egen layout-nav for å henge sammen (se DEL 2-C).

---

## DEL 2 — Forbedrings-lag (handle på disse)

### A · EKTE BUGS — gir 404 i dag (fiks først, lav risiko)

| # | Hvor | Problem | Fiks |
|---|---|---|---|
| A1 | `src/app/api/admin/search/route.ts:62` | Cmd+K «Innstillinger» → `/admin/innstillinger` (finnes ikke) | → `/admin/settings` |
| A2 | `src/app/api/admin/search/route.ts:64` | Cmd+K «Meldinger» → `/admin/meldinger` (finnes ikke) | → `/admin/innboks` |
| A3 | `src/app/admin/tester/page.tsx:199` | «Tildel»-knapp → `/admin/tester/tildel` (finnes kun `/[spillerId]`) | velg spiller først, ELLER pek til tildel-flate med spiller-velger |
| A4 | `src/app/portal/booking/[bookingId]` (~248) | «Alt er klart» → `/bekreftet` UTEN `?bookingId=` → `notFound()` | send med `bookingId`, ELLER pek til booking-hub |
| A5 | `global-search` + `api/portal/search` | Lenker til gammel `/portal/analyse` (redirecter, men stale) | → `/portal/analysere` |

> Alle fem er verifisert mot kildekoden. A1–A2 + A5 er rene streng-bytter.

### B · FORELDRELØSE — koble eller pensjoner (bestem per rad)

**PlayerHQ — «glemt å koble» (bygget, hører hjemme i nav):**
- `Meg → Innstillinger`: ✅ **DONE 2026-06-25 (9ef691c)** — ny «MER»-gruppe lenker `anlegg` + `okter`. `sprak`/`varsler`/`sikkerhet` dekkes alt av inline-seksjonene (ikke duplisert).
- `/portal/coach/videoer` ✅ **DONE (779a1ab)** — i coach sub-nav. `/portal/coach/[coachId]` ✅ **DONE (130b813)** — «Se profil» i coach-hub. `/portal/booking/coach/[coachId]` + `/portal/booking/anlegg/[anleggId]` = dekket via `booking/ny?coachId/anleggId` (kanonisk book-med-flyt); separate sider nås via URL.

**PlayerHQ — verifisert 2026-06-25 (IKKE «dødt»):**
- `/portal/trening/putte-laboratoriet` (831 l) + `/portal/trackman/[sessionId]` (473 l) er **fullverdige portede skjermer**, ikke stubber. Beslutning utestår: trackman = wire fra Workbench (krevende — ingen økt-liste der i dag) eller redirect → `mal/trackman/[id]`. `/portal/reach` + `/portal/trening/break-tabell` = ikke verifisert ennå.

**AgencyOS — «glemt å koble» (bygget, mangler nav-inngang):**
- `/admin/tester/foreslatte` + `/admin/tester/benchmarks` ✅ **DONE (779a1ab)** — Foreslåtte/Fasiter-actions på Tester. `organisasjon` + `stats/overview` + `stats/moderering` + `godkjenn-portal` ✅ **DONE (6362476)** — ny ADMIN-only «Intern»-seksjon i sidebar. `/admin/anlegg/[id]` → ÅPEN (tiles → `/admin/availability`, fasit; detalj nås via URL). `talent/[playerId]` → ÅPEN (dublett av radar-detalj).

**Marketing (footeren viser dem ikke):**
- `/priser` + `/faq` ✅ **DONE 2026-06-25 (9ef691c)** — i header + mobil-meny. `/blogg`, `/cases`, `/junior`, `/suksess` → ÅPEN (marketing-IA-valg). `/turneringer` + stats = bevisst UTE av v1.

**Auth/Onboarding:**
- `/auth/logget-ut` (logout går til `/login` i stedet — koble eller arkiver), `/onboard/coach` + `/onboard/klubb` (parallelle, ukoblede wizards — sannsynlig duplikat av `/auth/onboarding`), `/auth/bankid` (bevisst post-beta).

### C · DUBLETTER / STALE — konsolider

| Tema | Situasjon | Anbefaling |
|---|---|---|
| AgencyOS utdaterte flater | `/admin/calendar*` (dead `calendar-view-toggle`), `/admin/planlegge`, `/admin/queue`+`/oppfolging`, `/admin/kommunikasjon`, `/admin/hjelp`, `/admin/videoer`, `/admin/finance`, `/admin/messages`, `/admin/board`, `/admin/caddie`(stub) | Pensjoner/redirect til kanonisk rute (`/admin/kalender`, `/admin/okonomi`, `/admin/innboks`, …). |
| PlayerHQ «kalender» x3 | `/portal/kalender` (ekte) · `/portal/tren/kalender` (redirect-skygge) · `/portal/gjennomfore?tab=kalender` | Velg én kanonisk, fjern de to andre inngangene. |
| Stats henger løst | `StatsCmdK` (11-lenkers nav) er aldri montert + ingen `stats/layout.tsx` → ~15 foreldreløse | Monter `StatsCmdK` ELLER lag `stats/layout.tsx` med nav. (Avventer: stats er ikke i v1.) |
| Forelder-invitasjon x2 | `/inviter/forelder/[token]` vs `/auth/guardian-consent/[token]` | Avklar hvilken som er kanon, fjern den andre. |
| «Mine bookinger» x3 | `/portal/meg/bookinger` · `/portal/booking` · `/forelder/bookinger` | Bevisst per rolle, men kvitteringen bør peke rolle-riktig. |

---

## DEL 3 — Hvordan dette mater Claude Design

DEL 1 (kanonisk fasit) er det Claude Design-prompten (`CLAUDE-DESIGN-PROMPT.md`) skal bruke som «knapp → skjerm». DEL 2-B/C er IA-beslutninger: når en foreldreløs skjerm får et hjem eller en dublett pensjoneres, oppdateres DEL 1 + prompten. Slik holder designet og koden samme navigasjon - og «feil skjerm på feil knapp» forsvinner ved kilden.

*Verifisert 2026-06-24 mot 406 page.tsx-ruter. Hold i sync med `CLAUDE-DESIGN-PROMPT.md` og appens nav-filer (`bottom-nav.tsx`, `portal/sidebar.tsx`, `admin-nav.ts`).*
