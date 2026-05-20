# Design-output — HTML-mockups fra Claude Design

Lagre HTML-filer her etter du har generert dem i Claude Design.

## Mappestruktur

```
_outputs/
├── coachhq/        ← CoachHQ-skjermer (47 stk)
│   ├── 01.1-aarsplan.html
│   ├── 04.2-krysstabell.html
│   ├── 05.1-caddie-chat.html
│   └── ...
└── playerhq/       ← PlayerHQ-skjermer (26 stk)
    ├── 03.1-live-aktiv.html
    ├── 07.1-coach-oversikt.html
    ├── 08.1-min-profil.html
    └── ...
```

## Navngivning

`{fil-nr}.{prompt-nr}-{kort-slug}.html`

Eksempler:
- `01.1-aarsplan.html`
- `02.3-ab-vurdering.html`
- `04.2-krysstabell.html`
- `09.6-sg-statistikk.html`

## Bruk

1. Når du har én HTML-fil ferdig fra Claude Design — lagre den hit
2. Åpne den i nettleser (`open coachhq/04.2-krysstabell.html`) for å se hvordan den ser ut
3. Når Anders godkjenner — bruk den som referanse for Claude Code-implementering

## Forhåndsvisning av alle på én gang

```bash
# Generer en kombinert oversikt-side
cd docs/design-prompts/_outputs
ls coachhq/*.html playerhq/*.html | xargs -I {} echo '<iframe src="{}" width="100%" height="800"></iframe>' > _alle.html
open _alle.html
```

## Git

Mappa er committet til repoet slik at Anders kan dele design-filer med Claude Code-agenter når de implementerer.
