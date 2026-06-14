# Kjente gotchas — AK Golf HQ

Flyttet fra CLAUDE.md 2026-06-14. Les denne FØR du skriver kode. Når noe brekker, legg gotcha-en til her.
(Eldre PRISMA-7- og Supabase-detaljer finnes også i git-historikken.)

### JSON-blobs MÅ valideres med zod
Alle `as unknown as <Type>` på JSON-felter fra Prisma er forbudt for forretningskritiske data. Bruk zod `safeParse` ved read.

### Prisma 7 — connection-strings i `prisma.config.ts`, ikke `schema.prisma`
- Schema har bare `provider = "postgresql"`. Url ligger i `prisma.config.ts` → `datasource.url = env("DIRECT_URL")`.
- Runtime krever `@prisma/adapter-pg` med `DATABASE_URL` (pgbouncer-pooler).
- `prisma.config.ts` må eksplisitt laste `.env.local` med `dotenv.config({ path: ".env.local" })`.

### Next.js 16 — `middleware.ts` heter nå `proxy.ts`
Bare nodejs runtime, ikke edge.

### Supabase Connect — bruk Shared Pooler (IPv4) for konsistens
Transaction pooler + IPv4-toggle på. Da får du `aws-0-REGION.pooler.supabase.com` på begge porter.

<!-- Mal for nye gotchas:
### <Kort tittel>
- **Symptom:**
- **Årsak:**
- **Løsning:**
- **Lært:** <dato>
-->
