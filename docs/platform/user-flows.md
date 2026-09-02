# AK Golf HQ — Faktisk user flow (PlayerHQ & AgencyOS)

**Generert 2026-07-30** · Verktøy: `scripts/rute-graf.mjs` · Rådata: `docs/platform/rute-graf-data.json`
**Regenerer:** `node scripts/rute-graf.mjs`

> **ADVARSEL (lagt til 02.09.2026):** Grafen og rutetallene under er over en måned gamle.
> Faktisk `page.tsx`-antall i dag: **343** (168 portal · 163 admin · 12 forelder) mot 330
> (166 · 153 · 11) da grafen ble generert — og STEG 15-konsolideringen (30.–31.08.2026, se
> `docs/MASTERPLAN-GJENSTAAENDE.md`) har siden erstattet store deler av AgencyOS-navigasjonen
> under med redirects til nye samleflater. Kjør `node scripts/rute-graf.mjs` og lim inn fersk
> output før du stoler på diagrammene eller tallene under.

## Metode og begrensninger

Grafen er bygget ved å lese alle `page.tsx` under `src/app/{portal,admin,forelder}` og trekke ut alle strenge-literals som peker på interne ruter (`href=`, `redirect()`, `router.push()`, `Link`). Det betyr:

- Grafen viser **faktisk kablet navigasjon**, ikke ønsket flyt.
- Lenker bygget helt dynamisk (f.eks. søkeresultater, programmatiske redirects med betingelser) kan mangle.
- Feature-gates (`FEATURES.TALENT`, Pro-gating) og rolle-betingelser er usynlige i grafen — en kant betyr ikke at alle brukere ser lenken.
- Blindgate-listen er **kandidater å verifisere manuelt**, ikke beviste feil (noen ruter nås bevisst kun via søk, varsel-lenker eller e-post).

## Nøkkeltall

| Mål | Verdi |
|---|---|
| Ruter totalt | 330 (166 portal · 153 admin · 11 forelder) |
| Navigasjonskanter | 763 |
| Rene redirect-sider | 83 (legacy-kompatibilitet) |
| Blindgate-kandidater | 23 (se under) |

## Blindgate-kandidater (ingen innkommende lenker funnet)

**Sannsynlig greie** (nås via varsel/e-post/søk/programmatisk navigasjon — verifiser likevel):
`/portal/booking/ny/bekreft`, `/portal/onskeligokt/bekreftet`, `/portal/statistikk/[metric]`, `/portal/trening/logg`, `/portal/tren/[sessionId]/planlagt`, `/admin/drills/forslag` (lenkes fra agentsider), `/forelder/barn/[childId]`

**Bør sjekkes — ser ut som reelle blindgater:**
- `/portal/ai/foresla-turnering`, `/portal/ai/mal-bygger` — AI-funksjoner uten inngang fra UI?
- `/portal/trening/putte-laboratoriet`, `/portal/trening/break-tabell` — putte-verktøy uten lenke inn
- `/portal/meg/innstillinger/ai-coach`, `/portal/meg/innstillinger/okter` — innstillings-sider uten inngang
- `/portal/booking/anlegg/[anleggId]`, `/portal/booking/coach/[coachId]` — booking-innganger
- `/portal/tren/aarsplan/periode/ny` + `[id]/rediger` — eneste gjenværende ekte legacy-sider, nås de?
- `/admin/settings/api`, `/admin/settings/security`, `/admin/stats/overview`, `/admin/talent/wagr-import`, `/admin/grupper/[id]/arsplan/skoledata`
- `/portal/mal/sg-hub/coach/[spillerId]/equipment` — kjent gjenværende legacy-side

---

## Seksjonsgraf — PlayerHQ (kanter med ≥2 lenker)

```mermaid
flowchart LR
  NAV["Delt nav (5 trykk)"]
  NAV --> mal["/portal/mal"]
  NAV --> meg["/portal/meg"]
  NAV --> tren["/portal/tren"]
  NAV --> coach["/portal/coach"]
  NAV --> talent["/portal/talent"]
  NAV --> booking["/portal/booking"]
  NAV --> live["/portal/live"]
  NAV --> planlegge["/portal/planlegge"]
  NAV --> gjennomfore["/portal/gjennomfore"]
  NAV --> analysere["/portal/analysere"]
  NAV --> drills["/portal/drills"]
  NAV --> runde["/portal/runde"]
  NAV --> gameplan["/portal/gameplan"]
  NAV --> utfordringer["/portal/utfordringer"]
  hjem["/portal"] --> tren
  live --> planlegge
  live --> meg
  tren --> planlegge
  tren --> coach
  tren --> kalender["/portal/kalender"]
  tren --> drills
  mal --> coach
  mal --> runde
  coach --> planlegge
  coach --> mal
  statistikk["/portal/statistikk"] --> analysere
  trackman["/portal/trackman"] --> mal
  baneguide["/portal/baneguide"] --> gameplan
  onskeligokt["/portal/onskeligokt"] --> gjennomfore
  ai["/portal/ai"] --> tren
```

**Avlesning:** Hovedsløyfen er `NAV → tren/gjennomfore → live → planlegge` — akkurat den daglige loopen plattformen er bygget rundt. `/portal/mal` fungerer som analyse-hub (inn fra TrackMan, ut til coach og runde). Merk at `mal` her er *mål*-hubben — den bærer mye mer enn mål.

## Seksjonsgraf — AgencyOS (kanter med ≥2 lenker)

```mermaid
flowchart LR
  NAV["Delt nav (Hjem·Stall·Kalender·Kø·Innsikt)"]
  NAV --> spillere["/admin/spillere"]
  NAV --> agencyos["/admin/agencyos"]
  NAV --> grupper["/admin/grupper"]
  NAV --> talent["/admin/talent"]
  NAV --> tester["/admin/tester"]
  NAV --> plantemplates["/admin/plan-templates"]
  NAV --> drills["/admin/drills"]
  NAV --> workspace["/admin/workspace"]
  NAV --> settings["/admin/settings"]
  NAV --> bookinger["/admin/bookinger"]
  NAV --> kalender["/admin/kalender"]
  NAV --> tournaments["/admin/tournaments"]
  NAV --> plans["/admin/plans"]
  NAV --> godkjenninger["/admin/godkjenninger"]
  agencyos --> spillere
  agencyos --> godkjenninger
  plans --> plantemplates
  plans --> spillere
  plans --> planlegge["/admin/planlegge"]
  talent --> spillere
  tester --> spillere
  gjennomfore["/admin/gjennomfore"] --> kalender
  gjennomfore --> bookinger
  agents["/admin/agents"] --> godkjenninger
  godkjenninger --> agencyos
  live["/admin/live"] --> spillere
  workspace --> handlingssenter["/admin/handlingssenter"]
  approvals["/admin/approvals (alias)"] --> godkjenninger
  analysere["/admin/analysere"] --> analyse["/admin/analyse"]
  calendar["/admin/calendar (legacy)"] --> kalender
```

**Avlesning:** `/admin/spillere` er gravitasjonssenteret — alt av innsikt (talent, tester, plans, live) peker dit. Morgen-loopen er `agencyos → godkjenninger → tilbake`. Legacy-omveier (`approvals→godkjenninger`, `calendar→kalender`) viser at alias-strukturen fungerer.

## Kryss-lenker portal → admin (verdt å verifisere)

21 kanter går fra portal-sider til admin-ruter — mest til `/admin/kalender` (f.eks. `/portal/meg → /admin/kalender` ×8). Dette er mest sannsynlig **coach-rolle-lenker** (coach ser spiller-flaten, men lenkes tilbake til admin), men bør verifiseres som bevisst design — ellers er det rolle-lekkasje i navigasjonen. Unntak: `/portal/mal → /admin/spillere` ×3 og `/portal/tren → /admin/godkjenninger` ser ut som coach-modus-innganger (`/portal/mal/sg-hub/coach/[spillerId]`-mønsteret).

---

## Kuraterte gyldne stier (verifisert mot actions/agenter)

### 1. PlayerHQ — daglig treningsloop

```mermaid
flowchart LR
  A["/portal<br/>Hjem: dagens økt +<br/>neste beste handling"] --> B["/portal/gjennomfore"]
  B --> C["/portal/live/[id]/brief<br/>mål · fokus · drills"]
  C -->|start økt| D["/portal/live/[id]/active<br/>timer · rep-logging"]
  D --> E["/portal/live/[id]/tapper<br/>én tap per ball · kølle"]
  E --> F["/portal/live/[id]/summary<br/>reps · tid · pyramide"]
  C -.->|trigger| G["live-coach-agent<br/>AI-velkomst i tråd"]
  E -.->|skriver| H["SessionBallLog"]
  F --> A
```

### 2. Runde → agent-kjeden → coach-loop (plattformens kjerne-loop)

```mermaid
flowchart LR
  A["/portal/runde/live<br/>slag-for-slag"] --> B["lagreLoggetRunde<br/>shots → SG-pipeline"]
  B --> C["triggerRoundAgent"]
  C --> D["round-agent<br/>SG-snitt 30d → Signal"]
  D --> E["sg-analyse-ekspert<br/>svakhet → MORAD-funn"]
  E --> F["plan-revisjon<br/>Claude-forslag"]
  F --> G["achievement +<br/>treningsdata-ekspert"]
  D & E & F --> H["PlanAction PENDING<br/>+ provenance"]
  H --> I["Notification + Telegram<br/>(SG < −1.0)"]
  H --> J["/admin/godkjenninger<br/>coach ser diff-preview"]
  J -->|godkjenn| K["plan-action-executor<br/>3 guards · transaksjon"]
  K --> L["Oppdatert plan synlig i<br/>/portal/planlegge"]
```

### 3. TrackMan-import → innsikt

```mermaid
flowchart LR
  A["/portal/mal/trackman<br/>import CSV/HTML"] --> B["parse-csv /<br/>parse-html-report"]
  B --> C["TrackManSession +<br/>TrackManShot"]
  C --> D["triggerTrackManAgent"]
  D --> E["trackman-agent<br/>CLUB_AVG + face-to-path"]
  E --> F["Signal + evt.<br/>INTENSITY_ADJUST"]
  C --> G["sg-insights (cron 04:00)<br/>strike · tempo · drift ·<br/>equipment-fit"]
  G --> H["Insight-rader m/ severity"]
  F --> I["/admin/godkjenninger"]
  C --> J["/portal/mal/trackman/[id]<br/>dispersion-plot"]
```

### 4. AgencyOS — morgenflyt

```mermaid
flowchart LR
  A["/admin/agencyos<br/>Cockpit: KPI · brief ·<br/>fokusspillere"] --> B["/admin/brief<br/>Claude-dagsbrief"]
  A --> C["/admin/godkjenninger<br/>PENDING-kø"]
  C --> D["diff-preview<br/>(computeDelta)"]
  D -->|godkjenn/avvis| E["executor + varsling"]
  A --> F["/admin/spillere/[id]/workbench"]
  F --> G["rediger uke →<br/>publiser m/ diff"]
  G --> H["V2-sync → spiller ser det i<br/>/portal/planlegge + Gjør"]
  A --> I["/admin/queue<br/>Risiko/Watch/Sjekk inn"]
  I --> F
```

### 5. Drill-pipeline (ukentlig, mandag)

```mermaid
flowchart LR
  A["radar 07:45<br/>YouTube + RSS"] --> B["RadarFunn<br/>(ubehandlet)"]
  B --> C["fabrikk 07:50<br/>Claude → ny norsk øvelse<br/>mot masterbrain-fasit"]
  D["drill-forslag 08:00<br/>stallens SG-svakhet<br/>→ 5 driller m/ video"] --> E["CaddieDraft PENDING"]
  C --> E
  F["media-lofte 08:15<br/>video til øvelser<br/>som mangler"] --> E
  E --> G["/admin/drills/forslag<br/>coach godkjenner"]
  G --> H["ExerciseDefinition"]
  H --> I["/portal/drills<br/>synlig for spiller"]
  J["ukesrapport-ovelser 08:30"] --> K["oppsummering til ADMIN"]
  B & E --> J
```

### 6. Booking (felles reise)

```mermaid
flowchart LR
  A["/portal/booking<br/>tjeneste · coach · credits"] --> B["/portal/booking/ny<br/>wizard: dato → tid"]
  B --> C["createCreditBooking"]
  C --> D["Booking CONFIRMED"]
  D --> E["calendar-sync (15 min)<br/>push til Google Calendar"]
  D --> F["booking-reminders<br/>e-post 24t før"]
  D --> G["/admin/kalender +<br/>/admin/gjennomfore"]
  H["prøvetime (gjest)"] --> I["lead-oppfolging (cron)<br/>Lead + tilbudstekst til ADMIN"]
```

---

## Konklusjon og anbefalinger

1. **Kjernesløyfene er intakte** — daglig loop, runde→coach-loop og drill-pipeline er alle fullt kablet. Plattformens hjerte fungerer som designet.
2. **23 blindgate-kandidater** bør verifiseres manuelt; de mest mistenkelige er AI-sidene (`foresla-turnering`, `mal-bygger`), putte-verktøyene og to innstillings-sider uten inngang.
3. **21 portal→admin-lenker** bør bekreftes som bevisste coach-rolle-innganger.
4. Kjør `node scripts/rute-graf.mjs` på nytt etter større navigasjons-endringer — diff av `rute-graf-data.json` i git viser nøyaktig hvilke kanter som forsvant/kom.
