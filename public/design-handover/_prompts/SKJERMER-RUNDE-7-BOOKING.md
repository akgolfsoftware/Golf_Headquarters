# Runde 7 — Booking 5-stegs flyt (5 skjermer)

> Plattform: **Mobil-first 430px** (offentlig flow) + desktop 1440px (samme komponenter, bredere layout).
> Master DS: Forest #005840, Lime #D1F843, Cream #FAFAF7, Inter + Inter Tight + JetBrains Mono, 8pt-grid.
> Konsistent med Runder 1-6. Norsk bokmål, norsk komma.

---

## Innhold

1. `/booking` — Steg 1: Velg lokasjon (kart eller liste)
2. `/booking/coach` — Steg 2: Velg coach
3. `/booking/tid` — Steg 3: Velg dato og tid
4. `/booking/bekreft` — Steg 4: Bekreft booking
5. `/booking/betal` — Steg 5: Betal (Stripe) / Trekk credit + success

---

## Flow-arkitektur

To inngangspunkter:
- **`/booking/*`** — offentlig, uten innlogging. Krever upfront-betaling via Stripe.
- **`/portal/book/*`** — innlogget, trekker fra credits (Pro-abonnement) eller faller tilbake til Stripe.

Begge bruker samme 5-stegs flyt og samme komponenter. Forskjellen:
- Innlogget: viser navn + credit-saldo i header, hopper over "Hvem er du?"-steg.
- Offentlig: 0. steg er e-post + navn + telefon (samme `/onboarding` flow).

Steg-progress vises gjennomgående (5 prikker øverst).

Universelle CTA-knapper:
- Primær: lime fyll, forest-900 tekst, 48px høyde mobil / 40px desktop
- Sekundær: outline forest-700
- Tertiær: text-link forest-700 medium

---

## Skjerm 1 — `/booking` (Steg 1: Lokasjon)

### Rute og hensikt

Førstesteg i bookingflyten. Spilleren velger hvilken lokasjon hen vil booke ved. AK Golf har fire partner-baner: Onsøy GK (hovedbase), Gamle Fredrikstad GK (GFGK), Larvik GK, Miklagard GK. Visning kan veksle mellom kart og liste, mobil-default = liste.

### ASCII-wireframe (mobil 430px)

```
┌──────────────────────────────────┐
│  ←   Book privatime         ✕    │
├──────────────────────────────────┤
│                                  │
│  ●━━○━━○━━○━━○                   │
│  Lokasjon Coach Tid Bekreft Betal│
│                                  │
│  Steg 1 av 5                     │
│  Hvor vil du spille?             │
│                                  │
│  [Liste ▾]              [Kart 🗺]│
│                                  │
│  ┌────────────────────────────┐ │
│  │   ◯                         │ │
│  │  Onsøy GK                   │ │
│  │  Onsøy, Fredrikstad         │ │
│  │  3 coacher tilgjengelig     │ │
│  │  ⌚ Neste ledig: i morgen   │ │
│  │  📍 12 km fra deg            │ │
│  │                       [Velg]│ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │
│  │   ◯                         │ │
│  │  Gamle Fredrikstad GK       │ │
│  │  Sentrum, Fredrikstad       │ │
│  │  2 coacher tilgjengelig     │ │
│  │  ⌚ Neste ledig: torsdag    │ │
│  │  📍 5 km fra deg             │ │
│  │                       [Velg]│ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │
│  │   ◯                         │ │
│  │  Larvik GK                  │ │
│  │  Larvik                     │ │
│  │  1 coach tilgjengelig       │ │
│  │  ⌚ Neste ledig: 5. jun     │ │
│  │  📍 80 km fra deg            │ │
│  │                       [Velg]│ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │
│  │   ◯                         │ │
│  │  Miklagard GK               │ │
│  │  Kløfta                     │ │
│  │  1 coach tilgjengelig       │ │
│  │  ⌚ Neste ledig: lørdag     │ │
│  │  📍 120 km fra deg           │ │
│  │                       [Velg]│ │
│  └────────────────────────────┘ │
│                                  │
└──────────────────────────────────┘
```

Kart-variant (toggle):

```
┌──────────────────────────────────┐
│  ←   Book privatime         ✕    │
├──────────────────────────────────┤
│  ●━━○━━○━━○━━○                   │
│  Hvor vil du spille?             │
│  [Liste ▾]              [Kart 🗺]│
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │                              │ │
│ │     📍                       │ │
│ │      Onsøy GK                │ │
│ │                              │ │
│ │         📍 GFGK              │ │
│ │                              │ │
│ │                       📍     │ │
│ │                       Miklag.│ │
│ │                              │ │
│ │   📍                          │ │
│ │   Larvik                     │ │
│ │                              │ │
│ └──────────────────────────────┘ │
│                                  │
│  Onsøy GK — 12 km fra deg        │
│  3 coacher · neste ledig i morgen│
│                                  │
│  [Velg Onsøy GK →]               │
└──────────────────────────────────┘
```

### Komponenter brukt

- `components-onboarding` — Steg-progress (5 prikker)
- `components-buttons` — "Velg"-knapper, view-toggle (Liste/Kart)
- `components-inputs` — Søk-felt (skjult under fold), filter

### States

| State | Beskrivelse |
|---|---|
| **Default (liste)** | Vertikal stack av 4 lokasjons-kort |
| **Default (kart)** | Mapbox-kart med pinner, valgt lokasjon highlighted |
| **Valgt lokasjon** | ◯ blir ◉ lime, kort får lime border, "Velg"-knapp blir "Fortsett →" sticky bunn |
| **Ingen ledige** | Kort vises men "Velg" disabled, meta "Ingen ledige denne uka" |
| **Lokasjon stengt** | Kort dimmet 50% opacity, meta "Stengt for sesongen" |
| **Lasting** | Skeleton-kort × 4 |
| **Geo-tillatelse spurt** | Liste vises uten "X km fra deg" hvis ingen geo |

### Claude Design-prompt (paste-ready)

```
Design /booking (steg 1: lokasjon) for AK Golf HQ — mobil-first 430px,
også støtte desktop.

Layout: enkel kolonne, padding 16px mobil / 32px desktop. Forest #005840
brand color, lime #D1F843 accent, cream #FAFAF7 bg.

Header: 56px høyde. Venstre tilbake-pil + tittel "Book privatime" Inter
14px medium, høyre ✕-lukk. Forest-900 ikoner, hvit bg + forest-100
border-bottom.

Steg-progress: 5 prikker forbundet med linjer. Aktiv = lime fyll forest-
900 border, kommende = forest-200 fyll. Tekst-label under: Lokasjon,
Coach, Tid, Bekreft, Betal — Inter 11px forest-700 (aktiv) / forest-
400 (kommende). Inter 12px medium tekst-label sentralt aktiv.

H2 "Steg 1 av 5" Inter 13px forest-600 uppercase. H1 "Hvor vil du
spille?" Inter Tight 24px forest-900 medium.

View-toggle: pill med to alternativer "Liste ▾" / "Kart 🗺". Aktiv =
forest-900 fyll cream tekst, inaktiv = transparent forest-700 tekst.
Padding 6px 12px, 16px radius outer.

Lokasjons-kort (liste-view): hvit bg, forest-200 border, 20px radius,
padding 20px, mb 12px. Innhold:
- Radio-prikk venstre top (◯ tom 16px forest-300, ◉ valgt lime fyll
  forest-900)
- Navn "Onsøy GK" Inter Tight 18px forest-900 medium
- Sted "Onsøy, Fredrikstad" Inter 14px forest-600
- Stats-rad med ikoner og tekst Inter 13px forest-700:
  · "3 coacher tilgjengelig"
  · "⌚ Neste ledig: i morgen"
  · "📍 12 km fra deg"
- Velg-knapp høyre nedre hjørne, lime fyll forest-900 tekst, 40px høyde,
  Inter 14px medium

Hover/tap: forest-50 bg, lime border.

Valgt-tilstand: ◉ lime + lime border 2px + sticky CTA "Fortsett →" i
bunn (full-width mobil, høyre desktop).

Kart-view (toggle): Mapbox-kart 60vh høyde, 16px radius, forest-pinner.
Under kart: valgt-lokasjons-detalj-rad + CTA "Velg [navn] →".

Bruk components-onboarding, components-buttons, components-inputs.
```

---

## Skjerm 2 — `/booking/coach` (Steg 2: Coach)

### Rute og hensikt

Etter lokasjonsvalg vises coacher tilknyttet den lokasjonen. Hver coach har foto, spesialitet, neste ledige tid og kort bio. Anders Kristiansen er hovedcoach på Onsøy + GFGK, Markus Berger på GFGK + Larvik. Bookeren kan også velge "Vis meg første ledige tid" som lar systemet matche.

### ASCII-wireframe (mobil 430px)

```
┌──────────────────────────────────┐
│  ←   Book privatime         ✕    │
├──────────────────────────────────┤
│  ●━━●━━○━━○━━○                   │
│  Lokasjon Coach Tid Bekreft Betal│
│                                  │
│  Steg 2 av 5                     │
│  Hvem vil du trene med?          │
│                                  │
│  Onsøy GK · endre                │
│                                  │
│  ┌────────────────────────────┐ │
│  │ ┌──────┐                    │ │
│  │ │      │   Anders Kristiansen│ │
│  │ │ foto │   Hovedcoach        │ │
│  │ │      │                     │ │
│  │ └──────┘                    │ │
│  │                              │ │
│  │ Spesialitet: Elite & Junior  │ │
│  │ "Spillerutvikling fra topp   │ │
│  │ til amatør — 20+ år erfaring"│ │
│  │                              │ │
│  │ ⌚ Neste ledig: i morgen 10:00│ │
│  │ ⭐ 4.9/5 (87 vurderinger)    │ │
│  │ 💰 Fra 1 200 kr / 60 min    │ │
│  │                              │ │
│  │                       [Velg]│ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │
│  │ ┌──────┐                    │ │
│  │ │ foto │   Markus Berger     │ │
│  │ │      │   Coach              │ │
│  │ └──────┘                    │ │
│  │                              │ │
│  │ Spesialitet: Putting & wedge │ │
│  │ "Short-game spesialist —     │ │
│  │ PGA-sertifisert"             │ │
│  │                              │ │
│  │ ⌚ Neste ledig: torsdag 14:00│ │
│  │ ⭐ 4.8/5 (42 vurderinger)    │ │
│  │ 💰 Fra 950 kr / 60 min      │ │
│  │                              │ │
│  │                       [Velg]│ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │
│  │ Vis meg første ledige tid   │ │
│  │ (uavhengig av coach)         │ │
│  │                           →  │ │
│  └────────────────────────────┘ │
│                                  │
└──────────────────────────────────┘
```

### Komponenter brukt

- `components-onboarding` — Steg-progress
- `components-buttons` — "Velg"-knapper, "Vis meg første ledige tid"
- `components-eyebrow` — "Onsøy GK · endre"-breadcrumb

### States

| State | Beskrivelse |
|---|---|
| **Default** | Coach-kort stack vertikalt, 1-3 coacher per lokasjon |
| **Valgt** | Lime border + "Fortsett →" sticky CTA bunn |
| **Ingen ledige** | "Velg"-knapp disabled, meta "Helt opptatt denne uka" |
| **Ingen coacher** | "Ingen coacher tilgjengelig på denne lokasjonen" + tilbake-CTA |
| **First-available** | Kort nederst alltid synlig, hopper rett til steg 3 med beste match |
| **Lasting** | Skeleton-kort × 2 |
| **Endre lokasjon** | "Onsøy GK · endre" tap = går tilbake til steg 1 |

### Claude Design-prompt (paste-ready)

```
Design /booking/coach (steg 2) for AK Golf HQ — mobil-first 430px.

Layout: samme rammeverk som steg 1. Padding 16px mobil.

Steg-progress: prikk 1 og 2 aktive (lime fyll), 3-5 kommende.

Breadcrumb-rad: "Onsøy GK · endre" Inter 13px forest-600 + forest-700
underline på "endre". Mb 16px.

H2 "Steg 2 av 5" + H1 "Hvem vil du trene med?".

Coach-kort: hvit bg, 24px radius, forest-200 border, padding 20px,
mb 16px. Layout:
- Top-rad: foto 64x64px sirkulær venstre (forest-100 fallback-bg + i
  niitial) + tittel-stack høyre (navn Inter Tight 18px medium + rolle
  Inter 13px forest-600).
- Spesialitet-rad: "Spesialitet: Elite & Junior" Inter 13px forest-700
  medium.
- Bio: italic Inter 13px forest-600, 2-3 linjer, truncated.
- Stats-rad (vertikal stack med 8px gap):
  · ⌚ Neste ledig: ... (forest-700)
  · ⭐ rating + antall vurderinger (gold #B8975C ikon)
  · 💰 fra-pris / 60 min (forest-900 medium)
- Velg-knapp høyre nedre, lime fyll, 40px høyde.

"Vis meg første ledige tid"-kort: forest-50 bg, lime border 1px dashed,
samme radius, padding 16px. Layout: tittel + meta + "→"-pil høyre.
Tap = system velger første coach med ledig slot innen 7 dager.

Bruk components-onboarding, components-buttons, components-eyebrow.
```

---

## Skjerm 3 — `/booking/tid` (Steg 3: Tid)

### Rute og hensikt

Velg dato og klokkeslett. Mobil viser uke-velger horisontalt scrollbar + dag-detalj med liste av tidsslots. Desktop viser hele uka som grid. Ledige slots i lime, opptatte muted/disabled. Type-økt (60/90 min, test, vurdering) velges som tab over slots.

### ASCII-wireframe (mobil 430px)

```
┌──────────────────────────────────┐
│  ←   Book privatime         ✕    │
├──────────────────────────────────┤
│  ●━━●━━●━━○━━○                   │
│  Lokasjon Coach Tid Bekreft Betal│
│                                  │
│  Steg 3 av 5                     │
│  Når passer det?                 │
│                                  │
│  Onsøy GK · Anders K · endre     │
│                                  │
│  Type økt:                       │
│  ┌──────────┬────────┬─────────┐│
│  │ 60 min   │ 90 min │ Test    ││
│  │ 1 200 kr │1 600 kr│   -     ││
│  └──────────┴────────┴─────────┘│
│   ●Valgt                         │
│                                  │
│  Uke 24 — jun '26                │
│  ‹ [Man 8] [Tir 9] [Ons 10]      │
│      ●                            │
│    [Tor 11] [Fre 12] [Lør 13] ›  │
│                                  │
│  Mandag 8. juni — ledige tider   │
│                                  │
│  ┌────────────────────────────┐ │
│  │ ●09:00 - 10:00               │ │
│  │  Ledig                       │ │
│  ├────────────────────────────┤ │
│  │ ●10:00 - 11:00               │ │
│  │  Ledig                       │ │
│  ├────────────────────────────┤ │
│  │ ○11:00 - 12:00               │ │
│  │  Opptatt                     │ │
│  ├────────────────────────────┤ │
│  │ ○12:00 - 13:00               │ │
│  │  Opptatt                     │ │
│  ├────────────────────────────┤ │
│  │ ●13:00 - 14:00               │ │
│  │  Ledig                       │ │
│  ├────────────────────────────┤ │
│  │ ◉14:00 - 15:00      Valgt   │ │
│  │  Lime fyll                   │ │
│  ├────────────────────────────┤ │
│  │ ●15:00 - 16:00               │ │
│  │  Ledig                       │ │
│  ├────────────────────────────┤ │
│  │ ●17:00 - 18:00               │ │
│  │  Ledig                       │ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │
│  │  [Fortsett til bekreft →]   │ │
│  └────────────────────────────┘ │
└──────────────────────────────────┘
```

### Komponenter brukt

- `components-onboarding` — Steg-progress
- `components-buttons` — Type-økt-tabs, slot-rader, Fortsett-CTA
- `components-eyebrow` — Breadcrumb
- `components-inputs` — Dag-velger horisontal scroll

### States

| State | Beskrivelse |
|---|---|
| **Default** | Type-tabs (60 min valgt) + uke-velger + slot-liste for valgt dag |
| **Dag uten ledige** | Tom-state-card: "Ingen ledige tider mandag" + "Prøv neste dag →" |
| **Slot valgt** | ◉ lime fyll + sticky "Fortsett til bekreft →"-CTA |
| **Slot opptatt** | ○ tom sirkel + "Opptatt" meta + cursor not-allowed |
| **Test-type valgt** | Andre prising, andre slot-varigheter |
| **Forrige uke** | Hvis i fortid, slots dimmes |
| **Lasting** | Skeleton-rader × 8 |

### Claude Design-prompt (paste-ready)

```
Design /booking/tid (steg 3) for AK Golf HQ — mobil-first 430px.

Layout: padding 16px mobil. Forest brand, lime accent.

Steg-progress: prikk 1-3 aktive, 4-5 kommende.

Breadcrumb-rad: "Onsøy GK · Anders K · endre" Inter 13px forest-600.

H2 "Steg 3 av 5" + H1 "Når passer det?".

Type-økt-tabs: 3 pill-knapper i grid 3-kolonne. Hver: tittel "60 min"
Inter 14px medium + pris "1 200 kr" Inter 12px forest-600. Valgt = lime
fyll forest-900 tekst + lime accent 3px under. Inaktiv = hvit bg
forest-200 border. Test-tab: pris "-" (tildeles av coach).

Uke-velger: horisontal scrollbar, snap-to-day. Hver dag = mini-pill 48x64px:
ukedag forkortelse "Man" Inter 11px uppercase forest-600 + dato "8" Inter
Tight 18px medium forest-900. Valgt = lime fyll, forest-900 tekst. Pile
‹/› venstre/høyre for forrige/neste uke.

Dag-tittel: "Mandag 8. juni — ledige tider" Inter Tight 16px medium
forest-900, mb 12px.

Slot-liste: hvit kort, forest-200 border, 16px radius. Hver slot = rad
56px høyde, padding 16px, border-bottom forest-100:
- Status-prikk venstre: ● lime (ledig), ○ forest-300 tom (opptatt),
  ◉ lime fyll med ring (valgt)
- Tidsspan "09:00 - 10:00" Inter 14px medium forest-900 (JetBrains Mono
  alternativ for tall)
- Status-label "Ledig" / "Opptatt" / "Valgt" Inter 12px forest-600
  høyre

Opptatt-rad: opacity 0.5, cursor not-allowed.
Valgt-rad: lime-tint bg.

Tom-state ved ingen ledige: forest-50 bg-kort, padding 32px sentrert,
ikon 32px forest-400, "Ingen ledige tider mandag" + "Prøv neste dag →"
outline-knapp.

Sticky bunn-CTA "Fortsett til bekreft →": lime fyll 48px høyde,
disabled gray hvis ingen slot valgt.

Bruk components-onboarding, components-buttons, components-eyebrow,
components-inputs.
```

---

## Skjerm 4 — `/booking/bekreft` (Steg 4: Bekreft)

### Rute og hensikt

Sammendrag av valg. Spilleren leser gjennom: lokasjon, coach, dato/tid, type-økt, pris. Kan endre hver rad ved å trykke "Endre" som tar tilbake til relevant steg. Notat-felt til coach (optional). Pris/credits-display med kommende betaling/trekk.

### ASCII-wireframe (mobil 430px)

```
┌──────────────────────────────────┐
│  ←   Book privatime         ✕    │
├──────────────────────────────────┤
│  ●━━●━━●━━●━━○                   │
│  Lokasjon Coach Tid Bekreft Betal│
│                                  │
│  Steg 4 av 5                     │
│  Sjekk og bekreft                │
│                                  │
│  ┌────────────────────────────┐ │
│  │ Lokasjon              Endre  │ │
│  │ Onsøy GK, Range 2            │ │
│  ├────────────────────────────┤ │
│  │ Coach                 Endre  │ │
│  │ Anders Kristiansen           │ │
│  ├────────────────────────────┤ │
│  │ Dato og tid           Endre  │ │
│  │ Mandag 8. juni 2026          │ │
│  │ kl 14:00 - 15:00             │ │
│  ├────────────────────────────┤ │
│  │ Type økt              Endre  │ │
│  │ Privatime — 60 min           │ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │
│  │ Pris                         │ │
│  │ Privatime 60 min  1 200 kr   │ │
│  │ MVA inkl.                    │ │
│  │ ───────────────              │ │
│  │ Totalt            1 200 kr   │ │
│  └────────────────────────────┘ │
│                                  │
│  Notat til Anders (valgfritt)    │
│  ┌────────────────────────────┐ │
│  │ Jeg vil fokusere på drift- │ │
│  │ slag denne timen ...        │ │
│  └────────────────────────────┘ │
│                                  │
│  ☐  Send meg påminnelse 24 t før│
│      (SMS + e-post)              │
│                                  │
│  ┌────────────────────────────┐ │
│  │  [Fortsett til betaling →]  │ │
│  └────────────────────────────┘ │
│                                  │
│  Avbestillingspolicy: gratis     │
│  inntil 24 timer før, deretter   │
│  trekkes full pris.              │
└──────────────────────────────────┘
```

Innlogget variant (Pro-spiller med credits):

```
┌──────────────────────────────────┐
│  ...                              │
│  ┌────────────────────────────┐ │
│  │ Pris                         │ │
│  │ Privatime 60 min   1 credit  │ │
│  │ ───────────────              │ │
│  │ Saldo etter:    1 / 12 → 0/12│ │
│  │                              │ │
│  │ ⚠ Siste credit i denne      │ │
│  │   måneden                    │ │
│  └────────────────────────────┘ │
│  ...                              │
│  [Fortsett — trekk 1 credit →]   │
└──────────────────────────────────┘
```

### Komponenter brukt

- `components-onboarding` — Steg-progress
- `components-credit-indicator` — Saldo-visning før/etter
- `components-buttons` — Fortsett-CTA, Endre-lenker
- `components-inputs` — Notat-textarea, påminnelse-checkbox

### States

| State | Beskrivelse |
|---|---|
| **Default (offentlig)** | Sammendrag + pris i NOK + Fortsett til betaling |
| **Default (Pro innlogget)** | Pris i credits + saldo-før/etter + Fortsett trekker credit |
| **Lav saldo varsel** | "Siste credit i denne måneden"-banner gold-tint |
| **0 credits** | Banner: "Ingen credits igjen — du faktureres 1 200 kr" |
| **Endre klikket** | Bekrefter med modal "Endre dette steget?" → tilbake |
| **Notat fylt** | Sendes med booking + lagres på handlings-loggen |
| **Sender** | CTA viser spinner, alle Endre-knapper disabled |

### Claude Design-prompt (paste-ready)

```
Design /booking/bekreft (steg 4) for AK Golf HQ — mobil-first 430px.

Layout: padding 16px mobil. Forest brand, lime accent.

Steg-progress: prikk 1-4 aktive, 5 kommende.

H2 "Steg 4 av 5" + H1 "Sjekk og bekreft".

Sammendrag-kort: hvit bg, 24px radius, forest-200 border. Padding 0
(rader har egen padding). Rader vertikalt:
- Padding 16px 20px
- Label (Inter 12px uppercase forest-500 medium) + Endre-lenke
  (Inter 12px forest-700 underline, høyre)
- Verdi (Inter 14px forest-900 medium, mb 0)
- Border-bottom forest-100 mellom rader (siste: ingen)

Pris-kort: separat kort under sammendrag, samme stil. Items + Totalt-rad
med JetBrains Mono 16px for tall, forest-900 bold. Mva inkl.-meta Inter
12px forest-500.

For Pro-saldo: items viser "1 credit" + Saldo-rad "Saldo etter: 1/12 →
0/12" med pil-ikon mellom JetBrains Mono.

Lav saldo varsel: gold-tint bg, gold #B8975C accent-bar venstre 3px,
ikon ⚠ + tekst "Siste credit i denne måneden" Inter 13px gold-800.

Notat-felt: label "Notat til Anders (valgfritt)" Inter 13px medium.
Textarea 80px høyde, hvit bg, 16px radius, padding 12px, placeholder
italic forest-400.

Påminnelse-checkbox: large 20px checkbox + tekst "Send meg påminnelse
24 t før (SMS + e-post)" Inter 14px forest-700.

Sticky bunn-CTA "Fortsett til betaling →" / "Fortsett — trekk 1 credit
→": lime fyll, 48px høyde.

Avbestillingspolicy-rad: under CTA, Inter 12px forest-500, max 3 linjer.

Bruk components-onboarding, components-credit-indicator,
components-buttons, components-inputs.
```

---

## Skjerm 5 — `/booking/betal` (Steg 5: Betal + Success)

### Rute og hensikt

Siste steg. Stripe Elements-form for upfront-betaling (offentlig), eller bekreftelse av credit-trekk (Pro). Etter success: bekreftelses-skjerm med ordre-nummer, kalender-link, "Legg til i kalender"-knapp og deling.

### ASCII-wireframe (mobil 430px) — Betalings-form

```
┌──────────────────────────────────┐
│  ←   Book privatime         ✕    │
├──────────────────────────────────┤
│  ●━━●━━●━━●━━●                   │
│  Lokasjon Coach Tid Bekreft Betal│
│                                  │
│  Steg 5 av 5                     │
│  Betal og fullfør                │
│                                  │
│  ┌────────────────────────────┐ │
│  │ Du betaler                   │ │
│  │                              │ │
│  │ Totalt        1 200 kr       │ │
│  │ MVA inkl.                    │ │
│  └────────────────────────────┘ │
│                                  │
│  Betalingsmetode                 │
│  ┌────────────────────────────┐ │
│  │ ◉ Kort                       │ │
│  │ ○ Vipps                      │ │
│  └────────────────────────────┘ │
│                                  │
│  Kortinformasjon                 │
│  ┌────────────────────────────┐ │
│  │ Kortnummer                   │ │
│  │ [____________________]       │ │
│  ├────────────────────────────┤ │
│  │ Utløp        CVC             │ │
│  │ [MM/ÅÅ]      [___]           │ │
│  ├────────────────────────────┤ │
│  │ Navn på kortet               │ │
│  │ [____________________]       │ │
│  └────────────────────────────┘ │
│                                  │
│  🔒 Sikker betaling via Stripe   │
│                                  │
│  ┌────────────────────────────┐ │
│  │  [Betal 1 200 kr]            │ │
│  └────────────────────────────┘ │
│                                  │
│  Ved å betale godtar du våre     │
│  vilkår.                          │
└──────────────────────────────────┘
```

Success-skjerm:

```
┌──────────────────────────────────┐
│                                  │
│            ┌────┐                │
│            │ ✓  │                │
│            └────┘                │
│                                  │
│       Booking bekreftet          │
│                                  │
│   Du er booket inn med Anders    │
│   Kristiansen mandag 8. juni     │
│   2026 kl 14:00.                 │
│                                  │
│  ┌────────────────────────────┐ │
│  │ Ordrenummer       AKG-2487  │ │
│  │ Coach             Anders K. │ │
│  │ Sted              Onsøy GK  │ │
│  │ Tid               08/06 14:00│ │
│  │ Betalt            1 200 kr  │ │
│  └────────────────────────────┘ │
│                                  │
│  [Legg til i Google Calendar 📅] │
│  [Legg til i Apple Calendar 📅] │
│  [Last ned .ics-fil]             │
│                                  │
│  Vi har sendt en bekreftelse til │
│  emma@example.no                 │
│                                  │
│  ┌────────────────────────────┐ │
│  │  [Gå til mine bookinger →]  │ │
│  └────────────────────────────┘ │
│                                  │
│  [Book en til time]              │
│  [Tilbake til forsiden]          │
└──────────────────────────────────┘
```

### Komponenter brukt

- `components-onboarding` — Steg-progress (alle 5 aktive ved success)
- `components-credit-indicator` — Sammendrag av pris/credit
- `components-inputs` — Stripe Elements (custom-styled)
- `components-buttons` — Betal-CTA, kalender-knapper
- `components-featured` — Success-illustration (sentrert ✓ i lime sirkel)

### States

| State | Beskrivelse |
|---|---|
| **Default (kort)** | Stripe Elements + Betal-CTA |
| **Default (Vipps)** | Vipps-redirect-knapp i stedet for kort-felt |
| **Default (credit)** | Ingen betaling, direkte "Bekreft og trekk credit" |
| **Validerer** | CTA viser spinner, felt locked |
| **Feil** | Rød toast "Kortet ble avvist", felt mark red, retry |
| **Success** | Hele skjermen erstattes med success-card |
| **Confetti** | Lime + gold confetti faller 2s ved success |
| **Calendar lagt til** | "Lagt til i Google Calendar ✓" inline confirmation |

### Claude Design-prompt (paste-ready)

```
Design /booking/betal (steg 5 + success) for AK Golf HQ — mobil-first
430px.

Layout: padding 16px mobil. Forest brand, lime accent.

== Betalings-form ==

Steg-progress: alle 5 prikker aktive.

H2 "Steg 5 av 5" + H1 "Betal og fullfør".

"Du betaler"-kort: hvit bg, forest-200 border, 24px radius, padding 20px.
Pris-rad: "Totalt" Inter 13px forest-500 + "1 200 kr" JetBrains Mono 24px
forest-900 bold. MVA-meta forest-500.

Betalingsmetode-toggle: 2 radio-knapper i hvit kort. ◉ Kort / ○ Vipps.
Valgt = lime border 2px + lime-tint bg.

Stripe Elements-kort (custom-styled): hvit bg, forest-200 border, padding
0 (felt har egen padding). Felt:
- Kortnummer: label uppercase 11px forest-500 + input 16px JetBrains Mono
  med iconpacks (Visa/Mastercard auto-detect)
- Utløp + CVC: to-kolonne 50/50 grid, label + input som over
- Navn på kortet: full bredde
Border-bottom forest-100 mellom felt.

Sikkerhets-rad: 🔒-ikon forest-700 + "Sikker betaling via Stripe" Inter
12px forest-500.

Sticky bunn-CTA "Betal 1 200 kr": lime fyll forest-900 tekst, 48px
høyde, Inter Tight 16px medium. Spinner ved sending. Tekst nedenfor:
"Ved å betale godtar du våre vilkår" Inter 11px forest-500 underline-
lenke.

== Success-skjerm ==

Erstatter hele betalings-skjermen. Sentrert layout.

Hero: ✓-ikon i lime sirkel 80x80px, forest-900 ikon, sentrert.

H1 "Booking bekreftet" Inter Tight 28px medium, sentrert.

Body-tekst: "Du er booket inn med Anders Kristiansen mandag 8. juni 2026
kl 14:00." Inter 16px forest-700, sentrert, max 320px linje-bredde.

Ordre-detalj-kort: hvit bg, forest-200 border, 24px radius. Rader:
Ordrenummer (JetBrains Mono "AKG-2487"), Coach, Sted, Tid, Betalt.
Hver rad: label venstre forest-500 + verdi høyre forest-900 medium.

Kalender-knapp-stack: 3 outline-knapper full-bredde:
- "Legg til i Google Calendar 📅"
- "Legg til i Apple Calendar 📅"
- "Last ned .ics-fil"
Hver: 48px høyde, forest-700 outline + forest-700 tekst.

E-post-bekreftelse-meta: "Vi har sendt en bekreftelse til emma@example.
no" Inter 13px forest-600, sentrert.

CTA-stack:
- Primær "Gå til mine bookinger →" lime fyll
- Sekundær "Book en til time" text-link forest-700
- Tertiær "Tilbake til forsiden" text-link forest-500

Confetti-animasjon: lime + gold partikler faller 2s ved page-load.

Bruk components-onboarding, components-credit-indicator, components-
inputs (Stripe), components-buttons, components-featured.
```

---

## Leveranse-status — Runde 7

**Skjermer dekket i denne filen (5):**
- /booking (steg 1: lokasjon)
- /booking/coach (steg 2: coach)
- /booking/tid (steg 3: tid)
- /booking/bekreft (steg 4: bekreft)
- /booking/betal (steg 5: betal + success)

**Total skjermtelling oppdatert:**

| Runde | Område | Skjermer |
|---|---|---|
| 1 | Onboarding + onboarding-flows | 8 |
| 2 | PlayerHQ kjerneflater | 10 |
| 3 | AgencyOS kjerneflater | 9 |
| 4 | Innboks, varsler, profil | 6 |
| 5 | AgencyOS resterende moduler | 6 |
| 6 | Coach-Workbench dybde | 5 |
| 7 | Booking 5-stegs flyt | **5** |
| 8 | Foreldre + Marketing + Misc | (6 — Runde 8) |
| **Sum** | | **57 skjermer** |

Runde 7 ferdig. Klar for runde 8.
