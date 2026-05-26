# AK Golf Platform — Modal — LiveIntroModal (Screen 1)

## Identitet

- **Produkt:** PlayerHQ (åpnes fra Hjem, Treningsplan eller Live Session)
- **URL:** Modal — `LiveIntroModal`
- **Arketype:** E — Fullscreen / Live (intro før start)
- **Tier-gating:** Free 1 økt/uke, Pro/Elite ubegrenset
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/live-intro.html`
- **Audit:** `wireframe/audit/modal-live-intro.md`
- **Tilhørende skjermer:** Åpnes når spiller starter en planlagt live-økt; leder til `LiveActiveModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva modalen er for

LiveIntroModal er Screen 1 i Live Session 4-modal-flyten. Når spiller trykker "Start økt →" fra hjem eller treningsplan, vises denne fullscreen-modalen som forbereder dem på økta. Den viser pyramide-fokus (TEK · DRIVER), antall planlagte øvelser, estimert varighet, og en stor "Start →"-knapp. Skal føles som en mental "ladding" — null distraksjoner, full fokus, lyst opp av motivasjon.

## Layout — UNIKT for denne modalen

Bruker arketype-E-felles-spec. **Fullscreen-modal, ingen sidebar, dekker hele viewport.** Bakgrunn `#0A1F18` med subtil noise-grain.

### Topp-bar (56px)

- **Venstre:** "Klar?" italic Instrument Serif 18px
- **Høyre:** Lukk-X 40×40px (med bekreftelse "Avlys økt?")

### Senter — sentrert content (max-width 480px)

```
        [pyramide-fokus-pill: TEK · DRIVER]

        Sommer-toppform
        Økt 12 av 18

        ┌──────────────────────────────────┐
        │  6 øvelser                       │
        │  ~45 minutter                    │
        │  150 reps planlagt               │
        └──────────────────────────────────┘

        "Fokuser på balansen i nedslag og
         hold tempo gjennom hele svingen"
        — Anders K
```

- **Pyramide-pill:** lime border for SLAG, primary for TEK, etc.
- **Plan-tittel:** italic Instrument Serif 32px
- **Økt-tittel:** Geist 14px muted
- **Stat-kort:** bg `#1B3B30`, padding 24px, `rounded-2xl`, 3 rader
- **Coach-melding:** italic Instrument Serif 16px, citatet i lime border-left

### Bunn-bar (88px)

- Full bredde primary CTA: `Start økt →` (lime, 88px, `rounded-full`)
- Sub under: "Long-press for testmodus uten lagring" muted 11px

## States å designe

| State | Beskrivelse |
|---|---|
| Default — full klar | Pyramide-pill, plan-info, coach-melding, start-CTA |
| Long-press på Start | Subtil destructive ring + "Testmodus aktiv — ingen data lagres" toast |
| Tier-gate (Free, brukt opp 1/uke) | Sentrert overlay "Du har brukt din ene live-økt denne uka → Oppgrader" |
| Loading økt-data | Skeleton stat-kort + dempet pyramide-pill |
| Avlys-bekreftelse | Sentrert popover "Avlys og gå tilbake?" med to knapper |

## Klikkbare elementer

| Element | States |
|---|---|
| Start økt-knapp | default, hover, long-press (testmodus), klikk → `LiveActiveModal` |
| Lukk-X | klikk → bekreftelse-popover |
| Coach-melding | hover → tooltip med fullt citat hvis truncated |

## Empty / loading / error

Felles arketype-E + UNIKT:
- **Loading:** Skeleton-kort + dempet pyramide-pill
- **Error (kunne ikke laste økt):** Sentrert kort "Kunne ikke laste øvelsene ↺"
- **Tier-gate:** Overlay med upgrade-CTA

## Ønsket output fra Claude Design

1. Default — klar til start, alle 3 stat-kort synlige, coach-melding
2. Long-press på Start — testmodus-feedback
3. Tier-gate (Free)
4. Loading-state
5. Avlys-bekreftelse popover
6. Mobil — identisk (mobile-first)

## Ikke-mål

- Ikke designe `LiveActiveModal` (egen pakke 10)
- Ikke designe økt-konfig (gjøres backend)
- Ikke designe coach-melding-redigering (gjøres i CoachHQ)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
