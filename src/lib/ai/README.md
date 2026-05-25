# AI-foundation (`src/lib/ai/`)

Felles bibliotek for AI-agents i AK Golf HQ. Bygger på Anthropic Messages API
med tool-use og Skills (kunnskapsblokker injisert i system-prompt).

Eksisterende `src/lib/anthropic.ts`, `src/lib/ai-plan/` og `src/lib/caddie/`
forblir uendret i denne fasen — `src/lib/ai/` er ny foundation som agents
gradvis migrerer til.

## Mappestruktur

```
src/lib/ai/
├── client.ts           # Anthropic-klient (singleton) + modell-konstanter
├── memory.ts           # Bruker-spesifikk minne-skjelett (in-memory stub)
├── skills/             # Kunnskapsblokker som injiseres i system-prompt
│   ├── pyramide-taksonomi.ts
│   ├── bompa-perioder.ts
│   ├── sg-interpretation.ts
│   └── index.ts        # ALL_SKILLS
├── tools/              # Tool-definisjoner + exec-funksjoner
│   ├── get-spiller.ts
│   ├── get-runder.ts
│   ├── get-sg-data.ts
│   ├── get-treningsplan.ts
│   └── index.ts        # ALL_TOOLS + EXEC_BY_NAME
└── agents/
    └── caddie.ts       # Caddie system-prompt + chatCaddie()
```

## Krav

- `ANTHROPIC_API_KEY` i `.env.local` (produksjon: i Vercel env)
- `@anthropic-ai/sdk` (allerede installert i `package.json`)
- Prisma-klient (eksisterende `src/lib/prisma.ts`)

Hvis `ANTHROPIC_API_KEY` mangler logger `client.ts` en advarsel og setter
`anthropic` til `null`. Kallende kode må sjekke `isAiEnabled()` først.

## Legge til ny Skill

1. Opprett ny fil under `src/lib/ai/skills/`, f.eks. `mental-trening.ts`:

```ts
export const mentalSkill = {
  name: "mental-trening",
  description: "Mental-trenings-konsepter brukt i AK Golf",
  knowledge: `... (kunnskap her) ...`,
} as const;
```

2. Legg til export i `src/lib/ai/skills/index.ts` og inkluder i `ALL_SKILLS`.

3. Skillen er nå tilgjengelig for alle agents som bruker `ALL_SKILLS` —
   ingen kall-side-endringer nødvendige.

## Legge til ny Tool

1. Opprett ny fil under `src/lib/ai/tools/`, f.eks. `get-fakturaer.ts`:

```ts
import "server-only";
import { prisma } from "@/lib/prisma";
import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const getFakturaerTool: Tool = {
  name: "get_fakturaer",
  description: "Henter spillerens fakturaer",
  input_schema: {
    type: "object",
    properties: {
      spillerId: { type: "string" },
    },
    required: ["spillerId"],
  },
};

export type GetFakturaerInput = { spillerId: string };
export type GetFakturaerOutput =
  | { ok: true; fakturaer: Array<{ id: string; belop: number }> }
  | { ok: false; error: string };

export async function execGetFakturaer(
  args: GetFakturaerInput,
): Promise<GetFakturaerOutput> {
  // ... Prisma-spørring ...
  return { ok: true, fakturaer: [] };
}
```

2. Legg til i `src/lib/ai/tools/index.ts`:
   - Eksporter `getFakturaerTool` og `execGetFakturaer`
   - Legg toolet i `ALL_TOOLS`
   - Legg eksekutoren i `EXEC_BY_NAME` med riktig type-cast

3. Caddie og andre agents som bruker `ALL_TOOLS` får automatisk tilgang.

## Lage ny agent

En agent er en system-prompt + et utvalg Skills og Tools + en chat-funksjon.
Mønsteret følger `agents/caddie.ts`:

```ts
import { anthropic, AI_MODEL, isAiEnabled } from "../client";
import { ALL_SKILLS } from "../skills";
import { ALL_TOOLS, EXEC_BY_NAME } from "../tools";

const SYSTEM_PROMPT = `Du er <agent-navn>. ...`;

export async function chatMyAgent(opts: { messages: MessageParam[] }) {
  if (!isAiEnabled()) return { ok: false, error: "AI deaktivert" };
  // ... tool-loop ... (se caddie.ts som referanse)
}
```

For agents som ikke trenger alle tools/skills: bygg eget subset.

## Tester

Test-cases ligger under `src/lib/__tests__/ai/`. Vi mocker `anthropic`-klienten
og verifiserer at:

- Tool-routing kaller riktig exec-funksjon
- Skills er korrekt formatert (ingen tomme strenger, alle har name+knowledge)
- Memory-funksjoner persisterer og rydder

Kjør:

```bash
npx tsx --test src/lib/__tests__/ai/*.test.ts
```

## Verifikasjon før commit

```bash
npx tsc --noEmit
npm run build
```

## TODO (kommende faser)

- Persistere `AiMemory` via Prisma (Spor 3 eier modellen)
- Pgvector-embeddings for semantisk søk i Skills (Spor 3 eier pgvector)
- Streaming-respons fra Caddie (krever UI-side i Spor 5)
- Audit-log av alle tool-calls (eksisterende `src/lib/audit.ts` kan brukes)
