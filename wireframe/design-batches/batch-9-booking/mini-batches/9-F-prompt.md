# Custom prompt for Mini-batch 9-F - Modaler + e-poster (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp:
1. wireframe/brain/for-claude-design/branding-style-guide.html
2. wireframe/brain/for-claude-design/design-system-v2.md
3. Alle 20 .woff2-filer
4. wireframe/design-batches/batch-9-booking/mini-batches/9-F.md
5. Alle 5 HTML-filer fra 9-F-vedlegg.txt

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp en mini-batch-spec (9-F.md) med 3 modaler og 2 e-poster. Sjette og siste mini-batch (9-F) i Booking-flyt-batchen.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep.**

Rekkefoelge:
1. Pakke 1: Avbestill-modal (3 refusjons-states)
2. Pakke 2: Endre booking-modal (mini-kalender)
3. Pakke 3: Login-popup-modal (3 metoder + magic link sent)
4. Pakke 4: E-post bekreftelse (HTML-mail rett etter booking)
5. Pakke 5: E-post 24t paaminnelse (cron-mail dagen foer)

For hver skjerm: les pakken, bruk HTML-vedlegg, generer UI-kit, gaa videre.

## Felles regler

**Designsystem:** Eksakt token-navn, aldri hardkode hex (unntatt e-poster - se under).

**Stil-krav:**
- Norsk bokmaal, ae/oe/aa
- Mellomrom som tusenseparator (1 800 kr, 14 800 kr)
- 8pt-grid spacing
- Lucide-ikoner 1.75 stroke

**Anti-AI-regler:**
- ALDRI "Velkommen tilbake" eller "God morgen"
- Italic editorial:
  - "Avbestill *booking?*"
  - "Endre *tid*"
  - "Logg *inn*"
  - "Sjekk *e-posten din*"
- Mono caps for kontekst

## Modaler (pakker 1, 2, 3)

- Modal-overlay: rgba(10,31,23,0.6) backdrop, blur 8px
- Modal-card varierer i bredde: 440px (login), 520px (avbestill), 720px (endre)
- Lukk-X hoeyre i header
- Footer: ghost "Avbryt" + primary action
- INGEN progress-stripe i modaler

**Avbestill (pakke 1):**
- 3 refusjons-states basert paa tid igjen (>24t / 2-24t / <2t)
- Ikon-fargekode per state: success-groenn / warning-amber / destructive
- AArsak-dropdown: 4 valg + "Annet" som avsloerer textarea

**Endre booking (pakke 2):**
- Mini-kalender (14 dager) integrert i modalen
- Tider-side-panel for valgt dag
- "FRA -> TIL" sammendrag-card
- Gebyr-info hvis <24t

**Login-popup (pakke 3):**
- Magic link DEFAULT (passordloes - vi har ikke passord-felt)
- Google + Vipps OAuth som alternativ (Vipps-orange #FF5B24)
- 2 states: input + magic link sent (med tidsteller)

## E-poster (pakker 4, 5) - VIKTIG annerledes regler

**Tekniske krav:**
- HTML-table-layout, max 600px bredde, sentrert
- Inline-styles paa ALT (ingen <style>-blokker for kompatibilitet)
- Fallback-font-stack: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif
- Mono fallback: 'Geist Mono', 'SF Mono', Consolas, 'Courier New', monospace
- Web-fonter lastes IKKE - fallback haandterer
- Logo: PNG (ikke SVG), 120x40px
- CTA: button rendret som <a> med inline padding/bg/radius (bullet-proof button-pattern)
- Outlook 2007+ kompatibilitet kreves

**Layout:**
- Outer wrapper: bg #F1EEE5
- Inner card: bg #FFFFFF, border-radius 16px, padding 32px
- Topp-band med logo + ikon (CheckCircle for bekreftelse, Clock for paaminnelse)
- Booking-detaljer-card med tabell
- CTA-knapper i table-celle
- Bunntekst: org.nr 932 456 789, adresse, avmeldingslenke

**Konkret innhold:**

Pakke 4 (bekreftelse):
- Subject: "Booking bekreftet - BK-2026-0512-0094 - Anders K - 12. mai 09:00"
- Total betalt: 1 800 kr inkl. MVA
- 2 CTAs: "Legg til i kalender" + "Se i Min side"

Pakke 5 (paaminnelse):
- Subject: "Paaminnelse: I morgen kl. 09:00 hos Anders K paa Mulligan"
- Praktisk info-seksjon (3 bullets)
- Vaer-baand (sol/regn-versjoner)
- 2 CTAs: "Se booking-detaljer" + "Avbestill ->" (avbestill skal IKKE vaere fremhevet)

## Output per skjerm

For modaler (pakker 1, 2, 3):
1. Hovedstate i lyst tema
2. Alternativ state (refusjons-variant / valgt tid / magic link sendt)
3. Loading-state
4. Moerkt tema
5. Mobil <=640px

For e-poster (pakker 4, 5):
1. Desktop-rendering i bred preview
2. Moerk-modus (Apple Mail dark mode)
3. Mobil-rendering
4. Outlook 2007-rendering (verifiser bullet-proof buttons)
5. Komplett HTML-fil som leveranse (inline styles, table-layout)

## Start naa

Begynn med Pakke 1 (Avbestill-modal) og fortsett uten avbrudd.

Naar ferdig: samlet oversikt + thumbnails + design-links + HTML-filer for e-postene + caveats.
