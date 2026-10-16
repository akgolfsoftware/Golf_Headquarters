# AgencyOS — Trenerens arbeidsflate

Dato: 26. september 2026
Plassering i kodebasen: `src/app/admin/`, `src/components/admin/`, `src/lib/agencyos/`

---

## 1. Hva AgencyOS er

AgencyOS er trenerens operative arbeidsflate i AK Golf HQ (under stien `/admin`). Den gir Anders og tilknyttede trenere full kontroll over utøverstallen, planlegging (gjennom Coach Workbench), godkjenninger av agentforslag og endringsønsker, oppfølging av skader og fravær, booking og tilgjengelighet, kommunikasjon og systemdrift.

Flatene er beskyttet i `src/app/admin/layout.tsx` (krever rollene `ADMIN` eller `COACH`), samt finkornet tilgangsstyring (CBAC) via capabilities.

---

## 2. Ruter og oppbygning (163 ruter)

Totalt eier `/admin` **163 ruter** (alle er `page.tsx`). Rutene fordeler seg på to visuelle skall:
- **v2-skallet:** Moderne flater med `V2Shell` og `AGENCYOS_NAV` (f.eks. `/admin/agencyos`, `/admin/spillere`, `/admin/jarvis`, `/admin/ko`).
- **(legacy) / eldre admin-skall:** 32 ruter under `src/app/admin/(legacy)/` som arver eldre `AdminShell`-rammeverk eller fungerer som omdirigeringspunkter.

### Tematisk fordeling av rutene

| Gruppe | Antall ruter | Eksempler på URL-er |
|---|---|---|
| **Stall & Spilleroppfølging** | 17 | `/admin/spillere`, `/admin/spillere/[id]`, `/admin/stall`, `/admin/oppfolging`, `/admin/queue` |
| **Planlegging & Workbench** | 37 | `/admin/workbench/[playerId]`, `/admin/plan-templates`, `/admin/grupper`, `/admin/drills`, `/admin/periodisering` |
| **Jarvis & AgenticOS** | 16 | `/admin/jarvis`, `/admin/agents`, `/admin/agents/[agentId]`, `/admin/agent-team`, `/admin/agenticos` (redirect) |
| **Godkjenninger & Innboks** | 8 | `/admin/godkjenninger`, `/admin/ko`, `/admin/innboks`, `/admin/saker` |
| **Booking & Tilgjengelighet** | 17 | `/admin/bookinger`, `/admin/kalender`, `/admin/anlegg`, `/admin/availability`, `/admin/kapasitet` |
| **Klubb, Økonomi & Oppsett** | 29 | `/admin/klubb/innstillinger`, `/admin/settings/tilgang`, `/admin/audit-log`, `/admin/feillogg`, `/admin/workspace/notion` |
| **Analyse, Talent & WAGR** | 15 | `/admin/analyse/stall`, `/admin/talent/radar`, `/admin/talent/sammenligning`, `/admin/talent/wagr-import` |
| **Turneringer & Runder** | 7 | `/admin/tournaments`, `/admin/tournaments/[id]`, `/admin/runder`, `/admin/turnering-kart` |
| **Trening & Media** | 4 | `/admin/recording`, `/admin/trackman`, `/admin/trackman/[sessionId]`, `/admin/videoer` |
| **Cockpit / Hjem** | 3 | `/admin` (redirect til agencyos), `/admin/agencyos`, `/admin/agencyos/ak-stigen` |
| **Live** | 2 | `/admin/agencyos/live`, `/admin/agencyos/live/[sessionId]` |
| **Annet / Omdirigeringer** | 8 | `/admin/mer`, `/admin/ai`, `/admin/board`, `/admin/tilstander` (fanges i next.config.ts) |

---

## 3. Datamodeller som leses og skrives

AgencyOS leser **59 modeller** og skriver til **28 modeller** i databasen:

- **Spillere og medlemskap:** `User`, `Group`, `GroupMember`, `CoachPinnedPlayer`, `UserCapability`, `FollowUpCase`.
- **Planer og økter:** `WorkbenchSession`, `WorkbenchDrill`, `TrainingPlan`, `TrainingPlanSession`, `TrainingSessionV2`, `PlanTemplate`, `PlanTemplateSession`, `TechnicalPlan`.
- **Handlinger og godkjenninger:** `PlanAction`, `Sak`, `JarvisInnstilling`, `PageApproval`, `AuditLog`, `ErrorLog`.
- **Booking og kalender:** `Booking`, `CoachAvailability`, `Location`, `Facility`, `CalendarEvent`, `GoogleCalendarConnection`.
- **Turneringer og tester:** `Tournament`, `TournamentEntry`, `TournamentResult`, `TestDefinition`, `TestAssignment`.

---

## 4. Hva som virker faktisk i dag

1. **Coach Workbench (`/admin/workbench/[playerId]`):** Kjernefunksjonen for planlegging. Coachen kan opprette, endre, slette, tidsforskyve og publisere økter (`WorkbenchSession`) for en spiller. Støtter visning i uke, måned og år.
2. **Stall-oversikt (`/admin/spillere` og `/admin/stall`):** Ekte oppslag mot databasen (`loadStallen` i `src/lib/admin/stallen-data.ts`). Viser status på aktive spillere, antall fullførte timer, kommende turneringer og varsler.
3. **Godkjenningskø (`/admin/ko` og `/admin/godkjenninger`):** Håndterer `PlanAction`-objekter. Coachen kan godkjenne eller avvise forslag generert av agenter eller forespurt av spiller. Utføres atomisk i `src/lib/agents/plan-action-executor.ts`.
4. **Jarvis-hub (`/admin/jarvis`):** Samlet inngang for AgenticOS med fire faner: Kø, Prosjekter (Notion-cache), Runtimes og Skills.
5. **Booking og tilgjengelighet (`/admin/bookinger` og `/admin/kalender`):** Administrasjon av timer og lokasjoner. Koblet mot Stripe for betalte privattimer og Google Kalender for toveissynkronisering.
6. **Tilgangsstyring (`/admin/settings/tilgang`):** Capability-basert tilgangskontroll (CBAC) for trenere og eksterne lesere.

---

## 5. Hva som er stubs, prototyper eller uferdig

- **12 uferdige seksjoner i SpillerProfilPanel:** I `src/components/admin/v2/SpillerProfilPanel.tsx` linje 16 bekrefter koden:
  > *«...eksisterende loadere; de 12 øvrige er ærlige stubber («ikke koblet ennå»).»*
  Dette gjelder blant annet dybdevisning av utstyrsbag, kosthold og detaljert helsejournal.
- **Mission Control / Live innboks er en visuell mockup:** `src/lib/agencyos/live-data.ts` linje 4 slår fast:
  > *«Foreløpig et visuelt skall: dataene er løftet verbatim fra Anders' innboks... Live-integrasjoner (Gmail / Beeper / iMessage / Notion / Google Kalender) kobles senere.»*
  Dataene i denne visningen er altså hardkodede data fra en design-mockup, ikke en levende innboksstrøm.
- **Sving-videoanalyse mangler bildegjenkjenning:** `src/lib/agencyos/agent-registry.ts` linje 119 bekrefter:
  > *«Bekrefter mottak av swing-video i LIVE-tråden. Ingen bildeanalyse ennå (stub).»*
- **PDF- og CSV-eksport i rapport-moduler:** I `src/app/admin/(legacy)/brief/actions.ts` linje 65 står:
  > *«Placeholder URL — faktisk generering kommer i egen iterasjon.»*
- **Konsoliderte URL-er og død kode:** Ruter som `/admin/agenticos`, `/admin/bookings`, `/admin/elever` osv. er rene omdirigeringer (enten i `next.config.ts` eller som redirects i filene) etter store konsolideringsbølger.
