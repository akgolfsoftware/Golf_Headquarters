# AI Coach trenings-plan for AK Golf HQ

**Sist oppdatert:** 2026-05-25

## Del 1 — Hvor AI finnes i plattformen (24+ funksjoner)

### CoachHQ (admin)
| Plassering | Rolle | Bruker |
|---|---|---|
| `/admin/agencyos/caddie` | **Caddie** — AI-assistent for coach | Coach |
| `/admin/agencyos/caddie/aktivitet` | Caddie-aktivitetslogg | Audit |
| `/admin/agents` | AI-agenter administrasjon | Head coach |
| `/admin/agents/[agentId]` | Per-agent feedback + tuning | Head coach |
| `/admin/brief` | **Daglig brief-agent** | Genererer dagens coach-brief |
| `/admin/oppfolging` | **Vinn-tilbake-agent** | Flagger inaktive spillere |
| `/admin/plans/new` | **AI-plan-agent** | Lager komplett plan fra prompt |
| `/admin/godkjenninger` | Approval-flyt for AI-forslag | Coach validerer |
| `/admin/teknisk-plan/[spillerId]` | TEK-plan-AI | Foreslår tekniske drills |
| `/admin/talent/discovery` | **Talent-discovery-AI** | Foreslår prospekter |

### PlayerHQ (portal)
| Plassering | Rolle | Bruker |
|---|---|---|
| `/portal/ai/mal-bygger` | **AI mål-bygger** | Spiller setter SMART-mål |
| `/portal/ai/foresla-drill` | **Drill-AI** | Anbefaler drills basert på svakheter |
| `/portal/ai/foresla-turnering` | **Turnering-AI** | Foreslår turneringer |
| `/portal/coach/ai` | **AI-coach for spilleren** | Dialog-coach (chat) |
| `/portal/agent-pipeline` | AI-agent-pipeline | Spillerens AI-flyt |
| `/portal/analysere` (AI-Innsikt-card) | **Innsikt-AI** | Automatiske observasjoner |
| `/portal/mal/sg-hub` (tolk SG) | **SG-tolkning-AI** | Forklarer SG-data |
| `/portal/talent/roadmap` | **Karriere-roadmap-AI** | Foreslår vei mot mål |

### Underliggende AI-funksjoner
- **HCP-projeksjon** — estimerer fremtidig HCP
- **TrackMan-tolkning** — leser radar-data
- **CS-progresjon-varsel** — flagger skader
- **Plan-effektivitet** — vurderer mal
- **Periodisering** — uke-allokering (Bompa)
- **Skadeforebyggende AI** — HRV + søvn + smerte-logg
- **Mental trening AI** — visualisering, pre-shot routine

---

## Del 2 — Hvordan trene AI (5-lags strategi)

```
Lag 1: SYSTEM-PROMPT     (per agent — rolle, tone, norsk)
Lag 2: SKILLS            (deklarative kunnskapsmoduler)
Lag 3: RAG (kontekst)    (henter fra ak-second-brain)
Lag 4: TOOLS             (live data — Prisma)
Lag 5: MEMORY            (bruker-spesifikk)
```

Vi bruker **ikke fine-tuning** — Skills + RAG dekker AK Golf-domenet.

---

## Del 3 — ak-second-brain integrasjon

### Struktur
```
~/Developer/ak-second-brain/
├── raw/           # immutabelt
└── wiki/          # entities, concepts, sources, syntheses
```

### Innhold å ingest-e

**Entities:**
- 5 pyramide-kategorier (FYS, TEK, SLAG, SPILL, TURN)
- 6 Bompa-perioder
- 4 SG-kategorier + benchmark-tabeller
- NGF-nivåer (D, E, F, G, H...)
- Klubber + coach-profiler

**Concepts:**
- WHS-handicap-system
- Strokes Gained-tolkning per kategori
- Mac O'Grady's coaching-fundament
- Periodisering for golfere (Bompa modifisert)
- Drill-progresjon
- Test-batteri-protokoller (20+)
- HCP-utviklingsmønstre per alder/erfaring

**Syntheses (LLM-genererte):**
- "Når SG-PUTT er negativ + HCP øker → coach-intervensjon nødvendig"
- "Bompa-overgang under turnering = HCP-fall i 70 % av tilfeller"

### Aksess-mønster

**Anthropic Skills (deklarativ):**
```ts
export const sgInterpretationSkill = {
  name: "sg-interpretation",
  knowledge: `
    PGA Top 40 SG-PUTT-snitt: 0.0 per runde
    Amatør A1-snitt: -0.8 per runde
    En spiller med SG-PUTT < -1.5 har akutt putt-problem.
    Foreslå putting-drills hvis SG-PUTT < -1.0 i siste 5 runder.
  `,
  examples: [/* test-cases */],
};
```

**RAG (dynamisk):**
- Bruker stiller spørsmål → søk i wiki/
- Hent topp 5 relevante chunks
- Inkluder som context før LLM-svar

---

## Del 4 — Per-agent trenings-spec

### 4.1 Caddie (CoachHQ-assistent)
- **Skills:** pyramide-taksonomi, bompa-perioder, sg-interpretation, ngf-nivaer, mac-ogrady-fundament
- **Tools:** getSpiller, getRunder, getSgData, getTreningsplan, lagOppgave, sendVarsel
- **Memory:** Anders' preferanser, samtale-historikk
- **Test-cases:** 10+ for evaluering

### 4.2 AI Plan-agent
- **Input:** spillerprofil + coach-prompt + Bompa-periode + turnering-kalender
- **Output:** strukturert TrainingPlan med uker, økter, drills
- **Skills:** bompa-perioder, pyramide-fordeling, drill-progresjon, restitusjon-regler

### 4.3 SG-tolkning-AI
- **Tone:** oppmuntrende, ærlig
- **Skills:** sg-interpretation, pga-benchmarks, ngf-nivaer

### 4.4 Vinn-tilbake-agent
- **Personlig** oppfølgings-melding basert på spiller-data
- **Skills:** samtale-mønstre

### 4.5 AI mål-bygger
- **Tone:** spørrende, ikke svarende
- **Output:** SMART-mål

### 4.6 AI foreslå-drill
- **Input:** SG-data + sist trent + tilgjengelig tid + nivå
- **Output:** 3 drill-anbefalinger med rasjonale

### 4.7 Periodiseringsagent
- **Output:** % fordeling per uke matchet Bompa-fase

### 4.8 Daglig brief-agent
- **Format:** maks 200 ord, kl 06:00 hver morgen

---

## Del 5 — Strokes Gained-tolkning

### 5.1 Benchmark-hierarki
```
PGA Tour Top 40  (benchmark = 0.0)
├── PGA Tour          ≈ -0.5
├── Korn Ferry        ≈ -1.5
├── European Tour     ≈ -1.0
├── Amatør A1 (PRO)   ≈ -3.0
├── Amatør A2         ≈ -5.0
├── Amatør B1         ≈ -8.0
└── Amatør B2         ≈ -12.0
```

### 5.2 Per-kategori-tolkning

**SG-OTT:** > 0 = bedre enn PGA, < -2.0 = drive-problem
**SG-APP:** Variabel, < -1.5 = approach-problem
**SG-ARG:** Mest variabel, < -1.0 = nærspill svakt
**SG-PUTT:** Mest trainable, < -1.0 = akutt

### 5.3 AI-tolkning-regler

**Kort sikt (siste 5 runder):**
- En tilfeldig dårlig SG-runde ignoreres
- Konsekvent < -1.0 i én kategori = flagg
- Trend over 4 uker viktigere enn snapshot

**Lang sikt (3 måneder):**
- SG-trend-linje
- Forbedring > 0.3 = positivt
- Forverring > 0.3 = bekymring

**Kontekst:**
- Vær (vind/regn)
- Bane-vanskelighetsgrad
- Spillerens form-kurve

---

## Del 6 — Implementerings-rekkefølge

### Fase A — Foundation (2-3 dager)
1. Opprett `src/lib/ai/` mappe
2. ak-second-brain vector-embedding (pgvector i Supabase)
3. RAG-funksjon: `hentRelevantKontekst(query)`
4. Test-rammeverk for AI evals

### Fase B — Per agent (1 uke)
Rekkefølge:
1. Caddie (mest brukt) — 1 dag
2. AI-plan-agent — 1 dag
3. SG-tolkning — halv dag
4. Vinn-tilbake — halv dag
5. AI mål-bygger — halv dag
6. AI foreslå-drill — halv dag
7. Periodiseringsagent — halv dag
8. Daglig brief — halv dag
9. Talent-discovery — 1 dag
10. Resten — 1-2 dager samlet

### Fase C — Coach-feedback-loop (1 dag)
- Tomle-opp/ned per AI-forslag
- Aggregert til AuditLog
- < 70 % tomle-opp → flagg for re-trening

### Fase D — Continuous (pågående)
- Månedlig review
- Iterér prompts
- Ny kunnskap → oppdater Skills og wiki

---

## Del 7 — Evaluerings-rammeverk

### 4 mål

1. **Faktuell korrekthet** (auto) — matcher Prisma-data. Mål: 100 %
2. **Domain-korrekthet** (manuell + auto) — riktig terminologi. Mål: 95 %
3. **Tone/stil** (regex) — ingen utropstegn, aktiv stemme. Mål: 95 %
4. **Coach-tilfredshet** (feedback) — tomle opp-rate. Mål: > 80 %

### Anthropic Console
- Eval-set med 20-50 test-cases per agent
- Kjør evals ved prompt-endring
- A/B-test prompt-versjoner

---

## Del 8 — Total estimat

**3-4 uker fra null til alle 24 agenter trent.**

| Fase | Tid |
|---|---|
| Foundation | 2-3 dager |
| Per agent (24x) | 2 uker |
| Coach feedback-loop | 1 dag |
| Continuous improvement | pågående |

---

## Avhengigheter

- **ak-second-brain må være fyllt** med relevant kunnskap
- **Supabase pgvector** må aktiveres
- **Anthropic API-key** i prod
- **Eval-rammeverk** før vi kan måle forbedring
