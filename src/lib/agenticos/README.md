# AgenticOS — felles inngangspunkt for AI-flatene

Dette laget bestemmer **hva** som spørres om, **med hvilken kontekst**, av **hvilken modell** — og gjør
resultatet målbart. Selve modellkallet eier hver flate fortsatt (Caddie, `ai-plan`, agentene); AgenticOS
erstatter ikke dem, det gir dem et felles grunnlag.

Se `docs/platform/AGENTICOS-MASTERBRAIN-ARKITEKTUR.md` §3 for hvorfor.

## Flyten

```ts
import { byggPrompt, kjorGuards, klassifiser, velgModell } from "@/lib/agenticos";
import { loggInteraksjon, settUtfall } from "@/lib/agenticos/logg"; // server-only

const k = klassifiser({ tekst, rolle: "SPILLER", mindreaarig });
const prompt = byggPrompt(k, [
  { kilde: "FASIT", innhold: fasitTekst },        // masterbrain-oppslag — gratis, prøv alltid først
  { kilde: "SPILLERDATA", innhold: spillerTekst }, // Prisma via eksisterende tools, coach-scopet
  { kilde: "RAG", innhold: ragTekst },             // først når fasit + data ikke dekker spørsmålet
]);
const { modell, tier } = velgModell(k);

const svar = await kallModell(prompt.system, modell); // flatens eget ansvar

const treff = kjorGuards(svar);
const id = await loggInteraksjon({ prompt, klassifisering: k, modell, guardTreff: treff, userId });

// senere, når coachen godkjenner eller avviser:
await settUtfall({ interaksjonId: id, utfall: "AVVIST", begrunnelse: "feil periode", mindreaarig });
```

## Filene

| Fil | Ansvar |
|---|---|
| `ruter.ts` | Klassifiserer oppgaven (intent, domene, rolle) før noe koster penger. Deterministisk — nøkkelord med norsk bøyning + rollen fra sesjonen. Treffer ikke regelen, blir det `fritekst` med lav confidence, og kalleren velger den generelle prompten framfor å gjette. |
| `kontekst.ts` | Slår opp riktig del av masterbrain-fasiten for domenet. **Oppslag, ikke søk** — `faults[id]`, aldri embeddings. Gratis, deterministisk, ingen hallusinasjon. Returnerer `null` når fasiten ikke har noe å bidra med. |
| `prompt-bygger.ts` | Setter sammen fire lag: rolle, tone, invarianter, kontekst, svarformat. Versjonert register — **bump `versjon` ved enhver tekstendring**, ellers blir loggen løgn. |
| `modell.ts` | Velger modell på **oppgave**, ikke på agent-identitet. Opus kun der en feil treffer flere uker. `krevLokal` for PII om mindreårige. |
| `guards.ts` | Kjører **etter** generering. Prompten er en anmodning, guarden er en kontroll. Blokkerer aldri — returnerer treff som logges. |
| `logg.ts` | Eneste skrivevei til `AiInteraksjon`. **Server-only** — eksporteres bevisst ikke fra `index.ts`. |
| `typer.ts` | Delte typer. Trygg for klient. |

## Hvem er koblet på

| Flate | Status |
|---|---|
| `ai-plan/generate.ts` | **Koblet.** Logger promptversjon, modell, tokens, kost, latency, kontekstkilder og guard-treff. `lagrePlanForslagCore` setter `GODKJENT` når forslaget lagres som plan. |
| Caddie (`/api/caddie/chat`) | **Koblet.** Én interaksjon per tur, klassifisert med ruteren (åpen chat). `CaddieDraft.interaksjonId` peker tilbake, så godkjenning/avvisning setter utfallet. |
| `plan-revisjon` (`src/lib/ai/agents/plan-revision.ts`) | **Koblet.** Eneste LLM-drevne agent som skriver `PlanAction`. `PlanAction.interaksjonId` peker tilbake; `acceptPlanAction`/`rejectPlanAction` setter utfallet. |
| Øvrige ~23 agenter som skriver `PlanAction` | **Bevisst ikke koblet** — deterministiske regler uten modellkall. Se under. |

### Hvorfor de fleste agentene ikke logger

`AiInteraksjon` måler AI-interaksjoner: promptversjon, modell, tokens, kost. De aller fleste agentene i
`src/lib/agents/` er rene regler — `round-agent`, `plan-watcher`, `training-gap`, `sg-analyse-ekspert`,
`booking-*` og resten kaller ingen modell. Rader for dem ville hatt tom modell og null kost, og forurenset
både «kost per nyttig svar» og godkjenningsraten per promptversjon.

De har allerede sin egen sporbarhet: `AgentRun` for kjøringer og `provenance` for hvorfor. Bruk de kildene
til regelagenter, og `AiInteraksjon` til modellkall.

En flate som ikke bruker `MALER` (som `ai-plan`, med egen system-prompt) konstruerer `BygdPrompt` selv med
en egen `promptId` og en versjonskonstant som må bumpes ved tekstendringer.

## Regler

1. **Bump promptversjon ved enhver endring.** `promptId` + `promptVersjon` er hele grunnlaget for å svare på
   om en endring gjorde svarene bedre eller dårligere.
2. **Fasit før RAG.** Masterbrain-oppslag koster null og hallusinerer ikke. Semantisk søk er siste utvei.
3. **Ingen navn i prompts.** Send id-er og aggregater. `mindreaarig` kommer fra sesjonen, aldri fra teksten.
4. **Guards blokkerer ikke.** Invariant 1 sier at anbefalinger aldri sperrer — det gjelder også for våre egne
   kontroller. Et guard-treff er et signal, ikke en vetorett.
5. **Loggen er best-effort.** En feil i `loggInteraksjon` skal aldri velte svaret brukeren venter på.

## Før tabellen finnes

`loggInteraksjon` skriver til `ai_interaksjoner`. Tabellen opprettes med
`npx tsx scripts/create-ai-interaksjoner-2026-08-02.ts` (kirurgisk `CREATE TABLE IF NOT EXISTS` mot
`DIRECT_URL` — `prisma migrate dev` og `db push` er begge blokkert, se `.claude/rules/gotchas.md`).
**Kjør scriptet før koden deployes.** Fram til da logger `loggInteraksjon` en feil og returnerer `null`;
ingenting annet stopper.
