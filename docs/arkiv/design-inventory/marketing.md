# Marketing — skjerm- & interaksjons-inventar (`/(marketing)`)

> READ-ONLY. Hver påstand `fil:linje`, ellers `UVERIFISERT`. Generert 2026-06-29 · branch `docs/design-inventory`.
> 72 ruter totalt = **27 hoved** + **45 stats (EGET SPOR, egen seksjon nederst)** — verifisert via
> `find src/app/(marketing) -name page.tsx | wc -l` (72 / 45 / 27).
> Marketing-sider er offentlige og responsive (fungerer mobil+desktop), men **ikke v10-pusset utenom Forsiden**.
> Delt chrome: `MarketingHeader` (sticky nav + Logg inn + Book tid) + `MarketingFooter`, wrapper i
> `src/app/(marketing)/layout.tsx:11`. Forsiden er eneste P0 (full element-detalj).

## Skjermer — Marketing hoved (27)
| id | Rute | Fil | Jobb | Arketype | Desktop+mobil-note | Roller | Gating | Tilstander | Prioritet |
|---|---|---|---|---|---|---|---|---|---|
| mkt.forside | `/` | `src/app/(marketing)/page.tsx:117` | Landingsside (hero + plattform + bento + priser + CTA) | fluid-editorial (v10-pusset) | responsiv grid `md:grid-cols-12` (`page.tsx:122`), v10-design | offentlig | offentlig | statisk (interaktiv hero-SGConsole + booking-modal) | P0 |
| mkt.anlegg | `/anlegg` | `src/app/(marketing)/anlegg/page.tsx:1` | Oversikt over anlegg | fluid-editorial | responsiv, ikke v10-pusset | offentlig | offentlig | liste (UVERIFISERT) | P2 |
| mkt.anlegg.detalj | `/anlegg/[slug]` | `src/app/(marketing)/anlegg/[slug]/page.tsx:1` | Anlegg-detalj | fluid-editorial | responsiv, ikke v10-pusset | offentlig | offentlig | 404 ved ukjent slug (UVERIFISERT) | P2 |
| mkt.blogg | `/blogg` | `src/app/(marketing)/blogg/page.tsx:1` | Blogg-oversikt | fluid-editorial | responsiv, ikke v10-pusset | offentlig | offentlig | liste (UVERIFISERT) | P2 |
| mkt.blogg.innlegg | `/blogg/[slug]` | `src/app/(marketing)/blogg/[slug]/page.tsx:1` | Blogg-innlegg | fluid-editorial | responsiv, ikke v10-pusset | offentlig | offentlig | 404 ved ukjent (UVERIFISERT) | P2 |
| mkt.booking | `/booking` | `src/app/(marketing)/booking/page.tsx:1` | Booking-tjenestevalg | split/wizard-inngang | responsiv, ikke v10-pusset | offentlig | offentlig | (UVERIFISERT) | P1 |
| mkt.booking.tjeneste | `/booking/[slug]` | `src/app/(marketing)/booking/[slug]/page.tsx:1` | Velg tid for tjeneste | wizard | responsiv, ikke v10-pusset | offentlig | offentlig | (UVERIFISERT) | P1 |
| mkt.booking.bekreft | `/booking/[slug]/bekreft` | `src/app/(marketing)/booking/[slug]/bekreft/page.tsx:1` | Bekreft booking | wizard | responsiv, ikke v10-pusset | offentlig | offentlig | (UVERIFISERT) | P1 |
| mkt.booking.kvittering | `/booking/kvittering/[bookingId]` | `src/app/(marketing)/booking/kvittering/[bookingId]/page.tsx:1` | Booking-kvittering | fluid-editorial | responsiv, ikke v10-pusset | offentlig | id-param | bekreftelse (UVERIFISERT) | P1 |
| mkt.cases | `/cases` | `src/app/(marketing)/cases/page.tsx:1` | Kundecase-oversikt | fluid-editorial | responsiv, ikke v10-pusset | offentlig | offentlig | (UVERIFISERT) | P2 |
| mkt.coacher | `/coacher` | `src/app/(marketing)/coacher/page.tsx:1` | Coach-oversikt | fluid-editorial | responsiv, ikke v10-pusset | offentlig | offentlig | liste (UVERIFISERT) | P2 |
| mkt.coacher.profil | `/coacher/[slug]` | `src/app/(marketing)/coacher/[slug]/page.tsx:1` | Coach-profil (ekte: Markus Røinås Pedersen) | fluid-editorial | responsiv, ikke v10-pusset | offentlig | offentlig | 404 ved ukjent (UVERIFISERT) | P2 |
| mkt.coaching | `/coaching` | `src/app/(marketing)/coaching/page.tsx:1` | Coaching-salgsside | fluid-editorial | responsiv, ikke v10-pusset | offentlig | offentlig | statisk (UVERIFISERT) | P1 |
| mkt.junior | `/junior` | `src/app/(marketing)/junior/page.tsx:1` | Junior-salgsside | fluid-editorial | responsiv, ikke v10-pusset | offentlig | offentlig | statisk (UVERIFISERT) | P2 |
| mkt.priser | `/priser` | `src/app/(marketing)/priser/page.tsx:1` | Priser/pakker | fluid-editorial | responsiv, ikke v10-pusset | offentlig | offentlig | statisk (UVERIFISERT) | P1 |
| mkt.playerhq | `/playerhq` | `src/app/(marketing)/playerhq/page.tsx:1` | PlayerHQ-salgsside | fluid-editorial | responsiv, ikke v10-pusset | offentlig | offentlig | statisk (UVERIFISERT) | P1 |
| mkt.om-oss | `/om-oss` | `src/app/(marketing)/om-oss/page.tsx:1` | Om AK Golf | fluid-editorial | responsiv, ikke v10-pusset | offentlig | offentlig | statisk (UVERIFISERT) | P2 |
| mkt.kontakt | `/kontakt` | `src/app/(marketing)/kontakt/page.tsx:1` | Kontaktskjema | split (form) | responsiv, ikke v10-pusset | offentlig | offentlig | form: error/success (UVERIFISERT) | P1 |
| mkt.jobb | `/jobb` | `src/app/(marketing)/jobb/page.tsx:1` | Karriere/jobb | fluid-editorial | responsiv, ikke v10-pusset | offentlig | offentlig | statisk (UVERIFISERT) | P2 |
| mkt.faq | `/faq` | `src/app/(marketing)/faq/page.tsx:1` | Ofte stilte spørsmål | fluid-editorial (accordion) | responsiv, ikke v10-pusset | offentlig | offentlig | (UVERIFISERT) | P2 |
| mkt.suksess | `/suksess` | `src/app/(marketing)/suksess/page.tsx:1` | Suksess/resultater | fluid-editorial | responsiv, ikke v10-pusset | offentlig | offentlig | statisk (UVERIFISERT) | P2 |
| mkt.treningsfilosofi | `/treningsfilosofi` | `src/app/(marketing)/treningsfilosofi/page.tsx:1` | Treningsfilosofi | fluid-editorial | responsiv, ikke v10-pusset | offentlig | offentlig | statisk (UVERIFISERT) | P2 |
| mkt.turneringer | `/turneringer` | `src/app/(marketing)/turneringer/page.tsx:1` | Turnerings-oversikt | tabell-tett/liste | responsiv, ikke v10-pusset | offentlig | offentlig | liste (UVERIFISERT) | P2 |
| mkt.turneringer.detalj | `/turneringer/[slug]` | `src/app/(marketing)/turneringer/[slug]/page.tsx:1` | Turnering-detalj | fluid-editorial | responsiv, ikke v10-pusset | offentlig | offentlig | 404 ved ukjent (UVERIFISERT) | P2 |
| mkt.cookies | `/cookies` | `src/app/(marketing)/cookies/page.tsx:1` | Cookie-erklæring | fluid-editorial (juridisk) | responsiv, ikke v10-pusset | offentlig | offentlig | statisk (UVERIFISERT) | P2 |
| mkt.personvern | `/personvern` | `src/app/(marketing)/personvern/page.tsx:1` | Personvernerklæring | fluid-editorial (juridisk) | responsiv, ikke v10-pusset | offentlig | offentlig | statisk (UVERIFISERT) | P2 |
| mkt.vilkar | `/vilkar` | `src/app/(marketing)/vilkar/page.tsx:1` | Vilkår | fluid-editorial (juridisk) | responsiv, ikke v10-pusset | offentlig | offentlig | statisk (UVERIFISERT) | P2 |

> **Arketype-merknad:** Alle hoved-rader unntatt Forsiden er **layout-arketype UVERIFISERT** (page.tsx ikke
> åpnet i denne kjøringen) — angitt arketype er klassifisert fra rutenavn/jobb og bør verifiseres ved
> element-pass. Linje `:1` for ikke-åpnede filer betyr «filen eksisterer» (verifisert via `find`), ikke at
> innholdet er lest. Bekreftet åpnet: Forside (`page.tsx`), `layout.tsx`, header- + hero-komponenter.

## Elementer — `mkt.forside` (P0, fullt verifisert)

### Delt chrome (header — `marketing-header.tsx`, footer)
| id | Type | Etikett | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|
| forside.header.logo | link (logo) | AK Golf-logo | next/link + `AkGolfLogo` | route → `/` | default/hover/focus | alltid synlig | `marketing-header.tsx:20` |
| forside.header.mobilmeny | trigger | (hamburger) | `MobileMenu` | client (åpner mobilmeny) | default/åpen | kun mobil (skjult `sm:`) | `marketing-header.tsx:19` |
| forside.header.nav | nav-lenker | Coaching / PlayerHQ / … (`NAV[]`) | next/link ×N | route | default/hover/focus | `hidden …sm:flex` (kun desktop) | `marketing-header.tsx:25` (NAV `:6`) |
| forside.header.login | link | Logg inn | next/link | route → `/auth/login` | default/hover/focus | alltid synlig | `marketing-header.tsx:38` |
| forside.header.book | button-link | Book tid | next/link (pill, primary) | route → `/booking` | default/hover/focus | alltid synlig | `marketing-header.tsx:44` |

### Hero (`page.tsx`)
| id | Type | Etikett | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|
| forside.hero.badge | slot (live-badge) | «Norges datadrevne golfakademi» | div + pulserende prikk (`animate-ping`) | none | statisk | inline | `page.tsx:125` |
| forside.hero.h1 | heading | «Hver slag teller. Nå kan du bevise det.» | `h1.font-display` | none | statisk | `clamp(42px,7vw,78px)` | `page.tsx:133` |
| forside.hero.lead | paragraph | salgs-lead | `p` | none | statisk | `max-w-[46ch]` | `page.tsx:137` |
| forside.hero.cta-primary | button | «Start gratis prøve» | `BookingAnbefaling` (åpner modal-wizard) | client → modal (`booking-anbefaling.tsx:108`) | default/hover/active | wrap `flex-wrap` | `page.tsx:143` |
| forside.hero.cta-secondary | button-link | «Se PlayerHQ» + `ArrowRight` | next/link (pill, outline) | route → `/playerhq` | default/hover | wrap | `page.tsx:147` |
| forside.hero.stat.sg | stat-block | 2.8 / «SNITT SG / RUNDE» | div + mono | none | statisk | inline flex | `page.tsx:156` |
| forside.hero.stat.spillere | stat-block | 41 / «AKTIVE SPILLERE» | div + mono | none | statisk | inline flex | `page.tsx:160` |
| forside.hero.sgconsole | widget | Interaktiv SG-konsoll | `SGConsole` (kategori-tabs OTT/…) | client (`setActive`, `sg-console.tsx:55`) | tab-state | `md:col-span-5` | `page.tsx:169` |
| forside.hero.marquee | slot (marquee) | «ØYVIND ROHJAN · +2.9 SG …» | div + CSS `marquee` | animasjon (CSS) | løpende | fullbredde mørk | `page.tsx:174` |

### Seksjoner under hero (`page.tsx`)
| id | Type | Etikett | Komponent | Handling | Tilstander | Responsiv | Kilde |
|---|---|---|---|---|---|---|---|
| forside.plattform.playerhq | mockup-kort | PlayerHQ-mockup (lyst) | `PlayerHQMockup` | none | statisk | `md:grid-cols-2` | `page.tsx:209` |
| forside.plattform.agencyos | preview-kort | AgencyOS-terminal (mørkt) + «Åpne cockpit →» | div + next/link → `/admin` | route → `/admin` | statisk liste | `md:grid-cols-2` | `page.tsx:214` / link `:238` |
| forside.bento.link | link | «Se hele plattformen» | next/link → `/coaching` | route | default/hover | `hidden md:flex` | `page.tsx:253` |
| forside.bento.cards | kort-grid | 6 modul-kort (`BENTO[]`) | div ×6 | none | statisk | `md:grid-cols-6` + span-klasser | `page.tsx:259` (BENTO `:15`) |
| forside.band | stat-band | 4 nøkkeltall (`BAND[]`) | div ×4 | none | statisk | `grid-cols-2 md:grid-cols-4` | `page.tsx:278` (BAND `:60`) |
| forside.priser.cards | pris-grid | 3 pakker (`PRISER[]`): Gratis/Performance/Performance Pro | div ×3 + next/link CTA | route (CTA → `/auth/signup`\|`/coaching`\|`/kontakt`) | featured-variant | `md:grid-cols-3` | `page.tsx:296` (PRISER `:67`) |
| forside.cta.book | button | «Book gratis kartlegging» | `BookingAnbefaling` (modal) | client → modal | default/hover | `sm:flex-row` | `page.tsx:342` |
| forside.cta.kontakt | button-link | «Snakk med Anders» | next/link → `/kontakt` | route | default/hover | `sm:flex-row` | `page.tsx:346` |

**Verifiserte interaksjoner (forside):**
- `BookingAnbefaling` er en knapp som åpner en modal-wizard (`useState open`, `booking-anbefaling.tsx:81/108`)
  med valg lokal/frekvens (`setLocal`/`setFreq`, `:165/185`) → anbefaling. Brukt 2× (hero `:143`, CTA `:342`).
- `SGConsole` har kategori-tabs med `useState<Category>` (`sg-console.tsx:23`, knapper `:53`).
- Marquee er ren CSS-animasjon (klasse `marquee`, kommentar peker til `globals.css`, `page.tsx:173`).

> **Hardkodet i forside (avvik fra designsystem, ikke endret — kun notert):** emoji-ikoner i BENTO
> (`page.tsx:18` mfl.) bryter «ingen emoji i UI / kun Lucide»-regelen; hex-farger `#0A1F17` / `#1F2E27`
> hardkodet flere steder (`page.tsx:174,214,276,299` …) i stedet for tokens. UVERIFISERT om dette er
> bevisst v10-unntak — flagges, ikke rettet (READ-ONLY).

---

## Marketing → Stats (EGET SPOR — 45 ruter)

> **Eget spor.** Stort offentlig statistikk-univers (PGA-tall, norske spillere, baner/klubber, verktøy/kalkulatorer).
> Funksjonelt med ekte data, men **ikke v10-pusset**. Alle adresser under `/(marketing)/stats/...`.
> Element-detalj er **ikke** gjort her (utenfor P0). Alle rader: roller=offentlig, gating=offentlig,
> arketype=UVERIFISERT (page.tsx ikke åpnet; klassifisert fra rutenavn), prioritet P1 (kjernestats) / P2 (resten).
> Linje `:1` = filen eksisterer (verifisert via `find`), innhold ikke lest.

| id | Rute (`/(marketing)/stats/...`) | Fil | Jobb (antatt) | Arketype (antatt) | Prioritet |
|---|---|---|---|---|---|
| stats.index | `stats` | `stats/page.tsx:1` | Stats-forside/hub | fluid-editorial | P1 |
| stats.uka | `stats/uka` | `stats/uka/page.tsx:1` | Ukens stats | fluid-editorial | P1 |
| stats.2026 | `stats/2026` | `stats/2026/page.tsx:1` | Sesong 2026 | fluid-editorial | P2 |
| stats.spillere | `stats/spillere` | `stats/spillere/page.tsx:1` | Spiller-oversikt | tabell-tett | P1 |
| stats.spillere.detalj | `stats/spillere/[slug]` | `stats/spillere/[slug]/page.tsx:1` | Spiller-profil | fluid-editorial | P1 |
| stats.aargang | `stats/aargang` | `stats/aargang/page.tsx:1` | Årgang-oversikt | tabell-tett | P2 |
| stats.aargang.detalj | `stats/aargang/[aar]` | `stats/aargang/[aar]/page.tsx:1` | Årgang-detalj | tabell-tett | P2 |
| stats.baner | `stats/baner` | `stats/baner/page.tsx:1` | Bane-oversikt | tabell-tett | P2 |
| stats.baner.detalj | `stats/baner/[slug]` | `stats/baner/[slug]/page.tsx:1` | Bane-detalj | fluid-editorial | P2 |
| stats.klubber | `stats/klubber` | `stats/klubber/page.tsx:1` | Klubb-oversikt | tabell-tett | P2 |
| stats.klubber.detalj | `stats/klubber/[slug]` | `stats/klubber/[slug]/page.tsx:1` | Klubb-detalj | fluid-editorial | P2 |
| stats.regions | `stats/regions` | `stats/regions/page.tsx:1` | Region-oversikt | tabell-tett | P2 |
| stats.regions.detalj | `stats/regions/[slug]` | `stats/regions/[slug]/page.tsx:1` | Region-detalj | fluid-editorial | P2 |
| stats.turneringer | `stats/turneringer` | `stats/turneringer/page.tsx:1` | Turnering-oversikt | tabell-tett | P2 |
| stats.turneringer.detalj | `stats/turneringer/[slug]` | `stats/turneringer/[slug]/page.tsx:1` | Turnering-detalj | fluid-editorial | P2 |
| stats.turneringer.statistikk | `stats/turneringer/[slug]/statistikk` | `stats/turneringer/[slug]/statistikk/page.tsx:1` | Turnering-statistikk | tabell-tett | P2 |
| stats.tour.detalj | `stats/tour/[slug]` | `stats/tour/[slug]/page.tsx:1` | Tour-detalj | fluid-editorial | P2 |
| stats.leaderboards | `stats/leaderboards` | `stats/leaderboards/page.tsx:1` | Leaderboards | tabell-tett | P1 |
| stats.norske | `stats/norske` | `stats/norske/page.tsx:1` | Norske spillere | tabell-tett | P1 |
| stats.pga | `stats/pga` | `stats/pga/page.tsx:1` | PGA-stats hub | fluid-editorial | P1 |
| stats.pga.drive-distance | `stats/pga/drive-distance` | `stats/pga/drive-distance/page.tsx:1` | PGA drive distance | tabell-tett | P2 |
| stats.pga.fairway-pct | `stats/pga/fairway-pct` | `stats/pga/fairway-pct/page.tsx:1` | PGA fairway % | tabell-tett | P2 |
| stats.pga.gir-pct | `stats/pga/gir-pct` | `stats/pga/gir-pct/page.tsx:1` | PGA GIR % | tabell-tett | P2 |
| stats.pga.putt-explorer | `stats/pga/putt-explorer` | `stats/pga/putt-explorer/page.tsx:1` | PGA putt-explorer | tabell-tett | P2 |
| stats.pga.putts-per-round | `stats/pga/putts-per-round` | `stats/pga/putts-per-round/page.tsx:1` | PGA putts/runde | tabell-tett | P2 |
| stats.pga.scoring-avg | `stats/pga/scoring-avg` | `stats/pga/scoring-avg/page.tsx:1` | PGA scoring avg | tabell-tett | P2 |
| stats.pga.sg-total | `stats/pga/sg-total` | `stats/pga/sg-total/page.tsx:1` | PGA SG total | tabell-tett | P2 |
| stats.pga.spillere | `stats/pga/spillere` | `stats/pga/spillere/page.tsx:1` | PGA spiller-oversikt | tabell-tett | P2 |
| stats.pga.spillere.detalj | `stats/pga/spillere/[dg_id]` | `stats/pga/spillere/[dg_id]/page.tsx:1` | PGA spiller-detalj | fluid-editorial | P2 |
| stats.verktoy | `stats/verktoy` | `stats/verktoy/page.tsx:1` | Verktøy-hub | fluid-editorial | P1 |
| stats.verktoy.avstand | `stats/verktoy/avstand` | `stats/verktoy/avstand/page.tsx:1` | Avstands-kalkulator | wizard/kalkulator | P2 |
| stats.verktoy.score-til-hcp | `stats/verktoy/score-til-hcp` | `stats/verktoy/score-til-hcp/page.tsx:1` | Score→HCP-kalkulator | wizard/kalkulator | P2 |
| stats.verktoy.sg-estimator | `stats/verktoy/sg-estimator` | `stats/verktoy/sg-estimator/page.tsx:1` | SG-estimator | wizard/kalkulator | P2 |
| stats.verktoy.tour-ekvivalent | `stats/verktoy/tour-ekvivalent` | `stats/verktoy/tour-ekvivalent/page.tsx:1` | Tour-ekvivalent | wizard/kalkulator | P2 |
| stats.verktoy.whs-kalkulator | `stats/verktoy/whs-kalkulator` | `stats/verktoy/whs-kalkulator/page.tsx:1` | WHS-kalkulator | wizard/kalkulator | P2 |
| stats.sammenlign-spillere | `stats/sammenlign-spillere` | `stats/sammenlign-spillere/page.tsx:1` | Sammenlign spillere | split | P2 |
| stats.sg-sammenlign | `stats/sg-sammenlign` | `stats/sg-sammenlign/page.tsx:1` | SG-sammenlign hub | split | P2 |
| stats.sg-sammenlign.start | `stats/sg-sammenlign/start` | `stats/sg-sammenlign/start/page.tsx:1` | SG-sammenlign start | wizard | P2 |
| stats.sg-sammenlign.resultat | `stats/sg-sammenlign/resultat/[id]` | `stats/sg-sammenlign/resultat/[id]/page.tsx:1` | SG-sammenlign resultat | fluid-editorial | P2 |
| stats.blogg | `stats/blogg` | `stats/blogg/page.tsx:1` | Stats-blogg | fluid-editorial | P2 |
| stats.blogg.innlegg | `stats/blogg/[slug]` | `stats/blogg/[slug]/page.tsx:1` | Stats-blogg-innlegg | fluid-editorial | P2 |
| stats.sok | `stats/sok` | `stats/sok/page.tsx:1` | Søk | split/søk | P2 |
| stats.quiz | `stats/quiz` | `stats/quiz/page.tsx:1` | Quiz | wizard | P2 |
| stats.wrapped | `stats/wrapped/[slug]` | `stats/wrapped/[slug]/page.tsx:1` | «Wrapped»-oppsummering | fluid-editorial | P2 |
| stats.min-progresjon | `stats/min-progresjon` | `stats/min-progresjon/page.tsx:1` | Min progresjon | fluid-editorial | P2 |

> **TODO (ikke gjort i denne kjøringen):** (1) åpne hver hoved-/stats-`page.tsx` for å verifisere
> layout-arketype og tilstander (alle merket UVERIFISERT/antatt over); (2) element-detalj for P1-skjermer
> (booking-flyt, kontakt-form, priser, coaching, stats-verktøy/kalkulatorer); (3) verifisere `MarketingFooter`-
> lenker. Kun Forsiden er fullt element-verifisert (P0-kravet).
