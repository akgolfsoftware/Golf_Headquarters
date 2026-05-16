# Felles designspec — inkluderes i alle Claude Design-prompter

Kopier denne seksjonen øverst i HVER design-prompt før de spesifikke detaljene.

---

## Stack og rammer
- **Viewport:** 1440px desktop. Mobil-variant 375px der relevant.
- **Filformat:** Hver skjerm leveres som én selvstendig HTML-fil med inline CSS.
- **Språk:** Norsk bokmål. Bruk æ/ø/å. Ingen emoji.
- **Tema:** Lyst som standard. Mørk sidebar i CoachHQ.
- **Tone:** Editorial, observerende. Aldri "Velkommen tilbake!" eller "God morgen Henrik 👋". Maks 1 italic Inter Tight per skjerm.

## Fonter (Google Fonts)
- **Sans (UI, brødtekst):** Geist 400/500/600
- **Display (overskrifter, italic):** Instrument Serif 400 (kun italic for editorial moment)
- **Mono (tall, KPI, kode):** JetBrains Mono 400/500/700 med `font-variant-numeric: tabular-nums`

## Designtokens
```css
:root {
  /* Lyst tema */
  --background: #FAFAF7;
  --foreground: #0A1F17;
  --card: #FFFFFF;
  --card-foreground: #0A1F17;
  --primary: #005840;
  --primary-foreground: #D1F843;
  --secondary: #F1EEE5;
  --muted: #F1EEE5;
  --muted-foreground: #5E5C57;
  --accent: #D1F843;
  --accent-foreground: #005840;
  --destructive: #A32D2D;
  --border: #E5E3DD;
  --ring: #005840;

  /* Pyramide */
  --pyr-fys: #003B2A;
  --pyr-tek: #005840;
  --pyr-slag: #2A7D5A;
  --pyr-spill: #B7C97D;
  --pyr-turn: #D1F843;

  /* Radius */
  --radius-card: 1rem;       /* 16px */
  --radius-control: 0.75rem; /* 12px */
  --radius-tight: 0.5rem;    /* 8px */
  --radius-pill: 9999px;
}
```

## Spacing
8pt-grid: 8 / 16 / 24 / 32 / 40 / 48 / 64. Aldri 4 / 12 / 20 / 28 / 36.

## Komponent-mønstre
- **Card:** `bg: var(--card)`, `border: 1px solid var(--border)`, `radius: var(--radius-card)`, `padding: 24px`
- **Chip/pill:** `padding: 4px 12px`, `radius: var(--radius-pill)`, `font: JetBrains Mono 11px uppercase tracking 0.08em`
- **Button primary:** `bg: var(--primary)`, `color: var(--primary-foreground)`, `padding: 10px 16px`, `radius: var(--radius-control)`, `font-weight: 600`
- **KPI-tall:** JetBrains Mono 32px medium, tabular-nums, color var(--foreground)
- **KPI-label:** JetBrains Mono 10px uppercase, tracking 0.08em, color var(--muted-foreground)
- **PageHeader:** eyebrow (mono 11px) + tittel (Inter Tight 36px + italic Instrument Serif del) + sub (16px)

## Pyramide-kategori-farger og betydning
| Kode | Farge | Tekst-farge | Eksempel |
|---|---|---|---|
| FYS | #003B2A | white | Fysisk trening |
| TEK | #005840 | white | Teknisk trening |
| SLAG | #2A7D5A | white | Golfslag-trening |
| SPILL | #B7C97D | #0A1F18 | Spill-trening |
| TURN | #D1F843 | **#0A1F18** (aldri hvit) | Turnering |

## Praksistype
- BLOKK (B) — blå #3B82F6
- RANDOM (R) — oransje #F59E0B
- KONKURRANSE (K) — rød #DC2626
- SPILL_TEST (S) — lilla #8B5CF6

## Ikoner
Lucide React, 1.5px stroke, currentColor. Ingen Heroicons.

## ANTI-AI-regler
1. **Ingen 2×2 grid** uten god grunn. Bruk variert spacing og asymmetri.
2. **Ingen "Velkommen"-greeting.** Bruk observasjon: "Onsdag, Markus. To dager siden sist."
3. **Maks én italic Instrument Serif per skjerm.** Reserver den.
4. **Ingen hardkodet hex** utenom token-definisjon. Bruk var(--...).
5. **Ingen emoji noensteds.** Lucide-ikoner i stedet.
6. **JetBrains Mono med tabular-nums på ALLE tall**, datoer, deltas, prosenter.
7. **Sentence case overalt.** Ikke Title Case.
8. **Du-form for brukeren.**
9. **Ingen overflow-hidden på containere** — bare på tekst (ellipsis).
10. **Last-fokuset:** Eyebrow → Tittel → KPI → Innhold → CTA i bunn.
