# AK Golf HQ — Komplett Design Hand-off

**Versjon:** 2026-05-25
**Eier:** Anders Kristiansen, AK Golf Group AS

Denne mappen inneholder ALT som trengs for å lage:
1. Et komplett designsystem fra bunnen
2. En 100% interaktiv prototype med alle skjermer i PlayerHQ og CoachHQ

---

## Innholdsfortegnelse

| # | Fil | Beskrivelse |
|---|---|---|
| 00 | [INDEX.md](./00-INDEX.md) | Denne filen |
| 01 | [BRANDING.md](./01-BRANDING.md) | Brand-identity, logo, navn, tagline |
| 02 | [DESIGN-SYSTEM.md](./02-DESIGN-SYSTEM.md) | Tokens, fonter, spacing, radius, ikoner |
| 03 | [TONE-OF-VOICE.md](./03-TONE-OF-VOICE.md) | Språk, faste termer, regler |
| 04 | [COMPONENT-INVENTORY.md](./04-COMPONENT-INVENTORY.md) | Alle 60+ komponenter med spec |
| 05 | [LAYOUT-PATTERNS.md](./05-LAYOUT-PATTERNS.md) | Sidebar, topbar, shells, mobile-flyt |
| 06 | [INTERACTIONS.md](./06-INTERACTIONS.md) | Animasjoner, motion, micro-interactions |
| 07 | [ACCESSIBILITY.md](./07-ACCESSIBILITY.md) | WCAG 2.1 AA, ARIA, tastatur, focus |
| 08 | [DEMO-DATA.md](./08-DEMO-DATA.md) | Øyvind Rohjan + alle demo-spillere |
| 09 | [PLAYERHQ-SCREENS.md](./09-PLAYERHQ-SCREENS.md) | Alle 60+ PlayerHQ-skjermer |
| 10 | [COACHHQ-SCREENS.md](./10-COACHHQ-SCREENS.md) | Alle 70+ CoachHQ-skjermer |
| 11 | [ROUTES-AND-AUTH.md](./11-ROUTES-AND-AUTH.md) | Next.js routes + rolle-guards |
| 12 | [PROTOTYPE-PROMPT.md](./12-PROTOTYPE-PROMPT.md) | Endelig prompt til Claude Design |

---

## Hvordan bruke denne pakka

### Steg 1: Forstå
Les filene 01-08 først. De definerer "hvordan plattformen skal se ut og føles".

### Steg 2: Lag designsystem
Bruk fil 02 (DESIGN-SYSTEM.md) som spec for tokens, fonter, spacing. Implementer i `src/app/globals.css` og `tailwind.config.ts`.

### Steg 3: Lag komponenter
Bruk fil 04 (COMPONENT-INVENTORY.md) som spec. Hvert komponent har:
- Filplassering
- Props-interface
- Variants
- Brukseksempler

### Steg 4: Lag prototypen
Lim inn fil 12 (PROTOTYPE-PROMPT.md) i Claude Design. Den inkluderer referanser til alle andre filer.

### Steg 5: Implementer mot prototype
Etter prototypen er klar, bruk filene 09-11 som mapping fra design → kode.

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

---

**Når i tvil:** sjekk `CLAUDE.md` i repo-roten — den er den autoritative tekniske spec'en.
