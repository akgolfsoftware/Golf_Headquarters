# AgenticOS + Prompt Engineering Expert + MASTERBRAIN

**Analyse og arkitektur — 2026-08-02.** Verifisert mot kode, ikke mot filnavn eller antakelser.
Kilder: `src/lib/{masterbrain,ai,ai-coach,ai-plan,caddie,kommando,agents}/`, `scripts/sync-masterbrain.ts`,
`scripts/laeringslogg-til-masterbrain.ts`, `prisma/schema.prisma`, `docs/platform/funksjoner-og-agenter-oversikt.md`.

Målet med dokumentet: vise hvordan AgenticOS kan gi brukerne i appen de beste svarene, og bli bedre over tid
uten å bli dyrere eller dårligere.

---

> **Oppdatering 2026-08-02 — fase 1 er utført.** Delene av dokumentet som beskrev manglende sync og
> dobbeltfasit er historikk nå. Full sync er kjørt mot `akgolfsoftware/masterbrain` (115 filer), og de to
> parallelle kunnskapskopiene i appen er fjernet. Se «Fase 1 — utført» nederst for hva som faktisk ble
> gjort og hva som gjenstår. Analysen under er beholdt fordi den forklarer hvorfor.

## 0. MASTERBRAIN-status

**Fant du mappen? Ja — men bare halve.**

| Hva | Hvor | Status |
|---|---|---|
| Lokal, versjonert kopi | `src/lib/masterbrain/` | Finnes, i bruk |
| Kildekildens repo | `akgolfsoftware/masterbrain` (eget GitHub-repo) | **Ikke tilgjengelig fra denne sesjonen** |
| Sync-script | `scripts/sync-masterbrain.ts` (`npm run sync:masterbrain`) | Finnes, kjøres manuelt lokalt |
| Tilbakeføring av lærdom | `scripts/laeringslogg-til-masterbrain.ts` | Finnes, kjøres manuelt lokalt |

GitHub-tilgangen i denne sesjonen er scoped til `akgolfsoftware/golf_headquarters`. Forsøk på å attache
`akgolfsoftware/masterbrain` krevde godkjenning som ikke kan gis i en ikke-interaktiv sesjon. Alt under er
derfor lest ut av den synkede kopien i dette repoet, pluss det sync-scriptet forteller om kildens struktur.

### Hva som faktisk ligger i appen i dag

`src/lib/masterbrain/index.ts` (28 linjer) importerer sju JSON-filer og eksporterer dem som ett objekt:

```
knowledge/concepts/
  canon-methodology.json    v3.5 — 11 ferdighetsnivåer A–K, pyramidefordeling, L-faser, invarianter, perioder
  ltad-framework.json       v1.0 — LTAD-faser 5–8 år og oppover, mappet til CANON-nivåer og AK-stigen
  sg-principles.json        v1.0 — SG-kategorier, APP-bånd med baselines, mapping til MORAD-feil, diagnostikk
  upgame-dimensions.json    v1.0 — konkurranseintelligens på UpGame. IKKE coachingfasit.
knowledge/entities/
  positions.json            MORAD P1.0–P10.0 med toleranser (5–10°) og scoring-bånd
  faults.json               MORAD-svingfeil med deteksjonslogikk, korreksjoner, drills, symptomer
  drills.json               MORAD-drills med setup, utførelse, følelses-cues, pyramideområde, køllehastighet
```

### Det viktigste funnet: kopien er ufullstendig

`sync-masterbrain.ts` er skrevet for å kopiere **fem** kilder pluss et manifest. Bare én av dem har landet:

| Kilde i masterbrain | Formål ifølge scriptet | Finnes i appen? |
|---|---|---|
| `knowledge/concepts` | CANON/LTAD/SG-fasit | **Ja** |
| `knowledge/entities` | MORAD-posisjoner, feil, drills | **Ja** |
| `rag-corpus` | RAG-tekster for semantisk søk | **Nei** |
| `processed/rules` | MORAD-ordbok, terminologi, diagnostiske regler | **Nei** |
| `training-data` | Resonnementseksempler + eval-sett med rubrikk | **Nei** |
| `MANIFEST.md` | «kartet agentene skal lese først» | **Nei** |

Dette er ikke en detalj. Det betyr at:

1. **`training-data` med eval-sett og rubrikk finnes i kilden, men aldri i produksjon.** Det er nøyaktig
   materialet et selvutviklende system trenger for å måle om det blir bedre eller dårligere. Det ligger
   ubrukt.
2. **`rag-corpus` er aldri embeddet.** Scriptet advarer selv om at chunkene må embeddes til
   `knowledge_chunks` (pgvector) med et eget seed-script. Søk i hele repoet gir **null treff** på
   `knowledge_chunks`, `search_knowledge` eller `searchKnowledge` utenom nettopp denne kommentaren. Tabellen
   finnes ikke i `schema.prisma`, seed-scriptet finnes ikke, og verktøyet agentene skulle bruke finnes ikke.
   Semantisk søk mot MASTERBRAIN er en plan, ikke en funksjon.
3. **MANIFEST.md — «les denne først» — er ikke der.** Agentene har ingen kart over hva som er fasit.

### Hvor mye brukes MASTERBRAIN egentlig?

Én agent. `fabrikk-agent.ts` importerer `masterbrain` og leser `canonMethodology.categories` når den
genererer nye øvelser. `radar-agent.ts` nevner den i en kommentar. Ingen andre av de ~55 agentene, ingen
Caddie-flate, ingen plangenerator og ingen spillervendt AI rører den.

Samtidig finnes det et **parallelt, overlappende kunnskapslager**: `src/lib/ai-coach/kunnskap/` med 15
markdown-filer (`canon-invariants-13.md`, `canon-pyramide-ak-formel.md`, `morad-p1-setup.md`,
`morad-fault-over-top.md`, `sg-to-morad-mapping.md`, `truth-layer-prioritet.md` m.fl.) som dekker
i praksis samme domene som MASTERBRAINs `concepts` og `entities` — bare i prosa, i et annet format, med en
annen livssyklus, og uten koblingen tilbake til kilderepoet.

**Vi har altså to fasiter av samme metodikk, som ikke vet om hverandre.** Dette er den enkeltstående største
kvalitetsrisikoen i AI-laget: to kilder som kan drifte fra hverandre er verre enn én middelmådig kilde.

---

## 1. Funksjonskatalog

### PlayerHQ (`/portal`) — spilleren

Navigasjon: Hjem · Plan · Gjør · Analyse · Meg.

| Funksjon | Bruker | Beskrivelse | Nåværende begrensning |
|---|---|---|---|
| Hjem / dashboard | Spiller | Dagens økter, ukesfremdrift, mål-widget, «neste beste handling» | «Neste beste handling» er regelbasert, ikke AI-vurdert |
| Workbench | Spiller | Uke-canvas: opprette/flytte/slette økter, publisere uke, ta imot Caddie-forslag | Datomatte i `session-move-math.ts` er ikke Oslo-korrekt (gotcha, ikke fikset) |
| Plan-bygger | Spiller | 5-stegs wizard: Mål → Mal → Generer → Juster → Lagre | Genereringen er mal + LLM, ikke koblet til MASTERBRAIN-fasiten |
| Live-økt + Tapper | Spiller | Brief → aktiv økt med timer og rep-logging → oppsummering; fullskjerm range-logging per ball | Live-coach-meldingen er én velkomsttekst, ikke løpende dialog |
| Tester | Spiller | Test-hub: scorekort, tildelte tester, trend; bygge egne tester | FYS-referanseverdier er bevisst plassholdere (låst beslutning) |
| Teknisk plan | Spiller | P1–P10-posisjoner, oppgavekort, reps, TrackMan-mål per kølle | Read-only mot coachens plan |
| Runder & SG | Spiller | Live runde slag-for-slag, etterregistrering, hull-for-hull, UpGame-import | SG-pipeline er sterk; tolkningen av tallene er tynn i spillerflaten |
| TrackMan-hub | Spiller | CSV/HTML-import, trender, dispersion-plot per kølle | Insight-motoren er deterministisk (ingen LLM), kjører kun daglig |
| Gameplan | Spiller | Banebibliotek med satellittkart, egen spredning tegnet inn, dra-sikte, carry fra GPS | Ingen AI-anbefaling av strategi per hull |
| Mål & milepæler | Spiller | Aktive mål, ETA, A–K-stige, AI SMART-mål-wizard, SG-ledertavle | |
| Talent | Spiller | Nivå, radar, streak, SG-percentil, anonymisert sammenligning | Feature-gated |
| Booking | Spiller | Tjenester, coacher, credit-saldo, ekte ledige slots, «Be om økt» | |
| Coach-hub | Spiller | Profil, fokus-notat, meldinger, Q&A, delte planer, AI-coach-chat | AI-coach-chat er Pro-gated |
| AI-funksjoner | Spiller | AI drill-forslag, AI turneringsforslag, Caddie-drevne plan-justeringer | Spredt over flere flater, ingen felles inngang |
| Meg / konto | Spiller | Profil, HCP, abonnement (Stripe 299 kr/mnd), helse, utstyr, foreldrekobling, personvern | |

### AgencyOS (`/admin`) — coachen

Navigasjon: Hjem · Stall · Kalender · Kø · Innsikt.

| Funksjon | Bruker | Beskrivelse | Nåværende begrensning |
|---|---|---|---|
| Cockpit | Coach | Morgenbrief, KPI-er, fokusspillere, AI-dispatch | |
| Daglig brief | Coach | Claude-generert dagsoppsummering + nøkkeltall | |
| Stall + spillerprofil 360° | Coach | Status, pakke/betaling, oversikt, pyramide, aktiv plan, meldinger | |
| Coach-Workbench | Coach | Kjernen: uke-canvas per spiller, mal-påføring, publisering med diff | |
| Gruppe-workbench | Coach | Gruppens årsplan på samme canvas | |
| Periode-fordeling | Coach | Global pyramide-fordeling (min/maks-%) per periode | |
| Godkjenningskø | Coach | Behandler PENDING `PlanAction` med diff-preview og provenance | Ingen «hvorfor avvist»-fangst utover status |
| Agent-oversikt/-detalj | Coach | Alle agenter, `Signal`/`PlanAction`-tellinger, siste 30 `AgentRun`, manuell kjøring, tommel opp/ned | 8 agenter logger ikke til `AgentRun` og er usynlige her |
| Caddie-chat + dashbord | Admin | Chat med read/write-verktøy; proaktive forslag, utkast/fleet/audit | ADMIN-only; ingen coach- eller spillervariant |
| Agent-team (Kommando) | Admin | Multi-modell panel: Claude/Gemini/Grok/Ollama + prosjekt/oppgaver | Fast 3-stegs sekvens, ingen dynamisk ruting |
| Opptak | Coach | Whisper-transkripsjon + Claude-analyse av coaching-økt | Lyd slettes etter retention; transkript beholdes |
| Innboks / e-post | Coach | Triage-kø, full e-post for post@akgolf.no med godkjenn-og-send | |
| Innsikt | Coach | Stall-SG, plan-compliance, oppfølgingskanban, rapporter, tester, videoer | «Løst»-kolonnen i kø er plassholder |
| Økonomi | Admin | Betalingsaggregater, MRR, Stripe + historiske importer | Tripletex leses via agent, aldri estimert |
| Turneringer | Coach | Påmeldinger, wizard, resultater, dublettfletting mot DATAGOLF/NGF/GJGT | |
| Innstillinger | Admin | Klubb/anlegg, CBAC-matrise, API-nøkler, integrasjonsstatus, audit-log | |

### Felles / AK Golf HQ

| Lag | Hva | Bruker |
|---|---|---|
| **Agent-rammeverk** | `runAgent()` → `AgentRun`. Mønster: signal → forslag → godkjenning → utførelse. ~55 agenter: event-drevne (round, sg-analyse, test, trackman, achievement), plan-cron (plan-watcher, training-gap, plan-effectiveness, weekly-proposals), drill-pipeline (radar → fabrikk → drill-forslag → media-løfte), booking/kapasitet, økonomi (Tripletex), drift (GFGK/Mulligan/kalender/WAGR) | System |
| **Provenance** | `provenance.ts` — zod-validert «hvorfor»: kilde, rader, regel, terskel, målt verdi, tidsvindu. Vises som norsk én-linje før godkjenning | Coach |
| **Utførelse** | `plan-action-executor.ts` (878 linjer), ~12 action-typer, tre guards (periodisering, junior, invarianter) i én transaksjon | System |
| **Caddie** | `src/lib/caddie/` + `/api/caddie/chat`. Sonnet 4.6, read/write-tools, skriv blir alltid `CaddieDraft` til godkjenning. Rate limit 10/min | Admin |
| **`src/lib/ai/`** | Anthropic-klient med modell-tier (`modelFor`), skills, tools, `AiMemory`, agenter (caddie, daily-brief, plan-revision, peaking, sg-interpretation, vinn-tilbake) | System |
| **`src/lib/ai-coach/`** | Kunnskapsbase (15 md), `rag-select.ts`, `few-shot.ts`, `truth-layer.ts` | System |
| **`src/lib/ai-plan/`** | Claude-generering av komplette planer; logget til `AiPlanGeneration` med tokens og kost | Coach |
| **MASTERBRAIN** | CANON/MORAD/LTAD/SG-fasit som JSON | System (én agent) |
| **Plan-engine** | Deterministisk: standardmal-uke → personlig uke med norsk begrunnelse. Anbefaler, sperrer aldri | System |
| **Intelligence** | SG-benchmark mot Broadie-forventninger på HCP-stigen | System |
| **Kommando** | 4 modeller, `KommandoTask`, autonominivå, agent-team-sekvens | Admin |
| **Meg** | Telegram-grensesnitt, bekrefter ballplukking/vaskeliste/lønn via tools | Admin |
| **Integrasjoner** | Stripe, Resend, Anthropic, OpenAI, DataGolf, GolfBox/GJGT-scrapere, Google Calendar/Gmail/Drive, Notion, Mapbox, Upstash, Vercel Blob, web-push, Tripletex (planlagt) | System |

---

## 2. Beste bruksområder for AgenticOS

### Hvordan prompts bygges i dag — og hvorfor det begrenser kvaliteten

| Mekanisme | Hvordan den fungerer nå | Problemet |
|---|---|---|
| Modellvalg | `modelFor(agentId)` — hardkodet `Set` med 6 Opus-agenter, 9 Haiku-agenter, resten Sonnet | Valget følger *agent-identitet*, ikke *oppgavens vanskelighet*. En triviell forespørsel til en Opus-agent koster Opus. |
| Kunnskap i prompten | `CADDIE_SYSTEM_PROMPT` limer inn **alle** skills som ren tekst, uansett spørsmål | Betaler for hele kunnskapsblokken hver melding; relevansen er tilfeldig |
| RAG | `rag-select.ts`: `TAG_MAP` med 5 nøkkelord-oppslag på filnavn, maks 5 filer / 8000 tegn | Ren substring-matching på filnavn. Ingen embeddings, ingen relevansscore. Spør spilleren om noe utenfor de 5 taggene, får den de første 5 filene alfabetisk. |
| Few-shot | `loadFewShotExamples()` — kommentaren sier «N tilfeldige», koden gjør `slice(0, 3)` | Alltid samme tre eksempler. Ingen kobling til hva spørsmålet gjelder. |
| Sannhetshierarki | `truth-layer.ts` + `truth-layer-prioritet.md`: l-fase > junior-guard > periodisering > SG > TrackMan | God idé, men håndheves i prosa i prompten — ikke i kode etter genereringen |
| Kostnadssporing | Kun `AiPlanGeneration` har `tokensInput`/`tokensOutput`/`costUsd`. `CaddieMessage` har token-felter | Ingen aggregert kostnad per bruker, per agent eller per måned. Umulig å svare på «hva koster AI-en oss per abonnent?» |

### Hvor AgenticOS + Prompt Engineering Expert + MASTERBRAIN gir klart bedre svar

Rangert etter forholdet mellom verdi og innsats.

**1. «Hva betyr tallene mine?» — SG- og TrackMan-tolkning for spilleren (høyest verdi)**
SG-pipelinen og TrackMan-analysen er allerede sterke. Det spilleren mangler er oversettelsen fra
`SG APP −0,42` til «du treffer for høyt på flaggene fra 130–150 m, her er de to øvelsene». MASTERBRAIN har
nøyaktig denne broen ferdig definert i `sg-principles.json` (APP-bånd med baselines og mapping til
MORAD-feil) og `faults.json` (deteksjonslogikk → korreksjoner → drills). I dag brukes den ikke i noen
spillervendt flate. Dette er en oversettelse med fasit — lav hallusinasjonsrisiko, høy opplevd verdi.

**2. Øvelses- og plangenerering forankret i CANON**
`fabrikk-agent` gjør dette riktig allerede: genererer mot CANON-fasiten. `ai-plan` og plan-byggeren gjør det
ikke. Å la plangenereringen hente pyramidefordeling, L-fase og nivå-A–K-krav fra MASTERBRAIN i stedet for
fra prompt-tekst gjør forslagene etterprøvbare mot en versjonert kilde.

**3. Caddie for coach (ikke bare admin)**
Caddie er ADMIN-only. Mønsteret — read-tools + skriv-som-utkast — er allerede riktig og allerede
godkjenningssikret. Å åpne den for COACH-rollen med `coached.ts`-scoping er lav teknisk risiko og stor
tidsbesparelse per coach.

**4. Godkjenningskøen som samtale, ikke bare diff**
Coachen ser i dag forslag + provenance-linje. Å kunne spørre «hvorfor foreslo du dette?» og «gi meg
alternativet for en 14-åring i grunnperiode» gjør køen raskere å tømme — og hvert svar er et gratis
treningsdatapunkt.

**5. Live-økt-dialog**
`live-coach-agent` legger inn én velkomstmelding. Under selve økta har systemet drills, reps, plan og
SG-form tilgjengelig, men sier ingenting. Her er MASTERBRAINs `drills.json` med følelses-cues direkte
anvendelig.

### Hva som fortsatt må kreve menneskelig godkjenning

Dette er allerede plattformens mønster og skal ikke løsnes:

- **Alt som endrer en spillers plan.** `PlanAction` → coach godkjenner → executor. Uten unntak.
- **All utgående kommunikasjon til kunder, spillere og foreldre.** Churn-radar, betalings-purring,
  lead-oppfølging og innboks lager alle utkast; et menneske sender.
- **Alt som gjelder mindreårige.** Vurderinger deles aldri uten Anders' lesning. Samtykke-gate for
  ukesoppsummering og churn-radar er allerede implementert og skal utvides til enhver ny AI-flate.
- **Økonomi.** Ingen betaling, lønnskjøring eller bokføring utføres av agent. Tall leses, aldri estimeres.
- **Uttak, karakterer, disiplinærsaker** (WANG/GFGK) — agenten forbereder underlag, konkluderer aldri.
- **Nye øvelser inn i banken.** Radar → fabrikk → godkjenningskø. Kunnskapskilden skal ikke kunne utvide
  seg selv uten et menneske i loopen.

Grensen går et fornuftig sted: **AgenticOS kan tolke, forklare og foreslå fritt. Den kan ikke skrive til
noe en bruker ser som sannhet, uten godkjenning.**

---

## 3. Arkitektur for selvutviklende AgenticOS + Prompt Engineering Expert

### Prinsipp

Ikke bygg en ny AI-stack. Alt som trengs finnes allerede i deler: modell-tier, tools, RAG-forsøk,
provenance, godkjenningskø, `AgentRun`, `CaddieDraft`, `AiPlanGeneration`. Det som mangler er **ett felles
inngangspunkt** som velger riktig prompt, riktig kontekst og riktig modell — og **én felles logg** som gjør
hver interaksjon målbar.

### Flyten

```
Bruker (PlayerHQ eller AgencyOS)
   │  spørsmål / oppgave
   ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. RUTER  (src/lib/agenticos/ruter.ts)                       │
│    Klassifiser oppgaven — billig og deterministisk først:    │
│      · intent  (tolk-tall | plan | drill | drift | fritekst) │
│      · domene  (SG | TRACKMAN | TEKNIKK | PLAN | BOOKING …)  │
│      · rolle   (SPILLER | COACH | ADMIN | FORELDER)          │
│      · PII-nivå (mindreårig? navngitt tredjeperson?)         │
│    Regex/nøkkelord + rolle fra sesjon dekker ~80 %.          │
│    Uklart → ett Haiku-kall som returnerer strukturert JSON.  │
└─────────────────────────────────────────────────────────────┘
   ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PROMPT ENGINEERING EXPERT  (prompt-bygger.ts)             │
│    Ikke en LLM i runtime — en deterministisk bygger som      │
│    setter sammen fire lag fra et versjonert register:        │
│      a) Rolle + tone (Anders' stemme, norsk bokmål)          │
│      b) Invarianter (anbefal aldri sperr; truth-layer)       │
│      c) Kontekst-slots (se steg 3)                           │
│      d) Utdataformat (zod-schema → tvunget struktur)         │
│    Hver prompt har id + versjon: `sg-tolkning@3`.            │
│    Én LLM-variant finnes: /prompt-engineer-skillen i Claude  │
│    Code, som Anders bruker til å FORFATTE nye maler — den    │
│    kjører aldri i produksjonsstien.                          │
└─────────────────────────────────────────────────────────────┘
   ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. KONTEKST-HENTING  (kontekst.ts)                           │
│    Tre kilder, i prioritert rekkefølge (truth-layer):        │
│    ① FASIT — MASTERBRAIN, oppslag ikke søk.                  │
│       sgArea → sg-principles.bands → faults → drills.        │
│       Deterministisk, gratis, ingen hallusinasjon.           │
│    ② SPILLERDATA — Prisma via eksisterende tools             │
│       (get_spiller, get_runder, get_sg_data, …). Kun data    │
│       brukeren har tilgang til. `coached.ts` scoper alt.     │
│    ③ RAG — semantisk søk i masterbrain/rag-corpus.           │
│       Først når ① og ② ikke dekker spørsmålet.               │
│    Budsjett per lag i tegn. Fyll ① → ② → ③ til budsjettet    │
│    er brukt. Aldri «lim inn alt».                            │
└─────────────────────────────────────────────────────────────┘
   ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. MODELLVALG  (modell.ts — erstatter modelFor())            │
│    Velg på OPPGAVE, ikke agent-id:                           │
│      Haiku   klassifisering, oppsummering, formatering,      │
│              sync-agenter, utkast til rutinemelding          │
│      Sonnet  standard: tolkning, drill-forslag, chat         │
│      Opus    plan-revisjon, periodisering, videoanalyse,     │
│              alt som treffer flere uker av en plan           │
│      Ollama  PII-tung tekst som skal vaskes lokalt først     │
│    Eskalering: lav confidence i svaret → ett retry ett tier  │
│    opp, maks én gang, logget.                                │
└─────────────────────────────────────────────────────────────┘
   ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. GENERERING + GUARDS                                       │
│    streamText / messages.create med zod-tvunget output.      │
│    Etter svaret, FØR brukeren ser det:                       │
│      · invariant-sjekk (ingen «kan ikke brytes»-språk)       │
│      · junior-guard (alder, øktantall)                       │
│      · periodiserings-guard                                  │
│      · fasit-sjekk: nevner svaret en drill/feil/posisjon     │
│        som ikke finnes i MASTERBRAIN? → merk som ubekreftet  │
│    Skriveoperasjoner → ALLTID PlanAction/CaddieDraft.        │
└─────────────────────────────────────────────────────────────┘
   ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. LOGG + LÆRING  (AiInteraksjon — én ny tabell)             │
│    Skriv én rad per interaksjon:                             │
│      promptId + versjon, intent, domene, rolle,              │
│      modell, tokens inn/ut, kostUsd, latency,                │
│      kontekstkilder brukt, guard-treff,                      │
│      utfall (GODKJENT | AVVIST | ENDRET | IGNORERT),         │
│      rating (+1/−1), fritekst-begrunnelse                    │
│    Ingen fritekst fra mindreårige. Kun id-er og koder.       │
└─────────────────────────────────────────────────────────────┘
```

### Hvordan læringen faktisk skjer

Læring er ikke finetuning. Det er fire konkrete løkker med ulik hastighet — og hver av dem har allerede et
halvferdig fundament i repoet.

**Løkke 1 — implisitt signal (kontinuerlig, gratis)**
Hver `PlanAction` som godkjennes eller avvises, hvert `CaddieDraft` som blir APPROVED eller REJECTED, og
hver tommel opp/ned på en agent er allerede et merket datapunkt. Problemet i dag er at de er spredt:
`PlanAction.status` i én tabell, `CaddieDraft.status` i en annen, og agent-tommelen ligger begravd som
`metadata.rating` inne i en `AuditLog`-rad med `action: "agent.feedback"` — ikke spørrbart, ikke aggregerbart.
**Fikset:** én `AiInteraksjon`-tabell som alle fire skriver til, med `promptId` og `versjon`. Da kan man for
første gang svare på «hvilken prompt-versjon får flest avvisninger?».

**Løkke 2 — eksplisitt begrunnelse (per avvisning)**
Når en coach avviser et forslag, spør om ett valgfritt felt: hvorfor. Tre forhåndsvalg (feil periode / feil
nivå / dårlig begrunnelse) pluss fritekst. Dette er den mest verdifulle datakilden i hele systemet, og den
koster ett ekstra klikk.

**Løkke 3 — ukentlig destillering (menneske i loopen)**
`scripts/laeringslogg-til-masterbrain.ts` gjør allerede dette for drill-forslag: leser ukas godkjente og
avviste `CaddieDraft` og skriver en markdown-oppsummering til den lokale masterbrain-klonen, bevisst uten å
committe. Utvid den til å lese hele `AiInteraksjon`, ikke bare to tool-navn, og til å produsere tre ting:
mønstre i avvisninger, kandidat-eksempler til `training-data/`, og forslag til prompt-endringer. **Anders
leser og committer.** Kunnskapskilden utvider seg aldri selv.

**Løkke 4 — evaluering før endring (porten)**
Dette er det som hindrer forfall, og det er den eneste virkelig nye komponenten. `training-data/` i
masterbrain inneholder ifølge sync-scriptet allerede «resonnementseksempler og eval-sett med rubrikk». Bygg
et `npm run eval:prompts` som kjører gjeldende og foreslått promptversjon mot det settet, scorer med rubrikken
(LLM-as-judge på Opus, deterministiske sjekker der det er mulig), og rapporterer differansen. **En ny
promptversjon rulles ikke ut uten at evalen er lik eller bedre.** Uten denne porten er «selvutviklende» bare
«endrer seg», og retningen er ikke garantert.

### Selvutvikling — hva som er lov

| Systemet kan selv | Krever menneske |
|---|---|
| Velge prompt-versjon per intent basert på målt score | Skrive en ny prompt-versjon |
| Velge modell-tier basert på oppgavetype og målt kvalitet | Endre tier-reglene |
| Velge hvilke MASTERBRAIN-oppslag som er relevante | Endre MASTERBRAIN-innhold |
| Velge few-shot-eksempler etter likhet med spørsmålet | Godkjenne et nytt eksempel inn i settet |
| Foreslå prompt-endringer i ukesrapporten | Merge dem |

---

## 4. MASTERBRAIN — anbefalt struktur

Kildens struktur er delvis kjent fra sync-scriptet. Anbefalingen bygger på den i stedet for å finne opp en ny:

```
masterbrain/                          (eget repo — Anders' kunnskapskilde)
├── MANIFEST.md                       Kartet. Hva er fasit, hva er kontekst, hva er
│                                     konkurranseintelligens. Versjon + sist verifisert.
│                                     MÅ synkes — er det ikke i dag.
├── knowledge/
│   ├── concepts/                     ✅ finnes: canon-methodology, ltad-framework,
│   │                                 sg-principles, upgame-dimensions
│   └── entities/                     ✅ finnes: positions, faults, drills
├── processed/rules/                  ⚠ synkes ikke: MORAD-ordbok, terminologi,
│                                     diagnostiske regler
├── rag-corpus/                       ⚠ synkes ikke: lengre prosatekster for semantisk søk.
│   ├── metodikk/                     Én fil = ett tema. Frontmatter med
│   ├── svingteknikk/                 { domene, nivå, kilde, versjon, gjelder-fra }
│   ├── periodisering/                slik at chunkene kan filtreres før embedding.
│   └── coaching-samtale/
├── training-data/                    ⚠ synkes ikke — og dette er den viktigste mangelen.
│   ├── eksempler/*.jsonl             Resonnementseksempler: kontekst → riktig svar →
│   │                                 hvorfor. Kilden til few-shot.
│   └── eval/                         Eval-sett + rubrikk. Porten mot forfall.
│       ├── sg-tolkning.jsonl
│       ├── plan-revisjon.jsonl
│       └── rubrikk.md
└── prompts/                          🆕 anbefalt ny: promptmalene selv, versjonert
    ├── sg-tolkning/v1.md … v3.md     sammen med kunnskapen de bruker.
    └── register.json                 { promptId → aktiv versjon, eval-score, sist endret }
```

### Fire regler for MASTERBRAIN

1. **Én fasit, ikke to.** `src/lib/ai-coach/kunnskap/` (15 md-filer) må enten flyttes inn i masterbrains
   `rag-corpus/` eller eksplisitt merkes som avviklet. To parallelle kunnskapslagre om samme metodikk vil
   drifte fra hverandre, og da vet ingen hvilken som gjelder. Dette bør ryddes før noe nytt bygges.
2. **Fasit slås opp, prosa søkes.** `concepts` og `entities` er strukturert JSON med id-er — de skal leses
   med direkte oppslag (`faults[faultId]`), aldri via embeddings. Kun `rag-corpus` skal vektoriseres.
   Dette holder de viktigste svarene deterministiske og gratis.
3. **Alt har versjon og kilde.** `canon-methodology.json` har allerede `version: "3.5.0"` og `source[]`.
   Alle filer skal ha det, og versjonen skal med i `AiInteraksjon`-loggen — ellers kan man ikke svare på
   «ble svarene dårligere etter at vi endret CANON?».
4. **Kilden endres i masterbrain, aldri i appen.** Regelen står allerede i `index.ts` og sync-scriptet.
   Håndhev den: legg en CI-sjekk som feiler hvis `src/lib/masterbrain/knowledge/` er endret i en PR uten en
   tilsvarende sync-commit.

### Tre konkrete hull som må lukkes

- **Kjør full sync.** Fire av fem kilder og manifestet mangler i appen. Kjør `npm run sync:masterbrain` mot
  en oppdatert klone og se hva som faktisk kommer.
- **Bygg `knowledge_chunks`.** Tabellen sync-scriptet forutsetter finnes ikke. Uten den er `rag-corpus`
  død vekt. Se MVP fase 2 — og merk at additive tabeller må legges til med kirurgisk `db execute`
  (`migrate dev` og `db push` er begge blokkert, jf. gotchas).
- **Ta i bruk `training-data`.** Eval-settet med rubrikk finnes i kilden. Det er hele forskjellen mellom et
  system som endrer seg og et som blir bedre.

---

## 5. MVP-anbefaling + veikart

### Fase 1 — Fundament og første ekte verdi (2–3 uker)

Dette er MVP. Alt her er lav risiko og bruker eksisterende mønstre.

1. ~~**Kjør full MASTERBRAIN-sync**~~ — **utført 2026-08-02**, se §7.
2. ~~**Rydd dobbeltfasiten.**~~ — **utført 2026-08-02**, se §7.
3. **`AiInteraksjon`-tabellen** (additiv, `CREATE TABLE IF NOT EXISTS` via `db execute`). La Caddie,
   `ai-plan`, plan-revisjon og agent-feedback skrive til den. Flytt agent-tommelen ut av `AuditLog`.
4. **`src/lib/agenticos/` med ruter + prompt-bygger + modellvalg.** Start med **én** flate:
   **SG-tolkning for spilleren.** Fasit finnes (`sg-principles.json` + `faults.json` + `drills.json`),
   dataene finnes (SG-pipelinen), og verdien er umiddelbar og synlig.
5. **Kostnadssporing på plass fra dag én** — tokens og `costUsd` per interaksjon, aggregerbart per bruker
   og per måned.

**Leveranse:** spilleren kan trykke på et SG-tall og få en forklaring forankret i CANON/MORAD, med kilde,
og systemet vet hva svaret kostet og om det ble nyttig.

### Fase 2 — Læringsløkken lukkes (3–4 uker)

6. **`knowledge_chunks` + pgvector + embedding-script** for `rag-corpus`. Legg til et `sok_kunnskap`-tool.
7. **`npm run eval:prompts`** mot `training-data/eval/` med rubrikk. Kjør i CI ved endring av promptmaler.
8. **«Hvorfor avvist»-feltet** i godkjenningskøen.
9. **Utvid `laeringslogg-til-masterbrain.ts`** til å lese hele `AiInteraksjon` og produsere ukentlig
   destillat: avvisningsmønstre, kandidat-eksempler, forslag til promptendringer.
10. **Caddie åpnes for COACH** med `coached.ts`-scoping.

**Leveranse:** ingen promptendring går live uten at evalen er lik eller bedre, og hver ukes bruk gir Anders
en konkret liste over hva som bør endres.

### Fase 3 — Bredde (etter pilot)

11. Caddie i godkjenningskøen («hvorfor foreslo du dette?»).
12. Live-økt-dialog med drills-cues fra MASTERBRAIN.
13. Dynamisk few-shot-valg etter likhet med spørsmålet.
14. Gameplan-strategi per hull.
15. Prompt-A/B: to versjoner i produksjon, velg vinner på målt utfall — først når `AiInteraksjon` har nok
    volum til at forskjellen er reell.

### Abonnement vs. API-kost

Dette må skilles tydelig, ellers spiser AI-en marginen.

| | Hva | Kostnadsbærer |
|---|---|---|
| **Inkludert i 299 kr/mnd** (og i gratis-sporene: prøveperiode, coaching-pakke, gruppe via AK Golf) | Regelbaserte signaler, deterministiske insights, SG-pipeline, MASTERBRAIN-oppslag (gratis — ingen LLM), én daglig AI-tolkning, ukesoppsummering | AK Golf, forutsigbart |
| **Coach-siden** | Caddie, plangenerering, godkjenningskø-dialog, daily brief | AK Golfs driftskost — coachen er ikke en abonnent, og verdien er spart tid |
| **Volumstyrt** | Fri chat, plangenerering på forespørsel | Rate limit per bruker (Caddie har allerede 10/min). Legg på et **månedlig tak per spiller** med tydelig norsk melding når det nås — ikke en sperre, en grense |

Konkret budsjettdisiplin: MASTERBRAIN-oppslag koster null og skal alltid forsøkes først. Haiku for alt
klassifiserende. Opus kun der en feil koster mer enn modellen. Med `AiInteraksjon` på plass er «hva koster
AI-en per abonnent» et SQL-spørsmål, ikke en gjetning — og det er den eneste måten å holde 299 kr/mnd
lønnsom på.

---

## 6. Risikoer og kvalitetssikring

| Risiko | Hvorfor den er reell her | Tiltak |
|---|---|---|
| **To fasiter drifter fra hverandre** | `ai-coach/kunnskap/` og MASTERBRAIN dekker samme domene i dag | Fase 1 punkt 2. Én kilde, CI-sjekk mot manuelle endringer i synket kopi |
| **Systemet blir dårligere over tid** | Ingen eval-port i dag; endringer ruller ut ubemerket | `eval:prompts` mot `training-data/eval/` som blokkerende gate |
| **Selvforsterkende feil** | Godkjente forslag blir treningsdata; en systematisk skjevhet forsterker seg selv | Menneske i loopen på destillering (aldri auto-commit til masterbrain) + eval-sett som er *frosset*, ikke generert fra produksjonsdata |
| **Hallusinerte øvelser og feil** | LLM kan finne på en drill som ikke finnes | Fasit-sjekk etter generering: alt som ikke matcher `drills.json`/`faults.json` markeres som ubekreftet |
| **Kostnadseksplosjon** | Ingen aggregert kostnadssporing i dag; hele skills-blokken sendes hver melding | `AiInteraksjon` med `costUsd` fra dag én, kontekst-budsjett per lag, Haiku-first |
| **PII om mindreårige** | Spillerdata er PII om barn; WANG/GFGK-reglene er strenge | Ingen navn i prompts — send id-er og aggregater. Ingen fritekst fra mindreårige i logg. Samtykke-gate på enhver ny AI-flate, som churn-radar og ukesoppsummering allerede har. Ollama lokalt for PII-vask der tekst må behandles |
| **Invariant-brudd** | «Anbefalinger sperrer aldri» er en hard invariant som en LLM lett kan bryte språklig | Guard etter generering som avviser «kan ikke», «må ikke», «blokkert» i utdata |
| **Rolle-lekkasje** | Caddies read-tools går rett i databasen | All kontekst-henting gjennom `coached.ts`-scoping. Ingen tool henter data brukeren ikke allerede kan se i UI |
| **Ruter-feilklassifisering** | Feil intent gir feil prompt og feil svar | Logg intent i `AiInteraksjon`. Lav confidence → fall tilbake til generell prompt, ikke gjett |
| **Overengineering** | Fristelsen er å bygge et agent-rammeverk til | Ikke bygg nytt. `src/lib/agenticos/` er tre filer: ruter, prompt-bygger, modellvalg. Alt annet gjenbrukes |

### Tre målepunkter som forteller om systemet blir bedre

1. **Godkjenningsrate per promptversjon** — andelen `PlanAction`/`CaddieDraft` som godkjennes uten endring.
   Faller den etter en endring, rull tilbake.
2. **Eval-score mot frosset sett** — måles ved hver promptendring. Skal aldri gå ned.
3. **Kost per nyttig svar** — `costUsd` delt på antall interaksjoner med utfall GODKJENT. Fanger både
   kvalitetsfall og modellsløsing i ett tall.

---

## 7. Fase 1 — utført 2026-08-02

Punkt 1 og 2 i veikartet er gjennomført. Full `verify` og alle 829 enhetstester er grønne.

### Full sync kjørt

`npm run sync:masterbrain` mot `akgolfsoftware/masterbrain` hentet inn 115 filer. Appens kopi var fra
**2026-06-16** og hadde gått glipp av hele sammenslåingen 31. juli:

| | Før | Etter |
|---|---|---|
| `positions.json`, `faults.json`, `drills.json` | v1.0.0 | v2.0.0 |
| `ordbok.json` (75 MORAD-begreper, 347 sitater) | manglet | v2.1.0 |
| `mikroperiodisering-og-tidsdimensjon.json` | manglet | v1.0.0 |
| `rag-corpus/` | manglet | 100 filer |
| `training-data/` (55 eksempler, 15 holdout-caser, rubrikk) | manglet | 5 filer |
| `MANIFEST.md` | manglet | på plass |

`MANIFEST.md` er nå i repoet og er kartet enhver agent skal lese først. Den dokumenterer også ni bevisste
kunnskapshull — blant annet at **drill-banken er tom med vilje** (tømt 31. juli fordi den ikke var til å
stole på) og at **putting mangler egen kunnskapskilde**, som er ~40 % av slagene.

### Dobbeltfasiten ryddet

Repoet hadde tre parallelle kopier av samme MORAD/CANON-kunnskap. To er fjernet:

- **`src/lib/ai-coach/kunnskap/`** (15 md) hadde samme filnavn som masterbrains `rag-corpus/morad/`.
  Ni var identiske; **seks hadde driftet fra fasiten** — de foreskrev navngitte drills fra den tømte banken
  og framstilte SG→feil som diagnose. `rag-select.ts` leser nå den synkede kopien.
- **`src/lib/domain/rules/`** var byte-identisk med materiale masterbrain arkiverte som utdatert
  2026-07-31. Fem av seks filer var ubrukt kode; den sjette er erstattet av fasiten.
- **`ai-coach/examples/`** var identisk med `training-data/examples/`.

### Rettet: SG→feil var diagnose, skal være hypotese

Den viktigste konsekvensen av at appen lå på juni-kunnskapen. `mapSgBandToFault()` returnerte
«primær MORAD fault-id (første i listen)» — fra en liste MANIFEST-et eksplisitt sier **ikke er en
rangering**. `sg-analyse-ekspert` sendte det videre til coachen som `MORAD-funn <id>`.

Erstattet med `sgKandidatFeil()` (hele listen, likestilte kandidater) og `beskrivKandidatFeil()`, som
formulerer det som Anders bestemte 31. juli: *«SG peker mot X eller Y — må bekreftes med video, sikte og
køllevalg.»* Forslaget bærer nå `moradKandidater` og `erHypotese` i stedet for én `moradFaultId`, og en test
låser formuleringen. `trackman-agent` gjettet en SG-basert feil når face-to-path var nøytral; den skriver nå
signalet uten svingfeil framfor å gjette.

### Sync-scriptet endret

`processed/rules` synkes ikke lenger. MANIFEST-et er tydelig på at `processed/` er råmateriale og aldri
fasit, og nettopp de filene var kilden til dobbeltfasiten.

### `AiInteraksjon` og `src/lib/agenticos/` — bygget

**`AiInteraksjon`** (`ai_interaksjoner`) er lagt inn i `schema.prisma` med DDL i
`scripts/create-ai-interaksjoner-2026-08-02.ts`. Én rad per AI-interaksjon på tvers av alle flater, med
`promptId` + `promptVersjon`, modell, tokens, `kostUsd`, latency, hvilke kontekstlag som ble brukt,
guard-treff, og utfall (`PENDING`/`GODKJENT`/`AVVIST`/`ENDRET`/`IGNORERT`) med rating og begrunnelse.
Dermed er «hvilken promptversjon får flest avvisninger» og «hva koster AI-en per abonnent» SQL-spørsmål.

> **Må kjøres før deploy:** `npx tsx scripts/create-ai-interaksjoner-2026-08-02.ts` mot `DIRECT_URL`.
> Kirurgisk `CREATE TABLE IF NOT EXISTS` — `migrate dev` og `db push` er begge blokkert (gotchas).
> Fram til den er kjørt logger `loggInteraksjon` en feil og returnerer null; ingenting annet stopper.

**`src/lib/agenticos/`** er fem filer, ikke et nytt rammeverk:

| Fil | Ansvar |
|---|---|
| `ruter.ts` | Klassifiserer intent/domene/rolle deterministisk før noe koster penger. Norsk bøyning håndteres med en endelsesliste; sammensetninger står eksplisitt. Ingen treff → `fritekst` med lav confidence, og kalleren velger generell prompt framfor å gjette. |
| `prompt-bygger.ts` | Bygger fire lag: rolle, tone, invarianter, kontekst, svarformat. Versjonert register per intent. Kontekstbudsjett per lag — aldri «lim inn alt». |
| `modell.ts` | Velger modell på **oppgave**, ikke agent-id. Opus kun for plan (treffer flere uker), Haiku for drift, Sonnet standard, lokal ved PII om mindreårige. Eskalering ett tier, maks én gang. |
| `guards.ts` | Kjører etter generering: fanger sperrespråk, SG-påstander formulert som diagnose, foreskrevne øvelser mens banken er tom, og fault-id-er som ikke finnes i fasiten. Blokkerer aldri — invariant 1 gjelder også våre egne kontroller. |
| `logg.ts` | Eneste skrivevei til `AiInteraksjon`. GDPR-porten står her: fritekst lagres aldri for mindreårige. Server-only, bevisst ikke re-eksportert fra `index.ts`. |

32 nye enhetstester dekker ruting, modellvalg, promptbygging og guards. Se `src/lib/agenticos/README.md`.

### Første flate koblet på: `ai-plan`

`ai-plan/generate.ts` skriver nå til loggen. Den var riktig sted å begynne fordi den allerede hadde tokens
og estimert kost — det som manglet var koblingen mellom promptversjon, guard-treff og utfall.

- **Promptversjon:** `AI_PLAN_PROMPT_ID` / `AI_PLAN_PROMPT_VERSJON` i `generate.ts`. **Bump versjonen** ved
  enhver endring i `AI_COACH_SYSTEM_PROMPT`, kunnskapsutvalget eller few-shot-blokken.
- **Kontekstkilder:** `byggSystemPromptMedKunnskap` rapporterer nå hva den faktisk fylte — `SPILLERDATA`
  alltid, `RAG` bare når `rag-select` fant noe. Ingen `FASIT` ennå: denne flaten gjør fortsatt ingen
  masterbrain-oppslag, og det er en reell forbedring som venter.
- **Guards:** kjøres på de menneskelesbare feltene i forslaget (navn, beskrivelse, fokusområder, øktfokus,
  drill-notater) — ikke på hele JSON-en. Treffene logges, de blokkerer ingenting.
- **Utfall:** `lagrePlanForslagCore` kaller `settUtfallForReferanse(generationId, "GODKJENT")` når forslaget
  faktisk lagres som en plan. Det er den sterkeste bekreftelsen vi har på at genereringen var god nok å
  bruke, og den koster ingen ekstra klikk. Oppslag på `referanseId` slipper å tre en ny id gjennom UI-laget.
- **Rolle:** `genererPlan` tar nå `rolle`. Spillerens egen plan-bygger sender `SPILLER`, AgencyOS-rutene
  bruker standardverdien `COACH`, så loggen skiller de to bruksmønstrene.

### Andre flate koblet på: Caddie

`/api/caddie/chat` logger nå én interaksjon per tur.

- **Ruteren brukes her**, i motsetning til `ai-plan`. Caddie er åpen chat, så intent og domene er ikke kjent
  på forhånd — det er nettopp tilfellet ruteren finnes for. `mindreaarig` er alltid `false`: Caddie er
  ADMIN-only bak `canAccessMissionControl`.
- **Kontekstkilder** settes fra faktisk verktøybruk. Caddie får ikke kontekst limt inn på forhånd, den henter
  data via tools underveis — `SPILLERDATA` markeres derfor når minst ett verktøy kjørte.
- **Loggen skrives uansett** om samtalen persisteres, slik at kostnad og kvalitet måles også for tråder uten
  `conversationId`.
- **Læringsløkken lukkes** via en ny nullbar kolonne `CaddieDraft.interaksjonId`. Godkjenning og avvisning i
  `draft-godkjenning.ts` setter `GODKJENT`/`AVVIST` på turen som produserte utkastet.

> **Valgt regel:** én tur kan produsere flere utkast som behandles hver for seg. `settUtfall` rører kun rader
> som fortsatt står `PENDING`, så det **første** utkastet som avgjøres setter turens utfall — en senere
> godkjenning overskriver ikke en tidligere avvisning. Grovt, men entydig: turen regnes som brukt så snart
> noe fra den ble behandlet.

DDL: `scripts/add-caddie-draft-interaksjon-2026-08-02.ts` (kjørt mot `dcnxoztjtdqoidaekxry`).

### Tredje flate koblet på: agentenes `PlanAction`-løp

Her viste kartleggingen noe verdt å vite: **av de ~24 filene som skriver `PlanAction`, er bare én
LLM-drevet.** `plan-revision-actions.ts` (via `foreslaPlanRevisjon`) kaller en modell. Resten —
`round-agent`, `plan-watcher`, `training-gap`, `sg-analyse-ekspert`, `periodiserings-agent`, hele
`booking-*`-familien — er deterministiske regler.

**Bare den ene er koblet på, og det er med vilje.** `AiInteraksjon` måler AI-interaksjoner: promptversjon,
modell, tokens, kost. Rader for regelagenter ville hatt tom modell og null kost, og forurenset både «kost per
nyttig svar» og godkjenningsraten per promptversjon. Regelagentene har allerede sin egen sporbarhet i
`AgentRun` og `provenance` — det er riktig sted for dem.

- `foreslaPlanRevisjon` logger **kun når modellen faktisk kjørte**. Demo-fallbacken (uten `ANTHROPIC_API_KEY`)
  er deterministisk og logges ikke. Kjørte modellen men var svaret ikke parsbart, logges interaksjonen
  likevel — kallet var reelt og kostet penger.
- `PlanAction.interaksjonId` (ny nullbar kolonne) kobler forslaget til modellkallet.
  `acceptPlanAction`/`rejectPlanAction` setter `GODKJENT`/`AVVIST`. Samme førstemann-vinner-regel som for
  Caddie-utkast.
- `PLAN_REVISION_PROMPT_ID`/`VERSJON` i `plan-revision.ts`.

DDL: `scripts/add-plan-action-interaksjon-2026-08-02.ts` (kjørt mot `dcnxoztjtdqoidaekxry`).

---

## 8. Plan for resterende steg

Oppdatert 2026-08-02, etter at fase 1 landet. Rekkefølgen er valgt etter verdi delt på innsats, ikke etter
hvor gøy det er å bygge.

### Steg 0 — CI-gaten (før noe annet)

**Problem:** åtte commits på grenen, én CI-kjøring. `verify`-jobben har ikke fyrt på noen commit etter den
første. Vercel-deployene er grønne og `npm run verify` er kjørt lokalt før hver push, men PR-gaten er reelt
sett av.

**Hvorfor først:** alt under skal gjennom den porten. En port som ikke lukker er verdiløs uansett hva vi
bygger bak den.

**Gjøres:** finn ut om det er kø-begrensning, en `paths`-filter, eller at `pull_request`-triggeren ikke
fyrer på `synchronize`. Anders sjekker Actions-fanen; dette er ikke noe en agent bør gjette på.

---

### Fase 1 — resten (1–2 uker)

#### 1.1 `FASIT` som kontekstlag — **utført 2026-08-02**

`src/lib/agenticos/kontekst.ts` slår opp riktig del av masterbrain-fasiten for domenet, og alle tre flatene
deler logikken. Oppslag, ikke søk — `faults[id]`, aldri embeddings.

| Domene | Hva som hentes |
|---|---|
| `SG` | SG-kategorier, APP-bånd med forventet slagtall, og kandidatfeil for området |
| `TEKNIKK` | MORAD-svingfeil med deteksjonsposisjon og korreksjon, pluss P1–P10 |
| `TRACKMAN` | Begge de over |
| `PLAN` | CANON-kategori med pyramidefordeling, perioder og 4-ukers mikrosyklus |
| `BOOKING`, `OKONOMI` | Ingenting — returnerer `null` framfor en tom blokk |

Blokkene er 134–3634 tegn, godt under budsjettet på 6000, så ingenting kuttes.

**Tre regler bakt inn i konteksten, låst med tester:**

1. **SG er hypotese.** Kandidatfeil leveres alltid med «likestilte HYPOTESER, ikke en rangering og ikke en
   diagnose — må bekreftes med videoanalyse, sikte og køllevalg».
2. **Periodenavn-fella.** CANON bruker GRUNN/SPES/TURN, databasen GRUNN/SPESIAL/TURNERING. Advarselen står
   eksplisitt i PLAN-blokka, så modellen ikke skriver CANON-strengen rått som periodeverdi.
3. **Tom drill-bank.** Meldes i alle metodikk-domener, aldri i booking/økonomi.

`PUTT` sier eksplisitt at MORAD er et posisjonssystem for fullsving og ikke dekker putting — at lista er tom
er korrekt, ikke en mangel.

Promptversjonene er bumpet til v2 i alle tre flatene (`ai-plan`, `caddie-chat`, `plan-revisjon`), så
loggen kan skille før og etter.

#### 1.2 Tett hullene i Caddies læringsløkke — **utført 2026-08-02**

Da `CaddieDraft.interaksjonId` ble innført, ble utfallet lukket i `draft-godkjenning.ts`. Det var **ikke**
den eneste veien et utkast avgjøres. Gjennomgangen fant tre:

| Vei | Lukket løkka før | Nå |
|---|---|---|
| `src/lib/caddie/draft-godkjenning.ts` | ja | via `avgjorDraft` |
| `src/app/admin/(legacy)/drills/forslag/actions.ts` (4 steder) | **nei** | via `avgjorDraft` |
| `src/app/api/caddie/approve/route.ts` → `resolveDraft` | **nei** | via `avgjorDraftViaToolCall` |

Forslag behandlet fra drill-forslagssiden eller direkte i chatten ble stående `PENDING` i `AiInteraksjon`,
og godkjenningsraten per promptversjon ble systematisk for lav.

**To ting planen tok feil om, verifisert i koden:**

1. Planen foreslo å rute drill-forslagene gjennom `godkjennOgUtforCaddieDraft`. Det ville brutt dem:
   `approval-executor.ts` kjenner ikke `createDrillSuggestion` eller `suggestDrillVideo`, og har dessuten
   ingen av den bespoke logikken (opprette `ExerciseDefinition`, sette `videoUrl`).
2. Planen slo fast at `approve/route.ts` ikke rørte draft-rader. Den gjør det — via `updateMany` i
   `resolveDraft`, som første grep leste feil.

**Løsningen ble bedre enn den planlagte:** `src/lib/caddie/draft-status.ts` gjør statusendring og
utfallsmelding til **én operasjon**. Ingen andre steder i kodebasen skriver `caddieDraft.status` lenger, så
hullet kan ikke gjenoppstå ved at noen glemmer det andre kallet. Låst med test.

**Lærdom:** når en løkke lukkes ett sted, søk etter alle skrivere av statusfeltet — og les treffene nøye.
Å gjøre de to operasjonene til én er sterkere enn å huske å kalle begge.

#### 1.3 LLM-agentene som ikke logget — **utført 2026-08-02**

Planen sa seks agenter. En systematisk sveip — «hvilke filer kaller `messages.create` eller `streamText`
uten å kalle `loggInteraksjon`» — ga et mer presist bilde:

| Agent | Logger nå | Utfall |
|---|---|---|
| `drill-forslag` | ja, med `interaksjonId` på hvert utkast | GODKJENT/AVVIST via 1.2 |
| `fabrikk` | ja, én interaksjon per radar-funn | GODKJENT/AVVIST via 1.2 |
| `caddie-proactive` | ja — kallet ligger i `vinn-tilbake.byggMelding`, én per spiller | GODKJENT/AVVIST via 1.2 |
| `daily-brief` | ja | PENDING (ingen godkjenningsflyt) |
| `performance-peaking` | ja | PENDING (vises inline) |
| `live-coach` | ja | PENDING (går rett til spiller) |
| `sg-interpretation` | ja, **med FASIT** | PENDING |
| `caddie-foundation` (`ai/agents/caddie.ts`) | ja, én per runde i tool-loopen | PENDING |

**To korreksjoner planen trengte:**

1. `caddie-proactive` kaller ingen modell selv. Modellkallet ligger et lag ned, i
   `vinn-tilbake.byggMelding`. Loggingen hører hjemme der, og `interaksjonId` tres opp gjennom
   `InaktivSpillerForslag`.
2. Sveipen fant **to agenter planen ikke nevnte**: `sg-interpretation` og `caddie-foundation`. Begge er
   foundation-lag som ennå ikke kalles fra noen rute, men begge ville blitt usynlige kostnader den dagen de
   tas i bruk. De er koblet på nå, så regelen holder uten unntak.

`sg-interpretation` fikk også FASIT-kontekst — den tolker SG-tall, som er nettopp der bånd, kandidatfeil og
hypotese-formuleringen skal komme fra fasiten framfor modellens hukommelse.

**Invarianten er nå sjekkbar:** ingen fil i `src/lib/agents/`, `src/lib/ai/agents/` eller `src/app/api/`
kaller en modell uten å logge. Sveipen over er kommandoen som verifiserer det.

Alle demo-/fallback-grener er bevisst utelatt: uten modellkall finnes det ingenting å måle, og en rad uten
modell ville forurenset kost per svar.

#### 1.4 «Hvorfor avvist» i godkjenningskøen — **utført 2026-08-02**

Avvisning tar nå en valgfri grunn, som havner i `AiInteraksjon.begrunnelse`.

**Faste koder, ikke ren fritekst.** `AVVIS_GRUNNER` i `agenticos/typer.ts`: feil periode, feil nivå, dårlig
begrunnelse, ikke relevant nå. Da blir «hvilken promptversjon får flest FEIL_PERIODE?» et SQL-spørsmål.
Koden valideres server-side med `erAvvisGrunn` — klienten kan ikke sende vilkårlig tekst inn i loggen.

UI: trykk på Avvis viser en rad med grunn-knapper pluss «Hopp over» og «Avbryt». Hopper man over, er
avvisningen nøyaktig som før. Ett ekstra trykk, valgfritt.

Koblet i alle fire avvisningsveiene: `rejectPlanAction`, `avvisProaktivtForslag`, `avvisDrillForslag` og
`avvisVideoForslag`.

**GDPR-porten flyttet — den viktigste endringen her.** Fram til nå lå `mindreaarig` som et flagg hvert
kallsted måtte sette, og det sto hardkodet til `false` overalt fordi ingen flate faktisk lagret fritekst.
Idet 1.4 gjør fritekst reell, ville det vært en lekkasje som ventet på å skje.

Flagget er fjernet fra API-et. `settUtfall` slår nå opp selv, mot interaksjonens egen spiller, og sjekker
både `dateOfBirth` (via `isMinor`) og `requiresGuardianConsent`. Ved tvil — ukjent bruker eller feilet
oppslag — lagres ingenting. Interaksjoner uten spiller (stall-brede agenter) får lagre, siden ingen
mindreårig kan identifiseres og teksten handler om systemet.

`settUtfallForReferanse` tar bevisst ikke begrunnelse: den er en `updateMany` som kan treffe flere
interaksjoner med ulik spiller, og porten må avgjøres per rad.

Testen låser alle grenene: voksen lagres, mindreårig ikke, venter-på-samtykke ikke, ukjent bruker ikke,
uten spiller lagres.

---

### Fase 2 — læringsløkken lukkes (3–4 uker)

#### 2.1 `knowledge_chunks` + ekte semantisk søk

`rag-corpus` er synket (100 filer), men ingenting søker i det. `rag-select.ts` gjør fortsatt
substring-matching på filnavn i `morad/`-undermappen — de øvrige 84 filene er utilgjengelige.

Rekkefølge: pgvector-tabell (additiv `db execute`) → embedding-script over `rag-corpus/` → `sok_kunnskap`-tool
→ bytt ut `rag-select.ts`. Bruk `index.json` som allerede finnes i korpuset (chunk_id, tags, topics,
relevance, word_count) til å filtrere før embedding.

**Kjent avvik å håndtere:** MANIFEST-et oppgir 99 tekstfiler på disk mot 96 i indeksen —
`sg-trackman-021.md`, `sg-trackman-040.md` og `treningsvolum-004.md` er uindekserte og vil ellers aldri bli
funnet.

#### 2.2 Eval-porten — **utført 2026-08-02**

`npm run eval:prompts`, i `verify` og i CI.

**Hva den måler, og hva den ikke måler.** Masterbrains `eval-holdout.py` sjekker om *fasiten* inneholder det
som trengs. Denne sjekker om **konteksten appen faktisk injiserer** (`byggFasitKontekst`) bærer de samme
fakta fram til modellen. Fasiten kan være komplett samtidig som vårt kontekstlag mister noe på veien — og
det var nøyaktig feilen den fant.

Per holdout-case bygges konteksten, og det sjekkes at den navngir forventet svingfeil, omtaler SG-båndet og
bærer hypotese-språket. Gaten sammenligner **andel** mot `eval/baseline.json`, ikke absolutte tall, så
sjekker kan utvides uten falske utslag. Lavere dekning enn baseline → exit 1.

**To lag.** Lag 1 (standard) kjører uten språkmodell, uten API-nøkkel og uten kostnad — derfor kan den stå i
CI, som ikke har `ANTHROPIC_API_KEY`. Lag 2 (`--med-modell`) skal kjøre de ekte promptene og score mot
rubrikken; den er ikke implementert ennå og feiler med en tydelig melding framfor å late som.

**Den fant en ekte feil med én gang.** `TEKNIKK`-grenen i `kontekst.ts` returnerte kun MORAD-feil og
P-posisjoner — uten SG-seksjonen. Et teknikkspørsmål som sprang ut av et SG-tall mistet dermed forbeholdet
«må bekreftes med video, sikte og køllevalg», og svingfeilen kunne presenteres som et funn. Nøyaktig
framstillingen beslutningen 31. juli forbyr. Dekningen gikk fra 27/39 til 35/38 etter fiksen.

**Én av «feilene» var i sjekken, ikke i koden.** ho-002 har en svingfeil uten SG-bånd — den er observert på
video, ikke utledet fra statistikk. Å kreve SG-forbeholdet der ville vært å teste feil ting. Sjekken krever
det nå bare når et SG-bånd faktisk er i spill.

**Kjent tak:** `drill_finnes` gir 0 for de tre casene som etterspør en navngitt drill, så lenge banken er
tom. 35/38 er dagens maksimum, ikke en regresjon.

Porten er verifisert ved å gjeninnføre regresjonen med vilje: dekningen falt til 71,1 % og gaten feilet med
exit 1.

#### 2.3 Ukentlig destillering

Utvid `scripts/laeringslogg-til-masterbrain.ts` fra å lese to tool-navn i `CaddieDraft` til å lese hele
`AiInteraksjon`. Produserer tre ting: avvisningsmønstre per promptversjon, kandidat-eksempler til
`training-data/`, og forslag til promptendringer. **Anders leser og committer** — kunnskapskilden utvider
seg aldri selv.

#### 2.4 Kostnadsoversikt

Med loggen på plass er dette SQL, ikke gjetning. Tre spørringer holder: kost per bruker per måned, kost per
promptversjon, og godkjenningsrate per promptversjon. Legg dem på `/admin/agents` framfor å bygge et nytt
dashboard.

---

### Fase 3 — bredde (etter pilot)

| # | Hva | Hvorfor vente |
|---|---|---|
| 3.1 | **SG-tolkning for spilleren** — flaggskip-flaten fra §2 | Krever 1.1 (FASIT) for å være verdt å bygge |
| 3.2 | Caddie åpnet for COACH med `coached.ts`-scoping | Lav risiko, men vent til loggen har volum |
| 3.3 | Godkjenningskøen som samtale («hvorfor foreslo du dette?») | Trenger 1.3 for å gi mening |
| 3.4 | Live-økt-dialog med cues fra `drills.json` | Blokkert: drill-banken er tom |
| 3.5 | Dynamisk few-shot etter likhet med spørsmålet | Trenger 2.1 (embeddings) |
| 3.6 | Prompt-A/B med utfallsmåling | Trenger volum i `AiInteraksjon` først |

---

### Beslutninger som blokkerer — Anders

Disse er ikke tekniske oppgaver. De står i veien for konkrete steg over.

1. **Drill-banken er tom** (tømt 31. juli, bevisst). Blokkerer 3.4, kapper eval-taket til 20/25, og lar
   `drill-forslag`/`fabrikk`/`media-lofte` generere forslag uten fasit å validere mot. Hva er planen for å
   fylle den?
2. **Putting mangler kunnskapskilde.** `sg_to_morad_faults.putt` er tom — korrekt, siden MORAD er et
   posisjonssystem for fullsving. Men putting er ~40 % av slagene, og systemet kan ikke si noe kvalifisert
   om det. Trenger sitt eget rammeverk.
3. **Attribusjonsfeilen Malaska/O'Grady** er ute av appen (fila ble slettet), men lever fortsatt i
   `ak-second-brain/wiki/sources/2026-05-18-morad-ordbok-v2.md`.
4. **Ordboka er 7 % destillert** — 75 av 1 081 kildesegmenter. Masterbrain har parkert videre arbeid.

### Rekkefølge, kort

```
0.  CI-gaten                   ← blokkerer alt. Ikke en agent-oppgave.
1.1 FASIT-kontekst             ✔ utført 2026-08-02
1.2 tett hullene i løkka       ✔ utført 2026-08-02
1.3 agenter på loggen          ✔ utført 2026-08-02
1.4 «hvorfor avvist»           ✔ utført 2026-08-02
2.1 knowledge_chunks           ← gjør rag-corpus reell
2.2 eval-porten                ✔ utført 2026-08-02
2.3 destillering  2.4 kostnad  ← lukker løkken
3.x bredde                     ← etter pilot
```

### Hva som er sant om loggen akkurat nå

Verifisert 2026-08-02, så planen bygger på tilstand og ikke hukommelse:

| | Status |
|---|---|
| Skriver til `AiInteraksjon` | `ai-plan`, `caddie-chat`, `plan-revisjon` |
| Lukker utfall | `ai-plan` (ved lagring), `plan-revisjon` (ved godkjenning/avvisning), Caddie via alle tre veier etter 1.2 |
| Rapporterer `FASIT` | alle tre, etter 1.1 |
| Kaller modell uten å logge | ingen — verifisert med sveip |
| Tabeller i produksjon | `ai_interaksjoner` (RLS på), `caddie_drafts.interaksjonId`, `plan_actions.interaksjonId` |
| Promptversjoner | `ai-plan@2`, `caddie-chat@2`, `plan-revisjon@2` |

**Fase 1 er ferdig.** Godkjenningsraten er riktig (1.2), alle modellkall logges (1.3), fasiten er i
konteksten (1.1), og avvisninger bærer en kodet grunn (1.4). Loggen kan nå svare på hva AI-en koster, hvilken
promptversjon som fungerer, og hvorfor forslag blir avvist.

Neste flaskehals er ikke flere data, men **evaluering**: uten porten i 2.2 kan vi måle at noe endret seg,
men ikke garantere at det ble bedre.
- **SG-tolkning for spilleren** som første helt nye flate. Merk at den må formuleres som hypotese, og ikke
  kan foreskrive navngitte drills før drill-banken er bygget på nytt.
- **«Hvorfor avvist»-feltet** i godkjenningskøen, som mater `settUtfall` med den mest verdifulle
  datakilden i hele systemet.

### To ting Anders bør ta stilling til

1. **Drill-banken er tom.** Agenter som foreslår driller (`drill-forslag`, `fabrikk`, `media-lofte`) står
   uten fasit å sjekke mot. De kan fortsatt generere forslag, men ingenting validerer dem mot en katalog.
2. **`morad-ordbok-v2.json` hadde en attribusjonsfeil** — innholdet er Mac O'Gradys, men var tilskrevet
   «Mac Malaska», en forveksling med instruktøren Mike Malaska. Masterbrain rettet dette 31. juli og noterte
   at appfila fortsatt var feil. Fila er nå slettet fra appen som del av oppryddingen, så feilen er ute av
   koden — men den lever fortsatt i `ak-second-brain/wiki/sources/2026-05-18-morad-ordbok-v2.md`.
