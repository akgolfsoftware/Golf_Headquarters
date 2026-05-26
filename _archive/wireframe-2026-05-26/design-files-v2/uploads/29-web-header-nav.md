# AK Golf Web — Header / top-nav (komponent)

## Identitet

- **Produkt:** Web (komponent som brukes paa alle 30 sider)
- **URL:** N/A (komponent)
- **Arketype:** Web — sticky top-nav
- **HTML-referanse:** `wireframe/screen-deck/web/header-nav.html`
- **Audit:** `wireframe/audit/web-header-nav.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva komponenten er for

Sticky top-nav som er paa alle 30 sider. Hvit bakgrunn, sticky etter scroll
(med lett skygge for separation). Mobile collapser til burger-menu.

## Layout — UNIKT

### Desktop top-nav (64px hoyde, hvit bg, border-bottom)

Max-width 1200px, padding 16px 48px, layout: justify-between med 3 omrader:

**Venstre — Logo**
- Tekst-logo "AK Golf" (Inter Tight 700, 18px, sort #0A1F18)
- Klikk -> /

**Midt — Hovedmeny (7 lenker, gap 32px)**
- Om
- Tjenester (med dropdown? dropdown-menu hvis hover)
- Coaches
- Anlegg
- Priser
- Blogg
- Kontakt

Inter 14px medium, sort default, hover -> primary mørkegrønn #005840.
Active page (current URL): underline 2px lime nederst.

**Hoyre — CTA-omrade**
- "Logg inn" (text-link, 14px) -> /login
- "Kom i gang →" (primary mørkegrønn pill, 10px 20px padding, rounded-12) -> /kontakt

### Tjenester-dropdown (hover)

Når hover over "Tjenester": full-width dropdown-meny (160px hoyde) med:
- 8 tjenester i grid-4 (1:1, Junior, Talent, Voksen, Bedrift, Klubb, TrackMan, Camps)
- Hver med ikon + navn + 1-linje sub

Lukkes naar mus forlater både link og menu.

### Sticky-state (etter scroll > 80px)

Skygge: 0 2px 12px rgba(0,0,0,0.06)
Hoyde: krymper fra 64px til 56px
Logo og lenker beholder samme stil

### Mobile (<= 768px)

Logo venstre + burger-knapp (Lucide Menu) hoyre.

**Drawer (slide-in fra hoyre, 320px bredde):**
- X-knapp toppen
- Logo
- Vertical menu (alle 7 lenker stacket)
- Divider
- "Logg inn" (text-link)
- "Kom i gang →" (CTA full bredde)
- Bunn: sosiale ikoner

## Klikkbare elementer

| Element | States |
|---|---|
| Logo | default, hover (subtle scale), klikk |
| Nav-link | default, hover (primary), active page (underline lime) |
| Tjenester-dropdown | closed, hover (open), item-hover, klikk |
| "Logg inn" | default, hover (primary) |
| "Kom i gang" | default, hover (lift + skygge), active, focus |
| Burger-knapp (mobil) | closed, open (X) |
| Drawer | closed, opening (animation), open, closing |
| Drawer-overlay | klikk -> lukker drawer |

## Empty / loading / error

Statisk komponent.

## Ønsket output fra Claude Design

1. Desktop top-nav (default, ikke scrollet) — paa /tjenester (active)
2. Desktop top-nav (sticky-state, scrollet)
3. Tjenester-dropdown apen
4. Mobile (640px) — burger closed
5. Mobile drawer apen
6. Hover paa "Kom i gang"

## Ikke-mål

- Ikke designe app-sidebar — det er PlayerHQ/CoachHQ som har sidebar
- Ikke include sok-felt i nav (sok ligger paa /faq og /blogg)
- Ikke include language-switcher (kun norsk per naa)

## Når du er ferdig

Lim design-link tilbake.
