# Prompt 09 — Daglig helse-sjekk modal

## Hensikt

Daglig morgen-sjekk: Markus får en lett modal med 4 sliders for å logge søvn, energi, stress og verkende kropp. Tar 15 sekunder. Pusher inn i helse-trender + AI-coach.

## Trigger

Auto-vises ved første besøk på `/portal/page.tsx` kl 06:00–10:00 (om ikke logget i dag). Alternativt manuell knapp på `/portal/meg/helse`.

## Layout

- Modal 480 × auto, cream, `rounded-2xl`, `p-10`.
- Hero: Inter Tight 26 px "God morgen, *Markus*" italic.
- Underbeskrivelse: "15 sekunder for å hjelpe oss tilpasse dagens plan."
- 4 slider-card stacked, hver:
  - Ikon (Moon/Battery/Brain/HeartPulse Lucide)
  - Label Inter Tight 14 px
  - Slider 1–10 med live verdi JetBrains Mono tabular nums
  - Subscale-tekst nedunder ("Dypt / Lett / Avbrutt" etc.)
- Bunn:
  - Primær forest pill 100% "Lagre"
  - Tekst-lenke "Hopper over i dag"

## Komponenter

- `Dialog`, `Slider`, `Button`
- Lucide: Moon, Battery, Brain, HeartPulse, Check, ChevronRight

## Eksempel-data

```
Søvn: 7 (god)
Energi: 8 (høy)
Stress: 3 (lavt)
Kropp: 2 (ingen verk)
Tidspunkt: 07:42 mandag 19. mai
```

## Branding-krav

- Lime aksent på aktiv slider-thumb.
- JetBrains Mono store sifre for live verdi.
- Norsk bokmål, ingen emojier.

## Tilstander

- **Hoppet over**: lukkes, vises ikke igjen før i morgen.
- **Lagret**: lukkes + toast "Notert. Dagens plan justert."
- **AI-feedback**: hvis 2+ sliders <4, vis post-lagring-toast "Coach-tips: Lett økt i dag".
