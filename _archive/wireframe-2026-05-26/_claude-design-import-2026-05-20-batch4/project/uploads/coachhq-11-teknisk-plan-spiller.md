# CoachHQ — Teknisk plan per spiller (side)

**Rute:** `/admin/teknisk-plan/[spillerId]`.

## Kontekst
Anders har en teknisk langtidsplan for Markus (12 mnd) som er separat fra ukeplanen. Inneholder mål per fasevariabel (grep, holdning, sving-plan).

## Formål
- Vise teknisk roadmap over 12 måneder
- Markere milepæler oppnådd
- Tilkoble video-bibliotek (referansevideoer)

## Layout

**Header:**
- "Teknisk plan · Markus" Inter Tight 700 28px
- "Aug 2025 → Aug 2026 · 4 av 12 milepæler nådd" mono

**Roadmap (horisontal tidslinje):**
12 måneds-kolonner, hver med stack av milepæler:
- Lime lukket sirkel = oppnådd
- Forest tom sirkel = pågående
- Muted ring = fremtidig
- Klikk milepæl: drawer med detalj + video-referanser

**Tekniske områder (4 panel):**
- Grep & holdning (status: SOLID lime pill)
- Bakslag (PÅGÅR forest)
- Nedsving (PÅGÅR forest)
- Korsspill (LØST lime)

Hvert panel:
- Beskrivelse av nåværende status
- Sist video-analyse-dato
- "Logg ny observasjon"-knapp
- Tilknyttede drills (lenker)

**Video-bibliotek:**
Mini-grid med 4 thumbnails — referansevideoer Anders har lagt opp for Markus.

**Bunn:**
"Eksporter plan" + "Send til Markus" knapper

## Branding
Cream bg, hvit roadmap-bg, lime/forest milepæl-sirkler, mono i datoer.
