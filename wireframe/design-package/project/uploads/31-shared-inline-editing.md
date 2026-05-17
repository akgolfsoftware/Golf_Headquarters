# AK Golf Platform — Shared — Inline-editing-mønstre

## Identitet

- **Produkt:** Shared / cross-cutting (designer-referanse)
- **URL:** `/admin/design/inline-edit`
- **Arketype:** G — Other (katalog-grid med live demos)
- **Tier-gating:** Admin + designer
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/inline-editing.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** Ingen

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Inline-editing-katalogen dokumenterer alle steder hvor brukere kan redigere data direkte i UI uten å åpne modal — celler i tabell, beskrivelser i card, navn i header. Konsistente patterns for: hvordan man starter edit (klikk vs dobbeltklikk), hvordan man lagrer (Enter / blur / klikk Lagre), hvordan man avbryter (Esc).

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Endre uten å åpne modal."*
- Subtitle: `7 inline-edit-mønstre · alle med Enter-to-save / Esc-to-cancel`

### Demo-grid (2-kolonne, interaktive)

Hvert kort har **live demo** brukeren kan teste:

1. **Single-line text** (klikk for å redigere)
   - Eksempel: spiller-navn i header
   - Trigger: enkel klikk
   - Save: Enter eller blur
   - Cancel: Esc

2. **Multi-line text** (dobbeltklikk)
   - Eksempel: plan-beskrivelse
   - Trigger: dobbeltklikk
   - Save: Cmd/Ctrl+Enter
   - Cancel: Esc

3. **Number/Currency** (klikk celle)
   - Eksempel: pris i tjeneste-tabell
   - Format: "1 600 kr" → input "1600" → save → "1 600 kr"
   - Validering: må være heltall

4. **Date** (klikk feltet)
   - Eksempel: forfallsdato på faktura
   - Åpner inline date-picker (ikke modal)

5. **Select** (klikk pillen)
   - Eksempel: kategori-pill A-K
   - Åpner dropdown over pillen

6. **Toggle** (klikk switch)
   - Eksempel: aktiv-status på tjeneste
   - Optimistic update + revert ved error

7. **Tag-input** (klikk for å legge til)
   - Eksempel: spiller-tags ("junior", "elite", "WANG")
   - Type for å lage ny, klikk X for å fjerne

### Right-rail: Universale regler
- Save-state: spinner inni feltet
- Error-state: rød border + tooltip med årsak
- Optimistic UI: oppdater før server-respons, revert ved feil
- Aldri silent-save uten visuell bekreftelse

## Klikkbare elementer

| Element | States |
|---|---|
| Demo-felt | default (read-only), hover (cursor:text), focus (input synlig), saving, success, error |
| Save-knapp | default, hover, loading, success |
| Cancel-knapp | default, hover, klikk → revert |

## Empty / loading / error

- **Save-error:** Inline rød border + tooltip + retry
- **Optimistic-revert:** Animert tilbake til opprinnelig verdi

## Ønsket output fra Claude Design

1. Lyst tema, full katalog 7 mønstre
2. Mørkt tema, samme
3. En demo-felt i edit-mode (input synlig)
4. Save-state med spinner
5. Mobil ≤640px — 1-kolonne grid, edit-mode bruker bottom-sheet for store felter

## Ikke-mål

- Ikke designe modal-edit (det er separat)
- Ikke implementere optimistic UI-systemet

## Når du er ferdig

Lim design-link tilbake til Claude Code.
