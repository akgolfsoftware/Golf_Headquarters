# Runde 1 — PlayerHQ Auth + Onboarding (13 skjermer)

**Plattform:** Mobil-first (PlayerHQ). Desktop = sentrert kort paa cream-bg, samme komponenter.
**Komponenter-katalog:** preview/-mappen i AK Golf HQ Design System (74 filer)
**Status:** Klar til Claude Design

---

## Skjerm-oversikt

| # | Rute | Hva | Plattform | Hovedkomponenter |
|---|---|---|---|---|
| 1 | /onboarding/velkommen | Splash + CTA | Mobil + desktop | components-featured, components-buttons |
| 2 | /onboarding/konto | E-post + passord | Mobil + desktop | components-inputs, components-buttons |
| 3 | /onboarding/personalia | Navn + foedselsdato | Mobil + desktop | components-inputs |
| 4 | /onboarding/foresatt | Foresatt-verifisering (<18) | Mobil + desktop | components-inputs, components-compliance |
| 5 | /onboarding/profil-type | Mosjon vs konkurranse | Mobil + desktop | components-onboarding (profil-velger) |
| 6 | /onboarding/nivaa | HCP + mal | Mobil + desktop | components-inputs (slider), components-onboarding |
| 7 | /onboarding/fasilitet | Drag-slidere for fasiliteter | Mobil + desktop | components-drag-slider |
| 8 | /onboarding/abonnement | 3 abonnement-kort | Mobil + desktop | components-subscription |
| 9 | /onboarding/aktivering | AI-genererer plan | Mobil + desktop | components-onboarding (loader) |
| 10 | /auth/login | Innlogging | Mobil + desktop | components-inputs, components-buttons |
| 11 | /auth/forgot-password | Glemt passord | Mobil + desktop | components-inputs |
| 12 | /auth/bankid | BankID placeholder | Mobil + desktop | components-buttons |
| 13 | /auth/logget-ut | Bekreftelse | Mobil + desktop | components-featured (lite) |

---

## 1. /onboarding/velkommen — Splash

**Hva:** Foerste skjerm en ny bruker ser. To valg: logg inn eller kom i gang.

### Wireframe (mobil 430px)
```
┌────────────────────────────────────┐
│  [Foto-hero, hel-skjerm, golden    │
│   hour fairway m/ gradient overlay]│
│                                    │
│   [ak-logo-white-on-dark 56px]     │
│                                    │
│   AK GOLF · SIDEN 2014             │  ← eyebrow lime caps, tone="light"
│                                    │
│   Hvor langt slår                  │
│   du egentlig?                     │  ← display 36px, "egentlig" italic lime
│                                    │
│   Verktøyet for spillere som vil   │
│   bli bedre. Bygd av coacher.      │  ← muted 14px
│                                    │
│   [Logg inn]            (ghost)    │
│   [Kom i gang →]    (lime pill CTA)│
│                                    │
│   38 AKTIVE SPILLERE · 2014        │  ← mono caps nederst
└────────────────────────────────────┘
```

### Komponenter brukt
- **components-featured** (full-bleed foto-hero med dark gradient) — preview/components-featured.html
- **components-buttons** (lime pill primary + ghost secondary) — preview/components-buttons.html
- **components-eyebrow** (lime tone, "AK GOLF · SIDEN 2014") — preview/components-eyebrow.html

### States
- Default: som vist
- Loading: kort skeleton-shimmer paa tekst

### Desktop-tilpasning
Sentrert kort 480px paa cream-bg. Foto-hero fyller bakgrunnen, kort foran.

### Claude Design-prompt
```
Design en mobil splash-skjerm (430px bredde) for AK Golf HQ.

Layout:
- Full-bleed foto-hero som fyller skjermen (foto: golfbane golden hour, AK Golf-bibliotek)
- To gradient-overlay: top from-black/40 to-transparent (status-bar legibility), bottom from-transparent to-black/55 (tekst-legibility)
- AK-logo white-on-dark 56px, plassert sentralt nær toppen
- Eyebrow lime: "AK GOLF · SIDEN 2014" (mono caps 10px, tracking 0.12em)
- Display-tittel: "Hvor langt slår du egentlig?" Inter Tight 36px, italic-aksent på "egentlig" i lime
- Sub-tekst: "Verktøyet for spillere som vil bli bedre. Bygd av coacher." (Inter 14px, white/70)
- To CTA nederst: "Logg inn" (ghost-light) + "Kom i gang →" (lime pill primary)
- Footer-tag: "38 AKTIVE SPILLERE · 2014" (mono caps 10px nederst)

Bruk components-featured som basis. Hold DS-tokens: forest #005840, lime #D1F843, ingen hardkoda hex.
```

---

## 2. /onboarding/konto — Opprett konto

**Hva:** E-post + passord + Google OAuth.

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│ ← Tilbake                          │
│                                    │
│ STEG 1 AV 7                        │  ← mono progress-eyebrow
│                                    │
│ Opprett kontoen din                │  ← display, italic "din"
│                                    │
│ Vi bruker e-posten til varsler og  │
│ for å koble deg til coach hvis     │
│ du blir tilknyttet en gruppe.      │  ← muted 14px
│                                    │
│ ┌──────────────────────────────┐  │
│ │ E-POSTADRESSE                │  │  ← mono caps label
│ │ din@e-post.no                │  │  ← components-inputs
│ └──────────────────────────────┘  │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ PASSORD                  [👁] │  │  ← Eye-toggle
│ │ Minst 8 tegn                 │  │
│ └──────────────────────────────┘  │
│                                    │
│ ─────── ELLER ───────              │
│                                    │
│ [G Fortsett med Google]            │  ← secondary outline
│                                    │
│ [Fortsett →]                       │  ← primary CTA
└────────────────────────────────────┘
```

### Komponenter brukt
- **components-inputs** (e-post, passord m/ Eye-toggle) — preview/components-inputs.html
- **components-buttons** (Google OAuth + primary CTA) — preview/components-buttons.html
- Progress-eyebrow: "STEG 1 AV 7" — components-eyebrow.html
- Tilbake-pil: Lucide ChevronLeft

### States
- Default: tomme felt
- Validering: inline error under felt ("E-postadressen er ugyldig", "Passord maa vaere minst 8 tegn")
- Loading: CTA disabled + spinner mens konto opprettes

### Claude Design-prompt
```
Design /onboarding/konto for PlayerHQ (mobil-first 430px, desktop sentrert 480px kort).

Header:
- "← Tilbake" tekst-link (Lucide ChevronLeft + tekst, muted)
- Progress: "STEG 1 AV 7" (mono caps, muted)

Innhold:
- Display-tittel: "Opprett kontoen din" (Inter Tight, italic på "din" i primary)
- Sub-tekst om hvorfor e-post (Inter 14px, muted)
- Form med to inputs (components-inputs):
  1. E-postadresse (label mono caps, placeholder "din@e-post.no", type=email)
  2. Passord (label mono caps, Eye/EyeOff toggle høyre, type=password, "Minst 8 tegn" hint)
- "ELLER"-divider (hr + sentert "ELLER"-tekst mono)
- "Fortsett med Google" (secondary outline + Google-ikon)
- "Fortsett →" (primary CTA, lime pill)

Inline validering under hvert felt. Norsk feilmeldinger.
DS-tokens kun. 8pt-grid.
```

---

## 3. /onboarding/personalia — Navn + foedselsdato

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│ ← Tilbake                          │
│                                    │
│ STEG 2 AV 7                        │
│                                    │
│ Hvem er du?                        │  ← italic "du"
│                                    │
│ ┌──────────────────────────────┐  │
│ │ FORNAVN                      │  │
│ └──────────────────────────────┘  │
│ ┌──────────────────────────────┐  │
│ │ ETTERNAVN                    │  │
│ └──────────────────────────────┘  │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ FØDSELSDATO                  │  │
│ │ DD.MM.ÅÅÅÅ                   │  │
│ └──────────────────────────────┘  │
│                                    │
│ KJØNN (valgfritt)                  │  ← mono caps label
│ ( ) Mann  ( ) Kvinne  ( ) Annet    │  ← radio buttons
│                                    │
│ [Fortsett →]                       │
└────────────────────────────────────┘
```

### Komponenter
- components-inputs (text + dato)
- Radio buttons (components-inputs har radio-variant)

### Logikk
- Hvis foedselsdato < 18 aar → neste skjerm = /onboarding/foresatt
- Hvis >= 18 aar → neste = /onboarding/profil-type

### Claude Design-prompt
```
Design /onboarding/personalia. Bygg på samme mønster som steg 1.

Form:
- Fornavn (text input)
- Etternavn (text input)
- Fødselsdato (date input, format DD.MM.ÅÅÅÅ)
- Kjønn (radio: Mann/Kvinne/Annet — valgfritt, merket med "(valgfritt)" mono caps)

Bruk components-inputs.html som referanse. Samme header-mønster som steg 1 (← Tilbake + STEG 2 AV 7).
```

---

## 4. /onboarding/foresatt — Foresatt-verifisering (<18, GDPR-hard-gate)

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│                                    │
│ STEG 2.5 · KREVES FOR UNDER 18     │  ← warning eyebrow tone
│                                    │
│ Vi trenger foresatt                │
│ sin godkjenning.                   │  ← italic "godkjenning"
│                                    │
│ I henhold til GDPR må en foresatt  │
│ bekrefte at du kan bruke AK Golf   │
│ HQ.                                │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ FORESATTES E-POSTADRESSE     │  │
│ │ forelder@e-post.no           │  │
│ └──────────────────────────────┘  │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ FORESATTES NAVN              │  │
│ └──────────────────────────────┘  │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ ⓘ Foresatt får en lenke på   │  │
│ │   e-post der de bekrefter at │  │  ← components-compliance
│ │   du kan bruke appen. Du må  │  │     info-card mønster
│ │   vente på bekreftelse før   │  │
│ │   du kan logge inn.          │  │
│ └──────────────────────────────┘  │
│                                    │
│ [Send forespørsel →]               │
└────────────────────────────────────┘
```

### Komponenter
- components-inputs (e-post + tekst)
- components-compliance (info-card med GDPR-tekst) — preview/components-compliance.html
- Warning-tone eyebrow (mono caps i warning-color)

### Bekreftelses-state etter klikk
"Sjekk e-posten til foresatt. De har 7 dager på å godkjenne. Du kan ikke logge inn før godkjenning er bekreftet."

### Claude Design-prompt
```
Design /onboarding/foresatt — GDPR-hard-gate for spillere under 18.

Layout:
- Eyebrow: "STEG 2.5 · KREVES FOR UNDER 18" (mono caps, warning-color)
- Display-tittel: "Vi trenger foresatt sin godkjenning." (italic på "godkjenning")
- Forklarende tekst om GDPR
- Form: foresattes e-post + foresattes navn (components-inputs)
- Info-card (components-compliance mønster, lime venstre-border) med forklaring av godkjennings-flyten
- CTA "Send forespørsel →" (primary)

Bekreftelses-state (etter send):
- Check-circle ikon
- "Forespørsel sendt"
- "Foresatt har 7 dager på å godkjenne"
- "Du kan ikke logge inn før godkjenning er bekreftet"

DS-tokens.
```

---

## 5. /onboarding/profil-type — Mosjon vs konkurranse

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│ ← Tilbake                          │
│                                    │
│ STEG 3 AV 7                        │
│                                    │
│ Hva er målet ditt?                 │  ← italic "målet"
│                                    │
│ Vi tilpasser appen til hvordan du  │
│ vil spille. Du kan endre senere.   │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ [Activity ikon, primary]      │  │
│ │ MOSJONSGOLFER                │  │  ← lime eyebrow
│ │                              │  │
│ │ Bli en bedre spiller          │  │  ← display
│ │ Planlegg trening, logg økter,│  │
│ │ følg fremgang. Enkel oversikt│  │
│ │                              │  │
│ │ ✓ Trenings-planlegger         │  │
│ │ ✓ Score-logging               │  │
│ │ ✓ Booking-coach               │  │
│ └──────────────────────────────┘  │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ [Trophy ikon, primary]        │  │
│ │ KONKURRANSEUTØVER            │  │
│ │                              │  │
│ │ Sats på prestasjoner          │  │
│ │ Periodisering, A-K-kategorier│  │
│ │ testuker, turneringsplan.    │  │
│ │ Full toppidrett-modell.      │  │
│ │                              │  │
│ │ Alt fra mosjon + mer         │  │
│ └──────────────────────────────┘  │
└────────────────────────────────────┘
```

### Komponenter
- components-onboarding (kort-velger mønster) — preview/components-onboarding.html

### Interaksjon
Klikk paa et kort → velger profil + auto-fortsett til neste steg

### Profilflagg-konsekvens
Mosjon ser ikke: periodisering, uke-43-testuker, WAGR, A-K-kategorier, avansert SG-breakdown
Konkurranse ser: alt

### Claude Design-prompt
```
Design /onboarding/profil-type. To store kort som er klikkbare og velgbare.

Hvert kort (components-onboarding-mønster):
- Stor Lucide-ikon i primary-color (Activity for mosjon, Trophy for konkurranse)
- Lime eyebrow: "MOSJONSGOLFER" eller "KONKURRANSEUTØVER"
- Display-tittel: "Bli en bedre spiller" / "Sats på prestasjoner"
- Forklarende tekst
- 3 features med Check-ikon

Klikk på kort = velger profil (hover: subtle lift + lime border).

Konsekvens-info nederst (kort tekst, kursiv): "Du kan endre senere i innstillinger."
```

---

## 6. /onboarding/nivaa — HCP + treningsfrekvens + mål

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│ ← Tilbake                          │
│                                    │
│ STEG 4 AV 7                        │
│                                    │
│ Hvor er du nå?                     │  ← italic "nå"
│                                    │
│ HVA ER DIN HCP?                    │  ← mono caps eyebrow
│ ┌──────────────────────────────┐  │
│ │ [-5 ──────●─────── 54]      │  │  ← slider
│ │            12,4              │  │  ← mono tall
│ └──────────────────────────────┘  │
│ ☐ Jeg har ikke handicap ennå       │
│                                    │
│ HVOR OFTE TRENER DU?               │
│ ( ) 1-2 ganger i uka               │
│ (●) 3-4 ganger i uka               │
│ ( ) 5+ ganger i uka                │
│                                    │
│ HVA ER MÅLET DITT?                 │
│ ┌──────────────────────────────┐  │
│ │ "Bli bedre på innspill og    │  │
│ │  putting"                    │  │
│ └──────────────────────────────┘  │  ← textarea
│                                    │
│ [Fortsett →]                       │
└────────────────────────────────────┘
```

### Komponenter
- components-drag-slider (HCP) — preview/components-drag-slider.html
- components-inputs (radio + textarea)

### Claude Design-prompt
```
Design /onboarding/nivaa.

Form:
- HCP-slider (components-drag-slider, range -5 til 54, snap 0.1, default 12.4)
- Sjekkboks "Jeg har ikke handicap ennå" (disabler slider hvis valgt)
- Treningsfrekvens (radio, 3 valg)
- Mål (textarea, valgfritt, placeholder med eksempel)

Tall i JetBrains Mono tabular-nums. Norsk komma (12,4).
```

---

## 7. /onboarding/fasilitet — Fasilitets-profil

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│ ← Tilbake          Hopp over →    │  ← skip-link
│                                    │
│ STEG 5 AV 7                        │
│                                    │
│ Hvor trener du?                    │  ← italic "trener"
│                                    │
│ Vi bruker dette til å foreslå      │
│ øvelser som passer dine fasilit.   │
│                                    │
│ PUTTING-GREEN — LENGSTE PUTT       │
│ [0 ─────────●─── 30m]              │
│           15 m                     │
│                                    │
│ LENGSTE CHIP                       │
│ [0 ──●──────────── 30m]            │
│       8 m                          │
│                                    │
│ LENGSTE PITCH                      │
│ [0 ──────●──────── 50m]            │
│           25 m                     │
│                                    │
│ LENGSTE BUNKERSLAG                 │
│ [0 ──────●──────── 20m]            │
│           10 m                     │
│                                    │
│ LENGSTE SLAG PÅ RANGE              │
│ [50 ──────────●─── 300m]           │
│             220 m                  │
│                                    │
│ ANDRE FASILITETER                  │
│ ☐ TrackMan-tilgang                 │
│ ☐ Vektstang / rack                 │
│ ☐ Trapbar                          │
│ ☐ Løpebane / tredemølle            │
│ ☐ Medisinball                      │
│                                    │
│ [Fortsett →]                       │
└────────────────────────────────────┘
```

### Komponenter
- **components-drag-slider** (5 meter-sliders) — preview/components-drag-slider.html
- components-inputs (checkboxer)

### Hopp over-logikk
Hvis bruker hopper over: paaminnelse etter 3 dager, 1 uke, 2 uker, 1 maaned. Plan-builder bruker conservative defaults inntil fylt.

### Claude Design-prompt
```
Design /onboarding/fasilitet med 5 meter-sliders.

Layout: 5 sliders stack-vertikalt. Hver slider har:
- Mono caps label ("PUTTING-GREEN — LENGSTE PUTT")
- Track med thumb i primary
- Verdi over thumb (mono caps "15 m")
- Snap til 5m

Range per slider:
- Putting green: 0-30m
- Lengste chip: 0-30m  
- Lengste pitch: 0-50m
- Lengste bunkerslag: 0-20m
- Lengste slag range: 50-300m

Under sliders: checkbox-gruppe "ANDRE FASILITETER" med 5 valg (TrackMan, Vektstang, Trapbar, Løpebane, Medisinball).

Hopp-over-link øverst høyre. CTA nederst.

Mobil-optimalisert: store touch-targets (44px+) på thumb og checkboxer.
```

---

## 8. /onboarding/abonnement — 3 abonnement-kort

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│ ← Tilbake                          │
│                                    │
│ STEG 6 AV 7                        │
│                                    │
│ Velg ditt abonnement               │  ← italic "ditt"
│                                    │
│ ┌──────────────────────────────┐  │
│ │ FRITTSTÅENDE VERKTØY         │  │
│ │ 300 kr / mnd                 │  │
│ │                              │  │
│ │ Full PlayerHQ — planlegg,    │  │
│ │ logg, analyser. Ingen        │  │
│ │ coaching.                    │  │
│ │                              │  │
│ │ ✓ Workbench + plan-builder    │  │
│ │ ✓ Live Session + treningslogg│  │
│ │ ✓ Stats + SG + TrackMan       │  │
│ │ ✗ Coaching-økter              │  │
│ │                              │  │
│ │ [Velg →]                     │  │
│ └──────────────────────────────┘  │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ ⭐ POPULÆR                   │  │  ← accent badge top-right
│ │ PERFORMANCE                  │  │
│ │ 1 300 kr / mnd               │  │
│ │                              │  │
│ │ 2 × 20 min coaching/mnd      │  │
│ │ + alt i frittstående         │  │
│ │                              │  │
│ │ [Velg →]                     │  │
│ └──────────────────────────────┘  │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ PERFORMANCE PRO              │  │
│ │ 2 300 kr / mnd               │  │
│ │                              │  │
│ │ 4 × 20 min coaching/mnd      │  │
│ │ + alt i frittstående         │  │
│ │                              │  │
│ │ [Velg →]                     │  │
│ └──────────────────────────────┘  │
│                                    │
│ ⓘ Gratis hvis du har gruppe-       │
│   invitasjon fra coach.            │
└────────────────────────────────────┘
```

### Komponenter
- **components-subscription** (abonnement-kort med pris + features) — preview/components-subscription.html
- AthleticBadge "POPULAER" (accent)

### Etter klikk
→ /onboarding/betaling (Stripe Setup Intent)

### Claude Design-prompt
```
Design /onboarding/abonnement. Tre abonnement-kort stack-vertikalt.

Per kort (components-subscription):
- Tittel (mono caps eyebrow)
- Pris (Inter Tight 32px, "300 kr / mnd")
- Beskrivelse (Inter 14px muted)
- Features-liste (Check/X-ikoner Lucide)
- "Velg →" knapp (primary)

Performance-kortet får "⭐ POPULÆR" badge øverst høyre (accent pill).

Info-banner nederst om gratis gruppe-invitasjon (info-color venstre-border).

Mobil-stack vertikalt. Desktop: 3 cols side-by-side.
```

---

## 9. /onboarding/aktivering — AI-genererer plan

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│                                    │
│  [ak-golf-logo-primary 56px]       │
│                                    │
│  [Check-circle stort lime]         │
│                                    │
│  ✓ AKTIVERT                        │  ← success-badge
│                                    │
│  Velkommen, Anders                 │  ← italic på navnet
│                                    │
│  Din konto er klar. Vi bygger nå   │
│  en treningsplan basert på det du  │
│  har fortalt oss.                  │
│                                    │
│  [Skeleton-shimmer-loader,         │
│   30 sek estimat]                  │
│                                    │
│  Estimat: 30 sekunder              │  ← mono small
└────────────────────────────────────┘
```

### Komponenter
- components-onboarding (loader-state) — preview/components-onboarding.html
- AthleticBadge "AKTIVERT" (success)

### Etter ferdig
Auto-redirect til /portal

### Claude Design-prompt
```
Design /onboarding/aktivering — loader/celebration-skjerm mens AI bygger startplan.

Layout:
- AK-logo primary 56px sentralt
- Stort Check-circle ikon (Lucide, lime, 88px)
- Success-badge "✓ AKTIVERT"
- Velkomst-tittel "Velkommen, [Fornavn]" italic på navn
- Forklarende tekst
- Skeleton-shimmer-loader (mock progress)
- Mono "Estimat: 30 sekunder"

Auto-redirect til /portal etter 30 sek. Hvis det går lengre: vis "Tar litt lengre tid... fortsett å vente" etter 60 sek.
```

---

## 10. /auth/login

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│                                    │
│  [ak-golf-logo-primary]            │
│                                    │
│ AK GOLF · LOGG INN                 │  ← lime eyebrow
│                                    │
│ Velkommen tilbake                  │  ← italic "Velkommen"
│                                    │
│ ┌──────────────────────────────┐  │
│ │ E-POSTADRESSE                │  │
│ └──────────────────────────────┘  │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ PASSORD                  [👁]│  │
│ └──────────────────────────────┘  │
│                                    │
│ ☐ Husk meg     Glemt passord? →   │
│                                    │
│ [Logg inn →]                       │  ← primary CTA
│                                    │
│ ─────── ELLER ───────              │
│                                    │
│ [G Fortsett med Google]            │  ← secondary
│                                    │
│ ──────────────────                 │
│                                    │
│ Ikke kunde ennå?                   │
│ Book gratis kartleggings-økt →     │
└────────────────────────────────────┘
```

### Komponenter
- components-inputs (e-post + passord m/ Eye-toggle)
- components-buttons (primary + secondary + text-link)

### States
| State | Visning |
|---|---|
| Default | Tom form |
| Loading | "Logger inn..." CTA disabled |
| Error | AthleticBadge variant="urgent" "Feil e-post eller passord" |
| Success | Auto-redirect /portal |

### Claude Design-prompt
```
Design /auth/login.

Layout:
- AK-logo primary 56px sentralt (klikkbar — gå til marketing forside)
- Lime eyebrow: "AK GOLF · LOGG INN"
- Display-tittel: "Velkommen tilbake" (italic på "Velkommen")
- Form: e-post + passord m/ Eye-toggle
- Rad: "☐ Husk meg" + "Glemt passord? →" (høyrejustert text-link)
- Primary CTA "Logg inn →" (forest fyld + lime tekst)
- "ELLER"-divider
- "Fortsett med Google" (secondary outline + Google-ikon)
- Footer-tekst med lime accent på "Book gratis kartleggings-økt →"

Error-state: AthleticBadge urgent "Feil e-post eller passord" over CTA.

Mobil + desktop. Bruk components-inputs + components-buttons.
```

---

## 11. /auth/forgot-password

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│ ← Tilbake til login                │
│                                    │
│ BISTAND · PASSORD                  │  ← lime eyebrow
│                                    │
│ Glemt passord? Det skjer           │
│ de beste.                          │  ← italic "Glemt"
│                                    │
│ Skriv inn e-posten din, så sender  │
│ vi deg en lenke til å sette nytt   │
│ passord. Sjekk søppelpost.         │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ E-POSTADRESSE                │  │
│ └──────────────────────────────┘  │
│                                    │
│ [Send lenke →]                     │
│                                    │
│ ← Tilbake til login                │  ← ghost-light
└────────────────────────────────────┘
```

### Success-state
```
✓ E-POST SENDT (ok badge)
Sjekk innboksen din. Lenken varer i 30 min.
```

### Claude Design-prompt
```
Design /auth/forgot-password. Samme stil som /auth/login.

Layout:
- "← Tilbake til login" (text-link top)
- Lime eyebrow: "BISTAND · PASSORD"
- Display-tittel: "Glemt passord? Det skjer de beste." (italic på "Glemt")
- E-post input
- "Send lenke →" primary
- "← Tilbake til login" ghost-light

Success-state (etter send):
- AthleticBadge "✓ E-POST SENDT" (ok)
- "Sjekk innboksen din. Lenken varer i 30 min."

Mobil + desktop.
```

---

## 12. /auth/bankid — Placeholder

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│                                    │
│  [shield-check ikon primary 88px]  │
│                                    │
│ BANKID · KOMMER POST-BETA          │  ← lime eyebrow
│                                    │
│ Verifiser med BankID               │  ← italic "BankID"
│                                    │
│ BankID-pålogging kommer på plass   │
│ etter beta-perioden. Bruk e-post/  │
│ passord eller Google for nå.       │
│                                    │
│ [Tilbake til vanlig login →]       │  ← primary
└────────────────────────────────────┘
```

### Claude Design-prompt
```
Design /auth/bankid som placeholder-side.

Layout:
- ShieldCheck Lucide-ikon 88px primary
- Lime eyebrow: "BANKID · KOMMER POST-BETA"
- Display-tittel: "Verifiser med BankID" (italic på "BankID")
- Forklarende tekst
- Primary CTA "Tilbake til vanlig login →"

Enkel og kort. Mobil + desktop.
```

---

## 13. /auth/logget-ut — Bekreftelse

### Wireframe (mobil)
```
┌────────────────────────────────────┐
│                                    │
│  [ak-golf-logo-primary]            │
│                                    │
│  [check-circle stort lime 88px]    │
│                                    │
│ AK GOLF · TAKK FOR DENNE GANG      │  ← lime eyebrow
│                                    │
│ Vi ses snart                       │  ← italic "ses"
│                                    │
│ Din sesjon er avsluttet. Logg inn  │
│ igjen når du er klar.              │
│                                    │
│ [Logg inn på nytt →]               │  ← primary
│ [Tilbake til akgolf.no]            │  ← ghost
│                                    │
│ ────────────────                   │
│ Hadde du en god økt?               │
│ Del feedback med post@akgolf.no    │
└────────────────────────────────────┘
```

### Claude Design-prompt
```
Design /auth/logget-ut — success-confirmation.

Layout:
- AK-logo primary 56px
- CheckCircle Lucide 88px lime
- Lime eyebrow: "AK GOLF · TAKK FOR DENNE GANG"
- Display-tittel: "Vi ses snart" (italic på "ses")
- Forklarende tekst
- To CTA: "Logg inn på nytt →" (primary) + "Tilbake til akgolf.no" (ghost)
- Footer: feedback-tekst med e-post

Mobil + desktop.
```

---

## Leveranse-status

**Levert nå (Runde 1):**
- 13 skjermer i PlayerHQ Auth + Onboarding
- Hver med: wireframe (mobil-first), komponenter-brukt-liste, Claude Design-prompt, states

**Neste (Runde 2):** PlayerHQ etter login — Hjem, Plan/Workbench, Stats, Profil + alle undertabs (18 skjermer).

**Spør:**
1. Stemmer komponent-referansene? (Hvis jeg refererer til en komponent du ikke kjenner, si fra — jeg utvider med ASCII)
2. Skal jeg lage desktop-wireframes for noen av disse, eller er "samme komponenter, sentrert kort 480px" presisjon nok?
3. Trenger jeg tomstate-eksempler per skjerm, eller er det implisitt?

Send "OK Runde 1" + svar på 1-3, så starter jeg Runde 2.
