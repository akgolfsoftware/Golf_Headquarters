# Marketing (akgolf.no) — produkt-brief

> **Rute:** `/` + offentlige sider · **Enhet:** desktop + mobil · **Tema:** lyst, editorial.
> **Status i dag:** UI-kit finnes (`ui_kits/marketing`) — trenger ferdige, lanseringsklare sider. Bygg fra `01-DESIGNSYSTEM.md`.
> **Stemme:** editorial sport-analytics — MUNDIAL Magazine møter The Athletic. Atmosfærisk foto, presis tekst, datadrevet troverdighet. Aldri gymsalg-hype.

## Sidekart

### Forside — `/`
Den viktigste siden. **PhotoHero** (golfbilde, golden hour, gradient-lag, editorial headline med Inter Tight italic i `text-primary` på nøkkelordet). Deretter: verdiløfte (hva AK Golf gir), bevis (SG/data-drevet metodikk — det ingen andre har), coach-intro, utvalgte tjenester (FeaturedCard), sosialt bevis/case, CTA «Book økt» + «Se PlayerHQ». Komponenter: PhotoHero, FeaturedCard, KpiStrip (resultater i mono), InsightCard, PartnerCard, AthleticButton.

### Coaching — `/coaching`
Tjeneste-oversikt: 1:1, grupper, WANG, junior. Hver med utfall + pris-inngang. CTA → Booking. Komponenter: PageHero, AthleticCard, ActionList.

### Priser — `/priser`
Tydelig: coaching-pakker (Performance / Performance Pro — antall økter) OG PlayerHQ-abonnement (gratis / 300 kr/mnd). **Hold disse adskilt** — pakker er ikke app-nivåer. ELITE vises aldri. Komponenter: AthleticCard, StatusPill, KpiCard.

### Junior — `/junior`
Junior-utviklingsstige (Mini → Basis → Utvikling → Elite — 4 trinn). Foreldre-vinklet tillit. Komponenter: PhotoHero, PyramidProgress, AthleticCard.

### Treningsfilosofi — `/treningsfilosofi`
AK-metodikken forklart editorialt: pyramiden (FYS→TEK→SLAG→SPILL→TURN), SG, MORAD-fundament — uten å avsløre proprietær detalj. Komponenter: DetailHero, PyramidProgress, InsightCard, editorial tekst-seksjoner.

### PlayerHQ (produktside) — `/playerhq`
Selger appen: skjermbilder, SG-analyse, Workbench, live-økt. CTA «Prøv gratis». Komponenter: PhotoHero, FeaturedCard, ShotMap/SgBar (som produkt-demo).

### Coacher — `/coacher/[slug]`
Coach-profil (foto, bio, spesialitet, resultater). **NB:** ekte coach «Markus Røinås Pedersen» beholdes — ikke erstatt med demo-navn. Komponenter: DetailHero, AthleticAvatar, KpiStrip.

### Anlegg — `/anlegg/[slug]`
Fasilitet-presentasjon (foto, kart, utstyr, åpningstider). CTA → Booking. Komponenter: PhotoHero, PartnerCard, DataTable.

### Blogg — `/blogg` + `/blogg/[slug]`
Editorial artikler. Liste + lesevisning (rik typografi, Inter Tight headlines, mono for tall/data i artikler). Komponenter: PageHero, AthleticCard, editorial body.

### Om oss · Kontakt · FAQ · Juridisk
Standard: om-oss (historie, team), kontakt (skjema + rate-limit), faq (accordion), personvern/cookies/vilkår. Komponenter: PageHero, ActionList, EmptyState.

### Stats-portal — `/stats/**` (egen stor seksjon)
Offentlig golf-statistikk (PGA-data, norske spillere, turneringer, leaderboards, verktøy: WHS-kalkulator, SG-estimator, tour-ekvivalent). Datatung, men editorial. Komponenter: DataTable, SgBar, SgTrendLine, KpiStrip, FilterPillBar. (Behandles som egen modul — list skjermene, men prioritér kjernesidene over for lansering.)

## Design-direksjon (Marketing)
Luftig, foto-ledet, redaksjonell. Store hero-bilder (16:9 / 21:9, aldri kvadratisk, aldri mid-day blå himmel). Tall i mono gir troverdighet. Lime kun som signatur-accent (én CTA, eyebrow-highlight). Maks bredde ~1280px. Mobil: foto + headline + én CTA først.
