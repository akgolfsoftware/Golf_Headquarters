# AK Golf Platform — Modal — LogRoundModal

## Identitet

- **Produkt:** PlayerHQ
- **Trigger:** `+ Logg runde`-CTA på `/portal/mal/runder` (PlayerHQ Runder, pakke 13)
- **Type:** Form-modal med live-beregning
- **Tier-gating:** Alle (logging er ikke gatet, kun SG-analyse er Pro)
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/log-round.html`
- **Audit:** `wireframe/audit/playerhq-runder.md` (modal-seksjon)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. PlayerHQ-modal — `card`-bg lyst, `popover`-bg mørkt. Tabular nums (JetBrains Mono) på alle score-felt. Eksakte token-navn — ikke hardkode hex. Markus er referanse-spilleren.

## Spec — hva modalen er for

LogRoundModal er Markus' verktøy for å manuelt logge en runde han har spilt. Form med dato, bane (autocomplete), tee, og 18 score-felt. Lever-beregning av total, vs par, FIR, GIR og putts vises i sammendragsstrip nederst. Skal være ferdig på 90 sekunder for en erfaren spiller.

## Layout — UNIKT for modal

- **Modal-container:** Sentrert, max-width 760px, høyde auto, `rounded-xl`, bakdrop blur(4px)
- **Header (sticky, 64px):**
  - Tittel italic Instrument Serif 22px: «Logg runde»
  - Sub: «Markus Pedersen · {valgt-bane eller "velg bane"}»
  - Lukk-X øverst-høyre
- **Body (max 70vh, scrollbar):**
  - **Topp-form (4 felt i grid 2×2):**
    - Dato (default i dag «8. mai 2026», kalender-popover)
    - Bane (autocomplete med 8 spilte + søk på flere — viser «Borre Golfklubb», «GFGK» osv.)
    - Tee (segmentert kontroll: Hvit · Gul · Rød — Gul default)
    - Vær (valgfri dropdown: Sol · Skyet · Regn · Vind)
  - **Hull-grid:** 18 hull i to rader (ut 1–9, inn 10–18), med par-rad over score-rad
    - Hver hull-celle: 64×72px
      - Topp: hull-nr (Inter 11px muted) + par (JetBrains Mono 12px muted, f.eks. «P4»)
      - Number-input for score (JetBrains Mono 18px tabular, autotab til neste)
      - Liten putts-input under (12px, default tom)
      - Bakgrunns-shade når score er ≤ par (accent subtil)
    - FIR/GIR-toggle under hver hull (2 sjekkbokser kompakte)
  - **Sub-totals (under ut og inn):** «Ut: 38 (+2)» og «Inn: 40 (+4)» (JetBrains Mono 16px)
  - **Notater-felt:** «Notater (valgfri)» — textarea 3 rader
- **Sammendrag-strip (sticky, 72px, accent subtil bg, like over footer):**
  - 5 kompakte stats: «Total: 78» · «Vs par: +6» · «FIR: 9/14» · «GIR: 11/18» · «Putts: 32»
  - Alle JetBrains Mono 16px tabular, oppdateres live ved hver score-input
- **Footer (sticky, 64px):**
  - Venstre: «Avbryt»
  - Høyre: `Logg runde →` (primary, accent-pill, disabled til alle 18 hull har score)

## Klikkbare elementer

| Element | States |
|---|---|
| Dato-felt | default, focus, open (kalender), valgt |
| Bane-autocomplete | default, focus, typing, suggesting, no-results («Bane ikke funnet — kontakt support»), selected |
| Tee-toggle | default, hover, active per tee |
| Vær-dropdown | default, open, item-hover, item-selected |
| Hull-score-input | default, focus, with-value, autotab på enter/4-cifre, validering (1–15) |
| Putts-input | default, focus, with-value, validering (0–8) |
| FIR-sjekkboks | uvalgt, valgt, focus (skjult på par-3) |
| GIR-sjekkboks | uvalgt, valgt, focus |
| Notater-textarea | default, focus, with-text |
| `Logg runde →`-CTA | default, hover, active, focus, disabled (manglende hull), loading, success |
| «Avbryt»-knapp | default, hover, focus, klikk → confirm hvis endringer |
| Lukk-X | default, hover, focus |

## Empty / loading / error / validation-states

- **Empty (default):** Dato i dag, bane tom, alle hull tomme, sammendrag-strip viser «—» på alle stats
- **Per-hull validering:** Score < 1 eller > 15 → felt rødt + warning-tekst under hull-grid
- **CTA disabled:** Når < 18 hull har score (count «{n}/18 hull logget»)
- **Send loading:** Sammendrag-strip dempes, footer disabled, CTA viser spinner
- **Send success:** Toast + modal lukker etter 600ms, list-skjerm refresher med ny rad
- **Send error:** Toast inni modal «Kunne ikke lagre. Prøv igjen.»
- **Avbryt med endringer:** Confirm-popover «Forkast logg?»

## Mobile (≤640px)

Full-screen modal. Hull-grid blir 3 kolonner × 6 rader (swipe horisontalt for å fokusere). Sammendrag-strip kollapser til kompakt rad over footer. Topp-form blir 1 kolonne stables.

## Ønsket output fra Claude Design

1. Tom modal (default lyst tema, dato i dag, alle hull tomme)
2. Halvferdig (10 av 18 hull logget, sammendrag oppdatert delvis)
3. Komplett ferdig (alle 18 hull, total 78 +6, klar for send)
4. Mørkt tema (komplett)
5. Validering-state (score 17 på et hull, rødt felt + warning)
6. Send loading
7. Mobile full-screen (komplett)
8. Avbryt-confirm-popover

## Ikke-mål

- Ikke designe runde-detalj-skjerm som åpnes etter logging (egen batch)
- Ikke designe SG-input (kun for Pro, kommer senere)
- Ikke implementere ekte bane-database — bruk Markus' 8 baner som autocomplete-eksempler
