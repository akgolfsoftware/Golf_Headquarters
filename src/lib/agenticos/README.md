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
| `prompt-bygger.ts` | Setter sammen fire lag: rolle, tone, invarianter, kontekst, svarformat. Versjonert register — **bump `versjon` ved enhver tekstendring**, ellers blir loggen løgn. |
| `modell.ts` | Velger modell på **oppgave**, ikke på agent-identitet. Opus kun der en feil treffer flere uker. `krevLokal` for PII om mindreårige. |
| `guards.ts` | Kjører **etter** generering. Prompten er en anmodning, guarden er en kontroll. Blokkerer aldri — returnerer treff som logges. |
| `logg.ts` | Eneste skrivevei til `AiInteraksjon`. **Server-only** — eksporteres bevisst ikke fra `index.ts`. |
| `typer.ts` | Delte typer. Trygg for klient. |

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
