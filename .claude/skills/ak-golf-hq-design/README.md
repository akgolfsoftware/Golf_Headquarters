# AK Golf HQ — Design System

**Editorial sport-analytics for a four-module golf-coaching platform.**
DataGolf møter The Athletic, hvis det møttes på Linear.

> Dette designsystemet er **LÅST**. Farger, fonter og spacing er kanon.
> Ikke foreslå nye fontfamilier, hex-verdier eller spacing-trinn.

---

## Plattformen

AK Golf HQ er én Next.js 16-monorepo med fire moduler, ett designsystem:

| Modul          | URL              | Hvem                   | Hva |
|----------------|------------------|------------------------|-----|
| **Marketing**  | `akgolf.no`      | Offentlig              | Landingssider, akkvisisjon |
| **Booking**    | `/booking`       | Spillere + besøkende   | Time-booking, betaling |
| **PlayerHQ**   | `/portal`        | Spillere               | Treningsplan, økt-logg, profil, fakturaer |
| **AgencyOS**   | `/admin`         | Coacher (intern)       | Dagens økter, spillerliste, planlegging, fakturering |

> **App-navn:** coach-appen heter **AgencyOS** (het tidligere «CoachHQ» — bruk aldri det i ny UI-tekst). UI-kit-mappen `ui_kits/coachhq/` beholder mappenavnet, men flaten er AgencyOS.

Stack: **Next.js 16 · Tailwind v4 (CSS-first via `@theme`) · shadcn/ui · Inter + Inter Tight + JetBrains Mono.**

## Låste beslutninger (juni 2026)

- **Tema per produkt:** PlayerHQ alltid lyst, AgencyOS alltid mørkt (`.dark`). Ingen tema-toggle.
- **Navne-kanon (demo):** spiller **Øyvind Rohjan**, coach **Anders Kristiansen**. (Ekte coach «Markus Røinås Pedersen» på markedssider — ikke bytt.)
- **Abonnement:** gratis eller 300 kr/mnd — ingen tier-nivåer. Performance/Performance Pro = coaching-pakker, ikke app-nivåer. **ELITE finnes ikke** (vis aldri).
- **Planlegging bor i Workbench** (ett trykkpunkt). **Analysere + TrackMan + Runder + SG = én flate med faner.**
- Full liste: prosjektets `docs/platform/BUSINESS-RULES.md`.

## Følge-artefakter (sannhet ved siden av skillen)

- **Komponent-galleri (83):** kode `src/components/athletic/` · Drive `software/akgolf-hq/komponenter-2026-06-15/index.html`.
- **Skjerm-spec-modell:** repo `docs/skjermplan/` · Drive `software/akgolf-hq/skjermplan-2026-06-15/` — hver skjerm + tilstander/modaler/handlinger.
- **Brand guide (visuell):** Drive `software/akgolf-hq/akgolf-hq-designsystem-2026-06-15.html`.
- **Tokens i kode:** `src/app/globals.css` speiler `colors_and_type.css`.
- **Metode + flyt + kvalitet:** `flyt-og-kvalitet.md` (i denne skillen).

---

## Kilder vi har lest

Det reelle sannhetsgrunnlaget for dette designsystemet:

- **Codebase:** `athletic/` (mounted via File System Access API) — komplett komponentbibliotek under `src/components/athletic/` i monorepoen. Vi har lest hver enkelt fil: `button.tsx`, `card.tsx`, `hero.tsx`, `kpi.tsx`, `badge.tsx`, `featured-card.tsx`, `eyebrow.tsx`, `pulse-dot.tsx`, `avatar.tsx`, `greeting.tsx`, `pyramid-progress.tsx`, `action-list.tsx`, `queue-item.tsx`, `day-cal.tsx` + 11 datavisualiseringer og 11 kalender-komponenter.
- **Logo-pakke:** 7 SVGer levert direkte: primary mono, primary-on-light, primary-on-dark, white mono, white-on-dark, white-on-green, black mono. Alle kopiert til `assets/`.
- **Locked tokens-dokument:** Pasted som prosjektinstrukser — semantiske farger, type-tildeling og 8pt-grid er allerede ratifisert.

Hvis du har tilgang på read-only-mount: rotsti `athletic/` peker til de produksjons-TSX-komponentene. Disse er sannhet — UI-kittet i `ui_kits/` er bare en JSX-port for å vise dem fram visuelt.

---

## Hvordan dette systemet er organisert

```
README.md                  ← du er her
SKILL.md                   ← bruksanvisning for Claude/Code-agenter
colors_and_type.css        ← låste designtokens (CSS-variabler)

assets/                    ← logoer (SVG), brand-bilder
preview/                   ← Design System-tab kort (~700×variabel)

ui_kits/
  playerhq/                ← /portal — spillerportal, mobile-first
  coachhq/                 ← /admin — coach-dashboard, datafokus
  marketing/               ← akgolf.no — editorial landingsside
  booking/                 ← booking-flow
```

Hver `ui_kit/<modul>/` har sin egen `README.md`, `index.html` og et sett `.jsx`-komponenter som speiler ekte produksjonsmønstre.

---

## Hurtigreferanse (alle detaljer ligger i tokens-filen)

**Farger — kun semantisk navn:** `background` `foreground` `card` `primary` `accent` `secondary` `muted` `destructive` `success` `warning` `info` `border` `input` `ring`. Pluss pyramide-akser (alltid rendret bunn→topp: Fysisk, Teknisk, Golfslag, Spill, Turnering): `pyr-fys` `pyr-tek` `pyr-slag` `pyr-spill` `pyr-turn`.

**Tre fonter, ingen flere:** Inter (UI) · Inter Tight (display, inkl. italic) · JetBrains Mono (tall, eyebrow, kode).

**Spacing:** kun multipler av 8 — 8, 16, 24, 32, 40, 48, 64.

**Radius:** 8 / 12 / 16 / 20 / 24 / full.

**Ikoner:** kun `lucide-react`, 24px, 1.5px stroke, `currentColor`. **Ingen emoji.**

---

## Content Fundamentals

> Hvordan AK Golf HQ snakker — språkets DNA.

**Norsk bokmål gjennomgående.** Med æ, ø, å, alltid. Engelske golfbegreper får stå urørt: Strokes Gained, SG, PGA Tour, drive distance, fairway-treff, putt, FedExCup, Korn Ferry, Tour-snitt. Ingen forsøk på å "fornorske" disse — golfere snakker engelsk om teknikk.

**Person:** "du" — aldri "De", aldri "spilleren". Direkte tiltale.

**Tone:** Datadrevet, tall først, ingen pisk. Editorial italic for emosjonell vekt (`<em>` i Inter Tight italic, ikke serif). Det er forskjellen mellom *Tour-snittet er 48 %* og **Tour-snittet er 48 %**.

**Subtil humor:** Lov å være tørr og direkte. Eksempel som funker:
> *"PGA Tour-snittet fra 3m er 48 %. Du hadde gjettet høyere, hadde du ikke?"*

**Casing:**
- Overskrifter: setningsstart-casing — *Dagens økt*, ikke *Dagens Økt*.
- Eyebrows: mono CAPS med 0.12em letter-spacing — *DAGENS ØKT*, *SG · APPROACH*.
- KPI-labels: mono CAPS — *FAIRWAYS HIT*, *SG TOTAL*.
- Knapper: setningsstart — *Logg økt*, *Se hele uka*, *Reserver tee-time*.

**Tall:**
- Tabulær mono overalt der presisjon teller (KPI, score, prosent, distanse).
- Norsk desimaltegn: komma. *48,3 %*, ikke *48.3 %*.
- Tusen-skille: mellomrom. *1 240 meter*.
- Prosent: tegn etter mellomrom (Språkrådets versjon). *48 %*.
- Tid: 24-timers. *14:30*.

**Forbudt språk:**
- "world-class", "revolutionary", "game-changing", "unleash", "elevate" — alt hype.
- Emoji i UI. Aldri. Verken som dekorasjon, status, eyebrow eller indikator. Bruk lucide-ikoner.
- "Få din beste runde noensinne!!" — vi er ikke en gymsalg-trener. Vi er en analytiker.

**Eksempel — hero-overskrift i hus-stil:**

```tsx
<h1 className="font-display text-6xl font-semibold tracking-tight">
  Hvor langt slår de <em className="font-normal italic text-primary">egentlig</em>?
</h1>
<p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
  PGA TOUR · DRIVE DISTANCE · 2025-SESONGEN
</p>
```

**Eksempel — KPI-tone:**
> Ikke: *"Du knuste det denne uka! 🔥"*
> Heller: *"+0,42 SG approach over 4 økter. Beste streak siden mai."*

---

## Visual Foundations

> Det visuelle DNA-et — hva som gjør AK Golf HQ gjenkjennelig på 200ms.

**Den emosjonelle ankeren:** *Editorial sport-analytics.* Tenk The Athletic-langformat krysset med DataGolf-tetthet. Forrest-grønn er gravitas; lime er signaturen; varm cream er pusten. Det skal kjennes som å lese en seriøs sportsanalyse, ikke en SaaS-onboarding.

### Palett-rytme

- **Forest #005840** er primær. Det er Tour-grønnen — flagg, putting greens, dyp skog. CTA-er, fokusring, headere på dark surfaces. På lyst tema er forest tekst og handling; på mørkt tema er det bakgrunn.
- **Lime #D1F843** er fyrverkeriet. Kun for *signatur-øyeblikk*: primær CTA-tekst, accent-badges, KPI-puls, focus-glød. Aldri som dominerende flate. Aldri stor og flat. Lime kommer i biter — en knapp, en dot, en linje under en aktiv tab.
- **Cream #FAFAF7** er sidebakgrunnen i lyst tema. Varm, ikke kald. *Ikke* `#FFFFFF`-bakgrunn — `#FFFFFF` er reservert til kort/cards, sånn at lift-kontrasten føles. Dette er essensielt: lyse skjermer skal ha cream-bg + hvite kort.
- **Forest #0F2A22** er dark-mode bakgrunn. *Ikke* svart. Aldri ren #000. Det dype skog-tone-mørket beholder grønn karakter.

### Bakgrunner og overflater

- **Cards:** Hvit `#FFFFFF` (light) eller forest-600 `#163027` (dark). Ramme `border` (`#E5E3DD` light / `#2B4F42` dark) på 1px. Radius `rounded-lg` (16px) standard, `rounded-2xl` (24px) for hero-kort. **Skygge: subtil til ingen.** Editorial er flatt. Bruk skygge kun når lift virkelig trengs (popovers, modaler) — `--shadow-md` er taket for nesten alt.
- **Hero-sections:** Foto-bakgrunn (gress, fairway, tee-box) med to gradient-lag — `from-black/40 to-transparent` øverst (for status-bar legibility) og `from-transparent to-black/55` nederst (for tekst-legibility). Aldri solid-farge hero — *photo or it didn't happen*.
- **Featured cards:** Forest-gradient `from-primary via-primary to-emerald-900`, hvit tekst, mono-eyebrow i lime, valgfritt en lime "ball"-blur i øverste høyre hjørne ved `opacity-15 blur-sm`.
- **Ingen aggressiv gradient-bruk ellers.** Ingen blue-purple SaaS-gradienter. Forest-til-mørkforest er det vi har. Det er nok.

### Type-rytme

- Display er Inter Tight. Body er Inter. Tall er JetBrains Mono — *alltid*. Også når du tror du vil ha sans for et tall. Hvis det er noe å sammenligne, lese-i-en-tabell eller analysere — det er mono.
- **Signaturen:** Editorial italic. Inter Tight italic på `<em>` inni display-overskrift, alltid `text-primary`. Det er det som skiller AK Golf HQ fra hver eneste annen "sport tech"-side. Aldri serif.
- Eyebrow-mønster: mono · 10px · semibold · UPPERCASE · 0.12em tracking. Det er instrumentpanel-typografi.
- Body: 14–16px (mobile) / 16px (desktop). Line-height 1.55. Text-wrap pretty.

### Borders, kanter, radii

- Border alltid 1px. Aldri 2px (unntak: focus ring 2px). Børke-grønn på dark, varmt sand-grå på light.
- Radius: 8/12/16/20/24/full. Det er hele settet.
- **Lime border-left på event-kort:** 3px lime venstre-kant er et tilbakevendende mønster på timeline-events og day-planner-blokker. Den ene aksent-detaljen.

### Knapper

Knappesystemet er strengt — fire varianter, alle med spesifikk semantikk:

| Variant | Bruk | Visuell | Radius |
|---|---|---|---|
| **Primary** | Standard CTA. Default for "go-action" på lyse flater. | Forest #005840 fyld, lime #D1F843 tekst | 12 px |
| **Accent** | Sjeldne signaturhandlinger — "Start gratis prøving", "Oppgrader", hero-acquisition. Aldri default. | Lime #D1F843 fyld, forest tekst, lime-glow shadow | full (pill) |
| **Secondary** | Alternative handlinger ved siden av primary — "Se hele uka", "Filter", "Tilbake". | Transparent, 1px forest border, forest tekst | 12 px |
| **Ghost** | De-emfaserte handlinger — "Avbryt", "Logg ut", icon-only chevrons. | Transparent, ingen border, forest tekst | 12 px |

**På mørke flater** (featured cards, dark mode, hero med foto): Primary er lime fyld + forest tekst, fordi forest forsvinner mot dark bg. Dette matcher dark-mode-tokenene.

**Størrelser:** sm (36 px / 13 px tekst), md (44 px / 14 px) — default, lg (52 px / 15 px). Aldri ekstra radius på lg — kun større padding. Knappen blir bredere og høyere, ikke mer avrundet.

**Pill (full radius) er forbeholdt** signatur-CTA, status-badges, og chips. Aldri på vanlige form-CTA-er.

### Skygger og lift

- Sky-stack er forrest-svart, ikke nøytral svart. `rgba(10, 31, 23, 0.08)` til subtile lift.
- **Lime-glød** er en spesifikk effekt — bare på fokusert lime-CTA og pulse-dot. `0 6px 14px rgba(209,248,67,0.25)` eller den 8px-pulsende ring-aniam'en på `<PulseDot>`. Ingen andre steder.
- Ingen inset-shadows. Ingen 3D-knapper. Ingen neumorfisme.

### Layout-prinsipper

- 8pt-grid er hellig. Hvis du finner deg selv å skrive `p-3`, `p-5`, `p-7`, `p-9` — stopp. Du har tapt.
- Kort-tetthet er Bloomberg-ish. KPI-strip kan ha 4–5 kolonner på desktop. Vi gjør ikke "luftig spacing" som SaaS-marketing.
- **Max-width content:** 1280px (`max-w-7xl`). Marketing kan gå til 1440px på fullt-bredde hero.
- Mobile-first for PlayerHQ og Booking. Desktop-first for AgencyOS. Marketing er ekte responsive.

### Imagery-stil

- **Foto:** atmosfærisk, golden hour eller overskyet morgen. Aldri mid-day blå sky med høyt mettede farger. Tenk MUNDIAL Magazine — film-grain, varm tonering, lav saturasjon. Dyp grønt-gult-brunt fra gress, fairway, ru. Aldri stock-bilder av smilende businesspersoner i poloskjorter med flagg.
- **Comp-stiler:** vi favoriserer ekstreme bredder — wide-format 16:9 eller 21:9 hero-bilder. Aldri kvadratisk.
- **Illustrasjon:** minimalistisk når det forekommer. Pyramide-aksene visualiseres som horisontale bars i sin spesifikke fargekode (`pyr-*`), **alltid rendret bunn-til-topp** — Fysisk (bunn, bredest) → Teknisk → Golfslag → Spill → Turnering (topp, smalest). I en topp-til-bunn-liste vises Turnering først, Fysisk sist. Aldri 3D, aldri isometrisk, aldri "designer mascots".

### Bevegelse

- Easing: standard `ease-out` for entry, `ease-in-out` for state-change. 150–250ms varighet — *raskt*. Aldri 400ms+ outside of hero-reveal.
- Hover: `brightness-105` på lime-CTA. `bg-muted` på ghost-light. Aldri scale, aldri lift-translateY (utenom feature-card lazy-load).
- Press: `opacity-50` på disabled, men aldri en aktiv scale-shrink. Trykk-tilbakemelding er fargeskifte, ikke geometri.
- Pulse: én animasjon, brukt sparsomt — `<PulseDot>`. `animate-ping` med lime + glow, signaliserer "live".
- Scroll-reveal: nei. Vi laster inn raskt og ferdig.

### Transparency og blur

- Brukes til `bg-white/10` ghost-knapper på dark hero, og `bg-black/40` gradient-beskyttelse over foto-hero. Backdrop-blur kun i sticky toolbar/nav når det er foto bak.
- Aldri "frosted glass card" som standard kort. Det er ikke vår stil.

### Iconography

- Lucide-react, 24px default, 1.5px stroke, `currentColor`. Det er hele settet.
- Vanlige: `Flag`, `Trophy`, `Target`, `Zap`, `Sparkles`, `LineChart`, `Gauge`, `Crosshair`, `Users`, `MapPin`, `Calendar`, `Clock`, `TrendingUp`, `TrendingDown`, `Award`, `Activity`, `ChevronRight`, `ArrowUpRight`, `Plus`, `Filter`, `Search`.
- **Ingen emoji.** Ingen unicode-ikoner (✓ ✗ ★). Bruk `<CheckCircle2 />` / `<XCircle />` / `<Star />` fra lucide.
- For statiske skissers / sites uten React: link Lucide via CDN `https://unpkg.com/lucide@latest` og bruk `<i data-lucide="flag">` med `lucide.createIcons()`.
- AK-monogrammet er logoen — 7 SVG-varianter levert. Det er det eneste branding-merket. Ingen alt-marks, ingen pattern-bruk av logoen.

**Fire kanoniske lockups** (resten av SVG-ene er kildevarianter):

| Lockup | Fil | Bruk |
|---|---|---|
| `on light` | `logo-primary-on-light.svg` | Forest "ak" + lime prikk på cream/hvit bg. Default. |
| `on forest` | `logo-white-on-green.svg` | Hvit "ak" + lime prikk på forest #005840. CTA-kort, dark mode primær. |
| `on dark · hero` | `logo-primary-on-dark.svg` | Lime "ak" + lime prikk på #0F2A22. **Reservert** for splash, hero, store presentasjoner. |
| `on dark · nav` | `logo-white-on-dark.svg` | Hvit "ak" + lime prikk på #0F2A22. **Default** for nav, footer, sekundære steder. Lime "ak" blir for tung der. |

---

## Iconography (utdypet)

AK Golf HQ bruker **Lucide** som eneste ikonbibliotek. Begrunnelse: shadcn/ui-økosystemet bruker det, stroke-vekten passer editorial-stilen, og det dekker både UI- og sport/analytics-domenet.

**Default-spec:**
- Størrelse: 16px (inline), 20px (knapp-prefix), 24px (standalone), 32px (hero-prefix). Ikke alt midt imellom.
- Stroke: 1.5px. *Aldri* 2px eller 1px. Lucide-default 1.5 stemmer.
- Farge: `currentColor` slik at den arver foreground/primary/accent fra container.
- Aldri fyldte (`-fill`-variantene) — vi bruker stroke-versjoner gjennomgående for å beholde det editorial.

**Logo:** AK-monogrammet er ikke et ikon. Det rendres alltid som SVG (filene under `assets/logo-*.svg`), og alltid på minimum 32px høyde. Den lime sirkelen er logo-aksent, ikke generelt mønster.

**Emoji:** Forbudt. Hvis du tenker "🏌️", bruk `<Flag />`.

**Unicode-symboler:** Forbudt i UI. Bullet ` • ` er ok i copy som leses som tekst, men ikke som statussymbol.

---

## Index — hva ligger hvor

| Fil / mappe | Bruk |
|---|---|
| `README.md` | Denne fila. Start her. |
| `SKILL.md` | Instruks til Claude/Code-agent som bruker dette som skill. |
| `colors_and_type.css` | Alle designtokens som CSS-variabler. Importer i HTML-prototyper. |
| `assets/` | 7 logo-SVGer (mono / on-light / on-dark / on-green varianter). |
| `preview/` | Design System-tab visning. ~20 små HTML-kort med foundations + komponenter. |
| `ui_kits/playerhq/` | `/portal` — spillerportal, mobile-first React-port. |
| `ui_kits/coachhq/` | `/admin` — coach-admin, desktop. |
| `ui_kits/marketing/` | `akgolf.no` — editorial landingsside. |
| `ui_kits/booking/` | Booking-flow. |

---

## Hva du *ikke* skal gjøre

(Repetert fordi det er viktig nok til å gjenta.)

1. **Aldri** foreslå nye fonter (ingen Instrument Serif, Playfair, Geist, IBM Plex).
2. **Aldri** foreslå hex-verdier utenfor tokens-listen.
3. **Aldri** lever to varianter av samme side. ÉN versjon, lås.
4. **Aldri** bruk emoji.
5. **Aldri** splitt designsystemet i flere CSS-filer.
6. **Aldri** lag store flate flater i lime. Lime er en aksent, ikke en kanvas.
