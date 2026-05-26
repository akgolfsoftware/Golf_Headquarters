# AK Golf Platform — PlayerHQ — Send melding til coach

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/coach/message`
- **Arketype:** C — Detail + tabs (compose-view, hører hjemme i detail-batch som "send fra coach-detalj")
- **Tier-gating:** **Pro** (Free har ikke meldings-funksjon mot coach)
- **HTML-referanse:** `wireframe/screen-deck/playerhq/coach-message-compose.html`
- **Audit:** Ikke separat audit — utledet fra `playerhq-coach-detalj.md`
- **Tilhørende modaler:** `MessageDetailModal` (pakke 21)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Compose-skjerm når spiller åpner `Send melding`-knappen fra coach-detalj eller agent-strip. Forskjellig fra full meldingsboks (egen list-skjerm) — dette er ren compose med pre-fyllt mottaker (Anders K), tema-velger, tekstarea og send. Etter send: redirect til meldings-tråd (MessageDetailModal eller `/portal/coach/messages/:id`).

## Header-blokk — UNIKT

- **Avatar:** 56px med Anders K + grønn online-dot
- **H1:** `Send melding til Anders` (Geist 24px)
- **Subtittel:** `Hovedcoach · Online nå · Snitt-svartid: 2t 14m`
- **Stat-pills (3):** `28 økter sammen` · `2 uleste fra deg` · `Sist sendt: i går 09:02`
- **Sekundær link:** `← Tilbake til coach-profil`

## Tab-strip (3 tabs)

| Tab | Innhold |
|---|---|
| **Skriv** (default) | Compose-form |
| **Maler** | 5 forhåndslagde maler (be om økt, be om plan-endring, takk for økt, etc.) |
| **Tråd-historikk** | Forrige meldinger med Anders |

## Layout — Skriv-tab (default)

### Compose-form (8-col)

- **Tema-velger (chip-row):** Allmenn · Plan · Økt · Test · Privat
  - Klikk = setter context-tag (vises i coach-inbox)
- **Knytt til (optional):**
  - Datoer-picker for økt/runde å referere
  - Eller dropdown: "Velg økt..." / "Velg runde..."
- **Tekstarea:**
  - Min-høyde 200px
  - Auto-grow med max 600px
  - Placeholder: *"Hva tenker du på, Markus?"*
  - Karakter-teller nede høyre (max 2000)
- **Vedlegg-rad:** `+ Last opp video` · `+ Last opp bilde` · `+ Knytt PDF` (Lucide-ikon-knapper)
- **Send-rad:** `Avbryt` (ghost) + `Send melding` (lime CTA, disabled hvis tom)

### Sidebar (4-col)

- **Anders-mini-card:** Bio-snippet + sertifiseringer + `Se full profil →`
- **Tips-card:** italic editorial-fragment: *"Vær konkret. Anders svarer raskere på spørsmål med kontekst."*
- **Forrige meldinger-mini:** 3 siste tråder (klikkbare)

## Layout — Maler-tab

5 mal-cards:

| Mal | Eksempel-tekst |
|---|---|
| Be om ekstra økt | "Hei Anders, kan jeg booke ekstra TEK-økt før Sørlandsåpent?" |
| Be om plan-endring | "Hei, jeg trenger justering på plan — kan vi snakke?" |
| Takk for økt | "Takk for god økt i dag. Ny innsikt på pitch." |
| Spørsmål om test | "Hei, hvordan tolker jeg sand-test-resultatet?" |
| Privat / annet | "Hei, har en personlig sak..." |

Klikk = pre-fyll Skriv-tab med mal-tekst.

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip | default, hover, active |
| Tema-chip | default, hover, selected (lime) |
| `Knytt til`-dropdown | default, open, item-hover, selected |
| Tekstarea | default, focus (ring), with-text, error (>2000 chars rød) |
| Vedlegg-knapp | default, hover, file-picker-open |
| `Send melding` CTA | disabled (tom), default, hover, loading (spinner), success → redirect |
| Mal-card | default, hover (lift), klikk → pre-fyll |
| `← Tilbake` | default, hover (underline) |

## Empty / loading / error

- **Empty (Maler-tab):** Ikke relevant — alltid 5 maler
- **Send-error:** Inline rød "Kunne ikke sende. Prøv igjen." + retry
- **Send-loading:** Spinner i CTA + disable form
- **Send-success:** Toast "Sendt til Anders" + redirect til meldings-tråd
- **Coach offline:** Banner "Anders er offline — han svarer når han er tilbake"

## Eksempel-data

- **Mottaker:** Anders Kristiansen (online nå)
- **Avsender:** Markus Roinås Pedersen
- **Default tema:** Allmenn
- **Tips:** "Snitt-svartid 2t 14m"

## Ønsket output fra Claude Design

1. Lyst tema, Skriv-tab tom (default)
2. Mørkt tema, samme
3. Med tekst (200 ord) + tema "Plan" valgt + vedlegg attached
4. Coach offline-state
5. Mal-tab med 5 maler
6. Send-loading-state
7. Mobil ≤640px — sidebar stables under, vedlegg blir bottom-sheet

## Ikke-mål

- Ikke designe `MessageDetailModal` (pakke 21)
- Ikke designe full meldingsboks-skjerm (annen batch)
- Ikke designe vedleggs-upload-flow (egen pakke)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
