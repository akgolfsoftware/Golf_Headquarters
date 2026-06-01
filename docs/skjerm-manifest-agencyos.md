# Skjerm-manifest — AgencyOS (tidl. CoachHQ)

> Generert 2026-06-01 · Design-intensjon (fasit for redesign), ikke nåværende implementasjon.
> For hver skjerm: **inngang** · **hva er synlig** · **knapper → destinasjon** · wireframe på nøkkelskjermer.
>
> Logikk: coachens **KONTROLLTÅRN**. "Hvem trenger MEG i dag?" Coach opererer PÅ spillernes verktøy.
> KPIer = business + drift (Aktive spillere, Økter denne uka, MRR coaching, Utestående) — IKKE operasjonell trivia.

---

## KJERNE-PRINSIPPER (gjelder hele AgencyOS)

1. **Komplett oversikt over alle utøvere** — alltid ett klikk unna.
2. **Gå rett inn i utøvers Workbench** (`/admin/spillere/[id]/workbench`) = NØYAKTIG samme delte komponent som PlayerHQ. Coach planlegger/endrer/kommenterer DERFRA. **Endring propagerer til spiller.**
3. **Bytt sømløst spiller ↔ gruppe** — player-picker øverst, alltid tilgjengelig.
4. **Turneringskalender** med uke/måned/år, auto-populert (hvilken turnering helgen + hvilke spillere).
5. **Fellesmelding til turneringsdeltakere** — én melding til alle N spillere i en turnering.
6. **Fokus-spiller = hybrid:** manuell pin (alltid prioritet) + AI-forslag (oppfølging, ubesvarte, hastespørsmål).

---

## 0. AUTH — coach-innlogging

### `/auth/login` (coach-rolle)
**Synlig:** Samme login. Ved coach-konto → redirect `/admin/agencyos`. Sidebar-undertittel: `COACHHQ · HEAD COACH`.
**Coach-onboarding:** 4-stegs wizard. **Klubb-onboarding:** 5-stegs wizard.

---

## 1. OVERSIKT — AgencyOS hjem (`/admin/agencyos`) ★ NØKKEL

**Inngang:** Logg inn (coach) → lander her. Sidebar topp: "Oversikt".

**Hva er synlig (3-kolonne operations cockpit):**

**Topp:**
- Topbar: ak-logo + "COACHHQ · HEAD COACH" · søk "Søk spiller, økt, faktura... ⌘K" · "Vis som spiller"-toggle · varsler · profil
- Dato + AI-overskrift: "God morgen, [navn]. Du har **5 økter** i dag — neste 14:30." + AI-kontekstlinje ("Magnus' approach er +0,42 SG siste fem runder...")

**KPI-strip (4 business-KPIer):**
- AKTIVE SPILLERE (42, ↑3 nye denne mnd)
- ØKTER DENNE UKA (28, ↑14% vs forrige)
- MRR · COACHING (184k kr, ↑6%)
- UTESTÅENDE (12,8k kr, 3 forfalt)

**3-kolonne body:**
- **Venstre — Fokus-spiller:** avatar + navn + HCP + SG-tiles (SG Approach, Drive, Fairway, Putt 3m) + pyramide-vekting (uke) + "Åpne spillerprofil →"
- **Midt — Dagens timeline:** 08:00–20:00, økter plottet (spiller + tema + sted), navigasjon ‹ I dag ›
- **Høyre — Innboks:** "X krever handling" — meldinger/fakturaer/forespørsler med labels (KONF/SVAR/FORFALT/BEHANDLE/LOGGET), "Se alle →"

**Knapper → destinasjon:**
| Knapp | Går til |
|---|---|
| + Ny økt / Ny plan (sidebar topp) | `/admin/plans/new` |
| Søk (⌘K) | global søk (spiller/økt/faktura) |
| Vis som spiller | `/portal` (coach ser PlayerHQ) |
| Åpne spillerprofil | `/admin/spillere/[id]` |
| Fokus-spiller "..." | pin/endre fokus-spiller |
| Timeline-økt | `/admin/gjennomfore/okter/[id]` |
| Innboks-item | melding/faktura/forespørsel |
| KPI Utestående | `/admin/finance` |

```
┌─────────┬──────────────────────────────────────────────────────┐
│ ak      │ [Søk spiller, økt, faktura ⌘K]  Vis som spiller 🔔 [A]│
│ COACHHQ │ ─────────────────────────────────────────────────────│
│ ·HEAD   │ ONSDAG · 28 MAI · 11:24                               │
│ COACH   │ Du har 5 økter i dag — neste 14:30.                  │
│         │ Magnus' approach er +0,42 SG siste fem runder...     │
│+ Ny plan│ ┌─────────┐┌─────────┐┌─────────┐┌─────────┐         │
│         │ │AKTIVE 42││ØKTER  28││MRR 184k ││UTEST12,8││         │
│▸Oversikt│ │↑3 nye   ││↑14%     ││↑6%      ││3 forfalt││         │
│ Stall   │ └─────────┘└─────────┘└─────────┘└─────────┘         │
│ Planleg │ ┌──FOKUS────┐┌──DAGENS TIMELINE──┐┌──INNBOKS 4──┐    │
│ Gjennom │ │[MS] Magnus││08 ─────────────── ││MS Bekreftet │    │
│ Innsikt │ │HCP 4,2    ││09 ▌Magnus·Approach││KJ Ber om tid│    │
│ Admin   │ │SG App+0,42││11 ▌Kari·Putt-test ││PE Faktura ⚠ │    │
│         │ │Drive 268m ││13 ▌Per·Full bag   ││LB Eval-forsp│    │
│         │ │FW 71% P52%││15 ▌Lina·Eval      ││JH Logget    │    │
│         │ │[Åpne →]   ││17 ▌Junior-gruppe  ││[Se alle →]  │    │
│         │ └───────────┘└───────────────────┘└─────────────┘    │
└─────────┴──────────────────────────────────────────────────────┘
```

### `/admin/agencyos/uka` · `/spillere` · `/okonomi` · `/caddie` · `/caddie/aktivitet`
- **uka:** ukentlig kanban — alle økter man–søn
- **spillere:** spillerliste m/ SG-trend-sparklines, søk/filter (aktiv 90d, abonnement, betaling)
- **okonomi:** MRR-aggregeringer, utestående fakturaer, 6-mnd historikk
- **caddie:** AI-chat for coachen (M19 — AI SDK)
- **caddie/aktivitet:** Caddie-handlingslogg

### Workspace — `/admin/workspace` (+ undersider)
**Inngang:** Sidebar "Min uke".
**Synlig:** Oppgave-hub · tildelt-meg · oppgaver (+ detalj) · prosjekter · Notion-sync.

### `/admin/brief` · `/board` · `/oppfolging` · `/queue` · `/innboks` · `/kommunikasjon`
**Synlig:** Daglig AI-brief · coaching-board · oppfølging-pipeline · oppgave-kø · innboks · kommunikasjon-hub.

---

## 2. STALL — spillere, grupper, talent

### `/admin/stall` — Stall-oversikt
**Inngang:** Sidebar "Stall".
**Synlig:** HubFrame — komplett oversikt alle utøvere, snarvei spillere/grupper/talent.

### `/admin/spillere` — Alle spillere ★ NØKKEL
**Synlig:** Kort/tabell/tavle-toggle. Hver spiller: avatar, HCP, SG-trend, status, neste økt. Søk + filter.
**Knapper:** Spiller-kort → `/admin/spillere/[id]` · Ny spiller → `/admin/spillere/ny`

### `/admin/spillere/[id]` — Spiller-detalj (DetailShell)
**Synlig:** Spiller-hero + tabs: Profil · Plan · Analyse · Tester · **Workbench**.
**Knapper → destinasjon:**
| Tab/knapp | Går til |
|---|---|
| Profil | `/admin/spillere/[id]/profil` |
| **Workbench** | `/admin/spillere/[id]/workbench` ★ DELT KJERNE |
| Tester | `/admin/spillere/[id]/tester` |
| Tildel test | `/admin/spillere/[id]/tildel-test` |
| Plan-detalj | `/admin/spillere/[id]/plan/[planId]` |
| Rediger | `/admin/spillere/[id]/rediger` |

### `/admin/spillere/[id]/workbench` — Coach i spiller-Workbench ★ KJERNE
**Inngang:** Spiller-detalj "Workbench"-tab.
**Synlig:** NØYAKTIG samme Workbench som PlayerHQ (`/portal/planlegge/workbench`) + coach-handlinger på toppen: planlegg, endre trening, kommenter. **Endringer lagres på spillerens plan — propagerer til spilleren.**

### `/admin/grupper` + `/[id]` — Grupper
**Synlig:** Gruppeliste · gruppe-detalj (medlemmer, felles plan, gruppe-økter). Bytt spiller↔gruppe.

### `/admin/talent` (+ discovery/radar/kohort/region/ressurser/sammenligning/wagr)
**Synlig:** Talent-hub · discovery · radar (+ per spiller) · kohort · region-pipeline · ressurser · sammenligning · WAGR-benchmark + import.

---

## 3. PLANLEGGE — lage planer FOR spillerne

### `/admin/planlegge` — Plan-sentral (HubFrame)
**Synlig:** Snarvei planer/maler/drills/turneringer.

### `/admin/plans` + `/new` + `/[planId]` — Treningsplaner
**Synlig:** Alle planer · ny plan (AI-wizard) · plan-detalj.

### `/admin/plans/templates` (+ ny/rediger/effectiveness) — Plan-maler
**Synlig:** Mal-bibliotek · ny mal · rediger · mal-effektivitet.

### `/admin/drills` + `/[id]` (+ rediger) — Drill-bibliotek
**Synlig:** Drill-bibliotek (coach lager/redigerer) · detalj · rediger.

### `/admin/teknisk-plan` + `/[spillerId]` — Teknisk plan
**Synlig:** Teknisk plan-oversikt · per spiller.

### `/admin/tournaments` + `/ny` + `/[id]` + `/dubletter` — Turneringer ★ KONKURRANSEPLAN
**Inngang:** Sidebar "Turneringer".
**Synlig:**
- **Turneringskalender med uke/måned/år-visning**
- **Auto-populert:** hvilken turnering spilles helgen + hvilke spillere spiller hver
- Per turnering: deltakerliste (f.eks. 8 spillere)
- **"Send fellesmelding til alle deltakere"** → baneinfo/tips/råd/lykke-til
**Knapper → destinasjon:**
| Knapp | Går til / gjør |
|---|---|
| Uke/Måned/År-tabs | bytt kalendervisning |
| Turnering-klikk | `/admin/tournaments/[id]` (deltakere) |
| Send fellesmelding | melding til alle N deltakere |
| Ny turnering | `/admin/tournaments/ny` |
| Dubletter | `/admin/tournaments/dubletter` (rydd) |

```
┌──────────────────────────────────────────────────────────┐
│  TURNERINGER     [Uke] [Måned] [År]          [+ Ny]       │
│  ── DENNE HELGEN ──────────────────────────────────       │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Sørlandsåpent · Bortelid GK · 14–16 juni           │  │
│  │ Deltakere (8): Magnus, Kari, Per, Lina, Jonas...   │  │
│  │           [Send fellesmelding til alle 8 →]        │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ OLYO Juniortour · Huseby & Hankø · 21–22 juni      │  │
│  │ Deltakere (3): Anders, Emma, Noah                  │  │
│  │           [Send fellesmelding til alle 3 →]        │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### `/admin/okter` · `/videoer` · `/recording`
**Synlig:** Økter · video-bibliotek · opptak.

---

## 4. GJENNOMFØRE — daglig drift

### `/admin/gjennomfore` + `/okter/[id]` — Daglig drift (HubFrame)
**Synlig:** Dagens drift · økt-detalj.

### `/admin/kalender` + `/uke` + `/maned` — Kalender
**Synlig:** Uke/måned-visning av alle økter på tvers av spillere.

### `/admin/bookinger` + `/ny` — Bookinger
**Synlig:** Alle bookinger · opprett manuell booking (velg spiller/tjeneste/tid).

### `/admin/anlegg` + `/[id]` · `/availability` · `/kapasitet` · `/services` — Drift
**Synlig:** Anlegg + detalj · tilgjengelighet · kapasitet · tjenester/priser.

### `/admin/trackman` — TrackMan-sesjoner (på tvers)

### Live-økt (coach) — `/admin/live/[sessionId]/brief|active|summary`
**Synlig:** Coach-perspektiv: pre-brief (kommentar til spiller) · live-monitoring (send melding) · post-summary (vurdering 1–5 + notat).

---

## 5. INNSIKT — analyse på tvers

### `/admin/analysere` — Innsikt-hub (HubFrame)
### `/admin/analyse` — Stall-analyse · `/lag-snitt` — Lag-snitt
### `/admin/tester` + `/[id]` + `/foreslatte` + `/tildel/[spillerId]` — Tester
**Synlig:** Tester på tvers · test-detalj · foreslåtte (coach-godkjenning) · tildel.
### `/admin/foresporsler` — Økt-forespørsler · `/godkjenninger` + `/[id]` — Godkjenninger
**Synlig:** Spiller-forespørsler · godkjenn plan/endring (PlanAction-detalj: godkjenn/avslå/be om info).
### `/admin/reports` — Rapporter · `/runder` — Runder · `/tilstander` — Skader/sykdom
### `/admin/finance` — Finansiell oversikt
**Synlig:** MRR, utestående, fakturaer, abonnement-oversikt.

---

## 6. ADMIN — organisasjon og innstillinger

### `/admin/organisasjon` — Organisasjon-hub (HubFrame)
### `/admin/klubb/innstillinger` · `/integrasjoner` — Klubb + tilkoblinger
### `/admin/settings` (+ api/calendar/security/tilgang) — Innstillinger
### `/admin/team` + `/inviter` — Team
### `/admin/audit-log` + `/[id]` — Audit-log
### `/admin/agents` + `/[agentId]` — AI-agenter (admin)
### `/admin/email-templates` + `/[id]/rediger` — E-postmaler
### `/admin/profile` · `/reach` · `/hjelp` — Profil · reach · hjelp
### `/admin/godkjenn-portal` (+ koblinger/review) — Design-godkjenning (internt verktøy)

---

## Sammendrag — AgencyOS skjerm-hierarki

```
AgencyOS (COACHHQ · HEAD COACH)
├── /admin/agencyos ········ Operations cockpit (hjem) ★ NØKKEL
│   ├── /uka /spillere /okonomi /caddie
│   └── KPIer: Aktive · Økter · MRR · Utestående
├── WORKSPACE (Min uke)
│   └── /workspace ········· oppgaver/prosjekter/Notion
├── STALL
│   ├── /stall ············· komplett utøver-oversikt
│   ├── /spillere/[id] ····· DetailShell m/ Workbench-tab ★ DELT KJERNE
│   │   └── /workbench ····· coach opererer i spiller-Workbench
│   ├── /grupper ··········· bytt spiller↔gruppe
│   └── /talent ············ radar/WAGR/kohort
├── PLANLEGGE
│   ├── /plans + /templates  lage planer FOR spillerne
│   ├── /drills ············ bibliotek (lag/rediger)
│   └── /tournaments ······· KONKURRANSEPLAN ★ NØKKEL
│       └── uke/måned/år + auto-populert + FELLESMELDING
├── GJENNOMFØRE
│   ├── /kalender ·········· alle økter på tvers
│   ├── /bookinger ········· + manuell booking
│   ├── /anlegg /services ·· drift
│   └── /live/[id] ········· coach-perspektiv live
├── INNSIKT
│   ├── /analyse ··········· stall-analyse
│   ├── /godkjenninger ····· godkjenn spiller-planer
│   ├── /foresporsler ······ økt-forespørsler
│   └── /finance ··········· MRR + utestående
└── ADMIN
    ├── /organisasjon /settings /team
    └── /email-templates /agents /audit-log
```

**Status:** Manifest ferdig for AgencyOS.

---

## NYE skjermer som design-handover MÅ dekke (fra kontrolltårn-logikk)

Disse er nye/utvidede behov fra produktlogikken — sørg for at Claude Design tegner dem:

1. **Turneringskalender** med uke/måned/år + auto-populert helg-visning (ny skjerm-familie)
2. **Fellesmelding-flyt:** turnering → velg deltakere → komponér → send (ny flyt)
3. **Fokus-spiller-blokk:** manuell pin-mekanisme + AI-forslag-felt (utvidet komponent)
4. **Coach-i-Workbench:** delt PlayerHQ-Workbench + coach-handlingslag (gjenbruk + overlay)
5. **Spiller↔gruppe-veksler:** player-picker øverst, alltid tilgjengelig (ny chrome-komponent)
