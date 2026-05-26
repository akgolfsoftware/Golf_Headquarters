# Prompt 17 — Milepæl-feiring auto-modal

## Hensikt

Når Markus oppnår en milepæl (eksempel: nytt HCP, første runde under par, mål nådd) — auto-modal med feiring, deling, og lagring til "Tro & Stolte øyeblikk"-veggen i SG-hub.

## Trigger

Auto-trigger fra backend når milepæl logges. Også manuell visning via klikk på milepæl-card i `/portal/mal/milepaeler`.

## Layout

- Modal 560 × auto, sentrert, cream, `rounded-2xl`, `p-12`.
- Konfetti soft (cream + lime + forest partikler) — kun ved auto-trigger, animasjon 1.5 s.
- Hero-ikon: stor Lucide Trophy 80×80 i forest-circle, lime ring 4 px.
- Eyebrow JetBrains Mono "MILEPÆL OPPNÅDD · 19. MAI 2026".
- Tittel Inter Tight 32 px italic Instrument Serif: "*Du satte ny HCP*"
- Sub-tekst: "Markus, du gikk fra 0.8 til 0.4. Det er din laveste noensinne."
- Stat-card stort: gammelt tall →pil→ nytt tall, JetBrains Mono 48 px tabular nums.
- Kontekst-card secondary:
  - "Hva som førte hit": 4 ukers TEK-fokus, 12 økter, 3 runder
- Knapper i sticky bunn:
  - Primær forest "Del med coach" (sender notifikasjon)
  - Secondary outline "Lagre i stolthetsvegg"
  - Tertiær ghost "Lukk"

## Komponenter

- `Dialog`, `Button`, Konfetti-bibliotek (eller custom SVG)
- Lucide: Trophy, Sparkles, Share2, Bookmark, X, ArrowRight

## Eksempel-data

```
Type: HCP forbedring
Gammel: 0.8
Ny: 0.4
Dato: 19. mai 2026
Kontekst: 12 økter, 3 runder, 4 uker TEK-fokus
```

## Branding-krav

- Lime + forest aksent, soft konfetti.
- Inter Tight italic på hovedtittel.
- JetBrains Mono store tall.
- Norsk bokmål.

## Tilstander

- **Allerede sett**: vis uten konfetti.
- **Coach varsel sendt**: knapp endres til "Coach varslet ✓".
