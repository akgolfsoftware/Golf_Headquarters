@AGENTS.md

# AK Golf HQ — Claude-instruksjoner

Dette er foundation-laget for AK Golf Group sin plattform. Booking, portal-sider,
CoachHQ, landingssider og andre features bygges i **andre** prosjekter — ikke her.

---

## Stack (eksakte versjoner — ikke oppgrader uten beslutning)

- Next.js 16 (App Router, TypeScript strict, Turbopack)
- React 19
- Prisma 7 + Supabase (Postgres)
- Tailwind CSS v4 (CSS-first via `@theme` i `globals.css` — ingen `tailwind.config.ts`)
- Inter (variable, via `next/font/google`) — eneste font
- Lucide React — eneste icon-bibliotek
- npm (ikke pnpm, ikke yarn, ikke bun)

---

## Designsystem — endres aldri uten eksplisitt beslutning

### Farger (i `src/app/globals.css` under `@theme`)

| Token       | Hex       | Tailwind-klasse                     |
| ----------- | --------- | ----------------------------------- |
| `primary`   | `#005840` | `bg-primary` `text-primary` etc.    |
| `accent`    | `#D1F843` | `bg-accent` `text-accent` etc.      |
| `dark-bg`   | `#0A1F18` | `bg-dark-bg` `text-dark-bg` etc.    |

**ALDRI** hardkode hex-verdier i komponenter. Bruk alltid Tailwind-klassene.
Hvis du trenger en ny farge, legg den inn som token i `globals.css` først.

### Border radius

- `rounded-card` = 16px (cards, panels, modaler)
- `rounded-pill` = 20px (knapper, tags, badges)

### 8pt-grid (håndheves i kode-review, ikke i CSS)

All spacing skal være multipler av 8px. I Tailwind v4 betyr det:

- Bruk: `p-2` (8), `p-4` (16), `p-6` (24), `p-8` (32), `p-10` (40), `p-12` (48), `p-16` (64)
- Unngå: `p-1` (4), `p-3` (12), `p-5` (20), `p-7` (28), `p-9` (36)

Samme regel for `m-`, `gap-`, `space-y-`, `w-`, `h-`.

### Font

Inter, variable, lastet via `next/font/google` i `layout.tsx`. Eksponert som
CSS-variabel `--font-inter` og brukt via `--font-sans` token. Ingen andre
fonter — ikke import fra Google Fonts CDN, ikke bruk `<link>`-tags.

### Ikoner

Kun `lucide-react`. Ingen Heroicons, Phosphor, React Icons.

---

## Språk

All UI-tekst på **norsk bokmål** med æ, ø, å. Kommentarer i kode kan være
engelske eller norske — vær konsistent innenfor en fil.

---

## Mappestruktur

```
akgolf-hq/
├── prisma/
│   └── schema.prisma           # 4 modeller. Migrasjoner i prisma/migrations/
├── src/
│   ├── app/                    # App Router — sider, layouts, route handlers
│   │   ├── globals.css         # Designsystem-tokens (@theme)
│   │   ├── layout.tsx          # Root layout, Inter font
│   │   └── page.tsx
│   ├── components/             # Delte komponenter (tom inntil videre)
│   │   └── ui/                 # Primitives (Button, Card, etc.)
│   ├── lib/
│   │   ├── prisma.ts           # Prisma singleton
│   │   ├── utils.ts            # cn()
│   │   └── supabase/
│   │       ├── client.ts       # Browser-klient
│   │       ├── server.ts       # RSC + Route Handlers
│   │       └── proxy.ts        # Sesjons-refresh (kalles fra src/proxy.ts)
│   ├── generated/prisma/       # Prisma Client (generert, ikke committet)
│   └── proxy.ts                # Next.js 16 proxy (tidl. middleware.ts)
├── prisma.config.ts            # Prisma 7 — datasource.url for migrate
├── .env.example                # Mal. .env.local fylles inn lokalt.
└── CLAUDE.md
```

---

## Prisma — viktige detaljer (Prisma 7)

- Connection-strings ligger i `prisma.config.ts`, ikke i `schema.prisma`.
  Schema har bare `datasource db { provider = "postgresql" }`.
- `prisma.config.ts` peker `datasource.url` til `DIRECT_URL` (port 5432) —
  brukes av Prisma CLI for migrasjoner. Pgbouncer (port 6543) støtter ikke DDL.
- Prisma 7 krever **driver adapter** for runtime queries. Vi bruker
  `@prisma/adapter-pg` med `DATABASE_URL` (pooler, `?pgbouncer=true`).
  Se `src/lib/prisma.ts`.
- Klient-generator er `prisma-client` (ESM-first), ikke `prisma-client-js`.
  Output: `src/generated/prisma`.
- Import: `import { PrismaClient } from "@/generated/prisma/client"`.
- Etter schema-endring: `npx prisma generate` + `npx prisma migrate dev --name <navn>`.
- Penger lagres i **øre** som `Int`. Aldri `Float` for valuta.
  Format i UI: `priceOre / 100`.

---

## Supabase — viktige detaljer

- `lib/supabase/client.ts` — kun fra Client Components (`"use client"`).
- `lib/supabase/server.ts` — fra Server Components, Route Handlers, Server Actions.
  `createClient()` er **async** (Next 15+ har async `cookies()`).
- `lib/supabase/proxy.ts` eksporterer `updateSession()` som kalles fra
  `src/proxy.ts` (Next 16 proxy) på hver request — refresher access token.
- Bruk `supabase.auth.getUser()` (validerer mot Supabase Auth), aldri
  `getSession()` i server-kontekst (leser kun cookies).
- `User`-modellen i Prisma har `authId` (UUID) som FK mot `auth.users.id` i Supabase.
  Når en bruker registreres må vi opprette begge — Supabase auth-record + Prisma User.

---

## Arbeidsregler (Boris Cherny-metoden)

1. **Plan Mode først** for alt ikke-trivielt (Shift+Tab to ganger i Claude Code).
2. **Implementer aldri uten godkjent plan.**
3. **Verifikasjon definert før implementering** — hver oppgave må kunne verifiseres
   med konkrete kommandoer (se nedenfor).
4. **Pek på eksisterende mønstre**, ikke beskriv fra scratch. Hvis det finnes en
   `Card`-komponent, bruk den. Hvis det finnes en lib-helper, importer den.
5. **Stopp og spør ved usikkerhet.** Aldri gjett.
6. **Feil → CLAUDE.md.** Når noe brekker, legg gotcha-en inn i seksjonen nederst.

---

## Verifikasjon (kjør før hver commit)

```bash
npx prisma validate      # Schema er gyldig
npx prisma generate      # Klient er oppdatert
npx tsc --noEmit         # 0 type-feil
npm run build            # Produksjons-build fullfører
```

`npm run dev` skal starte uten warnings.

---

## Scope-grense for dette repoet

**Bygges her:**
- Repo-struktur, schema, auth, designsystem-tokens
- Felles libs (`lib/prisma.ts`, `lib/supabase/*`, `lib/utils.ts`)
- Root layout, middleware

**Bygges IKKE her** (egne prosjekter / faser):
- Booking-flyt, kalender, betaling
- Spillerportal, foreldreportal
- CoachHQ (intern admin)
- Landingssider, marketing
- Mer enn de 4 startmodellene i Prisma — resten migreres i egen fase

Hvis Anders ber om noe utenfor denne listen: påminn ham, foreslå riktig prosjekt.

---

## Kjente gotchas

### Prisma 7 flyttet `url`/`directUrl` ut av schema
- **Symptom:** `prisma validate` feiler med `The datasource property url is no longer supported in schema files`.
- **Årsak:** Prisma 7 (released nov 2025) krever `prisma.config.ts` for connection-strings.
- **Løsning:** `prisma.config.ts` med `datasource: { url: env("DIRECT_URL") }`. Schema-fila har bare `provider = "postgresql"`.
- **Lært:** 2026-05

### Prisma 7 krever driver adapter
- **Symptom:** `new PrismaClient()` uten args feiler i runtime.
- **Årsak:** Prisma 7 har separert client og driver. Postgres må ha `@prisma/adapter-pg`.
- **Løsning:** `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })`.
- **Lært:** 2026-05

### Next.js 16: `middleware.ts` → `proxy.ts`
- **Symptom:** Build-warning `The "middleware" file convention is deprecated. Please use "proxy" instead`.
- **Årsak:** Next 16 har renamet middleware til proxy (avklarer at det er nettverk-boundary, ikke Express-middleware).
- **Løsning:** Rename fil + bytt funksjonsnavn fra `middleware` til `proxy`. Edge runtime støttes IKKE i proxy — kun nodejs.
- **Lært:** 2026-05

### Prisma 7 leser ikke .env.local automatisk
- **Symptom:** `npx prisma migrate` feiler med `PrismaConfigEnvError: Cannot resolve environment variable: DIRECT_URL` selv om verdiene finnes i `.env.local`.
- **Årsak:** Prisma sin default `import "dotenv/config"` leser kun `.env`, ikke `.env.local`. Next.js leser begge, men Prisma CLI gjør ikke det.
- **Løsning:** I `prisma.config.ts`, bytt `import "dotenv/config"` med `import { config as loadEnv } from "dotenv"` og kall `loadEnv({ path: ".env.local" })` før `defineConfig`.
- **Lært:** 2026-05

### Supabase Connect-modal: bruk Shared Pooler (IPv4) for konsistens
- **Symptom:** Inkonsistente connection-strings — Direct connection bruker `db.X.supabase.co`, Session pooler bruker `aws-0-REGION.pooler.supabase.com`. Manuell port-endring fra 5432 til 6543 på direct-host gir ugyldig kombinasjon.
- **Årsak:** Supabase har to typer poolers (Dedicated + Shared). Connect-modalen viser dedicated by default; toggle "Use IPv4 connection (Shared Pooler)" må slås på for shared.
- **Løsning:** I Connect-modalen → velg Transaction pooler → slå på IPv4-toggle. Da får du `aws-0-REGION.pooler.supabase.com` med brukernavn `postgres.PROJECT_REF` på begge porter (6543 transaction, 5432 session).
- **Lært:** 2026-05

<!-- Mal for nye gotchas:
### <Kort tittel>
- **Symptom:** ...
- **Årsak:** ...
- **Løsning:** ...
- **Lært:** <dato>
-->
