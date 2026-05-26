# AK Golf Platform — Modal — LiveSummaryModal (Screen 4 — oppsummering)

## Identitet

- **Produkt:** PlayerHQ
- **URL:** Modal — `LiveSummaryModal`
- **Arketype:** E — Fullscreen / Live (oppsummering etter ferdig)
- **Tier-gating:** Ingen ekstra
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/live-summary.html`
- **Audit:** `wireframe/audit/modal-live-summary.md`
- **Tilhørende skjermer:** Vises etter siste øvelse i Live Session; leder til Hjem eller treningsplan

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva modalen er for

LiveSummaryModal er Screen 4 — den siste skjermen i Live Session-flyten. Spilleren har fullført alle 6 øvelser og fortjener en feiring + ærlig oppsummering. Skjermen viser totalt antall reps, fordeling per pyramide-fokus (donut-chart), tid brukt, og en "agent-anbefaling" hvis Periodiserings-agenten har analysert økta og foreslår noe (f.eks. "Du har trent TEK 4 dager på rad — vurder pauseuke"). Spiller kan dele økta, lagre notater, eller bare lukke.

## Layout — UNIKT for denne modalen

Bruker arketype-E-felles-spec. **Fullscreen-modal, ingen sidebar.** Bakgrunn `#0A1F18` med subtil konfetti-grain (lime-prikker som svever sakte oppover, 8% opacity).

### Topp-bar (56px)

- **Venstre:** Lime check-ikon + "Økt fullført" Geist 14px
- **Senter:** "Sommer-toppform · Økt 12 av 18" muted
- **Høyre:** Lukk-X 40×40px

### Senter — feiring-hero (max-width 480px sentrert)

```
              [konfetti-prikker svever]

              "Bra jobba, Markus"
              ← italic Instrument Serif 40px

              45:23
              ← JetBrains Mono 64px lime

              Total tid

         ┌──────────────────────────────────┐
         │  150 av 150 reps                  │
         │  6 av 6 øvelser                   │
         │  3 markert som mislykket          │
         └──────────────────────────────────┘

         [pyramide-donut-chart]
         TEK 40% · SLAG 33% · FYS 27%

         ┌──────────────────────────────────┐
         │  💡 Agent-tip                     │
         │  Du har trent TEK 4 dager på rad  │
         │  — vurder en pauseuke             │
         │              [Vis detaljer →]     │
         └──────────────────────────────────┘
```

### Pyramide-donut-chart

Sentrert donut, 200×200px, hull i midten 100px:
- TEK 40% — `#005840`
- SLAG 33% — `#D1F843`
- FYS 27% — `#16A34A`
- Hull i midten viser totalt antall reps (150)

### Agent-tip-kort (kun hvis agent har anbefaling)

- bg `#1B3B30`, border-left 3px lime, padding 20px, `rounded-xl`
- "💡 Agent-tip" Geist Mono 11px uppercase muted
- Anbefalings-tekst Geist 14px
- `Vis detaljer →` (ghost lime) som åpner `PlanActionDetailModal`

### Bunn-bar (88px) — 3 knapper

- Venstre 33%: `Lagre notater` (secondary, 56px) — åpner notat-modal
- Senter 33%: `Del økt` (ghost, 56px) — share-sheet
- Høyre 34%: `Ferdig →` (primary lime, 88px, `rounded-full`)

## States å designe

| State | Beskrivelse |
|---|---|
| Standard ferdig | Alle stats synlige, ingen agent-tip |
| Med agent-tip | Agent-kort vises under stats |
| Personal best (PB) | Lime "🏆 Ny PB!" badge over hero, konfetti-prikker tettere |
| Avbrutt økt (kun delvis fullført) | "Økt avsluttet tidlig — 4 av 6 øvelser" + dempet feiring |
| Loading agent-tip | Agent-kort skeleton mens agenten analyserer (800ms) |
| Lagre notater åpen | Notat-modal-overlay over hele dette |

## Klikkbare elementer

| Element | States |
|---|---|
| Ferdig-knapp | default, hover, klikk → tilbake til hjem |
| Lagre notater | default, hover, klikk → notat-modal |
| Del økt | default, hover, klikk → native share-sheet |
| Agent-tip "Vis detaljer" | default, hover, klikk → `PlanActionDetailModal` |
| Donut-segment | hover → tooltip med % + rep-antall |
| Lukk-X | klikk → tilbake til hjem (samme som Ferdig) |

## Empty / loading / error

Felles arketype-E + UNIKT:
- **Loading agent-tip:** Skeleton-kort 800ms
- **Avbrutt-state:** Dempet feiring-tekst, færre konfetti-prikker
- **Error lagring:** Toast "Kunne ikke lagre — prøvd igjen automatisk"

## Ønsket output fra Claude Design

1. Standard ferdig (uten agent-tip) — full feiring
2. Med agent-tip — alle stats + tip-kort synlig
3. PB-state — "Ny PB!"-badge + tettere konfetti
4. Avbrutt-state — 4/6 øvelser, dempet feiring
5. Loading agent-tip (skeleton)
6. Mobil — identisk (mobile-first), donut blir 160px på mobil

## Ikke-mål

- Ikke designe notat-modal (egen pakke i annen batch)
- Ikke designe `PlanActionDetailModal` (egen pakke)
- Ikke designe historikk over fullførte økter
- Ikke designe share-sheet (native OS-handling)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
