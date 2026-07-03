# Arkitektur — AK Golf HQ

Flyttet fra CLAUDE.md 2026-06-14. Innhold uendret.

## Produkter (fire under samme tak)

| Produkt | Rute | Mappe |
|---|---|---|
| **Marketing** (akgolf.no) | `/` + `/akgolf-*` | `src/app/(marketing)/` og `src/app/akgolf-*` |
| **Booking** | `/booking` (marketing) + `/portal/booking` | `src/app/(marketing)/booking/`, `src/app/portal/booking/` (også `admin/bookinger`, `forelder/bookinger`) |
| **PlayerHQ** (spillerportal) | `/portal/*` | `src/app/portal/` |
| **AgencyOS** (admin — het tidligere CoachHQ) | `/admin/*` | `src/app/admin/` |

Alle fire deler: designsystem-tokens i `src/app/globals.css`, komponentbibliotek i
`src/components/athletic/`, auth via Supabase, Prisma-schema mot felles Postgres.
Splitting til separate repos er ikke aktuell før etter lansering — du jobber i dette ene repoet med alt.

## Mappestruktur (gjeldende, ikke fremtidig)

```
akgolf-hq/
├── prisma/                   # Schema + migrasjoner
├── src/
│   ├── app/
│   │   ├── (marketing)/      # Marketing-sider
│   │   ├── akgolf-*/         # Marketing-sider (eldre URL-struktur)
│   │   ├── admin/            # AgencyOS (intern admin)
│   │   ├── portal/           # PlayerHQ (spillerportal)
│   │   ├── booking/          # Booking-flyt
│   │   ├── auth/             # Auth-flyter
│   │   ├── api/              # Route handlers
│   │   ├── globals.css       # DESIGNSYSTEM-TOKENS (eneste kilde)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/               # UI-primitiver: Button, Dialog, Sheet, Popover,
│   │   │                     # DropdownMenu, Toast, Input, Tabs, etc.
│   │   │                     # ERROR-håndhevet av ESLint — drift blokker CI.
│   │   ├── athletic/         # Branded bibliotek — eneste sannhet for AK-DNA:
│   │   │                     # Hero, FeaturedCard, KpiStrip, PyramidProgress,
│   │   │                     # PhotoHero, LiveBar, InsightCard, GoalsHubPattern,
│   │   │                     # SectionHeader, ItineraryRow, calendars/, data/.
│   │   │                     # Tidligere v2/ + ds/tab-bar konsolidert hit (M5).
│   │   ├── shared/           # Funksjonelle utility-komponenter (cookie-banner,
│   │   │                     # cmd-palette, analytics-loader, mobile-bottom-nav).
│   │   │                     # NB: Modal/PageHeader/OverviewShell er thin-wrappers
│   │   │                     # for bakoverkompatibilitet — ny kode bruker
│   │   │                     # ui/Dialog og athletic/-mønstre direkte.
│   │   ├── admin*/           # AgencyOS-spesifikke
│   │   ├── portal*/          # PlayerHQ-spesifikke
│   │   └── booking/          # Booking-spesifikke
│   ├── lib/
│   │   ├── design-tokens.ts  # TS-speil av globals.css
│   │   ├── prisma.ts
│   │   ├── utils.ts          # cn()
│   │   └── supabase/
│   └── proxy.ts              # Next.js 16 proxy
├── docs/                      # Design under aktiv utvikling (2026-07-03) — ingen låst kilde nå, se CLAUDE.md
├── prisma.config.ts
└── CLAUDE.md
```
