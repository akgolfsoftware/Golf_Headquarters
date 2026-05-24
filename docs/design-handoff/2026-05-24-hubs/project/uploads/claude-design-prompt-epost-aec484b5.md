# Claude Design-prompt: HTML e-postmal — AK Golf Academy

**Versjon:** 2.0 — 2026-05-22
**Bruk:** Lim inn denne prompten i Claude Design for å generere HTML-e-postmalen.

---

## Prompt

Design a complete, production-ready **HTML email template** for **AK Golf Academy** — a premium golf coaching brand based in Norway. The aesthetic is clean, confident, and data-driven. Think Scandinavian minimalism meets sports performance. Lots of whitespace. No decorative flourishes. Every element earns its place.

---

### The brand has no logo — build a text lockup

There is no logo file. Design a typographic header lockup:

- Background: `#005840` (deep forest green), full width, 64px tall
- Centered text: `AK GOLF ACADEMY` — uppercase, Inter Tight (fallback: Arial Narrow), 12px, weight 600, letter-spacing 0.14em, color `#D1F843` (lime)
- Below the header: a solid 3px rule in `#D1F843`, full width

This is the brand mark. Simple. Intentional. It should feel like a performance brand, not a golf club.

---

### Color tokens — use these exactly

```
Primary:        #005840   (deep forest green)
Primary hover:  #00472f
Accent:         #D1F843   (lime — use sparingly, maximum impact)
Accent text:    #0A1F18   (on lime backgrounds)
Accent soft:    #ECFCC0   (very light lime, for subtle highlights)

Background:     #FAFAF7   (off-white, warm)
Surface alt:    #F5F2EA   (warm sand — cards, detail blocks)
Card:           #FFFFFF

Ink:            #0A1F18   (body text)
Ink muted:      #5E5C57   (secondary text)
Ink subtle:     #9C9990   (labels, metadata)

Border:         #E5E3DD
Border soft:    #EFEDE6
```

---

### Typography

**Web fonts** (load via `<link>` in `<head>` from Google Fonts — works in Gmail/Apple Mail. Outlook falls back to system fonts):

```html
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

| Use | Font | Fallback | Size | Weight |
|---|---|---|---|---|
| Headline | Inter Tight | Arial Narrow, sans-serif | 22px | 700 |
| Sub-headline | Inter Tight | Arial Narrow, sans-serif | 16px | 600 |
| Body | Inter | Arial, sans-serif | 15px | 400 |
| Labels / metadata | Inter | Arial, sans-serif | 12px | 500 |
| Numbers / data | Inter | Arial, sans-serif | 14px | 500 |

Letter spacing: headlines at `-0.01em`, labels at `0.04em` uppercase.
Line height: body text at `1.6`.

---

### Layout

- **Max width:** 600px, centered on page
- **Outer background:** `#F5F2EA` (warm sand)
- **Inner email card:** `#FFFFFF`, `border-radius: 16px`, shadow: `0 1px 3px rgba(10,31,24,0.06), 0 1px 2px rgba(10,31,24,0.04)`
- **Inner padding:** 40px top/bottom, 40px left/right (desktop) → 24px (mobile, below 480px)
- **Mobile:** full width, stacked, same padding logic

---

### Email zones — exact hierarchy

#### 1. Header band
`#005840` background, 64px height.
Text: `AK GOLF ACADEMY` — uppercase, 12px, weight 600, letter-spacing 0.14em, color `#D1F843`, centered.
Bottom: 3px solid `#D1F843`.

#### 2. Headline
`Inter Tight`, 22px, weight 700, letter-spacing `-0.01em`, color `#0A1F18`.
Top margin: 36px.
Example: *"Booking bekreftet — tirsdag 5. mai kl. 10:00"*

#### 3. Body text
`Inter`, 15px, weight 400, color `#0A1F18`, line-height `1.6`.
Paragraph spacing: 16px.

#### 4. Detail block (booking info)
Rounded card inside the email card. Background `#F5F2EA`, `border-radius: 8px`, `border-left: 3px solid #005840`, padding 16px 20px.
Each row:
- Label: `Inter`, 11px, uppercase, letter-spacing `0.04em`, color `#9C9990` — e.g. "DATO", "TRENER"
- Value: `Inter`, 15px, weight 500, color `#0A1F18` — e.g. "Tirsdag 5. mai"
Rows separated by `1px solid #E5E3DD`.

#### 5. PlayerHQ upsell block
Subtle. Not aggressive. Background `#ECFCC0` (accent soft), `border-radius: 8px`, padding 16px 20px.
Label: `Inter`, 11px, uppercase, letter-spacing `0.04em`, color `#005840` — "SPILLERUTVIKLING"
Headline: `Inter Tight`, 14px, weight 600, color `#0A1F18` — "Vil du få mer ut av treningen?"
Body: `Inter`, 14px, color `#5E5C57`, line-height `1.6`
Link: `Inter`, 14px, weight 500, color `#005840`, no underline, arrow suffix — "Logg inn på PlayerHQ →"

Wrap this block in `<!-- PH-BLOKK START -->` and `<!-- PH-BLOKK END -->` comments.

#### 6. CTA button
Background `#005840`, color `#FFFFFF`, `border-radius: 12px` (not pill), padding `12px 28px`.
Font: `Inter`, 14px, weight 500.
Full-width on mobile (below 480px).
Do NOT use lime as CTA background — only the green primary.

#### 7. Divider + Signature
Divider: `1px solid #E5E3DD`, margin `32px 0`.
Name: `Inter`, 15px, weight 600, color `#0A1F18`
Role/brand: `Inter`, 14px, color `#5E5C57`
Links: `Inter`, 14px, color `#005840`

#### 8. Footer band
Background `#F5F2EA`, top border `1px solid #E5E3DD`, padding 24px 40px.
Text: `Inter`, 12px, color `#9C9990`, centered.
Includes: unsubscribe link, legal line.

---

### Template tokens (dynamic content)

Use `{{token}}` syntax throughout:

| Token | Example |
|---|---|
| `{{fornavn}}` | Markus |
| `{{dato}}` | tirsdag 5. mai |
| `{{klokkeslett}}` | kl. 10:00 |
| `{{fasilitet}}` | Performance Studio, GFGK |
| `{{trener}}` | Anders Kristiansen |
| `{{trener_tlf}}` | +47 XXX XX XXX |
| `{{avbestillingsfrist}}` | mandag 4. mai kl. 10:00 |
| `{{credits_igjen}}` | 1 |
| `{{cta_tekst}}` | Se booking |
| `{{cta_url}}` | https://playerhq.akgolf.no |

---

### Example email to populate the design with

**Zone 2 headline:**
Booking bekreftet — tirsdag 5. mai kl. 10:00

**Zone 3 body:**
Hei Markus,

Din time er bekreftet.

**Zone 4 detail block:**
DATO / Tirsdag 5. mai
KLOKKESLETT / kl. 10:00
STED / Performance Studio, GFGK
TRENER / Anders Kristiansen

Gratis avlysning frem til mandag 4. mai kl. 10:00.

**Zone 5 PlayerHQ block:**
SPILLERUTVIKLING
Vil du få mer ut av treningen?
PlayerHQ samler treningsplanen din, fremgangslogg og direkte kontakt med trener på ett sted.
Logg inn på PlayerHQ →

**Zone 6 CTA:**
Se booking →

**Zone 7 signature:**
Anders Kristiansen / AK Golf Academy
Tlf: +47 XXX XX XXX
akgolf.no | playerhq.akgolf.no

**Zone 8 footer:**
© 2026 AK Golf Group AS · Du mottar denne e-posten fordi du har en aktiv booking.
Avslutt varsler

---

### Technical requirements

- Single complete HTML file, self-contained
- `<!DOCTYPE html>`, `<html lang="no">`, `<meta charset="UTF-8">`, `<meta name="viewport" ...>`
- Google Fonts `<link>` in `<head>` (with MSO conditional comment to hide from Outlook)
- Inline CSS on all elements (no `<style>` except Google Fonts and media query)
- One `<style>` block in `<head>` for: Google Fonts import + `@media (max-width: 480px)` mobile rules only
- MSO conditional comments for Outlook table spacing where needed
- All `src`, `href`, `action` use placeholder absolute URLs (`https://akgolf.no`)
- `alt` text on all `<img>` tags (there should be no images in this template — text only)
- `border="0" cellpadding="0" cellspacing="0"` on all layout tables

**Filename:** `ak-golf-epost-mal.html`
