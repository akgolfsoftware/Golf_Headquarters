# Claude Design-prompt: E-postmal AK Golf Academy

**Bruk:** Lim inn denne prompten i Claude Design for å generere HTML-e-postmalen.

---

## Prompt

Design an HTML email template for **AK Golf Academy** — a premium golf coaching brand. The template should be clean, modern, and mobile-first. Below are exact specifications.

---

### Brand Identity

**Primary color:** `#005840` (deep forest green)
**Accent color:** `#D1F843` (lime yellow-green)
**Accent text color:** `#0A1F18` (near-black, used on accent backgrounds)
**Background:** `#FAFAF7` (off-white, warm)
**Surface / card:** `#FFFFFF`
**Body text:** `#0A1F18`
**Secondary text:** `#5E5C57`
**Border:** `#E5E3DD`

**Typography:**
- Headlines: `Inter Tight`, fallback: `Arial Narrow, sans-serif`
- Body text: `Inter`, fallback: `Arial, sans-serif`
- All body text: 15px, line-height 1.6

**Voice:** Professional, warm, precise. No exclamation marks in headings. No emojis. Short sentences.

**Logo:** AK Golf Academy — text-based. "AK GOLF ACADEMY" in Inter Tight, uppercase, `#005840`, letter-spacing 0.1em.

---

### Layout Specifications

**Max width:** 600px, centered
**Mobile breakpoint:** 480px (full-width, stacked)
**Outer background:** `#F5F2EA` (warm sand)
**Inner card background:** `#FFFFFF`
**Border radius on card:** 16px
**Padding inside card:** 40px top/bottom, 48px left/right (desktop), 24px (mobile)

---

### Email Zones (top to bottom)

#### Zone 1 — Header
- Background: `#005840`
- Height: 72px
- Logo: "AK GOLF ACADEMY" centered, `#D1F843`, Inter Tight, 14px, uppercase, letter-spacing 0.12em
- Thin accent bar below header: 3px solid `#D1F843`

#### Zone 2 — Subject / Headline
- Font: Inter Tight, 24px, weight 700, color `#0A1F18`, letter-spacing -0.01em
- Top padding: 40px
- Example text: "Booking bekreftet — tirsdag 5. mai kl. 10:00"

#### Zone 3 — Body text
- Font: Inter, 15px, weight 400, color `#0A1F18`, line-height 1.6
- Paragraph spacing: 16px
- Detail list (when included): styled as a clean card with `#F5F2EA` background, 16px padding, 8px border-radius, border-left: 3px solid `#005840`
  - Label in Inter, 12px, uppercase, letter-spacing 0.04em, color `#5E5C57`
  - Value in Inter, 15px, weight 500, color `#0A1F18`

#### Zone 4 — PlayerHQ Upsell Block
- Background: `#F5F2EA`
- Border-left: 4px solid `#D1F843`
- Border-radius: 8px
- Padding: 16px 20px
- Heading: "Vil du få mer ut av treningen?", Inter Tight, 14px, weight 600, color `#005840`
- Body: Inter, 14px, color `#5E5C57`, line-height 1.6
- Link: "Logg inn på PlayerHQ →", Inter, 14px, weight 500, color `#005840`, underlined

#### Zone 5 — CTA Button
- Background: `#005840`
- Text: `#D1F843`, Inter Tight, 15px, weight 600, letter-spacing 0.02em
- Border-radius: 100px (pill)
- Padding: 14px 32px
- Hover state (if supported): background `#00472f`
- Full-width on mobile

#### Zone 6 — Signature
- Divider: 1px solid `#E5E3DD`, margin 32px 0
- Name: Inter, 15px, weight 600, color `#0A1F18`
- Title/brand: Inter, 14px, color `#5E5C57`
- Links: Inter, 14px, color `#005840`

#### Zone 7 — Footer
- Background: `#F5F2EA`
- Text: Inter, 12px, color `#9C9990`, text-align center
- Unsubscribe link: same style
- Legal: "© 2026 AK Golf Group AS. Org.nr 920 XXX XXX."
- Top border: 1px solid `#E5E3DD`

---

### Example Email Content (use this to populate the design)

**Subject:** Booking bekreftet — tirsdag 5. mai kl. 10:00

**Body:**

Hei Markus,

Din time er bekreftet.

**Dato:** Tirsdag 5. mai
**Klokkeslett:** kl. 10:00
**Sted:** Performance Studio, GFGK
**Trener:** Anders Kristiansen

Gratis avlysning frem til mandag 4. mai kl. 10:00. Etter dette belastes timen som brukt.

*[PlayerHQ-blokk]*

**[KNAPP] Se booking →**

Med vennlig hilsen,
Anders Kristiansen / AK Golf Academy
Tlf: +47 XXX XX XXX
akgolf.no | playerhq.akgolf.no

---

### Technical Requirements

- HTML email compatible (Outlook 2016+, Gmail, Apple Mail, iOS Mail)
- Inline CSS only (no `<style>` blocks for client compatibility)
- Media query in `<head>` for mobile breakpoint (480px)
- All images must have `alt` text
- No web fonts via `@import` — use system fallbacks
- Tested safe fonts only: Arial, Arial Narrow, Georgia
- All links must be absolute URLs (placeholder: `https://akgolf.no`)
- Include `<!DOCTYPE html>`, `<html lang="no">`, proper `<meta>` tags
- `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- `<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">`
- Include MSO conditional comments for Outlook spacing

---

### Deliverable

Produce a single, complete, self-contained HTML file.
Name: `ak-golf-epost-mal.html`

The template should use `{{placeholder}}` tokens for dynamic content matching this list:
- `{{fornavn}}`, `{{dato}}`, `{{klokkeslett}}`, `{{fasilitet}}`, `{{trener}}`, `{{trener_tlf}}`, `{{avbestillingsfrist}}`, `{{cta_url}}`, `{{cta_tekst}}`

The PlayerHQ upsell block should be wrapped in `<!-- PH-BLOKK START -->` and `<!-- PH-BLOKK END -->` comments so it can be conditionally included per email type.
