# AK Golf Platform — PlayerHQ — Be om økt (OnskeligOkt)

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/min/onskeligokt`
- **Arketype:** D — Wizard / Form (single form med rik inputs)
- **Tier-gating:** Free får 1 forespørsel/mnd. Pro får 4. Elite ubegrenset.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/onskeligokt.html`
- **Audit:** `wireframe/audit/playerhq-onskeligokt.md`
- **Tilhørende skjermer:** Coach-detalj (batch 3), Coach-meldinger (pakke 11)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. PlayerHQ-sidebar venstre. Form sentrert (max-width 720px). Single form — ingen multi-step, men generøs spacing og tydelige seksjoner.

## Spec — hva skjermen er for

Markus vil be coachen Anders om en planlagt 1:1-økt. Forskjellig fra ny-økt-wizard (pakke 9) som er for økter Markus gjør selv. Her sender Markus et forslag til Anders som så kan godkjenne, avslå eller foreslå alternativ tid. Skjermen er en form med 5 seksjoner: hva, hvorfor, ønsket tid, fasilitet, melding.

## Layout — UNIKT for denne skjermen

PlayerHQ-sidebar venstre. Hoved-content sentrert.

### Hero-strip (96px)

- Tittel italic Instrument Serif 32px: *"Be om økt med Anders"*
- Sub: "Anders svarer typisk innen 4 timer på hverdager"
- Coach-info-pill høyre: avatar (32px) + "Anders K. — Hovedcoach" + status-prikk ("Online" accent / "Borte" muted)

### Form-seksjoner (vertikal stack med visuelle skiller)

**Seksjon 1 — Type økt:**
- Radio-kort:
  - "1:1 Coaching (60 min)" — standard
  - "Mini-økt (30 min)" — for spesifikt tema
  - "Range-besøk sammen" (90 min) — Anders observerer
  - "Spille runde sammen" (4 timer) — kun synlig for Pro+

**Seksjon 2 — Hva vil du jobbe med?**
- Multi-select chips: TEK / SLAG / SPILL / PUTT / FYS / Mental / Turneringsforberedelse / Annet
- Tekstboks (valgfritt): "Beskriv mer hvis du vil … (eks. 'Jeg sliter med høyre-misser fra 100m')" — placeholder

**Seksjon 3 — Når passer det best?**
- 3 dato-tid-felter (du foreslår 1–3 alternativ): "Alternativ 1" / "Alternativ 2" / "Alternativ 3"
- Hver: dato-velger + tid-stepper
- "+ Legg til alternativ"-link (max 3)
- "Helt fleksibel"-sjekkboks → skjuler dato-felt og sender beskjed med åpen tid

**Seksjon 4 — Fasilitet:**
- Radio:
  - "Mulligan Studio (din vanlige)" — default
  - "GFGK Range"
  - "Bossum"
  - "Du velger"
  - "Online video-økt"

**Seksjon 5 — Melding til Anders (valgfritt):**
- Tekstboks (5 rader): "Skriv en kort melding hvis du vil … "
- Tegn-teller nederst-høyre (max 500)

**Footer (sticky):**
- Venstre: `Avbryt`
- Høyre: `Send forespørsel →` (primary, accent)

## Klikkbare elementer

| Element | States |
|---|---|
| Type-kort radio | uvalgt, hover (lift), valgt (accent border + ring) |
| Pro-only-kort (runde sammen) | dempet for Free + tooltip "Krever Pro" |
| Tema-chips (multi) | uvalgt, hover, valgt (accent bg) |
| Tekstboks (valgfritt) | default, focus, with-text, max-length-warning |
| Dato-velger | default, open kalender, valgt |
| Tid-stepper | default, hover, valgt |
| "+ Legg til alternativ" | default, hover, focus, disabled (3 alt allerede) |
| Helt-fleksibel-checkbox | uvalgt, valgt, focus |
| Fasilitet-radio | uvalgt, valgt, hover |
| Melding-tekstboks | default, focus, tegn-teller (rød ved >450) |
| `Send forespørsel →`-CTA | default, hover, disabled (validering feil), loading ("Sender …"), success-flash |
| `Avbryt`-knapp | default, hover, klikk → confirm hvis endringer |

## Empty / loading / error / success-states

- **Idle:** Default valg (1:1 60 min, Mulligan Studio), ingen alternativ-tider valgt
- **Validering:** Krav minst 1 alternativ tid (med mindre "Helt fleksibel" er valgt) + minst 1 tema-chip
- **Submit loading:** CTA spinner, "Sender til Anders …"
- **Submit success:** Full-screen confirmation: stort `Send`-ikon (accent), "Forespørsel sendt", subtekst "Anders svarer typisk innen 4 timer. Du får varsel her og på e-post." + CTA `Til oversikten →`
- **Submit error:** Toast: "Kunne ikke sende. Prøv igjen."
- **Tier-gating:** Free + 1 forespørsel brukt → blokk øverst i form: "Du har brukt 1 av 1 free-forespørsler denne mnd. [Oppgrader til Pro →]"
- **Coach offline:** Sub i hero endres til "Anders er borte til {dato}. Du kan fortsatt sende forespørsel — han svarer ved retur."

## Mobile (≤640px)

Sidebar hamburger. Hero-strip kollapser, coach-info-pill går under tittel. Type-kort stables. Dato-tid-felter stables vertikalt.

## Ønsket output fra Claude Design

1. Lyst tema, idle (default valg)
2. Lyst tema, mid-fyllt (1:1, 2 tema-chips, 2 alternativ-tider)
3. Lyst tema, "Helt fleksibel" valgt (dato-felt skjult)
4. Lyst tema, submit-loading
5. Lyst tema, submit success ("Forespørsel sendt")
6. Lyst tema, tier-gating Free-blokk
7. Mørkt tema
8. Mobil ≤640px

## Ikke-mål

- Ikke designe Coach-detalj-skjerm hvor man finner coach (batch 3)
- Ikke designe Coach-meldinger compose (pakke 11)
- Ikke designe coach-side hvor han svarer på forespørselen (egen pakke i CoachHQ)
- Ikke designe Ny-økt-wizard for selvtrening (pakke 9)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
