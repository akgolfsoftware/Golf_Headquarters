# AK Golf Platform — Booking — RabattkodeModal

## Identitet

- **Produkt:** Booking (modal)
- **Åpnes fra:** 15-booking-sammendrag ("Har du en rabattkode? →")
- **Arketype:** Modal — input + valider
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/modals/rabattkode.html`
- **Audit:** `wireframe/audit/booking-modal-rabattkode.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva modalen er for

Lett modal hvor kunden skriver inn rabattkode (alfanumerisk, 4–16 tegn), klikker "Sjekk →", og enten ser "Rabatt applisert" (success) eller "Ugyldig kode" (error). Etter success: modal lukker automatisk, sammendrag oppdateres med rabatt-linje.

## Layout — UNIKT for denne modalen

- **Modal-overlay:** rgba(10,31,23,0.6) backdrop, blur 8px
- **Modal-card:** Max 480px bredde, sentrert, padding 32px
- **Header:**
  - H2 "Rabatt*kode*" (italic på "kode")
  - Sub: "Skriv inn koden du har fått."
  - Lukk-X höyre
- **Input-card:**
  - Stort input-felt (Geist Mono 18px, uppercase auto): placeholder "VAR2026"
  - "Sjekk →" knapp inni feltet (höyre)
- **Resultater (vises etter sjekk):**
  - **Success:** Lucide CheckCircle lime + "Rabatt applisert: 200 kr" + auto-lukk etter 1 sek
  - **Error:** Lucide XCircle destructive + "Ugyldig kode. Prøv en annen."
  - **Expired:** Lucide AlertCircle warning + "Koden har utløpt"
- **Footer-info:** "Vi godtar én rabattkode per booking."

## Eksempel-koder

- `VAR2026` — gyldig, 200 kr rabatt
- `JUNIOR15` — gyldig, 15 % rabatt på junior-tjenester
- `EXPIRED` — utløpt
- `XYZ123` — ugyldig

## Klikkbare elementer

| Element | States |
|---|---|
| Input-felt | default, focus, filled, valid (success border), invalid (destructive border) |
| "Sjekk →" | default, hover, active, loading (spinner), disabled (tomt) |
| Lukk-X | default, hover |

## Empty / loading / error

- **Loading:** "Sjekk →" viser spinner
- **Error:** Inline destructive bånd
- **Network error:** "Kunne ikke validere. Prøv igjen."

## Ønsket output fra Claude Design

1. Default state (tom input, "Sjekk →"-knapp)
2. Filled state ("VAR2026" skrevet inn, klar til sjekk)
3. Success-state (rabatt applisert, lime banner)
4. Error-state (ugyldig kode, destructive banner)
5. Mørkt tema (default)
6. Mobil ≤640px — modal full bredde med 16px gap fra kanter

## Ikke-mål

- Ikke designe rabatt-CRUD i admin
- Ikke designe sammendrag-oppdatering (det skjer i pakke 15)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
