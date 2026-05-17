# Prompt: CoachHQ Caddie Chat — Sports Editorial × 3 enheter

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
6. Lagre som `_outputs/10-coachhq-caddie.html`

---

## PROMPT (kopier alt under denne linjen)

Du er senior visuell designer som spesialiserer seg på Sports Editorial design
— magasin-redaksjon kombinert med performance-data for elite-coaching. Du
designer nå **CoachHQ Caddie Chat** — operativ AI-assistent for Anders
Kristiansen, hodecoachen i AK Golf Academy. Tonen er **redaksjonell intim
samtale** kombinert med **operativ kontroll**: tenk *"intervju-spalten i et
broadsheet, men med verktøy-trace i margen og approval-knapper inne i
replikkene"*. Caddie er ikke en chatbot — den er en assisterende redaksjons-
medarbeider som leser hele kunnskapsbasen, foreslår, og venter på Anders'
godkjenning.

Du har akkurat fått hele design-systemet (over). Følg det strengt:
- Italic Instrument Serif er hovedstemme (bruk OFTE — særlig i Caddie-svar)
- Typografi-glyfer som ikoner (ikke SVG-tegninger)
- Magazine spread-feel, ikke uniform chat-app-grid
- Forest green sparsomt som signatur, lime maks ÉN flate per skjerm
  (forbeholdt approval-prikker og «venter»-markører)
- Norsk locale (komma desimal, ikke-brytbar mellomrom, +/− fortegn)
- Editorial tone — Caddie skriver i italic-fragmenter med datadrevne
  observasjoner, aldri «som AI»-floskler

# SKJERM: CoachHQ Caddie Chat (3 enheter)

URL: `/admin/agencyos/caddie`

## Demo-bruker (faktiske data)

**Anders Kristiansen**
- Yrke: Head Coach, AK Golf Academy
- Aktive spillere: 12 (junior + senior elite-amateur)
- Datakilder Caddie leser: Trackman, GolfBox, Notion-vault (MORAD), Stripe,
  økt-notater, video-bibliotek
- Studio: AK Performance Studio + GFGK

Brukerspørsmål når Anders åpner Caddie:
*"Hjelp meg jobbe gjennom dagens situasjoner — hva ser du, hva foreslår du?"*

Tone: Dette er **ikke en chat-app** — det er **redaksjons-samarbeidet**.
Caddie er en assisterende redaktør som har lest hele arkivet, og leverer
forslag med verktøy-trace synlig. Anders er ikke usikker — han er presset på
tid, og bruker Caddie til å akselerere beslutninger. Hver Caddie-replikk skal
være:

1. **Observerende** — italic-fragment som åpner samtalen
2. **Datadrevet** — minst ett tall, én kilde, ett verktøy
3. **Handlbar** — én approval-knapp + minst én alternativ-vei

Caddie signerer **aldri** som coach. Caddie er **redaksjons-assistent** som
foreslår; Anders signerer planene.

## Realistiske data å bruke

- **I dag:** Søndag 17. mai 2026, kl 11:42 (grunnlovsdag, etter parade)
- **Aktive Caddie-samtaler:** 3 (Øyvind APP-plan, Emil reform, Marius oppfølging)
- **Aktive Caddie-funn (analyse-kjørt natt til søndag):** 14 funn fordelt
  på 5 spillere — 3 urgent (rød), 6 warning (gul), 5 info (grønn)
- **Verktøy Caddie har tilgang til:** 15 MCP-tools (les_spiller, analyser_sg,
  søk_vault, foreslå_plan, etc.)
- **Spillere diskutert siste 7 dager:** Øyvind, Emil, Marius, Markus, Ida
  (5 av 12)
- **Caddie-treffsikkerhet siste 30 dager:** 96% av godkjente forslag

### Aktiv samtale — «Øyvind APP 150-200 plan» (i dag)

Dette er **midtre kolonne** i layouten. 11 meldinger frem og tilbake. Vi viser
de siste 6-7 + scroll-mulighet. Samtalen begynte kl 10:14 etter at Anders
kom hjem fra paraden.

```
ANDERS · 10:14
*"Caddie. Vi må bli enige om APP 150-200-planen for Øyvind før mandag.
Hvor står vi etter Trackman-økta torsdag?"*

CADDIE · 10:14 ─── les_spiller_data(Øyvind) · analyser_sg(siste 90d) ───
*"Øyvind ligger på −0,18 på APP 150-200 vs PGA-tour-baseline. Sterk i
OTT (+0,42), ARG (+0,67) og PUTT (+0,43). 150-200-clusteret er den
eneste minus-metrikken — og den representerer +0,46-løftet til
+1,80-totalmålet. Trackman-økta torsdag (14.05) viste flat dispersion,
ikke distance-tap. Mediant carry på 7-jern: 167m (target 172m).
Spin-konsistens 24% under tour-snitt."*

[Se Trackman-økta 14.05 →]   [Se SG-rapport 90d →]

ANDERS · 10:21
*"Ok. Foreslå konkret drill-plan for de neste fire ukene. Mandag er
første økt."*

CADDIE · 10:22 ─── søk_vault("smal grønn", "APP 150-200") · les_drill_bibliotek() ───
*"Tre drill-kandidater fra vault og bibliotek:*

*1. Smal grønn 12m, 7-jern, 4 ball per oppsett — MORAD §3.4 koblet til
release-vinkler. Brukt på Markus jan-mars med +0,28 SG-forbedring.*

*2. Ladder-drill 145→185m, 5m steg, 5 ball/distanse — Mac O'Grady
KB §7.2. Bygger feel for delta-vinkel.*

*3. Pin-priority-drill, smal sone bak/foran flagg — fra vault-konsept
'hofta over toppen', koblet til APP scoring."*

*Anbefaling: kombiner #1 og #3. Plan vedlagt — 6 økter, fordelt
over 4 uker, taper-uke før European Amateur."*

[Godkjenn plan →]   [Se vedlagt plan]   [Be om alternativ]

ANDERS · 10:31
*"Hvorfor ikke ladder-drillen? Den passer Øyvind."*

CADDIE · 10:32 ─── analyser_spiller(Øyvind, ferdighetsprofil) · søk_vault("ladder") ───
*"Ladder-drillen forutsetter at distance-kontroll allerede er på plass.
Øyvind har distance-kontroll (carry-CV 4,1%, under tour 4,8%). Det
som mangler er sone-presisjon innenfor distansen — derfor smal grønn.
Ladder kan legges inn i uke 3 som transfer-drill når sone-presisjon
sitter."*

[Godkjenn justert plan →]   [Be om side-by-side]

ANDERS · 11:38
*"Bra. Godkjent. Send plan til Øyvind?"*

CADDIE · 11:39 ─── foreslå_plan(Øyvind, uke 20-23) · forbered_melding() ───
*"Plan klar. 6 økter mandag-fredag, taper uke 23. Foreslår denne
meldingen til Øyvind:*

*«Øyvind — Caddie og jeg har lagt APP 150-200-plan. Mandag 09:00:
smal grønn 12m, 7-jern. Fire økter over to uker, transfer-runde
før Olyo. Detaljer i PlayerHQ.»*

*Skal jeg sende?"*

[Send melding →]   [Rediger først]   [Lagre kun til plan]
```

Den siste Caddie-meldingen er **aktiv** — har approval-flow synlig.

### Verktøy-trace per Caddie-melding

Hver Caddie-svar har en **trace-linje** rett under signatur-eyebrow:

```
CADDIE · 10:22 ─── søk_vault("smal grønn") · les_drill_bibliotek() ───
```

Trace-linja er **JetBrains Mono 11px**, muted-fg, monospace-funksjons-syntaks.
På hover: liten popover viser parametre + responsetid (f.eks. *«søk_vault
returnerte 14 konsepter på 240ms»*). Trace-linja er **synlig som standard**
— det er kjernen i tillit til AI. Caddie viser alltid hvordan den vet det
den vet.

### Chat-historikk (venstre kolonne på desktop)

3 aktive samtaler + arkiv:

```
SAMTALER

I DAG
●  *Øyvind APP 150-200 plan*       11 meldinger · 11:39
   Sist Caddie: foreslår sendemelding

I GÅR
○  *Emil Strand reform*             8 meldinger · 18:22
   Sist Anders: «la oss tenke videre»

2 DAGER SIDEN
○  *Marius oppfølging*              5 meldinger · 14:05
   Sist Caddie: foreslår uke-justering

FORRIGE UKE
○  *Markus PR-syntese*              14 meldinger
○  *Ida sportsplan-utkast*           9 meldinger
○  *Stripe-rydding mai*              6 meldinger

ARKIV
→ *47 samtaler tidligere*
```

Aktiv samtale har forest-prikk (4px). Inaktive samtaler har dempet tekst.
Hver rad har italic-tittel + Geist-metadata.

### Kontekst-rail (høyre kolonne på desktop)

Dynamisk panel som viser hvilken spiller/kontekst som diskuteres.

**Når Øyvind diskuteres:**

```
KONTEKST · ØYVIND ROHJAN

[AVATAR 56px]

*Øyvind Rohjan*
19 ÅR · HCP +3,5

NÅVÆRENDE FOKUS
*APP 150-200*  ●●○○○ (fersk)

90-DAGERS SG
OTT    +0,42
APP    −0,18  ●
ARG    +0,67
PUTT   +0,43
TOTAL  +1,34

NESTE EVENT
European Amateur Q
15.−18. juni · Halmstad
27 dager

─

RELATERTE FUNN (3)
●●●●● Flytt mandag-økt
      til 100-150m
●●○○○ Carry-CV på 7-jern
      lavere enn forventet
●●○○○ Putt-tempo
      stabilt under press

→ Se alle 14 funn

─

VERKTØY CADDIE HAR
les_spiller_data(...)
analyser_sg(...)
søk_vault(...)
les_drill_bibliotek()
foreslå_plan(...)
forbered_melding()
analyser_runde(...)
generer_rapport(...)
sammenlign_perioder(...)
trackman_metrics(...)
les_okt_notat(...)
opprett_okt(...)
flytt_booking(...)
foreslå_video(...)
analyser_video(...)

15 verktøy aktivert
```

Kontekst-rail er **redaksjonelt** — ikke uniform widget-stack. Italic
headlines, dempet metadata, severity-prikker, verktøy-liste i Mono. Hver
sektion atskilt med hairline (1px var(--ak-border)).

### Approval-flow

Når Caddie foreslår en handling, vises **inline approval-rad** rett under
meldingen:

```
[Godkjenn plan →]   [Se vedlagt plan]   [Be om alternativ]
```

- Primary pull-tab (forest, pill): hovedhandling
- Secondary (transparent + border): alternativ
- Tertiary (tekst): subhandling

Ved trykk på Godkjenn:
- Forest accent-strek fader inn venstre for meldingen (3px, 96px høy)
- Italic-callout dukker opp under: *«Plan iverksatt. Caddie sender melding
  til Øyvind kl 11:40.»*
- Approval-radene fader til faded state (50% opacity)
- En liten tag dukker opp: `● GODKJENT · 11:39 · ANDERS`

### Slash-commands (input-felt)

Når Anders skriver `/` i input-feltet, fader en kommando-meny opp over feltet:

```
/spiller [navn]          — Last spiller-kontekst i rail
/sg-rapport [spiller]    — Generer SG-breakdown 30/90/365 d
/foreslå-drill [tema]    — Slå opp i drill-bibliotek
/sammenlign [a] [b]      — Sammenlign to spillere
/vault [søk]             — Søk MORAD-konsepter i vault
/runde [spiller]         — Hent siste runde-data
/trackman [spiller]      — Siste Trackman-økt
/plan [spiller] [uker]   — Generer ukeplan-forslag
/melding [spiller]       — Forbered melding-utkast
/eksport [PDF/CSV]       — Eksporter siste analyse
```

Kommando-meny: bg cream-warm, radius-md, shadow-3, kommandoer i Mono 13px
med italic-beskrivelse til høyre. Fuzzy-match highlight i forest.

### Input-felt (sticky bunn av chat-kolonnen)

```
┌─────────────────────────────────────────────────────────┐
│  *Spør Caddie om noe operativt — eller skriv «/»...*    │
│                                                            │
│                                                            │
└─────────────────────────────────────────────────────────┘
[/] [🎙] [📎]                                        [Send →]
```

Textarea min-h 80px, max-h 200px. Italic Instrument Serif placeholder.
Tre venstre-knapper (slash-trigger, tale-input, vedlegg), Send-pull-tab
høyre (primary, pill).

---

## STRUKTUR — 4 hovedseksjoner

Caddie er **operativ kommunikasjon**, så vi bruker færre spread-arketyper enn
en magasin-cover. Hovedlayouten er **3-kolonne på desktop** med editorial-
elementer innenfor hver kolonne:

1. **Cover-stripe på toppen** (kompakt, full bredde) — eyebrow + italic-
   tittel + 14-funn-stat
2. **3-kolonne hovedflate** (history | chat | context)
3. **Sticky input-felt** nederst i chat-kolonnen
4. **Kolofon** nederst (full bredde, dempet)

Innenfor hver kolonne brukes Sports Editorial-typografi (italic-headlines,
JBM-tall, Tiny caps for metadata, severity-prikker).

---

## DESKTOP 1440×900

### Layout

3-kolonne fra venstre:
- **History** 280px
- **Chat** flex-1 (~720-760px main content)
- **Context** 320px

Mast head 56px topp. Kolofon kort bunn. Ingen sidebar-TOC her — vi er dypt
inne i en operativ flate, og kolonne-1 er allerede chat-historikk-navigasjon.

### Mast head (56px)

```
COACHHQ · CADDIE · UTGAVE 047 · SØN 17.05 · 11:42        ⌘K   [Anders]
```

Eyebrow + ⌘K-knapp + Anders' avatar høyre. Border-bottom 1px.

### Cover-stripe (full bredde, 200px høy)

```
┌─────────────────────────────────────────────────────────────┐
│ ● COACHHQ CADDIE · UTGAVE 047 · SØN 17.05 · 11:42          │
│                                                                │
│  Caddie.                                                       │
│  *På vakt. Klar med 14 funn.*                                  │
│                                                                │
│  Tre samtaler aktive. 14 funn fra natt-analyse. 96% treff-     │
│  sikkerhet siste 30 dager. Spør hva som helst — verktøy-       │
│  trace er synlig i hver replikk.                               │
│                                                                │
│  ─── 14 funn ─── 3 samtaler ─── 96% treffsikkerhet ───        │
└─────────────────────────────────────────────────────────────┘
```

- Eyebrow med pulserende grønn live-prikk
- Cover-tittel (Instrument Serif italic, 64px — kompakt operativ versjon):
  `Caddie.` regular + `*På vakt. Klar med 14 funn.*` italic
- Lead body Geist 16px, max-width 640px
- Stat-strek nederst: tre tall i Mono 14px (14, 3, 96%) atskilt med
  hairline-stykker, tiny-caps labels

Bakgrunn: cream-standard. Border-bottom: 1px var(--ak-border).

### Kolonne 1 — Chat-historikk (280px, venstre)

Padding 24px. Border-right 1px var(--ak-border).

```
SAMTALER                          [+ ny]

I DAG
●  *Øyvind APP 150-200 plan*
   11 meldinger · 11:39
   Sist Caddie: foreslår sendemelding

I GÅR
○  *Emil Strand reform*
   8 meldinger · 18:22
   Sist Anders: «la oss tenke videre»

2 DAGER SIDEN
○  *Marius oppfølging*
   5 meldinger · 14:05
   Sist Caddie: foreslår uke-justering

FORRIGE UKE
○  Markus PR-syntese · 14 meld.
○  Ida sportsplan-utkast · 9
○  Stripe-rydding mai · 6

ARKIV
→ 47 tidligere samtaler
```

**Specs:**
- Tittel-headers: Tiny caps `SAMTALER`, dato-grupper `I DAG`, `I GÅR`, etc.
- Aktiv samtale: forest-prikk 4px venstre + bg muted 50%
- Italic Instrument Serif 15px på samtale-tittel
- Geist 12px metadata
- Hover: bg muted 100%
- + ny: tertiary pull-tab høyre i header

### Kolonne 2 — Aktiv chat (flex-1)

Padding 32px 48px. Min-bredde 640px. Vertikal scroll i chat-flow.

**Chat-header (sticky topp):**
```
*Øyvind APP 150-200 plan*                  ●●●●● · 11 meldinger
*Startet i dag 10:14 · 12 verktøykall*
                                           [Eksporter] [Avslutt]
```

Italic tittel 24px + status-prikker (5/5 betyr aktiv beslutning) + metadata.
2 pull-tabs høyre (secondary).

**Chat-flow:**

Meldinger alternerer venstre (Anders) og høyre (Caddie). MEN — vi er IKKE
en chat-boble-app. Hver melding er en **editorial replikk-blokk**:

**Anders-melding (venstre-aligned):**
```
ANDERS · 11:38

*"Bra. Godkjent. Send plan til Øyvind?"*
```

- Eyebrow Tiny caps med navn + tid
- Italic Instrument Serif 17px sitat
- Max-width 520px
- 12px gap mellom eyebrow og sitat
- Border-left 2px var(--ak-ink) (subtilt — markerer Anders' replikk)

**Caddie-melding (høyre-aligned, men ikke chat-boble):**
```
                                                CADDIE · 11:39

                                                ─── foreslå_plan(Øyvind, uke 20-23)
                                                ─── forbered_melding() ───

                                                *"Plan klar. 6 økter mandag-
                                                fredag, taper uke 23. Foreslår
                                                denne meldingen til Øyvind:*

                                                *«Øyvind — Caddie og jeg har lagt
                                                APP 150-200-plan. Mandag 09:00:
                                                smal grønn 12m, 7-jern. Fire
                                                økter over to uker, transfer-
                                                runde før Olyo. Detaljer i
                                                PlayerHQ.»*

                                                *Skal jeg sende?"*

                                                [Send melding →] [Rediger] [Bare lagre]
```

- Eyebrow Tiny caps + lime-prikk 4px (Caddie-markør)
- **Verktøy-trace**: JBM 11px, muted-fg, indrykk med hairline-prefiks `───`
  og suffix. Trace-linja er TYDELIG synlig, ikke skjult.
- Italic Instrument Serif 17px sitat
- Max-width 540px
- Border-left 2px lime (Caddie-signatur, men subtilt)
- Approval-rad nederst med 3 pull-tabs

**Sitatet inne i Caddie-meldingen** (det Caddie foreslår å sende til
Øyvind) får en ekstra indentasjon + dempet bg (cream-warm), så det er
typografisk klart at det er **forslag til ekstern melding**, ikke
Caddie sin egen stemme.

**Spacing:**
- 32px vertikal luft mellom hver melding-blokk
- Hairline-divider mellom dager (italic timestamp midt i: `─── i dag ───`)

**Sticky input nederst i kolonnen** (se Input-spec under).

### Kolonne 3 — Kontekst-rail (320px, høyre)

Padding 24px. Border-left 1px var(--ak-border).

Layout (vertikal stack):

```
KONTEKST · ØYVIND ROHJAN
─────────────────────────

[AVATAR 56px sentralisert]

*Øyvind Rohjan*
19 ÅR · HCP +3,5

─

90-DAGERS SG
OTT    +0,42
APP    −0,18  ●
ARG    +0,67
PUTT   +0,43
─
TOTAL  +1,34

─

NESTE EVENT
*European Amateur Q*
15.−18. juni · Halmstad
27 dager unna

─

RELATERTE FUNN · 3

●●●●● *Flytt mandag-økt*
      *til 100-150m*
      Trackman 14.05

●●○○○ *Carry-CV lavere*
      *enn forventet*
      Trackman analyse

●●○○○ *Putt-tempo stabilt*
      *under press*
      Runde 11.-13.05

→ Se alle 14 funn

─

VERKTØY CADDIE HAR
les_spiller_data(...)
analyser_sg(...)
søk_vault(...)
les_drill_bibliotek()
foreslå_plan(...)
forbered_melding()
analyser_runde(...)
generer_rapport(...)
sammenlign_perioder(...)
trackman_metrics(...)
les_okt_notat(...)
opprett_okt(...)
flytt_booking(...)
foreslå_video(...)
analyser_video(...)

*15 verktøy aktivert*
```

**Specs:**
- Tittel-headers: Tiny caps tracking 0.1em
- Avatar: 56px sirkel, forest-bakgrunn, hvit Instrument Serif initialer
- Spiller-navn: Instrument Serif italic 20px
- SG-tabell: editorial-stil, JBM tabular-nums right-aligned, hairline-divider
  før TOTAL, APP-raden har lime-prikk høyre (markerer fokus-metrikken)
- Funn-rader: severity-prikker venstre, italic-tekst, Geist 12px metadata
- Verktøy-liste: JBM 11px, muted-fg, én per linje
- Hver seksjon: 24px luft, hairline mellom
- Last-linje: Instrument Serif italic 13px

### Sticky input (bunn av chat-kolonnen)

```
─────────────────────────────────────────────────────────
SVAR ELLER FORTSETT SAMTALEN

┌─────────────────────────────────────────────────────────┐
│  *Spør Caddie — eller skriv «/» for kommandoer.*        │
│                                                            │
│                                                            │
└─────────────────────────────────────────────────────────┘
[/] [🎙] [📎]                                    [Send →]
```

Sticky position over kolofon. Border-top 1px. Bakgrunn cream-standard.
Textarea med italic-placeholder. Tre tertiary-knapper venstre (slash-trigger,
tale, vedlegg). Send primary høyre.

### Kolofon (full bredde, dempet)

```
COACHHQ CADDIE · Utgave 047 · Søndag 17. mai 2026 · Anders Kristiansen, redaktør
*Caddie er redaksjons-assistent. Coach signerer alltid selv.*
```

Tiny caps + italic-undertekst. Padding 32px 0 16px.

---

## IPAD 1024×768 (landscape)

### Layout

2-kolonne: **history (toggleable) | chat + sticky context-tab**

På iPad blir 3 kolonner for trangt. Vi bytter til 2-kolonne + en innfellbar
kontekst-panel som åpnes/lukkes fra topp-høyre.

```
┌──────────────────────────────────────────────────────────┐
│ COACHHQ CADDIE · UTG. 047 · 17.05 · 11:42  [≡] [Anders]│ ← 56px masthead
├──────────────────────────────────────────────────────────┤
│                                                            │
│ COVER-STRIPE (full bredde, 160px)                        │
│ — Caddie. På vakt. Klar med 14 funn.                     │
│                                                            │
├──────────────┬───────────────────────────────────────────┤
│ HISTORY      │ ACTIVE CHAT                               │
│ (240px,      │                                            │
│ toggleable   │ *Øyvind APP 150-200 plan*  [Kontekst ↗]   │
│ via ≡-knapp) │                                            │
│              │ ANDERS · 11:38                            │
│ — Øyvind     │ *"Bra. Godkjent..."*                      │
│ — Emil       │                                            │
│ — Marius     │                CADDIE · 11:39             │
│              │                ─── foreslå_plan(...) ───  │
│              │                *"Plan klar..."*           │
│              │                [Send →] [Rediger]         │
│              │                                            │
│              │ [Sticky input bunn]                       │
└──────────────┴───────────────────────────────────────────┘
```

**Tilpasninger fra desktop:**
- History-kolonne: 240px (var 280), toggleable via ≡-knapp i header
- Context-rail: gjemt som standard, åpnes via «Kontekst ↗»-knapp i chat-
  header som **sliding side-panel fra høyre** (400px bredt)
- Cover-stripe: 160px (var 200), tittel 56px (var 64)
- Anders/Caddie-meldinger: 16px italic (var 17), max-width 480px
- Verktøy-trace: 11px JBM (samme)
- Touch-targets minimum 44px
- ⌘K → søke-ikon i header høyre
- Approval pull-tabs: M-size (var L på desktop)
- Sticky input: textarea min-h 72px

---

## IPHONE 393×852 (iPhone 15)

### Layout

**Full-screen chat** med:
- Header med tilbake-pil + samtale-tittel
- History som modal (åpnes fra hamburger venstre)
- Context som modal (åpnes fra info-ikon høyre)
- Sticky input + bottom tab-bar

```
┌─────────────────────────┐
│ [←] *Øyvind APP-plan* [i]│ ← 44px chat-header
├─────────────────────────┤
│                          │
│ ─── i dag 10:14 ───      │
│                          │
│ ANDERS · 10:14           │
│ *"Caddie. Vi må bli      │
│ enige om APP 150-200-    │
│ planen for Øyvind før    │
│ mandag."*                │
│                          │
│       CADDIE · 10:14     │
│       ─── les_spiller    │
│       ─── analyser_sg ─  │
│                          │
│       *"Øyvind ligger    │
│       på −0,18 på APP    │
│       150-200 vs PGA-    │
│       tour-baseline.     │
│       Sterk i OTT, ARG,  │
│       PUTT..."*          │
│                          │
│       [Se Trackman →]    │
│       [Se SG-rapport →]  │
│                          │
│ ANDERS · 10:21           │
│ *"Ok. Foreslå konkret    │
│ drill-plan."*            │
│                          │
│       CADDIE · 10:22     │
│       ─── søk_vault ──   │
│       ─── les_drill ──   │
│                          │
│       *"Tre drill-       │
│       kandidater fra     │
│       vault og biblio... │
│                          │
│       1. Smal grønn 12m  │
│       2. Ladder-drill    │
│       3. Pin-priority"*  │
│                          │
│       *Anbefaling:       │
│       kombiner #1 og #3."│
│                          │
│       [Godkjenn plan →]  │
│       [Se vedlagt plan]  │
│       [Be om alternativ] │
│                          │
│ ANDERS · 11:38           │
│ *"Bra. Godkjent. Send    │
│ plan til Øyvind?"*       │
│                          │
│       CADDIE · 11:39     │
│       ─── foreslå_plan   │
│       ─── forbered_meld  │
│                          │
│       *"Plan klar. 6     │
│       økter mandag-      │
│       fredag, taper uke  │
│       23. Foreslår denne │
│       meldingen til      │
│       Øyvind:*           │
│                          │
│       ┌──────────────┐   │
│       │ *«Øyvind —   │   │
│       │ Caddie og jeg│   │
│       │ har lagt APP │   │
│       │ 150-200-plan.│   │
│       │ Mandag 09:00:│   │
│       │ smal grønn   │   │
│       │ 12m, 7-jern."│   │
│       └──────────────┘   │
│                          │
│       *Skal jeg sende?"* │
│                          │
│       [Send melding →]   │
│       [Rediger]          │
│       [Bare lagre]       │
│                          │
├─────────────────────────┤
│ ┌───────────────────────┐│
│ │ */ for kommandoer..* ││ ← Sticky input
│ │                       ││
│ └───────────────────────┘│
│ [/][🎙][📎]      [Send →]│
├─────────────────────────┤
│ 🏠 👥 📅 💬 🤖 ●         │ ← Bottom tab (Caddie aktiv)
└─────────────────────────┘
```

**Modal — History (åpnes fra ≡ venstre i header):**
- Full-screen sliding fra venstre
- Liste over samtaler (Øyvind, Emil, Marius, arkiv)
- Trykk for å bytte samtale, X for å lukke

**Modal — Kontekst (åpnes fra [i] høyre i header):**
- Full-screen sliding fra høyre
- Spiller-kontekst, SG-tabell, funn-liste, verktøy-liste
- X for å lukke

**Tilpasninger fra desktop:**
- Ingen cover-stripe på chat-skjermen (for trangt) — flyttet til
  Caddie-tab-roten (en egen «inbox»-skjerm før man velger samtale)
- Caddie og Anders alternerer venstre/høyre med 24px indent
- Italic-meldinger 15-16px (var 17)
- Verktøy-trace: JBM 10px, max 2 verktøy synlig per linje, resten kollapses
  med «+3» (tap for å se alle)
- Approval pull-tabs: stacker vertikalt (full-bredde, M-size) på iPhone
- Sticky input: én-linje preview som ekspanderer ved tap
- Bottom tab-bar: 5 ikoner (Hub, Spillere, Bookinger, Stripe, Caddie aktiv)
- Foreslått melding-blokk inni Caddie-meldingen: cream-warm bg, radius-md,
  padding 12px, italic 14px
- ⌘K → søke-ikon i header (åpner full-screen kommando-overlay)

---

## INTERAKTIVITET (alle 3 enheter)

- **Page-load koreografi** (sekvensiell, 0-2000ms, se design.md seksjon 9)
- **Cover-stripe stat-strek** count-up (0 → 14, 0 → 3, 0 → 96%, 600ms hver, stagger 100ms)
- **Chat-meldinger** stagger fade-up når samtalen lastes (50ms delay/melding,
  ease-out 300ms)
- **Verktøy-trace** fade-in 200ms etter Caddie-meldingen er ferdig animert,
  hairline tegner seg inn med stroke-dashoffset 600ms
- **Typing-indicator** for Caddie (når simulert): tre prikker som pulserer i
  rekkefølge, replaced av faktisk melding etter 800-1500ms
- **Approval-knapper:** ved trykk på Godkjenn — forest accent-strek fader inn
  venstre for meldingen, italic-callout «*Plan iverksatt...*» dukker opp med
  fade + slide-up 300ms, approval-rad fades til 50% opacity
- **Slash-meny:** når «/» skrives — fader opp over input-feltet med scale-pop
  (0.96 → 1.0, 200ms), fuzzy-match med forest highlight på match-tegn
- **Kontekst-rail rader:** hover bg muted, ChevronRight slides +4px
- **Severity-prikker** i funn-listen fade-fyller venstre→høyre på load
- **Verktøy-liste hover:** italic tooltip viser kort beskrivelse av verktøyet
- **Pulserende lime-prikk** på «Caddie»-eyebrow (4s langsom puls — den lever)
- **Pulserende grønn prikk** på aktiv samtale i history (2s loop)
- **Tap-feedback** på iPhone: lett scale(0.98) på press
- **iPad sliding kontekst-panel:** translateX fra høyre, ease-out 300ms
- **iPhone modaler** (history + kontekst): slide-in fra venstre/høyre,
  300ms, backdrop fade

---

## COMMAND PALETTE ⌘K (desktop + iPad)

På iPhone erstattes med søke-overlay (full screen) som åpner via søke-ikon
i header.

**20+ Caddie-spesifikke kommandoer** i kategorier:

**Samtale**
- Ny samtale med Caddie
- Bytt til Øyvind-samtale
- Bytt til Emil-samtale
- Bytt til Marius-samtale
- Arkiver gjeldende samtale
- Eksporter samtale som PDF
- Søk i alle samtaler

**Spiller-kontekst (slash-kommandoer)**
- /spiller Øyvind — last Øyvind-kontekst
- /spiller Emil Strand — last Emil-kontekst
- /spiller Marius — last Marius-kontekst
- /spiller Markus — last Markus-kontekst
- /spiller Ida — last Ida-kontekst

**Analyser**
- /sg-rapport Øyvind — generer SG-breakdown
- /trackman Øyvind — vis siste Trackman-økt
- /runde Øyvind — siste 3 runder
- /sammenlign Øyvind vs Markus
- /vault «hofta toppen» — søk MORAD-vault

**Drill og plan**
- /foreslå-drill APP 150-200
- /foreslå-drill hofte-release
- /plan Øyvind 4 uker
- /melding Øyvind — forbered melding-utkast

**Caddie-kontroll**
- Pause Caddie-forslag
- Vis Caddie-treffsikkerhet (96% siste 30 d)
- Vis alle 14 funn fra natt-analyse
- Vis aktive verktøy-tracer
- Send Caddie-feedback («dette var feil fordi...»)

**Approval**
- Godkjenn siste forslag
- Avvis siste forslag
- Marker alle som lest
- Vis venter-på-godkjenning-liste

**Navigasjon**
- Tilbake til CoachHQ Hub
- Åpne Spillere
- Åpne Bookinger
- Åpne Stripe-panel

**Hjelp**
- Hva er forskjellen på Caddie og en chatbot?
- Snarveier
- Send tilbakemelding

⌘K åpner med fade + scale-pop. Fuzzy search på tittel + kategori.
↑↓ Enter for å velge, Esc for å lukke. Vis «Sist brukt»-seksjon øverst
med Anders' 3 mest brukte kommandoer.

---

## OUTPUT-FORMAT

Lever **ÉN HTML-fil** med tre viewport-seksjoner stablet vertikalt:

```html
<section class="device device--desktop">
  <header class="device-label">Desktop · 1440 × 900</header>
  <div class="frame" style="width:1440px; height:auto; min-height:900px; overflow:hidden;">
    <!-- Desktop layout -->
  </div>
</section>

<section class="device device--ipad">
  <header class="device-label">iPad · 1024 × 768</header>
  <div class="frame" style="width:1024px; height:auto; min-height:768px; overflow:hidden;">
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

NB: Caddie-skjermen er **innholdstung i chat-kolonnen** (6-7 meldinger med
verktøy-trace + approval-flow). La frame-en være `height:auto` så hele
samtalen vises — ikke kutt på 900/768. Browser-scroll innenfor chat-kolonnen
er OK om Anders vil bla.

Hver `device-label` er Tiny (10px Geist caps tracking 0.1em).
Hver `frame` har subtil 1px border + 4px radius for å antyde device-mockup.

Mellom hver seksjon: 96px luft + en hairline-separator med italic label
«*— iPad-utgave —*» og «*— iPhone-utgave —*» centered.

Inkluder:
- Tailwind CDN inline
- Google Fonts CDN (Instrument Serif italic, Geist variable, JetBrains Mono)
- Lucide inline SVG der det trengs (kun UI-utility — Send, Paperclip, Mic,
  ChevronRight, Search, Info, Menu, X, ArrowLeft, ArrowRight)
- CSS-variabler øverst (design.md seksjon 29)
- Norsk locale gjennomgående (komma desimal, NBSP-tusenskille, typografisk
  minustegn)
- All interaktivitet fungerer (count-up, stagger, scale-pop, hover-states,
  sticky input, approval-flow, slash-meny)

---

## ETTER LEVERING

Gi kort oppsummering (under 200 ord):

1. **3 designvalg som styrker Caddie-skjermen** — særlig hvordan **verktøy-
   trace** synliggjøres som tillit-byggende element, og hvordan vi unngår
   å bli en generisk chatbot-UI
2. **Hva du ville løftet i neste iterasjon** — én konkret ting per enhet
3. **Hva du er usikker på** — hvor trenger du Anders' input?
   (F.eks. om verktøy-trace skal være standard-synlig eller bare ved hover,
   hvor mye av samtalen som bør vises uten scroll, om approval-knapper
   skal være primary/secondary/tertiary)
