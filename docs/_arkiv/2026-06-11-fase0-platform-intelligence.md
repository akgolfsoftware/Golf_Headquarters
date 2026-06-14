# Platform Intelligence System — Implementation Plan (Fase 0)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generer 6 platform-dokumenter simultant via parallell Workflow, slik at enhver AI-agent kan jobbe med full kontekst fra dag én.

**Architecture:** Én Workflow med tre faser — Discovery (les kildekode), Generate (6 parallelle doc-agenter), Review (adversarisk kritiker per doc). Agentene skriver filene direkte til disk. Workflow-resultat commit-es til main.

**Tech Stack:** Next.js 16, Prisma 7, Supabase, Tailwind v4. Workflow-verktøy i Claude Code. Bash for dir-oppretting og git.

---

## Filer som opprettes

| Fil | Ansvar |
|---|---|
| `docs/platform/PLATFORM-PRD.md` | Visjon, brukertyper, produktbeskrivelser, suksesskriterier |
| `docs/platform/AGENT-BRIEF.md` | Lese-start for nye agenter — full kontekst på 5 min |
| `docs/platform/BUSINESS-RULES.md` | SG-logikk, abonnement, booking, tier, dual-track |
| `docs/platform/DATA-MODEL.md` | Prisma-entiteter på norsk, relasjoner, RLS |
| `docs/platform/user-flows/playerhq.html` | Interaktivt flyt-kart for spillerreisen |
| `docs/platform/user-flows/agencyos.html` | Interaktivt flyt-kart for coach-reisen |
| `docs/platform/user-flows/booking.html` | Booking-flyten ende til ende |
| `docs/platform/screen-context/all-screens.md` | 30 nøkkelskjermer: formål, data, flyt, fasit-peker |

---

## Task 1: Opprett mappestruktur

**Filer:** Ingen — kun kataloger

- [ ] **Steg 1: Opprett alle platform-mapper**

```bash
mkdir -p /Users/anderskristiansen/Developer/akgolf-hq/docs/platform/user-flows
mkdir -p /Users/anderskristiansen/Developer/akgolf-hq/docs/platform/screen-context
```

Forventet output: ingen feil

- [ ] **Steg 2: Legg til .superpowers i .gitignore**

Sjekk om `.superpowers/` allerede er i `.gitignore`:

```bash
grep -q '.superpowers' /Users/anderskristiansen/Developer/akgolf-hq/.gitignore || echo '.superpowers/' >> /Users/anderskristiansen/Developer/akgolf-hq/.gitignore
```

---

## Task 2: Kjør Platform Intelligence Workflow

**Filer:** Skriver alle 8 docs-filer direkte

- [ ] **Steg 1: Kjør Workflow-en**

Kjør denne Workflow-en via Workflow-verktøyet i Claude Code. Scriptet nedenfor er komplett og selvforsynt:

```javascript
export const meta = {
  name: 'platform-intelligence',
  description: 'Generate AK Golf HQ Platform Intelligence — 6 docs parallelt',
  phases: [
    { title: 'Discovery', detail: 'Les Prisma, routes, design, business logic' },
    { title: 'Generate', detail: '6 parallelle dokumentagenter skriver til disk' },
    { title: 'Review', detail: 'Adversarisk kritiker per dokument, fix kritiske funn' },
  ],
}

const REPO = '/Users/anderskristiansen/Developer/akgolf-hq'

// ── FASE 1: DISCOVERY ──────────────────────────────────────────────────────
phase('Discovery')
log('Leser Prisma-schema, ruter, designfiler, domenelogikk...')

const [schema, routes, masterPlan, businessLogic, claudeContext] = await parallel([
  () => agent(
    `Read the complete file at ${REPO}/prisma/schema.prisma. Return the full raw content.`,
    { label: 'prisma-schema' }
  ),
  () => agent(
    `List all files matching **/page.tsx and **/route.ts under ${REPO}/src/app/ recursively using the Glob tool. For each file, return its path relative to src/app/ and a one-sentence purpose inferred from the path. Group into sections: portal/ (PlayerHQ), admin/ (AgencyOS), booking/, auth/, (marketing)/. Return as plain text.`,
    { label: 'route-tree' }
  ),
  () => agent(
    `Read the file ${REPO}/docs/MASTER-SKJERMPLAN.md. Return the full content.`,
    { label: 'master-plan' }
  ),
  () => agent(
    `Read these files and return their contents, each preceded by a === FILENAME === header:
     1. ${REPO}/src/lib/domain/sg.ts
     2. ${REPO}/src/lib/domain/hcp.ts
     3. ${REPO}/src/lib/domain/pyramid-weighting.ts
     Return the combined content.`,
    { label: 'domain-logic' }
  ),
  () => agent(
    `Read these files and return their contents, each preceded by a === FILENAME === header:
     1. ${REPO}/CLAUDE.md
     2. ${REPO}/.claude/rules/design-porting-gate.md
     3. ${REPO}/AGENTS.md
     Return the combined content.`,
    { label: 'claude-context' }
  ),
])

log('Discovery ferdig. Starter dokumentgenerering...')

// ── FASE 2: GENERATE ───────────────────────────────────────────────────────
phase('Generate')

const CTX = `PRISMA SCHEMA:\n${schema}\n\nROUTE TREE:\n${routes}\n\nDOMAIN LOGIC:\n${businessLogic}\n\nCLAUDE/RULES:\n${claudeContext}`
const PLAN_CTX = `MASTER SCREEN PLAN:\n${masterPlan}`

const [prd, brief, rules, model, flows, screens] = await parallel([

  () => agent(`
You are writing PLATFORM-PRD.md for AK Golf HQ — a Next.js/Supabase/Prisma golf coaching platform.

${CTX}

Write a comprehensive but concise PRD in Norwegian bokmål covering:

# AK Golf HQ — Platform PRD

## Visjon
[One sentence describing what AK Golf HQ is and who it's for]

## Brukertyper
For each of the 4 user types (Spiller, Coach, Forelder, Admin):
- Hvem er de?
- Primært mål med appen
- Smertepunkt uten appen

## Produkter
For each of 4 products (PlayerHQ /portal, AgencyOS /admin, Booking /booking, Marketing /(marketing)):
- Formål
- Primær bruker
- Kjerneflyt (3-5 steg)
- Suksesskriterium

## Forretningsmodell
- Abonnement: gratis (3 tilfeller) vs 300 kr/mnd
- Performance / Performance Pro: coaching-pakker (IKKE app-nivåer)
- ELITE: finnes i Prisma-enum men vises ALDRI i UI
- Booking av enkeltøkter

## Suksesskriterier (konkrete)
[5 målbare mål for når appen er "ferdig" og "vellykket"]

## Ikke i scope
[Hva er bevisst utelatt og hvorfor]

SKRIV kun Markdown. Maks 900 ord totalt. Vær konkret.

After writing the content, use the Write tool to save it to: ${REPO}/docs/platform/PLATFORM-PRD.md
Return "DONE: PLATFORM-PRD.md" when complete.
`, { label: 'gen-prd' }),

  () => agent(`
You are writing AGENT-BRIEF.md for AK Golf HQ. This is the mandatory first-read for any AI agent working on this codebase.

${CTX}

Write in Norwegian bokmål. An agent reading this must have full working context in 5 minutes. Cover:

# AK Golf HQ — Agent Brief

## Hva dette er
[3 sentences: what the platform is, who it serves, what's unique]

## Stack (eksakte versjoner — ikke oppgrader uten beslutning)
- Next.js 16 (App Router, TypeScript strict, Turbopack)
- React 19, Prisma 7, Supabase (Postgres + Auth + Realtime)
- Tailwind CSS v4 (CSS-first via @theme i globals.css — INGEN tailwind.config.ts)
- Inter + Inter Tight + JetBrains Mono via next/font/google
- Lucide React — eneste icon-bibliotek
- npm (ikke yarn/pnpm)

## Mappestruktur
[Brief description of each major folder: src/app/(portal|admin|booking|marketing), src/components/(athletic|ui|shared), src/lib/, prisma/, scripts/]

## Designsystem — ÉN kilde til sannhet
- Tokens: src/app/globals.css (HSL-trippel uten hsl()-wrapper)
- Komponenter: src/components/athletic/ (list key components)
- FORBUDT: hardkode hex, lage ny tokens.css, importere fra wireframe/

## Låste beslutninger (ikke diskuter — bare følg)
List ALL locked decisions from CLAUDE.md and design-porting-gate.md exceptions

## Kjente fallgruver
List specific gotchas from CLAUDE.md and any others you find in the codebase

## Kvalitetsgate per skjerm
5-stegs design-porting-gate: build from source → screenshot → adversarial diff → fix → 0 avvik
Alle 6 haker i MASTER-SKJERMPLAN grønne før skjerm er «ferdig»

## Verifikasjon (kjør etter enhver endring)
npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build

After writing, use Write tool to save to: ${REPO}/docs/platform/AGENT-BRIEF.md
Return "DONE: AGENT-BRIEF.md" when complete.
`, { label: 'gen-brief' }),

  () => agent(`
You are writing BUSINESS-RULES.md for AK Golf HQ.

${CTX}

Document every business rule that CANNOT be inferred from code alone. Write in Norwegian bokmål.

# AK Golf HQ — Business Rules

## Abonnement og tilgang
- Gratis PlayerHQ-tilgang: 3 eksakte tilfeller (prøveperiode, coaching-pakke, gruppe)
- Betalt tilgang: 300 kr/mnd for alle andre
- Performance / Performance Pro: antall coaching-credits per mnd (2 / 4), IKKE app-nivåer
- ELITE-enum finnes i Prisma men skal ALDRI eksponeres i UI

## SG-kalibrering (Strokes Gained)
- De 4 kategoriene: OTT (Off the Tee), APP (Approach), ARG (Around the Green), PUTT
- Baseline-kilder: Broadie for OTT/APP/ARG, Team Norway IUP Ref-ark for PUTT (1m → +0.13)
- Fortolkning: positivt tall = over gjennomsnitt, negativt = under
- Kalibrering: skip=false, 168/168 tester grønne (ref: src/lib/domain/sg.ts)

## Booking-regler
- Lokasjon = parent (f.eks. GFGK), Fasilitet = child (Performance Studio)
- Booking går alltid mot Fasilitet, ikke Lokasjon
- Coaching-credits: spiller booker selv fra PlayerHQ-profilen

## Live-økt dual-track (IKKE merge uoppfordret)
- Spor A: TrainingPlanSession + /portal/live (spillerens økt)
- Spor B: TrainingSessionV2 + /admin/live + workbench (coachens økt)
- Sameksisterer bevisst — to forskjellige use cases

## Demo-data vs ekte data
- Demo-spiller: Øyvind Rohjan (screentest@akgolf.test)
- Demo-coach: Anders Kristiansen
- Ekte coach på markedssider: Markus Røinås Pedersen — IKKE demo-data, IKKE bytt
- Coach-stall seed: seed-screentest-coach.ts (38 spillere, idempotent)

## FYS-testresultat-formel
- IKKE låst. Vis plassholder-tall. INGEN referanseverdier hardkodet før Anders gir klarsignal.

After writing, save to: ${REPO}/docs/platform/BUSINESS-RULES.md
Return "DONE: BUSINESS-RULES.md" when complete.
`, { label: 'gen-rules' }),

  () => agent(`
You are writing DATA-MODEL.md for AK Golf HQ.

${CTX}

Explain the Prisma data model in domain language for engineers who don't know golf or the codebase. Write in Norwegian bokmål.

# AK Golf HQ — Data Model

For each major model group, write:
- **Hva det er** (domain explanation, not SQL)
- **Kritiske felt** (which fields matter and why)
- **Relasjoner** (key relationships in plain language)
- **Tilgang** (who can see/edit this data)

Cover these groups (infer from schema):
1. **Bruker og identitet** (User, Coach, Player relationships)
2. **Treningssystem Spor A** (TrainingPlan, TrainingSession, TrainingLog)
3. **Treningssystem Spor B** (TrainingSessionV2 — coachens system)
4. **Scoring og analyse** (Round, Shot, SGScore, HoleScore)
5. **Test-system** (TestDefinition, TestResult, TestProtocol)
6. **Booking** (Booking, Facility, Location, Service, CoachAvailability)
7. **Turneringer** (Tournament, TournamentEntry, TournamentRound)
8. **Abonnement** (Subscription, CoachingPackage, StripeCustomer)
9. **Kommunikasjon** (Message, Notification, SessionRequest)

## Prisma 7-spesifikk konfigurasjon
- prisma.config.ts: datasource.url = DIRECT_URL (ikke i schema.prisma)
- Runtime: @prisma/adapter-pg med DATABASE_URL (pgbouncer pooler)
- RLS: deny-all + Prisma service-role pattern. NYE tabeller MÅ få ENABLE RLS.

After writing, save to: ${REPO}/docs/platform/DATA-MODEL.md
Return "DONE: DATA-MODEL.md" when complete.
`, { label: 'gen-model' }),

  () => agent(`
You are creating THREE interactive HTML user flow maps for AK Golf HQ.

${PLAN_CTX}

Create three self-contained HTML files with dark theme (#0d1117 background, #3fb950 green accents, #e6edf3 text).

Each file should show screens as clickable boxes. Clicking a box shows its URL and purpose in a tooltip/sidebar.

=== FILE 1: ${REPO}/docs/platform/user-flows/playerhq.html ===
Title: "PlayerHQ — Spillerreisen"
Show the main journeys:
- START: /auth/login → /auth/onboarding → /portal (Hjem)
- DAGLIG: Hjem → /portal/planlegge (Workbench) → /portal/(fullscreen)/live/[id]/active → /portal/(fullscreen)/live/[id]/summary
- ANALYSE: Hjem → /portal/analysere → (SG-Hub / Runder / TrackMan / Tester)
- MEG: Hjem → /portal/meg → (Profil / Abonnement / Booking / Helse)
Use swim lanes or grouped boxes. Color primary path green, secondary gray.

=== FILE 2: ${REPO}/docs/platform/user-flows/agencyos.html ===
Title: "AgencyOS — Coachens arbeidsdag"
Show the main journeys:
- MORGEN: /admin/agencyos (Cockpit) → /admin/innboks → /admin/foresporsler → /admin/godkjenninger
- STALL: Cockpit → /admin/spillere → /admin/spillere/[id] → /admin/spillere/[id]/workbench
- ANALYSE: Cockpit → /admin/tester → /admin/tester/benchmarks → /admin/analyse
- DRIFT: Cockpit → /admin/kalender → /admin/bookinger → /admin/anlegg

=== FILE 3: ${REPO}/docs/platform/user-flows/booking.html ===
Title: "Booking — Flyt ende til ende"
Two paths side by side:
- Marketing-path: /(marketing) → /(marketing)/booking → Velg tjeneste → Velg tid → Bekreft → Kvittering
- PlayerHQ-path: /portal → /portal/booking → /portal/booking/ny (wizard) → /portal/booking/bekreftet

Use the Write tool to save each file to its path.
Return "DONE: USER-FLOWS (3 filer)" when all three are saved.
`, { label: 'gen-flows' }),

  () => agent(`
You are creating the screen context documentation for AK Golf HQ's 30 most important screens.

${PLAN_CTX}
${CTX}

For each screen below, write a section with this structure:

## [Screen name] — \`[route]\`
**Formål:** [What does this screen do? One sentence.]
**Bruker:** [Who uses it, in what situation?]
**Data inn:** [What does it need from the database? Key Prisma models.]
**Data ut:** [What can the user do or save?]
**Flyt:** Kommer fra: [screens]. Leder til: [screens].
**Fasit:** \`public/design-handover/AK Golf HQ Design System/[path]\`

Screens:
PLAYERHQ:
- Hjem: /portal
- Planlegge: /portal/planlegge
- Workbench: /portal/planlegge/workbench
- Gjennomføre: /portal/gjennomfore
- Live aktiv: /portal/(fullscreen)/live/[sessionId]/active
- Live oppsummering: /portal/(fullscreen)/live/[sessionId]/summary
- Analysere: /portal/analysere
- SG-Hub: /portal/mal/sg-hub
- Runder: /portal/mal/runder
- Runde-detalj: /portal/mal/runder/[id]
- TrackMan: /portal/mal/trackman
- Tester: /portal/tren/tester
- Drills: /portal/drills
- Meg: /portal/meg
- Booking-hub: /portal/booking
- Ny booking: /portal/booking/ny
AGENCYOS:
- Cockpit: /admin/agencyos
- Spillere: /admin/spillere
- Spiller-detalj: /admin/spillere/[id]
- Coach-Workbench: /admin/spillere/[id]/workbench
- Innboks: /admin/innboks
- Forespørsler: /admin/foresporsler
- Godkjenninger: /admin/godkjenninger
- Kalender: /admin/kalender
- Bookinger: /admin/bookinger
- Tester: /admin/tester
- Plans: /admin/plans
AUTH+MARKETING:
- Login: /auth/login
- Onboarding: /auth/onboarding
- Marketing-forside: /(marketing)

Save complete Markdown to: ${REPO}/docs/platform/screen-context/all-screens.md
Return "DONE: SCREEN-CONTEXT (30 skjermer)" when complete.
`, { label: 'gen-screens' }),

])

log('Alle 6 dokumenter generert!')

// ── FASE 3: REVIEW ─────────────────────────────────────────────────────────
phase('Review')
log('Starter adversarisk review av de 4 tekst-dokumentene...')

// Critic-agentene leser fra disk (generate-agentene returnerer "DONE: filename", ikke innholdet)
const CRITIC_SCHEMA = { type: 'object', properties: { issues: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string' }, location: { type: 'string' }, description: { type: 'string' }, fix: { type: 'string' } }, required: ['severity','location','description','fix'] } }, verdict: { type: 'string' }, criticalCount: { type: 'number' } }, required: ['issues','verdict','criticalCount'] }

const DOCS = [
  { name: 'PLATFORM-PRD.md', path: `${REPO}/docs/platform/PLATFORM-PRD.md` },
  { name: 'AGENT-BRIEF.md',   path: `${REPO}/docs/platform/AGENT-BRIEF.md` },
  { name: 'BUSINESS-RULES.md', path: `${REPO}/docs/platform/BUSINESS-RULES.md` },
  { name: 'DATA-MODEL.md',    path: `${REPO}/docs/platform/DATA-MODEL.md` },
]

const reviews = await parallel(DOCS.map(doc => () => agent(`
Read the file at ${doc.path} using the Read tool. Then review it as an adversarial critic for AK Golf HQ.

Your job: FIND PROBLEMS. Assume problems exist. Be ruthless.

Check for:
1. Factual errors (wrong stack versions, wrong file paths, wrong business rules)
2. Missing critical info a new agent would need
3. Old names: "CoachHQ" → should be AgencyOS; ELITE tier shown in UI → forbidden; "Performance Pro as app level" → it's a coaching package
4. Internal contradictions
5. Vague statements interpretable multiple ways
6. Norwegian bokmål errors

Return JSON matching schema exactly.
`, { label: 'critic-' + doc.name, schema: CRITIC_SCHEMA })))

const allReviews = reviews.filter(Boolean).map((r, i) => ({ ...r, doc: DOCS[i] }))
const totalCritical = allReviews.reduce((sum, r) => sum + (r.criticalCount || 0), 0)
log(`Review ferdig. ${totalCritical} kritiske funn på tvers av ${DOCS.length} dokumenter.`)

if (totalCritical > 0) {
  log('Fikser kritiske funn...')
  const fixes = await parallel(
    allReviews
      .filter(r => r.criticalCount > 0)
      .map(r => () => agent(`
Read the current content of ${r.doc.path} using the Read tool.

Fix ONLY these critical issues:
${r.issues.filter(i => i.severity === 'critical').map(i => `- [${i.location}] ${i.description}\n  FIX: ${i.fix}`).join('\n')}

Write the corrected complete document back to ${r.doc.path} using the Write tool.
Return "FIXED: ${r.doc.name}" when done.
`, { label: 'fix-' + r.doc.name }))
  )
  log(`${fixes.length} dokumenter fikset.`)
}

return {
  status: 'complete',
  documents: [
    'docs/platform/PLATFORM-PRD.md',
    'docs/platform/AGENT-BRIEF.md',
    'docs/platform/BUSINESS-RULES.md',
    'docs/platform/DATA-MODEL.md',
    'docs/platform/user-flows/playerhq.html',
    'docs/platform/user-flows/agencyos.html',
    'docs/platform/user-flows/booking.html',
    'docs/platform/screen-context/all-screens.md',
  ],
  totalCriticalFixed: totalCritical,
}
```

- [ ] **Steg 2: Verifiser at alle 8 filer ble skrevet**

```bash
ls -la /Users/anderskristiansen/Developer/akgolf-hq/docs/platform/
ls -la /Users/anderskristiansen/Developer/akgolf-hq/docs/platform/user-flows/
ls -la /Users/anderskristiansen/Developer/akgolf-hq/docs/platform/screen-context/
```

Forventet: 4 .md-filer i platform/, 3 .html-filer i user-flows/, 1 .md-fil i screen-context/

---

## Task 3: Integrer AGENT-BRIEF i prosjektet

**Filer:** Modify `AGENTS.md`

- [ ] **Steg 1: Legg til referanse til AGENT-BRIEF i AGENTS.md**

Åpne `/Users/anderskristiansen/Developer/akgolf-hq/AGENTS.md` og legg til øverst (etter eksisterende første linje):

```markdown
# OBLIGATORISK LES FØRST
`docs/platform/AGENT-BRIEF.md` — full kontekst på 5 min. Les dette før du rører en fil.
```

- [ ] **Steg 2: Verifiser at filen ser riktig ut**

```bash
head -10 /Users/anderskristiansen/Developer/akgolf-hq/AGENTS.md
```

---

## Task 4: Commit

**Filer:** Alle docs/platform/-filer + AGENTS.md

- [ ] **Steg 1: Stage og commit**

```bash
cd /Users/anderskristiansen/Developer/akgolf-hq
git add docs/platform/ AGENTS.md .gitignore
git commit -m "$(cat <<'EOF'
feat(platform): Platform Intelligence System — 6 docs generert

PLATFORM-PRD, AGENT-BRIEF, BUSINESS-RULES, DATA-MODEL,
USER-FLOWS (3 HTML), SCREEN-CONTEXT (30 skjermer).
Enhver ny agent leser AGENT-BRIEF.md som første steg.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
git push origin main
```

Forventet: commit bekreftet, push til main

---

## Neste steg etter Fase 0

Når alle 8 filer er commit-et:

1. Åpne `docs/platform/user-flows/playerhq.html` i nettleseren — verifiser at flyt-kartet er lesbart
2. Les `docs/platform/AGENT-BRIEF.md` — verifiser at du forstår plattformen på under 5 min
3. Kjør **Plan B: Fase 1 Screen Porting** — `docs/superpowers/plans/2026-06-11-fase1-screen-porting.md`
   (Denne planen genereres automatisk som neste steg etter at Fase 0 er ferdig)
