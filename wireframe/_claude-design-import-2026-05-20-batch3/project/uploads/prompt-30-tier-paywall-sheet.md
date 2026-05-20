# Prompt 30 — Tier-paywall sheet (gjenbrukbar)

## Hensikt

Gjenbrukbar sheet/modal som vises hver gang en GRATIS-bruker forsøker en Pro-funksjon. Konsistent og overbevisende — ikke aggressiv.

## Trigger

Server- eller klient-side gate: enhver Pro-only action returnerer eller åpner denne. Mottar prop `feature: string` for kontekstuell hero-tekst.

## Layout

- Modal/sheet 560 × auto, cream, `rounded-2xl`, `p-12`.
- Hero-blokk:
  - Stort Lucide-ikon kontekstuelt (Sparkles for AI, BarChart3 for stats, MessageSquare for coach) i lime-circle 80×80.
  - Eyebrow JetBrains Mono "PLAYERHQ · PRO"
  - Tittel Inter Tight 32 px italic Instrument Serif:
    - "AI-coach er en *Pro*-funksjon"
    - eller kontekstuelt "TrackMan-import er en *Pro*-funksjon"
  - Sub Inter 15 px muted: ÉN linje om hvorfor det er verdt det.
- Verdi-grid 2-kol:
  - 6 features med Lucide-ikon + kort tekst (AI 24/7, ubegrenset live, SG-hub, coach-meldinger, video-bibliotek, foreldre-tilgang)
- Pris-block stort:
  - "300 kr / mnd" Inter Tight 40 px tabular nums
  - "Avbestill når som helst · Pause når du vil"
- Knapper sticky bunn:
  - Primær forest pill stor "Oppgrader nå"
  - Outline "Test 7 dager gratis" (hvis ikke brukt før)
  - Ghost "Ikke nå"
- Mikro-fotnote: "Sosial garanti: 12 av 14 spillere sier Pro var verdt det."

## Komponenter

- `Dialog`, `Button`, `Card`
- Lucide: Sparkles, BarChart3, MessageSquare, Activity, Video, Users, Check, X, ArrowRight

## Eksempel-data

```
Feature-prop: "ai-coach"
Tittel: "AI-coach er en Pro-funksjon"
Sub: "Spør om hva som helst, 24/7. Trent på dine data."
Pris: 300 kr/mnd
Trial: tilgjengelig (Markus aldri prøvd Pro)
```

## Branding-krav

- Lime aksent på pris + Pro-features.
- Inter Tight italic på "Pro".
- JetBrains Mono for pris.
- Cream + forest, ingen aggressive farger.
- Norsk bokmål.

## Tilstander

- **Trial brukt**: skjul trial-knapp.
- **Pending**: spinner i Oppgrader-CTA.
- **Suksess**: lukkes + redirect til Stripe checkout.
- **Mobil**: bottom sheet i stedet for sentrert modal.
