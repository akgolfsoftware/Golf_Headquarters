# AK Golf HQ

Hele plattformen for AK Golf Group — ett monorepo, ett Next.js-prosjekt, fire produkter under samme tak.

| Produkt | Rute | Beskrivelse |
|---|---|---|
| **Marketing** (akgolf.no) | `/`, `/(marketing)` | Offentlige sider |
| **Booking** | `/booking` | Booking av coaching/fasiliteter |
| **PlayerHQ** | `/portal` | Spillerportal |
| **CoachHQ** | `/admin` | Coach/admin-grensesnitt |

## Stack

- Next.js 16 (App Router, TypeScript strict, Turbopack)
- React 19
- Prisma 7 + Supabase (Postgres)
- Tailwind CSS v4 (CSS-first via `@theme` i `src/app/globals.css`)
- Lucide React (eneste icon-bibliotek), Inter / Inter Tight / JetBrains Mono
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

- **`CLAUDE.md`** — arbeidsregler, designsystem, gotchas (les denne først)
- **`PLATFORM.md`** — autoritativ arkitekturbeskrivelse
- **`LAUNCH-CHECKLIST.md`** + `docs/go-live-sjekkliste.md` — go-live
- **`docs/mvp-audit-2026-06-02.md`** — siste fullstendige audit + backlog
- **`docs/todo.md`** — levende backlog
- **`SECURITY.md`** — sikkerhetsprinsipper og RLS

## Test

```bash
npm test          # enhetstester (lib)
npm run e2e       # Playwright e2e
```
