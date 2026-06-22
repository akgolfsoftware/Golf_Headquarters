# PLAN — Gjenstående oppgaver + handover

> **Hva dette er:** én samlet, prioritert plan over alt som gjenstår — fra denne øktens arbeid, fra handover-designet, og fra de tidligere sporene (`SKJERM-STATUS.md`, `BYGGELOGG-FLAGG.md`, `AAPNE-SPORSMAAL.md`, `REGLER-OPPLAST-2026-06-22.md`).
>
> **Status etter 2026-06-22-øktene:** 335 av 362 reelle skjermer ferdige (93 %). Alle 13 «blokkerte» løst. 66 QA-launch-blokkere + admin-farge-tokenisering + 7 feature-knapp-grupper fikset. Det som står igjen er listet under — gruppert etter **hva som trengs for å komme videre.**
>
> **Slik leser du:** DEL 1–2 trenger en beslutning eller verdi fra deg (Anders) før noe kan bygges. DEL 3 kan jeg bygge nå uten input. DEL 4–6 er gjeld, utsatt arbeid og pre-lansering.

---

## DEL 1 — Krever en BESLUTNING fra deg (kan ikke bygges uten)

Disse er produkt-/design-/IA-valg. Jeg vil ikke gjette.

| # | Oppgave | Valget | Innsats etter valg |
|---|---|---|---|
| D1.1 | **Analyse «Hull»** (`/portal/analysere/hull`) | SG-sone-kart (bygd nå) ELLER hull-for-hull-tabell (handover). Kan sameksistere. | S–M |
| D1.2 | **AgencyOS Bookinger** | To ruter (liste + kapasitet, bygd) ELLER ett kombinert dashbord (handover). | M |
| D1.3 | **AgencyOS Planer** | Kanban-board (bygd) ELLER liste (handover). | S–M |
| D1.4 | **CBAC-modell** (AAPNE A2) | Bygge opp koden til 43 capabilities (skill-spec), ELLER nedskalere spec-en til dagens 10 + rolle-gating. Konkret hull i dag: COACH slipper inn på `/admin/okonomi` selv om finans skal være ADMIN. | M (opp) / S (ned) |
| D1.5 | **Agent-systemets dybde** (AAPNE A3) | Skal «Godkjenn» på et AI-forslag faktisk endre planen? (i dag bytter `acceptPlanAction` kun status). Skal det bygges en coach-godkjenningsinnboks? | M–L |
| D1.6 | **Booking ↔ live-økt-modell** | «Start økt» lager nå en frisk live-økt fra bookingen (defaults: innendørs/blokkpraksis). Skal en booking heller kobles til en allerede planlagt `TrainingSessionV2`? | M |
| D1.7 | **Metodikk-kanon** (AAPNE A1) | CS-skala (CS20/CS40?), CS-navn (Club Speed vs Confidence Score), LIFE-nøkler. Kode vs wiki er uenige. | S (bekreft) |

---

## DEL 2 — Venter på en VERDI/FORMEL fra deg

Bygd som plassholder — låses opp når du gir tallene (slik FYS-score ble).

| # | Oppgave | Hva mangler |
|---|---|---|
| D2.1 | **Helse: Belastning + HRV** | Formel/terskler (FYS-score er gitt; disse to gjenstår). Vises som «—» til da. |
| D2.2 | **Onboarding steg 6 «Her er du nå»** (BYGGELOGG B-2) | A–K-nivå er gitt, men trenger `SeasonStat`-schema (3-sesong-progresjon) før «du er her»-stigen kan vise ekte historikk. |
| D2.3 | **Cockpit SG-ticker + plan-etterlevelse** (BYGGELOGG A-1/A-3) | Aggregat-tall (stall-SG, per-spiller-SG-ticker) — referanseverdier/visning bekreftes. |

---

## DEL 3 — Kan BYGGES NÅ (ingen beslutning nødvendig)

Klare features med eksisterende eller grei ny infra. Jeg kan ta disse autonomt.

| # | Oppgave | Hva | Innsats |
|---|---|---|---|
| D3.1 | **Plan-skjerm: ekte drills** | Bytt hardkodet `DRILLS`-demo på `/admin/spillere/[id]/plan/[planId]` til planens ekte `positions[].tasks`. Låser opp per-drill «Rediger» (allerede halvkoblet). | S–M |
| D3.2 | **Spillerens «still spørsmål»-skjema** | `Question`-modellen + coach-svar er bygd; mangler skjermen der spilleren faktisk stiller spørsmålet. | S |
| D3.3 | **Gruppe-kalender** (`/admin/grupper/[id]`) | «Se alle / Detaljer / Åpne» peker på gruppe-time-plan-sider som ikke finnes. `GroupSchedule`-modell finnes. | M |
| D3.4 | **Eksport-generering** | Døde «Last ned / Eksporter»-knapper (faktura-PDF, runde-del, shot-by-shot). Trenger PDF-/CSV-generator. CSV-mønster finnes alt (kapasitet). | M |
| D3.5 | **Notion property-mapping** (`/admin/workspace/notion`) | «Ja, map nå»-knappen + felt-mapping-action mot ekte Notion-tilkobling. | M |
| D3.6 | **Region-spillertall** (`/stats/regions`) | Spillere/turneringer per region mangler kilde (klubber er ekte). Krever region-felt på `PublicPlayer`/`Tournament` eller bio-parsing. | M |
| D3.7 | **Anlegg rikt innhold** (`/portal/booking/anlegg/[id]`) | Specs/rating/bio finnes ikke på `Location`. Legg til felt → vis ekte. | S–M |
| D3.8 | **Reps-persistering** (AAPNE B1) | Live-økt lagrer reps til `sessionStorage`, ikke DB — overlever ikke nettleser-sesjon. Wire til DB. | M |
| D3.9 | **Raske handlinger** (`/admin/stats/overview`) | 4 knapper trigger cron/secret-rotasjon — trenger ekte trigger-actions. | S |

---

## DEL 4 — Teknisk gjeld / opprydding

Render-korrekt i dag, men bør ryddes før/etter lansering.

| # | Oppgave | Detalj |
|---|---|---|
| D4.1 | **Auth-side-gradienter** | `auth/login|signup|reset|forgot` bruker hardkodet mørk gradient (#0A1410) uten token. Egne mørke bakgrunner — vurder et auth-token eller behold bevisst. |
| D4.2 | **Ikke-brand custom hex** | ~15 steder med olive/warning-aktige hex (#4A5418, #B8852A, #7BA428) uten eksakt token. Krever nye tokens eller bevisst beholdes. |
| D4.3 | **A–K drill-retag** (BYGGELOGG A-2) | `kategoriFraHcp` (gammel A–L) vs `kategoriFraSnittscore` (ny A–K) gir ulik bokstav. Drill-tagger (`minKategori`/`maxKategori`) ble satt under gammelt system. Trenger re-tag-beslutning. |
| D4.4 | **Dublett-enums** (AAPNE B2) | `PRPress`/`PressureLevel`, `PracticeType`/`DrillPracticeType`, `SessionStatus`/`SessionStatusV2`. Rydd kun ved bevisst beslutning (migrasjons-risiko). |
| D4.5 | **Live-økt-defaults** | «Start økt» bruker nøytrale defaults (innendørs/blokkpraksis) for nye økter. Vurder å utlede fra booking-serviceType. |

---

## DEL 5 — Bevisst utsatt (post-beta) — IKKE bygg uten signal

De 9 stubbene + 18 plassholderne. De fleste venter med vilje.

| Skjerm | Status |
|---|---|
| `/auth/bankid` | BankID-integrasjon — post-beta |
| `/portal/meg/innstillinger/ai-coach` | AI-coach V2 — post-beta |
| `/portal/meg/innstillinger/okter` | Enhets-liste — «kommer Q3 2026» |
| `/forelder/coach` | Coach-dialog — «kommer Q3 2026» |
| `/portal/meg/innstillinger/integrasjoner` | Spiller-Google-Calendar-OAuth: callback må rolle-rutes + spiller-side push bygges (backend) |
| `/admin/kommunikasjon`, `/admin/agencyos/caddie`, `/admin/stats/moderering`, `/portal/reach` | Mangler datamodell — venter på beslutning om de skal bygges |
| `/offline` | Statisk offline-side — bevisst enkel |
| 18 INTENTIONAL | Plassholdere (bl.a. Belastning/HRV = D2.1) |

---

## DEL 6 — Før lansering (innhold + verifisering)

| # | Oppgave | Detalj |
|---|---|---|
| D6.1 | **Marketing-innhold** (BYGGELOGG C-1) | Testimonial-/case-tall må bekreftes ekte før prod. |
| D6.2 | **Forretningstall** (AAPNE A5) | 3 MNOK 2026 / AI Coach $10M ARR — bekreft eller korriger (kun i CLAUDE.md i dag). |
| D6.3 | **Full design-gate** | Adversarial pikseldiff mot handover er kun kjørt på en håndfull skjermer. De fleste er «bygd + fungerer», ikke gate-godkjent mot fasit. |
| D6.4 | **Live-flyt-test** | Booking → «Start økt» → live-konsoll → oppfølging er nå koblet, men ikke ende-til-ende-testet i nettleser. |
| D6.5 | **Prod-deploy + Stripe live** | HARD STOPP — gjøres bevisst av Anders, ikke autonomt. |

---

## Anbefalt rekkefølge (min vurdering)

1. **Du tar DEL 1-valgene** (særlig D1.1–D1.3 design-gaflene + D1.4 CBAC-finanshull = en reell sikkerhetslekkasje).
2. **Gi verdiene i DEL 2** når du har dem (Belastning/HRV, SeasonStat).
3. **Jeg kjører DEL 3** parallelt (D3.1 plan-drills + D3.2 spørsmål-skjema er raskest og lukker tråder fra i dag).
4. **DEL 4 gjeld** ryddes løpende; **DEL 6** rett før lansering.
5. **DEL 5** rører vi ikke uten ditt signal.

*Sist oppdatert 2026-06-22. Hold denne i sync med `SKJERM-STATUS.md` (skjerm-status) og `AAPNE-SPORSMAAL.md` (beslutninger).*
