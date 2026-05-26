# AK Golf Platform — PlayerHQ — Coach-melding (compose)

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/min/coach/melding/ny` (eller modal i `/min/coach/:id`)
- **Arketype:** D — Wizard / Form (single send-form med rik content)
- **Tier-gating:** Free får 5 meldinger/mnd. Pro+ ubegrenset.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/coach-message-compose.html`
- **Audit:** `wireframe/audit/playerhq-coach-message-compose.md`
- **Tilhørende skjermer:** Coach-meldinger-tråd (batch 3 / batch 6), Coach-detalj (batch 3)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. PlayerHQ-sidebar venstre. Form sentrert (max-width 800px) — bredere enn andre forms for å gi plass til preview av vedlegg. **Inkluderes i batch 4 som send-form-arketype** (kan også brukes som referanse for relaterte send-forms). Maks 3 lime per skjerm.

## Spec — hva skjermen er for

Markus vil sende en melding til coach Anders med tekst, evt. video-klipp, screenshot fra TrackMan, eller spørsmål om en spesifikk plan. Forskjellig fra OnskeligOkt (pakke 10) som er strukturert forespørsel — denne er fri-form chat-init. Etter send opprettes en tråd som vises i Coach-meldinger-tråd (batch 3).

## Layout — UNIKT for denne skjermen

PlayerHQ-sidebar venstre. Hoved-content sentrert.

### Hero-strip (80px)

- "← Tilbake"-link venstre
- Sentrert: "Ny melding til **Anders K.**" + avatar (24px)
- Status-prikk høyre: "Online" (accent) / "Borte" (muted) + "Svarer typisk innen 4t"

### Form-body

**Mottaker-info-bar (sticky øverst i form, 56px):**
- Avatar (40px) + navn + rolle + status-prikk
- Klikkbar → åpner Coach-detalj (batch 3)

**Emne (valgfritt):**
- Tekstfelt: "Emne (valgfritt)" — placeholder
- Hjelpe-tekst under: "Hjelper Anders prioritere — kan stå tom"

**Hovedinnhold (rik tekstboks):**
- Min-høyde 200px, auto-grow
- Toolbar over: **B** _I_ liste-bullet · liste-num · `link` · `code` · `image` · `video` · `paperclip`
- Placeholder: "Skriv meldingen din … (du kan dra-og-slippe filer hit også)"
- Inline emoji-picker (`Smile`-ikon i toolbar)

**Vedlegg-strip (under tekstboks, vises ved drag-drop eller via toolbar):**
- Hver vedlegg som chip:
  - Tumbnail (50×50px hvis bilde/video) eller fil-ikon
  - Filnavn + størrelse
  - Lukk-X
- Drag-drop område synlig ved hover på toolbar-paperclip

**Konteksts-koblinger (valgfritt):**
- "Koble til:" expandable seksjon
  - Klikkbart: "Koble til en plan-uke" / "Koble til en TrackMan-økt" / "Koble til en runde"
  - Hver åpner mini-velger (popover) → setter en context-pill i melding (kan fjernes)
- Eks: pill "📋 Plan: Sommer-toppform · Uke 22"

**Footer (sticky bunn):**
- Venstre: `Avbryt` + `Lagre som utkast` (sekundær link)
- Høyre: `Send →` (primary, accent)

## Klikkbare elementer

| Element | States |
|---|---|
| "← Tilbake"-link | default, hover, focus |
| Mottaker-bar | default, hover (lift), klikk → Coach-detalj |
| Emne-felt | default, focus, with-text |
| Tekstboks | default, focus, with-text, drag-over (accent border) |
| Toolbar-knapp (B/I/etc.) | default, hover, active (når tekst-format aktiv), focus |
| `link`-knapp | klikk → mini-popover med URL-felt |
| `image`/`video`/`paperclip` | klikk → fil-velger |
| `image`-knapp | klikk → fil-velger ELLER ta bilde (mobil) |
| Emoji-picker | klikk → emoji-grid popover |
| Vedlegg-chip | default, hover (X synlig), klikk-X → fjern, klikk-thumbnail → preview-overlay |
| Drag-drop område | default (skjult), drag-over (synlig + accent border) |
| "Koble til"-expandable | collapsed, expanded |
| Context-velger-rad | default, hover, klikk → setter pill |
| Context-pill | default, hover, klikk-X → fjern |
| `Lagre som utkast` | default, hover, focus, loading, success ("Lagret som utkast") |
| `Send →`-CTA | default, hover, disabled (tom melding), loading ("Sender …"), success (accent flash + redirect) |
| `Avbryt`-knapp | default, hover, klikk → confirm hvis endringer |

## Empty / loading / error / success-states

- **Idle:** Tom melding, CTA disabled
- **Validering:** Send krever minst tekst eller minst 1 vedlegg
- **Drag-over:** Tekstboks får accent border + overlay "Slipp filer her"
- **Vedlegg-upload loading:** Per-fil progress-bar i vedlegg-chip
- **Vedlegg-error:** Inline error per chip: "Filen er for stor (max 50 MB)" / "Ugyldig format"
- **Submit loading:** CTA spinner, "Sender til Anders …", form disabled
- **Submit success:** Accent-flash + redirect til Coach-meldinger-tråd (batch 3) med ny melding scrollet inn
- **Submit error:** Toast: "Kunne ikke sende. Sjekk forbindelsen og prøv igjen." — melding beholdes
- **Tier-gating:** Free + 5 brukt denne mnd → banner øverst: "Du har brukt 5 av 5 free-meldinger denne mnd. [Oppgrader til Pro →]" — form disabled
- **Coach offline:** Banner: "Anders er borte til {dato}. Han ser meldingen ved retur — eller kontakt ved haste-saker [Send som haste →]"

## Mobile (≤640px)

Sidebar hamburger. Mottaker-bar sticky. Tekstboks tar full bredde. Toolbar komprimerer (færre knapper, "..."-meny for resten). Vedlegg-strip blir 1-kolonne. Footer-knapper fyller bredden.

## Ønsket output fra Claude Design

1. Lyst tema, idle (tom)
2. Lyst tema, mid-typing m/ formatert tekst (B + I + bullet)
3. Lyst tema, 2 vedlegg synlig (1 bilde-thumbnail, 1 video-tumbnail)
4. Lyst tema, "Koble til" ekspandert med plan-pill satt
5. Lyst tema, drag-over (accent border + overlay)
6. Lyst tema, submit-loading
7. Lyst tema, tier-gating Free-blokk
8. Mørkt tema
9. Mobil ≤640px (toolbar komprimert)

## Ikke-mål

- Ikke designe Coach-meldinger-tråd-skjerm (batch 3)
- Ikke designe Coach-detalj (batch 3)
- Ikke designe video-opptak in-app (egen pakke)
- Ikke designe send-form fra coach til spiller (egen CoachHQ-pakke — speilet her)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
