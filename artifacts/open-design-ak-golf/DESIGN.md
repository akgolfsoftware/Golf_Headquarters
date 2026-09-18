---
version: alpha
name: AK Golf Academy
description: Athletic intelligence. Paper-coloured ink-on-sand for AgencyOS, PlayerHQ and the public site. Locked until 18 December 2026.
colors:
  bg: "#e6e3dd"
  bgSoft: "#faf8f3"
  bgQuiet: "#f1eee8"
  raised: "#ffffff"
  ink: "#141413"
  inkSoft: "#2a2926"
  muted: "#6b6862"
  mutedSoft: "#8a8680"
  accent: "#9b2415"
  accentHover: "#d81e20"
  warn: "#8a6a12"
  info: "#1d3557"
  border: "#ddd9d1"
typography:
  display:
    fontFamily: Oswald
    fontSize: 29px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.01em
  body:
    fontFamily: Archivo
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.45
  meta:
    fontFamily: IBM Plex Mono
    fontSize: 11px
    fontWeight: 400
    letterSpacing: 0.02em
  kicker:
    fontFamily: Oswald
    fontSize: 11px
    fontWeight: 600
    letterSpacing: 0.11em
rounded:
  sm: 2px
  md: 2px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    minHeight: 44px
  button-ghost:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    minHeight: 44px
---

# AK Golf Academy — Open Design

Genre: **athletic intelligence**. One law for AgencyOS, PlayerHQ, AK Golf HQ and the public site. This file is the system. Screens live in a **separate project**.

Locked until **18. desember 2026**. Do not invent a new palette, type, nav or voice.

## Overview

Paper, not chrome. Sand surfaces, graphite ink, one rust action. Type on paper pulled over photography — never type on a scrim in the app, and on the web only as a sand panel with a 4px rust edge over a full-brightness photo.

Coaching is the business. Player HQ is the product. The academy is the tightest track. Norwegian UI. The system authors; a human approves. Status is a sentence. Empty is `—`, never `0`. «Lagret» is not «delt».

Three apps, one law:

- **AgencyOS** — coach desktop. Rail 236 / icon-rail 64 / inspector 372. Nine destinations.
- **PlayerHQ** — athlete phone. Four tabs. Live is a dark focus surface, not a tab.
- **AK Golf HQ** — same shell as AgencyOS with its own home.

Team Norway (Claw) and WANG are **sibling systems**. Never mix their colours here.

## Colors

| Role | Hex | Use |
|---|---|---|
| Page | `#e6e3dd` | Canvas behind the card |
| Flat | `#faf8f3` | Main surface |
| Sunken | `#f1eee8` | Rail, chips |
| Raised | `#ffffff` | Panels |
| Ink 900–400 | `#141413` `#2a2926` `#46443f` `#6b6862` `#8a8680` | No pure black |
| Action | `#9b2415` hover `#d81e20` | Only action colour |
| Warn | `#8a6a12` | Warning only |
| Info / link | `#1d3557` | Links and info only |

No green, purple, gradient, Claw, or WANG. Amber is never success. Green is never status.

## Typography

Oswald display · Archivo body · IBM Plex Mono meta.

Scale only: `10 11 13 14 15 17 21 26 29 40`. No other sizes in apps. Marketing may use `--fs-mkt-*` on the **public site only**.

Kickers: uppercase, tracking 0.08–0.14em. Titles: sentence case in Norwegian («Treningsplan uke 38»), never Title Case.

Load fonts from Google: Oswald, Archivo, IBM Plex Mono.

## Layout

4/8 grid. Breakpoints **390 / 834 / 1440**. iPad is its own layout, not shrunk desktop.

- Rail 236px desktop, 64px iPad, none on phone
- Inspector 372px column, sheet on phone — never percent
- Top bar 56px, tab bar 56px, hit target ≥ 44px
- Radius 2px
- Gutters 16 / 24 / 32

AgencyOS destinations (exactly nine): Hjem · Stall · Kalender · Workbench · Innboks · Godkjenninger · AgenticOS · Analyse · Oppsett.

PlayerHQ tabs (exactly four): I dag · Plan · Analyse · Meg.

## Elevation & Depth

Hairline borders `#ddd9d1`. Soft raise `0 1px 0 rgba(20,20,19,.05)`. Sheet `0 -8px 32px rgba(20,20,19,.16)`. Focus ring graphite 2px offset on sand. No drop shadows on photos. No glass.

## Shapes

Radius 2px everywhere in the app. Pills only for filter chips. No 999px primary buttons. No cards with 16px radius.

## Components

Must-use names (do not invent aliases):

`BtnPrimary` `BtnGhost` `BtnDanger` `BtnIcon` `Kicker` `Title` `Lead` `Panel` `Card` `Metric` `TableRow` `Rail` `TopBar` `Inspector` `TabBar` `Status` `EmptyState` `LoadingState` `ErrorState` `AccessState`

Marketing (web/social only — never inside apps): `SiteNav` `Hero` `SectionHead` `PhotoBlock` `QuoteBlock` `PriceCard` `CoachCard` `CTABand` `SiteFooter`.

Primary = rust fill, white text. Ghost = raised, ink, 1px border. Danger = ghost + rust text. Status is always words + colour.

## Motion

150–250ms ease-out (`cubic-bezier(.23,1,.32,1)`). Press `scale(0.97)`. No `scale(0)`, shimmer, bounce, particles, grain, custom cursor, scroll-jack. Hover only under `(hover:hover) and (pointer:fine)`.

## Voice

Norwegian bokmål in the UI. English only in code and this file’s headings. Status examples:

- `Venter på godkjenning fra trener`
- `Lagret 08:41 — ikke delt`
- `Planen ble ikke lagret. Tilkoblingen falt ut. Ingenting er delt.`

Never `Pending`, never a lone yellow dot, never `Error 403`.

## Do's and Don'ts

**Do**

- One rust element per view
- Type on paper
- 390 and 1440 for every unique pattern
- Empty states as a sentence
- System drafts, human confirms

**Don't**

- Redraw the `ak` mark
- Invert a colour lockup (the red dot becomes cyan)
- Put photography behind app UI
- Use `--fs-mkt-*` inside AgencyOS / PlayerHQ
- Draw Hjem, Stall, Workbench, Live, Team Norway or WANG **inside this system** — those belong in a consuming project
- Restore `academy-40` (person left). Hold `academy-08/09/39/42` until cleared
- Invent prices, stats, names
- Mix Team Norway or WANG tokens
