# Prompt 16 — Coach-evaluering (modal)

## Hensikt
Be spilleren gi tilbakemelding på en coaching-økt med coachen sin — kvalitetssikring og signal til AK Golf-ledelsen.

## Trigger
Automatisk modal 24 timer etter coaching-økt er fullført, med påminnelse i app-varsel. Også manuelt fra økt-detalj med CTA "Gi coachen feedback".

## Layout
Sentrert modal 520px. Header: avatar 56px + coach-navn + dato for økt. Body: 4 vurderings-sjekkpunkter + fri-tekst. Footer: Hopp over (ghost) + Send vurdering (primary).

## Komponenter
- Coach-header: avatar + "Hvordan var økten med Hans?" + meta "60min privat · 18.05 kl 16:00 · GFGK Performance"
- 4 stjerne-radioer (1–5 stjerner) per dimensjon:
  1. Forberedelse — "Var Hans godt forberedt?"
  2. Innhold — "Lærte du noe nytt?"
  3. Kommunikasjon — "Var instruksjonene tydelige?"
  4. Helhet — "Hvor fornøyd er du totalt?"
- Highlight-chips (multiselect): "Var inspirerende" · "Konkret feedback" · "Ga hjemmelekse" · "Brukte video" · "Ga målbart resultat"
- Fri-tekst: "Andre tilbakemeldinger?" (300 tegn, valgfritt)
- "Anonym tilbakemelding"-toggle (default av — coachen ser navnet)
- Footer: Hopp over + Send vurdering

## Eksempel-data
- Coach: Hans Brennum
- Økt: 18.05.2026 kl 16:00–17:00, GFGK Performance, type Privat 60min
- Spillerens stemming-valg (eksempel-fylt):
  - Forberedelse: 5
  - Innhold: 5
  - Kommunikasjon: 4
  - Helhet: 5
  - Highlights: "Konkret feedback", "Brukte video", "Ga hjemmelekse"
  - Fri-tekst: "Beste økt så langt i år. Følte vi virkelig fant noe på P3."
  - Anonym: av

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (dato), Instrument Serif italic (sparsom — "Hvordan var økten" i tittel)
- Lucide-ikoner stroke 1.75 (star, star fylt vs outline)
- Stjerner: forest når valgt, line-color når ikke
- Norsk bokmål, ingen emojier

## Form-felter
- `forberedelse` int 1-5 required
- `innhold` int 1-5 required
- `kommunikasjon` int 1-5 required
- `helhet` int 1-5 required
- `highlights` multiselect optional
- `kommentar` text optional max 300
- `anonym` boolean default false

## Submit / actions
- POST `/api/portal/coach-evaluations` → modal lukkes → toast "Takk for tilbakemeldingen"
- "Hopp over" → mark som ignorert, ikke spør igjen for denne økten

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG stjerner
- A11y: ARIA-label på hver stjerne-knapp ("1 av 5 stjerner for forberedelse")
- Send-knapp disabled til alle 4 stjerne-felter er fylt
