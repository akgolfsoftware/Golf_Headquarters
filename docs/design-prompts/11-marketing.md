# Claude Design-prompter: MARKETING-SIDER

> Lim inn felles designspec fra `00-shared-spec.md` øverst.
> Disse er offentlige sider på akgolf.no — sterkere visuelle elementer, hero-bilder, social proof.

---

## Prompt 11.1 — Anlegg-detalj

```
[LIM INN 00-shared-spec.md]

## Skjerm: Anlegg-detalj
URL: /anlegg/[slug] (eks. /anlegg/gamle-fredrikstad-gk)
Offentlig side. Bruker: potensielle kunder som vurderer å bli medlem.

### Layout
Full-bredde marketing-shell (lyst tema, ingen sidebar). Top-nav fra `(marketing)/layout`.

### Hero (full bredde, 480px høyde)
- Stort bilde av anlegget (object-cover, 16:10)
- Overlay: tittel + tagline
- Tittel: "Gamle Fredrikstad GK" (Inter Tight 64px, hvit)
- Eyebrow: "ANLEGG · AK GOLF GROUP" (mono 11px, lime accent)
- Sub: "Klassisk parkbane på Bossum · 18 hull · etablert 1903" (hvit)
- CTA: "Book time" (lime knapp) + "Se ledige slots →" (outline)

### Anlegg-info-strip (under hero, full bredde, hvit bg)
4 kort i grid:
- 📍 Adresse: Torsnesveien 16, 1630 Gamle Fredrikstad (Lucide MapPin)
- 🏌 Par: 71 · 5 880 m · CR 71.4 (Lucide Flag)
- 🅿 Parkering: 80 plasser, gratis (Lucide Car)
- ⏰ Sesong: April – november (Lucide Calendar)

### Fasiliteter (2-kolonne grid)
Header: "Hva venter deg her" (Inter Tight 28px, italic på "venter")

Hver fasilitet:
- Bilde 16:9
- Tittel (Inter Tight 22px)
- Beskrivelse (16px)
- Tags-chips: Indoor/Range/Bunker etc.

7 fasiliteter for GFGK:
1. **18-hulls bane** — Parkbane med utfordrende greens. Vintergreens nov–mars.
2. **Range** — 18 utslagsbåser, 4 trackman-baser, kort- og lang-mat.
3. **Putting green** — 800 m², 8 hull, replikerer faktiske green-hellinger.
4. **Chipping green** — 3 ulike landingsområder + bunker.
5. **Pitchareal** — 30–80 meter, autentisk green-respons.
6. **Coaching-studio** — Trackman 4 + V1 video + Foresight GC3.
7. **Restaurant + klubbhus** — Lunsj + medlemsmøter + sponsor-events.

### Coach-seksjon
Tittel: "Coach Anders er her" (italic på "her")
- Profilbilde + bio (8 år som klubbcoach, A-coach NGF)
- Lenke til /coaching

### Booking-flow-preview
- "Slik booker du" — 3-stegs visuell forklaring
- Steg 1: Velg type (Pro-time / Trackman / Gruppe)
- Steg 2: Velg dato + tid
- Steg 3: Betal og bekreft (Stripe)
- CTA: "Book nå →"

### Anlegg-galleri
Grid 3 kolonner med 6 bilder. Klikk → lightbox.

### Praktisk info
Accordion-rader:
- Bekledning
- Bag-håndtering
- Junior-fasiliteter
- Adkomst og parkering
- Klubbmedlemskap-info

### Footer (samme som resten av marketing)

### Editorial moment
Hero-sub italic på "venter deg" eller "Anders er her"

Lever én HTML-fil. Bruk realistiske bilder fra unsplash-stil golf-baner (gress, blå himmel, klubbhus).
```

---

## Prompt 11.2 — Om oss

```
[LIM INN 00-shared-spec.md]

## Skjerm: Om oss
URL: /om-oss
Offentlig — forteller historien om AK Golf Group.

### Layout
Marketing-shell. Lang scroll-side med flere seksjoner.

### Hero (full bredde, 380px)
- Bakgrunn: subtilt golfbane-bilde, mørk overlay
- Eyebrow: "OM OSS · AK GOLF GROUP"
- Tittel: "Vi *bygger* spillere." (italic på "bygger")
- Sub: "AK Golf Academy + Mulligan Indoor + WANG Toppidrett — fire selskaper, én misjon: å gjøre golf til et tydelig håndverk."

### Anders-seksjon (split 60/40)
**Venstre:**
- Stort portrettbilde av Anders
**Høyre:**
- Eyebrow: "GRUNNLEGGER"
- Navn: "Anders Kristiansen" (Inter Tight 36px)
- Bio (16px, 3 avsnitt):
  1. 12 år som klubbcoach, A-lisens NGF
  2. Spilte college-golf i USA (Florida)
  3. Bygger AK Golf for å systematisere det han har lært
- Sosial-lenker: LinkedIn, Instagram, e-post

### Selskaper (4 kort i grid)
Hver kort:
- Logo
- Navn
- Hvilken rolle i konsernet
- "Les mer →"

1. **AK Golf Academy** — Personlig coaching. 6-12 aktive spillere per sesong.
2. **Mulligan Indoor Golf** — Indoor-simulatorer Horten. Drop-in + abonnement.
3. **WANG Toppidrett Fredrikstad** — Coaching for idrettsskole-elever.
4. **Skarpnord Golf Products** — Treningsutstyr og verktøy.

### Filosofi-seksjon (full bredde, mørk bg)
Tittel: "Filosofien" (italic på "Filosofien")
3 prinsipper i kolonner:
1. **Data først** — Vi måler det vi gjør, slik at vi vet hva som virker.
2. **System foran talent** — Konsistent metode slår genial intuisjon.
3. **Respekt for tiden** — Hver time skal være forberedt og tilpasset.

### Coacher (team-grid)
Hvis vi har flere coacher. For nå: kun Anders.

### Kontakt
- E-post: post@akgolf.no
- Telefon: +47 ___ ___ __
- Adresse: Torsnesveien 16, 1630 Gamle Fredrikstad

### CTA-bunn
"Vil du vite mer? Book en uforpliktet samtale med Anders →"

### Editorial moment
"Vi *bygger* spillere." i hero. Reservert.

Lever én HTML-fil.
```

---

## Prompt 11.3 — PlayerHQ marketing

```
[LIM INN 00-shared-spec.md]

## Skjerm: PlayerHQ-marketing
URL: /playerhq
Forklarer for potensielle kunder hva PlayerHQ er.

### Layout
Marketing-shell. Lang scroll.

### Hero (full bredde, 560px)
- Bakgrunn: stilisert mockup av PlayerHQ-grensesnittet (kalender + analyse)
- Eyebrow: "PLAYERHQ"
- Tittel: "Din *treningsplan* i lomma." (italic på "treningsplan")
- Sub: "PlayerHQ samler treningsøktene dine, scorekortene, SG-analysen og direktechat med coach — alt på ett sted."
- CTA: "Kom i gang" (lime knapp) + "Se demo →" (outline)

### Feature-strip (3-kolonne, alternerende bilde-tekst)

**1. Kalender + plan**
- Bilde: kalender-skjermbilde med pyramide-blokker
- Tittel: "Hver dag har en plan"
- Bullet-points:
  - Coach setter perioder og økter automatisk
  - Du krysser av når du har trent
  - Caddie justerer planen hvis du blir syk

**2. Live trening med tapp**
- Bilde: live-session-skjerm med stor "GODKJENT/BOMMET"-knapp
- Tittel: "Trykk på resultatet — vi logger resten"
- Bullet-points:
  - Tapp Godkjent/Bommet etter hvert slag
  - Caddie ser progresjon i sanntid
  - Suksess-rate per drill bygges automatisk

**3. SG-analyse**
- Bilde: krysstabell + trend-grafer
- Tittel: "Forstå hva du faktisk gjør"
- Bullet-points:
  - Strokes Gained per kategori (OTT/APP/ARG/PUTT)
  - Krysstabell viser hva som virker
  - Sammenligning med peer-gruppe

### Tier-prising (3 kort i grid)

**1. Gratis**
- Pris: 0 kr
- Inkludert:
  - Logg runder manuelt
  - Standard-statistikk
  - 1 booking per måned
- CTA: "Start gratis"

**2. Pro · 300 kr/mnd** ← Anbefalt
- Pris: 300 kr/mnd
- Inkludert:
  - Alt i Gratis
  - Personlig treningsplan
  - AI-coach 24/7
  - 8 booking-credits per mnd
  - SG-analyse + krysstabell
- CTA: "Bli Pro"

**3. Elite · Etter samtale**
- Pris: Skreddersydd
- Inkludert:
  - Alt i Pro
  - Dedikert 1-1 coach
  - Turnering-prep
  - Foreldreportal
- CTA: "Snakk med oss"

### Sosial proof
- Sitater fra spillere (3 stk, italic Instrument Serif)
- Anonyme bilder eller initialer

Eks: *"Etter 3 måneder med PlayerHQ er HCP-en min nede 4 slag. Aldri gått fortere."* — Markus R, 16

### FAQ (accordion)
5-7 spørsmål:
- Kan jeg avbryte når som helst?
- Hva skjer hvis jeg ikke har coach ennå?
- Hvor brukes data fra Trackman?
- Kan foreldre se hva jeg trener?
- Trenger jeg å være medlem av en klubb?

### Final CTA
Full bredde, mørk bg. "Klar for å se forskjellen?" + "Start gratis →"-knapp.

### Editorial moment
"Din *treningsplan* i lomma." i hero.

Lever én HTML-fil. Inkluder stilisert grenser-mockup som SVG eller dummy-screenshot-card.
```

---

## Prompt 11.4 — Booking offentlig

```
[LIM INN 00-shared-spec.md]

## Skjerm: Booking (offentlig)
URL: /booking
Bruker: gjester som vil booke en time uten å registrere konto.

### Layout
Marketing-shell. Booking-flow med stegvis form.

### Stepper (top, sticky)
1. ◉ Velg type
2. ○ Dato & tid
3. ○ Detaljer
4. ○ Betal

Aktivt steg har lime accent.

### Steg 1 — Velg type
4 kort i grid:

**Pro-time 30 min · 600 kr**
- Personlig coaching med Anders
- Trackman + video
- Inkluderer analyse

**Pro-time 60 min · 1 100 kr** ← Mest populær (badge)
- Dypere analyse
- Spillerprofil + plan-utkast
- For nye spillere som vurderer abonnement

**Trackman-økt 60 min · 450 kr**
- Indoor på Mulligan
- Selvbetjent eller med coach
- Inkluderer data-eksport

**Gruppe-økt 90 min · 350 kr**
- Maks 4 spillere
- Tirsdag 17:00, lørdag 09:00
- Felles tema

### Steg 2 — Dato & tid
- Datovelger (mini-kalender)
- Liste over ledige slots høyre side (filtrert på valgt type)
- Klikk slot → "10:00–10:30 · GFGK Range" valgt
- "Bytt dato →" tilbake-knapp

### Steg 3 — Detaljer
- Form: Fornavn, Etternavn, E-post, Telefon, HCP (valgfri), Notat til coach (valgfri)
- Toggle: "Send meg AK Golf nyhetsbrev"
- Tier-prikker: Allerede medlem? "Logg inn for å booke raskere →"

### Steg 4 — Betal
- Sammendrag øverst (type + dato + tid + pris)
- Stripe-element (bank-kort + Vipps + Klarna)
- Voucher-kode-felt
- "Bestill og betal 600 kr"-knapp (lime)
- Småtekst: "Kanselleringsfrist 24t før. Full refundering ved tidligere kansellering."

### Bekreftelse-state (etter betaling)
- Stort sjekkmerke + "Bekreftet ✓"
- Sammendrag av booking
- Lenker: "Legg til i kalender" (iCal/Google), "Last ned bekreftelse"
- "Hvordan komme hit →" (kart)
- "Ønsker du å bli kunde? Pro-tier 300 kr/mnd →"

### Editorial moment
Stegene har egen italic-tagline øverst:
- Steg 1: "Hvilken time *passer deg?*"
- Steg 2: "Når skal vi *møtes?*"
- Steg 3: "Litt om *deg.*"
- Steg 4: "Sett opp *plassen.*"

Lever én HTML-fil med alle 4 steg vist (kan stables vertikalt med "Steg 1/2/3/4"-overskrifter).
```

---

## Prompt 11.5 — Coaching-side (lett oppdatering)

```
[LIM INN 00-shared-spec.md]

## Skjerm: Coaching
URL: /coaching
Forklarer coaching-tjenestene. SIDEN EKSISTERER ALLEREDE — denne prompten er for å re-designe hvis ønskelig.

### Layout
Marketing-shell, lang scroll med flere seksjoner.

### Hero (480px)
- Bakgrunn: Anders i action med spiller på range
- Eyebrow: "COACHING · AK GOLF ACADEMY"
- Tittel: "Bli en *bedre golfspiller*." (italic)
- Sub: "Personlig coaching, periodiserte treningsplaner og målbar fremgang — for spillere som vil ta spillet videre."
- CTA: "Book gratis kartleggings-økt"

### Hva får du-seksjon (3 kort, ikon + tekst)
1. **Personlig plan** — Skreddersydd til din HCP, dine mål, din kalender.
2. **Anders som coach** — 12 års erfaring, A-lisens NGF. Alle økter er forberedt.
3. **PlayerHQ inkludert** — Pro-tier følger med. Hele plattformen klar fra dag én.

### Slik fungerer det (4 stegs visualisering)
1. **Kartlegging** — 60 min på range. Vi måler hvor du står (SG, swing, fysisk).
2. **Plan** — Basert på data lager vi 90 dagers plan med ukentlige økter.
3. **Tren** — Følg planen i PlayerHQ. Anders sjekker progresjon ukentlig.
4. **Sjekk** — Hver 4. uke ny status. Vi justerer planen.

### Prising
Tre pakker (samme som /playerhq men coaching-fokusert):
- **Drop-in:** 1 100 kr per 60 min Pro-time
- **Performance:** 7 500 kr/sesong (32 timer + plan)
- **Pro:** 18 000 kr/sesong (75 timer + plan + turneringsprep)

### CTA mid-page (full bredde)
"Ikke klar for abonnement?
Du kan også booke enkelt-timer uten binding. Pro-time 30 min eller 60 min, Trackman-økt eller gruppeøkt — se hva som er ledig."
[Se ledige tider →]

### Spillerlogger (case-studies)
3 spillere som har trent med Anders:
- **Markus R, 16:** HCP 12 → 4.2 på 14 måneder. WAGR-debut i 2026.
- **Emma S, 19:** Til topp 100 i Norden, sommer-collegegolf USA.
- **Henrik N, 32:** Klubbmester GFGK 2025 (-7 brutto).

Hvert case: foto + tall + sitat.

### FAQ + final CTA (samme som tidligere)

### Editorial moment
Hero italic på "bedre golfspiller". Reservert.

Lever én HTML-fil.
```
