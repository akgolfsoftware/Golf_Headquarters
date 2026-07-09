# AI-golf-coach — arkitektur

Skrevet 9. juli 2026. Styringsdokument for AI-coachen i AK Golf HQ.
Beslutning som ligger fast: **alt kjører på appens eget agent-OS** (`src/lib/agents/`) — aldri ekstern agent-tjeneste.
Prinsipp som ligger fast: **AI-en anbefaler, den sperrer aldri** (ingenting i appen blokkerer trening).

## 1. Målbildet

En AI-coach som jobber som en ekte trener: den ser på **video av svingen din** og **tallene fra TrackMan samtidig**,
sammenligner med det du har trent på, testet og prestert i turneringer — og gir deg konkrete anbefalinger i klarspråk.
Spilleren ser anbefalingene i PlayerHQ, coachen (Anders/Markus) ser dem i AgencyOS og godkjenner/forkaster.
Fundamentet for det faglige er MORAD-metodikken (Mac O'Grady): svingen beskrives i posisjoner P1–P10, og hver feil
har kjente årsaker og kjente drills.

## 2. Slik virker dagens agent-OS (fundamentet vi bygger på)

Appen har allerede et komplett system for automatiske «medarbeidere» — små programmer som kjører selv:

- **Kjøring og logg:** hver agent pakkes i `runAgent()` (`src/lib/agents/agent-runner.ts`) som tar tiden, fanger feil
  og skriver en `AgentRun`-rad (navn, status OK/ERROR, varighet, resultat). Alt er sporbart i etterkant.
- **Triggere:** to måter å starte på. (a) *Hendelse:* `src/lib/agents/triggers.ts` kalles rett etter at noe lagres
  (ny runde → `triggerRoundAgent`, ny TrackMan-import → `triggerTrackManAgent`). (b) *Klokke:* cron-jobber i
  `vercel.json` → `/api/cron/*` (f.eks. `sg-insights` hver natt kl. 04).
- **Output:** agentene skriver `Signal` (observasjon, f.eks. SG-trend) og `PlanAction` (konkret forslag med status
  PENDING → ACCEPTED/REJECTED — mennesket bestemmer alltid).
- **Varsling:** `varsleAgentFunn()` (`src/lib/agents/agent-notify.ts`) sender samme funn tre veier samtidig:
  in-app-varsel (`Notification`), web-push, og Telegram til Anders. Feiler én kanal, går de andre likevel.
- **Visning:** `/admin/agents` lister alle agenter (registeret `AGENT_INFO` i `src/app/admin/agents/page.tsx`),
  med kjøringshistorikk og manuell «kjør nå»-knapp per agent.
- **Registrere ny agent = 3 steg:** ny fil i `src/lib/agents/` som bruker `runAgent()`, en trigger (i `triggers.ts`
  eller ny cron-rute), og en rad i `AGENT_INFO`. Ingen ny infrastruktur trengs.
- **AI-kall:** direkte mot Anthropic via `@ai-sdk/anthropic` (`claude-sonnet-4-6`) — samme oppsett som AI Caddie
  (se `.claude/rules/gotchas.md` for fellene).

## 3. Agent-ekspertene (4 nye, én per ekspertise)

Alle fire følger samme mønster og leverer **AnbefalingsKort-kontrakten**: *Hvorfor* (hva dataene viser) /
*Hva* (konkret tiltak, gjerne drill fra øvelsesbanken) / *Forventet effekt* (målbart, f.eks. «+0,3 SG innspill på
4 uker») / *Hvorfor nå* + primærknapp «Bruk forslag» (lagres som `PlanAction`, PENDING til coach/spiller godtar).

| Agent | Input (modeller/felter) | Hva den ser etter | Trigger |
|---|---|---|---|
| **SG-analyse-ekspert** | `Round` (sgTotal/sgOtt/sgApp/sgArg/sgPutt + granulære felt som sgApp150, sgPutt3_5), `BrukerSgInput` (kilde MANUELL/TRACKMAN), `SgInsight` | Hvilket område taper flest slag mot referanse (SG = «strokes gained», slag vunnet/tapt per kategori). Trend siste 5 runder vs. sesong. Bruttoscore alltid — aldri netto. | Ny runde lagret + ukentlig cron |
| **TrackMan-data-ekspert** | `TrackManSession` + `TrackManShot` (ballSpeed, smashFactor, clubPath, faceAngle, faceToPath, attackAngle, spinRate, carry, side/spredning, strikePatternX/Y), `ClubMetricTrend` | Klubbdata mot spillerens egen baseline: fallende smash (treffkvalitet), face-to-path-drift (ballens startretning vs. kurve), spredningsmønster per kølle. Kobler funn til P-posisjon der feilen typisk oppstår (f.eks. face åpen → P6/P7). | Ny TrackMan-import (utvider dagens `trackman-agent`) |
| **Treningsdata-ekspert** (trening ↔ tester/turneringer) | `TrainingPlanSession` (de 6 AK-aksene: pyramidArea, pressureLevel, lFase, miljo, csNivaa, pPosisjoner) + `TrainingPlanSessionLog`, `TestResult`/`TestDefinition`, `Tournament`/`TournamentResult`/`TournamentEntry` | Gir treningen resultater? Sammenligner hva som faktisk trenes (område, press, miljø) med testfremgang og turneringsscore. Finner hull: «mye teknikk i lavt press, men turneringene krever CS høyt press» — foreslår rebalansering. | Nytt testresultat / nytt turneringsresultat + ukentlig cron |
| **Sving-video-analytiker** | `SessionVideo` + ny `SwingAnalysis`-modell, `TrackManShot` fra samme tidsrom | Video + TrackMan SAMMEN: finner P1–P10-posisjonene i videoen (bilde for bilde), måler avvik mot MORAD-sjekkpunktene (P1.0–P10.0-data finnes i kunnskapsbasen), og forklarer TrackMan-tallene med det den ser («face åpen i P6 → derfor pushen på 7-jern»). | Ny video lastet opp (asynkront, se pkt. 4) |

Alle fire varsler via `varsleAgentFunn()` og vises i `/admin/agents` som dagens agenter.

## 4. Video-flyten

1. **Opplasting i PlayerHQ:** bucket-en finnes allerede — `player-swing-videos` (privat, maks 50 MB,
   mp4/QuickTime/webm) i `src/lib/storage/buckets.ts`; `scripts/create-storage-buckets.ts` oppretter den.
   `SessionVideo`-modellen har allerede status PROCESSING/READY/FAILED — vi bruker samme mønster.
2. **Asynkron analyse:** opplasting svarer umiddelbart («Video mottatt — analysen kommer»), analytiker-agenten
   jobber i bakgrunnen. Konsept: videoen deles i stillbilder, en visjonsmodell finner hvilke bilder som er
   P1 (oppstilling) … P10 (finish), og hver posisjon måles mot MORAD-sjekkpunktene.
3. **Kobling video ↔ TrackMan-slag:** hvert `TrackManShot` har `recordedAt` (tidsstempel). Videoer tatt i samme
   økt matches på tid ± toleranse; usikre koblinger bekreftes manuelt av spiller/coach (samme filosofi som
   dagens `matchSource`/`matchConfidence` på TrackMan-slag).
4. **Personvern (hard regel):** video av mindreårige krever foreldresamtykke. `getCurrentUser` stopper allerede
   mindreårige uten samtykke før de når portalen (consent-gate) — video-opplasting ligger bak samme gate, bucketen
   er privat (kun signerte URL-er), og sletting av video sletter også analysen.

## 5. Kunnskaps-RAG — MORAD-hjernen til agentene

RAG = agentene *slår opp* i kunnskapsbasen og limer relevante utdrag inn i AI-kallet, i stedet for å gjette.
Enkel, konkret tilnærming i tre trinn:

- **Nå (F1–F2):** kuraterte markdown-utdrag fra `~/Developer/ak-second-brain/wiki/` sjekkes inn i repoet som
  `src/lib/ai-coach/kunnskap/*.md` — P1.0–P10.0-sjekkpunktene, feil→drill-koblingene (10 faults / 9 drills),
  og ordbok v2 (74 termer). Agentene velger fil etter tema (putting-funn → putting-utdrag). Ingen vektordatabase
  før innholdet krever det.
- **Notion:** Mac O'Grady Knowledge Base og sportsplanen hentes via Notion MCP ved kuratering — de forblir
  kilde, utdragene i repoet er arbeidskopien.
- **Senere (Toshiba):** MORAD-videoarkivet (770 GB på TOSHIBA EXT, indeks finnes i ak-second-brain) indekseres
  når disken er tilkoblet — transkripter og posisjonsbilder inn i samme kunnskapsmappe. Egen jobb, egen plan.
- **Vekstbane:** når utdragene passerer ~50 filer, flyttes de til Postgres med pgvector (semantisk søk i samme
  database vi allerede har). Ikke før.

## 6. Digital coaching — betalt produkt (SENERE, kun konsept)

Når F1–F3 står: «AK Digital Coaching» som abonnement oppå PlayerHQ. Spilleren laster opp video + har TrackMan-data,
AI-coachen svarer innen minutter med analyse og drills, og en chat (samme motor som AI Caddie) lar spilleren stille
oppfølgingsspørsmål. Anders/Markus kvalitetssikrer et utvalg svar ukentlig — AI-en skalerer coachingen, den erstatter
den ikke. Prising avgjøres da (utenfor dagens gratis/299-modell — egen beslutning for Anders). Ingen bygging nå.

## 7. Faseplan

| Fase | Innhold | Akseptansekriterier |
|---|---|---|
| **F1 — Arkitektur + kontrakter (nå)** | Dette dokumentet. Zod-skjema for AnbefalingsKort (Hvorfor/Hva/Forventet effekt/Hvorfor nå), `SwingAnalysis`-modellskisse, kunnskapsmappe-struktur, agentene registrert som skall i `AGENT_INFO`. | Dokument godkjent av Anders. Kontrakten kompilerer (`tsc`). Skall-agentene synes i `/admin/agents` og logger `AgentRun` ved manuell kjøring. |
| **F2 — Tekstdata-agentene** | SG-analyse-ekspert, TrackMan-data-ekspert og treningsdata-ekspert fullt operative med RAG-utdrag, triggere og varsler. | Hver agent produserer gyldig AnbefalingsKort (zod-validert) på demodata (Øyvind Rohjan). Trigger fyrer ved ny runde/import/testresultat. Coach kan godta/avvise i AgencyOS → `PlanAction`-status endres. Null `any`, `tsc` + build grønt. |
| **F3 — Video-MVP** | Opplasting i PlayerHQ mot `player-swing-videos`, asynkron P-posisjons-deteksjon, kobling til TrackMan-slag, analytiker-agenten leverer kort med stillbilder per posisjon. | Video → analyse ferdig uten at brukeren venter på siden. Minst P1/P4/P7 (oppstilling/topp/treff) detekteres på testvideoer. Mindreårig uten samtykke kan ikke laste opp. Sletting fjerner video + analyse. |
| **F4 — Digital coaching** | Betalt produkt: chat + video + AI-coach som pakke, kvalitetssikringsflyt for coach. | Egen plan og prisbeslutning fra Anders før bygging starter. Definert her kun som retning. |

**Rekkefølgen er bevisst:** tekstdata først (F2) fordi alle datamodellene finnes i dag — video (F3) er den eneste
delen som krever ny teknologi, og den bygger på kontraktene fra F1/F2 uten å endre dem.
