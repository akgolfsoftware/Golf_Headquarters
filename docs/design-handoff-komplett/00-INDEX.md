# AK Golf HQ — Komplett Design Hand-off

**Versjon:** 2026-05-25 (v2 — athletic editorial)
**Eier:** Anders Kristiansen, AK Golf Group AS

Denne mappen inneholder ALT som trengs for å lage:
1. Et komplett designsystem fra bunnen
2. En 100% interaktiv prototype med alle skjermer i PlayerHQ og CoachHQ

---

## ⚡ Endringer siden v1 (2026-05-25)

**Visuell retning skiftet fra "editorial luxury" → "athletic editorial":**

- **Dark moments på lys base** — utvalgte cards (countdown, hero-CTA, highlight-tiles) blir mørke (`bg-foreground` med hvit tekst) for å skape dramatisk kontrast mot den lyse cream-bakgrunnen
- **Real photography** — AK Golf Academy-bilder (41 WebP-filer i `/public/images/akgolf/`) brukes som hero-bakgrunner med dark gradient overlay (`from-black/85 via-black/55 to-black/20`)
- **Display-tall over alt** — 120px lime countdown, 32-60px display-tall i stats, Inter Tight italic på hero-titler
- **Editorial section dividers** — `<SectionHeader>` med lime accent-strek + eyebrow + display-tittel + valgfri CTA-pill mellom alle seksjoner
- **PlayerHQ-hjem (`/portal`)** er promotert til workbench-v2-designet (gammel versjon arkivert i git history)

**Hva som IKKE har endret seg:**

- 24 semantic tokens (uforandret)
- 3 fonter (Inter / Inter Tight / JetBrains Mono)
- 8pt-grid
- Lucide-ikoner kun
- Norsk bokmål, du-form, ingen emojier
- Light tema only i første runde

---

## Innholdsfortegnelse

| # | Fil | Beskrivelse |
|---|---|---|
| 00 | [INDEX.md](./00-INDEX.md) | Denne filen |
| 01 | [BRANDING.md](./01-BRANDING.md) | Brand-identity, athletic editorial-retning |
| 02 | [DESIGN-SYSTEM.md](./02-DESIGN-SYSTEM.md) | Tokens, fonter, spacing, radius, ikoner |
| 03 | [TONE-OF-VOICE.md](./03-TONE-OF-VOICE.md) | Språk, faste termer, regler |
| 04 | [COMPONENT-INVENTORY.md](./04-COMPONENT-INVENTORY.md) | Alle komponenter med spec |
| 05 | [LAYOUT-PATTERNS.md](./05-LAYOUT-PATTERNS.md) | Sidebar, topbar, shells, mobile-flyt |
| 06 | [INTERACTIONS.md](./06-INTERACTIONS.md) | Animasjoner, motion, micro-interactions |
| 07 | [ACCESSIBILITY.md](./07-ACCESSIBILITY.md) | WCAG 2.1 AA, ARIA, tastatur, focus |
| 08 | [DEMO-DATA.md](./08-DEMO-DATA.md) | Øyvind Rohjan + alle demo-spillere |
| 09 | [PLAYERHQ-SCREENS.md](./09-PLAYERHQ-SCREENS.md) | Alle PlayerHQ-skjermer |
| 10 | [COACHHQ-SCREENS.md](./10-COACHHQ-SCREENS.md) | Alle CoachHQ-skjermer |
| 11 | [ROUTES-AND-AUTH.md](./11-ROUTES-AND-AUTH.md) | Next.js routes + rolle-guards |
| 12 | [PROTOTYPE-PROMPT.md](./12-PROTOTYPE-PROMPT.md) | Endelig prompt til Claude Design |
| **13** | **[ATHLETIC-EDITORIAL.md](./13-ATHLETIC-EDITORIAL.md)** | **NY — visuell retning i detalj** |
| **14** | **[WORKBENCH-V2-SPEC.md](./14-WORKBENCH-V2-SPEC.md)** | **NY — implementert PlayerHQ-hjem (kanonisk eksempel)** |

---

## Hvordan bruke denne pakka

### Steg 1: Forstå retningen
Les 01-BRANDING + **13-ATHLETIC-EDITORIAL** først. De definerer "hvordan plattformen skal se ut og føles".

### Steg 2: Studér det eksisterende eksempelet
**14-WORKBENCH-V2-SPEC** er den kanoniske implementasjonen. PlayerHQ-hjem (`/portal`) på akgolf.no er live og bruker akkurat dette mønsteret. Alle nye skjermer skal følge samme rytme.

### Steg 3: Lag designsystem
Bruk 02-DESIGN-SYSTEM som spec. Tokens er allerede implementert i `src/app/globals.css`.

### Steg 4: Lag komponenter
Bruk 04-COMPONENT-INVENTORY. Hvert komponent har:
- Filplassering
- Props-interface
- Variants
- Brukseksempler

### Steg 5: Lag prototypen
Lim inn 12-PROTOTYPE-PROMPT i Claude Design. Den inkluderer referanser til alle andre filer.

### Steg 6: Implementer mot prototype
Etter prototypen er klar, bruk 09-11 som mapping fra design → kode.

---

## Hva du IKKE finner her

- Kode-implementasjon (det er i `src/`)
- Detaljerte UX-flows (de bygges i prototypen)
- Forretningsregler (de er i `docs/glossary.md` + Prisma-schema)

---

## Filer med tilhørighet

| Fil i denne pakka | Kobler til kode/data |
|---|---|
| 02-DESIGN-SYSTEM.md | `src/app/globals.css`, `CLAUDE.md` |
| 04-COMPONENT-INVENTORY.md | `src/components/ui/*`, `src/components/shared/*` |
| 08-DEMO-DATA.md | `data/notion-spillere-2026-05-25.json` |
| 09 + 10 | `src/app/portal/*`, `src/app/admin/*` |
| 11 | `next.config.ts`, `src/lib/auth/*` |
| 13 | `src/components/portal/workbench/*` |
| 14 | `src/app/portal/page.tsx` |

---

## Foto-bibliotek

41 AK Golf Academy-bilder ligger i `/public/images/akgolf/AK-Golf-Academy-{1-44}.webp` (manglende: 36, 37, 41).

Bruksmønster i prototypen:
- Bilde 1 (lavt-vinkel swing) → PlayerHQ-hjem hero
- Bilde 2, 7, 12 → coach-profil, anlegg-detalj, drill-thumbnails
- Bilde 44 → drill-bibliotek hero / marketing-forside

Optimalisering: WebP @ q80, max 2000px bredde (~7 MB totalt).

---

**Når i tvil:** sjekk `CLAUDE.md` i repo-roten — den er den autoritative tekniske spec'en.
