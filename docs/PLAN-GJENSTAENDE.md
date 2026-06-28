# PLAN — Gjenstående oppgaver + handover

> **Hva dette er:** én samlet, prioritert plan over alt som gjenstår — fra denne øktens arbeid, fra handover-designet, og fra de tidligere sporene (`arkiv/SKJERM-STATUS.md`, `arkiv/BYGGELOGG-FLAGG.md`, `AAPNE-SPORSMAAL.md`, `REGLER-OPPLAST-2026-06-22.md`).
>
> **Status etter 2026-06-22-øktene:** 335 av 362 reelle skjermer ferdige (93 %). Alle 13 «blokkerte» løst. 66 QA-launch-blokkere + admin-farge-tokenisering + 7 feature-knapp-grupper fikset. Det som står igjen er listet under — gruppert etter **hva som trengs for å komme videre.**
>
> **Slik leser du:** DEL 1–2 trenger en beslutning eller verdi fra deg (Anders) før noe kan bygges. DEL 3 kan jeg bygge nå uten input. DEL 4–6 er gjeld, utsatt arbeid og pre-lansering.

---

## DEL 1 — Krever en BESLUTNING fra deg (kan ikke bygges uten)

Disse er produkt-/design-/IA-valg. Jeg vil ikke gjette.

| # | Oppgave | Valget | Innsats etter valg |
|---|---|---|---|
| ~~D1.1~~ ✅ | **Analyse «Hull»** — LØST 2026-06-22 (commit 62be389f) | **Begge:** sone-kart beholdt + «Hull for hull»-tabell lagt til som fane. | Ferdig |
| ~~D1.2~~ ✅ | **AgencyOS Bookinger** — LØST 2026-06-22 (commit 62be389f) | **Slått sammen:** ett «Bookinger & kapasitet»-dashbord; /admin/kapasitet redirecter. | Ferdig |
| ~~D1.3~~ ✅ | **AgencyOS Planer** — LØST 2026-06-22 | **Behold kanban-board** (ingen endring). | Ferdig |
| ~~D1.4~~ ✅ | **CBAC-modell** (AAPNE A2) | **3 capability-hull LUKKET 2026-06-22:** finans (`VIEW_FINANCE`), anlegg (`MANAGE_FACILITIES`) og team/organisasjon (`MANAGE_USERS`) gates nå på capability (ADMIN-only) via `requireCapability`, og nav-lenkene skjules for COACH. **BESLUTTET 2026-06-23:** behold dagens 10 capabilities (ikke bygg ut til 43 — finmasking tas først når et reelt behov treffer). | Ferdig |
| ~~D1.5~~ ✅ | **Agent-systemets dybde** (AAPNE A3) | **LØST 2026-06-28:** «Godkjenn» på et PYRAMID_ADJUST-forslag setter nå planens mål-allokering (`TrainingPlan.targetAllocation`) via `applyAcceptedPlanAction` — reell, sporbar plan-endring (ikke bare status). plan-watcher måler adherence mot planens eget mål. Coach-godkjenningsinnboks fantes allerede (`/admin/godkjenninger`: godkjenn/avslå/be om mer info + revisjons-spor). Rådgivende typer flippes trygt. 7 enhetstester. | Ferdig |
| ~~D1.6~~ ✅ | **Booking ↔ live-økt-modell** | **LØST 2026-06-23:** «Start økt» foretrekker nå en allerede planlagt økt (PLANNED, samme spiller, i tidsvinduet) ved ENTYDIG treff — coachens forarbeid åpnes i konsollen. 0/flere treff → trygg fallback til frisk økt. Auto-utledning av *miljø* fra booket sted droppet (M0–M5 = metodikk-koder uten definert kobling → D1.7). | Ferdig |
| ~~D1.7~~ ✅ | **Metodikk-kanon** (AAPNE A1) | **BESLUTTET 2026-06-23:** (1) CS-skala = behold kode **CS50–CS100** (app); CS20/CS40-metodikk bevart i wiki som kjent app-grense. (2) CS = **Club Speed** (rettet «Confidence Score»-feil i DATA-MODEL.md). (3) LIFE = **wiki-nøklene** SELV/SOS/EMO/KAR/RES — `taxonomy.ts` rettet fra kodens gamle 5. | Ferdig |

---

## DEL 2 — Venter på en VERDI/FORMEL fra deg

Bygd som plassholder — låses opp når du gir tallene (slik FYS-score ble).

| # | Oppgave | Hva mangler |
|---|---|---|
| ~~D2.1~~ ⚠ | **Helse: Belastning + HRV** | ✅ **Belastning LØST 2026-06-28** — selv-relativ ACWR (siste uke vs 4-ukers snitt, `src/lib/health/belastning.ts`), ingen hardkodede terskler. ❌ **HRV: data-blokkert** — `HealthEntry` har ingen HRV-felt; krever ny datakilde (wearable-sync ELLER manuelt HRV-felt) før det kan vises. Ikke en formel som mangler. |
| D2.2 | **Onboarding steg 6 «Her er du nå»** (BYGGELOGG B-2) | A–K-nivå er gitt, men trenger `SeasonStat`-schema (3-sesong-progresjon) før «du er her»-stigen kan vise ekte historikk. |
| D2.3 | **Cockpit SG-ticker + plan-etterlevelse** (BYGGELOGG A-1/A-3) | Aggregat-tall (stall-SG, per-spiller-SG-ticker) — referanseverdier/visning bekreftes. |

---

## DEL 3 — Kan BYGGES NÅ (ingen beslutning nødvendig)

Klare features med eksisterende eller grei ny infra. Jeg kan ta disse autonomt.

| # | Oppgave | Hva | Status |
|---|---|---|---|
| ~~D3.1~~ ✅ | **Plan-skjerm: ekte drills** | Hardkodet `DRILLS`-demo byttet til ekte `positions[].tasks`; «Rediger»/«Slett» låst opp. | Ferdig (5b424d13) |
| ~~D3.2~~ ✅ | **Spillerens «still spørsmål»-skjema** | Ny `/portal/coach/sporsmal/ny` + `stillSporsmal`-action (coach via PlayerEnrollment). | Ferdig (5b424d13) |
| ~~D3.3~~ ✅ | **Gruppe-kalender** | Ny `/admin/grupper/[id]/timeplan` (ekte GroupSchedule); 3 knapper koblet. | Ferdig (5b424d13) |
| ~~D3.4~~ ✅ | **Eksport-generering** | Ekte faktura-PDF (`@react-pdf`) + e-post (Resend) fra ekte Payment-data. | Ferdig (4d851c95) |
| ~~D3.9~~ ✅ | **Raske handlinger** | «Sjekk DB-helse» koblet (read-only ping). 3 andre (PGA-sync/roundup/CRON_SECRET) bevisst inaktive + merket — sensitive/utadvendte, kjøres fra ops. | Delvis (adb10c72) |
| D3.5 | **Notion property-mapping** (`/admin/workspace/notion`) | Spesialisert: krever Notion-tilkoblingens database-skjema + felt-mapping-UI. Sync-infra finnes, men mapping-konfig er eget arbeid. | Venter (spesialisert) |
| D3.6 | **Region-spillertall** (`/stats/regions`) | Trenger region-felt + EKTE kilde. Region-matching = gjetting i dag → ville vist tomme/gjettede tall. | Blokkert (mangler data) |
| D3.7 | **Anlegg rikt innhold** (`/portal/booking/anlegg/[id]`) | Skjermen utelater ærlig specs/rating/bio i dag (ikke fabrikert). Å legge til felt gir tomme felt uten redigerings-UI + ditt innhold. | Blokkert (mangler innhold) |
| D3.8 | **Reps-persistering** (AAPNE B1) | PARKERT — bevisst senere beslutning (to live-økt-spor sameksisterer med vilje). Rør ikke autonomt. | Parkert (din beslutning) |

---

## DEL 4 — Teknisk gjeld / opprydding

Render-korrekt i dag, men bør ryddes før/etter lansering.

| # | Oppgave | Detalj |
|---|---|---|
| D4.1 | **Auth-side-gradienter** | `auth/login|signup|reset|forgot` bruker hardkodet mørk gradient (#0A1410) uten token. Egne mørke bakgrunner — vurder et auth-token eller behold bevisst. |
| D4.2 | **Ikke-brand custom hex** | ~15 steder med olive/warning-aktige hex (#4A5418, #B8852A, #7BA428) uten eksakt token. Krever nye tokens eller bevisst beholdes. |
| D4.3 | **A–K drill-retag** (BYGGELOGG A-2) | `kategoriFraHcp` (gammel A–L) vs `kategoriFraSnittscore` (ny A–K) gir ulik bokstav. Drill-tagger (`minKategori`/`maxKategori`) ble satt under gammelt system. Trenger re-tag-beslutning. |
| D4.4 | **Dublett-enums** (AAPNE B2) | `PRPress`/`PressureLevel`, `PracticeType`/`DrillPracticeType`, `SessionStatus`/`SessionStatusV2`. Rydd kun ved bevisst beslutning (migrasjons-risiko). |
| D4.5 | **Live-økt-defaults** | Frisk-økt-fallbacken bruker nøytrale defaults (M0/BLOKK). Auto-utledning fra booket sted er IKKE rent mulig: `ServiceType` har ingen miljø-felt, og `FacilityType` (STUDIO/COURSE…) → `MMiljo` (M0–M5) krever en metodikk-kobling som ikke finnes. Blokkert på D1.7, ikke serviceType. |

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

## DEL 3 — status etter bygging (2026-06-22)

**5 av 9 tatt** (D3.1–D3.4 ferdig + D3.9 delvis). De 4 gjenstående er IKKE «late
oppgaver» — hver har en reell blokker som ikke skal løses ved å gjette eller
fabrikere:
- **D3.5 Notion-mapping** — spesialisert integrasjons-konfig (krever Notion-DB-skjemaet).
- **D3.6 region-tall** — ingen ekte region-kilde; ville blitt gjettede tall.
- **D3.7 anlegg-innhold** — ville lagt til tomme felt uten redigerings-UI + ditt innhold.
- **D3.8 reps** — bevisst parkert beslutning (AAPNE B1).

Si fra hvis du vil at jeg skal bygge scaffolding for D3.6/D3.7 (tomme-men-klare felt
+ admin-redigering) eller ta Notion-mappingen (D3.5) — de er byggbare, men gir ikke
verdi før det finnes ekte data/innhold å vise.

*Sist oppdatert 2026-06-22. Hold denne i sync med `MASTER-SKJERMPLAN.md` (skjerm-status) og `AAPNE-SPORSMAAL.md` (beslutninger).*
