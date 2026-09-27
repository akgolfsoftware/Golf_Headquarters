# AgenticOS, Jarvis og Masterbrain — Arkitekturkart

Dokumentet kartlegger AI-infrastrukturen, agentene, Jarvis og Masterbrain i AK Golf HQ per 26. september 2026.

---

## 1. Oversikt og formål

AgenticOS er intelligenslaget i plattformen. Systemet er designet for å fungere som Anders' digitale assistent og trenerstab. Det spenner fra strategisk sparring for treneren til sanntidsveiledning under trening for spillerne.

Kjerneprinsippet i arkitekturen er **streng menneskelig kontroll (Human-in-the-loop — HITL)**:
* Ingen AI-agent kan endre en spillers treningsplan, sende en e-post eller publisere innhold direkte.
* Alle endringsforslag opprettes som ventende utkast (`PROPOSED` eller `DRAFT`) og må godkjennes av trener i en egen godkjenningskø før de trer i kraft.

---

## 2. Ruter og kontrollpaneler

* `/admin/jarvis`: Sentral AI-cockpit for treneren. Tilbyr sparring på treningsmetodikk, analyse av spillerutvikling og oppsummering av stallens status.
* `/meg` (3 ruter: `/meg`, `/meg/innboks`, `/meg/oppgaver`): Anders' personlige assistentflate. Koblet mot Telegram for raske talebeskjeder på farten og Notion for oppgavestyring.
* `/admin/ko`: Godkjenningskøen for agentforslag. Her lander alle genererte treningsplaner, planrevisjoner og utkast til utsendelser.
* `/admin/agents` & `/admin/agencyos/dispatch`: Oversikt over aktive bakgrunnsjobber, systemstatus og agent-helse.

---

## 3. Masterbrain — Kunnskapsbanken

Masterbrain (`src/lib/masterbrain/`) er plattformens faglige fasit. For å unngå at språkmodellene «hallusinerer» eller gir generiske råd, tvinges agentene til å hente kunnskap fra dette biblioteket:

1. **Strukturerte kunnskapsmodeller (`concepts/` og `entities/`):**
   * `canon-methodology.json`: AK Golfs overordnede treningsfilosofi og verdisett (AK Canon v3.5).
   * `positions.json`: MORAD-basert teknisk svingmodell med posisjoner fra P1.0 (adresse) til P10.0 (avslutning).
   * `faults.json`: 10 definerte primærfeil i svingen og deres årsakssammenhenger.
   * `sg-principles.json` & `upgame-dimensions.json`: Strokes Gained-matriser for 17 nærspills- og slagkategorier.
   * `ltad-framework.json` & `mikroperiodisering-og-tidsdimensjon.json`: Regler for langsiktig spillerutvikling og ukentlig belastningsstyring.
2. **Semantisk kunnskapsbase (RAG):**
   * 99 kuraterte markdown-filer med treningsøvelser, faglitteratur og erfaringsnotater.
   * Lokale vektordatabaser (`agentdb.rvf`, `ruvector.db`) gjør det mulig for agentene å finne nøyaktig rett øvelse på millisekunder.

---

## 4. De 18 LLM-kallflatene

Plattformen kaller språkmodeller (primært Anthropic Claude Sonnet 4.6, samt Claude Vision, OpenAI Whisper og Perplexity Sonar) på 18 veldefinerte steder:

| Nr | Agent / Funksjon | Filsti | Modell / API | Menneskelig godkjenning (HITL) |
|---|---|---|---|---|
| 1 | Treningsplangenerering | `src/lib/ai-plan/generate.ts` | Claude Sonnet | **Ja** (Lagres som DRAFT i godkjenningskø) |
| 2 | Caddie AI Coach | `src/app/api/caddie/chat/route.ts` | Claude via Vercel AI SDK | **Ja** (PlanAction / CaddieDraft må godkjennes) |
| 3 | Spiller-chat i portal | `src/app/api/portal/chat/route.ts` | Claude Sonnet | Nei (Kun lesetilgang/forklaring til spiller) |
| 4 | Coach AI Sparring | `src/app/api/coach/ai-chat/route.ts` | Claude Sonnet | Nei (Privat idélab for trener) |
| 5 | Live Coach under økt | `src/app/api/live/coach-chat/route.ts` | Claude Sonnet | Nei (Sanntidstips under pågående trening) |
| 6 | Daily Brief Agent | `src/lib/ai/agents/daily-brief.ts` | Claude Sonnet | Nei (Intern morgenrapport til trener) |
| 7 | Strokes Gained-tolkning | `src/lib/ai/agents/sg-interpretation.ts` | Claude Sonnet | **Ja** (Tiltak sendes til godkjenningskø) |
| 8 | Planrevisjon ved avvik | `src/lib/ai/agents/plan-revision.ts` | Claude Sonnet | **Ja** (Oppretter PlanAction som PROPOSED) |
| 9 | Formtoppingsagent | `src/lib/ai/agents/performance-peaking.ts`| Claude Sonnet | **Ja** (Endringsforslag krever godkjenning) |
| 10 | Winback-agent | `src/lib/ai/agents/vinn-tilbake.ts` | Claude Sonnet | **Ja** (Kampanje e-post godkjennes før send) |
| 11 | Innboks e-postsvar | `src/lib/innboks/generer-utkast.ts` | Claude Sonnet | **Ja** (Utkast godkjennes før utsendelse) |
| 12 | TrackMan Bilde-OCR | `src/lib/trackman/parse-photo.ts` | Claude Vision | **Ja** (Trener bekrefter tallene før import) |
| 13 | Lydopptaksanalyse | `src/lib/coaching-analysis.ts` | Claude Sonnet | **Ja** (Trener godkjenner sammendrag) |
| 14 | SoMe-innholdsagent | `src/lib/agents/social-media-agent.ts` | Claude Sonnet | **Ja** (Lagres som DRAFT i markedskø) |
| 15 | Jarvis Multi-Agent Team | `src/app/api/kommando/chat/route.ts` | Multi-provider router | **Ja** (Oppgaver styres via /admin/ko) |
| 16 | Meg Telegram-agent | `src/lib/meg/agent.ts` | Claude + Perplexity | **Ja** (Anders godkjenner opprettelser) |
| 17 | Tale-transkribering | `src/lib/voice/whisper-transcribe.ts`| OpenAI Whisper | Nei (Automatisk transkripsjon av taleopptak) |
| 18 | LLM Dommer / Evals | `src/lib/evals/judge.ts` | Claude Sonnet | Nei (Automatisk kvalitetssjekk av AI-svar) |

---

## 5. Datamodeller som understøtter agentene

* **`PlanAction`:** Universell enhet for agentforslag. Holder feltene `actionType` (`ADD_SESSION`, `REMOVE_SESSION`, `CHANGE_VOLUME`), `status` (`PROPOSED`, `APPROVED`, `REJECTED`), `confidenceScore` og `reasoning`.
* **`CaddieDraft`:** Midlertidige planforslag generert under samtaler med spilleren.
* **`PromptAuditLog`:** Sikkerhetslogging av alle utgående spørringer mot eksterne LLM-er, inkludert anonymiseringsflagg og tokenforbruk.
* **`MasterbrainConcept` & `MasterbrainEntity`:** Databaserepresentasjon av AK-metodikken for raske relasjonsspørringer.

---

## 6. Kodebevis

### Krav om godkjenning (HITL) for planendringer
Fra `src/lib/ai/agents/plan-revision.ts` (linje 74–80):
```typescript
    await prisma.planAction.create({
      data: {
        playerId,
        actionType: "REVISE_VOLUME",
        status: "PROPOSED", // Krever aktiv coach-godkjenning i /admin/ko
        payload: JSON.stringify(forslag),
        reasoning: vurdering.begrunnelse,
```

### Caddie tvinges til å hente Masterbrain-kunnskap
Fra `src/lib/caddie/system-prompt.ts` (linje 12–16):
```typescript
Du skal ALLTID konsultere Masterbrain-verktøyene før du svarer på faglige spørsmål
om teknikk (P1-P10), treningsplanlegging eller Strokes Gained. Aldri oppfinn
egne definisjoner som strider mot AK Canon eller MORAD-rammeverket.
```
