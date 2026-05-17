# AK Golf Web — Mega-footer (komponent)

## Identitet

- **Produkt:** Web (komponent som brukes paa alle 30 sider)
- **URL:** N/A (komponent)
- **Arketype:** Web — footer
- **HTML-referanse:** `wireframe/screen-deck/web/footer-mega.html`
- **Audit:** `wireframe/audit/web-footer-mega.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva komponenten er for

Mega-footer er nederst paa alle 30 web-sider. Forste sjanse til navigation
hvis bruker scrollet hele veien. Inkluderer nyhetsbrev-signup, sosiale,
juridisk, og merkevare-beskjeder.

## Layout — UNIKT

### Hovedfooter (#0A1F18 mørkegrønn, 64px padding)

Max-width 1200px, 4 kolonner:

**Kolonne 1 (2fr) — Brand**
- Logo "AK Golf" (Inter Tight bold, hvit)
- Tagline (italic Instrument Serif): *"Tren smartere. Spill bedre."*
- Nyhetsbrev-mini-form:
  - Label: "Faa 1 epost/mnd:"
  - Email-input (mørk variant) + `Abonner →` (lime pill)
- Sosiale ikoner-rad (4 stk, Lucide, hvit/lime hover):
  - Instagram (@akgolfacademy)
  - LinkedIn (Anders Kristiansen)
  - YouTube (AK Golf)
  - X/Twitter (@akgolfgroup)

**Kolonne 2 — Tjenester**
- H4: Tjenester
- 6 lenker:
  - 1:1 coaching
  - Junior Academy
  - Talent-program
  - Voksen-abonnement
  - Bedriftsavtaler
  - Klubb-samarbeid

**Kolonne 3 — Selskap**
- H4: AK Golf
- 7 lenker:
  - Om oss
  - Coaches
  - Anlegg
  - Cases
  - Blogg
  - Karriere
  - Kontakt

**Kolonne 4 — Juridisk**
- H4: Juridisk
- 4 lenker:
  - Personvern
  - Brukervilkar
  - Cookies
  - FAQ

### Bunn-rad (32px padding, border-top rgba white 10%)

Sentrert eller venstre/hoyre:
- Venstre: `(C) 2026 AK Golf Group AS · Org. 920 117 824 · Fredrikstad`
- Hoyre: `Bygget i Fredrikstad. Med kjaerlighet.`

## Klikkbare elementer

| Element | States |
|---|---|
| Logo | default, hover (lime), klikk -> / |
| Footer-link | default, hover (white -> lime), visited |
| Sosial-ikon | default, hover (lime fill) |
| Email-input | default, focus, valid, error |
| Abonner-knapp | default, hover, active, loading, success ("Tusen takk!"), error |

## Empty / loading / error

- **Email valid:** Submit -> button blir spinner -> success-toast eller inline tekst "Sjekk innboksen din"
- **Email error:** Inline rod tekst "Ugyldig epost"
- **Email allerede paameldt:** "Du er allerede paameldt"

## Ønsket output fra Claude Design

1. Mørk mega-footer i full bredde, default state
2. Email-input fokusert med tekst skrevet
3. Mobil <=640px — kolonner stables vertikalt med dividere mellom (1-kol)
4. Tablet 768-1023px — kolonner blir 2x2
5. Submit success-state

## Ikke-mål

- Ikke designe top-nav (egen 29)
- Ikke designe newsletter-signup-modul som standalone (egen 30 — denne er mini-versjonen)

## Når du er ferdig

Lim design-link tilbake.
