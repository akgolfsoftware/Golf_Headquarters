# Design-kø — Marketing + Auth + Forelderportal

> **Kilde:** `61-DEKNINGSMATRISE.md` (TRENGER-DESIGN-rader per produkt) + `50-SKJERM-KOMPONENT-KART.md` + `docs/claude-design-handover/00-LES-FORST.md` + `20-KOMPONENT-SPEC.md`.
> RE-SKIN- og UTSATT-skjermer er ikke med her.
> **Laget:** 17. juni 2026.

---

## Sammendrag

| | Antall |
|---|---|
| **Batcher totalt** | **9** |
| P1 (lanseringskritisk før 1. juli) | **5** |
| V2 (etter lansering) | **4** |
| **Skjermer totalt** | **29** |
| Marketing TRENGER-DESIGN | 21 |
| Auth TRENGER-DESIGN | 4 |
| Forelderportal TRENGER-DESIGN | 4 |

---

## Batch-liste

| # | Tittel | Prioritet | Skjermer | Ruter | Komponenter |
|---|---|---|---|---|---|
| MA-1 | Marketing — Kjernepakke (coaching, priser, playerhq-landing) | P1 | 4 | `/coaching`, `/priser`, `/playerhq`, `/junior` | FeaturedCard, AthleticCard, KpiCard, PageHero, SectionHeader, Button |
| MA-2 | Marketing — Sekundærsider (om oss, FAQ, jobb, treningsfilosofi) | P1 | 4 | `/om-oss`, `/faq`, `/jobb`, `/treningsfilosofi` | PageHero, SectionHeader, AthleticCard, FeaturedCard |
| MA-3 | Marketing — Anlegg (liste + detalj) | P1 | 2 | `/anlegg`, `/anlegg/[slug]` | GalleryView, PhotoHero, DetailHero, FeaturedCard |
| MA-4 | Marketing — Blogg (liste + artikkel) | V2 | 2 | `/blogg`, `/blogg/[slug]` | GalleryView, PhotoHero, DetailHero, Eyebrow |
| MA-5 | Marketing — Turneringer (liste + detalj) | V2 | 2 | `/turneringer`, `/turneringer/[slug]` | TournamentCard, EventTimeline, DataTable Pro |
| MA-6 | Marketing — Public booking-flyt (4 steg) | P1 | 4 | `/booking`, `/booking/[slug]`, `/booking/[slug]/bekreft`, `/booking/kvittering/[bookingId]` | SessionScheduler, AthleticCard, DetailHero, Button |
| MA-7 | Marketing — Juridisk + cookies | V2 | 3 | `/cookies`, `/personvern`, `/vilkar` | PageHero, SectionHeader |
| AU-1 | Auth — Forelder-onboarding + samtykke-flyt | P1 | 3 | `/auth/onboarding/forelder`, `/auth/guardian-consent/[token]`, `/auth/samtykke-venter` | WizardShell, AuthCard, SettingsList, GoalProgress, Button |
| AU-2 | Auth + Marketing — Klubb-onboarding + forelder-invitasjon | P1 | 2 | `/onboard/klubb`, `/inviter/forelder/[token]` | WizardShell, AuthCard, Avatar, Button |
| FO-1 | Forelderportal — Varsler, innstillinger, forelder-coach | P1 | 3 + stub | `/forelder/varsler`, `/forelder/innstillinger`, `/forelder/coach` | InboxList, SettingsList, MessageThread, EmptyState |

> Merk: `/forelder/coach` er stub (Q3) — design EmptyState + «kommer snart»-tilstand. Telles som 1 skjerm.

---

## Claude Design-prompter

### MA-1 — Marketing: Kjernepakke coaching + priser + playerhq-landing + junior

```
Du designer 4 markedsføringssider for AK Golf Group (akgolf.no). Visuell retning: HYBRID-lys — varm editorial
cream-grunn (#FAFAF7), Inter Tight som display-font, lime #D1F843 som eneste signal-aksent.
Bygg fra tokens.css og kit-et. Alle 5 regler gjelder: (1) STILL SPØRSMÅL, (2) ikke overstyr Workbench,
(3) ingen døde knapper, (4) alle tilstander, (5) design oppå komponentene i kit-et.

--- Skjermer ---

/(marketing)/coaching — Coaching-pakkeside
- Viser to coaching-pakker: «Performance» (2 credits/mnd) og «Performance Pro» (4 credits/mnd).
  Merk: disse er COACHING-PAKKER (antall coaching-timer), ikke app-nivåer. Aldri skriv «ELITE».
  PlayerHQ-tilgang er enten GRATIS (har coaching-pakke) eller 300 kr/mnd — det er et eget valg, ikke koblet til pakke-navn.
- Primærflyt: «Velg pakke» → til /booking (≤2 trykk).
- Tilstander: innhold, tomt (ingen pakker aktive), laster.
- Komponenter: FeaturedCard (pakke-kort med pris + credits + innhold-liste), AthleticCard,
  KpiCard (pris-highlight), PageHero (foto-hero, atmosfærisk golffoto), Button (primary).

/(marketing)/priser — Prisside
- Oversikt: PlayerHQ-apper (GRATIS vs PRO 300 kr/mnd), coaching-pakker (Performance/Pro), grupper.
  GRATIS-grunnlag: 1 mnd prøveperiode ELLER coaching-pakke ELLER gruppe via AK Golf.
- Primærflyt: «Kom i gang gratis» → /auth/signup (≤1 trykk), «Book coaching» → /booking.
- Tilstander: innhold, laster.
- Komponenter: FeaturedCard (to kolonner GRATIS/PRO), AthleticCard (coaching-pakke-kort),
  SectionHeader, Button (primary + secondary), KpiCard (pris-tall).

/(marketing)/playerhq — PlayerHQ produktside (salgside for appen)
- Landingsside for spiller-appen. Vis kjernefeatures: trening, analyse, coach-kontakt, booking.
  Demo-navn: Øyvind Rohjan (HCP 4,2). Aldri «ELITE».
- Primærflyt: «Prøv gratis» → /auth/signup (1 trykk).
- Tilstander: innhold.
- Komponenter: PhotoHero (app-screenshot + golffoto), FeaturedCard (feature-highlights),
  AthleticCard, SectionHeader, KpiCard (tall: «3 trykk til første økt»), Button.

/(marketing)/junior — Junior-program landingsside
- Salgsside for juniorprogram. Vis tilbud, priser, aldersgrupper, kontaktskjema.
  Ekte coach: Markus Røinås Pedersen (beholdes på markedssider).
- Primærflyt: «Meld på» → /booking eller kontaktskjema (≤2 trykk).
- Tilstander: innhold, skjema-sendt.
- Komponenter: PageHero, FeaturedCard, AthleticCard, SectionHeader, Button.

--- Regler ---
- Norsk bokmål, «du»-tiltale. Lucide-ikoner (ingen emoji). Tall i JetBrains Mono.
- Lime = signatur-aksent, aldri lime tekst på lime flate. Mørk tekst på lime.
- Foto-gradient i hero-er (atmosfærisk golf), aldri solid-farge-hero.
- Alle knapper peker et sted (ingen døde knapper).
- Alle dataflater: innhold · tomt · laster (skeleton) · feil.
- Bygg fra hybrid-tokens og kit-komponenter — ikke oppfinn nye mønstre.
- STILL SPØRSMÅL om noe er uklart, spesielt om pakke-rekkefølge og prissetting.
```

---

### MA-2 — Marketing: Sekundærsider (om oss, FAQ, jobb, treningsfilosofi)

```
Du designer 4 informasjons-/sekundærsider for AK Golf Group (akgolf.no). Visuell retning: HYBRID-lys.
Bygg fra tokens.css og kit-et. Alle 5 regler gjelder.

--- Skjermer ---

/(marketing)/om-oss — Om oss / Team
- Viser AK Golf Groups identitet, coacher, verdier. Ekte coach: Anders Kristiansen + Markus Røinås Pedersen.
- Primærflyt: «Ta kontakt» → /kontakt (1 trykk).
- Komponenter: PageHero (foto-hero), SectionHeader, FeaturedCard (coach-profiler m/ foto), AthleticCard, Button.
- Tilstander: innhold, laster.

/(marketing)/faq — Vanlige spørsmål
- Liste med spørsmål/svar om coaching, booking, priser, PlayerHQ. Trekkspill-layout.
- Primærflyt: «Ikke funnet svar? Kontakt oss» → /kontakt.
- Komponenter: PageHero, SectionHeader, AthleticCard (FAQ-kort), Button.
- Tilstander: innhold, tomt (ingen FAQ), laster.

/(marketing)/jobb — Jobb hos oss
- Ledige stillinger + verdier som arbeidsgiver. Kan være tomt (ingen åpne stillinger).
- Primærflyt: «Søk stilling» → ekstern lenke eller skjema (1 trykk).
- Komponenter: PageHero, SectionHeader, FeaturedCard (stillinger), AthleticCard, EmptyState (ingen stillinger), Button.
- Tilstander: innhold, tomt, laster.

/(marketing)/treningsfilosofi — Treningsfilosofi / Metode
- Forklarer Mac O'Grady-metoden og AK Golfs treningsfilosofi. Redaksjonelt innhold.
  Pyramiden: Fysisk → Teknisk → Golfslag → Spill → Turnering.
- Primærflyt: «Prøv coaching» → /booking (1 trykk).
- Komponenter: PageHero, SectionHeader, AthleticCard, FeaturedCard, PyramidProgress (pyramid-visual), Button.
- Tilstander: innhold, laster.

--- Regler ---
- Norsk bokmål, «du»-tiltale. Lucide-ikoner. Tall i JetBrains Mono.
- Lime = signatur-aksent. Foto-gradient i hero-er.
- Ingen døde knapper. Alle tilstander.
- Bygg fra tokens.css og kit-et.
- STILL SPØRSMÅL om innholdsstruktur eller om pyramiden skal vises interaktiv eller statisk.
```

---

### MA-3 — Marketing: Anlegg (liste + detalj)

```
Du designer 2 anleggssider for AK Golf Group (akgolf.no). Visuell retning: HYBRID-lys.
Bygg fra tokens.css og kit-et. Alle 5 regler gjelder.

--- Skjermer ---

/(marketing)/anlegg — Anleggsliste
- Galleri-visning av alle treningsanlegg (Performance Studio, TrackMan-simulator, driving range m.fl.).
  Hvert kort: navn, bilde, adresse, tilgjengelige tjenester, «Les mer»-lenke.
- Primærflyt: Klikk anlegg → /(marketing)/anlegg/[slug] (1 trykk).
- Komponenter: GalleryView, FeaturedCard (anlegg-kort m/ foto), SectionHeader, PageHero, Button.
- Tilstander: innhold, tomt, laster.

/(marketing)/anlegg/[slug] — Anleggs-detalj
- Detaljside per anlegg: bilder, beskrivelse, kapasitet, tjenester/fasiliteter, lokasjon.
  Demo: «AK Golf Performance Studio», Fredrikstad.
- Primærflyt: «Book tid her» → /(marketing)/booking eller /booking (1 trykk).
- Komponenter: PhotoHero (foto-gallery/hero), DetailHero, FeaturedCard (tjenester), AthleticCard, Button.
- Tilstander: innhold, tomt, laster, feil (anlegg ikke funnet → EmptyState).

--- Regler ---
- Norsk bokmål, «du»-tiltale. Lucide-ikoner. Tall i JetBrains Mono.
- Foto-gradient i hero-er (ekte golf-/studiobilder, atmosfærisk).
- Ingen døde knapper. Alle tilstander.
- Bygg fra tokens.css og kit-et.
- STILL SPØRSMÅL om anlegg-hierarki: er det lokasjon (GFGK) som forelder og fasiliteter (Performance Studio) som barn?
  Spør FØR du bestemmer strukturen.
```

---

### MA-4 — Marketing: Blogg (liste + artikkel)

```
Du designer 2 blogg-sider for AK Golf Group (akgolf.no). Visuell retning: HYBRID-lys, editorial.
Bygg fra tokens.css og kit-et. Alle 5 regler gjelder.

--- Skjermer ---

/(marketing)/blogg — Blogg-liste
- Redaksjonelt galleri av artikler: coaching-innsikt, spillerfremgang, turneringsrapporter.
  Hvert kort: bilde, dato, tittel, ingress, forfatter (Anders/Markus).
- Primærflyt: Klikk artikkel → /(marketing)/blogg/[slug] (1 trykk).
- Komponenter: GalleryView, PhotoHero (featured article hero), Eyebrow (dato/kategori), FeaturedCard, SectionHeader, Button.
- Tilstander: innhold, tomt (ingen artikler → EmptyState), laster.

/(marketing)/blogg/[slug] — Blogg-artikkel
- Full artikkelvisning: foto-hero, overskrift, ingress, brødtekst, forfatter-bio, relaterte artikler.
  Demo: «Øyvind Rohjans vei fra HCP 12 til 4,2 på 18 måneder».
- Primærflyt: «Prøv coaching» (CTA på slutten) → /booking (1 trykk).
- Komponenter: DetailHero, Eyebrow, PhotoHero, FeaturedCard (relaterte artikler), Button.
- Tilstander: innhold, laster, feil (artikkel ikke funnet → EmptyState).

--- Regler ---
- Norsk bokmål, «du»-tiltale. Redaksjonell editorial-stil. Inter Tight italic i overskrifter.
- Lucide-ikoner. Lime kun på lenker/CTA.
- Ingen døde knapper. Alle tilstander.
- Bygg fra tokens.css og kit-et.
- STILL SPØRSMÅL om ønsket blogg-uttrykk: skal det ligne datadrevet (DataGolf-stil) eller mer klassisk editorial?
```

---

### MA-5 — Marketing: Turneringer (liste + detalj)

```
Du designer 2 turneringssider for AK Golf Group (akgolf.no). Visuell retning: HYBRID-lys.
Bygg fra tokens.css og kit-et. Alle 5 regler gjelder.

--- Skjermer ---

/(marketing)/turneringer — Turneringsliste
- Kommende og avsluttede turneringer AK Golf arrangerer eller anbefaler. Filtrering på sesong/type.
- Primærflyt: Klikk turnering → /(marketing)/turneringer/[slug] (1 trykk).
- Komponenter: TournamentCard, EventTimeline (sesong-oversikt), SectionHeader, PageHero, Button.
- Tilstander: innhold, tomt, laster.

/(marketing)/turneringer/[slug] — Turneringsdetalj
- Detalj: navn, dato, bane, format, påmelding, resultater (hvis avsluttet).
  Demo: «AK Golf Matchplay Championship 2026», Gamle Fredrikstad GK.
- Primærflyt: «Meld på» → påmeldingsskjema eller ekstern lenke (1 trykk).
- Komponenter: DetailHero, TournamentCard, EventTimeline (program), DataTable Pro (resultater), Button.
- Tilstander: innhold (kommende), innhold (avsluttet m/ resultater), tomt, laster, feil.

--- Regler ---
- Norsk bokmål, «du»-tiltale. Lucide-ikoner. Tall i JetBrains Mono.
- Lime på aktive CTA-er. Ingen emoji.
- Ingen døde knapper. Alle tilstander.
- Bygg fra tokens.css og kit-et.
- STILL SPØRSMÅL om påmelding: skal «Meld på» gå til ekstern lenke (GolfBox) eller intern booking-flyt?
```

---

### MA-6 — Marketing: Public booking-flyt (4 steg)

```
Du designer 4 steg i den offentlige booking-flyten på akgolf.no (ikke innlogget portal).
Visuell retning: HYBRID-lys. Bygg fra tokens.css og kit-et. Alle 5 regler gjelder.

--- Skjermer ---

/(marketing)/booking — Booking-startside (velg tjeneste/coach)
- Oversikt over bookbare tjenester: coaching-pakker, TrackMan-analyse, gruppeøkt.
  Hvert alternativ: navn, varighet, pris, «Velg»-knapp.
- Primærflyt: Velg tjeneste → /(marketing)/booking/[slug] (1 trykk).
- Komponenter: AthleticCard (tjeneste-kort), SectionHeader, PageHero, Button.
- Tilstander: innhold, tomt, laster.

/(marketing)/booking/[slug] — Tidspunkt-velger
- Kalender med ledige tider for valgt tjeneste. Demo: «Performance coaching med Anders Kristiansen».
- Primærflyt: Velg tid → /(marketing)/booking/[slug]/bekreft (1 trykk).
- Komponenter: SessionScheduler (kalender + tid-grid), DetailHero (tjeneste-info), AthleticCard, Button.
- Tilstander: innhold (ledige tider), tomt (ingen tider → EmptyState), laster, feil (kalender utilgjengelig).

/(marketing)/booking/[slug]/bekreft — Bekreft booking
- Oppsummering: tjeneste, dato/tid, pris. Skjema: navn, e-post, telefon (ikke innlogget).
- Primærflyt: «Bekreft» → /(marketing)/booking/kvittering/[bookingId] (1 trykk).
- Tilstander: innhold, laster (sender), feil (booking mislyktes → vis feilmelding).
- Komponenter: DetailHero (oppsummering), AthleticCard, Button (primary «Bekreft booking»).

/(marketing)/booking/kvittering/[bookingId] — Kvittering
- Bekreftelse: «Booking bekreftet!», detaljer, «Legg til kalender», «Opprett konto for å følge opp».
  Demo: Øyvind Rohjan, mandag 23. juni 14:00, Performance coaching.
- Primærflyt: «Opprett gratis konto» → /auth/signup (1 trykk).
- Tilstander: innhold, feil (booking ikke funnet).
- Komponenter: DetailHero, AthleticCard (booking-detalj), Button (primær «Opprett konto», sekundær «Til forsiden»).

--- Regler ---
- Norsk bokmål, «du»-tiltale. Lucide-ikoner. Tall i JetBrains Mono.
- SessionScheduler er en nøkkelkomponent — spør om du trenger detaljer om time-slot-formatet.
- Lime på primær CTA i hvert steg. Ingen døde knapper.
- Alle tilstander, inkl. «kalender utilgjengelig»-feil (fail-closed, ikke vis tomme tider).
- Bygg fra tokens.css og kit-et.
- STILL SPØRSMÅL om skjema-felter på bekreft-steget: er det nok med navn + e-post, eller trenger vi mer?
```

---

### MA-7 — Marketing: Juridisk (cookies, personvern, vilkår)

```
Du designer 3 juridiske informasjonssider for AK Golf Group (akgolf.no). Visuell retning: HYBRID-lys, minimalistisk.
Bygg fra tokens.css og kit-et. Alle 5 regler gjelder.

--- Skjermer ---

/(marketing)/cookies — Cookie-policy
/(marketing)/personvern — Personvernerklæring
/(marketing)/vilkar — Brukervilkår

Alle tre følger samme mønster:
- Sidetopp: sidetittel + «Sist oppdatert: [dato]» i Eyebrow-stil.
- Hoveddel: lang redaksjonell tekst med seksjoner/overskrifter.
- Bunntekst: «Spørsmål? Kontakt oss» → /kontakt (1 trykk).
- Tilstander: innhold, laster.
- Komponenter: PageHero (enkel, ingen foto), SectionHeader, Button.

--- Regler ---
- Norsk bokmål. Lucide-ikoner. Minimal bruk av lime (kun CTA-lenker).
- Ingen unødvendige kretser/smykker — ren tekst-layout.
- Bygg fra tokens.css og kit-et.
- STILL SPØRSMÅL om ønsket layout: én lang side med anker-nav, eller faner per seksjon?
```

---

### AU-1 — Auth: Forelder-onboarding + samtykke-flyt

```
Du designer 3 auth/onboarding-skjermer for foreldre i AK Golf HQ. Visuell retning: HYBRID-lys,
sentrerte kort-skall. Bygg fra tokens.css og kit-et. Alle 5 regler gjelder.

--- Skjermer ---

/auth/onboarding/forelder — Forelder-onboarding (wizard)
- Steg-basert wizard for foreldre som kobler seg til et barn (spiller) i systemet.
  Steg: (1) Hvem er du (navn + kontaktinfo), (2) Søk etter barn (søk på navn/spiller-ID),
  (3) Bekreft tilknytning, (4) Samtykke til datadeling.
- Primærflyt: «Neste» per steg → /forelder ved fullføring.
- Tilstander: hvert steg har innhold/laster/feil. Steg 2: nullresultat (barn ikke funnet → EmptyState).
- Komponenter: WizardShell (steg-skall med GoalProgress-steg-indikator), AuthCard, Input, Button.

/auth/guardian-consent/[token] — Foresatt-samtykke (invitasjonslink)
- Forelder mottar e-post med unik token. Siden viser: hvem som inviterte (coach/spiller-navn),
  hva de samtykker til (datadeling, treningsinnsyn), to knapper «Godta» og «Avslå».
  Demo: Anders Kristiansen inviterer foresatt til Øyvind Rohjan.
- Primærflyt: «Godta» → /auth/signup eller /forelder (avhengig av om konto finnes).
- Tilstander: innhold, laster, feil (token ugyldig/utløpt → EmptyState med «Kontakt coachen»).
- Komponenter: AuthCard, SettingsList (samtykke-punkter), Button (primær «Godta», sekundær «Avslå»), Avatar.

/auth/samtykke-venter — Venter på samtykke
- Mellomsteg for spillere under 18 som venter på at foresatt skal godta invitasjonen.
  Vis: hva som er sendt ut (e-postadresse), status (venter/godtatt/avslått), re-send-knapp.
  Demo: «Vi sendte samtykke-forespørsel til foreldre@eksempel.no».
- Primærflyt: Vent → auto-redirect ved godkjenning, eller «Send på nytt» (1 trykk).
- Tilstander: venter, godtatt, avslått, feil.
- Komponenter: AuthCard, Button (sekundær «Send på nytt»), PulseDot (vente-tilstand).

--- Regler ---
- Norsk bokmål, «du»-tiltale. Lucide-ikoner. Tall i JetBrains Mono.
- Lime kun på primær CTA. Ingen emoji.
- Ingen døde knapper — hvert steg har tydelig «neste» eller «tilbake». Alle tilstander.
- WizardShell og AuthCard er nye komponenter — beskriv dem tydelig i designet.
  WizardShell: horisontalt steg-rail øverst + innhold-område + navigasjons-knapper.
  AuthCard: sentrert kort (~420px bred, border-radius r-xl, sh-md, paper-bakgrunn).
- Bygg fra tokens.css og kit-et.
- STILL SPØRSMÅL om samtykke-innholdet: hvilke datapunkter skal foresatt samtykke til?
```

---

### AU-2 — Auth + Marketing: Klubb-onboarding + forelder-invitasjon

```
Du designer 2 onboarding/invitasjons-skjermer i AK Golf HQ. Visuell retning: HYBRID-lys, sentrerte kort.
Bygg fra tokens.css og kit-et. Alle 5 regler gjelder.

--- Skjermer ---

/onboard/klubb — Klubb-onboarding (wizard)
- Wizard for en golfklubb som skal ta i bruk AK Golf HQ (grupper, bookinger, treningsopplegg).
  Steg: (1) Klubbinformasjon (navn, sted, antall spillere), (2) Kontaktperson,
  (3) Velg tjenester (grupper / coaching / begge), (4) Bekreft + start.
- Primærflyt: «Neste» per steg → /admin ved fullføring.
- Tilstander: hvert steg: innhold, laster, feil.
- Komponenter: WizardShell, AuthCard, Input, Button, GoalProgress (steg-indikator).

/inviter/forelder/[token] — Forelder-invitasjonslenke
- En foresatt klikker invitasjonslenke fra e-post. Siden viser hvem som inviterer
  (spillerens navn + coach), hva PlayerHQ tilbyr foresatte (innsyn i treningsdata),
  og to valg: «Opprett konto» eller «Jeg har allerede konto».
  Demo: Anders Kristiansen inviterer foresatt til å følge Øyvind Rohjan (HCP 4,2).
- Primærflyt: «Opprett konto» → /auth/signup?role=forelder (1 trykk).
- Tilstander: innhold, laster, feil (token ugyldig → EmptyState med «Kontakt coach»).
- Komponenter: AuthCard, Avatar (spiller + coach), FeaturedCard (PlayerHQ-foresatt-pitch), Button.

--- Regler ---
- Norsk bokmål, «du»-tiltale. Lucide-ikoner.
- Lime på primær CTA. Ingen emoji.
- Ingen døde knapper. Alle tilstander (inkl. ugyldig token).
- Bygg fra tokens.css og kit-et.
- STILL SPØRSMÅL om hvilke data en foresatt ser i oversikten — er det kun coaching/booking, eller også treningsdata?
```

---

### FO-1 — Forelderportal: Varsler, innstillinger, forelder-coach (stub)

```
Du designer 3 skjermer i Forelderportalen (/forelder). Tema: HYBRID-lys, lesemodus — foreldre er ikke
teknikere, designet skal være rolig og enkelt. Bygg fra tokens.css og kit-et. Alle 5 regler gjelder.

--- Skjermer ---

/forelder/varsler — Varsler
- Liste over varsler: «Øyvind har ny økt i dag», «Faktura klar», «Booking bekreftet», «Samtykke-påminnelse».
  Vis lest/ulest-tilstand per varsel. Filtrer på type.
- Primærflyt: Trykk varsel → relevant side (booking, faktura, samtykke) ≤1 trykk.
- Tilstander: innhold (med varsler), tomt (ingen varsler → EmptyState «Du er oppdatert»), laster.
- Komponenter: InboxList (lest/ulest-rader), ActionList, Badge (varsel-type), EmptyState.

/forelder/innstillinger — Innstillinger
- Innstillinger for foresatt-konto: profilinformasjon, varslingsvalg (e-post/push), tilkoblede barn,
  personvern, logg ut.
  Seksjon «Tilkoblede barn»: vis Øyvind Rohjan med kobling-status (aktiv) + «Administrer».
- Primærflyt: Trykk seksjon → rediger inline eller modal (≤1 trykk).
- Tilstander: innhold, laster, feil (lagring mislyktes).
- Komponenter: SettingsList (innstillingsrader), Button (sekundær), Avatar (barn-rad).

/forelder/coach — Coach-kontakt (stub — Q3)
- Siden er planlagt men ikke klar ennå. Vis tydelig EmptyState:
  «Coach-chat kommer snart. Kontakt Anders Kristiansen på e-post i mellomtiden.»
  Lenke til e-post som sekundær CTA.
- Primærflyt: «Send e-post til coach» → mailto-lenke (1 trykk).
- Tilstander: kun EmptyState.
- Komponenter: EmptyState, MessageThread (design den som «coming soon»-skallet), Button.

--- Regler ---
- Norsk bokmål, «du»-tiltale. Lucide-ikoner.
- Lime kun på primær CTA. Rolig, lesevennlig layout. Ingen emoji.
- Ingen døde knapper. Alle tilstander.
- InboxList og SettingsList er nye komponenter:
  InboxList: liste-rad med lest/ulest-indikator (prikk), avsender, snippet-tekst, tidsstempel.
  SettingsList: rad med label (venstre) + verdi/toggle/chevron (høyre), separator mellom seksjoner.
- Bygg fra tokens.css og kit-et.
- STILL SPØRSMÅL om varsel-typer og prioritetsrekkefølge: hvilke varsler er viktigst for foresatte?
```
