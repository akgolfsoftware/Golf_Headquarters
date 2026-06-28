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
| PlayerHQ `/portal` | 150 | 5-fane-IA er sunn. Coach-videoer + Innstillinger MER koblet, TrackMan-duplikat konsolidert (2026-06-25). Igjen: coach/booking-deep-links = beslutning. |
| AgencyOS `/admin` | 141 | Gruppert sidebar godt koblet. **404-bugene løst (2026-06-28)**, ~7 «glemt å koble», ~9 utdaterte dublett-flater. |
| Marketing `akgolf.no` | ~27 | `/priser` + `/faq` nå i header/mobil-meny (2026-06-25). `/blogg`,`/cases`,`/junior`,`/suksess` = IA-valg. `/turneringer` bevisst ute av v1. |
| Stats `/stats` | ~45 | Strukturelt løst: nav-komponenten (`StatsCmdK`) er aldri montert + ingen stats-layout → ~15 foreldreløse. (Delvis bevisst: ikke i v1.) |
| Forelder/Auth/Booking | ~35 | Forelder rent. 1 ekte 404-blindvei, 4 foreldreløse, 2 dublett-flyter. |

**Tre kategorier å handle på:** (A) ekte bugs som gir 404, (B) foreldreløse skjermer → koble eller pensjoner, (C) dubletter/stale → konsolider.

---

## DEL 1 — Kanonisk navigasjonsfasit (knapp → skjerm)

### PlayerHQ — `/portal` (alltid lys). 5 faner: mobil bunn-nav = desktop sidebar.

| Fane | Rute | Undersider (sidebar-children / faner) |
|---|---|---|
| **Hjem** | `/portal` | Varsler (via bjelle i topbar) |
| **Plan** | `/portal/planlegge` → Workbench | Årsplan `/portal/tren/aarsplan` · Treningsplan `/portal/tren/teknisk-plan` · Fysplan `/portal/tren/fys-plan` · Mål `/portal/mal` · Turneringer `/portal/tren/turneringer` · Drills `/portal/drills` · Coach-planer `/portal/coach/plans` · Coach-meldinger `/portal/coach/melding` |
| **Gjør** | `/portal/gjennomfore` | Ny økt `/portal/ny-okt` · Øktlogg `/portal/gjennomfore` · Treningslogg `/portal/trening/logg` · Live (fullskjerm) `/portal/live/[id]/brief→active→summary` |
| **Analyse** | `/portal/analysere` (faner) | Statistikk `/portal/analysere` · Strokes gained `/portal/mal/sg-hub` · Runder `/portal/mal/runder` · TrackMan `/portal/mal/trackman` · Tester `/portal/tren/tester` · Innsikt `/portal/analysere/hull` |
| **Meg** | `/portal/meg` | Profil · Abonnement `/portal/meg/abonnement` · Bookinger `/portal/meg/bookinger` · Helse · Utstyrsbag · Dokumenter · Hjelp · Sikkerhet · Innstillinger |

Coach-hub `/portal/coach` (Pro): SUB-NAV Oversikt/Meldinger/Notater/Spørsmål/Øvelser/SG-hub/AI/Planer/Perioder. Booking-hub `/portal/booking` (credit) nås via coach-flate + hurtighandlinger.

### AgencyOS — `/admin` (mørk terminal + lys-toggle). Cockpit + gruppert sidebar.

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
Header (oppdatert 2026-06-25): Coaching · Treningsfilosofi · PlayerHQ · **Priser** · Anlegg · **FAQ** · Om oss · (CTA: Logg inn · Book tid). Footer: Coaching · Booking · PlayerHQ · Coacher · Anlegg · Jobb · Kontakt · Personvern · Vilkår · Cookies. (Turneringer + stats bevisst UTE av v1.) Booking-flyt: `/booking` → `/booking/[slug]` → `/bekreft` → Stripe → `/kvittering/[id]`.

### Stats — `/stats` (eget spor, ikke i v1-marketing-nav)
Hub `/stats` → PGA-metrikker · Norske spillere/baner/turneringer · Verktøy · SG-sammenlign. Trenger egen layout-nav for å henge sammen (se DEL 2-C).

---

## DEL 2 — Forbedrings-lag (handle på disse)

### A · EKTE BUGS — ✅ ALLE FEM LØST (verifisert mot kode 2026-06-28)

| # | Hvor | Problem | Status |
|---|---|---|---|
| A1 | `src/app/api/admin/search/route.ts:62` | Cmd+K «Innstillinger» → `/admin/innstillinger` (fantes ikke) | ✅ peker nå `/admin/settings` |
| A2 | `src/app/api/admin/search/route.ts:64` | Cmd+K «Meldinger» → `/admin/meldinger` (fantes ikke) | ✅ peker nå `/admin/innboks` |
| A3 | `src/app/admin/tester/page.tsx` | «Tildel» → `/admin/tester/tildel` (manglet) | ✅ `tester/tildel/page.tsx` finnes (spiller-velger → `/[spillerId]`) |
| A4 | `src/app/portal/booking/[bookingId]` | «Alt er klart» → `/bekreftet` uten `bookingId` → `notFound()` | ✅ lenken sender nå `?bookingId=${bookingId}` (linje 248 + bekreft-form) |
| A5 | `global-search` + `api/portal/search` | Lenker til gammel `/portal/analyse` (stale) | ✅ ingen treff igjen — alle peker `/portal/analysere` |

> **2026-06-28:** Verifisert at admin-sidebar (46 ruter i `admin-nav.ts`) + alle portal/admin
> bunn-/mobil-nav-kilder peker på ekte `page.tsx` — **null døde knapper i nav-kildene**. DEL 2-A er historikk.

### B · FORELDRELØSE — koble eller pensjoner (bestem per rad)

> **Synket med kode 2026-06-25** — flere rader er nå løst eller verifisert. ✅ = gjort, ÅPEN = beslutning.

**PlayerHQ — «glemt å koble» (bygget, hører hjemme i nav):**
- `Meg → Innstillinger`: ✅ **DONE (9ef691c)** — «MER»-gruppe lenker `anlegg` + `okter`. `sprak`/`varsler`/`sikkerhet` dekkes av inline-seksjoner (ikke duplisert).
- `/portal/coach/videoer` ✅ **DONE (779a1ab)** (coach sub-nav). `/portal/coach/[coachId]` ✅ **DONE (130b813)** («Se profil» i coach-hub). `/portal/booking/coach/[coachId]` + `/portal/booking/anlegg/[anleggId]` = dekket via `booking/ny?coachId/anleggId`; separate sider nås via URL.

**PlayerHQ — verifisert (IKKE «dødt»):**
- `/portal/trackman/[sessionId]` ✅ **konsolidert (c107593)** → redirect til kanon `mal/trackman/[id]` (identisk datakilde). `/portal/trening/putte-laboratoriet` (831 l) er en **ekte skjerm** — behold. `/portal/reach` + `/portal/trening/break-tabell` = foreldreløse uten rent redirect-mål → la stå (skader ingen sti).

**AgencyOS — «glemt å koble» (bygget, mangler nav-inngang):**
- `/admin/tester/foreslatte` + `/admin/tester/benchmarks` ✅ **DONE (779a1ab)**. `organisasjon` + `stats/overview` + `stats/moderering` + `godkjenn-portal` ✅ **DONE (6362476)** (ADMIN-only «Intern»-seksjon). `/admin/anlegg/[id]` → ÅPEN (tiles → `/admin/availability`). `talent/[playerId]` → ÅPEN.

**Marketing:**
- `/priser` + `/faq` ✅ **DONE (9ef691c)** (header + mobil-meny). `/blogg`,`/cases`,`/junior`,`/suksess` → ÅPEN (marketing-IA-valg). `/turneringer` + stats = bevisst UTE av v1.

**Auth/Onboarding:**
- `/auth/logget-ut` (logout går til `/login` i stedet — koble eller arkiver), `/onboard/coach` + `/onboard/klubb` (parallelle, ukoblede wizards — sannsynlig duplikat av `/auth/onboarding`), `/auth/bankid` (bevisst post-beta).

### C · DUBLETTER / STALE — konsolider

| Tema | Situasjon | Anbefaling |
|---|---|---|
| AgencyOS utdaterte flater — ✅ **enkle dubletter ryddet (verifisert 2026-06-28)** | Allerede redirects: `/admin/calendar`→`kalender`, `/admin/finance`→`okonomi`, `/admin/messages`→`innboks`, `/admin/caddie`→`agencyos/caddie/dashbord`, `/admin/board`. `/admin/queue` er BÆRENDE (`/admin/oppfolging` re-eksporterer den) — ikke rør. | Ferdig for de enkle. |
| AgencyOS — 4 ekte foreldreløse sider (IKKE enkle dubletter) | 0 inbound-lenker, men reell UI-kode (verdikt 2026-06-28, hver side lest). | Per-side (under) — IKKE blind-redirect før lansering. |

**Beslutnings-klar liste (de 4 foreldreløse — Anders avgjør):**

| Rute | Hva den ER (verifisert) | Anbefaling |
|---|---|---|
| `/admin/planlegge` (446 l) | Ekte sesong-Gantt fra `SeasonPlan`+`PeriodBlock`+`TournamentEntry`+`TrainingPlan`, ærlige tomme tilstander. | **Behold + gi nav-inngang**, ELLER bekreft at Workbench avløser den (låst: «planlegging bor i Workbench») → da redirect til `/admin/coach-workbench`. |
| `/admin/videoer` (127 l) | Ekte video-håndtering: `sessionVideo`-spørring + opplasting + kort. | **Behold + gi nav-inngang** (coach-verktøy). Ikke slett. |
| `/admin/hjelp` (296 l) | Statisk hjelpesenter (søk + 5 kategorier), ingen DB. | **Behold** — lenk fra en hjelp-knapp i topbar senere. Ufarlig som er. |
| `/admin/kommunikasjon` (133 l) | Gammel kombinert hub (Innboks/E-postmaler/Notion-faner); delene finnes nå hver for seg i nav. | Eneste reelle redirect-kandidat → `/admin/innboks`. IA-valg: vil du beholde et samlet kommunikasjons-hub eller bruke de separate nav-postene? |
| PlayerHQ «kalender» x3 | `/portal/kalender` (ekte) · `/portal/tren/kalender` (redirect-skygge) · `/portal/gjennomfore?tab=kalender` | Velg én kanonisk, fjern de to andre inngangene. |
| Stats henger løst | `StatsCmdK` (11-lenkers nav) er aldri montert + ingen `stats/layout.tsx` → ~15 foreldreløse | Monter `StatsCmdK` ELLER lag `stats/layout.tsx` med nav. (Avventer: stats er ikke i v1.) |
| Forelder-invitasjon x2 | `/inviter/forelder/[token]` vs `/auth/guardian-consent/[token]` | Avklar hvilken som er kanon, fjern den andre. |
| «Mine bookinger» x3 | `/portal/meg/bookinger` · `/portal/booking` · `/forelder/bookinger` | Bevisst per rolle, men kvitteringen bør peke rolle-riktig. |

---

## DEL 3 — Hvordan dette mater Claude Design

DEL 1 (kanonisk fasit) er det Claude Design-prompten (`CLAUDE-DESIGN-PROMPT.md`) skal bruke som «knapp → skjerm». DEL 2-B/C er IA-beslutninger: når en foreldreløs skjerm får et hjem eller en dublett pensjoneres, oppdateres DEL 1 + prompten. Slik holder designet og koden samme navigasjon - og «feil skjerm på feil knapp» forsvinner ved kilden.

*Verifisert 2026-06-24 mot 406 page.tsx-ruter; DEL 2-A re-verifisert + alle 5 404-bugs bekreftet løst 2026-06-28 (admin-nav + portal/admin bunn-nav har null døde knapper). Hold i sync med `CLAUDE-DESIGN-PROMPT.md` og appens nav-filer (`bottom-nav.tsx`, `portal/sidebar.tsx`, `admin-nav.ts`).*
