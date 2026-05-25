# 13 — Athletic Editorial (visuell retning)

**Status:** Live på `akgolf.no/portal` (2026-05-25). Den kanoniske referansen for alle nye skjermer.

---

## Hva er "athletic editorial"?

En hybrid av to estetikker som ellers ville bittet hverandre:

- **Editorial** = magasinkvalitet: stor display-typografi, italic accent, generøs hvitplass, mono uppercase eyebrows, rolig rytme.
- **Athletic** = atletikk-app: dramatiske tall, dark moments, photography-led hero, prominent CTAs, energisk lime accent.

Vi henter det beste fra begge:
- **Fra editorial:** Inter Tight italic på hero, mono eyebrows, lime accent-strek mellom seksjoner, rolig spacing
- **Fra athletic:** Real photography (AK Golf Academy), 120px display-tall, sort countdown-card, prominent uppercase CTAs

**Referanser:**
- Editorial: Kinfolk magazine, Cereal, fin arkitektur-fotografering
- Athletic: Zonixx, Whoop, Strava Pro, Apple Fitness+
- AK-spesifikt: AK Golf Academy-bibliotek (41 ekte foto)

**Hva vi IKKE er:**
- ❌ Bleacher Report / ESPN (for loud)
- ❌ Old-school golf-prowidde (gammelt + amerikansk)
- ❌ Generisk SaaS-dashboard (kjedelig + skala-kopiert)
- ❌ Crypto-luxury (svart-gull, peppermyn-gull, etc.)

---

## De fem grunnpilarene

### 1. Photography-led hero

Hver hovedseksjon kan ha en hero med ekte AK Golf Academy-foto som bakgrunn:

```tsx
<Image src="/images/akgolf/AK-Golf-Academy-1.webp" fill priority />
<div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/55 to-black/20" />
<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
```

**Hvorfor to gradients:**
- Først `to-br` (top-left → bottom-right): mørkner toppen + venstre for tekst-lesbarhet
- Deretter `to-t` (bunn → topp): forsterker bunnkanten der meta-data ligger

**Tekst på hero:**
- Hilsen: `font-display text-4xl md:text-6xl font-bold italic` + lime accent på fornavn
- Meta-rad: `font-mono text-xs uppercase tracking-[0.10em]` med store tabular tall

**Min-høyder:**
- Mobile: 340px
- Desktop: 440px

### 2. Dark moments på lys base

Lys cream-bakgrunn er default. Men 1-2 utvalgte cards per side blir **mørke** for dramatisk kontrast:

```tsx
// Lys card (default)
className="rounded-2xl border border-border bg-card p-6"

// Dark moment (selektivt — typisk hovedhandling eller countdown)
className="rounded-2xl bg-foreground p-6 text-background shadow-xl"
```

**Hvor:**
- `NextTournamentCountdown` → dark moment (120px lime-tall mot sort bg)
- `QuickActions` highlight-tile → dark moment (sort bg + lime accent-ikon)
- `PlayerHeroImage` CTA-area → dark gradient over photo

**Regel:** Max 2 dark moments per skjerm. Mer enn det tipper balansen.

### 3. Display-tall (alltid tabular)

Tall er heltemaer i athletic editorial:

| Bruk | Størrelse | Eksempel |
|---|---|---|
| Countdown-tall (hero) | `text-[80px] sm:text-[120px] leading-[0.85]` | 21 dager til Sørlandsåpent |
| KPI-stats | `text-3xl tabular-nums` | "4 økter / 6t" |
| HCP / SG | `font-display text-base sm:text-lg tabular-nums` | "HCP -2.1" |
| Eyebrows | `font-mono text-[10px] uppercase tracking-[0.14em]` | "PROGRAMMET I DAG" |

**Alle tall:** Inter Tight bold + `tabular-nums` ELLER JetBrains Mono.

### 4. Editorial section dividers

Mellom seksjoner: `<SectionHeader>` med lime accent-strek:

```tsx
<SectionHeader
  eyebrow="Programmet i dag"
  title="I dag"
  description="5 økter planlagt — tidslinje fra 05:00 til 24:00."
  cta={{ label: "Full kalender", href: "/portal/kalender" }}
/>
```

**Anatomi:**
- Lime strek `h-px w-8 bg-accent` til venstre for eyebrow
- Eyebrow: mono uppercase 10px tracking-[0.16em]
- Tittel: display 2xl/3xl bold
- Description: muted, max-w-prose
- CTA: pill med border + uppercase mono label

**Spacing mellom seksjoner:** `space-y-10 lg:space-y-12` (40-48px).

### 5. Type-spesifikke farger

Ikon-sirkler og badges får farge etter funksjon, ikke etter pyramide-akse:

```tsx
// AI-Insights — 3 typer
HANDLING:     bg-accent text-accent-foreground          // lime (mest aksjon)
OBSERVASJON:  bg-info/15 text-info                       // blå (analyse)
MAAL:         bg-primary/10 text-primary                 // forest (langsiktig)

// Pyramide-pills (Calendar, TrainingPartners)
FYS:    bg-primary/10 text-primary                       // forest
TEK:    bg-warning/10 text-warning                       // amber
SLAG:   bg-info/10 text-info                              // blå
SPILL:  bg-accent/30 text-accent-foreground              // lime accent
TURN:   bg-destructive/10 text-destructive               // red
```

Hvorfor primary/warning/info/accent/destructive (ikke pyr-*-tokens):
- Bedre WCAG-kontrast (text-pyr-slag = lime tekst, gir AA-fail)
- Mer konsistent med øvrig UI (`destructive` brukes også for slett)
- pyr-*-tokens er stadig tilgjengelige for bg-only bruk (charts, progress-bars)

---

## Mønstre per komponent-type

### Hero-card

```tsx
<div className="relative overflow-hidden rounded-2xl shadow-xl min-h-[340px] md:min-h-[440px]">
  <Image src="..." fill priority className="object-cover" />
  <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/55 to-black/20" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

  <div className="relative flex h-full min-h-[340px] flex-col justify-between p-6 md:min-h-[440px] md:p-12">
    {/* Topp-rad: pill + avatar */}
    {/* Hilsen + meta-rad */}
  </div>
</div>
```

### Dark moment-card

```tsx
<section className="rounded-2xl bg-foreground p-6 text-background shadow-xl sm:p-8">
  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">EYEBROW</p>
  <h3 className="font-display text-2xl font-bold text-background sm:text-3xl">Tittel</h3>
  <div className="my-6 border-y border-background/15 py-6">
    <span className="font-display text-[80px] sm:text-[120px] font-bold leading-[0.85] tabular-nums text-accent">
      21
    </span>
    <span className="font-mono text-xs uppercase tracking-[0.12em] text-background/60">dager igjen</span>
  </div>
  {/* Innhold med text-background eller text-background/60 */}
  {/* CTA: bg-accent text-accent-foreground rounded-full px-6 py-2.5 uppercase tracking-[0.08em] */}
</section>
```

### Stat-tile (4-grid)

```tsx
<div className="flex flex-col gap-2 rounded-xl border border-border bg-background/50 p-4">
  <div className="flex items-center justify-between gap-2">
    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
      Energi
    </span>
    <Activity className="size-4 text-muted-foreground" />
  </div>
  <div className="flex items-baseline gap-1.5">
    <span className="font-display text-3xl font-bold tabular-nums">7</span>
    <span className="font-mono text-xs text-muted-foreground">/10</span>
  </div>
</div>
```

### Insight-card med type-badge

```tsx
<article className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:p-7">
  {/* Topp-rad: ikon-sirkel + type-badge */}
  <div className="flex items-start justify-between gap-3">
    <span className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground">
      <Sparkles className="size-6" strokeWidth={1.5} />
    </span>
    <span className="rounded-full bg-foreground px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-background">
      Handling
    </span>
  </div>
  {/* Eyebrow */}
  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
    Putting-økt anbefales
  </p>
  {/* Body (display medium) */}
  <p className="flex-1 font-display text-[17px] font-medium leading-[1.45] text-card-foreground">
    Du har ikke trent putting siste 10 dager. Plan-en din sier 2x/uke...
  </p>
  {/* CTA */}
  <Link className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-foreground">
    Bestill økt <ArrowRight className="size-3.5" />
  </Link>
</article>
```

### Section header (editorial divider)

```tsx
<header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
  <div className="space-y-2">
    {/* Lime accent-strek + eyebrow */}
    <div className="flex items-center gap-2.5">
      <span className="h-px w-8 bg-accent" />
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        Programmet i dag
      </p>
    </div>
    {/* Tittel */}
    <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
      I dag
    </h2>
    {/* Description (valgfri) */}
    <p className="max-w-prose text-sm text-muted-foreground">
      5 økter planlagt — tidslinje fra 05:00 til 24:00.
    </p>
  </div>
  {/* CTA-pill (valgfri) */}
  <Link className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.10em]">
    Full kalender <ArrowRight className="size-3.5" />
  </Link>
</header>
```

---

---

## 🎬 LIVING APP — bevegelse og data-storytelling (v3 tillegg)

Den tekniske spec'en (5 grunnpilarer ovenfor) er ikke nok alene. Etter
iterasjon mot Linear + Whoop + Notion lærte vi at en skjerm må også
PULSE og LEVE for å føles premium athletic. Disse 7 lagene er
forskjellen mellom "et dashboard" og "en app som lever":

### 1. Count-up på tall

Alle numeriske KPI teller opp fra 0 til verdi når de scroller inn i viewport:

```ts
function useCountUp(target, { duration = 800, decimals = 0 } = {}) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    // Respekter prefers-reduced-motion
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setVal(target); return; }

    let raf = 0, started = false, t0 = 0;
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    function tick(now) {
      if (!t0) t0 = now;
      const p = Math.min(1, (now - t0) / duration);
      setVal(target * ease(p));
      if (p < 1) raf = requestAnimationFrame(tick);
    }

    // Bruk scroll-listener, ikke IntersectionObserver (upålitelig i iframes)
    function check() {
      if (started || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.top < vh * 0.95 && r.bottom > 0) {
        started = true;
        raf = requestAnimationFrame(tick);
      }
    }
    check();
    window.addEventListener("scroll", check, { passive: true, capture: true });
    window.addEventListener("resize", check, { passive: true });
    return () => { cancelAnimationFrame(raf); /* + remove listeners */ };
  }, [target, duration]);

  return [decimals === 0 ? Math.round(val) : val.toFixed(decimals), ref];
}
```

**Brukes på:** HCP, økter, drills, runder, tester, SG-tall, dager-igjen
**Brukes IKKE på:** countdown-tall (skal være ferdig fra start), tournament-countdown (signaturmoment)

### 2. Progress-bar stagger fill

I WeekProgressCard fyller pyramide-barene seg fra 0% til verdi:
- Stagger 80ms per akse (FYS → TEK → SLAG → SPILL → TURN)
- Duration 1200ms per bar
- Ease-out cubic
- Trigget av scroll-listener (samme prinsipp som useCountUp)

### 3. Hero parallax + grain

```css
/* Hero img scaler 1.0 → 1.05 ved scroll */
.hero-img {
  transform: scale(var(--hero-scale, 1));
  transition: transform 0.1s linear;
}

/* Grain-overlay for taktil premium */
.hero-grain {
  background-image: url("data:image/svg+xml,...noise-pattern...");
  opacity: 0.03;
  mix-blend-mode: overlay;
}
```

### 4. Pulse-animasjoner

```css
@keyframes itinPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.5; transform: scale(0.85); }
}

@keyframes nowPulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(192,57,43,0.18); }
  50%      { box-shadow: 0 0 0 8px rgba(192,57,43,0.08); }
}

@keyframes hcpTrendPulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.08); }
}
```

**Brukes på:**
- `.itin-pulse` — "Pågår nå"-pill i itinerary
- `.itin-now-dot` — NÅ-markør i timeline
- `.live-bar-dot` — Live-indikator i LiveBar
- `.hero-trend-pulse` — HCP-trend-pil i hero

### 5. Color-mix tinted backgrounds

Moderne CSS som gir perseptuelt riktig fargeblanding (mye bedre enn rgba):

```css
.itin-card.axis-FYS {
  background: color-mix(in oklab, var(--pyr-fys) 16%, var(--card));
  border-left: 5px solid var(--pyr-fys);
}

.itin-card.axis-SPILL {
  background: color-mix(in oklab, var(--pyr-spill) 20%, var(--card));
}
```

`color-mix(in oklab, ...)` er oklab-fargerommet — perseptuelt uniform,
gir konsistent kontrast på tvers av forskjellige farger.

### 6. Data-storytelling (kontekst-linjer)

Hvert tall får en context-linje under seg i 11px lime mono:

```tsx
<StatTile
  hero
  label="Økter denne uka"
  value={4}
  unit="/ 6t"
  context="+1 vs forrige uke"
  contextTone="accent"
/>

<StatTile compact label="Runder" value={2} context="2 over mål" />
<StatTile compact label="Drills" value={12} context="beste på 3 mnd" />
<StatTile compact label="Tester" value={3} context="3 forfaller" contextTone="critical" />
```

Kontekst-linjer er det som skiller athletic-app fra SaaS-dashboard.
Aldri vis et tall uten kontekst.

### 7. Live elements (LiveBar)

En tynn bar mellom topbar og hero som SKJER nå:
- Tickende klokke (`Nå 09:42:23` oppdaterer hvert sekund)
- Neste økt-countdown (`Neste · TEK-økt · om 1t 18min`)
- Vær (`GFGK 14°C sol`)
- Pulserende grønn dot (lime)
- Hvis økt starter <30 min: hele bar blir rød med ekstra pulse + klikkbar

```tsx
<LiveBar
  currentTime={9.7}          // 09:42 som decimal hours
  nextSession={{ start: 11, title: "TEK-økt", id: "s3" }}
  weather={{ club: "GFGK", tempC: 14, summary: "sol" }}
  critical={false}
  onAlertClick={() => openStubModal("live")}
/>
```

---

## Hvordan stilen kommer fram per page-arketype

### Hjem/dashboard (workbench)
- Stort hero med photo + dark gradient
- 4-6 seksjoner med SectionHeader mellom
- 1-2 dark moments (typisk countdown + highlight-action)
- Stat-tiles med display-tall

### Detalj-side (drill, session, plan)
- Breadcrumb øverst (subtilt, ikke editorial)
- Tittel-rad med display 3xl + status-pill
- KPI-rad med 4 stat-tiles
- Tabs for delseksjoner (uten dark moment)
- Sticky bottom-CTA i pill-form

### Liste-side (drill-bibliotek, spillere)
- SectionHeader øverst
- Filter-pills (subtilt) i én rad
- Grid med cards (lys, ikke dark)
- Card hover: -translate-y-0.5 shadow-md

### Form/wizard
- Hero-banner: forest-grønn primary bg + lime accent stripe
- Form-felter: 16px Inter base, rounded-md border
- Step-indikator: pills med mono uppercase

### Auth/landing
- Mer dramatisk hero — full-bredde foto
- Big italic display 6xl/7xl
- Login-card kan være dark moment

---

## Animasjoner (subtile)

- **Hover-løft:** `hover:-translate-y-0.5 transition-all duration-200`
- **Hover-shadow:** `hover:shadow-md` (cards) eller `hover:shadow-lg` (heros)
- **Skala-på-hover:** kun på ikon-sirkler i Quick Actions
- **Pil-translate:** `group-hover:translate-x-0.5` på CTA-piler

**Ingen:**
- Page-transitions (føles tregt)
- Bounce-animasjoner
- Confetti / partikkel-effekter
- Auto-roterende karuseller

---

## Gjør / Ikke gjør

| Gjør | Ikke gjør |
|---|---|
| Bruk ekte AK Golf Academy-foto | Bruk stock-foto av smilende business-folk |
| Sett dark moments selektivt (1-2 per side) | Gjør hele siden dark — vi er light by default |
| Bruk lime accent som highlight, ikke tema | Fyll hele cards med lime |
| Display-tall i Inter Tight bold + tabular | Bruk default Inter for store tall |
| `<SectionHeader>` mellom alle seksjoner | Hopp rett fra card til card uten rytme |
| Italic på fornavn i hilsen | Italic på all tekst |
| Mono uppercase eyebrows på alt | Sentence-case eyebrows |
| Rounded-2xl på hero + dark moments | Rounded-md (12px) på cards (det er buttons) |

---

## Verifikasjon

Den live referansen:
**https://akgolf.no/portal** (logget inn som spiller)

Sammenlign nye design mot denne. Hvis det avviker:
- Mangler det dark moment? Mangler photo-hero?
- Mangler SectionHeader-rytme?
- Er tallene ikke display + tabular?

Da er det IKKE athletic editorial — det er bare "et dashboard". Juster.
