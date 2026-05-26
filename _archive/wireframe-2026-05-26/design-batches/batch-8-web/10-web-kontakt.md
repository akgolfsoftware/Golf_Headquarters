# AK Golf Web — Kontakt

## Identitet

- **Produkt:** Web
- **URL:** `/kontakt`
- **Arketype:** Web — split-form (info venstre + form hoyre)
- **HTML-referanse:** `wireframe/screen-deck/web/kontakt.html`
- **Audit:** `wireframe/audit/web-kontakt.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Kontaktsiden er primaer konverteringsside for nye kunder. Form sender
direkte til Anders + auto-respons "Vi ringer innen 24 timer". Avoid
overwhelm — bare 5 felt.

## Layout — UNIKT

### 1. Subhero (#0A1F18 gradient, 80px)

- Eyebrow: `KONTAKT`
- H1: `La oss *snakke*.`
- Sub: `Vi svarer innen 24 timer. Ofte mye raskere.`

### 2. Split-seksjon (lys, 96px, asymmetrisk 40/60)

**Venstre (40%) — kontakt-info:**

3 metoder med ikon (Lucide):
- **Telefon** (Phone, 24px) — `+47 482 35 700` — Anders, hverdager 09:00-17:00
- **Epost** (Mail) — `hei@akgolf.no` — Svar innen 24 timer
- **Besok oss** (MapPin) — Storgata 12, 1607 Fredrikstad — Aapent 09:00-22:00

Sosiale (under):
- Instagram (@akgolfacademy)
- LinkedIn (Anders Kristiansen)
- YouTube (AK Golf)

**Hoyre (60%) — kontaktskjema:**

5 felt:
- Navn (text, required)
- Epost (email, required)
- Telefon (tel, optional)
- Hva er du interessert i? (select):
  - 1:1 coaching
  - Junior Academy
  - Talent-program
  - Voksen-abonnement
  - Bedriftsavtale
  - Klubb-samarbeid
  - Annet
- Melding (textarea, optional, 4 rader)

Submit-knapp: `Send melding →` (lime pill, full bredde)
Sub: `Vi behandler kontakten din i henhold til personvernreglene. Ingen spam.`

### 3. FAQ-snarveier (lys-sand, 64px)

`Mange spor om dette:`
4 quick-cards:
- `Pris pa 1:1-coaching?` -> /priser
- `Hvor er Mulligan?` -> /anlegg/mulligan-indoor
- `Junior-priser?` -> /tjenester/junior
- `Bedriftsavtale-detaljer?` -> /for-bedrifter

### 4. Mega-footer

## Klikkbare elementer

| Element | States |
|---|---|
| Telefon-link | default, hover (lime), klikk -> tel: |
| Epost-link | default, hover, klikk -> mailto: |
| Sosiale-ikoner | default, hover (lime fill) |
| Form-felt | default, focus (lime ring), filled, error (rod ring + tekst) |
| Select dropdown | default, focus, open, item-hover |
| Submit-knapp | default, hover, active, loading (spinner), disabled, success-state |
| FAQ-snarvei-card | default, hover (lift) |

## Empty / loading / error

- **Form validation error:** Inline rod tekst under felt: `Vennligst skriv inn epost`
- **Form loading:** Submit blir `Sender...` med spinner
- **Form success:** Hele form-omrade erstattes med success-card:
  - Lucide CheckCircle2 lime
  - H3: `Takk! Vi har mottatt meldingen din.`
  - Sub: `Vi ringer eller mailer innen 24 timer.`
  - CTA: `Tilbake til forsiden →`
- **Form server-error:** Toast `Noe gikk galt. Proev igjen eller ring 482 35 700.`

## Ønsket output fra Claude Design

1. Full side i lyst tema (default)
2. Form med ett felt fokusert (Epost)
3. Form-error-state (Epost ugyldig)
4. Form success-state
5. Mobil <=640px — split blir stack (info over form)

## Ikke-mål

- Ikke include kalender-widget for direkte booking
- Ikke include chat-widget (egen Intercom-integrasjon)

## Når du er ferdig

Lim design-link tilbake.
