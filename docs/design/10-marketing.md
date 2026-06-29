# Marketing — skjermkort (kode-verifisert 2026-06-29)

27 ruter under `src/app/(marketing)/` (ekskl. stats-underappen). Flaten er **lyst tema, foto-ledet, editorial** (forest-scrim hero, lime aksent, JetBrains Mono-tall, Inter Tight-display). Dominerende mønster: `MarketingHero`/lokal foto-hero → seksjoner med `SectionEyebrow` + `SectionH2` + `Em`-italic → mørk forest closing-CTA. Største gjeld: (1) forsiden bruker **emoji-ikoner** (brudd på brand-regel «ingen emoji i UI») og duplikat-priser som motsier de låste prisreglene; (2) seksjonsprimitivene er kopiert lokalt i 3+ filer i stedet for å gjenbruke `marketing-sections.tsx`; (3) flere async Prisma-sider mangler error-state; (4) flere ruter (`/cases` vs `/suksess`, `/blogg`) er foreldreløse — ingen nav lenker dit.

**Delt chrome (alle ruter):** `MarketingHeader` (`src/components/marketing/marketing-header.tsx`) + `MarketingFooter` (`src/components/marketing/marketing-footer.tsx`) via `src/app/(marketing)/layout.tsx`. Header-nav: Coaching · Slik trener vi (`/treningsfilosofi`) · PlayerHQ · Anlegg · Om oss + «Logg inn»/«Book tid». Footer lenker: Performance/Performance Pro (`/coaching`), Drop-in Flex (`/booking`), PlayerHQ, Coachene, Anlegg, Karriere (`/jobb`), Kontakt, Personvern/Vilkår/Cookies.

**Designfil-referanse (flate-nivå, ikke per rute):** `public/design-handover/Marketing Hjem (moderne).dc.html`, `Marketing Undersider (moderne).dc.html`, `Marketing Rester (moderne).dc.html`, `Marketing og Stats STUB-sider komplett (moderne).dc.html`, `Flyt - Booking (terminal-lys).dc.html`.

---

### /
- Fil: `src/app/(marketing)/page.tsx`
- Flate: Marketing (lyst) — forside/landing
- Rolle/gating: offentlig, ingen gating
- Jobb (1 setning): Selge plattformen — SG-konsoll-hero, to-app-split, bento-moduler, tall-band, priser, final CTA.
- Data vist (felt → kilde): BENTO/BAND/PRISER const in-file (linje 15–115, hardkodet); SG-konsoll → `SGConsole` (`@/components/marketing/sg-console`); app-mockup → `PlayerHQMockup`; coach-preview-rader hardkodet (linje 222–225, Øyvind Rohjan m.fl.); marquee-tekst hardkodet (linje 177–181).
- Komponenter: `SGConsole`, `PlayerHQMockup`, `BookingAnbefaling` (alle `@/components/marketing/*`); resten hardkodet inline (egne seksjonsprimitiver, ikke delte).
- Layout og hierarki: Hero (badge + display-H1 + ingress + primær `BookingAnbefaling` «Start gratis prøve» + sekundær `/playerhq` + 2 KPI + `SGConsole` høyre) → marquee-stripe → «Én plattform / to uttrykk» (PlayerHQ lys + AgencyOS mørk terminal, lenke `/admin`) → bento «06 moduler» (lenke `/coaching`) → mørkt tall-band → priser (3 kort, featured = Performance mørk) → forest CTA (`BookingAnbefaling` + `/kontakt`).
- Tilstander: loading/empty/error — n/a (statisk + klient-mockups). Ingen tier-gating.
- Interaksjoner: «Start gratis prøve» → BookingAnbefaling-dialog; «Se PlayerHQ» → `/playerhq`; «Åpne cockpit» → `/admin`; pris-CTA → `/auth/signup`, `/coaching`, `/kontakt`; final «Book gratis kartlegging» → dialog; «Snakk med Anders» → `/kontakt`.
- AK-domene vist: Strokes Gained (SG-konsoll + «2.8 snitt SG»), spillernavn Øyvind Rohjan (kanon), pyramide/FYS/tester nevnt i bento, TrackMan.
- Designfil-referanse: `Marketing Hjem (moderne).dc.html`
- Nåværende designkvalitet: **inkonsistent** — visuelt polert, men (a) **emoji-ikoner** i BENTO (📈📋💬🧪⭐📡, linje 16–57) bryter brand-regelen «ingen emoji i UI — bruk Lucide»; (b) **hardkodet hex/forest** `#0A1F17` brukes direkte (linje 174, 214, 276, 299, 332-via-bg-primary) i stedet for token; (c) **priser motsier låst regel** — viser Gratis 0 / Performance 1 200 / Performance Pro 2 220 som «app-nivåer», men BUSINESS-RULES sier PlayerHQ er gratis-eller-300, og Performance/Pro er coaching-pakker, ikke app-tiere; (d) seksjonsprimitiver duplisert lokalt i stedet for `marketing-sections.tsx`.
- Redesign-prioritet: **P0** (emoji + pris-regelbrudd på forsiden er høyt synlig)

---

### /coaching
- Fil: `src/app/(marketing)/coaching/page.tsx`
- Flate: Marketing (lyst)
- Rolle/gating: offentlig
- Jobb: Selge de to coaching-abonnementene (Performance / Performance Pro) og forklare hva en økt inneholder.
- Data vist: `PAKKER` const (linje 35–75, 2 pakker m/ plan-id, pris, økter, inkludert-liste), `OEKT_INNHOLD` const (linje 77–82) — alt hardkodet.
- Komponenter: `MarketingHero`, `HeroEm`, `Em`, `SectionEyebrow`, `SectionH2`, `CtaLime`, `CtaOutlineLys` (`@/components/marketing/marketing-sections`); `SubscribeButton` (`@/components/marketing/subscribe-button`); lokal `PakkeCard`.
- Layout og hierarki: Foto-hero (`coaching-tripod.jpg`, primær «Se pakkene» #pakker, sekundær `/booking`) → Pakker (2-kol grid, Performance featured/mørk) → «Hva inkluderer en økt» (check-liste) → forest closing-CTA (enkelt-timer, `/booking` + `/kontakt`).
- Tilstander: loading/empty/error — n/a (statisk). `SubscribeButton` har egen disabled/laste-tilstand.
- Interaksjoner: `SubscribeButton` (plan=performance / performance_pro) → Stripe-abonnement-flyt; CTA → `/booking`, `/kontakt`, mailto post@akgolf.no.
- AK-domene vist: coaching-pakker (Performance / Performance Pro), PlayerHQ inkludert, Trackman.
- Designfil-referanse: `Marketing Undersider (moderne).dc.html`
- Nåværende designkvalitet: **ferdig** — ren, konsistent, gjenbruker delte seksjonsprimitiver. Featured-kort bruker `.dark`-klasse korrekt. Ingen emoji/hex-brudd.
- Redesign-prioritet: **P2**

---

### /priser
- Fil: `src/app/(marketing)/priser/page.tsx`
- Flate: Marketing (lyst)
- Rolle/gating: offentlig. Foreldreløs i header-nav (kun via forside-lenker).
- Jobb: Vise alle prisalternativer — Flex drop-in, Performance, Performance Pro + PlayerHQ-app-pris (gratis-via-coaching / 300 kr) + FAQ.
- Data vist: `TJENESTER` (3 kort), `APP_GRATIS`/`APP_BETALT`, `FAQ_PRISER` — alt const in-file (linje 21–96, hardkodet).
- Komponenter: `MarketingHero`, `HeroEm`, `Em`, `SectionEyebrow`, `SectionH2`, `CtaLime`, `CtaOutlineLys`; lokale `TjenesteCard`, `FaqItem`.
- Layout og hierarki: Foto-hero (`walking-bag.jpg`) → Tjenester (3-kol, Performance featured) → PlayerHQ-app-pris (2-kol, «0 via coaching» / «300») → FAQ (3 punkter) → forest closing-CTA (`/auth/signup` + `/kontakt`).
- Tilstander: n/a (statisk).
- Interaksjoner: kort-CTA → `/booking`, `/coaching`, `/kontakt`, `/auth/signup`.
- AK-domene vist: coaching-pakker + app-pris-modell (gratis/300), nevner Mulligan/GFGK-anlegg.
- Designfil-referanse: `Marketing Undersider (moderne).dc.html`
- Nåværende designkvalitet: **ferdig** — korrekt pris-modell ift. låste regler (i motsetning til forsiden). Konsistent kort-anatomi. NB: `TjenesteCard`/`PrisCard`-mønsteret er kopiert i 3 filer (priser, coaching, playerhq) — kandidat for delt komponent.
- Redesign-prioritet: **P2**

---

### /playerhq
- Fil: `src/app/(marketing)/playerhq/page.tsx`
- Flate: Marketing (lyst)
- Rolle/gating: offentlig
- Jobb: Selge PlayerHQ-appen — funksjoner (mockup), trening, analyse/SG, pris, CTA.
- Data vist: `TRENING`/`ANALYSE` const (linje 15–49, hardkodet); app-mockup → `PlayerHQMockup`.
- Komponenter: `PlayerHQMockup`, `PulseDot` (`@/components/athletic/pulse-dot`); lokale duplikat-primitiver `SectionEyebrow`/`SectionH2`/`Em`/`PrisCard` (linje 372–491) + inline-hero (gjenbruker IKKE `MarketingHero`).
- Layout og hierarki: Inline foto-hero (`putting-data.jpg`, primær `/auth/signup`, sekundær #funksjoner) → Funksjoner (`PlayerHQMockup`) → Trening (split, foto + check) → Analyse (speilet split + foto) → Pris (2-kol, 0/300) → forest closing-CTA.
- Tilstander: n/a (statisk).
- Interaksjoner: «Prøv PlayerHQ gratis» → `/auth/signup`; kort/CTA → `/coaching`, `/auth/signup`.
- AK-domene vist: Strokes Gained (OTT/APP/ARG/PUTT), AI-coach, streak/achievements, live-økt/tapper-mode.
- Designfil-referanse: `Marketing Undersider (moderne).dc.html`
- Nåværende designkvalitet: **halvferdig/inkonsistent** — visuelt bra, men dupliserer hele hero-blokken + seksjonsprimitivene lokalt (linje 54–138, 372–491) i stedet for `MarketingHero`/`marketing-sections`. Drift-risiko: hero-animasjons-CSS er limt inn på nytt. Bør refaktoreres til delte komponenter.
- Redesign-prioritet: **P1** (funksjonelt ok, men gjeld + drift mot delt hero)

---

### /treningsfilosofi
- Fil: `src/app/(marketing)/treningsfilosofi/page.tsx`
- Flate: Marketing (lyst)
- Rolle/gating: offentlig (header-nav «Slik trener vi»)
- Jobb: Forklare metodikken — AK-pyramiden, Strokes Gained, individualisering.
- Data vist: `PYRAMIDE` (5 nivå: FYS/TEK/SLAG/SPILL/TURN), `SG` (OTT/APP/ARG/PUTT) — const in-file, hardkodet.
- Komponenter: ingen delte marketing-komponenter — håndkodet m/ Lucide-ikoner + inline-hero.
- Layout og hierarki: Tekst-hero + foto → Prinsipp 1 Pyramiden (5 rad-kort) → Prinsipp 2 SG (4-kol grid + foto) → Prinsipp 3 Individualisering (tekst) → forest closing-CTA (`/booking` + `/coaching`).
- Tilstander: n/a (statisk).
- Interaksjoner: CTA → `/booking`, `/coaching`.
- AK-domene vist: **tung AK-domene** — pyramide (FYS→TURN), Strokes Gained-taksonomi, Mac O'Grady-metodikk antydet, TrackMan/PlayerHQ.
- Designfil-referanse: `Marketing Undersider (moderne).dc.html`
- Nåværende designkvalitet: **ferdig** — pedagogisk, ren korthierarki. Bruker IKKE `MarketingHero` (egen tekst-hero) men det er bevisst variasjon. Kandidat: gjenbruke `PyramidProgress` fra athletic-biblioteket i stedet for håndkodede rad-kort.
- Redesign-prioritet: **P2**

---

### /anlegg
- Fil: `src/app/(marketing)/anlegg/page.tsx`
- Flate: Marketing (lyst)
- Rolle/gating: offentlig (header-nav)
- Jobb: Liste treningsanleggene (GFGK, Miklagard, Mulligan) med kort som lenker til detalj.
- Data vist (felt → kilde): anlegg → `prisma.location.findMany({active:true, name in MARKETING_LOCATIONS})`; `MULLIGAN` const (hardkodet); `HERO_IMAGES` record (hardkodet bildestier).
- Komponenter: `CtaLime`, `CtaOutlineLys` (`@/components/marketing/marketing-sections`); `PulseDot` (`@/components/athletic`).
- Layout og hierarki: Foto-hero → anlegg-kort-grid (lenker til `/anlegg/[slug]`) → Mulligan-kort (hardkodet) → forest closing-CTA (`/booking` + `/kontakt`).
- Tilstander: async Prisma-side — **error/empty MANGLER** (ingen håndtering hvis 0 locations). Ingen loading-skeleton.
- Interaksjoner: anlegg-kort → `/anlegg/[slug]`; CTA → `/booking`, `/kontakt`.
- AK-domene vist: ingen (anlegg-fokus).
- Designfil-referanse: `Marketing Undersider (moderne).dc.html`
- Nåværende designkvalitet: **ferdig** (visuelt). Svakhet: ingen tom-tilstand for tom Prisma-respons.
- Redesign-prioritet: **P2** (legg til empty/error)

---

### /anlegg/[slug]
- Fil: `src/app/(marketing)/anlegg/[slug]/page.tsx`
- Flate: Marketing (lyst)
- Rolle/gating: offentlig, dynamisk rute
- Jobb: Detaljside per anlegg — hero, highlights, galleri, kontakt, tre veier inn (greenfee/medlemskap/klubb).
- Data vist: `ANLEGG_DATA` const-record (kun 2: miklagard-golfklubb, gamle-fredrikstad-gk, hardkodet); `generateMetadata` leser slug.
- Komponenter: ingen delte — håndkodet m/ Lucide-ikoner.
- Layout og hierarki: Foto-hero m/ overlappende tittelkort → highlights (3-kol) → galleri + kontaktkort (split) → «Tre veier inn» (eksterne klubb-lenker) → CTA-banner m/ klubblogo.
- Tilstander: `notFound()` hvis slug ukjent. Loading/empty — n/a (statisk record).
- Interaksjoner: eksterne klubb-/greenfee-/medlemskap-lenker, `tel:`-lenke, `/booking`, `/anlegg`.
- AK-domene vist: ingen.
- Designfil-referanse: `Marketing Undersider (moderne).dc.html`
- Nåværende designkvalitet: **ferdig** men med **hardkodet rgba** (linje 236 `rgba(0,40,28,0.10)`, linje 311 `rgba(0,40,28,0.55)`, linje 449 `rgba(209,248,67,0.14)`) — bør bli tokens. Innhold kun for 2 av 3 anlegg (Mulligan har ikke slug-side).
- Redesign-prioritet: **P2** (token-migrering av rgba)

---

### /coacher
- Fil: `src/app/(marketing)/coacher/page.tsx`
- Flate: Marketing (lyst)
- Rolle/gating: offentlig (footer)
- Jobb: Vise coach-rosteret (Anders + Markus Røinås Pedersen) med kort + fasiliteter + booking-CTA.
- Data vist: `FALLBACK_COACHER` const (2 coacher, hardkodet) beriket med `prisma.user.findMany({role in [COACH,ADMIN]})` for avatar; `FASILITETER` const (2).
- Komponenter: `MarketingHero`, `HeroEm`, `Em`, `CtaLime`, `CtaOutlineLys`; lokal `CoachCard`.
- Layout og hierarki: `MarketingHero` → coach-kort (2-kol, lenker til `/coacher/[slug]`) → Anlegg & fasiliteter (2-kol) → forest closing-CTA.
- Tilstander: async — error MANGLER (Prisma-berikelse uten fallback-feilhåndtering, men FALLBACK_COACHER sikrer innhold). Ingen empty (fast 2).
- Interaksjoner: coach-kort → `/coacher/[slug]`; CTA → `/booking`, `/kontakt`.
- AK-domene vist: coach-ekspertise-tags (Plan & struktur, Trackman, Mental, Kortspill, Putting, Junior). NB: Markus = ekte coach (ikke demo-spiller).
- Designfil-referanse: `Marketing Undersider (moderne).dc.html`
- Nåværende designkvalitet: **ferdig** — gjenbruker `MarketingHero`. Bruker forest-gradient via `hsl(var(--primary))` (token-ok).
- Redesign-prioritet: **P2**

---

### /coacher/[slug]
- Fil: `src/app/(marketing)/coacher/[slug]/page.tsx`
- Flate: Marketing (lyst)
- Rolle/gating: offentlig, SSG (`generateStaticParams`)
- Jobb: Coach-profil — bio, erfaring, spesialiteter, booking/kontakt.
- Data vist: `COACHER` const (2 profiler: anders, markus, hardkodet); `generateStaticParams` + `generateMetadata`.
- Komponenter: ingen delte — håndkodet m/ Lucide (GraduationCap, Trophy, Mail).
- Layout og hierarki: Header (initial-avatar + navn + tittel + intro) → bio → erfaring & spesialiteter (2-kol) → booking-CTA-kort.
- Tilstander: `notFound()` hvis slug ukjent.
- Interaksjoner: `/booking`; mailto post@akgolf.no.
- AK-domene vist: spesialiteter (Junior-utvikling, Trackman-sertifisert, Mac O'Grady-influence, WANG Toppidrett).
- Designfil-referanse: `Marketing Undersider (moderne).dc.html`
- Nåværende designkvalitet: **ferdig** — ingen hex/emoji-brudd, ren profil-layout. Bruker IKKE `MarketingHero` (initial-avatar-header i stedet, bevisst).
- Redesign-prioritet: **P3**

---

### /om-oss
- Fil: `src/app/(marketing)/om-oss/page.tsx`
- Flate: Marketing (lyst)
- Rolle/gating: offentlig (header-nav)
- Jobb: Selskapshistorie + verdier (3 manifest-prinsipper) + historikk + org-detaljer.
- Data vist: `MANIFEST` const (3, hardkodet); selskapsinfo hardkodet i `Rad`-rader.
- Komponenter: `PulseDot`; lokale `SectionEyebrow`/`SectionH2`/`Em`/`Rad`.
- Layout og hierarki: Foto-hero → Manifest (3-kol prinsippkort) → Historien (tekst + blockquote) → Selskapet (hårstrek-tabell: org.nr, adresse, e-post) → forest closing-CTA.
- Tilstander: n/a (statisk).
- Interaksjoner: `/booking`, `/coacher`, `/kontakt`.
- AK-domene vist: AK-pyramiden nevnt, data-drevet filosofi.
- Designfil-referanse: `Marketing Undersider (moderne).dc.html`
- Nåværende designkvalitet: **ferdig** — narrativt, ren typografi. Dupliserer lokale seksjonsprimitiver (samme drift-tema som playerhq).
- Redesign-prioritet: **P3**

---

### /junior
- Fil: `src/app/(marketing)/junior/page.tsx`
- Flate: Marketing (lyst)
- Rolle/gating: offentlig. Foreldreløs i header-nav.
- Jobb: Junior-program — 4 aldersgrupper (U10/U14/U18/Talent), sesongplan-tabell, påmelding.
- Data vist: `GRUPPER` const (4, hardkodet); tabellrader hardkodet; mailto-mal hardkodet.
- Komponenter: `PulseDot`; lokale `SectionEyebrow`/`SectionH2`/`Em`/`GruppeKort`/`GruppeRad`/`Sesongrad`/`InfoRad`.
- Layout og hierarki: Foto-hero → Aldersgrupper (2-kol) → Sesongplan (tabell jan–des) → Påmelding (split, gradient-kort m/ e-post-CTA).
- Tilstander: n/a (statisk).
- Interaksjoner: #pamelding-anker; `/kontakt`; mailto m/ forhåndsutfylt junior-mal (linje 246).
- AK-domene vist: AK-pyramiden, PlayerHQ-progresjon, WANG Toppidrett.
- Designfil-referanse: `Marketing Undersider (moderne).dc.html`
- Nåværende designkvalitet: **ferdig** — god flyt, mailto-mal er fin UX. Lokale primitiver (drift-tema).
- Redesign-prioritet: **P2** (foreldreløs — vurder nav-lenke)

---

### /turneringer
- Fil: `src/app/(marketing)/turneringer/page.tsx`
- Flate: Marketing (lyst) — datadrevet
- Rolle/gating: offentlig. Header-nav nevner Stats/Turneringer er IKKE i v1-nav (kommentar linje 5 i header).
- Jobb: Filtrerbar turneringskalender for norske spillere på tvers av tourer, auto-synket daglig.
- Data vist (felt → kilde): `hentTurneringer(tab)` → `prisma.Tournament` (60-dagers vindu, status UPCOMING/IN_PROGRESS); `hentNorskeDenneUka()` → norske entries denne uka; `hentCounts()` → tab-badge-tall. ISR revalidate 1800s.
- Komponenter: `NorskeDenneUkaWidget`, `MersalgBanner` (`@/components/turneringer/*`); `AthleticEyebrow` (`@/components/athletic/eyebrow`).
- Layout og hierarki: Hero → `NorskeDenneUkaWidget` → tab-bar (Alle/Med nordmenn/Norge/Pro m/ badge-tall) → turnerings-grid (3-kol, `TurneringKort`) → `MersalgBanner` (PlayerHQ-upsell).
- Tilstander: empty → `TomTilstand()` ved 0 turneringer. Loading/error — MANGLER (ingen skeleton/error-boundary). Tab-nav fungerer via searchParams.
- Interaksjoner: tab → `/turneringer?tab=…`; kort → `/turneringer/[slug]`; live-badge pulserer på IN_PROGRESS.
- AK-domene vist: tour (pga/euro/kft/champ/lpga/let/amateur-no/junior-no), tier, norske spillere.
- Designfil-referanse: `Flyt - Turneringsresultater (terminal-lys).dc.html` (nærmeste; merk: terminal-lys-prototype, ikke marketing-moderne)
- Nåværende designkvalitet: **ferdig** — profesjonell kalender, men bruker `var(--s-*)` stats-tokens (eget spor), ikke marketing-tokens. Tilhører delvis stats-uttrykket selv om ruten er under marketing.
- Redesign-prioritet: **P2** (avklar token-spor: marketing vs stats)

---

### /turneringer/[slug]
- Fil: `src/app/(marketing)/turneringer/[slug]/page.tsx`
- Flate: Marketing (lyst) — datadrevet/live
- Rolle/gating: offentlig, dynamisk
- Jobb: Turneringsdetalj m/ live leaderboard, norske highlights, KPI-strip, status-badges.
- Data vist: `prisma.Tournament` m/ publicEntries + leaderboardSnap (linje 78–99); runder fra `PublicPlayerEntry.rounds` JSON (zod-validert linje 40–54); beregnet KPI (leder-to-par, runde, tied). ISR 120s. JSON-LD SportsEvent (linje 142).
- Komponenter: `FlagGlyph`, `Reveal`, `CountUp`, `StatsEyebrow` (`@/components/stats/*`); `MersalgBanner`; `LiveRefresher` (`@/components/turneringer/*`).
- Layout og hierarki: Hero (back, tour+dato, tittel+sted, status-pills LIVE/FERDIGSPILT/KOMMENDE, vinner-badge) → KPI-strip (4-kol) → «Norske i aksjon» (2-kol) → full leaderboard-tabell (live-kolonner betinget) → empty-melding → `MersalgBanner`.
- Tilstander: `notFound()` hvis ukjent; redirect ved `mergedIntoId`; empty-melding ved 0 entries; live-kolonner betinget av `erLive`.
- Interaksjoner: back → `/turneringer`; ekstern `officialUrl`; `LiveRefresher` poller ved live.
- AK-domene vist: tier (formaterTier), scoreToPar, status, country-filter.
- Designfil-referanse: `Flyt - Turneringsresultater (terminal-lys).dc.html`
- Nåværende designkvalitet: **ferdig** — avansert (live-refresh, CountUp, tie-logikk). **Hardkodet rgba** (linje 302 `rgba(0,88,64,0.3)`, 393/558 `rgba(209,248,67,…)`) — token-migrering. Stats-token-spor som listevisningen.
- Redesign-prioritet: **P2**

---

### /blogg
- Fil: `src/app/(marketing)/blogg/page.tsx`
- Flate: Marketing (lyst)
- Rolle/gating: offentlig. Foreldreløs i header-nav.
- Jobb: Bloggoversikt — alle innlegg sortert på dato + søk.
- Data vist: `POSTS` (import `./posts`, hardkodet) + `META`-record (linje 15–31, per-slug kategori/lesetid/featured).
- Komponenter: `BloggListe` (lokal `./` child).
- Layout og hierarki: Hero (eyebrow + tittel + søkeskjema GET `/blogg?q=`) → `BloggListe`.
- Tilstander: n/a (statisk). Søk er GET-form.
- Interaksjoner: søk → `/blogg?q=`; kort → `/blogg/[slug]`.
- AK-domene vist: ingen.
- Designfil-referanse: ingen dedikert prototype (dekkes generelt av `Marketing Rester (moderne).dc.html`)
- Nåværende designkvalitet: **ferdig** men tynt — hardkodet POSTS+META i to filer (sync-risiko). Søk-form uten synlig resultathåndtering verifisert i child.
- Redesign-prioritet: **P3**

---

### /blogg/[slug]
- Fil: `src/app/(marketing)/blogg/[slug]/page.tsx`
- Flate: Marketing (lyst)
- Rolle/gating: offentlig, SSG (`generateStaticParams`)
- Jobb: Enkelt blogginnlegg — hero-bilde, metadata, innhold, tilbake-lenke.
- Data vist: `POSTS` (hardkodet `../posts`); `generateStaticParams` + `generateMetadata`.
- Komponenter: ingen (next `Image`/`Link` + Lucide).
- Layout og hierarki: Hero-bilde (16/7 + gradient) → kort-overlay (back + tittel + dato/forfatter) → artikkel (italic intro + avsnitt) → CTA «Les flere» → `/blogg`.
- Tilstander: `notFound()` hvis ukjent.
- Interaksjoner: back → `/blogg`.
- AK-domene vist: ingen.
- Designfil-referanse: `Marketing Rester (moderne).dc.html`
- Nåværende designkvalitet: **ferdig** — ren artikkel-layout.
- Redesign-prioritet: **P3**

---

### /cases
- Fil: `src/app/(marketing)/cases/page.tsx`
- Flate: Marketing (lyst)
- Rolle/gating: offentlig. Foreldreløs. **Overlapper /suksess** (samme metadata-tittel «Suksesshistorier»).
- Jobb: Vise 2 suksess-cases + 6 kommende turneringer med forest-hero.
- Data vist: `CASES` const (2: Marcus, Sofie, hardkodet); `hentKommendeTurneringer()` → `prisma.Tournament` (6 neste, 90-dagers vindu).
- Komponenter: ingen delte (Link + Lucide TrendingDown/ArrowRight).
- Layout og hierarki: Forest-gradient-hero → cases-grid (3-kol) + turnerings-widget → primær-grønn CTA → `/booking`.
- Tilstander: empty turneringer → «Ingen kommende turneringer» m/ lenke `/turneringer`.
- Interaksjoner: CTA → `/booking`; turnerings-liste statisk (ingen lenker).
- AK-domene vist: HCP-forbedring, data-drevet coaching, tier antydet.
- Designfil-referanse: `Marketing Rester (moderne).dc.html`
- Nåværende designkvalitet: **inkonsistent** — **hardkodet hex `#0a1f17`** (linje 111, 240) + rgba lime (linje ~393); **duplisert formål med /suksess** (begge «Suksesshistorier», ulik data). En av de to bør konsolideres/avvikles.
- Redesign-prioritet: **P1** (duplikat-rute + hardkodet hex)

---

### /suksess
- Fil: `src/app/(marketing)/suksess/page.tsx`
- Flate: Marketing (lyst)
- Rolle/gating: offentlig. Foreldreløs. **Overlapper /cases**.
- Jobb: 3 detaljerte suksess-cases m/ testimonials og HCP-progresjon.
- Data vist: `CASES` const (3: Lars, Emma, Geir, hardkodet). Ingen Prisma.
- Komponenter: ingen delte (Lucide TrendingDown/ArrowRight/Quote + Link).
- Layout og hierarki: Forest-gradient-hero (sentrert) → cases-liste (grid-kort m/ initial-avatar + HCP-boks + blockquote) → CTA (`/coaching` + `/kontakt`).
- Tilstander: ingen.
- Interaksjoner: `/coaching`, `/kontakt`.
- AK-domene vist: HCP-progresjon (28→16, 18→6, 22→14), spiller-roller.
- Designfil-referanse: `Marketing Rester (moderne).dc.html`
- Nåværende designkvalitet: **ferdig** (ingen hex-brudd, i motsetning til /cases). Men **duplikat-formål med /cases** — IA-avklaring trengs: hvilken er kanonisk «suksesshistorier»?
- Redesign-prioritet: **P1** (konsolidering /cases vs /suksess)

---

### /faq
- Fil: `src/app/(marketing)/faq/page.tsx`
- Flate: Marketing (lyst)
- Rolle/gating: offentlig. Foreldreløs i header-nav.
- Jobb: FAQ-akkordeon per kategori (Coaching/Booking/PlayerHQ/Praktisk) + e-post-CTA.
- Data vist: `FAQ` const (4 kategorier, hardkodet).
- Komponenter: ingen delte (Lucide ChevronDown/Mail + Link).
- Layout og hierarki: Hero → FAQ-seksjoner (per kategori, native `<details>`-akkordeon) → forest-gradient CTA-boks (mailto + `/kontakt`).
- Tilstander: native `<details>` åpne/lukke; e-post + skjema-fallback.
- Interaksjoner: `<details>` ekspander; mailto post@akgolf.no; `/kontakt`.
- AK-domene vist: coaching-pakker, PlayerHQ, anlegg, utstyr.
- Designfil-referanse: `Marketing Undersider (moderne).dc.html`
- Nåværende designkvalitet: **ferdig** — ren akkordeon. Forest-gradient via tokens (`hsl(var(--primary))`, ok). Overlapper delvis FAQ-seksjoner på /priser og /kontakt (innholds-duplisering).
- Redesign-prioritet: **P3**

---

### /kontakt
- Fil: `src/app/(marketing)/kontakt/page.tsx`
- Flate: Marketing (lyst)
- Rolle/gating: offentlig (footer)
- Jobb: Kontakt-hub — skjema, telefon/e-post, åpningstider, 3 lokasjonskort, FAQ, CTA.
- Data vist: `HOURS` (7 dager), `FAQ` (4) const (hardkodet); `KontaktForm` (lokal `./form`).
- Komponenter: `KontaktForm` (`./form`); Lucide-ikoner.
- Layout og hierarki: Forest-hero → skjema + sidebar (3-kol: skjema-kort / om-boks / telefon / booking-tips) → kontaktinfo-kort (3) → åpningstider-tabell → lokasjonskort (3 m/ Maps-lenker) → FAQ-grid (4) → forest closing-CTA.
- Tilstander: skjema-tilstander i `KontaktForm` (client, ikke verifisert i page). Side ellers statisk.
- Interaksjoner: skjema-submit; `tel:+4748216540`; mailto post@akgolf.no; Google Maps-lenker; `/booking`.
- AK-domene vist: coaching- vs anleggs-åpningstider, 3 fysiske lokasjoner, bedriftshenvendelser.
- Designfil-referanse: `Marketing Undersider (moderne).dc.html`
- Nåværende designkvalitet: **ferdig** — grundig hub. Forest-gradient via tokens. Mange seksjoner — kandidat for å trimme FAQ-duplisering mot `/faq`.
- Redesign-prioritet: **P2**

---

### /jobb
- Fil: `src/app/(marketing)/jobb/page.tsx`
- Flate: Marketing (lyst)
- Rolle/gating: offentlig (footer «Karriere»)
- Jobb: Stillingsutlysninger + verdier + spontansøknad-CTA.
- Data vist: `STILLINGER` const (2 stillinger, hardkodet).
- Komponenter: ingen delte (Lucide + Link); lokal `StillingsKort`.
- Layout og hierarki: Hero → verdier (3-kol) → aktive stillinger (`StillingsKort`-liste) → spontansøknad (split, e-post-knapp).
- Tilstander: ingen (n/a — fast 2 stillinger, ingen empty hvis listen tømmes).
- Interaksjoner: «Søk stilling» → mailto m/ subject; spontan → mailto.
- AK-domene vist: data-drevet coaching (Trackman/PlayerHQ/SG).
- Designfil-referanse: `Marketing og Stats STUB-sider komplett (moderne).dc.html`
- Nåværende designkvalitet: **ferdig** men tynt (stub-aktig). Bør ha empty-state hvis STILLINGER tømmes.
- Redesign-prioritet: **P3**

---

### /booking
- Fil: `src/app/(marketing)/booking/page.tsx`
- Flate: Marketing (lyst) — booking-funnel inngang
- Rolle/gating: offentlig. Bak `BOOKING_ACTIVE`-flagg (ellers Acuity-fallback).
- Jobb: 3-stegs booking-wizard (lokasjon → coach → tjeneste).
- Data vist (felt → kilde): `prisma.serviceType.findMany({active, priceOre>0, include coach})` (linje 74); `COACH_BIOS`/`LOCATIONS` const (hardkodet); env `BOOKING_ACTIVE`, `NEXT_PUBLIC_ACUITY_URL`.
- Komponenter: `AthleticEyebrow` (`@/components/athletic/eyebrow`).
- Layout og hierarki: Header + steg-indikator (1/2/3 dynamisk) → Steg 1 lokasjonsvelger (MapPin-kort) → Steg 2 coach-velger (User-kort + gruppe-fallback) → Steg 3 tjeneste-velger (Flex/Abonnement split) → «Slik fungerer det» → `BookingPaused`-fallback hvis flagg av.
- Tilstander: empty «Ingen tjenester» (linje 342); steg-filtrering via searchParams; loading/error-boundary MANGLER; redirect til Acuity hvis `BOOKING_ACTIVE=false`.
- Interaksjoner: `/booking?lokasjon=…`, `…&trener=…` (steg-progresjon); `/booking/[slug]`; back-lenker; ekstern Acuity.
- AK-domene vist: økt-typer (Pro-time, Trackman, gruppe), coach via `serviceType.coach`, lokasjon GFGK/Mulligan, abonnement vs flex.
- Designfil-referanse: `Flyt - Booking (terminal-lys).dc.html`
- Nåværende designkvalitet: **ferdig** — ren wizard, responsivt, Tailwind-tokens (ingen hex/emoji). Mangler error-boundary.
- Redesign-prioritet: **P2**

---

### /booking/[slug]
- Fil: `src/app/(marketing)/booking/[slug]/page.tsx`
- Flate: Marketing (lyst) — booking-funnel
- Rolle/gating: offentlig, dynamisk, bak `BOOKING_ACTIVE`
- Jobb: Tjeneste-detalj — ledige tider (14-dagers dato-velger + slot-grid).
- Data vist: `prisma.serviceType.findUnique({slug})` (linje 44); `getAvailableSlots()` (`@/lib/booking/availability`); 14-dagers range; `generateMetadata`.
- Komponenter: `SlotPicker` (lokal `./slot-picker`, client).
- Layout og hierarki: Back → header (tjenestenavn italic + pris + varighet) → beskrivelse → «Velg dag» (14-dagers horisontal scroll) → «Ledige tider» (`SlotPicker` eller empty).
- Tilstander: empty «Ingen ledige tider denne dagen» (linje 155); `notFound()` hvis ukjent/inaktiv; redirect hvis flagg av; valgt-dato `border-primary bg-primary/10`.
- Interaksjoner: dato → `/booking/[slug]?dato=…`; back → `/booking`; `SlotPicker` → slot-valg.
- AK-domene vist: ServiceType (navn/pris/varighet), coach via `coachUserId`, slot start/end ISO.
- Designfil-referanse: `Flyt - Booking (terminal-lys).dc.html`
- Nåværende designkvalitet: **ferdig** — to-trinns-flyt ren, tokens-basert.
- Redesign-prioritet: **P2**

---

### /booking/[slug]/bekreft
- Fil: `src/app/(marketing)/booking/[slug]/bekreft/page.tsx`
- Flate: Marketing (lyst) — booking-funnel
- Rolle/gating: offentlig, dynamisk + searchParams (start, coach)
- Jobb: Bekreftelsesside — vise øktdetaljer + betalingsskjema før Stripe-redirect.
- Data vist: `prisma.serviceType.findUnique({slug})`; `prisma.user.findUnique({id:coach})`; `getCurrentUser()`; searchParams start/coach; tid formatert nb-NO/Europe/Oslo.
- Komponenter: `BekreftForm` (lokal `./bekreft-form`, client).
- Layout og hierarki: Back «Velg annen tid» → header «Bekreft bestilling» → detalj-boks (dl: Tjeneste/Dato/Klokkeslett/Coach/Pris) → `BekreftForm` → fotnote (15 min hold, 24t-refusjon).
- Tilstander: `notFound()` hvis start/coach mangler eller tjeneste ukjent. **Ingen `metadata`-eksport**. Skjema-tilstander i `BekreftForm` (client).
- Interaksjoner: back → `/booking/[slug]`; `BekreftForm` → opprett booking + Stripe.
- AK-domene vist: booking (tjeneste/coach/start/pris), Stripe-flyt.
- Designfil-referanse: `Flyt - Booking (terminal-lys).dc.html`
- Nåværende designkvalitet: **ferdig** — klar oppsummering. Mangler `metadata`-eksport (mindre SEO-gap, intern flyt).
- Redesign-prioritet: **P3**

---

### /booking/kvittering/[bookingId]
- Fil: `src/app/(marketing)/booking/kvittering/[bookingId]/page.tsx`
- Flate: Marketing (lyst) — booking-funnel slutt
- Rolle/gating: offentlig, dynamisk, `robots: noindex`
- Jobb: Kvittering — bekreft betaling, vis detaljer, tilby signup (gjest) eller «Mine bestillinger» (innlogget).
- Data vist: `prisma.booking.findUnique({bookingId, include serviceType+location})`; `getCurrentUser()`; status `CONFIRMED` vs pending.
- Komponenter: `PendingRefresh` (lokal `./pending-refresh`, client — kun ved ikke-CONFIRMED).
- Layout og hierarki: Sentrert header (CONFIRMED «Takk for bestillingen» vs pending «Behandler…» + `PendingRefresh`) → detalj-boks (6 rader) → CTA (innlogget «Mine bestillinger» → `/portal/meg/bookinger`; gjest «Opprett konto» → `/auth/signup?epost=`) + «Book en til».
- Tilstander: `notFound()` hvis booking mangler; to UI-tilstander (CONFIRMED/pending); gjest-vs-innlogget forgrening.
- Interaksjoner: `/portal/meg/bookinger`; `/auth/signup?epost=`; `/booking`.
- AK-domene vist: booking-status, gjest→konto-funnel.
- Designfil-referanse: `Flyt - Booking (terminal-lys).dc.html`
- Nåværende designkvalitet: **ferdig** — ren kvittering, gode success/pending-tilstander.
- Redesign-prioritet: **P3**

---

### /personvern
- Fil: `src/app/(marketing)/personvern/page.tsx`
- Flate: Marketing (lyst) — juridisk
- Rolle/gating: offentlig (footer)
- Jobb (stub-aktig, tekst): Personvernerklæring (GDPR, 9 nummererte seksjoner).
- Data vist: alt hardkodet; `SIST_OPPDATERT = "12. mai 2026"`.
- Komponenter: lokal `Section`.
- Layout og hierarki: Header (Juridisk-label + H1 + dato) → gult «Utkast»-varsel → 9 seksjoner (behandlingsansvarlig, data, rettslig grunnlag, databehandlere, lagringstid, rettigheter, mindreårige, cookies, endringer).
- Tilstander: n/a.
- Interaksjoner: mailto personvern@akgolf.no; ekstern datatilsynet.no.
- AK-domene vist: databehandlere (Supabase/Vercel/Stripe/Resend/Anthropic/Sentry), WANG nevnt.
- Designfil-referanse: `Marketing og Stats STUB-sider komplett (moderne).dc.html`
- Nåværende designkvalitet: **ferdig** (for juridisk dokument) — «Utkast»-vannmerke prominent (skal godkjennes med advokat før Q3 2026).
- Redesign-prioritet: **P3**

---

### /vilkar
- Fil: `src/app/(marketing)/vilkar/page.tsx`
- Flate: Marketing (lyst) — juridisk
- Rolle/gating: offentlig (footer)
- Jobb (tekst): Brukervilkår (10 seksjoner).
- Data vist: hardkodet; `SIST_OPPDATERT`; `className="prose-akgolf"` (egen prose-stil).
- Komponenter: lokal `Section`.
- Layout og hierarki: Header → gult «Utkast»-varsel → 10 seksjoner (tjeneste, konto, abonnement/betaling, innhold, AI-coach-disclaimer, tilgjengelighet, ansvarsbegrensning, personvern→lenke, verneting, kontakt).
- Tilstander: n/a.
- Interaksjoner: `/personvern`; mailto support@akgolf.no.
- AK-domene vist: PlayerHQ/AgencyOS/AI-coach, gratis/300-tier, 24t-refusjon, Claude-disclaimer.
- Designfil-referanse: `Marketing og Stats STUB-sider komplett (moderne).dc.html`
- Nåværende designkvalitet: **ferdig** (juridisk). «Utkast»-vannmerke.
- Redesign-prioritet: **P3**

---

### /cookies
- Fil: `src/app/(marketing)/cookies/page.tsx`
- Flate: Marketing (lyst) — juridisk
- Rolle/gating: offentlig (footer)
- Jobb (tekst): Cookie-policy (5 seksjoner, 4 kategorier).
- Data vist: hardkodet; `SIST_OPPDATERT`.
- Komponenter: lokal `Section`.
- Layout og hierarki: Header → 5 seksjoner (hva er cookies, kategorier [essential/analytics/marketing/preferences], styring, kontakt).
- Tilstander: n/a.
- Interaksjoner: mailto personvern@akgolf.no.
- AK-domene vist: PlayerHQ-panel-state, Plausible (cookie-fri, ingen Google Analytics), tema lys/mørk.
- Designfil-referanse: `Marketing og Stats STUB-sider komplett (moderne).dc.html`
- Nåværende designkvalitet: **ferdig** (juridisk) — ærlig om analytics.
- Redesign-prioritet: **P3**

---

## Tverrgående funn (orkestrator-relevant)

1. **Emoji-brudd på forsiden (P0):** `src/app/(marketing)/page.tsx` linje 16–57 bruker emoji (📈📋💬🧪⭐📡) som bento-ikoner. Bryter brand-regel «Aldri emoji i UI — bruk Lucide-ikoner». Eneste verifiserte emoji-bruk i hele marketing-flaten.
2. **Pris-regelbrudd på forsiden (P0):** Forsidens `PRISER` (linje 67–115) viser Performance/Performance Pro som «app-nivåer» med månedspris — motsier låst BUSINESS-RULES (PlayerHQ = gratis/300; Performance/Pro = coaching-pakker, ikke app-tiere). `/priser` og `/coaching` har riktig modell; forsiden er ute av sync.
3. **Hardkodet hex/rgba (P1–P2):** `#0A1F17`/`#0a1f17` direkte i `page.tsx`, `cases/page.tsx`; `rgba(0,40,28,…)` i `anlegg/[slug]`; `rgba(0,88,64,…)`/`rgba(209,248,67,…)` i `turneringer/[slug]`, `cases`. Designsystem-regelen krever token, ikke hex. Forsiden + cases er verst.
4. **Duplikat-rute (P1):** `/cases` og `/suksess` har samme metadata-tittel «Suksesshistorier» og overlappende formål med ulik hardkodet data. IA-avklaring: én kanonisk suksess-side.
5. **Lokal duplisering av seksjonsprimitiver:** `SectionEyebrow`/`SectionH2`/`Em`/`PrisCard`/`TjenesteCard` er kopiert inn lokalt i `page.tsx`, `playerhq`, `om-oss`, `junior`, `treningsfilosofi` i stedet for å importere fra `src/components/marketing/marketing-sections.tsx`. Drift-risiko (hero-animasjons-CSS limt inn flere steder).
6. **Manglende error/empty på async Prisma-sider:** `/anlegg`, `/coacher`, `/turneringer`, `/booking` har ingen error-boundary; `/anlegg` mangler også empty-state.
7. **Foreldreløse ruter:** `/priser`, `/junior`, `/cases`, `/suksess`, `/faq`, `/blogg` lenkes ikke fra header-nav (noen kun fra footer/forside). `/turneringer` er bevisst utenfor v1-nav (header-kommentar linje 5).
8. **To token-spor:** `/turneringer*` bruker stats-tokens (`var(--s-*)`) selv om de ligger under marketing — avklar om de skal følge marketing-moderne eller stats-sporet.
