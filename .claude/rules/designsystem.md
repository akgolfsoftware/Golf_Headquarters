# Designsystem — ÉN kilde til sannhet

Flyttet fra CLAUDE.md 2026-06-14 for å holde CLAUDE.md under 100 linjer. Innhold uendret.

**Tokens:** `src/app/globals.css` — HSL-trippel uten `hsl()`-wrapper, shadcn-konvensjon.
**TS-speil for charts:** `src/lib/design-tokens.ts` — kun les fra denne, ikke definer farger her.
**Komponenter:** `src/components/athletic/` — gjenbruk alltid.

**FORBUDT:**
- Å lage nye `tokens.css`-filer noe sted
- Å hardkode hex-verdier i komponenter
- Å importere CSS-tokens fra `wireframe/`-mappen (denne mappen er arkiv)
- Å lage `tokens.ts`-fil i en komponent-mappe

Hvis du trenger ny farge, legg den inn som token i `globals.css` først. Spør Anders før du gjør det.

## Tokens (lyst tema — mørkt finnes for `.dark`-klasse)

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

## Komponenter — bygg ALDRI på nytt det som finnes

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

## Typografi

| Font | Tailwind | Bruk |
|---|---|---|
| Inter | `font-sans` (default) | UI, brødtekst |
| Inter Tight | `font-display` | Display, hero |
| JetBrains Mono | `font-mono` | KPI-tall, tabulære tall, eyebrows |

Editorial italic via Inter Tight italic. INGEN Instrument Serif eller andre fonter.

## Spacing

8pt-grid som standard. Kun `p-2/4/6/8/10/12/16`. Aldri `p-3/p-5/p-7`. Samme for `m-`, `gap-`, `space-y-`.

**Unntak — data-tette flater (Bloomberg-tetthet):** Dashboards, tabeller, timelines, innboks-rader og lignende compact UI kan bruke 12/14px (`p-3`, `p-3.5`, `gap-3`, `py-2.5`) der design-handover-HTML-en gjør det. Avgjort 2026-06-01 ved kalibrering av `/admin/agencyos`. Port fra design-HTML er fasit for slik spacing.

## Ikoner

Kun `lucide-react`. 24px, 1.5px stroke, `currentColor`. INGEN emoji i UI.

## Wireframe-mappen er arkiv — IKKE les fra den

`wireframe/` inneholder historiske design-eksperimenter fra mai 2026. Ikke import herfra, ikke kopier kode herfra, ikke bruk det som referanse. Hvis du trenger inspirasjon, spør Anders.
