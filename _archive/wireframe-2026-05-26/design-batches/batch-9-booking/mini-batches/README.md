# Mini-batches for Batch-9 (Booking-flyt)

30 design-pakker delt i 6 mini-batches. Kjør én sesjon per mini-batch i claude.ai/design.

## Rekkefølge og innhold

| Mini-batch | Antall | Innhold | Mønster |
|---|---|---|---|
| **9-A** | 5 | Forside + velgere — Index, Tjenester, Coaches, Coach-detalj, Anlegg | Public entry + kategori-cards + grid-velgere |
| **9-B** | 5 | Kalender + tider + pakke — Anlegg-detalj, Kalender-måned, Kalender-uke, Tider, Pakke | Tids-velging + kalender-grid |
| **9-C** | 5 | Kunde-info + sammendrag — Tillegg, Kunde-eksisterende, Kunde-ny, Spiller-info, Sammendrag | Skjema + bekreft-før-betaling |
| **9-D** | 5 | Betaling + bekreftelse + min side — Betaling, Vipps, Bekreftelse, Min side, Min booking-detalj | Stripe Elements + success + portal-oversikt |
| **9-E** | 5 | Fakturaer + klippekort + feil + rabatt — Fakturaer, Faktura-detalj, Klippekort, Feil betaling, Rabattkode-modal | Kunde-portal liste/detalj + error + modal |
| **9-F** | 5 | Modaler + e-poster — Avbestill, Endre booking, Login-popup, E-post bekreftelse, E-post påminnelse | Modaler + transactional emails |

## Filer per mini-batch

For hver `9-X` finnes 3 filer:

- `9-X.md` — Konsolidert spec (ASCII-sanitised, lastes opp i Claude Design)
- `9-X-prompt.md` — Custom prompt (kopieres inn som første melding i sesjonen)
- `9-X-vedlegg.txt` — Liste over HTML-filer å laste opp som visuelle vedlegg

## Bruk

### Steg 1 — Start ny Claude Design-sesjon per mini-batch

Per mini-batch (start på 9-A først):

1. Åpne `9-A-vedlegg.txt` i editor — gir deg klikkbare filstier
2. Last opp i Claude Design:
   - System-kontekst (engang per session): `branding-style-guide.html` + `design-system-v2.md` + alle 20 fonter fra `for-claude-design/fonts/`
   - Mini-batch-spec: `9-A.md`
   - Alle HTML-vedlegg listet i `9-A-vedlegg.txt`
3. Åpne `9-A-prompt.md`, kopier hele PROMPT-blokken
4. Lim inn som første melding i Claude Design

### Steg 2 — Generer 5 skjermer av gangen

Claude Design genererer alle 5 i ett løp uten avbrudd. Etter ferdigstillelse: samlet oversikt + thumbnails + design-links.

### Steg 3 — Pilot-gate

**9-A er pilot for hele batch-9-mønsteret.** Etter 9-A er ferdig, evaluer:
- Fungerer bulk-rytmen for booking-flyten?
- Holder progress-stripe-konsistens på tvers?
- Er pris-format / dato-format riktig overalt?
- Er public/logged-in-skillet tydelig nok?

Hvis JA → kjør 9-B, 9-C, 9-D, 9-E, 9-F etter samme oppskrift.
Hvis NEI → si fra, juster strategien før neste mini-batch.

## ASCII-sanitised

Alle filene i denne mappen er sanitised (ingen UTF-8-tegn som ae/oe/aa, em-dash, smart quotes, box-drawing) — for å unngå Claude Designs encoding-bug. Norske tegn er erstattet med ae/oe/aa.
