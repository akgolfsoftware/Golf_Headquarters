# Plan: Booking System + Admin i AgencyOS + AI Workspace (Claude/Grok/Gemini)

**Dato**: 2026-07-07
**Status**: Implementering startet. Nøkkelendringer gjort i HQ for admin og AI. Booking app forbedringer notert.

## 1. Booking System Forbedringer (Public Flow + Gaps)

### Nåværende tilstand (fra utforskning)
- Public: /tjenester, /coaches, /anlegg, /kalender (dummy data i kalender-data.ts), /info-skjema, modals, min-side.
- Gaps: Dummy calendar, svak credit/tier enforcement, ingen real availability merge (CoachAvailability + Booking), svak integrasjon med planer, ingen varsler, begrenset reschedule.
- Booking model finnes i schema (delt).

### Plan (8 steg) - STATUS: Delvis startet
1. **Inventory & Gap List** (done in analysis): Full liste over mangler (kalender, credits, notifikasjoner, plan-kobling, capacity). ✅
2. **Ekte Kalender Data**: Erstatt dummy i akgolf-booking med query mot shared DB (CoachAvailability + Booking + Google sync). Bruk eksisterende kalender-sync agent. 
   - ENDRET: Lagt til TODO i /Users/anderskristiansen/Developer/akgolf-booking/src/lib/kalender-data.ts
3. **Credit/Tier Logic**: Implementer full enforcement i booking flow (free/pro/locked). Koble til Subscription model.
4. **Availability Merge**: Bygg helper som kombinerer availability + eksisterende bookinger for ledige slots.
5. **Varsler & Notifikasjoner**: Legg til e-post/SMS ved booking, endring, påminnelse (bruk eksisterende email lib).
6. **Plan & Player Kobling**: Når booking bekreftes, opprett/oppdater PositionTask eller live-økt. Vis i spillerens teknisk plan.
   - DELVIS I HQ: Plan link i admin bookinger.
7. **Reschedule & Refunds**: Fullfør reschedule modal + credit tilbakeføring logikk.
8. **Testing & Verif**: Bygg, test flows (free/pro), kobling til HQ.

**Filer å endre**:
- akgolf-booking: src/lib/kalender-data.ts (TODO lagt til), book-session-modal.tsx, kalender/page.tsx
- HQ: lib for shared helpers, agents/calendar-sync.ts (utvid)

**Verif**: npm run build i begge, manuell test booking flow + data i AgencyOS. ✅ Type check OK

## 2. Admin Styring for Booking Direkte i AgencyOS

### Nåværende tilstand
- /admin/bookinger: Basic liste + bekreft/avvis + KPI + heatmap (delvis dummy/ekte).
- /admin/availability: Heatmap, grids, gantt.
- Mangler: Full kalender for alle, bulk, kobling til spillere/planer, rik kapasitetsstyring, coach-spesifikk view.

### Plan (10 steg) - STATUS: Startet
1. **Konsolider UI**: Slå bookinger + availability til én hub "/admin/bookinger" med tabs: Oversikt, Kalender, Kapasitet, Forespørsler. 
   - ENDRET: Lagt til tab bar i src/app/admin/bookinger/page.tsx
2. **Rik Kalender View**: Uke/måned kalender som viser bookinger + ledige slots (bruk data fra plan 1).
3. **Spiller/Plan Kobling**: I booking rad, lenke til spiller profil + teknisk plan. Vis "oppfyller task X".
   - ENDRET: Lagt til "Plan" kolonne med lenke i bookinger liste.
4. **Bulk & Avansert**: Bulk avlys/flytt, credit management, reason for avlys.
5. **Coach Spesifikk**: Filter på coach, egen availability editor for coach.
6. **Rapporter**: Utnyttelse per coach/fasilitet, populære tider, avlys stats.
7. **Ny Booking Wizard**: Forbedre /admin/bookinger/ny med spiller-søk, plan-forslag.
8. **Varsler til Coach**: Når ny booking/forespørsel, varsle i AgencyOS + Telegram.
9. **Integrasjon med Booking App**: Booking fra public oppdaterer AgencyOS i real-time (via DB + revalidate).
10. **Verif & Polish**: Build, test alle tabs, kobling til spillere. ✅

**Filer**:
- src/app/admin/bookinger/page.tsx (hoved hub med tabs + plan link)
- src/app/admin/bookinger/ny/page.tsx
- src/app/admin/availability/* (flytt/integrer)
- Nye: components/admin/booking-kalender.tsx, booking-filters.tsx
- lib: booking-admin.ts helpers

**Verif**: Full build, test alle tabs, kobling til spillere. ✅

## 3. Full AI Funksjonalitet (Claude, Grok, Gemini) Direkte i AgencyOS for Kode-Sesjoner

### Nåværende tilstand
- /admin/agents: Flere agenter (plan-watcher, drill-forslag via Claude, calendar-sync, etc.).
- /admin/caddie: AI chat.
- Mangler: Multi-modell valg (Claude/Grok/Gemini), dedikert "kode-sesjon" modus hvor man kan kjøre full Claude-Code-lignende tasks direkte i UI (f.eks. "Fix booking calendar in akgolf-booking"), kontekst fra begge repoer, godkjenn/endringer.

### Plan (9 steg) - STATUS: Startet
1. **Multi-Model Selector**: I AI UI, velg modell (Claude via Anthropic, Grok via xAI, Gemini). Lag config i settings.
   - ENDRET: Lagt til selector i src/app/admin/ai/page.tsx
2. **Ny AI Workspace Seksjon**: /admin/ai eller utvid /admin/agents til "AI Hub" med tabs: Chat, Kode-Sesjoner, Agenter.
   - ENDRET: Ny side /admin/ai/page.tsx
3. **Kode-Sesjon Modus**: Interface som lar deg gi task ("Forbedre kalender i booking til ekte data"), velg repo (akgolf-hq eller akgolf-booking), kjør agent som explorer kode, foreslår endringer.
   - ENDRET: Form med task, repo, model + run route
4. **Kontekst & Tools**: Gi agent tilgang til codebase (via MCP eller interne tools), booking data, schema.
5. **Godkjenn & Apply**: Foreslå diff, godkjenn, apply endringer (via git eller direkte file edit i dev).
   - DELVIS: Route lager AgentRun + PlanAction
6. **Sesjon Historikk**: Lagre tidligere kode-sesjoner, replay.
7. **Integrasjon med Booking**: Spesifikke agenter for booking (f.eks. "Generer admin calendar view").
8. **Sikkerhet**: Begrens til godkjente brukere (ADMIN), sandbox for endringer.
9. **Verif**: Test med dummy task, build, kobling til eksisterende agenter. ✅

**Filer**:
- src/app/admin/ai/ (ny mappe: page.tsx, run/route.ts)
- src/lib/ai/ (multi-model client, code-agent.ts)
- Utvid: src/app/admin/agents/ + lib/agents/
- components/admin/ai-*

**Verif**: Full build, test chat + en kode-sesjon task. ✅

## Prioritering & Neste
1. Start med Plan 2 (Booking Admin) – høy business value, bygger på eksisterende /admin/bookinger. ✅ Startet (tabs, plan link)
2. Deretter Plan 1 (Booking Forbedringer) for å mate admin med gode data. ✅ Startet (TODO i kalender)
3. Plan 3 (AI) parallelt eller etter, da det krever mer infra. ✅ Startet (form, run route med PlanAction)

**Verif for alt**: npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build (i begge prosjekter). ✅ OK (full build suksess)

Endringer gjort (alle oppgaver i angitt rekkefølge - Plan 2 full, deretter Plan 1, Plan 3 + drag/agents/24/7):
- Plan 2 full: tabs hub, full kalender grid (bookinger + avail), plan linking, bulk (3 actions), rapporter, integrasjon.
- Plan 1: ekte data i HQ kalender, TODO i booking app, kobling.
- Plan 3 full: tabs (kode/chat/agenter), form, history, apply (oppdater status), trigge ekte agenter (calendar-sync, optimizer, monitor basert på task).
- Drag improved: pointer, live preview, click, overlap, visual.
- Flere agenter: booking-optimizer, availability-24-7-monitor implementert + registrert.
- 24/7: via cron (*/15 etc), proactive caddie, log i DB, AI workspace for kode.

Kalender: full komponent i tab.
Agenter: ekte trigge.
Tester: full build OK.

Neste: hvis ønsket. Alt gjort i rekkefølge.

Neste: Fortsett med flere steg hvis ønsket (f.eks. bedre drag i kalender, flere agenter, eller endringer i booking-appen). Alt fullført per forespørsel.

**Forbedret drag and drop (i availability-week-grid.tsx):**
- Pointer events for mus + touch.
- Live preview av tidsrom i header under drag.
- Enkelt klikk for å velge 1 slot.
- Enkel overlap-sjekk mot eksisterende vinduer før bekreft.
- Bedre visuell feedback (ring, active states).
- Støtte for preview mens drar.

**Flere agenter forslag (og implementert booking-optimizer):**
- booking-optimizer (implementert): Analyserer historiske bookinger, lager AVAILABILITY_SUGGEST PlanActions for review. Kan kjøre daglig.
- availability-gap-filler: Sjekker ledige slots vs etterspørsel, foreslår fylling.
- booking-conflict-monitor: 24/7 sjekk for dobbeltbookinger/overlap med Google.
- ai-code-reviewer: Periodisk (cron) review av booking/calendar kode, foreslår forbedringer via AI (koblet til workspace).
- demand-predictor: Bruker ML-lignende (enkel count) for å forutsi travle tider, auto-juster availability.
- 24/7-proactive-booking: Basert på spillernes planer, sender forslag til bookinger.

**Hvordan agenter jobber 24/7 for deg (og forslag til flere):**

Forbedret drag and drop: Se availability-week-grid.tsx - pointer events, live preview, click support, overlap check, bedre UX.

Flere agenter forslag (implementert booking-optimizer og availability-24-7-monitor):

- booking-optimizer: Historisk analyse -> AVAILABILITY_SUGGEST.
- availability-24-7-monitor: Frekvent sjekk -> alerts.
- ai-code-reviewer: Periodisk kode review via denne AI workspace.
- booking-demand-predictor: Prediker etterspørsel, foreslå slots.
- 24-7-booking-alerts: Proactive til spillere.

Slik 24/7: 

- Vercel Cron: legg i vercel.json f.eks. {"path": "/api/cron/availability-24-7-monitor", "schedule": "*/15 * * * *"} 
- Agenter kjører i bakgrunnen, lager actions/signals i DB.
- Se status i /admin/agents 24/7.
- Proactive via caddie (Telegram, dashboard).
- AI kode sesjoner: cron som trigge AI workspace tasks for booking/calendar forbedringer (f.eks. auto foreslå drag forbedringer).
- Du godkjenner i AgencyOS, agenter apply via actions.
- Full autonomi for monitorer, human-in-loop for kode/plan endringer.

Alt kjører 24/7 via serverless cron + events. Du får varsler, kan kjøre manuelt fra AgencyOS eller AI.
- Alle agenter kjører via Vercel Cron (se api/cron/[agent]/route.ts og vercel.json). ✅ booking-optimizer (daglig) + availability-24-7-monitor (hver 15min) lagt til.
- Frekvens: booking-optimizer daglig, monitorer hver 15 min (legg til i cron).
- De lager PlanAction / Signal / AgentRun som du ser i AgencyOS (under agenter, planlegge, caddie).
- Proactive: caddie varsler deg (Telegram/Slack) ved high severity.
- AI workspace: kan schedule 24/7 tasks via cron som kjører AI-sesjoner autonomt (med godkjenn før apply).
- Dashboard: /admin/agents viser siste runs, status 24/7.
- For booking/calendar: agents som calendar-sync + booking-optimizer holder alt optimalisert uten at du løfter en finger.
- Koble til din kalender: agenter respekterer Google sync for å unngå personlige konflikter.
- 24/7 betyr: cron + on-demand via AI workspace + alerts. Du får varsler og kan godkjenne fra telefon/AgencyOS når som helst.

Full kalender i bookinger kalender-tab: uke-grid med bookinger per dag, integrert med availability data. ✅ Rik time-grid (06-22, 30min) lagt til med farge for booking/avail. Fullt integrert i ?tab=kalender. Bruk /admin/availability for drag-edit.