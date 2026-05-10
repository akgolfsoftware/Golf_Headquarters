# AK Golf Platform — Designsystem v2

**Dette dokumentet lastes opp som system-kontekst i hver claude.ai/design-session.**

Det er den enkle, autoritative kilden til designsystemet. Endres aldri uten eksplisitt beslutning. Når du designer en skjerm, skal **alle** farger, fonter, spacing og radius hentes fra dette dokumentet — aldri hardkodes.

---

## 1. Identitet

AK Golf er en norsk coaching-plattform for golf. Estetisk: **editorial luxury, ikke generisk AI-dashboard**. Asymmetrisk bento-grid, ett hero-element, sjelden bruk av lime-accent, italic display-overskrifter.

**Anti-AI-regler:**
- ALDRI 3×1 eller 4×1 uniform grid
- ALDRI flat avatar-row som primærmønster
- ALDRI "Welcome back, [Name]!" — bruk italic editorial greeting
- Maks 3 lime-elementer (`#D1F843`) synlige per skjerm
- Asymmetri, hierarki, bevisst whitespace

---

## 2. Fargesystem (lyst tema = default)

Alle farger lagres som HSL-trippel uten `hsl()`-wrapper i `src/app/globals.css`. Tailwind v4 mapper dem til utilities via `@theme inline`.

### Semantiske tokens — lyst tema

| Token | HSL | Hex | Bruk |
|---|---|---|---|
| `background` | `45 18% 97%` | `#FAFAF7` | Side-bakgrunn (varm off-white) |
| `foreground` | `157 53% 8%` | `#0A1F17` | Primær tekst |
| `card` | `0 0% 100%` | `#FFFFFF` | Card-bakgrunn |
| `card-foreground` | `157 53% 8%` | `#0A1F17` | Tekst på card |
| `popover` | `0 0% 100%` | `#FFFFFF` | Popover/dropdown |
| `popover-foreground` | `157 53% 8%` | `#0A1F17` | Tekst i popover |
| `primary` | `159 100% 17%` | `#005840` | CTA, primær handling, sidebar-stripe (PlayerHQ) |
| `primary-foreground` | `72 92% 62%` | `#D1F843` | Tekst på primary |
| `secondary` | `45 18% 94%` | `#F1EEE5` | Secondary buttons, chips |
| `secondary-foreground` | `157 53% 8%` | `#0A1F17` | Tekst på secondary |
| `muted` | `45 18% 94%` | `#F1EEE5` | Disabled, dempet bakgrunn |
| `muted-foreground` | `60 4% 37%` | `#5E5C57` | Sekundær tekst |
| `accent` | `72 92% 62%` | `#D1F843` | Highlight, badges, sidebar-stripe (CoachHQ). MAKS 3 per skjerm |
| `accent-foreground` | `159 100% 17%` | `#005840` | Tekst på accent |
| `destructive` | `0 56% 41%` | `#A32D2D` | Slett, feil |
| `destructive-foreground` | `0 0% 98%` | `#FAFAF7` | Tekst på destructive |
| `border` | `60 8% 90%` | `#E5E3DD` | Borders |
| `input` | `60 8% 88%` | `#E0DDD6` | Form-input borders |
| `ring` | `159 100% 17%` | `#005840` | Focus ring |

### Semantiske tokens — mørkt tema (`.dark`)

| Token | HSL | Hex | Bruk |
|---|---|---|---|
| `background` | `157 47% 11%` | `#0F2A22` | Side-bakgrunn (dyp grønn-svart) |
| `foreground` | `60 8% 96%` | `#F5F4EE` | Primær tekst |
| `card` | `157 39% 14%` | `#163027` | Card-bakgrunn (løftet surface) |
| `popover` | `157 39% 14%` | `#163027` | Popover/dropdown |
| `primary` | `72 92% 62%` | `#D1F843` | I dark mode er lime primary |
| `primary-foreground` | `157 53% 8%` | `#0A1F17` | Tekst på primary |
| `accent` | `72 92% 62%` | `#D1F843` | Samme som lyst |
| `secondary` / `muted` | `157 39% 18%` | `#1B3B30` | Secondary surfaces |
| `muted-foreground` | `60 8% 68%` | `#9D9C95` | Sekundær tekst |
| `destructive` | `0 56% 60%` | `#D45353` | Slett, feil |
| `border` / `input` | `157 39% 22%` | `#2B4F42` | Borders |
| `ring` | `72 92% 62%` | `#D1F843` | Focus ring |

### Sidebar-bakgrunner (overflate-spesifikke)

| Token | Hex | Bruk |
|---|---|---|
| `--color-coach-sidebar` | `#061210` | CoachHQ sidebar (dypeste grønn-svart) |
| `--color-player-sidebar` | `#0A1F18` | PlayerHQ sidebar (mørk grønn-svart) |
| `--color-coach-content` | `#F0F2F0` | CoachHQ content-bakgrunn |
| `--color-player-content` | `#F5F7F5` | PlayerHQ content-bakgrunn |

### Pyramide-farger (offisielle AK Golf-pyramide for spillerutvikling)

Brukes i pyramide-ringer og pyramide-progress-bars (FYS / TEK / SLAG / SPILL / TURN).

| Token | Hex | Lag |
|---|---|---|
| `--color-pyr-fys` | `#005840` | FYS (fysisk fundament) |
| `--color-pyr-tek` | `#1A7D56` | TEK (teknikk) |
| `--color-pyr-slag` | `#D1F843` | SLAG (slagprogresjon) |
| `--color-pyr-spill` | `#B8852A` | SPILL (banespill) |
| `--color-pyr-turn` | `#5E5C57` | TURN (turnering) |

Track-versjoner (lette bg-versjoner med 10–28% opacity) finnes i `globals.css` for progress-bar-track.

### Status-farger (utenfor semantiske tokens)

| Status | Hex | Bruk |
|---|---|---|
| Success | `#10B981` | Grønn — fullført, OK |
| Warning | `#F59E0B` | Oransje — advarsel, ventende |
| Danger | `#EF4444` | Rød — feil, kritisk (alternativ til `destructive`) |
| Info | `#3B82F6` | Blå — informasjon, nøytralt varsel |

---

## 3. Typografi

Tre fonter, alle gratis via Google Fonts, lastet via `next/font/google` i `layout.tsx`.

| Font | Bruk | Tailwind | CSS-variabel |
|---|---|---|---|
| **Inter** | UI, brødtekst (default) | `font-sans` (default) | `--font-inter` |
| **Inter Tight** | Display, hero-overskrifter, seksjonstittler | `font-display` (custom-klasse `.font-display`) | `--font-inter-tight` |
| **JetBrains Mono** | KPI-tall, tabulære data, kode | `font-mono` | `--font-jetbrains-mono` |

### Type-skala (kanonisk hierarki)

| Rolle | Font | Vekt | Størrelse | Letter-spacing |
|---|---|---|---|---|
| **Hero-greeting (italic)** | Inter Tight italic | 400 | 36px | -0.02em |
| **Seksjonstittel** | Inter Tight | 700 | 24px | -0.01em |
| **Subhead** | Inter Tight | 600 | 18px | -0.01em |
| **Body large** | Inter | 400 | 16px | 0 |
| **Body (default)** | Inter | 400 | 15px | 0 |
| **Caption** | Inter | 400 | 13px | 0 |
| **Label uppercase** | Inter | 500 | 12px | 0.04em (uppercase) |
| **KPI-stort tall** | JetBrains Mono | 500 | 32–48px | tabular-nums |
| **KPI-medium tall** | JetBrains Mono | 500 | 20–24px | tabular-nums |

**Regler:**
- Italic Inter Tight = editorial luxury-feel. Brukes i hero-greeting, sjeldne signature-momenter
- JetBrains Mono har `font-variant-numeric: tabular-nums` (eller bruk `.tabular`-klasse)
- Body line-height: 1.5. Headings line-height: 1.2.
- Ingen andre fonter — ikke import fra Google Fonts CDN, ikke bruk `<link>`

---

## 4. Spacing — 8pt-grid

Alle spacing-verdier skal være multipler av 8px.

**Tillatt:** `4, 8, 12, 16, 24, 32, 40, 48, 64, 96` (4px og 12px tillates kun for tette icon-grupper)

**Tailwind v4-utilities som er OK:** `p-2 (8), p-4 (16), p-6 (24), p-8 (32), p-10 (40), p-12 (48), p-16 (64)`

**Unngå:** `p-1 (4), p-3 (12), p-5 (20), p-7 (28), p-9 (36)` (med mindre tett ikon-gruppe)

Samme regel gjelder `m-`, `gap-`, `space-y-`, `w-`, `h-`.

---

## 5. Border radius

`--radius` er satt til `1rem` (16px). Spesielle radius-tokens:

| Token | Verdi | Bruk |
|---|---|---|
| `--radius-card` | 16px | Cards, panels |
| `--radius-pill` | 20px | Pills, chips, status-badges |
| `--radius-btn` | 8px | Knapper |
| `--radius-tier` | 10px | Tier-badges (Gratis / Pro / Elite) |

**Tailwind-mapping:**
- `rounded-lg` = 16px (cards, panels)
- `rounded-md` = 12px (inputs)
- `rounded-sm` = 8px (badges, små tags)
- `rounded-xl` = 12px hardkodet (større cards)
- `rounded-2xl` = 16px hardkodet (hero-cards)
- `rounded-full` = pill (CTAs, badges, status)

---

## 6. Ikoner

**Kun `lucide-react`.** Ingen Heroicons, Phosphor, React Icons, FontAwesome.

| Property | Verdi |
|---|---|
| Default-størrelse | 24px |
| Stroke-bredde | 1.5px (eller 1.75px ifm. wireframe-konvensjon) |
| Linje-caps | round |
| Farge | `currentColor` (aldri hardkodet farge) |

---

## 7. Layout-mønstre

### Sidebar + content
- Fast venstre sidebar: 240px bred
- Scrollbart hovedinnhold til høyre
- Sidebar-bakgrunn: `--color-{coach,player}-sidebar`
- Sidebar-aktiv-stripe: 2–3px, `--primary` (PlayerHQ) eller `--accent` (CoachHQ)

### 12-kolonne bento-grid
- Asymmetrisk på dashboards — IKKE 3×1 uniform
- Bevisst hierarki: ett hero-element + 2–4 støtte-elementer i variert størrelse
- Whitespace er en feature

### Card-typer
- **Flush:** Ingen padding/border, hele bredden — for "naked" innhold
- **Standard:** 16px radius, hvit bg, subtil border (`#E5E3DD`) — default
- **Featured:** Gradient eller accent-stripe — hero-elementer

---

## 8. Interaksjons-mønstre

| Mønster | Bruk |
|---|---|
| **Wizard-flyt** | Multi-step (typisk 6 steg) med progress-dots, ikke linær progressbar |
| **Inline-redigering** | Klikk på et tall/felt → edit-modus inline |
| **Tapper-mode** | Stor knapp for raskt input (live session) — fullscreen, minimal UI, store tap-targets |
| **Tabs** | Underordnet navigasjon med 2px aktiv-stripe under aktiv tab |
| **Filter-chips** | Horisontal pill-rekke over lister, multi-select |
| **Status-pills** | Brøk-format (12/16) heller enn prosent |

### Interaksjons-states (pliktig per element)

Hver klikkbar element MÅ ha:
- **Default**
- **Hover** — subtil bg-shift eller shadow-økning, ikke farge-bytte
- **Active/pressed** — `transform: scale(0.98)` eller mørkere bg
- **Focus-visible** — 2px outline i `--ring`, aldri fjern focus
- **Disabled** — 40% opacity, `cursor: not-allowed`, `pointer-events: none`
- **Loading** (hvor relevant) — skeleton eller spinner

---

## 9. Animasjon

| Type | Verdi |
|---|---|
| Hover-transition | `150ms ease-out` |
| Layout-transition | `200ms ease-out` |
| Entrance (fade + translate) | 8–12px translate, staggered 50ms mellom siblings |

Respekter `prefers-reduced-motion: reduce` — wrap animasjoner i `@media (prefers-reduced-motion: no-preference)`.

---

## 10. UX-konvensjoner (norsk-spesifikt)

- **Språk:** Norsk bokmål med æ, ø, å overalt i UI
- **Desimaltegn:** komma — `78,5` (aldri `78.5`)
- **Dato-format:** «7. mai 2026» (norsk lang form), eller `07.05.26` (kort)
- **Tidsformat:** 24-timer — `14:00` (aldri `2:00 PM`)
- **Brøker over prosent:** «12/16 økter» heller enn «75 %»
- **Ingen emojier i UI** — bruk lucide-ikoner i stedet

---

## 11. Tier-system (PlayerHQ)

Tre tier-nivåer for spillere. Designsystem håndterer dem som visuelle badges.

| Tier | Farge-aksent | Eksempel-bruk |
|---|---|---|
| **Gratis** | Nøytral grå (`#9D9C95`) | Default for alle. Kun grunnleggende features |
| **Pro** | Primary grønn (`#005840`) | Mest vanlige betalende. Coach-funksjoner, plan |
| **Elite** | Accent lime (`#D1F843`) | Topp-tier. Full coach-team-tilgang, prioritet |

**Tier-gating-mønster:** Locked-features vises som dempet (40% opacity) med lock-ikon (lucide `Lock`) og CTA "Oppgrader til {Pro/Elite}".

---

## 12. Komponent-grunnsteiner (gjenbrukes overalt)

- **KPI-kort:** Stort tall (JetBrains Mono) + label uppercase + trend-pil
- **Pyramide-ring:** Konsentriske ringer i pyramide-fargene, viser FYS/TEK/SLAG/SPILL/TURN-progresjon
- **SG-radar:** Strokes Gained-radar-chart (5 dimensjoner: Off the Tee / Approach / Around the Green / Putting / Tee-to-Green)
- **Status-pill:** Rounded-full, brøk-format, farge per status
- **Tier-badge:** Liten pill med tier-navn + farge-prikk
- **Avatar-sirkel:** 40px / 56px / 80px størrelser. Initialer hvis ikke bilde
- **Tabs:** 2px stripe-under, Inter medium 14px

---

## Bruksanvisning for Claude Design

Når en skjerm designes:

1. Last opp dette dokumentet som system-kontekst først
2. Last opp tilhørende HTML-wireframe som referanse
3. Bruk eksakte token-navn fra del 2 (ikke hardkode hex)
4. Følg type-skalaen i del 3 — ikke lag nye font-størrelser
5. Spacing bare fra 8pt-grid (del 4)
6. Hver klikkbar element må ha alle states fra del 8
7. Norsk bokmål, komma som desimaltegn, 24-timer (del 10)
