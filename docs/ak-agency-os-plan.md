# AK Agency OS — plan (personlig kommandosenter)

> Status: godkjent design 2026-06-25. Bygges i 4 etapper. Eier: Anders.
> **Fremdrift:** Etappe 1 ✓ (commit 42ed0f92) · Etappe 2 ✓ (Prosjekter + Kalender). Neste: Etappe 3 (Agent-team).
> Dette er et **personlig produktivitets-OS** for Anders — ikke coach-appen.
> Coach-appen «AgencyOS» bor på `/admin/agencyos` og røres ikke. Dette bor på **`/kommando`**.

## 1. Hva det er (én setning)

Ett AK-merket kommandosenter der Anders styrer alle AI-verktøyene sine (Claude, Gemini, Grok, Ollama
+ status på Cowork / Grok Build / Claude Code), ser dagen sin, og lar AI-agenter jobbe på oppgaver og
prosjekter — alt på ett sted.

## 2. Hvor det bor (gjenbruk, ikke nybygg)

- **Samme kodebase** som AK Golf HQ (Next.js 16 + Prisma 7 + Supabase + Tailwind v4).
- **Egen rute:** `/kommando` (eget route-group `src/app/(kommando)/` eller `src/app/kommando/`).
  Brand-label i UI: «AK · AGENCY OS». Navnet `/admin/agencyos` er opptatt av coach-appen — ikke gjenbruk.
- **Tilgang:** kun eier (Anders). Gate på capability/rolle som de andre admin-flatene
  (se memory `cbac-capability-gating`), ikke ny auth.
- **Arver fra dagens system:**
  - Designtokens: `src/app/globals.css` (mørkt «terminal»-tema — se §6).
  - Komponenter: `src/components/athletic/` (kort, KPI, badge, avatar, pulse-dot).
  - Kalendere: `src/components/athletic/calendars/` (month-grid, week-grid, day-planner, year-plan-gantt …).
  - Chat-motor: `src/app/api/caddie/chat/route.ts` (AI SDK-mønsteret som ALLEREDE funker).
  - Google-kalender: `src/lib/google-calendar.ts` + `src/lib/agents/calendar-sync.ts`.

## 3. De 6 modulene

| # | Modul | Hva den gjør | Kjerneelementer |
|---|---|---|---|
| 1 | **Dashboard** | Kommandosenter: dagen + AI-status + nøkkeltall | KPI-strip (mono-tall), «AI-agenter», «Agent-team jobber», «I dag», «Oppgaver» |
| 2 | **Kalender** | Dagen/uka/måneden/året | Gjenbruk `calendars/` + Google-kalender-data |
| 3 | **Agenter (chat)** | Snakk med hver AI, hver med sin rolle | Modellvelger, samtaletråder, strømmende svar |
| 4 | **Oppgaver** | To-do med status og prioritet | Liste + prioritet-chip + «haster» |
| 5 | **Prosjekter** | Samle arbeid (også AK Golf-prosjekter) | Prosjektkort, knytt oppgaver + AI-kjøringer til prosjekt |
| 6 | **Agent-team** | Flere AI-er på én oppgave, med fremdrift | Team-kjøring, steg-for-steg, progress |

## 4. Hvordan AI-ene kobles på (ærlig om lett vs. tungt)

- **Lett (Etappe 1):** Claude, Gemini, Grok, Ollama via server-rute `src/app/api/kommando/chat/route.ts`.
  - **Gjenbruk caddie-mønsteret** (`src/app/api/caddie/chat/route.ts`): `streamText` + `toUIMessageStreamResponse()`,
    `@ai-sdk/anthropic` direkte for Claude, normaliser `baseURL` til å ende på `/v1` (se `gotchas.md`).
  - Provider-register: Claude → `@ai-sdk/anthropic` (`claude-opus-4-8` / `claude-sonnet-4-6`).
    Gemini / Grok (xAI) / Ollama → OpenAI-kompatible endepunkter (egne `baseURL` + nøkkel; Ollama = lokal `http://localhost:11434/v1`).
  - Nøkler i `.env.local` (aldri i kode).
- **Tyngre (Etappe 4):** Cowork, Grok Build, Claude Code er egne programmer — vises som **status/logg**, ikke full fjernstyring i v1.
- **Mest avansert (Etappe 3):** Agent-team (flere AI-er sekvensielt/parallelt på én oppgave).

## 5. Datamodell (additivt — følg gotchas)

Nye tabeller, lagt til **trygt** (CREATE TABLE IF NOT EXISTS via `db execute`, plain `userId String`, ingen `@relation`
— se `gotchas.md`, IKKE `migrate dev`/`db push`):

- `KommandoProject` — id, userId, navn, farge, status, opprettet.
- `KommandoTask` — id, userId, projectId?, tittel, status, prioritet, forfaller?, opprettet.
- `KommandoChat` / `KommandoMessage` — samtaletråder per modell (speil caddie `conversations`-mønsteret).
- `KommandoAgentRun` — id, userId, projectId?, modell, prompt, status, resultat, opprettet (grunnlag for Agent-team).

Kalender leses fra **eksisterende** Google-kalender-integrasjon — ingen ny kalendertabell i v1.

## 6. Design (riktig AK — eksakte verdier fra `globals.css`)

Mørkt «terminal»-tema (`.dark`):

| Token | HEX |
|---|---|
| background | `#07100C` |
| card / popover / secondary / muted | `#11221A` |
| foreground | `#EAF2EC` |
| muted-foreground | `#9DB0A4` |
| primary / accent (lime) | `#D1F843` |
| primary-foreground (tekst på lime) | `#0A1F17` |
| border | `#243A2E` |
| success `#4FD08A` · warning `#E8B43C` · info `#5AA9F0` · destructive `#F0683E` | |

- Fonter: Inter (UI), Inter Tight (display/overskrift), JetBrains Mono (alle tall + eyebrows).
- Ikoner: **kun** `lucide-react`, 24px / 1.5px stroke.
- 8pt-grid, men data-tett (Bloomberg-tetthet) er tillatt på dashboard/lister (`p-3`, `gap-3`).
- **Lime-disiplin:** lime KUN på aktiv/NÅ (aktiv agent, live-prikk, progress, aktiv nav). Aldri som flatefyll overalt.

## 7. Etapper (verdi etter hver — ikke vent på alt)

| Etappe | Leveranse |
|---|---|
| **1 — Kjernen** | `/kommando` dashboard-skall + Agenter-chat mot 4 modeller (modellvelger) + enkel oppgaveliste. Tabeller: `KommandoTask`, `KommandoChat`, `KommandoMessage`. |
| **2 — Struktur** | Prosjekter (`KommandoProject`) + Kalender-modul (gjenbruk `calendars/` + Google-data). Knytt oppgaver til prosjekt. |
| **3 — Team** | Agent-team: `KommandoAgentRun`, flere AI-er på én oppgave med fremdrift (som mockup). |
| **4 — Finpuss** | Hurtigtaster, mobil-layout, status-panel for Cowork / Grok Build / Claude Code. |

## 8. Scope-grenser (YAGNI — bygges IKKE i v1)

- Ingen full fjernstyring av Cowork/Grok Build/Claude Code (kun status).
- Ingen fakturering/abonnement (personlig verktøy).
- Ingen flerbruker/team-tilgang (kun Anders).
- Ingen ny auth — gjenbruk eksisterende.

## 9. Verifikasjon (før hver commit — CLAUDE.md)

```bash
npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build
```

## 10. Prompt for Claude Code — Etappe 1

Lim følgende inn i Claude Code (kjørt fra `~/Developer/akgolf-hq`):

```
Oppgave: Bygg Etappe 1 av AK Agency OS («Kommandosenter») i akgolf-hq.

Les FØRST docs/ak-agency-os-plan.md — den er fasit for hele visjonen. Du skal bygge KUN Etappe 1.
Start i Plan Mode: lag nummerert plan (maks 10 steg), vent på godkjenning før du koder.

SCOPE ETAPPE 1 (ikke mer):
1. Ny rute /kommando (eget område i src/app/), mørkt tema (.dark), gated til eier som de andre
   admin-flatene (capability/rolle — gjenbruk eksisterende auth, ikke ny).
2. Dashboard-skall: topbar («AK · AGENCY OS» + hilsen + dato), venstre ikon-rail (6 moduler;
   kun Dashboard/Agenter/Oppgaver aktive i E1), KPI-strip (mono-tall), paneler «AI-agenter»,
   «I dag» (placeholder til E2) og «Oppgaver».
3. Agenter (chat): modellvelger (Claude, Gemini, Grok, Ollama), strømmende svar, tråder lagret i DB.
   GJENBRUK mønsteret i src/app/api/caddie/chat/route.ts (streamText + toUIMessageStreamResponse,
   @ai-sdk/anthropic for Claude, baseURL normalisert til /v1 — se .claude/rules/gotchas.md).
   Gemini/Grok/Ollama via OpenAI-kompatible endepunkter (egne baseURL+nøkkel i .env.local;
   Ollama lokal http://localhost:11434/v1). Ny rute src/app/api/kommando/chat/route.ts.
4. Oppgaver: enkel liste (opprett/fullfør/slett) + prioritet + «haster»-chip.
5. Datamodell ADDITIVT (følg gotchas.md: CREATE TABLE IF NOT EXISTS via db execute mot DIRECT_URL,
   plain userId String, ingen @relation, IKKE migrate dev / db push): KommandoTask, KommandoChat,
   KommandoMessage. Deretter npx prisma generate.

DESIGN (eksakt, fra globals.css .dark): bg #07100C, card #11221A, foreground #EAF2EC,
muted #9DB0A4, lime #D1F843 (KUN på aktiv/NÅ), border #243A2E. Fonter Inter / Inter Tight /
JetBrains Mono (alle tall = mono). Ikoner kun lucide-react. Gjenbruk src/components/athletic/.
Ikke hardkod hex utover eksisterende tokens.

IKKE i E1: Kalender, Prosjekter, Agent-team, mobil-layout, Cowork/Grok Build-status (kommer E2–E4).

REGLER: JSON fra DB valideres med zod. Ingen `any` uten grunn. All UI-tekst norsk bokmål (æ, ø, å).
Pek på eksisterende mønstre, bygg ikke på nytt det som finnes.

VERIFISER før commit:
  npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build
Commit (Conventional Commits, engelsk) + push til main når E1 er grønn.
```
