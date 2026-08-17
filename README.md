# AK Golf HQ

Hele plattformen for AK Golf Group — ett monorepo, ett Next.js-prosjekt, fire produkter under samme tak.

| Produkt | Rute | Beskrivelse |
|---|---|---|
| **Marketing** (akgolf.no) | `/`, `/(marketing)` | Offentlige sider |
| **Booking** | `/booking` | Booking av coaching/fasiliteter |
| **PlayerHQ** | `/portal` | Spillerportal |
| **AgencyOS** | `/admin` | Coach/admin-grensesnitt (het tidligere «CoachHQ») |

## Stack

- Next.js 16 (App Router, TypeScript strict, Turbopack)
- React 19
- Prisma 7 + Supabase (Postgres)
- Tailwind CSS v4 (CSS-first via `@theme` i `src/app/globals.css`)
- Lucide React (eneste icon-bibliotek). Designfasit er **Claude Paper** (Poppins / Lora / IBM Plex Mono) — koden bruker fortsatt Inter / Familjen Grotesk / JetBrains Mono til fontbyttet i porten er gjort. Inter Tight er fjernet. Se `.claude/rules/beslutninger.md` §Tema/design
- npm

## Kom i gang

```bash
npm install                # postinstall kjører prisma generate
cp .env.example .env.local # fyll inn verdier (se under)
npm run dev                # http://localhost:3000
```

## Miljøvariabler

Valideres ved oppstart i `src/lib/env.ts`. Kritiske (appen starter ikke uten): Supabase-URL/nøkler, `DATABASE_URL`, `DIRECT_URL`. Anbefalte (advarsel i prod): Stripe, Resend, `CRON_SECRET`, `ANTHROPIC_API_KEY`, krypteringsnøkler. Se `.env.example` for full liste.

## Verifikasjon før commit

```bash
npx prisma validate && npx prisma generate
npx tsc --noEmit
npm run build
```

## Dokumentasjon

**START HER (kanon):** [`docs/platform/AGENT-BRIEF.md`](docs/platform/AGENT-BRIEF.md) — full plattformkontekst på 5 min. Les FØR du rører kode.

- **`docs/platform/BUSINESS-RULES.md`** — låste produktbeslutninger (eneste fasit)
- **`docs/platform/PLATFORM-PRD.md`** + **`docs/platform/DATA-MODEL.md`** — produkt- og dataspec
- **`docs/port/fasit-liste-paper.md`** + **`docs/port/PORTPLAN.md`** — designdekning og porteringsplan (les før skjerm-arbeid; ferdig-definisjonen er skjermbilde-gaten i `CLAUDE.md` §Skjermarbeid)
- **`docs/STATUS-NÅ.md`** — hvor vi er akkurat nå (oppdatert snapshot)
- **`docs/AAPNE-SPORSMAAL.md`** — uavklarte beslutninger (ÅPEN / LØST / PARKERT)
- **`CLAUDE.md`** — arbeidsregler, designsystem, gotchas
- **`SECURITY.md`** — sikkerhetsprinsipper og RLS
- **`docs/MASTERPLAN-GJENSTAAENDE.md`** — samlet gjenstående-plan (lansering: `docs/port/masterplan-lansering-2026-08-12.md` + `docs/platform/stripe-cutover-sjekkliste.md`)
- Historikk og superseterte planer: slettet 05.08 og 17.08.2026 — ligger i git-historikken

## Test

```bash
npm test          # enhetstester (lib)
npm run e2e       # Playwright e2e
```
