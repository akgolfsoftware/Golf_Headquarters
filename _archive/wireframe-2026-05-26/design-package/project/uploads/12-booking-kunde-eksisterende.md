# AK Golf Platform — Booking — Kunde (eksisterende, innlogget)

## Identitet

- **Produkt:** Booking
- **URL:** `/info` (innlogget variant)
- **Arketype:** G — Wizard / steg 3 av 5 (info-eksisterende)
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/kunde-eksisterende.html`
- **Audit:** `wireframe/audit/booking-kunde-eksisterende.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Når en innlogget kunde går gjennom booking-flyten, hopper vi over registreringsskjemaet. I stedet ser de en "Du er pålogget som"-card med pre-fylt info, mulighet til å oppdatere telefon/e-post for denne bookingen, og "Bytt konto" hvis de vil booke for noen andre.

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec. Progress-stripe: "3. Info" (primary).

- **Hero:** Mono "STEG 3 AV 5" + H1 "Din *info*"
- **Konto-card:**
  - Avatar 64px (initialer på primary bg)
  - Navn "Anders Kristiansen" (Instrument Serif 20px)
  - E-post + telefon (mono caps muted)
  - "Bytt konto →" link höyre
- **Oppdater for denne bookingen-card:**
  - Toggle "Bruk annen kontaktinfo for denne bookingen"
  - Hvis på: 2 felt (e-post, telefon) som overstyrer for denne bookingen
- **Samtykker (pre-haket for eksisterende):**
  - Checkbox "Aksepterer kjøps- og avbestillingsvilkår" (krav, allerede haket)
  - Checkbox "Send påminnelse 24 t før via SMS" (default på)
  - Checkbox "Ja takk til nyhetsbrev" (default av)
- **Footer-actions:** "← Tilbake" + "Fortsett til betaling →" (primary)

## Konkret data

- Navn: Anders Kristiansen
- E-post: akgolfgroup@gmail.com
- Telefon: 90 12 34 56

## Klikkbare elementer

| Element | States |
|---|---|
| "Bytt konto →" | klikk → log-out + redirect til 13-kunde-ny |
| Toggle "Bruk annen info" | av (default), på (avslører 2 felt) |
| Checkbox samtykke | uhaket, haket, disabled (krav) |
| "Fortsett →" | default, hover, active, disabled (kun hvis krav-samtykke uhaket) |

## Empty / loading / error

- **Loading:** Skeleton konto-card
- **Error (token utløpt midt i flyten):** Auto-redirect til login-popup, behold booking-state i session

## Ønsket output fra Claude Design

1. Lyst tema, default (toggle av, alle samtykker default)
2. Mørkt tema
3. Toggle "Bruk annen info" på, viser 2 felt
4. Hover på "Bytt konto →"
5. Mobil ≤640px — full bredde

## Ikke-mål

- Ikke designe registreringsskjema (pakke 13)
- Ikke designe spiller-info (pakke 14)
- Ikke designe profil-redigering (egen Min side-batch)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
