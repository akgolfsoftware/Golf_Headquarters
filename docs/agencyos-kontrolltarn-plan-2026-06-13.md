# AgencyOS kontrolltårn + live-oversikt — plan (13. juni 2026)

> **Visjon (Anders):** AgencyOS = ett kontrolltårn over HELE bedriften (drift + økonomi) OG trening
> (planlegging → gjennomføring → spiller). Anders ser alltid spillerne i gruppene sine, ser **hvem som
> er live akkurat nå**, og kan **snakke direkte med spilleren mens hun trener ute** (kontor↔bane, sanntid).
>
> **Metode:** Kodeverifisert av 4 parallelle agenter 13. juni (fil+linje under). Designsystemet er LÅST
> (`design-system-lint.md` + `design-porting-gate.md`) — ingen nye farger/fonter. **Ingen kodeendringer
> i denne planen.** Bygger på `docs/forenklingsplan-2026-06-13.md` + `docs/ux-arkitektur.md` v2.0.

## Låste beslutninger (denne økten)
1. **Sanntid = Supabase Realtime** (ekte øyeblikkelig, ikke polling).
2. **«Intern gruppe» = alle gruppene mine.** Ingen ny modell — dashboardet scopes til Anders' grupper/spillere.
3. **In-session kommunikasjon v1 = tekst + push.** Tale/video er IKKE v1 (eget senere delprosjekt, krever WebRTC).

---

## 1. Hva vi har vs hullet (kodeverifisert)

**Vi har nesten alt — det som mangler er sanntid + tre frakoblede ledninger:**

- ✅ `TrainingSessionV2` har `status=IN_PROGRESS` + `coachId`/`studentId`/`groupId` (`schema.prisma:2373`, `SessionStatusV2` :51) — alt for «hvem er live nå».
- ✅ **Push-stacken er komplett**: `sendPush` (`lib/push/send.ts:26`), `notify()` (`lib/notifications/index.ts:39`), service worker (`app/sw.ts:63`), subscribe/unsubscribe-API, `coach-message`-trigger (`lib/notifications/triggers.ts:111`). **Kalles aldri fra meldinger/live.**
- ✅ Rik komponentbase + gruppe-roster (`admin/grupper/[id]`) + alle KPI-aggregater (økonomi, kapasitet, SG-trend) — men de lever på separate sider, ikke på cockpit.
- 🔴 **Hull 1 — coach-melding når aldri spilleren:** `sendLiveMelding` skriver til `completedSummary.coachMessages[]` (`admin/live/[sessionId]/active/actions.ts:26`), men spillerens leser (`portal/.../live/[sessionId]/actions.ts:56`) leser kun `coachBrief.melding` — `coachMessages[]` har ingen leser. Blindvei.
- 🔴 **Hull 2 — dashboardet ser ikke live:** cockpit utleder «pågår» fra bookings-klokkeslett (`daily-brief-data.tsx:196`), leser aldri `IN_PROGRESS`. `/admin/agencyos/live` er statisk seed (`agencyos/live/data.ts:1`). `/admin/live/[sessionId]` er foreldreløs + statisk («Sist oppdatert nå» er løgn).
- 🔴 **Hull 3 — ingen sanntid finnes** i hele kodebasen (ingen Realtime/websocket/SSE/polling). Supabase-klienten finnes (`lib/supabase/client.ts`, kommentert «for realtime») men aldri brukt.
- 🟠 Cockpit er ikke coach-scopet (plattform-bredt, antar én coach). Ingen `isInternal` på `Group` — men per beslutning #2 trenger vi den ikke.

---

## 2. Arkitektur — sanntidslaget (grunnmuren)

**Supabase Realtime på to kanaler, lest av to klienter:**

```
                 ┌─────────────────────── Postgres (training_sessions_v2) ───────────────────────┐
                 │  status: PLANNED→IN_PROGRESS→COMPLETED   completedSummary.coachMessages[]      │
                 └───────────────┬───────────────────────────────────┬───────────────────────────┘
       Supabase Realtime         │ postgres_changes                  │ postgres_changes
       (RLS-respektert)          ▼                                   ▼
   ┌─────────────────────────────────────┐        ┌─────────────────────────────────────────┐
   │ AgencyOS cockpit (coach, mørkt)      │        │ PlayerHQ Live-skjerm (spiller, lyst)      │
   │ • «Live nå»-kolonne: spillere m/     │        │ • LiveActive leser coachMessages[] live   │
   │   IN_PROGRESS, drill/tid/reps        │        │ • coach-melding dukker opp som boble      │
   │ • Live-monitor-panel pr. spiller     │◄──────►│   + push på telefon (sendPush)            │
   │ • Coach skriver/dikterer → melding   │  tekst │ • spiller kan svare (samme kanal)         │
   └─────────────────────────────────────┘        └─────────────────────────────────────────┘
```

**Hvorfor dette:** Realtime «postgres_changes» speiler øktraden + meldingene uten ny tabell-arkitektur —
vi abonnerer på `training_sessions_v2` (status + `completedSummary`). Push (eksisterende stack) gir
varsel på telefon når skjermen er i lomma. RLS må eksplisitt tillate Realtime-lesing scopet til
coach/spiller (deny-all i dag — egen migrasjon med policy, jf. RLS-arkitektur).

**Datavalg for meldinger:** flytt live-melding fra blindveien `coachMessages[]` til en lesbar kanal —
enten (a) la spillerens `LiveActive` lese `coachMessages[]` direkte (minst endring), eller (b) den
dedikerte `CoachMessage`-modellen som TODO-en i `tren/actions.ts:55` peker på (renere, gjenbrukes i
innboks). **Anbefaling: (a) i v1** (raskest til live), migrér til (b) når innboks/DM samles.

---

## 3. Delprosjekter (dekomponert + sekvensert)

> Visjonen spenner flere delsystemer. Hvert delprosjekt er selvstendig testbart og leverer verdi alene.

| SP | Hva | Avhenger av | Omfang | Verdi |
|---|---|---|---|---|
| **SP1** | **Sanntids-grunnmur:** Supabase Realtime-hjelper (`lib/realtime/`) + RLS-policy (migrasjon, deny-all→coach/spiller-scope) for `training_sessions_v2` | — | M | Grunnmur for alt under |
| **SP2** | **«Live nå» på cockpit:** ny kolonne/panel som spør `IN_PROGRESS` scopet til Anders' grupper, abonnerer på Realtime → viser hvem som trener nå (drill, tid, reps) | SP1 | M | Hjertet i visjonen |
| **SP3** | **In-session coach↔spiller:** fiks Hull 1 (spiller leser coach-melding live + boble på LiveActive), coach live-monitor-panel speiler økten, `sendLiveMelding` → `notify()`+`sendPush`, spiller kan svare | SP1, SP2 | M–L | Kontor↔bane-kommunikasjon |
| **SP4** | **Kontrolltårn-cockpit:** løft økonomi-KPI + kapasitet + SG-flagg + gruppe-roster inn på cockpit; coach-scoping (kun mine spillere/grupper); ny «drift+trening»-layout | SP2 | L | Komplett oversikt |
| **SP5** | **Bulk-tildeling til gruppe:** koble de eksisterende stubb-knappene i `BatchActionBar` (`spiller-liste.tsx:538`) + «velg gruppe → tildel plan/test/økt» (bygger på `assignPlanToPlayers` som alt tar array) | — | M | Spar coach ~14→3 trykk |
| **SP6** | **Forenklingsplan «ja til alle»:** fiks player-entry-regresjon (#1), PAUSED/ABANDONED-persistens (#4), dynamiske gruppe-filter (#7), mobil-nav fra `admin-nav.ts` (#5), skyggekode M1–M4/M7 (#6), gate `/intern`+`team-gfgk` (#8) | — | S–M hver | Rydder + lukker live-feil |
| **SP7** | **Wireframing + komponent-evolusjon + Claude Design-prompter** (denne planen + neste seksjoner) | — | løpende | Designgrunnlag |

**Anbefalt rekkefølge:** SP6-player-entry (live-feil, haster) → SP1 → SP2 → SP3 → SP5 → SP4 → resten av SP6.
SP1–SP3 er «live-hjertet» (visjonens kjerne); SP4 er det store kontrolltårnet; SP5/SP6 er coach-effektivitet + opprydding.

---

## 4. Wireframes (vises inline i chat) + skjerm-anatomi

Tre nye/ombygde flater (wireframes levert separat i meldingen):

**A. Cockpit «kontrolltårn» (mørkt, desktop)** — 4 soner:
1. **Toppstripe:** hilsen + AI-kontekst + global LIVE-teller («3 spillere live nå»).
2. **«Live nå»-kolonne (NY):** kort pr. pågående økt — avatar + navn + gruppe + aktiv drill + tid + reps + pulserende lime-prikk. Klikk → live-monitor-panel. Inline «Send melding».
3. **Drift+trening-KPI-rad:** Live nå · Økter i dag · Aktive spillere · MRR · Kapasitet-% · Ventende godkjenninger (løftet fra separate sider).
4. **Innboks + Fokus (beholdes)** med inline-handling.

**B. Live-monitor + in-session chat (mørkt, desktop)** — coach åpner en pågående økt:
- Venstre: speiling av spillerens live-skjerm (drill, serie/reps, tid, fremdrift) — read-only, Realtime.
- Høyre: chat-tråd (coach-bobler) + skrivefelt med MicButton (diktering finnes). «Send» → vises på spillerens skjerm + push.

**C. Bulk-tildeling til gruppe (mørkt, modal)** — fra Stallen/gruppe:
- Velg gruppe(r) → ekspander til medlemmer (forhåndsvalgt alle) → velg plan/test/økt → «Tildel til N spillere».

(Spiller-side: live-skjermen får en coach-melding-boble + svar-felt — wireframe i lyst tema.)

---

## 5. Komponentplan (gjenbruk / utvid / ny — fra gap-analysen)

Designsystemet er LÅST → alt bygges av eksisterende tokens. Mest gjenbruk, minst nybygg:

| Behov | Gjenbruk / utvid | Ny? |
|---|---|---|
| «Live nå»-indikator drevet av status | Utvid `PulseDot` + `AgStatusDot` → `LiveBadge(isLive)` | nei |
| «Live nå»-kolonne på cockpit | Gjenbruk `ColShell` (cockpit) + `AgPlayerCell` + `LiveBadge` | liten |
| Live-monitor-panel (speil spillerens økt) | Lån struktur fra `patterns/live-session.tsx` (read-only variant) | **ja** `LiveMonitorPanel` |
| In-session chat-boble | Lån boble-stil fra `innboks/inbox-conversation.tsx` | **ja** `InSessionChat` |
| Gruppe-roster-kort | `AgPlayerCell` + `PresenceDot` + gruppe-header | liten `GroupRosterCard` |
| Bulk-assign-modal m/ gruppemål | Koble eksisterende `BatchActionBar`-stubber (`spiller-liste.tsx:538,900`) + `ui/Dialog` | utvid |
| Kontrolltårn-KPI-rad | `KpiStrip`/`KpiCard` (athletic) | nei |

**Ryddes samtidig (duplikasjon agenten fant):** `athletic/shell/*` er foreldreløst (kun demo-sider) —
bekreft kanon-shell (`admin/*`) og pensjonér; samle de 3+ meldingstråd-implementasjonene til én
`MessageThread` + `MessageComposer` (grunnmur for SP3); velg én KPI-kort-familie + én `EmptyState`.

---

## 6. Data/funksjoner å løfte til kontrolltårnet (underutnyttet i dag)

Alt finnes allerede aggregert — løftes inn på cockpit (coach-scopet):
1. **Live-status** (`TrainingSessionV2 IN_PROGRESS`) — leses aldri i dag. **Høyest.**
2. **SG-flagg/innsikt** (`SgInsight.severity`, `Signal`) — «X spillere med negativ SG-trend» → fokus-kolonne.
3. **Økonomi-dybde** (`okonomi/page.tsx`: innbetalt mnd, failed/past-due/refusjon) — kun MRR vises nå.
4. **Kapasitet** (`agencyos/uka:62`: timer/uke vs mål 28) — ingen KPI på cockpit i dag.
5. **Talent-flagg** (`TalentTracking`), **Compliance** (`admin-compliance/compliance-data.ts`), **Mål/Achievements**.
6. **Gruppe-roster** på cockpit (i dag må man til `/admin/grupper/[id]`).
7. **Dagens trening på tvers** (`GroupSchedule`) — vises kun på gruppe-detalj.

---

## 7. Claude Design-prompter

Fulle prompter lagres i det levende dokumentet `My Drive/AK Golf Group/prompt/agencyos/agencyos-prompts.md`
(seksjon 8, fast regel) og leveres i chat. Tre prompter:
1. **Kontrolltårn-cockpit** (mørkt) med «Live nå»-kolonne + drift+trening-KPI-rad.
2. **Live-monitor + in-session chat** (mørkt) — coach speiler + snakker med spilleren under økt.
3. **Bulk-tildeling til gruppe** (mørkt modal) + **coach-melding-boble på spillerens live-skjerm** (lyst).

Alle prompter låst til: AgencyOS mørkt / PlayerHQ lyst, kun Lucide, ingen emoji, navne-kanon (Øyvind
Rohjan/Anders Kristiansen), eksisterende tokens, lime kun på primærhandling + NÅ-markører.

---

## 8. Åpne spørsmål (lavt antall — det meste er besluttet)
1. **RLS for Realtime:** OK at jeg lager migrasjon som åpner Realtime-lesing scopet til coach (egen + sine grupper) og spiller (egen økt), ellers deny-all? (Sikkerhet — jeg verifiserer med advisor.)
2. **SP4-cockpit:** skal økonomi/drift bo PÅ cockpit som KPI-rad + «åpne»-lenker, eller forblir de egne sider med kun nøkkeltall løftet opp? (Anbefaling: nøkkeltall på cockpit, dybde på egne sider.)

*Baseline: `docs/forenklingsplan-2026-06-13.md`, `docs/ux-arkitektur.md` v2.0, `docs/restanse-review-2026-06-13.md`.*
