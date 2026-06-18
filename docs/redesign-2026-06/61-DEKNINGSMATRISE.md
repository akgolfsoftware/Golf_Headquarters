# 61 — Dekningsmatrise: design-status per rute

> **TO AKSER — les dette FØR du tolker statusene:**
> `MASTER-SKJERMPLAN`s Design-hake (✓/~/–) = skjermen er **BYGD** i appen (gammel athletic-stil).
> Dekningsmatrisens `NY-HYBRID` = skjermen har et **HYBRID-design i 17.juni-handoffen** (ikke bygd ennå).
> Dette er TO separate akser som ikke skal sammenblandes. Der `MASTER=Design–` men matrisen=`NY-HYBRID`,
> er det forventet: MASTER-haken oppdateres til hybrid **UNDER porting** (per runbook, steg 7), og skjermen
> skal **portes fra handoffen**, IKKE sendes til Claude Design.
> Ved spørsmål om «har vi hybrid-design for denne skjermen»: **dekningsmatrisen vinner**.
> (Gjelder bl.a. `/portal/coach*`, `/auth/reset-password`, `/auth/check-email`,
> `/admin/agencyos/uka`, `/admin/coach-workbench`, `/admin/planlegge`.)

> **Formål:** Per produkt — alle unike skjermer/ruter med 5-status-taksonomi.
> **Kilde:** handoff-JSON (17. juni 2026) + `docs/MASTER-SKJERMPLAN.md` (Design=✓/~/– per rute).
> **Laget:** 17. juni 2026. **Korrigert:** 17. juni 2026 (kritiker-gjennomgang — 5-status-taksonomi).
>
> **STATUS-koder (5-taksonomi):**
> - `NY-HYBRID` — designet i 17.juni-handoffen (klar til porting fra `.dc.html`). Undertype: `DELVIS` = handoffen dekker ruten som én fane/tilstand i en større skjerm.
> - `RE-SKIN` — Design=✓ i `MASTER-SKJERMPLAN.md` (bygd i gammel athletic-stil), MEN IKKE i 17.juni-handoffen. Skal re-skinnes til hybrid-stil ved å bruke ny token-palett og komponent-galleri. **MÅ ALDRI sendes til Claude Design / overskrives blindt** — fungerende kode beholdes, kun utseende oppdateres.
> - `TRENGER-DESIGN` — Design=– i MASTER OG ikke i handoffen. Sendes til Claude Design fra null.
> - `UTSATT` — bevisst utsatt (Talent/Elite Fase 2 per MASTER-SKJERMPLAN). Ikke i scope nå.
> - `EGET-SPOR` — stats-plattformen (~50 ruter), behandles som eget design-prosjekt.
> - `REDIRECT/LEGACY` — skal fjernes/slås sammen, trenger ikke nytt design.
>
> **Viktig distinksjon — RE-SKIN vs. TRENGER-DESIGN:**
> RE-SKIN-skjermer er allerede designet og implementert (ekte data, 6 haker grønne eller nær). De trenger IKKE nytt Claude Design-arbeid — de re-skinnes ved token-migrering og komponent-galleri-oppdatering. Det reelle «trenger nytt design»-tallet (TRENGER-DESIGN) er derfor MYE lavere enn 282.

---

## 1 — PlayerHQ (`/portal`)

### 1a — Hjem og varsler

| Skjerm/rute | Status | Handoff-fil (forkortet) |
|---|---|---|
| `/portal` | NY-HYBRID | `PlayerHQ Hjem (hybrid).dc.html` |
| `/portal/varsler` | NY-HYBRID | `PlayerHQ Varsler (hybrid).dc.html` |

**Opptelling 1a: 2 NY-HYBRID, 0 gjenstår**

---

### 1b — Gjennomføre (inkl. live-økt)

| Skjerm/rute | Status | Handoff-fil |
|---|---|---|
| `/portal/gjennomfore` | NY-HYBRID | `PlayerHQ Gjennomføre (hybrid).dc.html` |
| `/portal/gjennomfore/[id]` (økt-detalj) | NY-HYBRID (DELVIS — dekkes av Gjennomføre-skjermen) | `PlayerHQ Gjennomføre (hybrid).dc.html` |
| `/portal/(fullscreen)/live/[sessionId]/brief` | NY-HYBRID | `PlayerHQ Live-økt (hybrid).dc.html` |
| `/portal/(fullscreen)/live/[sessionId]/active` | NY-HYBRID | `PlayerHQ Live-økt (hybrid).dc.html` |
| `/portal/(fullscreen)/live/[sessionId]/summary` | NY-HYBRID | `PlayerHQ Live-økt (hybrid).dc.html` |
| `/portal/(fullscreen)/live/[sessionId]/logger` | RE-SKIN (Design=~ i MASTER) | — |
| `/portal/(fullscreen)/live/[sessionId]/tapper` | RE-SKIN (Design=~ i MASTER) | — |
| `/portal/trening/logg` | RE-SKIN (Design=✓ i MASTER) | — |
| `/portal/trening/putte-laboratoriet` | RE-SKIN (Design=✓ i MASTER) | — |
| `/portal/trening/break-tabell` | RE-SKIN (Design=✓ i MASTER) | — |
| `/portal/ny-okt` | TRENGER-DESIGN | — |
| `/portal/onskeligokt` | TRENGER-DESIGN | — |
| `/portal/onskeligokt/bekreftet` | TRENGER-DESIGN | — |
| `/portal/kalender` | TRENGER-DESIGN | — |
| `/portal/tren/kalender` | TRENGER-DESIGN | — |
| `/portal/(fullscreen)/tren` | TRENGER-DESIGN | — |
| `/portal/tren/[sessionId]` | TRENGER-DESIGN | — |
| `/portal/tren/[sessionId]/planlagt` | TRENGER-DESIGN | — |
| `/portal/tren/feiring/[planId]` | TRENGER-DESIGN | — |

| `/portal/(fullscreen)/test/[testId]/live` | TRENGER-DESIGN (Design=– i MASTER, ikke i handoff) | — |
| `/portal/(fullscreen)/test/[testId]/summary` | TRENGER-DESIGN (Design=– i MASTER, ikke i handoff) | — |

**Opptelling 1b: 5 NY-HYBRID, 5 RE-SKIN, 11 TRENGER-DESIGN**

---

### 1c — Planlegge og Workbench

| Skjerm/rute | Status | Handoff-fil |
|---|---|---|
| `/portal/planlegge` | NY-HYBRID | `Workbench Interaktiv.dc.html` + `Workbench Dashboard.dc.html` |
| `/portal/planlegge/workbench` | NY-HYBRID | `Workbench Interaktiv.dc.html` + `Workbench Dashboard.dc.html` |
| `/portal/tren/aarsplan` | NY-HYBRID (DELVIS — i Workbench Interaktiv; RE-SKIN for eksisterende kode) | `Workbench Interaktiv.dc.html` |
| `/portal/tren/aarsplan/periode/[id]/rediger` | NY-HYBRID (DELVIS — PeriodeEditor-panel) | `Workbench Interaktiv.dc.html` |
| `/portal/tren/teknisk-plan` | TRENGER-DESIGN (Design=– i MASTER, ikke i handoff — RE-SKIN krever Design=✓) | — |
| `/portal/tren/teknisk-plan/[planId]` | TRENGER-DESIGN (Design=– i MASTER, ikke i handoff) | — |
| `/portal/tren/fys-plan` | TRENGER-DESIGN | — |
| `/portal/tren/fys-plan/[planId]` | TRENGER-DESIGN | — |
| `/portal/drills` | NY-HYBRID | `PlayerHQ Drills (hybrid).dc.html` |
| `/portal/drills/[id]` | RE-SKIN (Design=✓ i MASTER; listen er designet i handoff men detalj-siden ikke) | — |
| `/portal/mal` (Mål-hub) | TRENGER-DESIGN | — |
| `/portal/mal/bygger` | TRENGER-DESIGN | — |
| `/portal/mal/goal/[id]` | TRENGER-DESIGN | — |
| `/portal/mal/milepaeler` | TRENGER-DESIGN | — |
| `/portal/mal/leaderboard` | TRENGER-DESIGN | — |
| `/portal/tren/turneringer` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/portal/tren/turneringer/[id]` | TRENGER-DESIGN | — |
| `/portal/tren/turneringer/ny` | TRENGER-DESIGN | — |
| `/portal/utfordringer` | TRENGER-DESIGN | — |
| `/portal/utfordringer/[id]` | TRENGER-DESIGN | — |
| `/portal/utfordringer/ny` | TRENGER-DESIGN | — |
| `/portal/ai/mal-bygger` | TRENGER-DESIGN | — |
| `/portal/ai/foresla-drill` | TRENGER-DESIGN | — |
| `/portal/ai/foresla-turnering` | TRENGER-DESIGN | — |

**Opptelling 1c: 5 NY-HYBRID, 3 RE-SKIN, 16 TRENGER-DESIGN**

> Merk om `/portal/mal`-treet: sg-hub, runder, trackman-liste har Design=✓ i MASTER (RE-SKIN). Resten (mål-hub, bygger, milepaeler, leaderboard, baner) har Design=– og er TRENGER-DESIGN.

---

### 1d — Analysere

| Skjerm/rute | Status | Handoff-fil |
|---|---|---|
| `/portal/analysere` | NY-HYBRID | `PlayerHQ Analyse (hybrid).dc.html` (SG + Runder-fanene) |
| `/portal/analysere/hull` | RE-SKIN (Design=~ i MASTER) | — |
| `/portal/statistikk` | NY-HYBRID | `PlayerHQ Analyse (hybrid).dc.html` (SG-fanen) |
| `/portal/statistikk/[metric]` | TRENGER-DESIGN | — |
| `/portal/statistikk/sammenlign` | TRENGER-DESIGN | — |
| `/portal/statistikk/runder/[runId]/del` | TRENGER-DESIGN | — |
| `/portal/mal/sg-hub` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/portal/mal/sg-hub/[club]` | TRENGER-DESIGN | — |
| `/portal/mal/sg-hub/benchmark` | TRENGER-DESIGN | — |
| `/portal/mal/sg-hub/best-vs-now` | TRENGER-DESIGN | — |
| `/portal/mal/sg-hub/equipment` | TRENGER-DESIGN | — |
| `/portal/mal/sg-hub/yardage` | TRENGER-DESIGN | — |
| `/portal/mal/sg-hub/conditions` | TRENGER-DESIGN | — |
| `/portal/mal/sg-hub/strategy` | TRENGER-DESIGN | — |
| `/portal/mal/sg-hub/coach/[spillerId]` | TRENGER-DESIGN | — |
| `/portal/mal/sg-hub/coach/[spillerId]/[club]` | TRENGER-DESIGN | — |
| `/portal/mal/sg-hub/coach/[spillerId]/equipment` | TRENGER-DESIGN | — |
| `/portal/mal/runder` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/portal/mal/runder/[id]` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/portal/mal/runder/[id]/shot-by-shot` | TRENGER-DESIGN | — |
| `/portal/mal/runder/[id]/slag` | RE-SKIN (Design=– men ekte data + funker per MASTER) | — |
| `/portal/mal/runder/ny` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/portal/trackman/[sessionId]` | NY-HYBRID | `PlayerHQ Analyse (hybrid).dc.html` (TrackMan-fanen) + `Workbench Trackman.dc.html` |
| `/portal/mal/trackman` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/portal/mal/trackman/[id]` | TRENGER-DESIGN | — |
| `/portal/mal/statistikk` | TRENGER-DESIGN | — |
| `/portal/tren/tester` | NY-HYBRID | `PlayerHQ Analyse (hybrid).dc.html` (Tester-fanen) |
| `/portal/tren/tester/[testId]` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/portal/tren/tester/[testId]/gjennomfor` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/portal/tren/tester/katalog` | TRENGER-DESIGN | — |
| `/portal/tren/tester/ny` | TRENGER-DESIGN | — |
| `/portal/tren/tester/ny/egen` | TRENGER-DESIGN | — |
| `/portal/mal/baner` | TRENGER-DESIGN | — |
| `/portal/mal/baner/[id]` | TRENGER-DESIGN | — |

**Opptelling 1d: 4 NY-HYBRID, 10 RE-SKIN, 20 TRENGER-DESIGN**

> sg-hub (hub), runder (liste/detalj/ny), trackman-liste, tester-detalj/gjennomforing = RE-SKIN (Design=✓ i MASTER). Undersider og detalj-sider som ikke har vært gjennom design-gate = TRENGER-DESIGN.

---

### 1e — Coach-seksjonen

| Skjerm/rute | Status | Handoff-fil |
|---|---|---|
| `/portal/coach` | NY-HYBRID | `PlayerHQ Coach (hybrid).dc.html` |
| `/portal/coach/[coachId]` | TRENGER-DESIGN | — |
| `/portal/coach/melding` | NY-HYBRID | `PlayerHQ Coach (hybrid).dc.html` |
| `/portal/coach/melding/ny` | TRENGER-DESIGN | — |
| `/portal/coach/melding/[id]` | NY-HYBRID | `PlayerHQ Coach (hybrid).dc.html` |
| `/portal/coach/melding/[id]/vedlegg` | TRENGER-DESIGN | — |
| `/portal/coach/plans` | TRENGER-DESIGN | — |
| `/portal/coach/plans/[planId]` | TRENGER-DESIGN | — |
| `/portal/coach/plans/[planId]/ny-okt` | TRENGER-DESIGN | — |
| `/portal/coach/plans/perioder` | TRENGER-DESIGN | — |
| `/portal/coach/ovelser` | TRENGER-DESIGN | — |
| `/portal/coach/ovelser/ny` | TRENGER-DESIGN | — |
| `/portal/coach/ovelser/[id]/rediger` | TRENGER-DESIGN | — |
| `/portal/coach/videoer` | TRENGER-DESIGN | — |
| `/portal/coach/notes` | TRENGER-DESIGN | — |
| `/portal/coach/notes/[noteId]` | TRENGER-DESIGN | — |
| `/portal/coach/sporsmal/[id]` | TRENGER-DESIGN | — |
| `/portal/coach/ai` | TRENGER-DESIGN | — |

**Opptelling 1e: 3 NY-HYBRID, 0 RE-SKIN, 15 TRENGER-DESIGN**

---

### 1f — Meg (profil og innstillinger)

| Skjerm/rute | Status | Handoff-fil |
|---|---|---|
| `/portal/meg` | NY-HYBRID | `PlayerHQ Meg (hybrid).dc.html` |
| `/portal/meg/profil` | NY-HYBRID (DELVIS — i Meg-skjerm) | `PlayerHQ Meg (hybrid).dc.html` |
| `/portal/meg/abonnement` | NY-HYBRID (DELVIS — i Meg-skjerm) | `PlayerHQ Meg (hybrid).dc.html` |
| `/portal/meg/abonnement/oppgrader` | TRENGER-DESIGN | — |
| `/portal/meg/abonnement/oppgrader/flyt` | TRENGER-DESIGN | — |
| `/portal/meg/abonnement/avbestill` | TRENGER-DESIGN | — |
| `/portal/meg/abonnement/kort/ny` | TRENGER-DESIGN | — |
| `/portal/meg/abonnement/faktura/[id]` | TRENGER-DESIGN | — |
| `/portal/meg/bookinger` | TRENGER-DESIGN | — |
| `/portal/meg/bookinger/reschedule/[bookingId]` | TRENGER-DESIGN | — |
| `/portal/meg/helse` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/portal/meg/helse/symptom/ny` | TRENGER-DESIGN | — |
| `/portal/meg/innstillinger` | NY-HYBRID (DELVIS — i Meg-skjerm) | `PlayerHQ Meg (hybrid).dc.html` |
| `/portal/meg/innstillinger/varsler` | TRENGER-DESIGN | — |
| `/portal/meg/innstillinger/personvern` | TRENGER-DESIGN | — |
| `/portal/meg/innstillinger/sikkerhet` | TRENGER-DESIGN | — |
| `/portal/meg/innstillinger/sprak` | TRENGER-DESIGN | — |
| `/portal/meg/innstillinger/anlegg` | TRENGER-DESIGN | — |
| `/portal/meg/innstillinger/integrasjoner` | TRENGER-DESIGN | — |
| `/portal/meg/innstillinger/eksport` | TRENGER-DESIGN | — |
| `/portal/meg/innstillinger/okter` | TRENGER-DESIGN | — |
| `/portal/meg/sikkerhet` | TRENGER-DESIGN | — |
| `/portal/meg/sikkerhet/2fa` | TRENGER-DESIGN | — |
| `/portal/meg/utstyrsbag` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/portal/meg/dokumenter` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/portal/meg/foreldre` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/portal/meg/feedback` | TRENGER-DESIGN | — |
| `/portal/meg/help` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/portal/meg/help/artikkel/[slug]` | TRENGER-DESIGN | — |
| `/portal/meg/help/kategori/[slug]` | TRENGER-DESIGN | — |
| `/portal/meg/help/kontakt` | TRENGER-DESIGN | — |

**Opptelling 1f: 4 NY-HYBRID, 5 RE-SKIN, 22 TRENGER-DESIGN**

---

### 1g — Booking (portal)

| Skjerm/rute | Status | Handoff-fil |
|---|---|---|
| `/portal/booking` | NY-HYBRID | `PlayerHQ Booking (hybrid).dc.html` |
| `/portal/booking/ny` | NY-HYBRID | `PlayerHQ Booking (hybrid).dc.html` |
| `/portal/booking/ny/bekreft` | TRENGER-DESIGN | — |
| `/portal/booking/[bookingId]` | TRENGER-DESIGN | — |
| `/portal/booking/coach/[coachId]` | TRENGER-DESIGN | — |
| `/portal/booking/anlegg/[anleggId]` | TRENGER-DESIGN | — |
| `/portal/booking/bekreftet` | TRENGER-DESIGN | — |

**Opptelling 1g: 2 NY-HYBRID, 0 RE-SKIN, 5 TRENGER-DESIGN**

---

### 1h — Talent

> **UTSATT — Elite Fase 2** (per MASTER-SKJERMPLAN merknad linje 290). Disse adressene finnes i koden men er ikke prioritert nå. Talent i 17.juni-handoffen er designet, men MASTER markerer hele seksjonen som bevisst utsatt. Bør IKKE portes i Bølge 1 uten eksplisitt Anders-beslutning.

| Skjerm/rute | Status | Handoff-fil |
|---|---|---|
| `/portal/talent` | UTSATT (NY-HYBRID når aktivert — designet i handoff) | `PlayerHQ Talent (hybrid).dc.html` |
| `/portal/talent/min-plan` | UTSATT (NY-HYBRID DELVIS når aktivert) | `PlayerHQ Talent (hybrid).dc.html` |
| `/portal/talent/mitt-niva` | UTSATT (NY-HYBRID DELVIS når aktivert) | `PlayerHQ Talent (hybrid).dc.html` |
| `/portal/talent/roadmap` | UTSATT (NY-HYBRID DELVIS når aktivert) | `PlayerHQ Talent (hybrid).dc.html` |
| `/portal/talent/sammenligning` | UTSATT (TRENGER-DESIGN når aktivert) | — |

**Opptelling 1h: 5 UTSATT**

---

### 1i — Øvrige portal-ruter

| Skjerm/rute | Status | Handoff-fil |
|---|---|---|
| `/portal/reach` | TRENGER-DESIGN | — |
| `/portal/agent-pipeline` | TRENGER-DESIGN | — |
| `/portal/spiller/[spillerId]` | TRENGER-DESIGN | — |
| `/portal/stats` | REDIRECT — fjernes | — |
| `/portal/analyse` | REDIRECT — fjernes | — |
| `/portal/tren/ovelser` | REDIRECT — fjernes | — |

**Opptelling 1i: 3 TRENGER-DESIGN, 3 REDIRECT**

---

### PlayerHQ TOTALOPPTELLING

| Kategori | Antall ruter |
|---|---|
| **NY-HYBRID** (klar til porting fra .dc.html) | **~25** |
| **RE-SKIN** (Design=✓ i MASTER, gammel athletic → oppdateres med ny palett) | **~19** |
| **TRENGER-DESIGN** (Design=– og ikke i handoff → Claude Design fra null) | **~88** |
| **UTSATT** (Talent/Elite Fase 2) | **5** |
| Redirect/legacy (fjernes) | ~6 |
| **Sum ekte produkt-ruter** | **~143** |

> **Viktig:** «Trenger Claude Design»-tallet er ~88, IKKE 113. De 19 RE-SKIN-rutene trenger ikke nytt design — de re-skinnes via token-migrering og komponent-galleri. RE-SKIN-ruter inkluderer: sg-hub, runder/*, trackman-liste, tester-detalj/gjennomforing, logg/putte-lab/break-tabell, turneringer, utstyrsbag/dokumenter/helse/foreldre/help/drills[id].

---

## 2 — AgencyOS (`/admin`)

### 2a — Oversikt og cockpit

| Skjerm/rute | Status | Handoff-fil |
|---|---|---|
| `/admin/agencyos` (cockpit) | NY-HYBRID | `AgencyOS Cockpit (hybrid).dc.html` |
| `/admin/agencyos/uka` | NY-HYBRID (DELVIS — tett koblet til Cockpit) | `AgencyOS Cockpit (hybrid).dc.html` |
| `/admin/agencyos/caddie` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/admin/agencyos/caddie/aktivitet` | TRENGER-DESIGN | — |
| `/admin/agencyos/okonomi` | REDIRECT/LEGACY-DUP (fjernes) | — |
| `/admin/agencyos/spillere` | RE-SKIN (Design=✓ i MASTER, ikke i handoff — snarvei) | — |
| `/admin/innboks` | NY-HYBRID | `AgencyOS Handlingssenter (hybrid).dc.html` |
| `/admin/kommunikasjon` | NY-HYBRID | `AgencyOS Handlingssenter (hybrid).dc.html` |
| `/admin/queue` | NY-HYBRID | `AgencyOS Handlingssenter (hybrid).dc.html` |
| `/admin/foresporsler` | NY-HYBRID | `AgencyOS Handlingssenter (hybrid).dc.html` |
| `/admin/godkjenninger` | NY-HYBRID | `AgencyOS Handlingssenter (hybrid).dc.html` |
| `/admin/godkjenninger/[id]` | TRENGER-DESIGN | — |
| `/admin/messages` | REDIRECT — fjernes | — |
| `/admin/brief` | TRENGER-DESIGN | — |
| `/admin/board` | REDIRECT — fjernes | — |
| `/admin/oppfolging` | TRENGER-DESIGN | — |
| `/admin/workspace` | TRENGER-DESIGN | — |
| `/admin/workspace/tildelt-meg` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/admin/workspace/oppgaver` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/admin/workspace/oppgaver/[id]` | TRENGER-DESIGN | — |
| `/admin/workspace/prosjekter` | TRENGER-DESIGN | — |
| `/admin/workspace/notion` | TRENGER-DESIGN | — |
| `/admin/reach` | TRENGER-DESIGN | — |

**Opptelling 2a: 7 NY-HYBRID, 4 RE-SKIN, 9 TRENGER-DESIGN (ekskl. redirects/legacy)**

---

### 2b — Stall (spillere, grupper, talent)

| Skjerm/rute | Status | Handoff-fil |
|---|---|---|
| `/admin/spillere` | NY-HYBRID | `AgencyOS Stall (hybrid).dc.html` |
| `/admin/spillere/[id]` | NY-HYBRID | `AgencyOS Stall (hybrid).dc.html` (360-panel) |
| `/admin/spillere/ny` | TRENGER-DESIGN | — |
| `/admin/spillere/[id]/profil` | TRENGER-DESIGN | — |
| `/admin/spillere/[id]/workbench` | NY-HYBRID | `Workbench Dashboard.dc.html` + `Workbench Coach-Skill.dc.html` |
| `/admin/spillere/[id]/plan/[planId]` | TRENGER-DESIGN | — |
| `/admin/spillere/[id]/fremgang` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/admin/spillere/[id]/tester` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/admin/spillere/[id]/tildel-test` | RE-SKIN (Design=✓ tildel-test i MASTER) | — |
| `/admin/spillere/[id]/rediger` | TRENGER-DESIGN | — |
| `/admin/stall` | TRENGER-DESIGN | — |
| `/admin/grupper` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/admin/grupper/[id]` | TRENGER-DESIGN | — |
| `/admin/talent` | UTSATT (NY-HYBRID når aktivert — i handoff) | `AgencyOS Talent Coach (hybrid).dc.html` |
| `/admin/talent/[playerId]` | UTSATT (TRENGER-DESIGN når aktivert) | — |
| `/admin/talent/discovery` | UTSATT (TRENGER-DESIGN når aktivert) | — |
| `/admin/talent/radar` | UTSATT (NY-HYBRID når aktivert) | `AgencyOS Talent Coach (hybrid).dc.html` |
| `/admin/talent/radar/[playerId]` | UTSATT (TRENGER-DESIGN når aktivert) | — |
| `/admin/talent/kohort` | UTSATT (NY-HYBRID DELVIS når aktivert) | `AgencyOS Talent Coach (hybrid).dc.html` |
| `/admin/talent/region` | UTSATT (TRENGER-DESIGN når aktivert) | — |
| `/admin/talent/ressurser` | UTSATT (TRENGER-DESIGN når aktivert) | — |
| `/admin/talent/sammenligning` | UTSATT (NY-HYBRID når aktivert) | `AgencyOS Talent Coach (hybrid).dc.html` |
| `/admin/talent/wagr-benchmark` | UTSATT (TRENGER-DESIGN når aktivert) | — |
| `/admin/talent/wagr-import` | UTSATT (RE-SKIN — Design=✓ i MASTER når aktivert) | — |

**Opptelling 2b: 3 NY-HYBRID, 5 RE-SKIN, 5 TRENGER-DESIGN, 11 UTSATT**

> Talent-seksjonen (AgencyOS) følger samme UTSATT-logikk som PlayerHQ Talent — Elite Fase 2, bevisst utsatt per MASTER-SKJERMPLAN. Hele `/admin/talent/*`-treet er UTSATT inntil Anders gir grønt lys.

---

### 2c — Planlegge (planer for spillerne)

| Skjerm/rute | Status | Handoff-fil |
|---|---|---|
| `/admin/planlegge` | NY-HYBRID | `AgencyOS Planlegging (hybrid).dc.html` |
| `/admin/plans` | NY-HYBRID | `AgencyOS Planlegging (hybrid).dc.html` |
| `/admin/plans/[planId]` | NY-HYBRID (DELVIS) | `AgencyOS Planlegging (hybrid).dc.html` |
| `/admin/plans/new` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/admin/plan-templates` | NY-HYBRID | `Workbench Coach-Skill.dc.html` |
| `/admin/plan-templates/[id]` | TRENGER-DESIGN | — |
| `/admin/plan-templates/ny` | NY-HYBRID | `Workbench Coach-Skill.dc.html` (steg 1–3) |
| `/admin/plan-templates/[id]/rediger` | TRENGER-DESIGN | — |
| `/admin/teknisk-plan` | TRENGER-DESIGN | — |
| `/admin/teknisk-plan/[spillerId]` | NY-HYBRID (DELVIS — spec + Workbench Trackman) | `Workbench Trackman.dc.html` |
| `/admin/coach-workbench` | NY-HYBRID | `Workbench Dashboard.dc.html` + `Workbench Coach-Skill.dc.html` |
| `/admin/drills` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/admin/drills/[id]` | TRENGER-DESIGN | — |
| `/admin/drills/[id]/rediger` | TRENGER-DESIGN | — |
| `/admin/tournaments` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/admin/tournaments/[id]` | TRENGER-DESIGN | — |
| `/admin/tournaments/ny` | TRENGER-DESIGN | — |
| `/admin/tournaments/dubletter` | TRENGER-DESIGN (Design=– i MASTER, ikke i handoff) | — |
| `/admin/okter` | TRENGER-DESIGN | — |
| `/admin/videoer` | TRENGER-DESIGN | — |
| `/admin/recording` | TRENGER-DESIGN | — |

**Opptelling 2c: 7 NY-HYBRID, 4 RE-SKIN, 10 TRENGER-DESIGN**

---

### 2d — Gjennomføre (daglig drift)

| Skjerm/rute | Status | Handoff-fil |
|---|---|---|
| `/admin/gjennomfore` | TRENGER-DESIGN | — |
| `/admin/gjennomfore/okter/[id]` | TRENGER-DESIGN | — |
| `/admin/kalender` | NY-HYBRID | `AgencyOS Kalender (hybrid).dc.html` |
| `/admin/kalender/uke` | NY-HYBRID (redirect til /admin/kalender, samme design) | `AgencyOS Kalender (hybrid).dc.html` |
| `/admin/kalender/maned` | NY-HYBRID | `AgencyOS Kalender (hybrid).dc.html` |
| `/admin/bookinger` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/admin/bookinger/ny` | TRENGER-DESIGN | — |
| `/admin/anlegg` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/admin/anlegg/[id]` | TRENGER-DESIGN | — |
| `/admin/availability` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/admin/kapasitet` | TRENGER-DESIGN | — |
| `/admin/services` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/admin/facilities` | REDIRECT (301 → /admin/anlegg per next.config) | — |
| `/admin/facilities/[id]` | REDIRECT (301 → /admin/anlegg) | — |
| `/admin/locations` | REDIRECT (301 → /admin/anlegg per next.config) | — |
| `/admin/trackman` | NY-HYBRID (DELVIS — via Workbench Trackman) | `Workbench Trackman.dc.html` |
| `/admin/live/[sessionId]/brief` | NY-HYBRID | `AgencyOS Live-økt Coach (hybrid).dc.html` |
| `/admin/live/[sessionId]/active` | NY-HYBRID | `AgencyOS Live-økt Coach (hybrid).dc.html` |
| `/admin/live/[sessionId]/summary` | NY-HYBRID | `AgencyOS Live-økt Coach (hybrid).dc.html` |

**Opptelling 2d: 6 NY-HYBRID, 5 RE-SKIN, 5 TRENGER-DESIGN, 3 REDIRECT**

---

### 2e — Innsikt og analyse

| Skjerm/rute | Status | Handoff-fil |
|---|---|---|
| `/admin/analyse` | NY-HYBRID | `AgencyOS Risiko (hybrid).dc.html` |
| `/admin/analysere` | NY-HYBRID | `AgencyOS Risiko (hybrid).dc.html` |
| `/admin/analysere/compliance` | NY-HYBRID (DELVIS — Risiko dekker compliance-aspekt) | `AgencyOS Risiko (hybrid).dc.html` |
| `/admin/analytics` | TRENGER-DESIGN | — |
| `/admin/lag-snitt` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/admin/tester` | NY-HYBRID | `AgencyOS Tester (hybrid).dc.html` |
| `/admin/tester/[id]` | NY-HYBRID (DELVIS — i Tester-skjerm) | `AgencyOS Tester (hybrid).dc.html` |
| `/admin/tester/benchmarks` | NY-HYBRID (DELVIS — trolig fane) | `AgencyOS Tester (hybrid).dc.html` |
| `/admin/tester/foreslatte` | TRENGER-DESIGN | — |
| `/admin/tester/tildel/[spillerId]` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/admin/foresporsler` | NY-HYBRID | `AgencyOS Handlingssenter (hybrid).dc.html` |
| `/admin/godkjenninger` | NY-HYBRID | `AgencyOS Handlingssenter (hybrid).dc.html` |
| `/admin/godkjenninger/[id]` | TRENGER-DESIGN | — |
| `/admin/reports` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/admin/runder` | TRENGER-DESIGN | — |
| `/admin/tilstander` | TRENGER-DESIGN | — |
| `/admin/okonomi` | NY-HYBRID | `AgencyOS Økonomi (hybrid).dc.html` |
| `/admin/stats/overview` | TRENGER-DESIGN | — |
| `/admin/stats/moderering` | TRENGER-DESIGN | — |

**Opptelling 2e: 9 NY-HYBRID, 4 RE-SKIN, 6 TRENGER-DESIGN**

---

### 2f — Admin, organisasjon og innstillinger

| Skjerm/rute | Status | Handoff-fil |
|---|---|---|
| `/admin/organisasjon` | TRENGER-DESIGN | — |
| `/admin/klubb/innstillinger` | TRENGER-DESIGN | — |
| `/admin/integrasjoner` | TRENGER-DESIGN | — |
| `/admin/settings` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/admin/settings/api` | TRENGER-DESIGN | — |
| `/admin/settings/calendar` | TRENGER-DESIGN | — |
| `/admin/settings/security` | TRENGER-DESIGN | — |
| `/admin/settings/tilgang` | TRENGER-DESIGN | — |
| `/admin/team` | TRENGER-DESIGN | — |
| `/admin/team/inviter` | TRENGER-DESIGN | — |
| `/admin/audit-log` | TRENGER-DESIGN | — |
| `/admin/audit-log/[id]` | TRENGER-DESIGN | — |
| `/admin/agents` | TRENGER-DESIGN | — |
| `/admin/agents/[agentId]` | TRENGER-DESIGN | — |
| `/admin/email-templates` | TRENGER-DESIGN | — |
| `/admin/email-templates/[id]/rediger` | TRENGER-DESIGN | — |
| `/admin/profile` | TRENGER-DESIGN | — |
| `/admin/hjelp` | TRENGER-DESIGN | — |
| `/admin/caddie` | TRENGER-DESIGN | — |
| `/admin/godkjenn-portal` | TRENGER-DESIGN | — |
| `/admin/godkjenn-portal/koblinger` | TRENGER-DESIGN | — |
| `/admin/godkjenn-portal/koblinger/[id]` | TRENGER-DESIGN | — |
| `/admin/godkjenn-portal/review` | TRENGER-DESIGN | — |

**Opptelling 2f: 0 NY-HYBRID, 1 RE-SKIN (/admin/settings), 22 TRENGER-DESIGN**

---

### AgencyOS TOTALOPPTELLING

| Kategori | Antall ruter |
|---|---|
| **NY-HYBRID** (klar til porting fra .dc.html) | **~32** |
| **RE-SKIN** (Design=✓ i MASTER, gammel athletic → oppdateres med ny palett) | **~20** |
| **TRENGER-DESIGN** (Design=– og ikke i handoff → Claude Design fra null) | **~55** |
| **UTSATT** (Talent/Elite Fase 2) | **~11** |
| Redirect/legacy (fjernes) | ~6 |
| **Sum ekte produkt-ruter** | **~124** |

> **Viktig:** «Trenger Claude Design»-tallet er ~55, IKKE 88. De ~20 RE-SKIN-rutene trenger ikke nytt design — de re-skinnes via token-migrering. RE-SKIN inkluderer: bookinger, anlegg, availability, services, lag-snitt, drills, tournaments, plans/new, spillere/[id]/fremgang|tester|tildel-test, grupper, workspace/*, reports, settings, agencyos/spillere|caddie.

---

## 3 — Workbench (delt kjerne)

Workbench er en hybrid-funksjon som dekker ruter i både PlayerHQ og AgencyOS. Skjermene i handoffen dekker kjernen godt.

| Skjerm/rute | Status | Handoff-fil |
|---|---|---|
| `/portal/planlegge` (WorkbenchShell) | NY-HYBRID | `Workbench Interaktiv.dc.html` |
| `/portal/planlegge/workbench` | NY-HYBRID | `Workbench Interaktiv.dc.html` |
| `/admin/coach-workbench` | NY-HYBRID (Design=– i MASTER men DESIGNET i handoff) | `Workbench Dashboard.dc.html` + `Workbench Coach-Skill.dc.html` |
| `/admin/spillere/[id]/workbench` | NY-HYBRID | `Workbench Dashboard.dc.html` |
| `/admin/plan-templates/ny` (coach-skill wizard) | NY-HYBRID | `Workbench Coach-Skill.dc.html` |
| `/portal/trackman/[sessionId]` (3-lags) | NY-HYBRID | `Workbench Trackman.dc.html` |
| `/admin/teknisk-plan/[spillerId]` (spec) | NY-HYBRID (DELVIS) | `Workbench Trackman.dc.html` + arkdok |

**Merknad:** 2 av 5 handoff-filene i Workbench-kategorien er arkitektur-/krav-dokumenter (ikke portbare skjermer): `Workbench Plan - Planlegging, Skills og Trackman.dc.html` og `Workbench Plan 3 til 10.dc.html`. Les disse som spec, ikke som UI å porte.

**Workbench TOTALOPPTELLING: 7 NY-HYBRID** (ingen egne TRENGER-DESIGN i workbench-kjernen — dekkes av PlayerHQ + AgencyOS-radene over)

---

## 4 — Forelderportal (`/forelder`)

> MASTER-SKJERMPLAN er utdatert for Forelderportal (viser ~/– for ruter handoffen har designet). Alle 8 NY-HYBRID-ruter er designet i 17.juni-handoffen og har hakene ~ i MASTER fordi de ikke er portert ennå.

| Skjerm/rute | Status | Handoff-fil |
|---|---|---|
| `/forelder` | NY-HYBRID | `Forelderportal Hjem (hybrid).dc.html` |
| `/forelder/barn` | NY-HYBRID (DELVIS — i Barn-profil-skjerm) | `Forelderportal Barn-profil (hybrid).dc.html` |
| `/forelder/barn/[childId]` | NY-HYBRID | `Forelderportal Barn-profil (hybrid).dc.html` |
| `/forelder/bookinger` | NY-HYBRID | `Forelderportal Bookinger (hybrid).dc.html` |
| `/forelder/coach` | TRENGER-DESIGN (stub, Q3) | — |
| `/forelder/fakturaer` | NY-HYBRID | `Forelderportal Fakturaer (hybrid).dc.html` |
| `/forelder/okonomi` | NY-HYBRID (DELVIS — dekkes av Fakturaer) | `Forelderportal Fakturaer (hybrid).dc.html` |
| `/forelder/samtykke` | NY-HYBRID | `Forelderportal Samtykke (hybrid).dc.html` |
| `/forelder/ukerapport` | NY-HYBRID | `Forelderportal Ukerapport (hybrid).dc.html` |
| `/forelder/innstillinger` | TRENGER-DESIGN | — |
| `/forelder/varsler` | TRENGER-DESIGN | — |
| `/inviter/forelder/[token]` | TRENGER-DESIGN | — |

**Forelderportal TOTALOPPTELLING: 8 NY-HYBRID, 0 RE-SKIN, 4 TRENGER-DESIGN**

---

## 5 — Auth + Onboarding

> `/auth/bankid` vises som Design=✓ i MASTER-SKJERMPLAN, men er IKKE i 17.juni-handoffen (61-DEKNINGSMATRISE merker den «stub»). Følger MASTER → RE-SKIN. `/auth/logget-ut` er Design=~ i MASTER → RE-SKIN.

| Skjerm/rute | Status | Handoff-fil |
|---|---|---|
| `/auth/login` | NY-HYBRID | `Auth Innlogging (hybrid).dc.html` |
| `/auth/signup` | NY-HYBRID | `Auth Innlogging (hybrid).dc.html` |
| `/auth/forgot-password` | NY-HYBRID | `Auth Reset Passord (hybrid).dc.html` |
| `/auth/reset-password` | NY-HYBRID (DELVIS — ikke eksplisitt vist) | `Auth Reset Passord (hybrid).dc.html` |
| `/auth/check-email` | NY-HYBRID | `Auth Reset Passord (hybrid).dc.html` |
| `/auth/bankid` | RE-SKIN (Design=✓ i MASTER, ikke i handoff) | — |
| `/auth/onboarding` | NY-HYBRID | `Auth Innlogging (hybrid).dc.html` (wizard 4 steg) |
| `/auth/onboarding/forelder` | TRENGER-DESIGN | — |
| `/auth/guardian-consent/[token]` | TRENGER-DESIGN | — |
| `/auth/samtykke-venter` | TRENGER-DESIGN | — |
| `/auth/logget-ut` | RE-SKIN (Design=~ i MASTER, ikke i handoff) | — |
| `/onboard/coach` | NY-HYBRID | `Auth Innlogging (hybrid).dc.html` (AgencyOS-kort) |
| `/onboard/klubb` | TRENGER-DESIGN | — |

**Auth TOTALOPPTELLING: 7 NY-HYBRID, 2 RE-SKIN, 4 TRENGER-DESIGN**

---

## 6 — Marketing (`/(marketing)`)

> MASTER-SKJERMPLAN er utdatert for Marketing (viser kun /(marketing) som ✓, men handoffen har 5 skjermer). Alle ny-hybrid-ruter her er designet i handoffen men ikke portert ennå.

| Skjerm/rute | Status | Handoff-fil |
|---|---|---|
| `/(marketing)` (forside) | NY-HYBRID | `Marketing Hjem (hybrid).dc.html` |
| `/(marketing)/cases` | NY-HYBRID | `Marketing Cases (hybrid).dc.html` |
| `/(marketing)/coacher` | NY-HYBRID | `Marketing Coacher (hybrid).dc.html` |
| `/(marketing)/coacher/[slug]` | NY-HYBRID (DELVIS — i Coacher-skjerm) | `Marketing Coacher (hybrid).dc.html` |
| `/(marketing)/kontakt` | NY-HYBRID | `Marketing Kontakt (hybrid).dc.html` |
| `/(marketing)/anlegg` | TRENGER-DESIGN | — |
| `/(marketing)/anlegg/[slug]` | TRENGER-DESIGN | — |
| `/(marketing)/blogg` | TRENGER-DESIGN | — |
| `/(marketing)/blogg/[slug]` | TRENGER-DESIGN | — |
| `/(marketing)/booking` | TRENGER-DESIGN | — |
| `/(marketing)/booking/[slug]` | TRENGER-DESIGN | — |
| `/(marketing)/booking/[slug]/bekreft` | TRENGER-DESIGN | — |
| `/(marketing)/booking/kvittering/[bookingId]` | TRENGER-DESIGN | — |
| `/(marketing)/coaching` | TRENGER-DESIGN | — |
| `/(marketing)/junior` | TRENGER-DESIGN | — |
| `/(marketing)/priser` | TRENGER-DESIGN | — |
| `/(marketing)/playerhq` | TRENGER-DESIGN | — |
| `/(marketing)/om-oss` | TRENGER-DESIGN | — |
| `/(marketing)/jobb` | TRENGER-DESIGN | — |
| `/(marketing)/faq` | TRENGER-DESIGN | — |
| `/(marketing)/suksess` | REDIRECT/LEGACY-DUP (fjernes til /cases) | — |
| `/(marketing)/treningsfilosofi` | TRENGER-DESIGN | — |
| `/(marketing)/turneringer` | TRENGER-DESIGN | — |
| `/(marketing)/turneringer/[slug]` | TRENGER-DESIGN | — |
| `/(marketing)/cookies` | TRENGER-DESIGN | — |
| `/(marketing)/personvern` | TRENGER-DESIGN | — |
| `/(marketing)/vilkar` | TRENGER-DESIGN | — |

**Marketing TOTALOPPTELLING: 5 NY-HYBRID, 0 RE-SKIN, 21 TRENGER-DESIGN (ekskl. /suksess som fjernes)**

---

## 7 — Stats-plattform (`/(marketing)/stats`)

Behandles som eget design-spor. Ingen av stats-rutene er designet i denne handoffen.

| Rute-gruppe | Status |
|---|---|
| `/stats` + `/stats/uka` + `/stats/2026` | EGET-SPOR |
| `/stats/spillere` + `/[slug]` + `aargang` | EGET-SPOR |
| `/stats/baner` + `klubber` + `regions` | EGET-SPOR |
| `/stats/turneringer` + `tour` | EGET-SPOR |
| `/stats/leaderboards` + `norske` + `pga/*` | EGET-SPOR |
| `/stats/verktoy/*` (kalkulatorer) | EGET-SPOR |
| `/stats/sammenlign-spillere` + `sg-sammenlign` | EGET-SPOR |
| `/stats/blogg` + `sok` + `quiz` + `wrapped` + `min-progresjon` | EGET-SPOR |

**Stats TOTALOPPTELLING: 0 i denne handoffen, ~50 ruter i eget spor**

---

## Samlet oppsummering (5-status-taksonomi)

| Produkt | NY-HYBRID | RE-SKIN | TRENGER-DESIGN | UTSATT | EGET-SPOR | Total ekte ruter |
|---|---|---|---|---|---|---|
| PlayerHQ | ~25 | ~19 | ~88 | 5 | — | ~143 |
| AgencyOS | ~32 | ~20 | ~55 | ~11 | — | ~124 |
| Forelderportal | 8 | 0 | 4 | — | — | 12 |
| Auth/Onboarding | 7 | 2 | 4 | — | — | 13 |
| Marketing | 5 | 0 | 21 | — | — | 27 |
| Stats | — | — | — | — | ~50 | ~50 |
| **TOTAL** | **~77** | **~41** | **~172** | **~16** | **~50** | **~369** |

> **Det reelle «trenger nytt Claude Design»-tallet er ~172, IKKE 282.**
> - **82 NY-HYBRID** er allerede designet i 17.juni-handoffen og klare til porting.
> - **~41 RE-SKIN** trenger ikke nytt design — de er bygd i gammel athletic-stil (Design=✓ i MASTER) og re-skinnes ved token-migrering + komponent-galleri-oppdatering. Disse skal ALDRI sendes til Claude Design / overskrives blindt.
> - **~16 UTSATT** er bevisst parkert (Elite Fase 2) og designes ikke nå.
> - **~50 EGET-SPOR** er stats-plattformen som er et separat design-prosjekt.
> 
> Merk: Tallene er ruter, ikke handoff-filer. Totalen utelater ~25 redirects/legacy/demo-intern.

---

## TRENGER-DESIGN per produkt (prioritert rekkefølge for Claude Design)

> RE-SKIN-ruter er IKKE med her — de re-skinnes uten nytt Claude Design-arbeid.

### PlayerHQ — TRENGER-DESIGN (~88 ruter)

1. **SG-Hub undersider (9 ruter)** — `/portal/mal/sg-hub/[club|benchmark|best-vs-now|equipment|yardage|conditions|strategy|coach/*]`. Hele SG-Hub-HUB er RE-SKIN, men ALLE undersider er TRENGER-DESIGN.
2. **Coach-seksjonen (15 ruter)** — `/portal/coach/*`. Coach-hub/melding/melding[id] er NY-HYBRID. Alt annet (planer, øvelser, videoer, notater, spørsmål, AI) mangler fullstendig design.
3. **Analysere/statistikk-undersider** — Metrikk-detalj, sammenlign, hull-analyse (~/–), slag-for-slag, trackman-detalj.
4. **Meg-undersider** — Abonnement-flyt (oppgrader/avbestill/kort/faktura), bookinger, innstillinger-undersider (8 stk), sikkerhet/2FA, feedback, hjelp-undersider.
5. **Gjennomføre-sekundærsider** — Ny økt, ønsket økt, kalender, tren-fullskjerm, økt-detalj, feiring.
6. **Planlegge-sekundær** — Fys-plan, mål-hub/bygger/detalj/milepæler/leaderboard, utfordringer, AI-assistenter.

### AgencyOS — TRENGER-DESIGN (~55 ruter)

1. **Organisasjon og innstillinger (22 ruter)** — Hele `/admin/settings/*`, `/admin/team`, `/admin/audit-log`, `/admin/agents`, `/admin/email-templates`, `/admin/organisasjon`, `/admin/klubb/innstillinger` — INGEN i handoff.
2. **Spiller-detalj-undersider** — Profil, plan-detalj, ny spiller, rediger.
3. **Gjennomføre/drift** — Daglig drift-hub, økt-detalj, bookinger-ny, anlegg-detalj, kapasitet, recording.
4. **Planlegge-sekundær** — Plan-mal detalj/rediger, drill-detalj/rediger, turneringsdetalj/ny, teknisk plan-hub, okter, videoer.
5. **Innsikt-sekundær** — Analytics, tester-foreslatte, runder, tilstander, stats-moderering.
6. **Workspace** — Hub, oppgave-detalj, prosjekter, Notion-sync.

### Forelderportal — TRENGER-DESIGN (4 ruter)

1. **Varsler, innstillinger, forelder-coach, inviter-token** — 4 enkle ruter.

### Auth — TRENGER-DESIGN (4 ruter)

1. **Forelder-onboarding, guardian-consent, samtykke-venter, onboard-klubb**.

### Marketing — TRENGER-DESIGN (21 ruter)

1. **Sekundærsider** (blogg, anlegg, coaching, priser, om-oss, jobb, faq, treningsfilosofi, booking-flyt, cookies, personvern, vilkår m.fl.) er STUB i kode og mangler design.

### Stats — EGET-SPOR (~50 ruter)

All stats-design er et separat prosjekt. Ingen av ~50 ruter designes i denne fasen.
