# 04 — Component Inventory

Alle komponenter som plattformen krever. Organisert i atomer → molekyler → organismer → templates.

---

## ATOMER (lavest nivå)

### Button
**Fil:** `src/components/ui/button.tsx`

```tsx
type ButtonProps = {
  variant: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
};
```

**Varianter:**
- `primary` — `bg-primary text-primary-foreground` (forest green + lime tekst)
- `secondary` — `bg-secondary text-secondary-foreground`
- `outline` — `border bg-transparent`
- `ghost` — `hover:bg-secondary`
- `destructive` — `bg-destructive text-destructive-foreground`

**Sizes:**
- `sm` — `h-9 px-3 text-sm`
- `md` — `h-11 px-4 text-sm` (default, 44px touch)
- `lg` — `h-12 px-6 text-base`

### Input / Textarea / Select
**Filer:** `src/components/ui/{input,textarea,select}.tsx`

- Base height: 44px (touch-vennlig)
- Font: 16px på mobile (forhindrer iOS auto-zoom)
- Border: 1px solid `input`
- Focus: ring-2 ring-ring
- Disabled: opacity-50 + cursor-not-allowed

### Checkbox / Radio / Switch
**Filer:** `src/components/ui/{checkbox,radio,switch}.tsx`

- Touch-target: 44×44px (utvidet hit-area)
- Aria-roles korrekt
- Tastatur-navigasjon

### Avatar
**Fil:** `src/components/ui/avatar.tsx`

```tsx
type AvatarProps = {
  src?: string;
  name: string;          // for initialer fallback
  size?: "sm" | "md" | "lg" | "xl";
  tier?: "GRATIS" | "PRO";  // viser PRO-pill
};
```

**Sizes:**
- `sm` — 32px
- `md` — 48px
- `lg` — 80px
- `xl` — 100px (hero)

**Fallback-farge:** generert fra `avatarBg(name)` (deterministisk)

### Badge (AthleticBadge)
**Fil:** `src/components/athletic/badge.tsx`

```tsx
type BadgeProps = {
  variant: "ok" | "warn" | "urgent" | "lime" | "primary" | "neutral" | "info" | "success";
};
```

**Visuell:**
- `rounded-full px-2.5 py-0.5`
- mono uppercase 10px
- letter-spacing 0.08em

### Eyebrow
**Fil:** `src/components/ui/eyebrow.tsx`

UPPERCASE mono 10px med letter-spacing 0.10em + `text-muted-foreground`

### PulseDot
**Fil:** `src/components/ui/pulse-dot.tsx`

Pulserende prikk (1.5s ease-in-out infinite). Bruk på "NÅ"-marker, "live"-indikator.

### Icon (wrapper)
**Fil:** `src/components/ui/icon.tsx`

Wrapper rundt `lucide-react` med size-presets (16/20/24/32px) + `stroke-width={1.75}`.

### Skeleton
**Fil:** `src/components/ui/skeleton.tsx`

Shimmer-animasjon for loading-states. `bg-muted` med 1.4s shimmer.

---

## MOLEKYLER

### Card
**Fil:** `src/components/ui/card.tsx`

```tsx
type CardProps = {
  variant?: "default" | "hero" | "muted" | "accent";
  interactive?: boolean;  // hover-lift
};
```

**Visuell:**
- `bg-card border border-border rounded-lg p-6`
- Hover (hvis interactive): `-translate-y-0.5 shadow-md`

### KPICard
**Fil:** `src/components/ui/kpi-card.tsx`

```tsx
type KPICardProps = {
  eyebrow: string;        // UPPERCASE mono
  value: string;          // stort mono-tall
  delta?: { value: string; trend: "up" | "down" | "flat" };
  footnote?: string;      // mono muted under value
  icon?: React.ReactNode;
  variant?: "default" | "hero";
};
```

### EmptyState
**Fil:** `src/components/ui/empty-state.tsx`

```tsx
type EmptyStateProps = {
  icon: React.ReactNode;
  titleItalic: string;    // første del av tittel (italic)
  titleTrail: string;     // resten av tittel (regular)
  sub: string;
  cta?: { label: string; href?: string; onClick?: () => void };
};
```

### Tabs
**Fil:** `src/components/ui/tabs.tsx`

Bottom-border på aktiv tab. Horisontal scroll på mobile. Min-h-11 for touch.

### Breadcrumb
**Fil:** `src/components/ui/breadcrumb.tsx`

```tsx
type BreadcrumbProps = {
  items: { label: string; href?: string }[];
  backHref?: string;  // ChevronLeft-knapp
};
```

### ProgressBar / ProgressRing
**Filer:** `src/components/ui/{progress-bar,progress-ring}.tsx`

ProgressBar: horisontal med fill + optional ideal-markør (vertikal linje).
ProgressRing: SVG-sirkel for circular progress.

### Tooltip / Popover
**Filer:** `src/components/ui/{tooltip,popover}.tsx`

Hover (desktop) / tap (mobile) trigger. Position auto-flip ved viewport-edge.

### HelpPopup (NY for "?"-funksjon)
**Fil:** `src/components/ui/help-popup.tsx`

```tsx
type HelpPopupProps = {
  title: string;
  body: string;
  example?: string;
  learnMoreHref?: string;
};
```

Trigger: "?"-ikon (Lucide HelpCircle, 14px, muted-foreground).
Hover på "?" → primary.
Popup: bg-card border rounded-lg p-4 shadow-md, max-w-80.

### StatusPill / PyramidPill
**Filer:** `src/components/ui/status-pill.tsx`

Spesifikke pill-varianter:
- StatusPill: ok/warn/urgent + dot-indicator
- PyramidPill: FYS/TEK/SLAG/SPILL/TURN med pyramide-fargen

### Avatar-Stack
**Fil:** `src/components/ui/avatar-stack.tsx`

For "X spillere"-visualisering — overlappende avatarer + "+N more"

---

## ORGANISMER

### OverviewShell (hub-mønster)
**Fil:** `src/components/shared/overview-shell.tsx`

```tsx
type OverviewShellProps = {
  hero: { eyebrow: string; title: React.ReactNode; subtitle?: string };
  cards: CardProps[];  // grid 1/2/3-kol responsive
  actions?: React.ReactNode;
};
```

### DetailShell (detalj-mønster)
**Fil:** `src/components/shared/detail-shell.tsx`

```tsx
type DetailShellProps = {
  breadcrumb: { label: string; href?: string }[];
  backHref?: string;
  title: React.ReactNode;
  subtitle?: string;
  statusPill?: React.ReactNode;
  actions?: React.ReactNode;
  kpiRow?: React.ReactNode;
  tabs?: React.ReactNode;
  stickyActions?: React.ReactNode;
  children: React.ReactNode;
};
```

### HubFrame (CoachHQ dashboards)
**Fil:** `src/components/hubs/hub-frame.tsx`

Scoped CSS-shell for HubCards. Bruker `.hub-frame`-klasse + custom-properties.

### FullScreenTemplate
**Fil:** `src/components/shared/fullscreen-template.tsx`

For live-økt + test-execution. Fjerner sidebar + topbar. Stor close-X.

### Modal
**Fil:** `src/components/shared/modal.tsx`

- Desktop: sentrert med backdrop
- Mobile: bottom-sheet (slide-up)
- Sticky header + body + footer
- ESC + backdrop-click lukker

### Sheet
**Fil:** `src/components/shared/sheet.tsx`

Side-panel som glir inn:
- Desktop: høyre (480px) eller venstre (sidebar mobile)
- Mobile: bottom-sheet

### Toast
**Fil:** `src/components/ui/toast.tsx`

- Variants: info, success, warn, danger
- Position: top-right desktop, top-center mobile
- Auto-dismiss 4s
- Manuell lukk-X
- Stack opp til 3 om gangen

### DataTable
**Fil:** `src/components/ui/data-table.tsx`

- Sort, filter, pagination
- Mobile: card-mode-fallback (transformer rader til kort)
- Sticky første kolonne valgfritt
- Row-actions (dropdown)

### Sidebar
**Fil:** `src/components/admin/sidebar.tsx` (CoachHQ)
**Fil:** `src/components/portal/sidebar.tsx` (PlayerHQ)

```tsx
type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  matchPrefixes?: string[];
  children?: NavChild[];
};
```

**Mobile:** hamburger → sheet
**Desktop:** sticky 256px

### TopBar
**Fil:** `src/components/{portal,admin}/topbar.tsx`

- Logo (mobile)
- Søk (⌘K)
- Varsler-bell
- Profile-menu

### SidebarBrand
**Fil:** `src/components/shared/sidebar-brand.tsx`

```tsx
type SidebarBrandProps = {
  variant: "player" | "coach" | "forelder";
  role: string;  // "PRO", "HEAD COACH", "FORELDER"
};
```

Sentrert logo + "PLAYERHQ · PRO"-tekst.

### BottomNav (mobile)
**Fil:** `src/components/portal/bottom-nav.tsx`

5 tabs på mobile: Hjem · Planlegg · Gjennomfør · Analyser · Meg

### ProfileMenu
**Fil:** `src/components/shared/profile-menu.tsx`

Dropdown med avatar, navn, e-post, HCP + lenker.

### GlobalSearchModal (⌘K)
**Fil:** `src/components/{portal,admin}/global-search-modal.tsx`

Cmd+K åpner søk. Tastatur-navigasjon. Kategorier (sider, spillere, drills, m.fl.).

### NotificationBell
**Fil:** `src/components/shared/notification-bell.tsx`

Bell-ikon med badge for uleste. Dropdown med liste.

### CookieBanner
**Fil:** `src/components/shared/cookie-banner.tsx`

GDPR-banner ved første besøk. 3 valg: Aksept alt / Bare nødvendige / Tilpass.

### InstallPrompt (PWA)
**Fil:** `src/components/portal/install-prompt.tsx`

"Installer PlayerHQ som app" — iOS + Android.

---

## DOMENE-SPESIFIKKE KOMPONENTER

### PlayerHero (PlayerHQ)
**Fil:** `src/components/portal/workbench/player-hero-v2.tsx`

Stor avatar + Inter Tight italic hilsen + HCP-trend.

### CoachSpillerHero (CoachHQ)
**Fil:** `src/components/coachhq/workbench/spiller-hero.tsx`

Spillerens info + 3 actions (Send melding, Ny økt, Generer plan).

### CalendarWidget (Workbench)
**Fil:** `src/components/portal/workbench/calendar-widget.tsx`

Horisontal kalender 05-24 med fargekodede øktblokker + "NÅ"-marker.

### Pyramide-mini
**Fil:** `src/components/visuals/pyramide-mini.tsx`

5-akse pyramide-visualisering for stall-snitt og spiller-fordeling.

### SG-Radar
**Fil:** `src/components/visuals/sg-radar.tsx`

4-akse radar-chart for Strokes Gained (OTT/APP/ARG/PUTT).

### HCP-Trend-Chart
**Fil:** `src/components/visuals/hcp-trend.tsx`

12-måneders linje-chart med recharts.

### DrillCard
**Fil:** `src/components/drills/drill-card.tsx`

Card med kategori-prikk, skill-area, tittel, varighet, intensitet, NGF-badge.

### CoachCaddieChat
**Fil:** `src/components/coachhq/workbench/caddie-chat.tsx`

Chat med Caddie-AI, kontekstuelt for valgt spiller.

### AI-InsightsRow
**Fil:** `src/components/portal/workbench/ai-insights-row.tsx`

3 kort med Caddie-anbefalinger (Handling, Observasjon, Mål).

### WeekProgressCard
**Fil:** `src/components/portal/workbench/week-progress-card.tsx`

Pyramide-vekting (faktisk vs ideal) + ukens stats.

### QuickActions
**Fil:** `src/components/portal/workbench/quick-actions.tsx`

8-grid med store snarvei-knapper.

### TrainingPartnersRow
**Fil:** `src/components/portal/workbench/training-partners-row.tsx`

Liste med treningskompiser + "Bli med"-CTA.

### NextTournamentCountdown
**Fil:** `src/components/portal/workbench/next-tournament-countdown.tsx`

Stort countdown-tall + forberedelse-sjekkliste.

### WellnessIndicators
**Fil:** `src/components/portal/workbench/wellness-indicators.tsx`

HRV, søvn, energi, stress (når wearable koblet).

### InviteFriendModal
**Fil:** `src/components/portal/workbench/invite-friend-modal.tsx`

Bottom-sheet med tabs (Min gruppe / Akademi / Søk) + spiller-liste.

### InvitationCard
**Fil:** `src/components/portal/workbench/invitation-card.tsx`

"Bli med / Kanskje / Avslå"-flyt for mottatt invitasjon.

### NyNotatModal
**Fil:** `src/components/coachhq/workbench/ny-notat-modal.tsx`

Modal for ny/rediger coach-notat med tags + privat-toggle.

---

## TEMPLATES (page-level)

### DashboardTemplate
**Fil:** `src/components/templates/dashboard-template.tsx`

Layout for toppnivå-sider (hubs). Sidebar + Topbar + Content.

### DetailTemplate
**Fil:** `src/components/templates/detail-template.tsx`

Layout for detalj-sider. Breadcrumb + Hero + KPI + Tabs + Content.

### ListTemplate
**Fil:** `src/components/templates/list-template.tsx`

Layout for liste-sider. Filter-bar + Tabell/Grid + Pagination.

### FormTemplate
**Fil:** `src/components/templates/form-template.tsx`

Layout for skjema-sider. Centered, max-w-2xl, sticky save-bar.

### FullScreenTemplate
**Fil:** `src/components/templates/fullscreen-template.tsx`

For live-økt + test-execution.

---

## ATHLETIC EDITORIAL — WORKBENCH-V2-KOMPONENTER

Disse 10 komponentene utgjør PlayerHQ-hjem (`/portal`) og er den kanoniske referansen for athletic editorial. Skal også brukes som mønster på CoachHQ-Workbench.

### PlayerHeroImage
**Fil:** `src/components/portal/workbench/player-hero-image.tsx`

Photo-hero med AK Golf Academy-foto som bakgrunn, dark gradient overlay, italic display-hilsen + meta-rad.

```tsx
<PlayerHeroImage
  user={{
    name: "Øyvind Rohjan",
    tier: "PRO",
    hcp: -2.1,
    hcpTrend: 0.3,
    nivaa: "A1",
  }}
  neste_turnering={{ navn: "Sørlandsåpent", dato: new Date("2026-06-15") }}
  imageId={1}  // AK-Golf-Academy-1.webp
/>
```

- Min-h 340 (mobile) / 440px (desktop)
- Rounded-2xl shadow-xl
- Dark gradient: from-black/85 via-black/55 to-black/20 + to-t from-black/60
- Hilsen: text-4xl md:text-6xl font-display font-bold italic, fornavn = text-accent
- Meta-rad: mono uppercase med tabular tall

### CalendarWidget
**Fil:** `src/components/portal/workbench/calendar-widget.tsx`

Horisontal tidslinje 05:00-24:00 med pyramide-fargede øktblokker.

- 4px venstre-stripe per blokk i pyramide-akse-farge
- "NÅ"-markør med destructive (rød)
- Hover-popover med drills + actions
- Server-component med "use client" for popover-state

### AiInsightsRow
**Fil:** `src/components/portal/workbench/ai-insights-row.tsx`

3-grid med type-spesifikke ikon-sirkler.

- HANDLING: bg-accent + lime border-md
- OBSERVASJON: bg-info/15 text-info
- MAAL: bg-primary/10 text-primary
- Type-badges på topp-høyre
- Body: font-display text-[17px] medium leading-[1.45]

### WeekProgressCard
**Fil:** `src/components/portal/workbench/week-progress-card.tsx`

Ukas pyramide-balanse + 4 stat-tiles.

- 5/3 grid på desktop
- Pyramide-bars med status-pills (ok/over/under)
- Stat-tiles: 32px display-tall + ikoner
- Italic editorial-anbefaling

### QuickActions
**Fil:** `src/components/portal/workbench/quick-actions.tsx`

8-grid (4×2) med snarvei-tiles. Highlight-tile = dark moment.

- 100px tiles, 40px ikon-sirkler
- Hover: -translate-y-0.5 + ikon scale-110
- Highlight: bg-foreground text-background + lime accent-ikon

### TrainingPartnersRow
**Fil:** `src/components/portal/workbench/training-partners-row.tsx`

Treningskompiser med kommende felles økter.

- 14-size avatarer med fargete bakgrunn (from name-hash)
- Pyramide-pills med funksjonsbaserte farger
- Status-pills (Bekreftet/Invitert/Avventer)
- Pill CTAs i uppercase mono

### NextTournamentCountdown
**Fil:** `src/components/portal/workbench/next-tournament-countdown.tsx`

**Dark moment** — sort card med 120px lime countdown.

- bg-foreground text-background rounded-2xl shadow-xl
- Countdown: text-[80px] sm:text-[120px] font-display tabular-nums text-accent
- Forberedelse-sjekkliste: fyllte sirkler når ferdig (bg-accent)
- CTA: bg-accent rounded-full uppercase tracking-[0.08em]

### WellnessIndicators
**Fil:** `src/components/portal/workbench/wellness-indicators.tsx`

2×2 stat-tile-grid for energi/søvn/HRV/stress fra wearable.

- 32px display-tall + Lucide ikon-corners (Activity, Moon, Heart, Brain)
- Energy-bar: 10 segmenter
- Empty-state: stort hero-ikon + "Koble enhet"-pill

### FabButton
**Fil:** `src/components/portal/workbench/fab-button.tsx`

Floating Action Button — kun på mobile.

- fixed bottom-20 right-4 z-30 md:hidden
- Plus-ikon → 5 sub-actions ved klikk
- Esc + click-outside lukker
- Primary green (#005840)

### SectionHeader
**Fil:** `src/components/portal/workbench/section-header.tsx`

Editorial section divider med lime accent-strek.

```tsx
<SectionHeader
  eyebrow="Programmet i dag"
  title="I dag"
  description="5 økter planlagt — tidslinje fra 05:00 til 24:00."
  cta={{ label: "Full kalender", href: "/portal/kalender" }}
/>
```

- Lime strek: h-px w-8 bg-accent
- Eyebrow: mono uppercase tracking-[0.16em]
- Tittel: display 2xl/3xl font-bold tracking-tight
- Description: muted, max-w-prose
- CTA: pill med border + uppercase mono label

---

## TELLINGER

| Type | Antall |
|---|---|
| Atomer | 14 |
| Molekyler | 16 |
| Organismer | 19 |
| Domene-spesifikke | 17 |
| Templates | 5 |
| **Workbench-v2 (athletic editorial)** | **10** |
| **TOTALT** | **81 komponenter** |

Alle bygd på samme designsystem-tokens. Hvis ny side trenger ny komponent: lag den her først, så bruk på sidene.

Workbench-v2-komponentene er den **kanoniske referansen** for athletic editorial — alle nye PlayerHQ + CoachHQ-skjermer skal følge samme mønster.
