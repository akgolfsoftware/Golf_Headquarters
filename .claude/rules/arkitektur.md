# Arkitektur — AK Golf HQ

Flyttet fra CLAUDE.md 2026-06-14. Designkanon: `.claude/rules/design-system-regel.md`
— **v2-redesign pågår (9. juli 2026)**: golfdata/v13-referansene under beskriver
OVERGANGS-LAGET, ikke målbildet. Komponentanbefalingene gjelder vedlikehold av
eksisterende skjermer inntil v2-bølgene rekomponerer dem.

## Produkter (fire under samme tak)

| Produkt | Rute | Mappe |
|---|---|---|
| **Marketing** (akgolf.no) | `/` + `/akgolf-*` | `src/app/(marketing)/` og `src/app/akgolf-*` |
| **Booking** | `/booking` (marketing) + `/portal/booking` | `src/app/(marketing)/booking/`, `src/app/portal/booking/` (også `admin/bookinger`, `forelder/bookinger`) |
| **PlayerHQ** (spillerportal) | `/portal/*` | `src/app/portal/` |
| **AgencyOS** (admin — het tidligere CoachHQ) | `/admin/*` | `src/app/admin/` |

Denne tabellen dekker ikke hele `src/app/`. Andre top-level mapper i bruk inkluderer bl.a.
`forelder/`, `onboard/`, `inviter/`, `intern/`, `kommando/`, `meg/`, `team-gfgk/`, `team-wang/`,
`gfgk-junior/`, `offline/`, `(internal)/` — sjekk filsystemet før du oppretter nye ruter for å
unngå konflikt med eksisterende mønstre (se også `docs/platform/AGENT-BRIEF.md`).

Alle fire deler: designsystem-tokens i `src/app/globals.css`, komponentbibliotek i
`src/components/athletic/golfdata/` (v13 — gamle athletic/ er vedlikeholdsmodus),
auth via Supabase, Prisma-schema mot felles Postgres.
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
│   │   ├── athletic/         # Branded bibliotek. Kun to undermapper igjen:
│   │   │                     # golfdata/ (v13, overgangs-laget) og calendars/.
│   │   │                     # Gamle Hero/FeaturedCard/KpiStrip/data/ er fjernet.
│   │   ├── v2/                # Delte v2-redesign-primitiver, bl.a. hjelp.tsx
│   │   │                     # (se «?»-forklaringsregelen i design-system-regel.md)
│   │   ├── shared/           # Funksjonelle utility-komponenter (cookie-banner,
│   │   │                     # cmd-palette, analytics-loader, mobile-bottom-nav).
│   │   │                     # NB: Modal/PageHeader/OverviewShell er thin-wrappers
│   │   │                     # for bakoverkompatibilitet — ny kode bruker
│   │   │                     # ui/Dialog og athletic/golfdata/-mønstre direkte.
│   │   └── admin/, portal/, booking/, forelder/, coachhq/, m.fl.
│   │                         # Produkt-/flate-spesifikke komponenter. Flere har
│   │                         # egen v2/-undermappe (admin/v2, portal/v2,
│   │                         # marketing/v2) for pågående v2-porting, pluss
│   │                         # frittstående planlegge-v2/ og test-modul-v2/.
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
