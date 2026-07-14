# AK Golf HQ — Master "Hjernen" for Treningsplanlegging, Analyse og Utvikling (Oppdatert 2026-07-07)

> **OBS:** Dette er Markdown-versjonen. Den autoritative, interaktive versjonen for gjennomgang finnes nå i:
> **docs/hjernen-gjennomgang.html** (selvstendig, med TOC, contenteditable, Godkjenn-knapper og eksport).

## 1. TrackMan-opplasting + integrasjon med teknisk plan (P-system)

**Nåværende tilstand:**
- CSV full loop, HTML kun rådata (ufullstendig).
- Match kun på club.
- Begrenset metrics i goals (ingen consecutive).
- Ingen per-kølle bank, ingen AI (PDF/bilde), begrenset filtrering.

**Mål (godkjent retning):**
- AI-drevet upload (PDF/CSV/bilde fra skjerm).
- Full parameter support + filtrering.
- Parameter-mål i teknisk plan (f.eks. 10 consecutive face angle <2°).
- Per-kølle TM-bank.
- Range/matte-repetisjon modus + live validering.
- Toveis loop via Workbench (spiller + coach).

P1.0–P10.0 kun for fullsving. Nærspill/putting bruker områder (taxonomy).

Se detaljert implementeringsplan og kritiske filer i `docs/hjernen-gjennomgang.html#trackman`.

## 2–9. Resterende innhold

Fullt innhold (PlayerHQ flows, AgencyOS faktiske + potensielle funksjoner, Booking optimalisering, Navigasjon, Ordbok, AI-agent, Data gaps, Godkjenningsmekanisme) er nå tilgjengelig og redigerbart i den interaktive HTML-filen.

**Anbefalt arbeidsflyt:**
1. Åpne `docs/hjernen-gjennomgang.html` i browser.
2. Gå gjennom seksjoner, rediger tekst direkte.
3. Bruk «GODKJENN SEKSJON» + «GODKJENN ALT».
4. Eksporter godkjent status (JSON).
5. Bruk eksportert tilstand som input for neste implementeringsbølge.

Dette dokumentet (md) holdes synkronisert med HTML-en etter godkjenning.
