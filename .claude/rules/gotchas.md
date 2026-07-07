# Kjente gotchas — AK Golf HQ

Flyttet fra CLAUDE.md 2026-06-14. Les denne FØR du skriver kode. Når noe brekker, legg gotcha-en til her.
(Eldre PRISMA-7- og Supabase-detaljer finnes også i git-historikken.)
Designkanon: `.claude/rules/design-system-regel.md` (v13/golfdata).

### AI Caddie — modell-tilgang + AI SDK-feller (oppdaget 2026-06-23)
- **Vercel AI Gateway free-tier gir IKKE modell-tilgang** («Free tier users do not have access to this model»). Caddie-chat bruker derfor `@ai-sdk/anthropic` direkte (`ANTHROPIC_API_KEY`), ikke `@ai-sdk/gateway`.
- **`ANTHROPIC_BASE_URL` i miljøet mangler `/v1`** (`https://api.anthropic.com`). Raw `@anthropic-ai/sdk` legger til `/v1/` selv, men `@ai-sdk/anthropic` bruker verdien som-den-er → `/messages` → 404 «Not Found». Løsning: normaliser baseURL i ruten (`createAnthropic({ baseURL: …endsWith("/v1") ? … : …+"/v1" })`). Ikke endre env-verdien — andre agenter bruker den.
- **`useChat`/`DefaultChatTransport` krever `toUIMessageStreamResponse()`**, ikke `toTextStreamResponse()` (sistnevnte gir tom UI selv om svaret kommer).
- **Tools trenger `stopWhen: stepCountIs(n)`** i `streamText`, ellers stopper modellen etter første tool-call uten å svare.
- **AI SDK v6 tool-parts:** navnet ligger i `part.type` (`"tool-<navn>"`), ikke `part.toolName`; state er `output-available`/`output-error`/`input-*`, ikke «result».
- **Gyldig Sonnet-id mot api.anthropic.com:** `claude-sonnet-4-6` (bekreftet via `anthropic.models.list()`).

### JSON-blobs MÅ valideres med zod
Alle `as unknown as <Type>` på JSON-felter fra Prisma er forbudt for forretningskritiske data. Bruk zod `safeParse` ved read.

### Schema-endringer: `migrate dev` og `db push` er BEGGE blokkert — bruk kirurgisk `db execute`
Oppdaget 2026-06-22 ved tillegg av 3 tabeller. To feller:
- **`prisma migrate dev` feiler** på shadow-DB-replay: en gammel migrasjon (`20260510..._add_parent_role_and_tier_enum`) feiler når alle 80 migrasjoner replayes fra bunnen («type UserRole does not exist», P3018). Prod-DB er fin (`migrate status` = up to date), men shadow-replayen er ødelagt.
- **`prisma db push` vil DROPPE data**: prod har en `datagolf_sync_state`-tabell som ikke finnes i `schema.prisma` (pre-eksisterende drift), så push krever `--accept-data-loss` og ville slettet den.
- **Trygg vei for ADDITIVE endringer:** legg modellen i `schema.prisma`, og kjør `CREATE TABLE IF NOT EXISTS ...` direkte via tsx + `PrismaPg`-adapter (`prisma.$executeRawUnsafe`) mot `DIRECT_URL`. Da rører du KUN dine egne tabeller. Deretter `npx prisma generate`. Bruk plain `userId String` (ingen `@relation`) i nye modeller så du slipper å redigere `User` og holder endringen isolert.

### Prisma 7 — connection-strings i `prisma.config.ts`, ikke `schema.prisma`
- Schema har bare `provider = "postgresql"`. Url ligger i `prisma.config.ts` → `datasource.url = env("DIRECT_URL")`.
- Runtime krever `@prisma/adapter-pg` med `DATABASE_URL` (pgbouncer-pooler).
- `prisma.config.ts` må eksplisitt laste `.env.local` med `dotenv.config({ path: ".env.local" })`.

### Next.js 16 — `middleware.ts` heter nå `proxy.ts`
Bare nodejs runtime, ikke edge.

### Supabase Connect — bruk Shared Pooler (IPv4) for konsistens
Transaction pooler + IPv4-toggle på. Da får du `aws-0-REGION.pooler.supabase.com` på begge porter.

### .dark-tema — primary=accent er samme farge (skjørt)
I `.dark`-klassen er `primary` og `accent` begge lime. Par som `bg-primary text-accent` rendres
riktig i dag, men er flaks — ny kode skal bruke `-foreground`-parene (`bg-primary text-primary-foreground`).

<!-- Mal for nye gotchas:
### <Kort tittel>
- **Symptom:**
- **Årsak:**
- **Løsning:**
- **Lært:** <dato>
-->
