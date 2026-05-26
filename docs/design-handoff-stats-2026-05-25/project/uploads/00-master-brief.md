# AK Golf Stats — Design Master Brief

**Prosjekt:** Visuell redesign av AK Golf Stats — alle sider under `akgolf.no/stats/*`
**Stack:** Next.js 16 App Router + Tailwind v4 (CSS-first via `@theme`) + shadcn/ui + recharts
**Tone:** Editorial sport-analytics — DataGolf møter The Athletic
**Bruker dette designet til:** Claude Design (designverktøy)

---

## Produktets posisjon

AK Golf Stats er et **gratis, offentlig statistikkprodukt** som ligger på akgolf.no. Det er markedsføringsmotoren som skal drive trafikk inn til **PlayerHQ-abonnement** (300 kr/mnd treningsdagbok). Verktøyet skal kjennes som DataGolf — datadrevet, presist, gøy å leke med — men med norsk vinkling og diskret, vakker konverteringsfunnel.

**4 hovedmoduler:**
1. **Turneringer** (`/turneringer`) — kalender over PGA/DPW/LET/Korn Ferry + norske amatørtourer
2. **PGA Tour Stats** (`/stats/pga`) — interaktiv playground (drive distance, putt-explorer m.fl.)
3. **Norsk spillerbase** (`/stats/spillere`) — 1 500+ norske spillere, søkbart
4. **SG-sammenligning** (`/stats/sg-sammenlign`) — bruker legger inn egen SG, ser radar vs proff

---

## Brand-tokens (LÅST)

Disse er CSS-variabler i `globals.css` og skal IKKE endres uten beslutning. All design må fungere på begge temaer (light er default — dark eksisterer som tokens men er låst av i Beta).

### Lyst tema (default)

| Token | HEX | Bruk |
|---|---|---|
| `background` | `#FAFAF7` | Side-bakgrunn (varm off-white) |
| `foreground` | `#0A1F17` | Primær tekst (dyp forest) |
| `card` | `#FFFFFF` | Card-bakgrunn |
| `primary` | `#005840` | Forest — CTA, primær handling, italic hero-aksenter |
| `primary-foreground` | `#D1F843` | Lime — tekst på forest-CTA |
| `secondary` | `#F1EEE5` | Varm sand — secondary buttons, chips |
| `accent` | `#D1F843` | Lime — highlights, badges, status |
| `accent-foreground` | `#005840` | Forest — tekst på lime-bakgrunn |
| `muted` | `#F1EEE5` | Disabled, dempet bakgrunn |
| `muted-foreground` | `#5E5C57` | Sekundær tekst (varm grå) |
| `border` | `#E5E3DD` | Borders |

**Aldri** hardkode hex. Bruk Tailwind-utilities: `bg-primary`, `text-foreground`, `border-border`.

### Typografi

| Font | Tailwind | Bruk |
|---|---|---|
| **Inter** | `font-sans` (default) | UI, brødtekst, knapper, tabeller |
| **Inter Tight** | `font-display` | Display, hero-headlines, seksjonstittler |
| **JetBrains Mono** | `font-mono` | KPI-tall, eyebrows, tabulære tall, kode |

**Signatur-aksent:** Editorial italic i hero-headlines bruker `<em>` med `font-normal italic text-primary`:

```tsx
<h1 className="font-display text-6xl font-semibold tracking-tight">
  Hvor langt slår de <em className="font-normal italic text-primary">egentlig</em>?
</h1>
```

### Grid + spacing

Strikt 8pt-grid. Bare `p-2` (8), `p-4` (16), `p-6` (24), `p-8` (32), `p-10` (40), `p-12` (48), `p-16` (64). Aldri `p-3`/`p-5`/`p-7`.

### Border-radius

- `rounded-sm` (8px) badges, tags
- `rounded-md` (12px) inputs, knapper, små card
- `rounded-lg` (16px) cards, panels
- `rounded-xl` (12px hardkodet) større cards
- `rounded-2xl` (16px hardkodet) hero-cards
- `rounded-full` pill (CTAs, badges)

### Ikoner

Kun `lucide-react`. 24px default, 1.5px stroke, `currentColor`. **Ingen emoji noensinne i UI.** Bruk Lucide `Flag`, `Trophy`, `Target`, `Zap`, `Sparkles`, `LineChart`, `Gauge`, `Crosshair`, `Users`, `MapPin` osv.

---

## Innholdstone

**Norsk bokmål gjennomgående.** Ord vi bruker:
- "Du" (ikke "De" eller "spilleren")
- "Drive distance" / "fairway-treff" / "innspill" / "putt" (norsk-engelske golf-termer)
- "Strokes Gained" / "SG" (la stå på engelsk)
- "PGA Tour", "Tour-snitt" (la stå)
- "Spillere", "turneringer", "klubber" (rent norsk)

**Tone:**
- **Direkte og selvsikker.** Ingen unødvendige høflighetsfraser.
- **Datadrevet.** Tall først, prosa etter.
- **Editorial italic** brukes til å lade emosjonell vekt: "Hvor langt slår de *egentlig*?" / "Hvordan ligger *du* an?"
- **Subtil humor.** "PGA Tour-snittet fra 3m er 48%. Du hadde gjettet høyere, hadde du ikke?"
- **Aldri hype.** Ingen "world-class", "revolutionary", "game-changing".

---

## Inspirasjon

| Referanse | Hva vi tar fra det |
|---|---|
| **DataGolf.com** | Dense data-tabeller, vekt på SG, "trust the data"-estetikk |
| **The Athletic** | Editorial italic, generøse whitespace, lange detaljerte hero-overskrifter |
| **FiveThirtyEight** | Interaktive slidere, percentile-visualisering, "story per chart" |
| **Linear.app** | Mørk-mode disiplin, presise micro-interaksjoner (tilpasset light-tema) |
| **Bloomberg Terminal** | Tabulære tall, mono-font for data, tett informasjonstetthet i tabeller |
| **Stripe Dashboard** | Side-narrative som ryker fra hero til detalj, KPI-strips |

---

## Konverteringsfunnel — diskret men konsekvent

**Funnel:**
1. Bruker lander på `/stats` (via SEO eller direkte)
2. Bruker scroller, leker med interaktive verktøy
3. Møter subtile CTA-er underveis ("Vil du følge din egen?")
4. Konverterer til **PlayerHQ-prøving** (gratis 30 dager → 300 kr/mnd)

**Hver side skal ha minst én PlayerHQ-CTA**, men aldri som popup, aldri agressiv. Mønstre:
- **Mersalg-bånd midt på siden** (primær bakgrunn, lime accent, kort tekst, én knapp + liste over PlayerHQ-fordeler)
- **Slutt-CTA i bunn** (hvit/secondary bakgrunn, sentrert, én primær + én sekundær knapp)
- **Kontextuell nudge** i interaktive resultater ("Vil du følge din egen drive distance over sesongen? PlayerHQ logger den automatisk.")

**Aldri:**
- Popup-vegg
- "Premium-låst" innhold
- Cookie-banner som skygger CTA
- Mer enn 1 mersalg per skroll-skjerm

---

## Tekniske constraints

- **Bare server components der mulig**, client components kun for interaktive deler (slidere, charts, skjemaer)
- **ISR med `revalidate: 3600`** på offentlige stats-sider
- **Recharts** for grafer (allerede installert)
- **Native HTML `<input type="range">`** for slidere med `accent-primary` (ingen shadcn Slider)
- **Mobile-first** men optimer like nøye for desktop — analytics-sidene leses mest på laptop
- **Lighthouse Performance > 90** krav på alle sider

---

## Komponentbibliotek som finnes (gjenbruk!)

| Komponent | Sti | Formål |
|---|---|---|
| `<AthleticEyebrow>` | `components/athletic/eyebrow.tsx` | Eyebrow over hero (mono caps, lime/forest) |
| `Card` | `components/ui/card.tsx` | shadcn card-primitiv |
| `Badge` | shadcn | Pills, tags |
| `<MersalgBanner>` | `components/turneringer/mersalg-banner.tsx` | PlayerHQ-mersalg-bånd |
| `<NorskeDenneUkaWidget>` | `components/turneringer/norske-denne-uka-widget.tsx` | "Norske i aksjon"-strip |

Ny komponent-design må kunne implementeres med Tailwind v4 + de eksisterende primitivene.

---

## Ti separate design-prompts

Hver av de neste 9 filene er en selvstendig prompt til Claude Design — gi den én av gangen, eller alle samlet for konsistent visjon. Hver kan implementeres uavhengig.

| Fil | Side | Status nå | Designmål |
|---|---|---|---|
| `01-hub-landing.md` | `/stats` | Funksjonelt minimum | Editorial hero, "Norske i aksjon"-strøk, 4 modul-kort med live-tall, 2 mersalg-blokker |
| `02-pga-hub.md` | `/stats/pga` | 6 funksjonelle kort | Bento-grid med live tour-snitt, KPI-strip, sammenligning "Du vs Tour" |
| `03-pga-kategori-detalj.md` | `/stats/pga/[6 kategorier]` | Slider + topp-20 | Editorial interaktiv graf, "Hvor du står"-modul, narrativ struktur |
| `04-pga-putt-explorer.md` | `/stats/pga/putt-explorer` | Slider + bar-chart | Heatmap + "Du vs Tour fra X meter"-storytelling |
| `05-norsk-spillerbase-sok.md` | `/stats/spillere` | Søk + tabell | "Talent-database" som ESPN/DataGolf, filter-chips, hover-preview |
| `06-norsk-spillerbase-profil.md` | `/stats/spillere/[slug]` | Tabs + tabell | Editorial spillerprofil — hero, career arc, sammenligning |
| `07-sg-sammenlign-landing.md` | `/stats/sg-sammenlign` | Hero + 3-stegs forklaring | Mest "selgende" siden — emotionell hook + visuell demo |
| `08-sg-sammenlign-onboarding.md` | `/stats/sg-sammenlign/start` | 2-stegs skjema | Wizard-feel, full-screen, en ting om gangen |
| `09-sg-sammenlign-resultat.md` | `/stats/sg-sammenlign/resultat/[id]` | Radar + KPI + CTA | "Wow"-side — radar er hovedperson, narrativ analyse, delbar |

---

## Felles output-format jeg ønsker fra Claude Design

For hver side, lever:

1. **Hero-design** — komposisjon, typografi-hierarki, eventuell visuell (Lucide-illustrasjon, micro-animasjon, eller foto)
2. **Section-by-section layout** — hva som kommer etter hero, i hvilken rekkefølge
3. **Komponenter som må bygges nye** — gi dem navn, sketch deres props/struktur
4. **Mobile-versjon** — explicit hvordan hver section kollapser
5. **Mikrointeraksjoner** — hover, focus, scroll-reveal, slider-tilbakemelding
6. **2-3 referansebilder** — screenshots eller skissestil som inspirasjon
7. **Implementasjons-snippet** — TSX-eksempel for hovedseksjonen (kan være ufullstendig, bare nok til at utvikler skjønner intensjon)
