# Batch 9 — Booking-flyt (Arketype G — Wizard / public + logged-in)

**Antall pakker:** 30 (24 hovedsider + 6 modaler/e-poster)
**Status:** Klar for claude.ai/design
**Estimert tid:** 6–9 timer
**Domene:** `booking.akgolf.no`

## Hvorfor denne batchen nå

Booking er den ene flyten som faktisk genererer omsetning for AK Golf Group. Når kunden lander på `booking.akgolf.no` skal hele kjøpet skje uten friksjon — fra "hva slags time" til "betalt og bekreftet" på under 2 minutter for en eksisterende kunde, og under 4 minutter for en ny. Batch 8 (akgolf.no marketing) leverer leads inn i denne trakta. Booking-flyten må derfor være visuelt på linje med marketing — samme designsystem, samme tone — men med en helt egen interaksjonsmodell: lineær wizard, ikke utforskning.

## Arketype G — felles spec (gjelder alle 30 pakker)

Booking er forskjellig fra både CoachHQ/PlayerHQ (logged-in app) og akgolf.no (ren marketing). Dette er en **transaksjons-wizard** som fungerer både public (anonym kunde) og logged-in (eksisterende kunde med klippekort, betalingsmetoder, historikk).

### Layout — public/logged-in hybrid

```
+-------------------------------------------+
|  Top-nav (alltid):                        |
|  AK Golf - Booking          Min side ->   |
+-------------------------------------------+
|  Booking-progress-stripe (steg 1-5):      |
|  [1.Tjeneste] -> [2.Tid] -> [3.Info]      |
|  -> [4.Betaling] -> [5.Bekreftelse]       |
+-------------------------------------------+
|                                           |
|  Hovedinnhold (max-width 600-1000px,      |
|  varierer per steg):                      |
|                                           |
|  - Hero (italic editorial: "Velg tid")    |
|  - Sub-info (mono caps: "Steg 2 av 5")    |
|  - Selve UI for steget                    |
|                                           |
+-------------------------------------------+
|  Footer-actions:                          |
|  [<- Tilbake]              [Fortsett ->]  |
+-------------------------------------------+
```

**INGEN app-sidebar.** Booking har ikke navigasjon utover wizard-flyten + "Min side".

### Top-nav (alltid synlig)

- Venstre: "AK Golf · Booking" (Geist 14px, primary)
- Høyre: "Min side →" (link, åpner login-popup hvis ikke innlogget — pakke 28)

### Booking-progress-stripe

På alle 5 hovedsteg + bekreftelse:

| Steg | Navn | Vises som |
|---|---|---|
| 1 | Tjeneste | Pill (primary hvis aktiv, muted hvis kommende, muted+✓ hvis ferdig) |
| 2 | Tid | Pill |
| 3 | Info | Pill |
| 4 | Betaling | Pill |
| 5 | Bekreftelse | Pill (success-grønn når aktiv) |

Mellom hver pill: muted "→". Stripe-bredde max 1000px, sentrert. På mobil collapser til "Steg 2 av 5" + tynn progress-bar 8px.

### Wizard-flow — én lineær progresjon

- Hvert steg har **én CTA fremover**: "Fortsett →" (primary)
- "← Tilbake" som ghost-knapp
- "Endre" inline ved hver oppsummering på sammendrag-siden (steg 3.5)
- Ingen sidesteg, ingen tabs, ingen sub-navigasjon. Bruker kommer aldri "ut" av flyten før bekreftelse eller eksplisitt avbryt.

### Public + logged-in differensiering

| Element | Anonym | Innlogget |
|---|---|---|
| Top-nav høyre | "Logg inn" → modal | Avatar + navn → Min side |
| Steg 3 (Info) | Skjema (navn, e-post, tlf) | Pre-fylt + "Bytt konto" |
| Betaling | Stripe Elements (kort) eller Vipps | Lagrede metoder + Klippekort-saldo |
| Bekreftelse | "Vil du opprette konto?"-CTA | Kun "Se i Min side →" |
| Min side / fakturaer / klippekort | Ikke tilgjengelig — auth-redirect | Direkte tilgjengelig |

### Top-nav på Min side, fakturaer, klippekort, min-booking-detalj

Samme top-nav, men progress-stripe skjules (det er ikke en wizard, det er kunde-portal).

### Hero-tone (Anti-AI)

- Aldri "Velkommen tilbake, Markus!"
- Bruk **italic Instrument Serif** for nøkkelord:
  - "Book din neste *økt*"
  - "Velg *tjeneste*"
  - "Tirsdag *12. mai 2026*"
  - "Sikker *betaling*"
  - "Booking *bekreftet!*"
- Mono caps for kontekst: "Steg 2 av 5" / "Anders K · Mulligan Indoor · 60 min"

### Mobil-versjon (gjelder hele flyten)

- Progress-stripe collapser til "Steg X av 5" + 8px progress-bar i accent
- Hovedinnhold blir full bredde med 16px padding
- Footer-actions blir sticky-bunn med "Fortsett →" full bredde
- Kort-grids blir 1-kolonne
- Stripe Elements rendrer mobil-optimert (Stripe håndterer dette selv)

### Konkret data — bruk konsekvent

- **Eksempel-dato:** tirsdag 12. mai 2026 09:00–10:00
- **Anonym kunde:** Markus Rønning · markus.ronning@gmail.com · 90 12 34 56
- **Innlogget kunde:** Anders Kristiansen (akgolfgroup@gmail.com)
- **Coach:** Anders K (PGA, Mulligan Indoor)
- **Lokasjoner:** Mulligan Fredrikstad (Stabburveien 7), Bossum GK, GFGK Range
- **Pris-format:** "1 600 kr" (mellomrom som tusenseparator, aldri "1.600" eller "1,600")
- **Booking-nr-format:** `BK-2026-0512-0094`
- **Tider:** 24-timer (`09:00–10:00`, ikke "9 AM")

### Betalings-providers

- **Stripe Elements:** Kort-felt (16-sifret), MM/ÅÅ utløp, CVC (3 sifre), kortholdernavn. Stripe sin egen styling — ikke overstyr — men pakk i `card`-komponenten vår med korrekt border/radius.
- **Vipps:** Telefon-felt (8 sifre, format `XXX XX XXX`), "Send Vipps-betaling →"-CTA i Vipps-orange (`#FF5B24`). Etter klikk: full-screen waiting-state "Åpne Vipps-appen på mobilen din".
- **Faktura (kun B2B / klubb):** EHF-faktura, krever org.nr.

### Success / error states

- **Success (bekreftelse, betalt klippekort):** Lucide `CheckCircle` 48-88px i accent-circle. Stor sentrert. Mono caps over: "BOOKING-NR · BK-...".
- **Error (failed payment, declined card):** Lucide `AlertCircle` 48px i destructive-circle (`rgba(231,76,60,0.12)` bg). "Betalingen ble avvist." + retry-CTA + "Prøv en annen kort →" sub-link.
- **Warning (avbestilling under 24t):** Lucide `AlertTriangle` 24px i amber. Inline i modal.

### E-post-maler (pakke 29 og 30)

- HTML-table-layout (kompatibel med Outlook, Gmail, Apple Mail)
- Max 600px bredde, sentrert
- Inline-styles på alt — ingen `<style>`-blokker
- Web-fonter erstattes med fallback-stack: `'Geist', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`
- Logo: PNG (ikke SVG), 120x40px, sentrert i top-band
- CTA: button rendret som `<a>` med `display: inline-block; padding: 14px 28px; background: #005840; color: #FFFFFF; border-radius: 8px;`
- Bunntekst med adresse, org.nr, avmeldingslenke

---

## Per-skjerm-pakker (30)

### Hovedflyt — wizard (24)

1. `01-booking-index.md` — Booking-forside (3 kategori-cards: Coaching, TrackMan, Junior)
2. `02-booking-tjenester.md` — Tjeneste-velger (8 tjenester, filter)
3. `03-booking-coaches.md` — Coach-velger med tilgjengelighet (grønn/gul/rød prikk)
4. `04-booking-coach-detalj.md` — Coach-detalj for booking (bio, ledige tider neste 7 dager)
5. `05-booking-anlegg.md` — Anlegg-velger med geo-filter (Mulligan Fredrikstad, Bossum, GFGK)
6. `06-booking-anlegg-detalj.md` — Anlegg-detalj (bilder, fasiliteter, åpningstider)
7. `07-booking-kalender-maned.md` — Måneds-kalender (mai 2026, ledige dager)
8. `08-booking-kalender-uke.md` — Uke-kalender (uke 19, 11.–17. mai)
9. `09-booking-tider.md` — Tids-velger (slots for valgt dag, 8 ledige)
10. `10-booking-pakke.md` — Pakke-velger (enkelt 1 600 kr / 5-pakke 7 200 kr / 10-pakke 13 600 kr)
11. `10-booking-pakke.md` håndterer også tilleggstjenester-knytning til pakke (se 11)
12. `11-booking-tillegg.md` — Tilleggstjenester (video-analyse +400, TrackMan +500)
13. `12-booking-kunde-eksisterende.md` — Logged-in kunde (pre-fylt info, "Bytt konto")
14. `13-booking-kunde-ny.md` — Registrering (navn, e-post, tlf, samtykke)
15. `14-booking-spiller-info.md` — Hvem skal spille (deg selv / barn / annen)
16. `15-booking-sammendrag.md` — Pre-betaling sammendrag (alle valg + totalpris + "Endre")
17. `16-booking-betaling.md` — Stripe Elements (kort + CVC + utløp + kortnavn)
18. `17-booking-betaling-vipps.md` — Vipps-flow (telefon + waiting-state)
19. `18-booking-bekreftelse.md` — Success-side (booking-nr, kalender-tillegg, e-post sendt)
20. `19-booking-min-side.md` — Min booking-oversikt (kommende / historiske / fakturaer / klippekort)
21. `20-booking-min-booking-detalj.md` — Per-booking-detalj (alle data + endre/avlys)
22. `21-booking-fakturaer.md` — Faktura-historikk (8 fakturaer, filter på år/status)
23. `22-booking-faktura-detalj.md` — Per-faktura (linjer, MVA, betalingsstatus, last ned PDF)
24. `23-booking-klippekort.md` — Klippekort-saldo (7/10 brukt, transaksjons-historikk)
25. `24-booking-feil-betaling.md` — Failed payment (kort avvist, retry, bytt metode)

### Modaler/e-poster (6)

26. `25-modal-rabattkode.md` — Rabattkode-modal (input + valider + applisert)
27. `26-modal-avbestill.md` — Avbestill-modal (>24t = full refusjon, <24t = 50%)
28. `27-modal-endre-booking.md` — Endre booking (ny tid, samme tjeneste)
29. `28-modal-login-popup.md` — Login-popup (e-post + magic link / Google / Vipps)
30. `29-email-bekreftelse.md` — HTML-mail (bekreftelse rett etter booking)
31. `30-email-paminnelse.md` — HTML-mail (24t påminnelse før økt)

(Pakke 11 er én fil, ikke to — listen over har duplikat for å gjøre nummereringen tydelig. Reell filtelling: 30.)

## Slik bruker du hver pakke

Samme oppskrift som batch 2:

1. Last opp `branding-style-guide.html` + `design-system-v2.md` som system-kontekst (engang per session)
2. Per pakke: åpne `0X-{navn}.md`, last opp tilhørende HTML-wireframe, kopier prompt fra mini-batch-prompt-fil, iterer
3. Lim design-link tilbake til Claude Code

## Mini-batches

Se `mini-batches/README.md`. 6 mini-batches × 5 pakker = 30 totalt:

- **9-A** — pakker 1–5 (forside + velgere)
- **9-B** — pakker 6–10 (kalender + tider + pakke)
- **9-C** — pakker 11–15 (tillegg + kunde + sammendrag)
- **9-D** — pakker 16–20 (betaling + bekreftelse + min side)
- **9-E** — pakker 21–25 (fakturaer + klippekort + feil + rabattkode)
- **9-F** — pakker 26–30 (modaler + e-poster)

## Gate

Alle 30 pakker må være `APPROVED` før Foundation lukker designsystem-fasen og frigir til implementasjon i `akgolf-booking`-repoet.
