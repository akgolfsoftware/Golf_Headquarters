# Claude Design-prompter: PLAYERHQ MEG (10 skjermer)

> Lim inn felles designspec fra `00-shared-spec.md` øverst i HVER prompt.
> Hver prompt nedenfor er én skjerm — bestill HTML-fil med inline CSS, 1440px viewport.
> Bruker er Markus R, 16 år, A1-spiller, HCP 4.2, hjemmebane Bossum, PRO-tier.

---

## PlayerHQ-shell (gjelder alle 10 prompter)

Alle skjermer bruker samme shell:
- **Sidebar 256px (mørk):** bakgrunn `#0F2A22`, lime accent `#D1F843` på aktiv. Logo "AK Golf" øverst. Profilbilde-sirkel 40px + "Markus R · HCP 4.2" nederst.
- **Sidebar-moduler:** Hjem · Trening · Turneringer · Analyse · Coach · Booking · Meg (aktiv)
- **Sub-nav for Meg (horisontal tab-strip øverst i innhold):** Profil · Abonnement · Bookinger · Foreldre · Helse · Dokumenter · Utstyrsbag · Innstillinger · Sikkerhet
- **Hovedinnhold:** lyst tema `#FAFAF7`, max-width 1184px, padding 48px 64px.
- **PageHeader:** eyebrow (mono 11px uppercase) · tittel (Inter Tight 36px med ett italic Instrument Serif-ord) · sub (16px muted-foreground).
- **Du-form, norsk bokmål, ingen emoji, JetBrains Mono på alle tall.**

---

## Prompt 8.1 — Min profil

```
Du er senior UI/UX-designer for AK Golf HQ. Design MIN PROFIL i PlayerHQ.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Min profil
URL: /portal/meg
Bruker: Markus R (16, A1, HCP 4.2)

### Layout
PlayerHQ-shell. Sub-nav: Profil (aktiv).

### Header (full bredde)
Eyebrow: "PLAYERHQ · MEG"
Tittel: "Profilen din, *kort fortalt.*" — italic på "kort fortalt"
Sub: "Det grunnleggende: hvem du er, hvor du spiller, hvilken tier du har."

### Hero-rad (full bredde, 240px høyde)
To-kolonne 30/70.

**Venstre — Avatar**
- Sirkulært bilde 200×200 med subtil lime ring (3px) og lucide pencil-overlay 32px nederst-høyre på hover
- Under: "Last opp nytt bilde" (mono 12px medium link)

**Høyre — Identifikasjon**
- Tittel (Inter Tight 36px): "Markus Røinås Pedersen"
- 4 chip-rad: "HCP 4.2" · "A1-spiller" · "PRO-tier" (lime bg #D1F843 mørk tekst) · "Bossum GK"
- Sub-tekst (16px muted): "Spiller hos AK Golf Academy siden januar 2024 · 187 økter logget · 14 turneringer"

### Detalj-grid (2 kolonner, 4 kort hver)

**Venstre kolonne — Personalia**

Kort: "Personlig"
- Felt-grid 2 kolonner med label (mono 11px uppercase muted) + verdi:
  - Fornavn: Markus
  - Etternavn: Røinås Pedersen
  - Født: 14. juni 2009 (16 år)
  - Kjønn: Mann
  - E-post: markus.pedersen@example.no
  - Telefon: +47 488 23 145
  - Adresse: Storgata 12, 1607 Fredrikstad
- [Rediger →] knapp nederst

Kort: "Golf-identitet"
- Hjemmebane: Bossum Golfklubb
- Klubbmedlemskap: Bossum GK siden 2018
- GolfBox-ID: 234567
- Handicap: 4.2 (justert 12. mai)
- Eksakthandicap-historikk: [Se trend →]

**Høyre kolonne — Coaching**

Kort: "Coaching-status"
- Hovedcoach: Anders Kristiansen
- Tilknyttet: 02. januar 2024
- Aktive planer: 2
- 1-1 økter totalt: 47
- Neste 1-1: 14. mai 2026 14:00

Kort: "Tier-status"
- Stort tier-badge: "PRO" (Inter Tight 32px på lime bakgrunn 80px høyde)
- Pris: "300 kr/mnd"
- Neste fakturering: 01. juni 2026
- Inkluderer: AI-coach 24/7, ubegrenset analyse, video-bibliotek
- CTA: [Administrer abonnement →]

### Editorial moment
"kort fortalt" italic · PRO-badge med lime bg er det visuelle høydepunktet

Lever som én HTML-fil.
```

---

## Prompt 8.2 — Abonnement

```
[LIM INN 00-shared-spec.md]

## Skjerm: Abonnement
URL: /portal/meg/abonnement
Bruker: Markus R, PRO-tier siden september 2025

### Layout
PlayerHQ-shell. Sub-nav: Abonnement (aktiv).

### Header (full bredde)
Eyebrow: "PLAYERHQ · MEG · ABONNEMENT"
Tittel: "Tieren din, *forklart.*" — italic på "forklart"
Sub: "Du står på PRO siden 12. september 2025. Neste fakturering er 1. juni 2026."

### Tier-hero (full bredde, 280px høyde, lys lime bg #F4FBC5)
To-kolonne 50/50.

**Venstre — Aktuell tier**
- Stor tier-label (Inter Tight 56px): "PRO"
- Pris-display: "300 kr / mnd" (mono 32px)
- Sub: "Aktivert 12. september 2025 · 8 måneder aktiv"
- Status-pill: "AKTIV" (mono 11px, mørk grønn bg)

**Høyre — Inkludert**
- Tittel: "Det du får" (mono 11px uppercase)
- Liste med lucide check-ikoner (16px):
  - AI-coach 24/7 (chat + analyse)
  - Ubegrenset treningsanalyse + krysstabell
  - Coach-videoer fra Anders
  - Foreldre-tilgang (opptil 2)
  - Helse-logg + skade-tracking
  - Eksport som PDF
  - PrioRiteritert support (4t responstid)

### Sammenligning-tabell (full bredde)
Tre-kolonne tabell:

| Funksjon | GRATIS | PRO (du) | ELITE |
|---|---|---|---|
| Pris/mnd | 0 kr | **300 kr** | Ikke tilgjengelig |
| Treningsplaner fra coach | ✓ | **✓** | — |
| Bookinger | ✓ | **✓** | — |
| Coach-meldinger | Begrenset 5/mnd | **Ubegrenset** | — |
| AI-coach | — | **24/7** | — |
| Treningsanalyse | Oversikt | **Full + krysstabell** | — |
| Coach-videoer | — | **Ja** | — |
| Foreldre-tilgang | — | **2 stk** | — |
| Helse-logg | — | **Ja** | — |
| Prioritert support | — | **4t** | — |

(PRO-kolonne er fremhevet med lime bakgrunn #F4FBC5)

ELITE-kolonnen er grå — Anders har bestemt at ELITE ikke tilbys nå.

### Handlinger-rad (2 kort, like brede)

**Kort 1: Endre abonnement**
- "Tilbake til GRATIS" (sekundær lenke)
- "Pauseer abonnementet (1-3 mnd)"
- "Avslutt fra neste fakturering"

**Kort 2: Betalingsmetode**
- Eyebrow: "BETALES MED"
- "Visa **** 4291" (mono 14px) · "utløper 09/2028"
- [Endre kort →]
- [Last ned fakturahistorikk (PDF)]

### Bilagshistorikk (full bredde tabell)
Header: "BILAGSHISTORIKK · 8 BETALINGER"

| Dato | Beløp | Status | Bilag |
|---|---|---|---|
| 01.05.2026 | 300,00 | Betalt | [PDF] |
| 01.04.2026 | 300,00 | Betalt | [PDF] |
| 01.03.2026 | 300,00 | Betalt | [PDF] |
| 01.02.2026 | 300,00 | Betalt | [PDF] |
| 01.01.2026 | 300,00 | Betalt | [PDF] |
| 01.12.2025 | 300,00 | Betalt | [PDF] |
| 01.11.2025 | 300,00 | Betalt | [PDF] |
| 01.10.2025 | 300,00 | Betalt | [PDF] |
| 12.09.2025 | 300,00 | Betalt (oppstart) | [PDF] |

Totalt betalt 2700 kr siden oppstart.

### Editorial moment
"forklart" italic

Lever som én HTML-fil.
```

---

## Prompt 8.3 — Mine bookinger

```
[LIM INN 00-shared-spec.md]

## Skjerm: Mine bookinger
URL: /portal/meg/bookinger
Bruker: Markus R

### Layout
PlayerHQ-shell. Sub-nav: Bookinger (aktiv).

### Header (full bredde)
Eyebrow: "PLAYERHQ · MEG · BOOKINGER"
Tittel: "Det som *er booket.*" — italic på "er booket"
Sub: "Du har 4 kommende bookinger og 47 fullførte. Avbestilling må skje minst 24 timer før."

### Tab-strip
Chips: Kommende (4) · Tidligere (47)
"Kommende" er aktiv.

### Kommende bookinger (liste, full bredde)

4 booking-kort stablet, hver 140px høyde:

**Kort 1 (i dag, lime venstrekant 4px)**
- Eyebrow: "I DAG · 14:00"
- Tittel: "TEK Approach 150m" (Inter Tight 22px)
- Sub: "1-1 med Anders Kristiansen · 45 min · Bossum range"
- Pyramide-pill: TEK (mono 11px #005840 bg, hvit tekst)
- Tids-info (mono 14px): "14:00-14:45 · om 2 timer"
- CTA-rad: [Detaljer →] [Reschedule] [Avbestill]
- Mikrolink: "Avbestilling låst — under 24t igjen"

**Kort 2**
- Eyebrow: "TORSDAG 16. MAI · 09:00"
- "TEK Putting 3m"
- "1-1 med Anders · 60 min · Performance Studio"
- Pyramide-pill: TEK
- "Om 2 dager"
- CTA: [Detaljer →] [Reschedule] [Avbestill]

**Kort 3**
- Eyebrow: "LØRDAG 18. MAI · 09:00"
- "Range-booking solo"
- "Bossum range · 90 min · simulator 3"
- Pyramide-pill: Egen
- "Om 4 dager"
- CTA: [Detaljer →] [Reschedule] [Avbestill]

**Kort 4**
- Eyebrow: "SØNDAG 19. MAI · 10:00"
- "TURN forberedelse"
- "1-1 med Anders · 60 min · Bossum"
- Pyramide-pill: TURN (lime bg, mørk tekst)
- "Om 5 dager"
- CTA: [Detaljer →] [Reschedule] [Avbestill]

### Kalender-mini (sidepanel høyre, 280px)
- Mini-kalender 1 måned med fargede prikker på dagene
- "4 økter i mai" mono 11px
- [Se i full kalender →]

### Footer-rad
[+ Book ny tid] (primary lime CTA)
[Se ledige tider fra Anders →]

### Tidligere-tab (alternativt state, vis i samme HTML men kollapset)
Tabell med 6 rader synlig + "Vis flere 41 →" knapp:

| Dato | Tid | Tittel | Coach | Status |
|---|---|---|---|---|
| 12.05.2026 | 10:00 | TEK Driver gate-test | Anders | Fullført |
| 09.05.2026 | 14:00 | SLAG Wedge 50m | Anders | Fullført |
| 06.05.2026 | 17:00 | FYS Styrke underkropp | Solo | Fullført |
| 04.05.2026 | 09:00 | SPILL Skjeggestad 18h | Solo | Fullført |
| 02.05.2026 | 14:00 | TEK Approach 150m | Anders | Fullført |
| 28.04.2026 | 14:00 | SLAG Bunker | Anders | Fullført |

### Editorial moment
"er booket" italic

Lever som én HTML-fil med både Kommende og Tidligere synlig.
```

---

## Prompt 8.4 — Reschedule

```
[LIM INN 00-shared-spec.md]

## Skjerm: Reschedule
URL: /portal/meg/bookinger/reschedule/[id]
Bruker: Markus R, vil flytte "TEK Putting 3m" 16. mai 09:00

### Layout
PlayerHQ-shell. Sub-nav: Bookinger (aktiv).
Tilbake-pil øverst: "← Tilbake til bookinger".

### Header (full bredde)
Eyebrow: "PLAYERHQ · MEG · BOOKINGER · RESCHEDULE"
Tittel: "Flytt til *et nytt tidspunkt.*" — italic på "et nytt tidspunkt"
Sub: "TEK Putting 3m med Anders. Nåværende tid: torsdag 16. mai 09:00-10:00."

### To-kolonne 40/60

#### VENSTRE — Nåværende booking-kort
- Eyebrow: "DU FLYTTER"
- Tittel: "TEK Putting 3m"
- "1-1 med Anders Kristiansen"
- "Torsdag 16. mai · 09:00-10:00 (60 min)"
- "Performance Studio · simulator 1"
- Pyramide-pill: TEK
- Mikrolink: "Avbestill i stedet for å flytte"

Info-blokk under (lys gul bg #FFF7D6):
"Anders setter av tiden. Flytt så raskt som mulig så han kan booke noen andre. Reschedule må skje minst 24t før — du har 38 timer."

#### HØYRE — Datovelger + tider

**Datovelger (mini-kalender 7 dager bredt × 3 uker):**
Header: "VELG NY DATO"
Måned-navigasjon: ← Mai 2026 →

Kalender-grid:
- Dager med ledige tider: hvit bg
- Dager uten ledige: grå muted
- Ikke valgbar (mer enn 30 dager fram): blokk-grå
- Valgt dato: lime bg #D1F843 mørk tekst

(Marker "Tirsdag 20. mai" som valgt med lime fill)

**Ledige slots-grid (under datovelger, etter dato er valgt):**
Header: "LEDIGE SLOTS · TIRSDAG 20. MAI"

Grid 4 kolonner × 4 rader (16 slots), hver slot er en knapp 80×56px:
- 08:00 (ledig, hvit)
- 09:00 (ledig)
- 10:00 (booket av annen — grå disabled "BOOKET")
- 11:00 (ledig)
- 12:00 (lunsj — grå "LUNSJ")
- 13:00 (ledig)
- 14:00 (ledig)
- 15:00 **(valgt — lime bg)**
- 16:00 (ledig)
- 17:00 (booket — grå)
- 18:00 (ledig)
- 19:00 (utenfor åpningstid — grå disabled)
- 20:00, 21:00, 22:00 (grå disabled)

Mono 13px tabular tall.

**Anbefaling-kort (under slots):**
- Lime venstrekant 3px
- Eyebrow: "ANDERS' ANBEFALING"
- "15:00 er ideelt for putting-økter — du er varm fra annen trening og ikke mentalt sliten ennå."

**Sammendrag (under, før bekreft):**
"Ny tid: tirsdag 20. mai 15:00-16:00 · Performance Studio simulator 1"
"Forskjell fra opprinnelig: 4 dager senere, 6 timer senere på dagen"

**Footer-knapper:**
- [Avbryt] (sekundær venstre)
- [Bekreft ny tid →] (primær lime, full bredde høyre 60%)

### Bekreftelses-modal (vis i samme HTML, som overlay-state)
Modal max-width 480px, sentrert.
- Tittel (Inter Tight 24px): "Flytter du til *tirsdag 20. mai 15:00?*"
- Sub: "Anders får automatisk beskjed. Den gamle tiden frigjøres."
- Pyramide-strip: TEK
- [Avbryt] [Ja, flytt →]

### Editorial moment
"et nytt tidspunkt" italic

Lever som én HTML-fil med både slot-velger og modal-state synlig.
```

---

## Prompt 8.5 — Foreldre-tilknytting

```
[LIM INN 00-shared-spec.md]

## Skjerm: Foreldre-tilknytting
URL: /portal/meg/foreldre
Bruker: Markus R, 16 år

### Layout
PlayerHQ-shell. Sub-nav: Foreldre (aktiv).

### Header (full bredde)
Eyebrow: "PLAYERHQ · MEG · FORELDRE"
Tittel: "Hvem som ser *hva.*" — italic på "hva"
Sub: "Som under 18 er foreldre tilkoblet automatisk. Du kontrollerer hvor mye de ser."

### Info-bånd (lys lime bg)
"Foreldre kan ikke se meldingstrådene med Anders eller AI-coach-samtaler. De ser bare det du tillater under."

Mono 13px, padding 16px 24px.

### Tilknyttede-liste (full bredde)

2 forelder-kort stablet, hver 140px:

**Kort 1**
- Profilbilde 56px (sirkel)
- Navn: "Camilla Pedersen" (Inter Tight 22px)
- Rolle: "Mor"
- E-post: "camilla.pedersen@example.no" (mono 13px muted)
- Status-pill: "AKTIV TILGANG" (mono 11px, grønn bg)
- Tilkoblet siden: "12. januar 2024"
- Rolle-velger (chip-rad): [Kun lesing] [Kommentar ◉] [Godkjenne]
- CTA: [Endre tilgang] · [Fjern]

**Kort 2**
- Profilbilde 56px
- "Tor Pedersen"
- Rolle: "Far"
- E-post: "tor.pedersen@example.no"
- Status-pill: "AKTIV TILGANG"
- Tilkoblet siden: "12. januar 2024"
- Rolle-velger: [Kun lesing ◉] [Kommentar] [Godkjenne]
- CTA: [Endre tilgang] · [Fjern]

### Hva foreldre ser-detaljer (full bredde tabell)
Header: "HVA FORELDRE KAN SE"

| Område | Kun lesing | Kommentar | Godkjenne |
|---|---|---|---|
| Treningsplaner | ✓ | ✓ + skrive kommentar | ✓ + godkjenne på dine vegne |
| Fremgang/statistikk | ✓ | ✓ | ✓ |
| Bookinger | ✓ | ✓ | ✓ + booke for deg |
| Fakturaer | ✓ | — | ✓ + betale |
| Coach-meldinger | — | — | — |
| AI-coach-samtaler | — | — | — |
| Helse-logg | ✓ | ✓ | ✓ |

### Invitér ny forelder-rad (lys grå bg)
Tittel: "Invitér ny forelder eller verge"
Sub: "Sender e-postinvitasjon med kobling. De må bekrefte for å få tilgang."

Skjema:
- E-post-input: "navn@example.no"
- Rolle-dropdown: [Velg rolle ▾] (Mor / Far / Verge / Annen)
- Rettighet-velger (chips): [Kun lesing ◉] [Kommentar] [Godkjenne]
- CTA: [Send invitasjon →] (primær lime)

### Aktivitetslogg (siste 5 hendelser)
Mono 12px, kompakt:
- "12.05 · Camilla kommenterte plan 'Spesialisering Sommer'"
- "08.05 · Tor leste notat 'Approach 150m strike-mønster'"
- "01.05 · Camilla betalte mai-faktura 300 kr"
- "21.04 · Tor leste notat 'Putt 3m konsistens'"
- "15.04 · Camilla booket bane-runde Skjeggestad"

### Editorial moment
"hva" italic (kort men sterk)

Lever som én HTML-fil.
```

---

## Prompt 8.6 — Helse-logg

```
[LIM INN 00-shared-spec.md]

## Skjerm: Helse-logg
URL: /portal/meg/helse
Bruker: Markus R

### Layout
PlayerHQ-shell. Sub-nav: Helse (aktiv).

### Header (full bredde)
Eyebrow: "PLAYERHQ · MEG · HELSE"
Tittel: "Kroppen din, *målt over tid.*" — italic på "målt over tid"
Sub: "Daglig 30-sekunders sjekk. Anders bruker dette til å justere økter når du er sliten."

### Dagens logg-kort (full bredde, lys lime bg #F4FBC5)
Eyebrow: "I DAG · 14. MAI"
Tittel (Inter Tight 22px): "Hvordan har du det?"

Tre slidere/inputs i én rad:

**1. Form (1-10)**
- Slider 0-10
- Verdi-display: "07" (mono 32px tabular)
- Label: "1 = elendig · 10 = topp"

**2. Søvn (timer)**
- Slider 4-12
- "08.5" (mono 32px)
- Label: "timer søvn forrige natt"

**3. Energi-nivå (1-10)**
- Slider 0-10
- "06" (mono 32px)
- Label: "1 = utslitt · 10 = full tank"

Notat-felt: "Kort notat (valgfritt)..." (textarea 60px høyde)

Skade-flagg-rad:
- Toggle: "Har du smerter i dag?" (av som default)
- Hvis ON: dropdown [Velg område ▾] (Skulder/Albue/Håndledd/Rygg/Hofte/Kne/Ankel/Annet) + smerte-skala 1-10

CTA: [Lagre logg →] (primary lime, full bredde)

### Trend-graf (full bredde, 320px høyde)
Header-rad: "TREND · SISTE 30 DAGER"
Tab-strip: Form · Søvn · Energi (Form aktiv)

Linje-graf (Recharts-stil):
- X-akse: dato (mono 11px, kun hver 5. dato)
- Y-akse: 1-10
- Hovedlinje: lime #D1F843 stroke 2px
- Punkter: 6px sirkler på hver datapoint
- Hover-tooltip: "12. mai · Form 8/10"
- Gjennomsnitt-linje (stiplet, muted): "Snitt 7.2"
- Skade-markører (rød triangel) på dager med smerte-flagg

KPI-rad under graf:
- Snitt form: 7.2 / 10 (mono 24px)
- Snitt søvn: 7.8 t (+0.3 vs forrige periode)
- Snitt energi: 6.9 / 10
- Dager med skade-flagg: 02 / 30

### Skade-historikk (kort, 4 entries)
Header: "SKADE-FLAGG SISTE 90 DAGER"

Tabell:
| Dato | Område | Smerte | Notat |
|---|---|---|---|
| 04.05.2026 | Venstre håndledd | 4/10 | "Følte litt ømhet etter Skjeggestad 18h" |
| 02.05.2026 | Venstre håndledd | 3/10 | "Litt stiv på morgenen" |
| 18.03.2026 | Nedre rygg | 5/10 | "Etter FYS-økt — tok hvile dagen etter" |
| 02.02.2026 | Høyre skulder | 3/10 | "Liten knipe under approach" |

CTA: [Eksporter helse-data (CSV) →]

### Info-rad (mono 12px muted)
"Anders ser disse dataene som del av treningsplanleggingen. AI-coach foreslår justering hvis form er under 5 i tre dager på rad."

### Editorial moment
"målt over tid" italic

Lever som én HTML-fil.
```

---

## Prompt 8.7 — Dokumenter

```
[LIM INN 00-shared-spec.md]

## Skjerm: Dokumenter
URL: /portal/meg/dokumenter
Bruker: Markus R

### Layout
PlayerHQ-shell. Sub-nav: Dokumenter (aktiv).

### Header (full bredde)
Eyebrow: "PLAYERHQ · MEG · DOKUMENTER"
Tittel: "Det Anders har *delt med deg.*" — italic på "delt med deg"
Sub: "PDF-rapporter, programmer og dokumenter. 12 dokumenter totalt."

### Filter-rad
Chips: Alle (12) · Treningsprogram (4) · Rapporter (5) · Bilag (2) · Annet (1)
Søk: "Søk i 12 dokumenter..."
Sortering: "Nyeste / Eldste / Navn A-Z"

### Dokument-liste (full bredde, tabell-stil)

12 rader stablet, hver 72px:

**1.**
- Lucide file-text-ikon 24px
- Filnavn: "spesialisering-sommer-2026-plan.pdf"
- Type-pill: "TRENINGSPROGRAM" (mono 11px)
- Beskrivelse: "Detaljert plan med 132 økter, sendt 07. mai"
- Mono 11px muted: "2.4 MB · 24 sider"
- Høyre: [Last ned ↓] (mono 12px)

**2.**
- Filnavn: "approach-150m-analyse-mai-2026.pdf"
- Type-pill: "RAPPORT"
- "Slag-for-slag-data fra siste 10 økter, sendt 06. mai"
- "1.8 MB · 12 sider"
- [Last ned ↓]

**3.**
- "putting-stats-q1-2026.pdf"
- "RAPPORT"
- "Kvartalsrapport for putting siste 90 dager"
- "0.9 MB · 8 sider"

**4.**
- "fakturanr-2025-237.pdf"
- "BILAG"
- "Faktura mai 2026 · 300 kr"
- "0.3 MB · 1 side"

**5.**
- "grunntrening-var-2026-plan.pdf"
- "TRENINGSPROGRAM"
- "Aktiv plan, sendt 14. februar"
- "2.1 MB · 22 sider"

**6.**
- "fakturanr-2025-218.pdf"
- "BILAG"
- "Faktura april 2026"
- "0.3 MB · 1 side"

**7.**
- "styrkeprogresjon-q2-2026.pdf"
- "TRENINGSPROGRAM"
- "Parallell FYS-plan, sendt 31. mars"
- "1.4 MB · 16 sider"

**8.**
- "evaluering-vintersesong-2025.pdf"
- "RAPPORT"
- "Anders' helhetsvurdering desember 2025"
- "1.2 MB · 10 sider"

**9.**
- "fmm-protokoll-januar-2026.pdf"
- "RAPPORT"
- "Mental rutine-protokoll fra januar"
- "0.6 MB · 6 sider"

**10.**
- "wang-toppidrett-program-h25.pdf"
- "TRENINGSPROGRAM"
- "Høstprogrammet for skoletreningen"
- "0.8 MB · 8 sider"

**11.**
- "bossum-open-2025-rapport.pdf"
- "RAPPORT"
- "Turneringsanalyse Bossum Open"
- "1.1 MB · 9 sider"

**12.**
- "samtykkeskjema-foreldretilgang.pdf"
- "ANNET"
- "Signert av Camilla 12. januar 2024"
- "0.2 MB · 2 sider"

### Footer-rad
[Be Anders om et nytt dokument →] (sekundær)
"Anders sender også nye dokumenter via e-post."

### Editorial moment
"delt med deg" italic

Lever som én HTML-fil.
```

---

## Prompt 8.8 — Min utstyrsbag

```
[LIM INN 00-shared-spec.md]

## Skjerm: Min utstyrsbag
URL: /portal/meg/utstyrsbag
Bruker: Markus R

### Layout
PlayerHQ-shell. Sub-nav: Utstyrsbag (aktiv).

### Header (full bredde)
Eyebrow: "PLAYERHQ · MEG · UTSTYRSBAG"
Tittel: "Hver kølle, *kjent og målt.*" — italic på "kjent og målt"
Sub: "Anders bruker bagen din til å justere drill-distanser. AI-coachen bruker den til å gi avstandstips."

### Sammendrag-strip (full bredde)
4 chip-tall:
- Køller totalt: 14 (mono 32px)
- Bag-totalvekt: 8.2 kg
- Driver-distanse snitt: 248m
- Sist oppdatert: 02.05.2026

### Kølle-grid (full bredde, tabell-stil)

Tabellen viser hver kølle som en rad:

| Posisjon | Type | Merke + modell | Loft | Skaft | Lengde | Snitt-distanse | Notat |
|---|---|---|---|---|---|---|---|
| 1 | Driver | TaylorMade Qi10 | 9° | Mitsubishi Tensei 60g Stiff | 45.5" | 248m | "Fade-bias 1g" |
| 2 | 3-wood | TaylorMade Qi10 Fairway | 15° | Tensei 75g S | 43" | 232m | — |
| 3 | 5-wood | TaylorMade Qi10 Fairway | 19° | Tensei 75g S | 42" | 215m | — |
| 4 | 4-utility | Titleist T200 | 21° | Steelfiber 110 S | 39" | 198m | — |
| 5 | 5-iron | Titleist T100 | 25° | Project X 6.0 | 38.5" | 185m | — |
| 6 | 6-iron | Titleist T100 | 28° | Project X 6.0 | 38" | 172m | — |
| 7 | 7-iron | Titleist T100 | 31° | Project X 6.0 | 37.5" | 158m | "Vinner-køllen" |
| 8 | 8-iron | Titleist T100 | 35° | Project X 6.0 | 37" | 145m | — |
| 9 | 9-iron | Titleist T100 | 39° | Project X 6.0 | 36.5" | 132m | — |
| 10 | Pitching wedge | Titleist T100 | 43° | Project X 6.0 | 36" | 118m | — |
| 11 | 50° wedge | Vokey SM10 | 50° | DG Tour Issue S400 | 35.5" | 95m | Bounce 12F |
| 12 | 54° wedge | Vokey SM10 | 54° | DG Tour Issue S400 | 35.25" | 78m | Bounce 14M |
| 13 | 58° wedge | Vokey SM10 | 58° | DG Tour Issue S400 | 35" | 58m | Bounce 12K |
| 14 | Putter | Scotty Cameron Phantom 11 | 3° | — | 34" | — | "Lengde justert ned 0.5" feb 2026" |

Hver rad har en lucide pencil-ikon i siste kolonne for [Rediger].

### Tilbehør-seksjon
Tittel: "TILBEHØR I BAGEN"

Liste (mono 13px):
- Bagtype: Titleist Players 4 Stadry (svart/hvit)
- GPS-enhet: Bushnell Pro X3
- Avstandsmåler: Bushnell V6 Slim
- Markører: 3 stk magnetisk
- Reparasjonsverktøy: Pitchfork + ballmarker
- Pluggprotokoll: 6 plugger, mediumstreng

### Wedge gap-test-banner (lys gul bg #FFF7D6, full bredde)
- Mono 12px: "Wedge-gappingen din er 17m/24m mellom 50°-54°-58°. Anders har anbefalt gap-test innen 30 dager."
- CTA: [Book gap-test →]

### Lagret-bekreftelse (toast-eksempel nederst i HTML)
Lime bg, mono 13px: "Lagret 02.05.2026 14:32 av Markus"

### Footer
[+ Legg til kølle] [Eksporter bag (PDF) →] [Del bag med Anders]

### Editorial moment
"kjent og målt" italic

Lever som én HTML-fil.
```

---

## Prompt 8.9 — Innstillinger

```
[LIM INN 00-shared-spec.md]

## Skjerm: Innstillinger
URL: /portal/meg/innstillinger
Bruker: Markus R

### Layout
PlayerHQ-shell. Sub-nav: Innstillinger (aktiv).

### Header (full bredde)
Eyebrow: "PLAYERHQ · MEG · INNSTILLINGER"
Tittel: "Hvordan PlayerHQ *oppfører seg.*" — italic på "oppfører seg"
Sub: "Varslinger, språk, personvern og kontostatus. Endringer lagres automatisk."

### Seksjon 1: Varslinger (full bredde kort)

Header: "VARSLINGER"

Tre-kolonne grid med varsel-typer (rad) × kanal (kolonne):

| Hva | E-post | SMS | Push |
|---|---|---|---|
| Ny plan fra coach | ON | OFF | ON |
| Ny melding fra Anders | ON | ON | ON |
| Nytt notat fra coach | ON | OFF | ON |
| Ny coach-video | ON | OFF | OFF |
| Booking-påminnelse (24t før) | ON | ON | ON |
| Booking-påminnelse (1t før) | OFF | ON | ON |
| Faktura-påminnelse | ON | OFF | OFF |
| Turneringspåminnelse (7d før) | ON | OFF | ON |
| AI-coach-svar | OFF | OFF | ON |
| Foreldre-aktivitet | OFF | OFF | OFF |

Hver celle har en toggle (lime når ON, grå når OFF).

**Stille perioder:**
- "Ikke forstyrr fra: 22:00 · til: 07:00" (tidsvelgere)
- "Helger: full stillhet" toggle: OFF
- "Under turnering: full stillhet" toggle: ON

### Seksjon 2: Språk og region

Header: "SPRÅK OG REGION"

- Språk-dropdown: [Norsk bokmål ▾] (også: Engelsk, Norsk nynorsk)
- Datoformat: [DD.MM.YYYY ▾] (også: YYYY-MM-DD, MM/DD/YYYY)
- Tidsformat: [24-timer ◉] [12-timer]
- Tidssone: [Europe/Oslo (UTC+1) ▾]
- Distanse-enhet: [Meter ◉] [Yards]
- Vekt-enhet: [Kilo ◉] [Pound]

### Seksjon 3: Personvern

Header: "PERSONVERN"

- Vis profilen min i klubb-lederboard: ON
- Del statistikk anonymt med AK Golf forskning: ON
- Tillat Anders å bruke videoene mine som eksempel for andre spillere: OFF
- Tillat AI-coachen å bruke samtaler til forbedring: ON
- Marketing-eposter fra AK Golf Academy: OFF

CTA-rad:
- [Last ned alle mine data (GDPR) →]
- [Se hva PlayerHQ vet om meg →]

### Seksjon 4: Konto-handlinger

Header: "KONTO"

- "Logget inn som: markus.pedersen@example.no"
- "Sist passordendring: 14. januar 2026"

Tre CTA-rader (sekundær, stablet):
- [Logg ut på alle enheter →]
- [Logg ut nå →]

**Slett konto-blokk (rød kant, advarsel):**
- Lucide alert-triangle-ikon
- Tittel: "Slett kontoen min"
- Sub: "Permanent sletting av profil, statistikk, videoer og notater. Treningsplaner og coach-tilknytting går tapt. Kan ikke angres."
- Beholdningstid før sletting: "30 dagers angre-periode"
- CTA: [Slett kontoen →] (destructive bg #A32D2D, hvit tekst)

Bekreftelses-modal (i samme HTML, overlay-state):
- Tittel: "Er du *sikker?*"
- Sub: "Skriv 'SLETT KONTOEN' for å bekrefte"
- Input-felt
- [Avbryt] [Slett permanent →]

### Editorial moment
"oppfører seg" italic

Lever som én HTML-fil.
```

---

## Prompt 8.10 — Sikkerhet

```
[LIM INN 00-shared-spec.md]

## Skjerm: Sikkerhet
URL: /portal/meg/sikkerhet
Bruker: Markus R

### Layout
PlayerHQ-shell. Sub-nav: Sikkerhet (aktiv).

### Header (full bredde)
Eyebrow: "PLAYERHQ · MEG · SIKKERHET"
Tittel: "Hvordan kontoen din *holdes trygg.*" — italic på "holdes trygg"
Sub: "Passord, to-faktor og enheter med tilgang. Sjekk dette én gang i halvåret."

### Status-bånd (full bredde, lys grønn bg #DCFCE7)
Lucide shield-check-ikon + tekst:
"Kontoen din har sterk sikkerhet. 2FA er aktivert. Passordet ble endret for 4 måneder siden."
Mono 13px medium.

### Seksjon 1: Passord (full bredde kort)

Header: "PASSORD"

To-kolonne 50/50:

**Venstre:**
- "Sist endret: 14. januar 2026"
- "Styrke: Sterk" (med lime indikator-bar)
- "Brukes ikke i kjente lekkasjer"

**Høyre:**
- [Endre passord →] (primary)
- Bekrefte-flyt-modal (i samme HTML):
  - Input: "Nåværende passord"
  - Input: "Nytt passord (min 12 tegn)"
  - Input: "Bekreft nytt passord"
  - Styrke-bar live
  - [Avbryt] [Lagre nytt passord]

### Seksjon 2: To-faktor autentisering (full bredde kort)

Header: "TO-FAKTOR (2FA)"
Status-pill: "AKTIVERT" (mono 11px, grønn bg)

To-kolonne 60/40:

**Venstre:**
- "Metode: Autentiserings-app (Google Authenticator)"
- "Aktivert: 14. januar 2026"
- "Backup-koder: 8 av 10 ubrukt"

**Høyre:**
- [Bytt 2FA-metode →]
- [Generér nye backup-koder →]
- [Deaktivér 2FA →] (rød lenke)

### Setup-flow (vis som collapsed seksjon — alternative state):

**1. Skann QR-koden**
- Stor QR-kode-firkant 280×280 (rendre som svart/hvit grid mønster)
- Sub: "Skann med Google Authenticator, Authy eller 1Password"

**2. Skriv inn 6-sifret kode**
- Input-felt 6 sifre stort (mono 32px tabular): _ _ _ _ _ _
- "Koden fornyes hver 30. sekund"

**3. Lagre backup-koder**
- Tittel: "10 backup-koder. Lagre dem trygt. Hver kan brukes én gang."
- Grid 2 kolonner × 5 rader:
  - 4A2F-K3LM
  - 7B9P-Q1XR
  - 2C5N-H8WJ
  - 9D6S-T4FB
  - 1E8R-V7KM
  - 6F3T-Y9PL
  - 4G2W-A5DC
  - 8H1Q-B6NV
  - 3J9X-C4MR
  - 5K7Z-D2TF
- CTA: [Last ned koder som tekstfil ↓] [Kopier til utklippstavle]

**4. Bekreft og aktivér**
- [Aktivér 2FA →]

### Seksjon 3: Aktive sesjoner (full bredde tabell)

Header: "AKTIVE SESJONER"

Tabell, 4 rader:

| Enhet | Nettleser | Lokasjon | Sist aktiv | Handling |
|---|---|---|---|---|
| **MacBook Pro (denne)** | Safari 18 · macOS 15 | Fredrikstad, NO | nå | — |
| iPhone 15 Pro | PlayerHQ-app v2.4 | Fredrikstad, NO | 2 timer siden | [Logg ut] |
| iPad Air | Safari 18 · iPadOS 18 | Fredrikstad, NO | 3 dager siden | [Logg ut] |
| MacBook Air | Chrome 130 · macOS 15 | Oslo, NO | 12 dager siden | [Logg ut] |

CTA-rad under tabell:
- [Logg ut av alle andre sesjoner →]

**Mistenkelig aktivitet-banner (vis som info-rad nederst):**
- Lucide alert-circle-ikon
- "Sist innlogging fra ny enhet: 02. mai 2026 fra Oslo, NO. Var det deg?"
- [Ja, det var meg] [Nei — sikre kontoen]

### Seksjon 4: Sikkerhetslogg (siste 5 hendelser)

Header: "SIKKERHETSLOGG"

Mono 12px, kompakt liste:
- "14.05.2026 14:32 · Innlogging · Fredrikstad, NO · Safari (denne enheten)"
- "14.05.2026 12:15 · Innlogging · Fredrikstad, NO · PlayerHQ iOS"
- "02.05.2026 09:08 · Innlogging fra ny enhet · Oslo, NO · Chrome"
- "21.04.2026 16:42 · Backup-kode brukt · Fredrikstad, NO"
- "14.01.2026 18:00 · 2FA aktivert"

CTA: [Se full logg →]

### Editorial moment
"holdes trygg" italic · 6-sifret kode-input i stor mono som visuelt anker

Lever som én HTML-fil med både aktivert-state og setup-flow synlig.
```
