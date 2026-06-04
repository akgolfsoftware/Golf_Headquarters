@AGENTS.md

# AK Golf HQ — Claude-instruksjoner

Dette er **hele plattformen** for AK Golf Group. Ett monorepo, ett Next.js-prosjekt, fire produkter under samme tak.

---

## FØR DU RØRER EN SKJERM — `docs/MASTER-SKJERMPLAN.md` (LÅST regel)

Master-skjermplanen er den autoritative lista over HVER skjerm i appen + status på 6 haker per skjerm: **Design · Mobil/Desktop/iPad · Adresse · Flyt · Data · Funker**.

- **Før** du bygger, endrer eller kobler en skjerm: åpne planen, finn raden, jobb mot den, oppdater hakene i SAMME commit.
- En skjerm er **ikke ferdig** før alle 6 hakene er grønne.
- Alt Claude Design har tegnet skal ende opp koblet et sted — sjekk «drop-off»-lista (tegnet, ubrukt) så ingenting glemmes.
- Når du fullfører eller endrer skjermer: oppdater dashboard-tallene + endringsloggen nederst i planen.

---

## Hva som ligger her

| Produkt | Rute | Mappe |
|---|---|---|
| **Marketing** (akgolf.no) | `/` + `/akgolf-*` | `src/app/(marketing)/` og `src/app/akgolf-*` |
| **Booking** | `/booking/*` | `src/app/booking/` |
| **PlayerHQ** (spillerportal) | `/portal/*` | `src/app/portal/` |
| **AgencyOS** (admin — het tidligere CoachHQ) | `/admin/*` | `src/app/admin/` |

Alle fire deler:
- Designsystem-tokens i `src/app/globals.css`
- Komponentbibliotek i `src/components/athletic/`
- Auth via Supabase
- Prisma-schema mot felles Postgres

Splittingen til separate repos er ikke aktuell før etter lansering. **Du jobber i dette ene repoet med alt.**

---

## Låste beslutninger (juni 2026 — gjelder til Anders endrer dem)

Disse er bestemt og overstyrer eldre dokumenter/design. Bygg etter disse, ikke etter det du finner i gammelt materiale.

- **App-navn:** Coach-appen heter **AgencyOS** (`/admin`). «CoachHQ» er gammelt navn — ikke bruk det i ny UI-tekst.
- **Tema per produkt:** PlayerHQ alltid **lyst**, AgencyOS alltid **mørkt** (`.dark`). **Ingen tema-toggle** — det er fast, ikke et valg.
- **Navne-kanon (demo):** spiller = **Markus Berg**, coach = **Anders Kristiansen**. Alltid fulle navn. (Gamle: Magnus / Markus R.P. / Anders Berg / Andreas Kragerud — skal bort.)
- **Planlegge → Workbench:** All planlegging går gjennom Workbench. Planlegge er **ett trykkpunkt** dit, ikke en meny av 6 kort. Samme mønster i coachens spiller-Workbench.
- **Analyse samlet:** Analysere + TrackMan + Runder + SG er én flate med faner — ikke separate moduler. Mål bor i Oversikt og redigeres i Workbench.
- **Abonnement (ingen tier-nivåer):** PlayerHQ-tilgang er enten gratis eller 300 kr/mnd. **Gratis** hvis: 1 mnd prøveperiode, ELLER har coaching-pakke (Performance / Performance Pro), ELLER er i en gruppe gjennom AK Golf. **300 kr/mnd** for alle andre. «Performance / Performance Pro» er **coaching-pakker** (antall økter), IKKE app-nivåer. **ELITE finnes ikke** (dødt enum i Prisma — vis det aldri i UI).
- **FYS-resultatformel avventer:** Bygg testskjermer med plassholder-tall. Ikke hardkod referanseverdier før Anders gir grønt lys.
- **Ferskt design:** `public/design-handover/AK Golf HQ Design System/` (4. juni) er gjeldende. `docs/design-handoff-komplett/` (mai) er arkiv.

---

## Stack (eksakte versjoner — ikke oppgrader uten beslutning)

- Next.js 16 (App Router, TypeScript strict, Turbopack)
- React 19
- Prisma 7 + Supabase (Postgres)
- Tailwind CSS v4 (CSS-first via `@theme` i `globals.css` — INGEN `tailwind.config.ts`)
- Inter + Inter Tight + JetBrains Mono via `next/font/google`
- Lucide React — eneste icon-bibliotek
- npm

---

## Designsystem — ÉN kilde til sannhet

**Tokens:** `src/app/globals.css` — HSL-trippel uten `hsl()`-wrapper, shadcn-konvensjon.
**TS-speil for charts:** `src/lib/design-tokens.ts` — kun les fra denne, ikke definer farger her.
**Komponenter:** `src/components/athletic/` — gjenbruk alltid.

**FORBUDT:**
- Å lage nye `tokens.css`-filer noe sted
- Å hardkode hex-verdier i komponenter
- Å importere CSS-tokens fra `wireframe/`-mappen (denne mappen er arkiv)
- Å lage `tokens.ts`-fil i en komponent-mappe

Hvis du trenger ny farge, legg den inn som token i `globals.css` først. Spør Anders før du gjør det.

### Tokens (lyst tema — mørkt finnes for `.dark`-klasse)

| Token | HEX | Bruk |
|---|---|---|
| `background` | #FAFAF7 | Side-bakgrunn |
| `foreground` | #0A1F17 | Primær tekst |
| `card` | #FFFFFF | Card-bakgrunn |
| `card-foreground` | #0A1F17 | Tekst på card |
| `primary` | #005840 | CTA, primær handling |
| `primary-foreground` | #D1F843 | Tekst på primary |
| `accent` | #D1F843 | Highlights, badges |
| `accent-foreground` | #005840 | Tekst på accent |
| `secondary` | #F1EEE5 | Sand, chips |
| `muted-foreground` | #5E5C57 | Sekundær tekst |
| `destructive` | #A32D2D | Slett, feil |
| `success` | #1A7D56 | OK |
| `warning` | #B8852A | Advarsel |
| `info` | #2563EB | Info |
| `border` | #E5E3DD | Borders |

**Bruk:** `bg-primary`, `text-foreground`, `border-border`, `ring-ring`.

### Komponenter — bygg ALDRI på nytt det som finnes

`src/components/athletic/`:
- `hero.tsx` — sidehero
- `card.tsx`, `featured-card.tsx` — cards
- `kpi.tsx` — KPI-blokker
- `eyebrow.tsx` — eyebrows
- `pyramid-progress.tsx` — pyramide-progress
- `badge.tsx` (med variants `ok | warn | urgent | lime | primary | neutral`)
- `button.tsx`
- `action-list.tsx`, `queue-item.tsx`
- `avatar.tsx`, `pulse-dot.tsx`, `greeting.tsx`, `day-cal.tsx`
- `calendars/` — month-grid, session-scheduler, streak-calendar, day-planner, heatmap-calendar, year-plan-gantt

`src/components/ui/` — shadcn-primitiver. Bruk disse for Button, Input, Dialog osv.

### Typografi

| Font | Tailwind | Bruk |
|---|---|---|
| Inter | `font-sans` (default) | UI, brødtekst |
| Inter Tight | `font-display` | Display, hero |
| JetBrains Mono | `font-mono` | KPI-tall, tabulære tall, eyebrows |

Editorial italic via Inter Tight italic. INGEN Instrument Serif eller andre fonter.

### Spacing

8pt-grid som standard. Kun `p-2/4/6/8/10/12/16`. Aldri `p-3/p-5/p-7`. Samme for `m-`, `gap-`, `space-y-`.

**Unntak — data-tette flater (Bloomberg-tetthet):** Dashboards, tabeller, timelines, innboks-rader og lignende compact UI kan bruke 12/14px (`p-3`, `p-3.5`, `gap-3`, `py-2.5`) der design-handover-HTML-en gjør det. Avgjort 2026-06-01 ved kalibrering av `/admin/agencyos`. Port fra design-HTML er fasit for slik spacing.

### Ikoner

Kun `lucide-react`. 24px, 1.5px stroke, `currentColor`. INGEN emoji i UI.

---

## Wireframe-mappen er arkiv — IKKE les fra den

`wireframe/` inneholder historiske design-eksperimenter fra mai 2026. Ikke import herfra, ikke kopier kode herfra, ikke bruk det som referanse. Hvis du trenger inspirasjon, spør Anders.

---

## Språk

All UI-tekst på norsk bokmål med æ, ø, å. Kommentarer i kode kan være engelsk eller norsk — vær konsistent innenfor en fil.

---

## Mappestruktur (gjeldende, ikke fremtidig)

```
akgolf-hq/
├── prisma/                   # Schema + migrasjoner
├── src/
│   ├── app/
│   │   ├── (marketing)/      # Marketing-sider
│   │   ├── akgolf-*/         # Marketing-sider (eldre URL-struktur)
│   │   ├── admin/            # CoachHQ (intern admin)
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
│   │   ├── admin*/           # CoachHQ-spesifikke
│   │   ├── portal*/          # PlayerHQ-spesifikke
│   │   └── booking/          # Booking-spesifikke
│   ├── lib/
│   │   ├── design-tokens.ts  # TS-speil av globals.css
│   │   ├── prisma.ts
│   │   ├── utils.ts          # cn()
│   │   └── supabase/
│   └── proxy.ts              # Next.js 16 proxy
├── docs/
│   └── design-handoff-komplett/   # ARKIV (mai 2026) — IKKE fasit. Fersk design: public/design-handover/
├── prisma.config.ts
└── CLAUDE.md
```

---

## Arbeidsregler

1. **Plan Mode først** for alt ikke-trivielt (Shift+Tab to ganger i Claude Code).
2. **Implementer aldri uten godkjent plan.**
3. **Pek på eksisterende mønstre.** Hvis det finnes en `AthleticCard`, bruk den. Hvis det finnes en lib-helper, importer den.
4. **Stopp og spør ved usikkerhet.** Aldri gjett.
5. **Aldri lag nye token-filer eller wireframe-mapper.**
6. **Feil → CLAUDE.md.** Når noe brekker, legg gotcha-en inn nederst.

---

## Git-arbeidsflyt — Claude Code håndterer dette

Anders er ikke utvikler og skal ikke skrive git-kommandoer. Du gjør det for ham.

Etter hver fullført oppgave: stage, commit med beskrivende melding (Conventional Commits på engelsk), push til main. Ikke spør om bekreftelse på trivielle commits.

Stop og spør før destruktive operasjoner: `--force`, `reset --hard`, `rebase main`, sletting av remote branches.

Etter push: oppsummer på norsk hva som ble gjort.

---

## Verifikasjon (kjør før hver commit)

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run build
```

`npm run dev` skal starte uten warnings.

---

## Kjente gotchas

(beholdes fra forrige versjon — se PRISMA-7-seksjonen og Supabase-seksjonen i Git-historikken hvis du trenger detaljer)

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
