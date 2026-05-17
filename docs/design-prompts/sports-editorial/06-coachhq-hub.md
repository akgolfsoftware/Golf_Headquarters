# Prompt: CoachHQ AgencyOS Hub — Sports Editorial × 3 enheter

> Lim inn `design.md` (Sports Editorial design system) FØRST som kontekst.
> Deretter denne prompten. Claude Design leverer én HTML-fil med desktop,
> iPad og iPhone stablet vertikalt.

---

## Slik bruker du dette i Claude Design

1. Åpne https://claude.ai/new (Sonnet 4.6 eller Opus, design-mode/artifacts aktivert)
2. Lim inn HELE innholdet av `design.md` (Sports Editorial design system)
3. Trykk Enter to ganger
4. Lim inn prompten under (alt fra og med `---` til slutten)
5. Claude Design leverer komplett HTML
6. Lagre som `_outputs/06-coachhq-hub.html`

---

## PROMPT (kopier alt under denne linjen)

Du er senior visuell designer som spesialiserer seg på Sports Editorial design
— magasin-redaksjon kombinert med performance-data for elite-coaching. Du
designer nå CoachHQ — operativsystemet for en profesjonell coach. Tonen er
mer **operativ** enn for spiller-portalen: tenk *"Bloomberg Terminal møter
The New York Times"* snarere enn ren magasin-feature. Anders skal kunne
handle raskt — men typografien, tonen og editorial-DNA bevares.

Du har akkurat fått hele design-systemet (over). Følg det strengt:
- Italic Instrument Serif er hovedstemme (bruk OFTE — også i operativ flate)
- Typografi-glyfer som ikoner (ikke SVG-tegninger)
- Magazine spread-feel, ikke uniform dashboard-grid — men mer info-tetthet
  enn spiller-portalen
- Forest green sparsomt som signatur, lime maks ÉN flate per skjerm
- Norsk locale (komma desimal, ikke-brytbar mellomrom, +/− fortegn)
- Editorial tone — observerende italic-fragmenter, aldri "Velkommen tilbake"
- Coach-tonen er **observerende + handlekraftig**: italic-headlines for
  Caddie-funn, JetBrains Mono for tall, korte verb-CTA-er for handling

# SKJERM: CoachHQ AgencyOS Hub (3 enheter)

URL: `/admin/agencyos`

## Demo-bruker (faktiske data)

**Anders Kristiansen**
- Yrke: Head Coach, AK Golf Academy
- Lisens: NGF A-lisens
- Erfaring: 12+ år som golf-coach
- Aktive spillere: 12 (junior + senior elite-amateur)
- Hjemmebane: Gamle Fredrikstad GK (GFGK)
- Studio: AK Performance Studio (Trackman + force plates)

Brukerspørsmål når Anders åpner Hub:
*"Hva trenger oppmerksomhet i dag, og hvor står porteføljen?"*

Tone: Operativ, redaksjonell, ikke pedagogisk. Anders trenger ikke å bli
forklart noe — han trenger å se hva som krever ham nå, og handle. Skjermen
er hans coach-cockpit — men formgitt som forside på et redaksjons-system,
ikke som SaaS-dashboard. Caddie er hans AI-assistent som har lagt frem
forslag for godkjenning.

## Realistiske data å bruke

- **I dag:** Søndag 17. mai 2026, kl 07:31 (grunnlovsdag — rolig morgen,
  men én spiller har turnering)
- **Utgavetema:** Hverdag/Turnering-hybrid — rolig dag, men én operativ
  prioritering
- **Aktive spillere:** 12 totalt
- **Til godkjenning:** 3 Caddie-forslag (1 urgent, 2 warning)
- **Timer i dag:** 4 bookinger (én turneringsstøtte allerede booket)
- **Innbetalt MTD:** 84 800 kr
- **Utestående:** 23 400 kr fordelt på 5 spillere, eldste 12 dager forfalt
- **Spillere uten plan:** 1 (urgent)
- **Tester forfaller:** 2 spillere innen 14 dager
- **Utestående faktura:** 1 spiller har faktura > 30 dager

### De 12 aktive spillerne (utvalgt for visning)

| Spiller | HCP | Status |
|---|---|---|
| Øyvind Rohjan | +3,5 | Tour-aspirant, European Amateur om 28 dager |
| Sofie Larsen | +0,8 | NM-medalje 2025, jenter 16-17 |
| Lars Hansen | +1,2 | Junior elite, GFGK-talent |
| Markus R. Pedersen | 4,2 | 16 år, stigende form |
| Emma Solberg | 2,8 | Tester forfaller om 9 dager |
| Aksel Berg | 6,4 | Tester forfaller om 12 dager |
| Mia Næss | 8,1 | Ingen plan — venter på sportsplan |
| Theodor Bull | 3,5 | Utestående faktura 12 dager forfalt |
| Ingrid Holm | 5,9 | Aktiv, betaler i tide |
| Henrik Tønne | +0,2 | Konkurranseaktiv |
| Vilde Aas | 9,3 | Junior, fersk i programmet |
| Sander Lie | 4,7 | Aktiv, ingen flagg |

### Til godkjenning — 3 Caddie-forslag

**1. URGENT (5/5 severity, rød)**
Caddie foreslår: *"Flytt Øyvind sin mandag-økt fra TEK Approach 150-180m
til TEK Approach 100-150m. Trackman-data fra i går viser at 150-200 er
flat, men 100-150 er der underliggende kontrolltap er størst."*
Påvirker: Øyvind Rohjan, mandag 18. mai 09:00
Foreslått: Caddie · 16. mai kl 22:14
Begrunnelse-tag: *Datadrevet · APP-cluster · pre-Olyo*

**2. WARNING (4/5 severity, gul)**
Caddie foreslår: *"Send påminnelse til Theodor Bull — faktura 4 800 kr
er 12 dager forfalt. Andre påminnelse anbefalt."*
Påvirker: Theodor Bull · faktura #2026-088
Foreslått: Caddie · 17. mai kl 06:00

**3. WARNING (3/5 severity, gul)**
Caddie foreslår: *"Book Emma Solberg inn for Trackman-test innen 22. mai
— forrige test 8. februar. Sportsplan krever test hver 90 dag."*
Påvirker: Emma Solberg · neste ledig slot tirsdag 19. mai 14:00
Foreslått: Caddie · 17. mai kl 06:00

### Dagens booking-timeline (Søndag 17. mai)

- **09:00–11:00** — Sofie Larsen · *Helg-økt før Norges Cup* · GFGK Range
  (Hun spiller turnering i morgen — siste finpuss)
- **11:30–12:30** — Aksel Berg · *Putt-drill 10-15 ft* · Studio
- **13:00–13:00** — *Lunsj / 17. mai-parade*
- **15:00–16:00** — Henrik Tønne · *Mental prep + range* · GFGK
- **16:30–17:30** — Mia Næss · *Intro-økt, vurdering* · Studio

### Mandag-prep allerede booket

- **09:00** — Øyvind Rohjan · TEK Approach (Caddie foreslår endring, se over)

### Stripe-data

- **Innbetalt MTD:** 84 800 kr (mai t.o.m. 17.)
- **Utestående totalt:** 23 400 kr (5 spillere)
  - Theodor Bull: 4 800 kr · forfalt 12 dager
  - Vilde Aas: 3 200 kr · forfalt 4 dager
  - Sander Lie: 5 400 kr · forfalt 2 dager
  - Lars Hansen: 4 800 kr · ikke forfalt ennå (5 dager til)
  - Mia Næss: 5 200 kr · ikke forfalt ennå (8 dager til)
- **Neste forfall:** 19. mai (Lars Hansen, 4 800 kr)
- **MRR siste 12 mnd:** 38 → 42 → 48 → 51 → 54 → 58 → 62 → 64 → 68 → 72 → 74 → 78 tusen kr
  (Sparkline-trend — stigende)

### Strategisk seksjon (3 cards)

1. **Spillere uten plan (1)** — Mia Næss · status URGENT
   *Intro-økt i dag kl 16:30 — sportsplan må være klar før neste uke.*
2. **Tester forfaller (2)** — Emma Solberg (9d), Aksel Berg (12d)
   *Trackman + force plates · book begge denne uka.*
3. **Utestående faktura (1)** — Theodor Bull · 4 800 kr · 12 dager forfalt
   *Andre påminnelse anbefalt av Caddie.*

### Coach-melding ut (siste handling Anders gjorde)

Sendt til Øyvind kl 19:42 i går:
*"Øyvind — så på Trackman-økta di. APP 150-200 er flat. Vi tar smal grønn-
drill mandag, så ser vi om vi kan dra opp den ene metrikken før European
Amateur."*

### Editorial tone — coach-perspektiv (eksempler på åpningslinjer)

- *"Grunnlovsdag. Rolig morgen, men Sofie spiller i morgen."*
- *"Tre forslag venter. Ett haster."*
- *"Tolv spillere. Ett rødt flagg."*
- *"84 800 inn. 23 400 venter."*
- *"En måned til European Amateur. Øyvind står godt."*

---

## STRUKTUR — 7 spreads kombinert

Coach-tonen er **operativ + redaksjonell**. Vi blander Atlas (referansetabell),
Lead Spread (status), Data Story (Stripe-tall), The Workshop (booking-timeline),
og Field Notes (Caddie-aktivitet bunn). Mer info-tetthet enn spiller-portalen,
men hver seksjon må fortsatt være tydelig redaksjonelt komponert — ikke
4×3 grid.

Bruk **7 spread-arketyper** fra design.md seksjon 12 og 13:

1. **Cover (Arketype A, variant Hverdag)** — observerende italic-tittel for dagen
2. **KPI-strip (modifisert Atlas + Stat block)** — 1 featured + 3 mindre, asymmetrisk
3. **Til godkjenning (Lead Spread)** — Caddie-forslag som rad-spread med severity-prikker
4. **Dagens flyt (The Workshop)** — booking-timeline 08:00–18:00 som trinn
5. **Strategisk seksjon (Atlas)** — 3 cards: Plan / Tester / Faktura
6. **Stripe-panel (Data Story)** — Innbetalt MTD + Utestående + Neste forfall + MRR-sparkline
7. **Caddie-aktivitet (Field Notes, sticky bunn)** — input + siste 3 handlinger

Footer/kolofon nederst.

---

## DESKTOP 1440×900

### Layout

12-col med sidebar TOC permanent venstre (280px).

**Sidebar TOC:**
```
AK GOLF HQ · COACH
Utgave 047 · 17.05

01  Hub
02  Spillere
03  Bookinger
04  Stripe
05  Caddie
06  Sportsplan-lab
07  Tester

PORTALER
↳ PlayerHQ (som spiller)
↳ Booking
↳ Marketing

  Anders Kristiansen
  Head Coach · A-lisens
```

**Main content (max 1080px):**

### Spread 1 — Cover (12-col, kompakt versjon)

Operativ cover — mindre luftig enn spiller-portalen, mer like en redaksjons-
forside klokka 07 om morgenen.

- Eyebrow: `● COACHHQ · UTGAVE 047 · SØNDAG 17. MAI 2026 · 07:31` med
  pulserende grønn live-prikk
- Cover-tittel (Instrument Serif italic, 80px — ikke 112, vi er på jobb):
  ```
  Anders —
  *tre forslag venter.*
  ```
- Lead-paragraf (Geist 17px, max-width 620px):
  *"Grunnlovsdag. Tolv aktive spillere, ett rødt flagg. Caddie har lagt
  frem tre forslag siden i går kveld — ett haster. Sofie spiller Norges
  Cup i morgen."*
- Høyre side (3-col): liten "I dag"-stempel
  ```
  4
  TIMER I DAG
  *09 · 11.30 · 15 · 16.30*
  ```

### Spread 2 — KPI-strip (asymmetrisk: 1 featured + 3 mindre)

12-col fordelt 6+2+2+2. Den featured KPI-en er **Til godkjenning** —
det er det Anders skal handle på først.

**Venstre 6-col — Featured (Til godkjenning):**
- Card-flate med subtil border, padding 32px
- Eyebrow: `TIL GODKJENNING · CADDIE-FORSLAG`
- Stort tall (Stat Hero, 96px JBM): `3`
- Italic annotasjon stor (Instrument Serif italic, 20px):
  *"Ett haster — Øyvind sin mandag-økt. To kan vente til ettermiddagen."*
- 3 mini-rader under:
  - ●●●●● `Øyvind · TEK 150-180m` *flytt til 100-150m*
  - ●●●●○ `Theodor · faktura 12d forfalt` *send påminnelse*
  - ●●●○○ `Emma · Trackman-test forfaller` *book innen 22.05*
- Pull-tab nederst høyre: `Gå gjennom alle →` (primary)

**Høyre 6-col delt i 3 stat-blocks (2+2+2):**

KPI 2 — Aktive spillere
```
12
AKTIVE SPILLERE
*Hvorav 4 elite-amateur,*
*8 junior-program.*
```

KPI 3 — Timer i dag
```
4
TIMER · 17.05
*Første 09:00 Sofie.*
*Siste 16:30 Mia.*
```

KPI 4 — Innbetalt MTD
```
84 800
INNBETALT · MAI
*Inn fra 11 spillere.*
*23 400 kr utestående.*
```
(Tall i JBM 56-64px — mindre enn featured, men fortsatt prominent. Bruk
NBSP-tusenskille `84 800`.)

### Spread 3 — Til godkjenning (Lead Spread, 8+4)

Detalj-listen for de 3 Caddie-forslagene som radspread.

**Venstre 8-col — forslags-rader:**

```
SUBHEAD ITALIC 28PX:
*Caddie · siste forslag*

─────────────────────────────────────────────────────────

●●●●●  *URGENT*       FOR ØYVIND ROHJAN · MAN 18.05 09:00
                      *Flytt TEK Approach 150-180m → 100-150m.*
                      Trackman-data: 100-150m er underliggende kontrolltap.
                      Datadrevet · APP-cluster · pre-European Amateur

                      [Godkjenn] [Avvis] [Se data →]
                      Foreslått 16.05 22:14 · Caddie

─────────────────────────────────────────────────────────

●●●●○  WARNING        FOR THEODOR BULL · FAKTURA #2026-088
                      *Send påminnelse — 4 800 kr, 12 dager forfalt.*
                      Andre påminnelse. Standard mal anbefalt.

                      [Send påminnelse] [Avvis] [Se faktura →]
                      Foreslått 17.05 06:00 · Caddie

─────────────────────────────────────────────────────────

●●●○○  WARNING        FOR EMMA SOLBERG · TRACKMAN-TEST
                      *Book test innen 22. mai. Forrige 8. februar.*
                      Sportsplan krever test hver 90 dag. Tir 19.05 14:00 ledig.

                      [Book tir 14:00] [Avvis] [Velg annen tid →]
                      Foreslått 17.05 06:00 · Caddie
```

Severity-prikker er forest green for aktive, muted for inaktive. Pull-tabs
er small-size (32px høy, Geist 500 13px). Første pull-tab på hver rad er
primary, andre er secondary (transparent + border), tredje er tertiary
(tekst-knapp).

**Høyre 4-col — Marginalia:**
```
        ↘
   *Caddie har 96% treffsikkerhet*
   *på godkjente forslag siste 30 dager.*

   *Du har avvist 4 forslag —*
   *alle fordi datagrunnlaget var*
   *tynt. Caddie har lært av det.*
```
Med SVG-pil (stroke-dashoffset animasjon) som peker fra teksten ned mot
første forslag.

### Spread 4 — Dagens flyt (The Workshop, 8-col + 4-col)

Booking-timeline 08:00–18:00 som trinn-spread. Bakgrunn: cream-cool
#EEF0EC (Workshop-arketype).

**Venstre 8-col — timeline:**

```
WORKSHOP — DAGENS FLYT · SØNDAG 17.05

08:00  ─────────  *Stille morgen. Caddie-gjennomgang.*

09:00  ●●●●●●●●  SOFIE LARSEN · helg-økt før Norges Cup
                  GFGK Range · 2 t · finpuss før Hauger
                  TEK · Approach 100-150m
                  [Notater →]  [Se sportsplan →]

11:30  ●●●●●     AKSEL BERG · putt-drill 10-15 ft
                  Studio · 60 min · sportsplan-blokk 14
                  SLAG · Putt-rate
                  [Notater →]  [Se sportsplan →]

13:00  ─────────  *Lunsj · 17. mai-parade i Fredrikstad sentrum.*

15:00  ●●●●●     HENRIK TØNNE · mental prep + range
                  GFGK · 60 min · pre-Garmin Norges Cup
                  TURN · Pre-tournament
                  [Notater →]  [Se sportsplan →]

16:30  ●●●●○     MIA NÆSS · intro-økt, vurdering
                  Studio · 60 min · FØRSTE ØKT
                  *Sportsplan må skrives etter denne.*
                  [Forberedelse →]  [Mia-profil →]

18:00  ─────────
```

Trinn-nummer erstattes av klokkeslett (JetBrains Mono 28px). Hver økt har
kapasitetsindikator (severity-prikker — der ●●●●● er full booking, ●●●●○
betyr intro/vurdering uten full plan).

Pyramide-prikk til venstre for hver økt-tittel (4px) i pyramide-fargen
til kategorien (TEK forest, SLAG mid-green, etc.).

**Høyre 4-col — Mandag-prep:**
```
*Booket i morgen:*

09:00  ÖYVIND ROHJAN · TEK APPROACH
       *Caddie foreslår endring.*
       Se forslag øverst.

(ingen flere bookinger man 18.05 — pre-Olyo-prep med
Sofie kan settes inn på ledig 11:00-tid.)

[Sett opp Sofie kl 11 →]
```

### Spread 5 — Strategisk seksjon (Atlas, 3 cards)

Bakgrunn: newsprint #ECE9DF (Atlas-arketype). Full bredde 12-col, 3 cards
side ved side med varierende vekt.

```
ATLAS — KREVER OPPMERKSOMHET
─────────────────────────────────────────────────────────

│ 1                          │ 2                          │ 3
│ SPILLERE UTEN PLAN         │ TESTER FORFALLER           │ UTESTÅENDE FAKTURA
│                            │                            │
│ *1*                        │ *2*                        │ *1*
│                            │                            │
│ *Mia Næss.*                │ *Emma Solberg · 9 dager.*  │ *Theodor Bull.*
│ Intro 16:30 i dag.         │ *Aksel Berg · 12 dager.*   │ 4 800 kr · 12 d forfalt.
│ Sportsplan før neste uke.  │ Book Trackman denne uka.   │ Andre påminnelse.
│                            │                            │
│ ●●●●● URGENT               │ ●●●○○ WARNING              │ ●●●●○ WARNING
│                            │                            │
│ [Åpne Mia-profil →]        │ [Book Emma tir 14 →]       │ [Send påminnelse →]
```

3 cards med radius-lg, bg cream-warm card-flate på newsprint-bunn.
Padding 24px hver. Border 1px var(--ak-border) subtilt. Hover translateY(-2px)
+ shadow-1.

Asymmetri: card 1 har URGENT-stripe (3px destructive border-left), card 2
og 3 har warn-border-left (2px warn). De ser dermed forskjellige ut selv
om de er like brede.

### Spread 6 — Stripe-panel (Data Story, 6+6)

**Venstre 6-col — Tall:**

```
EYEBROW: STRIPE · MAI 2026

   84 800                  *Innbetalt mai t.o.m. 17.*
   KR INN                  *Beste mai-måned hittil.*

   23 400                  *Fordelt på 5 spillere.*
   KR UTESTÅENDE           *Eldste 12 dager forfalt.*

   19.05                   *Lars Hansen · 4 800 kr.*
   NESTE FORFALL           *Ikke forfalt ennå.*
```

Tall i JBM 56-72px, ulike størrelser for å skape rytme (84 800 størst,
23 400 mellom, 19.05 minst).

**Høyre 6-col — MRR-sparkline + utestående-tabell:**

```
MRR SISTE 12 MND
[sparkline 12 punkter, 38 → 78 tusen kr, forest stroke]
                                                                ↘ +105%
*38 til 78 tusen kr. Doblet på 12 mnd.*

─────────────────────────────────────────────

UTESTÅENDE FAKTURA · 5 RADER

  Theodor Bull        4 800    ●●●●● 12d
  Vilde Aas           3 200    ●●●○○  4d
  Sander Lie          5 400    ●●○○○  2d
  Lars Hansen         4 800    ○○○○○ −5d  (ikke forfalt)
  Mia Næss            5 200    ○○○○○ −8d  (ikke forfalt)
  ─────────────────────────────────
  TOTAL              23 400
```

Editorial-tabell uten gridlines. Severity-prikker viser hvor lenge forfalt.
Tall i JBM tabular-nums right-aligned.

### Spread 7 — Caddie-aktivitet (Field Notes, sticky bunn)

Bakgrunn: cream-warm #F5EFE2 (Field Notes-arketype). Sticky position bottom
på desktop hvis viewport tillater — ellers naturlig flow under Stripe-panelet.

```
FELTNOTATER — CADDIE
─────────────────────────────────────────────────────────

*Spør Caddie noe operativt:*

┌─────────────────────────────────────────────────────────┐
│  🔍  *F.eks: «Hvem trenger sportsplan-oppdatering?»*  ⌘ │
└─────────────────────────────────────────────────────────┘

SISTE HANDLINGER · CADDIE

  17.05 06:00   Foreslo: book Emma Trackman innen 22.05
                Status: venter på godkjenning

  17.05 06:00   Foreslo: send påminnelse Theodor 12d forfalt
                Status: venter på godkjenning

  16.05 22:14   Foreslo: flytt Øyvind TEK APP 150-180 → 100-150
                Status: venter på godkjenning · URGENT

  16.05 14:20   Godkjent: justerte Markus' uke-plan etter SG-spike
                Status: aktivert · neste økt onsdag 09:00

  16.05 09:00   Godkjent: flyttet Sofie helg-økt til søndag 09:00
                Status: aktivert · i dag 09:00
```

Hver rad har dato-stempel i JBM 11px venstre, hovedteksten i Geist 14-15px
med italic-fragmenter på selve forslaget. Status i Tiny caps høyre.

### Kolofon nederst:
```
COACHHQ · Utgave 047 · Søndag 17. mai 2026 · Trykket digitalt fra Fredrikstad
Redaktør: Anders Kristiansen · Head Coach · A-lisens NGF · AK Golf Group AS
```

---

## IPAD 1024×768 (landscape)

### Layout

Top-tab nav (48px), ingen sidebar. Main padding 32-48px hver side.

```
┌──────────────────────────────────────────────────────────┐
│ COACHHQ · UTGAVE 047 · 17.05 · 07:31              🔍 ⌘  │ ← 56px masthead
├──────────────────────────────────────────────────────────┤
│ [HUB] [SPILLERE] [BOOKING] [STRIPE] [CADDIE] [MER]      │ ← 48px tabs
├──────────────────────────────────────────────────────────┤
│                                                            │
│ COVER (72px italic-tittel "Anders — tre forslag venter.", │
│        full-bredde, kompakt)                               │
│                                                            │
│ KPI-STRIP (1 featured + 3 mindre, fortsatt 6+2+2+2)      │
│ — Til godkjenning står størst                             │
│                                                            │
│ TIL GODKJENNING (full-bredde radspread,                   │
│ 3 Caddie-forslag stablet)                                 │
│                                                            │
│ DAGENS FLYT (8+4 fortsatt OK, kompakt timeline)          │
│                                                            │
│ STRATEGISK SEKSJON (3 cards side ved side, mindre)       │
│                                                            │
│ STRIPE-PANEL (6+6 fortsatt OK, tall mindre)             │
│                                                            │
│ CADDIE-AKTIVITET (full-bredde, sticky bunn)              │
│                                                            │
│ KOLOFON                                                   │
└──────────────────────────────────────────────────────────┘
```

**Tilpasninger fra desktop:**
- Cover-tittel: 72px (var 80px) — nesten samme, vi er på operativ side
- Stat hero featured (3-tall): 80px (var 96)
- Stat secondary (12, 4, 84 800): 48-56px (var 56-64)
- Pull quote / annotation: 24-28px (var 28+)
- Photo aspects: ikke relevant — vi er på data-side
- Touch-targets min 44px (alle pull-tabs L-size på iPad)
- ⌘K erstattes med søke-ikon (forstørrelsesglass) topp høyre
- Marginalia kondensert inline
- Caddie-aktivitet: vis kun siste 3 handlinger (var 5)

---

## IPHONE 393×852 (iPhone 15)

### Layout

Bottom tab-bar (56px). Single column. Padding 16-20px hver side.

```
┌─────────────────────────┐
│ COACHHQ · ANDERS    🔍 │ ← 44px running head
├─────────────────────────┤
│                          │
│ ● COACHHQ ·             │
│   UTGAVE 047            │
│   SØN 17.05 · 07:31     │
│                          │
│ Anders —                 │ ← Cover-tittel 44px
│ *tre forslag venter.*    │
│                          │
│ Grunnlovsdag. 12 aktive  │
│ spillere, ett rødt       │
│ flagg. Caddie venter     │
│ på godkjenning.          │
│                          │
│ ─────                    │
│                          │
│ FEATURED KPI             │
│                          │
│  3                       │
│  TIL GODKJENNING         │
│  *Ett haster.*           │
│                          │
│  ●●●●● Øyvind · TEK      │
│  ●●●●○ Theodor · faktura │
│  ●●●○○ Emma · test       │
│                          │
│  [Gå gjennom alle →]     │
│                          │
│ ─────                    │
│                          │
│ NØKKELTALL               │
│                          │
│  12                      │
│  AKTIVE SPILLERE         │
│                          │
│  4                       │
│  TIMER I DAG             │
│                          │
│  84 800                  │
│  KR INN · MAI            │
│  *23 400 utestående.*    │
│                          │
│ ─────                    │
│                          │
│ TIL GODKJENNING          │
│                          │
│ ●●●●● URGENT             │
│ ØYVIND ROHJAN            │
│ *Flytt TEK 150-180m*     │
│ *→ 100-150m.*            │
│ Datadrevet · APP-cluster │
│ [Godkjenn] [Se data →]   │
│                          │
│ ●●●●○ WARNING            │
│ THEODOR BULL             │
│ *Send påminnelse.*       │
│ 4 800 kr · 12 d forfalt  │
│ [Send →] [Se faktura →]  │
│                          │
│ ●●●○○ WARNING            │
│ EMMA SOLBERG             │
│ *Book Trackman 19.05.*   │
│ [Book →] [Annen tid →]   │
│                          │
│ ─────                    │
│                          │
│ DAGENS FLYT              │
│ ● 09:00 Sofie · GFGK     │
│   helg-økt, 2t           │
│ ● 11:30 Aksel · Studio   │
│   putt-drill, 60 min     │
│ ─ 13:00 Lunsj, parade    │
│ ● 15:00 Henrik · GFGK    │
│   mental prep, 60 min    │
│ ● 16:30 Mia · Studio     │
│   intro, 60 min          │
│                          │
│ ─────                    │
│                          │
│ KREVER OPPMERKSOMHET     │
│                          │
│ ●●●●● 1 uten plan        │
│       *Mia Næss*         │
│ ●●●○○ 2 tester forfaller │
│       *Emma, Aksel*      │
│ ●●●●○ 1 utestående       │
│       *Theodor 4 800 kr* │
│                          │
│ ─────                    │
│                          │
│ STRIPE · MAI             │
│  84 800 INN              │
│  23 400 UTESTÅENDE       │
│  19.05  NESTE FORFALL    │
│                          │
│  MRR 12 MND              │
│  [sparkline 38→78k]      │
│  *+105% · doblet.*       │
│                          │
│ ─────                    │
│                          │
│ CADDIE-AKTIVITET         │
│                          │
│ 17.05 06:00              │
│ *Foreslo: book Emma*     │
│ Venter på godkjenning    │
│                          │
│ 17.05 06:00              │
│ *Foreslo: påminn Theodor*│
│ Venter på godkjenning    │
│                          │
│ 16.05 22:14              │
│ *Foreslo: flytt Øyvind*  │
│ URGENT · venter          │
│                          │
│ KOLOFON                  │
│                          │
├─────────────────────────┤
│ [Spør Caddie...] ⌘      │ ← Sticky input over tab-bar
├─────────────────────────┤
│ 🏠 👥 📅 💳 🤖          │ ← Bottom tab-bar 56px
└─────────────────────────┘
```

**Tilpasninger fra desktop:**
- Cover-tittel: 44px (var 80)
- Lead body: 16px (var 17)
- Stat hero featured: 56-64px (var 96)
- Stat secondary: 32-40px (var 56-64)
- ALLE spreads stables vertikalt — null kolonner
- Drop caps: 4× body (40-56px)
- Til godkjenning som stack-cards (én under annen), ikke radspread
- Dagens flyt som vertikal liste, ikke timeline med høyre-spalte
- Strategisk seksjon som 3 stackede summary-rader
- Stripe-panel kondensert til tall-stack + sparkline
- Caddie-aktivitet: siste 3 handlinger, kompakt
- Sticky bunn: Caddie-input over tab-bar
- Bottom tab-bar: Hub, Spillere, Bookinger, Stripe, Caddie

---

## INTERAKTIVITET (alle 3 enheter)

- **Page-load koreografi** (sekvensiell, 0-2000ms, se design.md seksjon 9)
- **Count-up** på "3" til godkjenning (0 → 3, 600ms — kort, vi er på jobb)
- **Count-up** på "12" aktive spillere (0 → 12, 600ms)
- **Count-up** på "84 800" innbetalt MTD (0 → 84 800, 1000ms)
- **MRR-sparkline** tegnes inn med stroke-dashoffset (1200ms)
- **Severity-prikker** fade-in stagger venstre→høyre (50ms delay/prikk)
- **Caddie-forslag-rader** fade-up stagger (50ms delay/rad)
- **Strategiske cards** fade-up stagger
- **Pulserende live-prikk** i eyebrow (2s loop)
- **Hover på forslag-rad:** subtil bg-shift til var(--ak-muted) 50% alpha
- **Hover på pull-tab:** translateY(-1px) + shadow-1
- **Tap-feedback** på iPhone: lett scale(0.98) på press
- **Inline confirmation** når Anders trykker "Godkjenn": forest accent-strek
  fade-in venstre for raden + italic-callout *"Forslag godkjent. Caddie
  iverksetter."* (300ms fade, dwell 2s)

---

## COMMAND PALETTE ⌘K (desktop + iPad)

På iPhone erstattes med søke-overlay (full screen) som åpner via søke-ikon
eller Caddie-input nederst.

**20+ COACH-spesifikke kommandoer** i kategorier:

**Godkjenning & Caddie**
- Godkjenn alle ventende forslag
- Avvis Øyvind-forslaget
- Pause Caddie-forslag i dag
- Vis Caddie-treffsikkerhet
- Send Caddie-feedback

**Spillere**
- Åpne Øyvind-profil
- Åpne Mia-profil (intro 16:30)
- Vis alle spillere
- Marker Mia som «ny»
- Skriv sportsplan for Mia
- Søk spillere

**Bookinger**
- Sett opp Sofie kl 11 (mandag-prep)
- Book Emma Trackman tir 14:00
- Vis kalender denne uka
- Vis kalender mandag 18.05
- Flytt Øyvind mandag-økt
- Avlys økt
- Legg til ny booking

**Stripe & Faktura**
- Send påminnelse Theodor (12d)
- Vis utestående faktura
- Vis innbetalt MTD breakdown
- Generer mai-rapport
- Eksporter MRR-trend

**Tester & Sportsplan**
- Book Trackman Emma
- Book Trackman Aksel
- Vis tester forfaller-liste
- Åpne sportsplan-lab
- Opprett ny test-mal

**Kommunikasjon**
- Send melding til Sofie (pre-turnering)
- Send fellesmelding alle 12
- Skriv coach-rapport for Øyvind
- Send mandag-info Øyvind

**Hjelp & innstillinger**
- Snarveier
- Bytt til PlayerHQ-visning
- Sett operativ pause (out-of-office)
- Send tilbakemelding

⌘K åpner med fade + scale-pop. Fuzzy search på tittel + kategori.
↑↓ Enter for å velge, Esc for å lukke. Vis "Sist brukt"-seksjon øverst
med Anders' 3 mest brukte kommandoer.

---

## OUTPUT-FORMAT

Lever **ÉN HTML-fil** med tre viewport-seksjoner stablet vertikalt:

```html
<section class="device device--desktop">
  <header class="device-label">Desktop · 1440 × 900</header>
  <div class="frame" style="width:1440px; height:900px; overflow:hidden;">
    <!-- Desktop layout -->
  </div>
</section>

<section class="device device--ipad">
  <header class="device-label">iPad · 1024 × 768</header>
  <div class="frame" style="width:1024px; height:768px; overflow:hidden;">
    <!-- iPad layout -->
  </div>
</section>

<section class="device device--iphone">
  <header class="device-label">iPhone 15 · 393 × 852</header>
  <div class="frame" style="width:393px; min-height:852px; overflow:hidden;">
    <!-- iPhone layout -->
  </div>
</section>
```

Hver `device-label` er Tiny (10px Geist caps tracking 0.1em).
Hver `frame` har subtil 1px border + 4px radius for å antyde device-mockup.

Mellom hver seksjon: 96px luft + en hairline-separator med italic label
"*— iPad-utgave —*" centered.

Inkluder:
- Tailwind CDN inline
- Google Fonts CDN (Instrument Serif italic, Geist variable, JetBrains Mono)
- Lucide inline SVG der det trengs (kun UI-utility, ikke shot-icons)
- CSS-variabler øverst (design.md seksjon 29)
- Norsk locale gjennomgående
- All interaktivitet fungerer

---

## ETTER LEVERING

Gi kort oppsummering (under 200 ord):

1. **3 designvalg som styrker Hub-en** — hva som gjør den til en operativ
   coach-cockpit uten å miste editorial-DNA
2. **Hva du ville løftet i neste iterasjon** — én konkret ting per enhet
3. **Hva du er usikker på** — hvor trenger du Anders' input?
