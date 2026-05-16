# Sports Editorial — design system for AK Golf HQ

> Lim inn hele denne filen som "design system"-kontekst i Claude Design før du
> sender en skjerm-prompt. Filen er selvstendig — Claude trenger ikke kjenne
> Tailwind, Next, Prisma eller andre tekniske detaljer for å bruke den.

---

## 1. Identitet og mood

**Sports Editorial** = kollisjonen mellom et eksklusivt sports-magasin og en
performance-terminal for elite-atleter. Tenk:

- **Players Tribune** — atleten-fortellingen, lange italic-headlines, kraftige
  portretter
- **ESPN The Magazine (print)** — typografi som hovedperson, asymmetriske
  spreads, store sitatpiler
- **The Athletic** — datadrevet journalisme uten chartjunk
- **Eight Magazine / Howler** — boutique sports-zine, tør whitespace
- **Common Ground** — golf-zine, småfortellinger, foto-først
- **Sports Illustrated klassisk** — hero-photo + overlay-tittel

Stemning: Hver skjerm skal ha en **spread-følelse** — som du blar opp et magasin
om elite-golf. Bold hero, varierte spaltebredder, fotografi som puster, og data
som tegnes inn som annotasjoner — ikke som tabeller.

Anti-mood: "SaaS dashboard", "consumer app", "crypto neon", "marketing landing
page". Vi vil ha det redaksjonelle, ikke det promoterende.

Pinterest-referanser (bla 5 min i hver før design):
- https://www.pinterest.com/ideas/sports-editorial-design/926893147076/
- https://www.pinterest.com/ideas/sports-editorial-layout/946618950923/
- https://www.pinterest.com/martinryan94/sports-magazine-pages/
- https://www.pinterest.com/josephpandesign/espn-magazine/
- https://www.pinterest.com/btmaccount/asymmetrical-editorial-layouts/
- https://www.pinterest.com/ideas/sports-illustrated-magazine-layout/934018764090/
- https://www.pinterest.com/alisaaronson/typographic-spreads-publication-design/

---

## 2. Farger (uendret fra eksisterende brand)

Vi beholder hele den eksisterende paletten — kun bruksmønsteret endres.

### Brand-tokens (semantiske, lyst tema som default)

| Token | Lyst | Mørkt | Bruk |
|---|---|---|---|
| `--background` | #FAFAF7 cream | #0F2A22 deep forest | Side-bakgrunn (som magasin-papir) |
| `--foreground` | #0A1F17 ink | #F5F4EE bone | All tekst |
| `--card` | #FFFFFF | #163027 | Editorial card-bakgrunn |
| `--primary` | #005840 forest | #D1F843 lime | Hoved-CTA, accent-strek, signaturer |
| `--accent` | #D1F843 lime | #D1F843 lime | Highlight, "live now", éN per skjerm |
| `--muted` | #F1EEE5 | #1B3B30 | Sekundære felt, sidebar-bakgrunn |
| `--muted-foreground` | #5E5C57 | #9D9C95 | Bildetekster, metadata |
| `--border` | #E5E3DD | #2B4F42 | Hårfine streker, accent-strek |
| `--destructive` | #A32D2D | #D45353 | Slett, varsel |

### Pyramide-farger (for trenings-kategorier)

| Pyramide | Hex | Bruk |
|---|---|---|
| FYS | #003B2A | Fysisk trening |
| TEK | #005840 | Teknikk |
| SLAG | #2A7D5A | Golfslag |
| SPILL | #B7C97D | Spill-på-bane |
| TURN | #D1F843 | Turnering (med MØRK tekst #0A1F18 — aldri hvit) |

### Farge-regler

- **Cream-bakgrunn er magasin-papir.** Aldri rent hvitt på side-nivå.
- **Forest green som signatur-farge** — accent-strek til pull-quotes,
  primær-CTA, "Coach's note"-blokk. Ikke fyll på alle kort.
- **Lime KUN som tilfeldig vekkelse.** Maks ÉN lime-flate per skjerm
  (én CTA, eller én "live"-prikk, eller én TURN-blokk). Aldri lime på 3 ting
  samtidig.
- **Status-farger:** grønn #16A34A (positiv), amber #B8852A (varsel),
  rød #A32D2D (negativ), blå #2563EB (info). Brukes sparsomt.

---

## 3. Typografi — Instrument Serif løftes til hovedstemme

Tre fonter, alle gratis via Google Fonts:

| Font | Rolle | Detaljer |
|---|---|---|
| **Instrument Serif** | Display + editorial momenter | Italic er hovedstemme. Bruk OFTE — ikke maks 1 per skjerm. |
| **Geist** | UI + brødtekst | Variabel weight 300-700. Tabular-nums via `.tabular`. |
| **JetBrains Mono** | ALLE tall, datoer, prosenter, ankertekst | Tabular-nums alltid. |

### Typografisk skala

| Klasse | Størrelse | Font | Bruk |
|---|---|---|---|
| Cover | 96-128px | Instrument Serif italic | Hero-tittel på "cover"-skjermer |
| Display | 56-72px | Instrument Serif italic (eller regular for kontrast) | Skjerm-titler |
| Headline | 32-40px | Instrument Serif italic | Seksjons-titler |
| Subhead | 24-28px | Instrument Serif italic | Underseksjoner |
| Body Lead | 18-20px | Geist 400 | Innledende avsnitt |
| Body | 15-16px | Geist 400 | Brødtekst |
| Caption | 11-12px | Geist 500 uppercase, tracking 0.08em | Bildetekst, metadata |
| Pull quote | 28-44px | Instrument Serif italic | Full-bredde sitater |
| Stat Number | 64-128px | JetBrains Mono | Hovedtall (HCP, SG, antall) |
| Stat Label | 10-11px | Geist 500 uppercase, tracking 0.1em | Etikett under stat |
| Annotation | 13-15px | Instrument Serif italic | Annotasjoner pekende på data |

### Typografi-regler

- **Bruk italic Instrument Serif liberalt.** I Bloomberg+NYT-systemet var det
  maks 1 italic per skjerm. I Sports Editorial er italic hovedstemme — bruk på
  flere steder per skjerm.
- **Kombinér med pause.** Italic-headline skal stå med pust rundt seg —
  whitespace topp og bunn.
- **Geist for brødtekst er ALDRI bold.** Bare 400 (normal) eller 500 (medium)
  for emphasis. Aldri 700 i body.
- **Tall er fysiske objekter.** JetBrains Mono med tabular-nums, store
  størrelser (64px+), gjerne med en italic-annotasjon ved siden av som
  forklarer dem.
- **Norsk locale alltid:** Komma som desimal (4,2). Ikke-brytbar mellomrom som
  tusenskille (13 188). SG alltid med fortegn og typografisk minustegn:
  +2,92 eller −0,93.

---

## 4. Layout — magazine spread, ikke uniform grid

### Grunn-grid

12-kolonner, **men aldri brukt som 4×3 dashboard-grid**. Tenk magasin:

- **Hero spread** (full-bredde): 12-col title-foto-overlay
- **Lead spread**: 8-col brødtekst + 4-col foto/sidebar
- **Data spread**: 6-col stort tall + 6-col annotasjoner
- **Pull quote break**: 10-col centered med 1-col gutter hver side
- **Sidebar / TOC**: 3-col fixed med 9-col main

### Vertikal rytme

- **Seksjon-separasjon:** 96-128px whitespace mellom hovedseksjoner. Magasin
  spread-feel = tør store rom.
- **Innen seksjon:** 32-48px mellom block-elementer.
- **Mellom linjer:** body har line-height 1.5-1.6 (luftig), display har 1.05-1.1
  (stramt).

### Anti-AI varierte layouts

Aldri:
- 4 like kort på rad
- Centered alt
- Symmetrisk venstre/høyre
- Lik padding overalt

Alltid:
- Asymmetri som hierarki (det viktigste er størst og mest til venstre)
- Variere padding (noen seksjoner får mye luft, andre er tette)
- Photo break opp lange tekst-blokker
- "Marginalia" i sidemargene (små annotasjoner, dato-stempler)

### Magazine spread-pattern (eksempel for én skjerm)

```
┌─────────────────────────────────────────────────────────────┐
│  EYEBROW · UTGAVE 47 · ONSDAG 16. MAI                       │ ← caption, små
│                                                             │
│  Markus —                                                   │ ← cover-tittel
│  Nesten i mål.                                              │   Instrument
│  *Men ikke helt ennå.*                                      │   Serif italic
│                                                             │   96-128px
│  Forrige uke: HCP 4,2 → 3,9. Tre runder under par.          │ ← body lead
│  En måned igjen til Olyo Cup. Her er hva som teller.        │
│                                                             │
├─────────────────────────────────┬───────────────────────────┤
│                                 │                           │
│  [STAT BLOCK 64px tall]         │  [PHOTO: 4:5 portrait]    │
│  HCP-trend siste 12 mnd         │  Markus on the range,     │
│  *Ned 1,8 slag. Ditt beste år.* │  golden-hour.             │
│                                 │  Caption italic.          │
│                                 │                           │
├─────────────────────────────────┴───────────────────────────┤
│                                                             │
│            "Du må slutte å treffe putt med hendene.         │ ← pull quote
│            *Det er* hofta som styrer."                      │   Instrument
│                                              — coach anders │   Serif italic
│                                                             │   36px
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Komponent-bibliotek

### Hero spread

Full-bredde åpningsblokk. Eyebrow (caption-størrelse, uppercase, tracking) +
display-tittel (Instrument Serif italic) + lead-paragraf (Geist 18-20px).
Eventuelt foto til høyre eller bak.

```
EYEBROW · METADATA · DATO

[STOR TITTEL I INSTRUMENT SERIF]
*Italic for fragmenter eller hele setninger.*

Lead-paragraf i Geist, 18-20px, line-height 1.5.
Forklarer hva spread-en handler om.
```

### Pull quote (signatur-element)

Full-bredde eller centered med store marginer. Instrument Serif italic
28-44px. Forest green accent-strek (3-4px) til venstre. Person-attribusjon i
Geist uppercase 10-11px under.

```
│
│   *"Det er ikke teknikken som svikter når det teller.*
│    *Det er rytmen."*
│
│   — ANDERS KRISTIANSEN, COACH
```

### Stat block (Bloomberg-tetthet i editorial wrapping)

Stort JetBrains Mono-tall (64-128px) + tiny label (10-11px uppercase) + italic
Instrument Serif-annotasjon som forklarer tallet redaksjonelt.

```
4,2                              ← Stat number, JetBrains Mono 96px
HCP 16. MAI                      ← Stat label, Geist 10px uppercase

*Ned 1,8 slag siden januar.      ← Annotation, Instrument Serif italic 14px
Beste 12-måneders progresjon
på fire år.*
```

### Editorial card

Kort som etterligner et magasin-feature. Eyebrow (kategori, små) → italic
headline (Instrument Serif 24-32px) → kort body (Geist 14-15px) → eventuell
photo + caption.

Kortet skal IKKE være likt med naboen — varier bredder og høyder. Magasin-feel.

### Data annotation (NYT Upshot-stil)

SVG-graf med håndtegnete pil-annotasjoner som peker på spesifikke datapunkter.
Annotasjons-pil tegnes inn med `stroke-dashoffset`-animasjon på load.

Annotasjons-tekst er Instrument Serif italic 13-15px — som om en redaktør har
skrevet kommentar i marginen.

```
        (her oppdaget vi
        *hofta begynte å lukke seg*)
                  ↘
   ●────────●────●─●─●──────●        ← linje med datapunkter
   jan      feb   mar  apr   mai
```

### Coach voice (Anders' redaksjonelle innslag)

Blokk som ser ut som en redaktør-spalte. Liten avatar (24-32px) + navn i Geist
uppercase + italic Instrument Serif-tekst (16-18px) med "—" sitat-dash.

```
[AVATAR] ANDERS KRISTIANSEN, HEAD COACH

*"Markus har truffet en plateauet på 150-180m approach.*
*Vi prøver smal grønn-drill neste uke for å bryte gjennom."*
```

### TOC sidebar (table of contents)

Hvis sidebar brukes: skal ligne magasin-innholdsfortegnelse. Utgave-info
øverst, deretter nummererte seksjoner med italic-titler.

```
AK GOLF HQ
UTGAVE 47 — 16. MAI 2026

01  *Status*
02  *Treningsplan denne uka*
03  *Statistikk*
04  *Coach-melding*
05  *Milepæler*

PORTALER
↳ Tren
↳ Mål
↳ Coach
↳ Meg
```

### App header (masthead)

Full-bredde øverst. Logo eller wordmark "AK GOLF HQ" i Geist uppercase
tracking 0.15em. Liten utgaveinfo + dato i caption-størrelse. Hairline-stroke
under.

### Photo + caption

Aspect: 4:5 (portrait), 3:2 (landscape), 16:9 (cinematic), eller 1:1 (close-up).
Caption umiddelbart under, italic Instrument Serif 13-14px, kort som museum-tekst.

Når foto mangler: **bruk stor typografi i stedet** — aldri placeholder-grafikk.
La fraværet være intensjonelt.

### Footer / colophon

Bunn av side: tiny print i Geist 10-11px. "AK Golf HQ. Utgave 47. Onsdag 16.
mai 2026. Trykket digitalt fra Fredrikstad." Som magasin-kolofon.

---

## 6. Fotografi

### Type fotografi som passer

- **Golfere mid-swing** — fryst action, gjerne høy shutter-speed, mot enkel
  bakgrunn
- **Course landscapes** — vide, atmosfæriske, golden hour eller blue hour
- **Equipment close-ups** — ball, kølle-grep, hansker, range-buckets som
  still-life
- **Trackman-skjermer i bruk** — environmental, viser kontekst
- **Coach-spiller-interaksjoner** — observasjonelt, ikke posert

### Treatment

- Litt høyere kontrast enn standard
- Lett varm temperatur (matcher cream-paletten)
- Aldri Instagram-filtre, aldri B&W (med mindre det er bevisst portrett-grep)
- Premium men ekte. Foto-journalisme, ikke marketing-shoot.

### Placeholder-strategi

Når ekte foto ikke finnes:
1. **Stor typografi som hero** — Instrument Serif italic fyller plassen
2. **Skjerm-tegning** — abstrakt SVG-tegning av relevant data (heatmap,
   dispersion plot, course-grafikk)
3. **Solid forest-green-flate** med liten italic-tekst som tittel

ALDRI grå "placeholder.jpg"-bokser. ALDRI stock-photo som ser stock ut.

---

## 7. Motion og interaktivitet

- **Page-turn-feel** på navigasjon — subtil cross-fade (300ms) eller
  page-curl-suggestion på siste pixel
- **Count-up** på stat numbers (800ms, ease-out)
- **Stagger fade-up** på editorial cards (50ms forskjøvet, 400ms varighet)
- **Pull-quote scale-up** når den entrer viewport (fra 0.96 → 1.0, 600ms)
- **Annotation lines tegnes inn** med `stroke-dashoffset` (1000ms ease-out)
- **Photo parallax** på scroll (subtil, 0.1-0.2 hastighet)
- **Hover på editorial card:** lett løft (translateY -2px) + skygge

Aldri:
- Bounce eller spring-easing (for playful)
- Auto-roterende karusell
- Glitter eller partikler
- Page-load spinner (bruk skeleton-tilstander i editorial-stil i stedet)

### Command palette (⌘K)

Alle skjermer skal ha ⌘K command palette med kategorier:
- **Handlinger** (det jeg kan gjøre her)
- **Navigasjon** (gå til andre skjermer)
- **Sammenlign** (data-sammenligninger)
- **Analyse** (dypdykk i data)
- **Coach** (kontakt eller meld coach)
- **Hjelp** (snarveier, dokumentasjon)

Fuzzy-søk, tastaturnavigasjon (↑↓ Enter), Esc lukker. Animasjon: scale-pop fra
0.96, fade-in 200ms.

---

## 8. Tone og språk

- **Norsk bokmål** alltid. Æ ø å korrekt.
- **Editorial, ikke chummy.** Aldri "Velkommen tilbake!" eller "Hei [navn] 👋".
- **Observerende italic-fragmenter** som åpningslinjer:
  *"Onsdag morgen. To dager siden sist."*
  *"En måned igjen til Olyo Cup."*
  *"Markus — nesten i mål."*
- **Du-form for spilleren**, **Anders eller "coach"** for coach.
- **Tall fortelles, ikke listes.** "HCP 4,2 i dag. Ned 1,8 siden januar." Ikke
  "HCP: 4.2 | Endring: -1.8".

---

## 9. Lucide-ikoner

Eneste icon-bibliotek. Stroke 1.5px, `currentColor`. Brukes SPARSOMT:

- **OK å bruke**: ArrowLeft/Right på navigasjon, små metadata-ikoner som Calendar,
  Clock, MapPin, User i caption-størrelse.
- **Ikke bruk** dekorative ikoner. Ingen smiley-fjes, ingen confetti, ingen
  stjerner.
- **Aldri farget direkte** — alltid `currentColor`, og parent bestemmer farge.

---

## 10. Output-spesifikasjon når du designer skjerm

Når jeg sender en skjerm-prompt, lever:

1. **Komplett HTML-fil**, inline CSS (Tailwind CDN OK), inline lucide SVG, ingen
   ekstern fontlast (bruk Google Fonts CDN).
2. **CSS-variabler** øverst: `--ak-cream`, `--ak-forest`, `--ak-lime`, `--ak-ink`,
   `--ak-muted`, `--ak-border` — så brand kan justeres i ett strøk.
3. **1440×900 viewport** (eller mobile 375×812 hvis spesifisert).
4. **Norsk locale** gjennomgående.
5. **Interaktivitet:** count-up, stagger fade, hover-states, command palette
   (⌘K) med 20+ kommandoer.
6. **Realistiske data** (ekte navn, datoer som matcher onsdag 16. mai 2026,
   norske turneringer som Olyo Cup, Srixon, Garmin Norges Cup).
7. **Etter levering:** kort oppsummering av designvalg + hva som ville blitt
   løftet i neste iterasjon.

---

## 11. Akseptanse-sjekkliste per skjerm

Før du leverer, sjekk:

- [ ] Hero med eyebrow + Instrument Serif italic display + lead-paragraf
- [ ] Minst 1 pull-quote (full-bredde italic) per skjerm
- [ ] Minst 1 photo eller stor typografi-hero (ikke placeholder-grafikk)
- [ ] Stat blocks med italic annotasjon (ikke bare tall+label)
- [ ] Asymmetrisk layout (ikke 4×3 grid)
- [ ] Forest green sparsomt som accent-strek/signatur
- [ ] Maks 1 lime-flate per skjerm
- [ ] JetBrains Mono med tabular-nums på alle tall
- [ ] Norsk komma-desimal og ikke-brytbar mellomrom
- [ ] Command palette ⌘K med 20+ kommandoer
- [ ] Count-up på primær-KPI
- [ ] Stagger fade-up på editorial cards
- [ ] Editorial tone — ingen "Velkommen tilbake!"
- [ ] Footer/colophon i kaldon-stil
