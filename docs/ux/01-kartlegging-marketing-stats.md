# Vedlegg 01 — Kartlegging: Marketing + Stats

> Detaljert Del 1-rutetabell for markedssiden og stats-subappen. Hører til
> [docs/ux-arkitektur.md](../ux-arkitektur.md). Bygd på faktisk kodelesing.

---

## A) Marketing-flaten (`src/app/(marketing)/*`, ekskl. stats)

**Nav-grunnlag:** Header (`components/marketing/marketing-header.tsx` + `mobile-menu.tsx`) lenker til
`/coaching`, `/treningsfilosofi`, `/playerhq`, `/anlegg`, `/om-oss`, `/auth/login`, `/booking`. Live
footer (`marketing-footer.tsx`) legger til `/coacher`, `/jobb`, `/kontakt`, `/personvern`, `/vilkar`,
`/cookies`. **`forside.tsx` er en komplett alternativ forside med rik footer (junior/priser/cases/
suksess/blogg/faq/turneringer) men er ikke montert som side** → 7 foreldreløse sider.

«App-inngang» = `/` (0 trykk).

| Rute | Ene jobb | Primærhandling | Elem. | Trykk fra `/` | Auth | Datakilder | Nav inn | Nav ut |
|---|---|---|---|---|---|---|---|---|
| `/` | Selge Academy + drive booking | Book gratis kartlegging | 8 | 0 | open | `ServiceType`, `getAvailableSlots` | inngang | booking, coaching, kontakt |
| `/coaching` | Forklare 2 abonnementspakker | Bli Performance-kunde | 4 | 1 | open | statisk | header, forside | booking, kontakt, Subscribe |
| `/junior` | Selge juniorprogram | Meld på (mailto) | 4 | **FORELDRELØS** | open | statisk | ingen | kontakt, mailto |
| `/treningsfilosofi` | Forklare metodikk | Book intro | 5 | 1 | open | statisk | header | booking, coaching |
| `/coacher` | Liste 2 coacher | Book tid | 3 | 1 | open | `User` (avatar) | footer, om-oss | coacher/[slug], booking |
| `/coacher/[slug]` | Coach-profil | Book time | 4 | 2 | open | hardkodet `COACHER` | coacher | booking, mailto |
| `/anlegg` | Liste hovedanlegg | Book økt | 3 | 1 | open | `Location`+`Facility` | header, forside | anlegg/[slug], booking |
| `/anlegg/[slug]` | Anlegg-detalj | Se tider | 5 | 2 | open | hardkodet `ANLEGG_DATA` | anlegg | booking |
| `/booking` | Steg 1–3 velger | Velg tjeneste | 4 | 1 | open | `ServiceType`+coach | header, ~alle | booking/[slug] |
| `/booking/[slug]` | Velg dag + tid | Velg tid | 3 | 2 | open | `getAvailableSlots` | booking, forside | bekreft |
| `/booking/[slug]/bekreft` | Bekreft + betal (Stripe) | Fullfør betaling | 3 | 4 | open (valgfri user) | `ServiceType`, `User` | booking/[slug] | kvittering |
| `/booking/kvittering/[bookingId]` | Kvittering/status | Mine bestillinger | 3 | 5 | open (noindex) | `Booking` | Stripe-redirect | **/portal/meg/bookinger** (blindvei for gjest), booking |
| `/priser` | Pris-oversikt | Prøv gratis | 4 | **FORELDRELØS** (kun /stats) | open | statisk | ingen | coaching, signup, kontakt |
| `/om-oss` | Selskaps-historie | Book / møt coacher | ~10 | 1 | open | statisk | header | booking, coacher |
| `/cases` | Resultat-cases | Les hele caset | 3 | **FORELDRELØS** | open | hardkodet `CASES` | ingen | **/cases/[slug] = 404**, booking |
| `/suksess` | Kundesitater | Les om coaching | 3 | **FORELDRELØS** | open | hardkodet `CASES` | ingen | coaching, kontakt |
| `/faq` | Spørsmål/svar | Kontakt oss | 5 | **FORELDRELØS** | open | statisk | ingen | kontakt |
| `/jobb` | Ledige stillinger | Send søknad (mailto) | 4 | 1 | open | hardkodet | footer | mailto |
| `/kontakt` | Kontakt-skjema | Send melding / book | ~17 | 1 | open | `lead-form` | footer, ~alle CTA | booking, lead-action |
| `/blogg` | Artikkel-liste | Les innlegg | 4 | **FORELDRELØS** | open | `./posts.ts` | ingen | blogg/[slug] |
| `/blogg/[slug]` | Les ett innlegg | Tilbake til blogg | ~3 | 2 | open | `./posts.ts` | blogg | blogg (blindvei) |
| `/turneringer` | Live tour-oversikt | Åpne turnering | 3 + 4 faner | **FORELDRELØS** (kun /stats) | open | `Tournament` | ingen | turneringer/[slug] |
| `/turneringer/[slug]` | Turnerings-detalj | Tilbake / offisiell | ~6 | 1 | open | `Tournament`+entries | turneringer | turneringer, ekstern |
| `/cookies` | Cookie-erklæring | (les) | 5 | 1 | open | — | footer | **ingen (blindvei)** |
| `/personvern` | Personvern | (les) | ~10 | 1 | open | — | footer | **ingen (blindvei)** |
| `/vilkar` | Vilkår | (les) | ~11 | 1 | open | — | footer | personvern |

**Marketing-funn:**
- **Brutt lenke:** `/cases/[slug]` finnes ikke (`cases/page.tsx:165` lenker dit) → garantert 404.
- **Booking gated:** Hele trakta bak `BOOKING_ACTIVE`-flagg (default av → `/booking` viser «pauset»).
- **Død rik footer:** `forside.tsx` ikke montert → 7 foreldreløse sider.
- **Duplisering:** `SectionEyebrow`/`Em`/closing-CTA re-deklarert i ≥6 filer; `const CASES` i to filer.

---

## B) Stats-subappen (`src/app/(marketing)/stats/*`, ~45 ruter)

**Kritisk:** Stats har **ingen `layout.tsx`** og **ingen vedvarende nav** — arver kun marketing-header/
footer (begge uten stats-lenker). Eneste stats-navigator (`StatsCmdK`) er bygd men **montert
ingensteds** (død kode). Hubben `/stats` er reell eneste inngang; alt den ikke lenker til er foreldreløst.

Trykk = klikk fra `/stats` (0).

| Rute | Ene jobb | Primærhandling | Elem. | Trykk | Auth | Datakilder | Nav inn |
|---|---|---|---|---|---|---|---|
| `/stats` | Hub: 4 moduler + live snapshot | Se ukens turneringer | ~15 | 0 | Nei | Prisma+DataGolf | (ikke fra header) |
| `/stats/pga` | Inngang til 6 metrikk-kategorier | Velg metrikk | 6+ | 1 | Nei | DataGolf | hub |
| `/stats/pga/{drive-distance,fairway-pct,gir-pct,putts-per-round,scoring-avg,sg-total}` | Topp-tabell per metrikk | Les rangering | tabell | 2 | Nei | delt `pga-kategori-page.tsx` | pga-hub |
| `/stats/pga/putt-explorer` | Interaktiv putt-utforsker | Velg distanse | viz | **foreldreløs** | Nei | Prisma | (ingen) |
| `/stats/pga/spillere`(+`/[dg_id]`) | PGA-spillersøk + profil | Søk/åpne | liste | 1 | Nei | Prisma+DataGolf | hub |
| `/stats/spillere`(+`/[slug]`) | Norsk spillerbase | Søk spiller | liste+filter | 1 | Nei | Prisma | hub, bento |
| `/stats/norske` | Live norske på proff-tourer | Åpne leaderboard | kort | 1 | Nei | Prisma | hub, turneringer |
| `/stats/leaderboards` | Alle topp-10 samlet | Bla | lister | **foreldreløs** | Nei | Prisma | (kun Cmd-K) |
| `/stats/uka` | Ukentlig roundup | Les | resultater | **foreldreløs** | Nei | Prisma | (ingen) |
| `/stats/2026` | Sesongoversikt | Bla | liste | **foreldreløs** (hub→broken `sesong/2025`) | Nei | Prisma | (broken) |
| `/stats/verktoy` | Hub for 5 kalkulatorer | Velg verktøy | 5 kort | 1 | Nei | statisk | hub |
| `/stats/verktoy/{avstand,score-til-hcp,whs-kalkulator}` | Kalkulator | Regn ut | skjema | **foreldreløs** (hub lenker ikke) | Nei | client | (ingen) |
| `/stats/verktoy/{sg-estimator,tour-ekvivalent}` | Kalkulator | Regn ut | skjema | 2 | Nei | client | min-progresjon/hub |
| `/stats/sg-sammenlign`(+`/start`,+`/resultat/[id]`) | Din SG vs tour-snitt | Start sammenligning | radar | 1 | **Ja** | Prisma+auth | hub, pga, verktoy |
| `/stats/sammenlign-spillere` | 2 norske spillere side-by-side | Velg to | dobbel graf | 1 | Nei | Prisma | hub |
| `/stats/min-progresjon` | Egen SG-trend | Se trend | trendgraf | **foreldreløs** | **Ja** | Prisma+auth | (ingen) |
| `/stats/aargang`(+`/[aar]`) | Kohort-explorer | Velg årgang | graf | 1 | Nei | Prisma | hub |
| `/stats/regions`(+`/[slug]`) | Golf per region | Velg region | kart+liste | 1 | Nei | Prisma | hub, sok |
| `/stats/tour/[slug]` | Deep-dive én tour | Bla | leaderboard | **foreldreløs** | Nei | Prisma | (kun Cmd-K) |
| `/stats/turneringer`(+`/[slug]`(+`/statistikk`)) | Turneringskalender/-detalj | Åpne turnering | kalender | 1 | Nei | DataGolf+Prisma | hub, norske |
| `/stats/baner`(+`/[slug]`) | Banedatabase | Søk bane | liste | 1 | Nei | statisk+Prisma | hub |
| `/stats/klubber`(+`/[slug]`) | Klubbdatabase | Søk klubb | liste | 1 | Nei | Prisma | hub |
| `/stats/blogg`(+`/[slug]`) | Analyse-artikler | Les artikkel | liste | 1 | Nei | statisk | hub |
| `/stats/quiz` | Golf-stat-quiz | Start quiz | quiz | **foreldreløs** | Nei | statisk | (ingen) |
| `/stats/sok` | Globalt søk | Søk | søkefelt | **foreldreløs** | Nei | Prisma | (kun Cmd-K) |
| `/stats/wrapped/[slug]` | «Wrapped» spiller-sesong | Bla i slides | story | **foreldreløs** | Nei | Prisma | (ingen) |

**Stats-funn:**
- **~12 foreldreløse ruter** (nær halve appen): `leaderboards`, `uka`, `sok`, `tour/[slug]`, `quiz`,
  `min-progresjon`, `wrapped`, `pga/putt-explorer`, `verktoy/{avstand,score-til-hcp,whs-kalkulator}`, `2026`.
- **Verktøy-hubben er funksjonelt tom** — lenker bare til `sg-sammenlign` + abonnement, ikke sine egne verktøy.
- **Blindveier overalt** pga. manglende vedvarende nav (PGA-sider, kalkulatorer, alle detaljsider).
- **Konsolideringspotensial:** ~25 navigasjonsflater → ~6–8 (PGA 8→1, verktøy 6→1, personlig-SG 3→1,
  database-søk 6→1–2). Beholder SEO-løvnoder. Viktigste enkelttiltak: legg på `stats/layout.tsx`.
