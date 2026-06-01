# Runde 8 — Foreldre-portal + Marketing + Misc (6 skjermer)

> Plattform: **Mobil-first 430px** for /forelder/* + /404 + /500 + tomstates. **Desktop-first 1440px** for marketing forside (med mobil-variant).
> Master DS: Forest #005840, Lime #D1F843, Cream #FAFAF7, Inter + Inter Tight + JetBrains Mono, 8pt-grid.
> Konsistent med Runder 1-7. Norsk bokmål, norsk komma.

---

## Innhold

1. `/forelder` — Foreldre-portal landing med tilknyttede barn
2. `/forelder/[barn-id]` — Barnets fremgang sett av foresatt
3. `/` (akgolf.no) — Marketing forside, 6 seksjoner per HANDOVER
4. `/404` — Not found
5. `/500` — Server-feil
6. `/portal/tomstate-eksempler` — Samling av tomstates på tvers

---

## Foreldre-portal arkitektur

Egen entry-point separat fra PlayerHQ/AgencyOS. Konto-typer:
- **GUARDIAN** = foresatt-rolle, kan ha 1+ barn knyttet
- Hver kobling barn↔forelder krever GDPR-samtykke
- Foreldre betaler fakturaer, ser fremdrift, kommuniserer med coach
- Kan **ikke** se barnets personlige mål, dagboknotater, eller mentale-helse-flagging (kun coach ser dette)

Branding: samme forest/lime/cream men med varmere, mer beroligende tone — mer luftig spacing, mindre dataintensitet enn AgencyOS.

---

## Skjerm 1 — `/forelder` (Foreldre-portal landing)

### Rute og hensikt

Først side foresatt ser etter innlogging. Viser alle barn knyttet til kontoen som store, klikkbare kort. Sekundære snarveier til faktura, samtykke, kommunikasjon. Profilert som "varm" foreldre-side — mindre tabell-tung enn andre flater.

### ASCII-wireframe (mobil 430px)

```
┌──────────────────────────────────┐
│  AK Golf  ·  Forelder       👤   │
├──────────────────────────────────┤
│                                  │
│  God morgen, Anne                │
│  Her kan du følge med på         │
│  treningen til barna dine        │
│                                  │
│  Dine barn                       │
│                                  │
│  ┌────────────────────────────┐ │
│  │ ┌──────┐                    │ │
│  │ │ foto │  Lukas Larsen       │ │
│  │ │      │  13 år · Junior    │ │
│  │ └──────┘                    │ │
│  │                              │ │
│  │ Gruppe: Junior-elite         │ │
│  │ Coach: Anders Kristiansen    │ │
│  │                              │ │
│  │ ┌──────────────────────────┐│ │
│  │ │ Neste økt                 ││ │
│  │ │ Tor 11. jun kl 17:00      ││ │
│  │ │ Onsøy GK                  ││ │
│  │ └──────────────────────────┘│ │
│  │                              │ │
│  │ ● 2 uleste meldinger fra     │ │
│  │   Anders                     │ │
│  │                              │ │
│  │              [Se Lukas →]    │ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │
│  │ ┌──────┐                    │ │
│  │ │ foto │  Emma Larsen        │ │
│  │ │      │  10 år · Bredde    │ │
│  │ └──────┘                    │ │
│  │                              │ │
│  │ Gruppe: Onsdag-lørdag        │ │
│  │ Coach: Markus Berger         │ │
│  │                              │ │
│  │ ┌──────────────────────────┐│ │
│  │ │ Neste økt                 ││ │
│  │ │ Lør 13. jun kl 09:00      ││ │
│  │ │ Onsøy GK                  ││ │
│  │ └──────────────────────────┘│ │
│  │                              │ │
│  │              [Se Emma →]     │ │
│  └────────────────────────────┘ │
│                                  │
│  Snarveier                       │
│  ┌──────────┬────────┬─────────┐│
│  │ Fakturaer│ Samtykke│Meldinger││
│  │   📄     │   ✓     │   💬    ││
│  └──────────┴────────┴─────────┘│
│                                  │
└──────────────────────────────────┘
```

### Komponenter brukt

- `components-foreldre` — Barn-card stor variant
- `components-eyebrow` — "God morgen, Anne"-hilsen
- `components-buttons` — "Se [barn] →" CTAs, snarvei-tiles
- `components-notifications` — Ulest-prikk på barn-card

### States

| State | Beskrivelse |
|---|---|
| **Default (flere barn)** | Stack av barn-kort + snarveier nederst |
| **Default (ett barn)** | Single barn-card stor, snarveier ekspandert |
| **Tom (ingen barn)** | "Ingen barn tilknyttet ennå" + "Be om kobling fra coach" CTA |
| **Pending kobling** | Card med ◐-status + "Coach har sendt invitasjon"-meta |
| **Uleste meldinger** | ● lime-prikk + telling "2 uleste meldinger" |
| **Faktura forfalt** | Snarvei-tile får rød accent + "1 forfalt" |

### Claude Design-prompt (paste-ready)

```
Design /forelder for AK Golf HQ — mobil-first 430px (foreldre-portal).

Layout: padding 20px mobil. Forest brand med varmere accent — mer luftig
enn AgencyOS, mer spacing.

Header: 56px, kompakt. Logo "AK Golf · Forelder" Inter Tight 14px medium
forest-900 + profil-ikon høyre 32px.

Hilsen-blokk: H1 "God morgen, Anne" Inter Tight 28px forest-900 medium.
Subtitle "Her kan du følge med på treningen til barna dine" Inter 15px
forest-600. Mb 32px.

Seksjons-tittel "Dine barn" Inter 12px uppercase forest-500 medium,
letter-spacing 0.08em, mb 12px.

Barn-card: hvit bg, 24px radius, forest-200 border, padding 20px, mb 16px.
Layout:
- Top-rad: foto 56x56px sirkulær venstre + tittel-stack høyre (navn Inter
  Tight 18px medium + meta "13 år · Junior" Inter 13px forest-600).
- Meta-rad: "Gruppe: Junior-elite" + "Coach: Anders Kristiansen" Inter
  13px forest-700, mb 16px.
- Neste-økt-kort embedded: lime-tint bg, 12px radius, padding 12px.
  Label "Neste økt" Inter 11px uppercase forest-700 medium + dato/tid
  Inter 14px forest-900 medium + sted Inter 13px forest-600.
- Ulest-meldinger-rad: ● lime-prikk + tekst "2 uleste meldinger fra
  Anders" Inter 13px forest-700 medium.
- CTA "Se [barn] →" høyre nedre hjørne, lime fyll forest-900 tekst,
  40px høyde.

Snarveier-blokk: seksjon-tittel "Snarveier" + 3-kolonne grid av tiles.
Hver tile: hvit bg, forest-200 border, 16px radius, padding 16px,
sentrert innhold. Ikon 24px forest-700 + label Inter 13px medium
forest-900. Aspect-ratio 1:1 så de blir kvadratiske.

Forfalt-tile: lime-tint bg + rød "1 forfalt"-badge øvre høyre.

Bruk components-foreldre, components-eyebrow, components-buttons,
components-notifications.
```

---

## Skjerm 2 — `/forelder/[barn-id]` (Barnets fremgang)

### Rute og hensikt

Detalj-side per barn. Foresatt ser ukentlig oppsummering, kommunikasjon med coach, fakturaer, godkjenningssaker (for store turneringer / pengeforpliktelser), samtykke-status. **Sensitiv personlig data filtres ut** — kun det coach har klassifisert som "shareable" vises.

### ASCII-wireframe (mobil 430px)

```
┌──────────────────────────────────┐
│  ←  Lukas Larsen            👤   │
├──────────────────────────────────┤
│                                  │
│  ┌──────┐                        │
│  │ foto │                        │
│  │      │                        │
│  └──────┘                        │
│                                  │
│  Lukas Larsen                    │
│  13 år · Junior-elite            │
│  Coach: Anders Kristiansen       │
│                                  │
│  ┌────────────────────────────┐ │
│  │ Denne uka                    │ │
│  │ ▓▓▓▓▓░░ 5 av 7 økter         │ │
│  │ Fokus: putting + range        │ │
│  └────────────────────────────┘ │
│                                  │
│  Ukentlig oppsummering           │
│  ┌────────────────────────────┐ │
│  │ Uke 23 — 1. til 7. juni      │ │
│  │                              │ │
│  │ "Lukas hadde en sterk uke    │ │
│  │ med 6 fullførte økter. CHS-  │ │
│  │ målingen viser bedring fra   │ │
│  │ 87 til 90 mph. Mental coach  │ │
│  │ er fornøyd."                 │ │
│  │                              │ │
│  │ — Anders K., søndag 7. juni  │ │
│  └────────────────────────────┘ │
│                                  │
│  Kommunikasjon                   │
│  ┌────────────────────────────┐ │
│  │ ● Anders Kristiansen          │ │
│  │   "Hei Anne, Lukas vil...    │ │
│  │   prøve seg på Region.M."   │ │
│  │   2 timer siden              │ │
│  ├────────────────────────────┤ │
│  │   Anders Kristiansen          │ │
│  │   "Takk for samtalen i går"  │ │
│  │   i går                      │ │
│  └────────────────────────────┘ │
│  [Se alle meldinger →]           │
│                                  │
│  Godkjenningssaker (1)           │
│  ┌────────────────────────────┐ │
│  │ Region.mester juli 2026      │ │
│  │ Deltakeravgift: 2 400 kr     │ │
│  │ Frist for svar: 15. juni     │ │
│  │                              │ │
│  │ [Avslå]      [Godkjenn →]   │ │
│  └────────────────────────────┘ │
│                                  │
│  Fakturaer                       │
│  ┌────────────────────────────┐ │
│  │ Juni — Junior-elite          │ │
│  │ 3 800 kr     ●Betalt 1. jun  │ │
│  ├────────────────────────────┤ │
│  │ Mai — Junior-elite           │ │
│  │ 3 800 kr     ●Betalt 1. mai  │ │
│  └────────────────────────────┘ │
│  [Se alle fakturaer →]           │
│                                  │
│  Samtykke                        │
│  ┌────────────────────────────┐ │
│  │ ✓ Trening og økter           │ │
│  │ ✓ Fotos i sosiale medier     │ │
│  │ ✓ Helseopplysninger til coach│ │
│  │ ✗ Markedsføring av AK Golf   │ │
│  │                              │ │
│  │ [Oppdater samtykke →]        │ │
│  └────────────────────────────┘ │
│                                  │
└──────────────────────────────────┘
```

### Komponenter brukt

- `components-foreldre` — Hero-blokk, denne-uka-kort, samtykke-kort
- `components-kpi` — Mini-fremgangsbar denne uka
- `components-notifications` — Meldings-rader
- `components-buttons` — Godkjenn/Avslå, Se alle, Oppdater samtykke

### States

| State | Beskrivelse |
|---|---|
| **Default** | Alle 6 seksjoner synlige |
| **Ingen ukentlig oppsummering** | Skjul seksjon, hint "Coach sender ukentlig oppdatering hver søndag" |
| **Ingen meldinger** | Tom-state: "Ingen meldinger ennå" |
| **Pending godkjenning** | Lime accent border + sticky-banner top "Beslutning trengs" |
| **Forfalt faktura** | Rød accent på faktura-rad + "Forfalt"-badge |
| **Samtykke utløpt** | Rød advarsel-banner "Samtykke trenger fornyelse" |
| **Lasting** | Skeleton-blokker |

### Claude Design-prompt (paste-ready)

```
Design /forelder/[barn-id] for AK Golf HQ — mobil-first 430px (foreldre-
portal).

Layout: padding 20px mobil. Varm forest-tone, lime accent, cream bg.

Header: 56px, tilbake-pil venstre + barn-navn "Lukas Larsen" Inter 14px
medium + profil-ikon høyre.

Hero-blokk: foto 80x80px sirkulær sentrert + navn "Lukas Larsen" Inter
Tight 28px medium + meta "13 år · Junior-elite" + "Coach: Anders
Kristiansen" Inter 13px forest-600. Mb 24px.

Denne-uka-kort: lime-tint bg, 20px radius, padding 20px. Tittel "Denne
uka" Inter 13px uppercase forest-700. Fremgangs-bar: 7 firkanter 24x24px,
fylte (5) lime forest-900 border, ufylte (2) cream forest-200 border.
Tekst "5 av 7 økter" Inter 14px medium. Fokus-rad: "Fokus: putting +
range" Inter 13px forest-700.

Ukentlig oppsummering-seksjon: seksjons-tittel "Ukentlig oppsummering"
Inter 12px uppercase forest-500 mb 12px. Kort hvit bg forest-200 border
24px radius padding 20px. Inneholder uke-label + sitat italic Inter 15px
forest-700 + signatur "— Anders K., søndag 7. juni" forest-500 13px.

Kommunikasjon-seksjon: kort med 2 meldings-rader (avatar 32px + navn
+ snippet truncated + tid). Ulest = ● lime-prikk. "Se alle meldinger →"
text-link under.

Godkjenningssaker-seksjon: lime-tint bg + lime border 2px. Tittel +
beskrivelse + frist + to knapper [Avslå] outline + [Godkjenn →] lime
fyll.

Fakturaer-seksjon: kort med faktura-rader (måned + pris + status-prikk +
status-tekst). ● = betalt forest-700, ○ = pending gold, ✕ = forfalt
red-500.

Samtykke-seksjon: kort med liste av samtykke-rader (✓/✗ ikon + tekst).
"Oppdater samtykke →"-knapp outline.

Bruk components-foreldre, components-kpi, components-notifications,
components-buttons.
```

---

## Skjerm 3 — `/` (Marketing forside akgolf.no)

### Rute og hensikt

Offentlig forside. Konvertere besøkende til booking eller plan-abonnement. 6 seksjoner per HANDOVER seksjon 14: Hero (foto-tung), Manifest, Stats showcase (DataGolf-stil dark-bg), Coaches, Plan-promo (abonnement-cards), Footer. Desktop-first 1440px med mobil-variant.

### ASCII-wireframe (desktop 1440px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ AK GOLF     Trening  Coacher  Planer  Om oss      [Logg inn] [Book →] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────┐    ┌────────────────────────────────┐  │
│  │                            │    │                                  │  │
│  │  GOLF-TRENING SOM          │    │                                  │  │
│  │  ENDRER SPILLET DITT.      │    │       (Hero-foto                 │  │
│  │                            │    │        Anders eller spiller      │  │
│  │  Personlig coaching fra    │    │        i swing-position på       │  │
│  │  Norges mest profilerte    │    │        Onsøy GK, dramatisk lys)  │  │
│  │  golf-coacher.             │    │                                  │  │
│  │                            │    │                                  │  │
│  │  [Book privatime →]        │    │                                  │  │
│  │  [Se planene]              │    │                                  │  │
│  │                            │    │                                  │  │
│  └───────────────────────────┘    └────────────────────────────────┘  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  MANIFEST                                                               │
│                                                                         │
│  ┌─────────────────┬─────────────────┬─────────────────┐               │
│  │ DATADREVET       │ INDIVIDUELT      │ HELE ÅRET        │               │
│  │                  │                  │                  │               │
│  │ Hver økt måles  │ Ingen pakke-tre- │ Innendørs sim    │               │
│  │ med TrackMan og  │ ning. Plan byg-  │ vinter, utendørs │               │
│  │ analyseres så   │ ges fra dine     │ sommer, alltid   │               │
│  │ neste skritt er │ mål og dine      │ med samme coach. │               │
│  │ målbar.          │ utfordringer.   │                  │               │
│  └─────────────────┴─────────────────┴─────────────────┘               │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  (Dark bg: forest-900)                                                 │
│                                                                         │
│   STATISTIKK SOM SNAKKER FOR SEG SELV                                  │
│                                                                         │
│   ┌──────────┬──────────┬──────────┬──────────┐                       │
│   │   142    │   +6.4   │   12 år  │   97%    │                       │
│   │          │          │          │          │                       │
│   │ Aktive   │  Snitt-  │ Yngste   │ Spillere │                       │
│   │ spillere │ handicap-│ junior   │ som      │                       │
│   │          │ forbedr. │          │ fornyer   │                       │
│   └──────────┴──────────┴──────────┴──────────┘                       │
│                                                                         │
│   "Vi måler det som teller — og leverer på det vi måler."              │
│                                                          — Anders K.   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  MØT COACHENE                                                           │
│                                                                         │
│  ┌─────────────────────────┬─────────────────────────┐                 │
│  │ ┌────────────────────┐  │ ┌────────────────────┐  │                 │
│  │ │                     │  │ │                     │  │                 │
│  │ │  (Anders foto)      │  │ │  (Markus foto)      │  │                 │
│  │ │                     │  │ │                     │  │                 │
│  │ └────────────────────┘  │ └────────────────────┘  │                 │
│  │                          │                          │                 │
│  │ ANDERS KRISTIANSEN       │ MARKUS BERGER           │                 │
│  │ Hovedcoach               │ Short-game spesialist   │                 │
│  │                          │                          │                 │
│  │ 20+ år erfaring med      │ PGA-sertifisert,         │                 │
│  │ elite og junior. Tidlige- │ tidligere proff. Putting │                 │
│  │ re proff-spiller. Driver  │ og wedge-arbeide som    │                 │
│  │ AK Golf Academy + WANG.  │ kjernekompetanse.       │                 │
│  │                          │                          │                 │
│  │ [Book med Anders →]      │ [Book med Markus →]     │                 │
│  └─────────────────────────┴─────────────────────────┘                 │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PLANER                                                                 │
│                                                                         │
│  ┌────────────┬────────────┬────────────┐                              │
│  │ FREE       │ PRO        │ ELITE      │                              │
│  │            │            │            │                              │
│  │ 0 kr/mnd   │ 1 990 kr/m │ 4 990 kr/m │                              │
│  │            │            │            │                              │
│  │ • App      │ • App       │ • Alt i Pro│                              │
│  │ • Statistikk│ • 4 timer  │ • Ubegrenset│                              │
│  │ • Selvst.  │ • Plan B   │ • Mental    │                              │
│  │   trening  │ • Coach-    │   coach    │                              │
│  │            │   chat     │ • TrackMan  │                              │
│  │            │            │   tilgang   │                              │
│  │ [Velg]     │ [Velg ★]   │ [Velg]     │                              │
│  └────────────┴────────────┴────────────┘                              │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ AK Golf · Fredrikstad · akgolf.no                                       │
│ Onsøy · GFGK · Larvik · Miklagard                                       │
│ © 2026 AK Golf Group AS · Personvern · Vilkår · Kontakt                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### Komponenter brukt

- `components-featured` — Hero-blokk, coach-blokker
- `components-eyebrow` — Seksjons-titler (MANIFEST, STATISTIKK, etc.)
- `components-kpi` — Stats-tall i dark-bg-seksjon
- `components-buttons` — Alle CTAs (Book, Velg, Logg inn)

### States

| State | Beskrivelse |
|---|---|
| **Default** | 6 seksjoner, full lengde |
| **Mobil** | Stack vertikalt, hero 9:16, coaches enkelt-stack |
| **Stats-seksjon hover** | Tall-counter animasjon (counter-up) ved scroll-into-view |
| **Plan-card hover** | Lime border + lift shadow |
| **PRO høyaktet** | Plan-card med ★-stjerne + "Mest populær"-badge |
| **Logget inn** | Header viser navn + "Min konto" i stedet for Logg inn |
| **Cookie-banner** | Sticky bunn-banner med "Aksepter alle / Tilpass" |

### Claude Design-prompt (paste-ready)

```
Design / (marketing forside akgolf.no) for AK Golf — desktop-first
1440px med mobil-fallback.

Layout: full-bredde med max-width 1440px. Cream bg generelt, forest-900
bg på stats-seksjon.

Header (sticky): 80px høyde, hvit bg + 1px forest-100 border-bottom.
Logo "AK GOLF" Inter Tight 20px medium forest-900 venstre. Nav-lenker
sentralt: Trening, Coacher, Planer, Om oss (Inter 14px medium forest-700,
hover lime underline). Høyre: [Logg inn] text-link + [Book →] primær
lime fyll knapp.

=== HERO (over the fold) ===
2-kolonne grid 50/50, padding 80px 64px, høyde 600px.
Venstre: H1 "GOLF-TRENING SOM ENDRER SPILLET DITT." Inter Tight 56px/64px
medium forest-900. Subtitle Inter 18px forest-700, 2 linjer. CTA-stack:
[Book privatime →] lime fyll + [Se planene] text-link forest-700.
Høyre: stort hero-foto 600x600 cover, 24px radius, av Anders eller
spiller i swing. Dramatisk lys.

=== MANIFEST ===
Padding 80px 64px. Eyebrow "MANIFEST" Inter 12px uppercase letter-spacing
0.12em forest-700. 3-kolonne grid med 48px gap. Hver kolonne: title
Inter Tight 24px forest-900 (DATADREVET / INDIVIDUELT / HELE ÅRET) +
body Inter 15px forest-700 4-5 linjer. Lime-tint accent-strek 4x40px
under title.

=== STATS SHOWCASE ===
Full-bredde forest-900 bg, padding 96px 64px. Tekst cream.
Eyebrow "STATISTIKK SOM SNAKKER FOR SEG SELV" Inter 12px uppercase
lime tekst.
4-kolonne grid av store tall. Hver: tall Inter Tight 72px medium lime
(eks "142", "+6.4", "12 år", "97%") + label Inter 14px cream
(Aktive spillere, Snitt-handicap-forbedring, Yngste junior, Spillere
som fornyer).
Citat under: "Vi måler det som teller — og leverer på det vi måler."
Inter Tight 24px italic cream + signatur "— Anders K." gold #B8975C.

=== MØT COACHENE ===
Padding 80px 64px. Eyebrow "MØT COACHENE". 2-kolonne grid 50/50.
Hver coach-blokk: foto-portrett 480x600 venstre, 24px radius. Tekst-
stack høyre/under: navn "ANDERS KRISTIANSEN" Inter Tight 32px medium +
tittel Inter 16px forest-700 + bio 4-5 linjer Inter 15px forest-600 +
CTA [Book med Anders →] lime fyll.

=== PLANER ===
Padding 80px 64px. Eyebrow "PLANER". 3-kolonne grid av abonnement-cards.
Hver card: hvit bg, forest-200 border, 24px radius, padding 32px, høyde
560px. Innhold: navn "PRO" Inter Tight 24px + pris "1 990 kr/mnd"
JetBrains Mono 36px forest-900 + feature-bullet-liste Inter 14px (✓ ikon
forest-700) + CTA-knapp nederst.
PRO-card: lime border 2px + "Mest populær"-pill lime fyll øvre høyre +
★ ikon før navn.

=== FOOTER ===
Forest-900 bg, padding 48px 64px, tekst cream/forest-300. 3 rader
informasjon: top-rad logo + lokasjons-liste (Onsøy, GFGK, Larvik,
Miklagard). Mid-rad lenker (Personvern, Vilkår, Kontakt) i horisontal-
liste. Bunn-rad copyright.

Mobil-variant (430px): alt stacker vertikalt, padding 24px, hero
fullbredde med foto under tekst, manifest enkolonne, stats 2x2 grid,
coaches stack, planer enkolonne med scroll-snap.

Bruk components-featured, components-eyebrow, components-kpi,
components-buttons.
```

---

## Skjerm 4 — `/404`

### Rute og hensikt

Not found-side. Brukes når en lenke peker til død rute, slettet ressurs, eller skrivefeil i URL. Holder brand-følelsen — ikke generisk Next.js-404. Tilbyr ruter videre.

### ASCII-wireframe (mobil 430px)

```
┌──────────────────────────────────┐
│ AK GOLF                  [Hjem] │
├──────────────────────────────────┤
│                                  │
│                                  │
│            ┌──────────┐          │
│            │          │          │
│            │  4 0 4   │          │
│            │          │          │
│            └──────────┘          │
│                                  │
│                                  │
│   Vi fant ikke den siden         │
│                                  │
│   Lenken kan ha endret seg,      │
│   eller siden er flyttet.        │
│                                  │
│                                  │
│   ┌────────────────────────────┐ │
│   │  [Tilbake til hjem →]      │ │
│   └────────────────────────────┘ │
│                                  │
│   ┌────────────────────────────┐ │
│   │  [Book privatime]          │ │
│   └────────────────────────────┘ │
│                                  │
│   ┌────────────────────────────┐ │
│   │  [Se planene]              │ │
│   └────────────────────────────┘ │
│                                  │
│   Eller logg inn:                │
│   [Spiller] [Coach] [Forelder]   │
│                                  │
└──────────────────────────────────┘
```

### Desktop-variant (1440px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ AK GOLF                                          [Logg inn] [Book →]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                                                                         │
│            ┌──────────────────────────────────────────┐                │
│            │                                            │                │
│            │           4 0 4                            │                │
│            │                                            │                │
│            │       Vi fant ikke den siden               │                │
│            │                                            │                │
│            │   Lenken kan ha endret seg, eller siden    │                │
│            │   er flyttet.                              │                │
│            │                                            │                │
│            │   [Tilbake til hjem →]                     │                │
│            │                                            │                │
│            │   [Book privatime]   [Se planene]          │                │
│            │                                            │                │
│            └──────────────────────────────────────────┘                │
│                                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Komponenter brukt

- `components-featured` — Hero som "404"-illustrasjon
- `components-buttons` — Alle CTAs

### States

| State | Beskrivelse |
|---|---|
| **Default** | Stor "404" + tekst + 3 CTAs |
| **Innlogget** | Erstatter "Logg inn"-trio med "Tilbake til dashbord →" |
| **Bot/spider** | Sender 404 HTTP-status, server-side rendres |

### Claude Design-prompt (paste-ready)

```
Design /404 for AK Golf HQ — mobil-first 430px + desktop 1440px.

Layout: full-skjerm sentrert. Cream bg.

Header: 56px (mobil) / 80px (desktop), logo venstre, kompakt nav høyre
([Hjem] knapp mobil, [Logg inn] + [Book →] desktop).

Hero-blokk: sentrert, max-width 480px. Stor "4 0 4" Inter Tight 144px/
160px medium forest-900 med lime accent-strek 4x80px under. På mobil:
96px.

H1 "Vi fant ikke den siden" Inter Tight 32px medium forest-900. Subtitle
"Lenken kan ha endret seg, eller siden er flyttet." Inter 16px forest-
700, mb 32px.

Primær CTA "Tilbake til hjem →" lime fyll forest-900 tekst, 48px høyde,
full-bredde mobil.

Sekundære CTAs i grid 2-kolonne: [Book privatime] [Se planene] outline
forest-700.

Tertiær-rad (mobil): "Eller logg inn:" + 3 små pill-knapper [Spiller]
[Coach] [Forelder] som rute til respektive innloggings-flater.

Helt-skjerm height (calc(100vh - header)). Innhold vertikalt sentrert.

Bruk components-featured, components-buttons.
```

---

## Skjerm 5 — `/500`

### Rute og hensikt

Server-feil. Når noe har feilet på backend (Supabase down, API timeout, unhandled exception). Holder brand-tone — beroligende, ikke skremmende. Status-link til ekstern status-side (status.akgolf.no).

### ASCII-wireframe (mobil 430px)

```
┌──────────────────────────────────┐
│ AK GOLF                  [Hjem] │
├──────────────────────────────────┤
│                                  │
│                                  │
│            ┌──────────┐          │
│            │          │          │
│            │  ⚠       │          │
│            │          │          │
│            └──────────┘          │
│                                  │
│                                  │
│   Noe gikk galt                  │
│                                  │
│   Vi jobber med saken og er      │
│   tilbake snart. Vennligst       │
│   prøv igjen om litt.            │
│                                  │
│   Feilkode: AKG-500-d8a3         │
│   Tidspunkt: 28. mai 14:23       │
│                                  │
│                                  │
│   ┌────────────────────────────┐ │
│   │  [Prøv igjen]              │ │
│   └────────────────────────────┘ │
│                                  │
│   ┌────────────────────────────┐ │
│   │  [Sjekk drift-status →]    │ │
│   └────────────────────────────┘ │
│                                  │
│   Trenger du hjelp?              │
│   support@akgolf.no              │
│                                  │
└──────────────────────────────────┘
```

### Komponenter brukt

- `components-featured` — Hero med advarsel-ikon
- `components-buttons` — Prøv igjen + status-link
- Inline error-kode-display

### States

| State | Beskrivelse |
|---|---|
| **Default** | Advarsel-ikon + melding + feilkode + 2 CTAs |
| **Med kontekst** | Hvis vi vet hva som feilet (auth, betaling, etc.), gi mer spesifikk melding |
| **Server-side rendered** | HTTP 500 status, ingen JS-avhengighet |
| **Sentry-integrert** | Feilkode er Sentry-event-ID, klikkbar for support |
| **Status grønn** | Vis grønn-prikk + "Tjenester normalt — kan være lokalt issue" |

### Claude Design-prompt (paste-ready)

```
Design /500 for AK Golf HQ — mobil-first 430px + desktop 1440px.

Layout: full-skjerm sentrert. Cream bg. Tone: beroligende, ikke alarm.

Header: kompakt, samme som /404.

Hero-blokk: ⚠-ikon i forest-100 sirkel 80x80px sentrert, ikon-farge
gold #B8975C 32px.

H1 "Noe gikk galt" Inter Tight 32px medium forest-900. Subtitle "Vi
jobber med saken og er tilbake snart. Vennligst prøv igjen om litt."
Inter 16px forest-700, mb 24px.

Feilkode-blokk: forest-50 bg-card, padding 16px, 12px radius. Innhold:
"Feilkode: AKG-500-d8a3" JetBrains Mono 13px forest-700 + "Tidspunkt:
28. mai 14:23" Inter 13px forest-500.

Primær CTA "Prøv igjen" lime fyll, 48px høyde.
Sekundær CTA "Sjekk drift-status →" outline forest-700, åpner status.
akgolf.no.

Footer-rad: "Trenger du hjelp?" Inter 14px forest-700 + "support@akgolf.
no" Inter 14px lime-tint link.

Bruk components-featured, components-buttons.
```

---

## Skjerm 6 — `/portal/tomstate-eksempler`

### Rute og hensikt

Intern referanse-skjerm (link kun for designteam, ikke i prod-nav). Samler alle tomstates på tvers av PlayerHQ + AgencyOS for å sikre konsistent stil. Hver visning: ikon + tittel + body + tom-CTA.

### ASCII-wireframe (desktop 1440px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Tomstate-eksempler · intern referanse                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Felles mønster                                                          │
│ ┌────────────────────────────────────────────────────────────────────┐│
│ │ • Ikon 48px sentrert, forest-400 nøytral                            ││
│ │ • Tittel Inter Tight 18px medium forest-900                          ││
│ │ • Body Inter 14px forest-600, max 2 linjer, sentrert                 ││
│ │ • Tom-CTA lime fyll eller outline, valgfritt for read-only flater    ││
│ │ • Padding 48px sentrert, hvit bg-kort eller på cream uten kort       ││
│ └────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│                                                                         │
│ ┌──────────────────┬──────────────────┬──────────────────┐             │
│ │ Stats (0 runder) │ Workbench (ingen │ Innboks (ingen   │             │
│ │                  │ plan)             │ meldinger)        │             │
│ │      📊          │      📅          │      💬          │             │
│ │                  │                  │                  │             │
│ │ Ingen runder     │ Ingen plan ennå  │ Ingen meldinger  │             │
│ │ registrert       │                  │                  │             │
│ │                  │ Coach lager plan │ Når Anders       │             │
│ │ Spill en runde   │ etter første økt │ sender deg en    │             │
│ │ og logg den i    │                  │ melding, vises   │             │
│ │ appen.           │                  │ den her.         │             │
│ │                  │                  │                  │             │
│ │ [Logg runde →]   │ [Snakk med coach]│  (ingen CTA)     │             │
│ └──────────────────┴──────────────────┴──────────────────┘             │
│                                                                         │
│ ┌──────────────────┬──────────────────┬──────────────────┐             │
│ │ Tester (ingen    │ Coach (solo,     │ Foreldre (ingen  │             │
│ │ test)             │ ingen tilknyt.)   │ barn)             │             │
│ │      🎯          │      👥          │      👨‍👧          │             │
│ │                  │                  │                  │             │
│ │ Ingen test       │ Ingen spillere   │ Ingen barn       │             │
│ │ tildelt          │ tilknyttet ennå  │ tilknyttet       │             │
│ │                  │                  │                  │             │
│ │ Coach tildeler   │ Inviter første   │ Be coach om      │             │
│ │ test når det er  │ spiller for å    │ kobling.         │             │
│ │ klart.           │ komme i gang.    │                  │             │
│ │                  │                  │                  │             │
│ │  (ingen CTA)     │ [Inviter →]      │ [Kontakt coach]  │             │
│ └──────────────────┴──────────────────┴──────────────────┘             │
│                                                                         │
│ ┌──────────────────┬──────────────────┬──────────────────┐             │
│ │ Booking (ingen   │ Varsler (ingen)  │ Plan-maler       │             │
│ │ slots)            │                  │ (ingen)           │             │
│ │      📅          │      🔔          │      📋          │             │
│ │                  │                  │                  │             │
│ │ Coach er fullt   │ Alt er ryddet    │ Ingen plan-maler │             │
│ │ booket           │                  │                  │             │
│ │                  │ Du er oppdatert  │ Lag første mal   │             │
│ │ Prøv en annen    │ — kom tilbake    │ for å spare tid  │             │
│ │ uke eller coach. │ senere.          │ neste sesong.    │             │
│ │                  │                  │                  │             │
│ │ [Neste uke →]    │  (ingen CTA)     │ [+ Ny mal]       │             │
│ └──────────────────┴──────────────────┴──────────────────┘             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Komponenter brukt

- `components-onboarding` — Tomstate-card-mønster (matcher onboarding-steg)
- `components-buttons` — Tom-CTAs

### States

| Tomstate | Bruk | CTA |
|---|---|---|
| Stats (0 runder) | `/portal/stats` ny spiller | "Logg runde →" |
| Workbench (ingen plan) | `/portal/planlegge/workbench` ny spiller | "Snakk med coach" |
| Innboks (ingen meldinger) | `/portal/meldinger` ny | Ingen |
| Tester (ingen test) | `/portal/tester` ny | Ingen |
| Coach (solo) | `/admin/oversikt` ny coach | "Inviter →" |
| Foreldre (ingen barn) | `/forelder` ny foresatt | "Kontakt coach" |
| Booking (ingen slots) | `/booking/tid` filtrerte slots | "Neste uke →" |
| Varsler (ingen) | `/admin/varsler` alt ryddet | Ingen |
| Plan-maler (ingen) | `/admin/drift/plan-maler` ny coach | "+ Ny mal" |

### Claude Design-prompt (paste-ready)

```
Design /portal/tomstate-eksempler (intern referanse) for AK Golf HQ —
desktop 1440px.

Layout: sidebar 240px forest-900 (AgencyOS-stil), hovedflate cream
padding 32px, max-width 1200px.

Header: H1 "Tomstate-eksempler · intern referanse" Inter Tight 28px,
undertittel "Felles mønster for alle tomstates på tvers av PlayerHQ +
AgencyOS" forest-600 14px.

Mønster-spec-kort: lime-tint bg, padding 20px, 16px radius. Bullet-liste
av regler (ikon 48px, tittel-stil, body-stil, CTA-stil, padding).

3-kolonne grid av tomstate-eksempler. Hver eksempel-card: hvit bg,
forest-200 border, 20px radius, padding 32px, sentrert innhold:
- Tilstand-tittel øverst Inter 11px uppercase forest-500 letter-spacing
  0.08em (eks "Stats (0 runder)")
- Ikon 48px sentrert (forest-400 nøytral)
- Hoved-tittel Inter Tight 18px medium forest-900 sentrert
- Body Inter 14px forest-600 sentrert, max 3 linjer
- CTA-knapp (lime fyll eller outline) eller "(ingen CTA)"-placeholder
  italic forest-400

Hver tomstate har sin egen ikon (emoji eller Phosphor-ikon konsekvent).

Padding mellom rader 24px. Layout justeres til 9 eksempler i 3x3 grid.

Bruk components-onboarding, components-buttons.
```

---

## Leveranse-status — Runde 8

**Skjermer dekket i denne filen (6):**
- /forelder
- /forelder/[barn-id]
- / (akgolf.no marketing forside)
- /404
- /500
- /portal/tomstate-eksempler

**Total skjermtelling oppdatert (alle 8 runder):**

| Runde | Område | Skjermer |
|---|---|---|
| 1 | Onboarding + onboarding-flows | 8 |
| 2 | PlayerHQ kjerneflater | 10 |
| 3 | AgencyOS kjerneflater | 9 |
| 4 | Innboks, varsler, profil | 6 |
| 5 | AgencyOS resterende moduler | 6 |
| 6 | Coach-Workbench dybde | 5 |
| 7 | Booking 5-stegs flyt | 5 |
| 8 | Foreldre + Marketing + Misc | **6** |
| **Sum** | | **57 skjermer** |

---

## Komplett leveranse

Etter Runde 1-8 har vi en komplett skjerm-spesifikasjon for hele AK Golf HQ-suiten:

- **PlayerHQ** (mobil-first 430px): Onboarding, dashbord, planlegge/workbench, økter, stats, meldinger, profil, tester, tomstates
- **AgencyOS** (desktop-first 1440px med mobil-variant for kritiske flater): Oversikt, spillere, grupper, bookinger, tester, drift (innstillinger/team/plan-maler), workbench, coach-til-coach, varsler, historikk
- **Booking** (mobil-first 430px + desktop): 5-stegs offentlig flyt + innlogget variant
- **Foreldre-portal** (mobil-first 430px): Landing + barn-detalj
- **Marketing** (desktop 1440px + mobil): Forside med 6 seksjoner
- **System**: 404, 500, tomstate-referanse

Alle 57 skjermer har: ASCII-wireframe, komponent-referanser, states-tabell, og paste-ready Claude Design-prompt. Klare for produksjon.
