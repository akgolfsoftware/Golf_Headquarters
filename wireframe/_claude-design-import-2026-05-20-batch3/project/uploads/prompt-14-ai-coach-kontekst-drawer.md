# Prompt 14 — AI-coach kontekst-drawer

## Hensikt

I `/portal/coach/ai` skal Markus kunne åpne en høyre-drawer som viser hva AI-en "vet" — hans profil, plan, siste runder, siste økter, mål. Gir transparens og tillit.

## Trigger

Klikk på "Hva vet AI om meg?"-pill eller Lucide Info-ikon over chat-vinduet.

## Layout

- Drawer høyre 520 px, cream, `p-8`.
- Header: eyebrow "PLAYERHQ · AI-COACH · KONTEKST", X.
- Tittel Inter Tight 24 px "Hva AI *husker*".
- Profil-card secondary:
  - Avatar + navn + HCP + klubb
  - Eyebrow "Spillerprofil sist oppdatert: 15. mai"
- Seksjon "Aktive mål" — 3 mål med progress-bar
- Seksjon "Siste runder" — 5 stk, JetBrains Mono tabular nums (dato, bane, score)
- Seksjon "Siste 5 økter" — pyramide-fargete chips
- Seksjon "TrackMan-trender" — sparkline 90 dager carry-distance
- Seksjon "Helse" — siste skade-rapport + søvn-snitt
- Bunn-fotnote "AI bruker disse dataene for å gi deg personlige svar. Du kan slette historikk i innstillinger."

## Komponenter

- `Sheet`, `Card`, `Progress`, sparkline (custom SVG)
- Lucide: X, User, Target, Flag, Dumbbell, Activity, HeartPulse, Info

## Eksempel-data

```
Markus, HCP 0.4, GFGK, Pro
Aktive mål: 3 (1× SG, 1× distanse, 1× score)
Siste runde: 14. mai, GFGK Old, 71 (+1)
Siste økt: 17. mai, TEK · Iron contact
TrackMan: 7i carry snitt 162 m (+3 m vs 30d)
Skade: ingen aktiv
```

## Branding-krav

- Forest aksent på cards, lime på aktive mål.
- JetBrains Mono tabular nums overalt.
- Sparkline forest stroke, lime endepunkt.
- Norsk bokmål.

## Tilstander

- **Tomme data**: empty-state "AI lærer hver gang du logger noe".
- **Privacy-knapp** nederst: "Slett kontekst-historikk".
