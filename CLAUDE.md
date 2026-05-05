@AGENTS.md

# AK Golf HQ — Claude-instruksjoner

Dette er foundation-laget for AK Golf Group sin plattform. Booking, portal-sider,
CoachHQ, landingssider og andre features bygges i **andre** prosjekter — ikke her.

---

## Forholdet til AK Golf HQ-plattformen

"AK Golf HQ" er paraply-konseptet for hele AK Golf Group sin tekniske plattform.
Den inkluderer flere produkter:

- **Website** (`akgolf.no`) — markedsføring, info, kontakt
- **Booking** (`booking.akgolf.no`) — timebooking, betaling
- **PlayerHQ** — spillerportal, treningsplaner, fakturaer
- **CoachHQ** — intern admin, dagens økter, spillerliste

Dette repoet (`akgolf-hq`) er **Foundation-laget** under paraplyen — ikke hele
plattformen. Det inneholder kun delt Prisma-schema, Supabase-auth,
designsystem-tokens og felles libs som de andre produktene importerer eller
kopierer fra.

Hvert produkt får sitt eget repo: `akgolf-website`, `akgolf-booking`,
`akgolf-playerhq`, `akgolf-coachhq`. Foundation peker mot samme Supabase-database
som alle de andre, men inneholder ingen UI-kode for sluttbrukere.

---

## Stack (eksakte versjoner — ikke oppgrader uten beslutning)

- Next.js 16 (App Router, TypeScript strict, Turbopack)
- React 19
- Prisma 7 + Supabase (Postgres)
- Tailwind CSS v4 (CSS-first via `@theme` i `globals.css` — ingen `tailwind.config.ts`)
- Geist + Geist Mono + Instrument Serif (alle via `next/font/google`)
- Lucide React — eneste icon-bibliotek
- npm (ikke pnpm, ikke yarn, ikke bun)

---

## Designsystem v2 — endres aldri uten eksplisitt beslutning

### Arkitektur

Tokens lagres som HSL-trippel uten `hsl()`-wrapper i `src/app/globals.css`
(shadcn/ui-konvensjon). Tailwind v4 mapper dem til utilities via `@theme inline`.

Lyst tema er default. Mørkt aktiveres via `.dark`-klasse på `<html>`-element.

### Semantiske tokens (18 totalt)

| Token | Lyst | Mørkt | Bruk |
|---|---|---|---|
| `background` | #FAFAF7 | #0F2A22 | Side-bakgrunn |
| `foreground` | #0A1F17 | #F5F4EE | Primær tekst |
| `card` | #FFFFFF | #163027 | Card-bakgrunn |
| `card-foreground` | #0A1F17 | #F5F4EE | Tekst på card |
| `popover` | #FFFFFF | #163027 | Popover/dropdown |
| `popover-foreground` | #0A1F17 | #F5F4EE | Tekst i popover |
| `primary` | #005840 | #D1F843 | CTA, primær handling |
| `primary-foreground` | #D1F843 | #0A1F17 | Tekst på primary |
| `secondary` | #F1EEE5 | #1B3B30 | Secondary buttons, chips |
| `secondary-foreground` | #0A1F17 | #F5F4EE | Tekst på secondary |
| `muted` | #F1EEE5 | #1B3B30 | Disabled, dempet bakgrunn |
| `muted-foreground` | #5E5C57 | #9D9C95 | Sekundær tekst |
| `accent` | #D1F843 | #D1F843 | Highlight, badges |
| `accent-foreground` | #005840 | #0A1F17 | Tekst på accent |
| `destructive` | #A32D2D | #D45353 | Slett, feil |
| `destructive-foreground` | #FAFAF7 | #F5F4EE | Tekst på destructive |
| `border` | #E5E3DD | #2B4F42 | Borders |
| `input` | #E0DDD6 | #2B4F42 | Form-input borders |
| `ring` | #005840 | #D1F843 | Focus ring |

**Bruk:** `bg-primary`, `text-foreground`, `border-border`, `ring-ring` etc.
**ALDRI** hardkode hex-verdier. Hvis du trenger ny farge, legg den inn som
token i `globals.css` først.

### Border radius

`--radius` er satt til `1rem` (16px). Tailwind-utilities:
- `rounded-lg` = 16px (cards, panels)
- `rounded-md` = 12px (inputs, knapper)
- `rounded-sm` = 8px (badges, tags)
- `rounded-xl` = 12px hardkodet (større cards)
- `rounded-2xl` = 16px hardkodet (hero-cards)
- `rounded-full` = pill (CTAs, badges, status)

### 8pt-grid (håndheves i kode-review, ikke i CSS)

All spacing skal være multipler av 8px. I Tailwind v4:
- Bruk: `p-2` (8), `p-4` (16), `p-6` (24), `p-8` (32), `p-10` (40), `p-12` (48), `p-16` (64)
- Unngå: `p-1` (4), `p-3` (12), `p-5` (20), `p-7` (28), `p-9` (36)
Samme regel for `m-`, `gap-`, `space-y-`, `w-`, `h-`.

### Typografi

Tre fonter, alle gratis via Google Fonts, lastet via `next/font/google` i `layout.tsx`:

| Font | Bruk | Tailwind | CSS-variabel |
|---|---|---|---|
| Geist | UI, brødtekst (default) | `font-sans` (default) | `--font-geist` |
| Geist Mono | Tabulære tall, kode, data | `font-mono` | `--font-geist-mono` |
| Instrument Serif | Display, editorial italic | `font-display` (custom) | `--font-instrument-serif` |

**Regler:**
- Geist er variable, brukes som default (`font-sans`)
- Instrument Serif lastes med `weight: "400"` og `style: ["normal", "italic"]`
- Italic Instrument Serif gir editorial luxury-feel — bruk i hero-overskrifter
- Geist Mono har `font-variant-numeric: tabular-nums` (eller bruk `.tabular`-klassen)
- Ingen andre fonter — ikke import fra Google Fonts CDN, ikke bruk `<link>`-tags

### Ikoner

Kun `lucide-react`. Default 24px, 1.5px stroke, round caps. Aldri farget — alltid
`currentColor`. Ingen Heroicons, Phosphor, React Icons.

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
│   │   ├── layout.tsx          # Root layout, Geist + Instrument Serif
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

## Git-arbeidsflyt — Claude Code håndterer dette

Claude Code KAN og SKAL utføre git-operasjoner for Anders. Han er ikke utvikler
og skal ikke skrive git-kommandoer selv. Følg disse reglene strengt:

### 1. Auto-commit etter fullført oppgave

Etter hver fullført oppgave: stage relevante filer, commit med beskrivende
melding, og push til main. IKKE spør om bekreftelse på trivielle commits.

```bash
git add .
git commit -m "feat: <hva ble gjort>"
git push
```

### 2. Stop and ask før destruktive operasjoner

Disse kommandoene krever eksplisitt "ja" fra Anders i chatten først.
Forklar hva som vil skje før du venter på svar:

- `git push --force` (eller `--force-with-lease`)
- `git reset --hard`
- `git rebase` på shared branches (typisk main)
- Sletting av remote branches
- Endringer som omskriver main-historikken
- `git checkout` som vil overskrive ucommittede endringer

### 3. Commit-meldinger — Conventional Commits på engelsk

Format: `<type>: <kort beskrivelse>`

Vanlige types:
- `feat:` — ny funksjonalitet
- `fix:` — bugfix
- `docs:` — dokumentasjon
- `refactor:` — kode-omstrukturering uten funksjonsendring
- `chore:` — vedlikehold (deps, config, etc.)
- `test:` — tester
- `style:` — formatting, whitespace

Eksempler:
- `feat: add booking calendar component`
- `fix: handle null user in auth check`
- `docs: clarify font usage in CLAUDE.md`

### 4. Status-update etter push

Etter push, oppsummer på norsk hva som ble gjort, slik at Anders har oversikt
uten å måtte sjekke selv. Eksempel:

> ✓ Stagete 3 filer
> ✓ Commitet: "feat: add contact page with stub form"
> ✓ Pushet til main
>
> Kontaktsiden er live på localhost:3000/kontakt. Neste steg: deploye til Vercel.

### 5. Branches og pull requests

For Foundation-laget: jobb direkte på main. Det er kun Anders som rører dette
repoet, og endringer er sjeldne og bevisste.

For app-prosjekter (akgolf-website, akgolf-booking, etc.): bruk feature branches
når det er relevant for større endringer:

```bash
git checkout -b feat/<kort-navn>
# ... arbeid ...
git push -u origin feat/<kort-navn>
gh pr create --fill                # Bruker commit-meldinger som PR-tekst
```

Spør Anders før du oppretter PR — han skal vite at det skjer.

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
