# Marketing (/) — skjermkort (kode-verifisert 2026-06-29)

72 ruter under `src/app/(marketing)/` (30 marketing-kjerne + ~42 stats). Lyst tema, foto-ledet, editorial. Delt opp i to spor under: marketing-flaten (salgskjerne + offentlige sider + booking-funnel + juridisk) og stats-underappen (`/stats/*`, eget designspor).

Marketing-flaten er **lyst tema, foto-ledet, editorial**: forest-scrim hero, lime aksent, JetBrains Mono-tall, Inter Tight-display. Dominerende mønster: `MarketingHero`/lokal foto-hero → seksjoner med `SectionEyebrow` + `SectionH2` + `Em`-italic → mørk forest closing-CTA. Største gjeld: (1) **forsiden** bruker emoji-ikoner (brudd på brand-regel «ingen emoji i UI») OG viser priser som motsier de låste prisreglene — verifisert å fortsatt gjelde på DENNE branchen (`src/app/(marketing)/page.tsx` uendret, ikke den fiksede branchen); (2) seksjonsprimitivene er kopiert lokalt i 4+ filer i stedet for å gjenbruke `marketing-sections.tsx`; (3) flere async Prisma-sider mangler error-state; (4) flere ruter (`/cases` vs `/suksess`, `/blogg`, `/junior`, `/faq`, `/priser`) er foreldreløse — header-nav lenker ikke dit; (5) gjennomgående token-disiplin-brudd: rå `hsl(168 72% 11%)`-gradient + `[--primary:164_100%_17.3%]`-override + lime `rgba(209,248,67,…)`-skygger på tvers av priser/coaching/anlegg/playerhq.

**Delt chrome (alle marketing-ruter):** `MarketingHeader` (`src/components/marketing/marketing-header.tsx`) + `MarketingFooter` (`src/components/marketing/marketing-footer.tsx`, `.dark`-tema) + `PlausibleScript` via `src/app/(marketing)/layout.tsx`. Header-nav (`marketing-header.tsx:6-12`): Coaching (`/coaching`) · Slik trener vi (`/treningsfilosofi`) · PlayerHQ (`/playerhq`) · Anlegg (`/anlegg`) · Om oss (`/om-oss`) + «Logg inn» (`/auth/login`) / «Book tid» (`/booking`). Header-kommentar `marketing-header.tsx:5`: «Stats og Turneringer er ikke med i v1-lanseringen — aktiveres etter launch». Footer-grupper: Tjenester (Performance/Performance Pro → `/coaching`, Drop-in Flex → `/booking`, PlayerHQ) · AK Golf (Coachene → `/coacher`, Anlegg, Partnere → `/#partnere`, Karriere → `/jobb`) · Kontakt (mailto post@akgolf.no, `/kontakt`) · bunn (Personvern/Vilkår/Cookies, org.nr 927 248 581).

**Designfil-referanse (flate-nivå):** `public/design-handover/Marketing Hjem (moderne).dc.html`, `Marketing Undersider (moderne).dc.html`, `Marketing Rester (moderne).dc.html`, `Marketing og Stats STUB-sider komplett (moderne).dc.html`, `Flyt - Booking (terminal-lys).dc.html`. NB: INGEN av marketing-kjerne-sidene har en `.dc.html`-kommentar i selve fila (verifisert) — designfil-tilknytningen er flate-nivå, ikke per-rute.

---

# Marketing — salgskjerne · skjermkort (kode-verifisert 2026-06-29)

6 ruter som driver salg: forside, priser, coaching, anlegg, PlayerHQ, booking. Dominerende mønster: editorial foto-hero + hardkodede const-data + delte/lokale seksjonsprimitiver. Kun `/anlegg` og `/booking` er datadrevne (Prisma); resten er statiske. Største gjeld konsentrert her: forsidens emoji + pris-regelbrudd (P0) og token-disiplin-brudd på alle seks.

---

### /
- Fil: `src/app/(marketing)/page.tsx` · Flate: Marketing (lyst), forside/landing · Rolle/gating: offentlig, ingen gating.
- Jobb: Selge plattformen — SG-konsoll-hero, to-app-split, bento-moduler, tall-band, priser, final CTA.
- Data vist (felt → kilde): `BENTO` (const, 15-58, 6 moduler m/ emoji-ikon), `BAND` (const, 60-65, 4 tall), `PRISER` (const, 67-115, 3 «nivåer») — alt hardkodet. Hero-KPI «2.8 / 41» hardkodet (157-163). Coach-preview-rader hardkodet (222-225: Øyvind Rohjan, Mathias H., Lukas N.). Marquee-tekst hardkodet (177-181). Ingen Prisma.
- Handlinger: ingen server actions. Klient: `BookingAnbefaling`-dialog (143, 342). Eksterne kall: ingen.
- Tilstander: loading/empty/error — n/a (statisk + klient-mockups). Ingen tier-gating.
- Komponenter: `SGConsole`, `PlayerHQMockup`, `BookingAnbefaling` (alle `@/components/marketing/*`); seksjonsprimitiver hardkodet inline (IKKE delte).
- Flyt: inngang til hele salgsfunnelet → `/playerhq`, `/admin`, `/coaching`, `/kontakt`, `/auth/signup`, BookingAnbefaling → booking-dialog.
- AK-domene vist: Strokes Gained (SG-konsoll + «2.8 snitt SG»), spillernavn Øyvind Rohjan (kanon), pyramide/FYS/tester (bento), TrackMan.
- Designfil-referanse: `Marketing Hjem (moderne).dc.html` (flate-nivå; ingen kommentar i fila).
- Nåværende designkvalitet: **inkonsistent** — visuelt polert, men (a) **emoji-ikoner** i BENTO (📈 16, 📋 24, 💬 31, 🧪 38, ⭐ 45, 📡 52) bryter «ingen emoji i UI — bruk Lucide»; (b) **hardkodet hex** `#0A1F17` direkte (174, 214, 262, 276, 299); (c) **priser motsier låst regel** — Gratis 0 / Performance 1 200 / Performance Pro 2 220 vist som «app-nivåer», men BUSINESS-RULES: PlayerHQ er gratis/300, Performance/Pro er coaching-pakker, IKKE app-tiere; (d) seksjonsprimitiver duplisert lokalt. **Verifisert på denne branchen — IKKE den fiksede.**
- Redesign-prioritet: **P0** (emoji + pris-regelbrudd på høyt synlig forside)

---

### /priser
- Fil: `src/app/(marketing)/priser/page.tsx` · Flate: Marketing (lyst) · Rolle/gating: offentlig. Foreldreløs i header-nav (kun via forside-/footer-lenker).
- Jobb: Vise alle prisalternativer — Flex drop-in, Performance, Performance Pro + PlayerHQ-app-pris (gratis-via-coaching / 300 kr) + FAQ.
- Data vist (felt → kilde): `TJENESTER` (const 21-66, 3 kort), `APP_GRATIS` (69-73), `APP_BETALT` (75-81), `FAQ_PRISER` (83-96) — alt hardkodet. Ingen Prisma.
- Handlinger: ingen server actions. Klient: ingen (statisk). Eksterne kall: ingen.
- Tilstander: loading/empty/error — n/a (statisk, ingen datahenting).
- Komponenter: `MarketingHero, HeroEm, Em, SectionEyebrow, SectionH2, CtaLime, CtaOutlineLys` (`@/components/marketing/marketing-sections`); lokale `TjenesteCard` (219), `FaqItem` (306).
- Flyt: pris-/info-side → kort-CTA → `/booking`, `/coaching`, `/kontakt`, `/auth/signup`.
- AK-domene vist: coaching-pakker + app-pris-modell (gratis/300), nevner Mulligan/GFGK-anlegg.
- Designfil-referanse: `Marketing Undersider (moderne).dc.html` (flate-nivå; ingen kommentar i fila).
- Nåværende designkvalitet: **ferdig** — KORREKT pris-modell ift. låste regler (i motsetning til forsiden). Konsistent kort-anatomi, gjenbruker delte primitiver. Mindre token-brudd: `rgba(209,248,67,0.25)`-skygge (296), rå `hsl(168 72% 11%)`-gradient (189), `[--primary:164_100%_17.3%]`-override (296). `TjenesteCard`-mønster kopiert i 3 filer.
- Redesign-prioritet: **P2**

---

### /coaching
- Fil: `src/app/(marketing)/coaching/page.tsx` · Flate: Marketing (lyst) · Rolle/gating: offentlig (header-nav).
- Jobb: Selge de to coaching-abonnementene (Performance / Performance Pro) og forklare hva en økt inneholder.
- Data vist (felt → kilde): `PAKKER` (const 35-75, 2 pakker m/ plan-id/pris/økter/inkludert), `OEKT_INNHOLD` (const 77-82) — alt hardkodet. Ingen Prisma.
- Handlinger: `SubscribeButton` (263-265, prop `plan=performance|performance_pro`) → Stripe-abonnement-flyt (write i abonnement-endepunkt, ikke i fila). Klient: SubscribeButton disabled/laste-tilstand. CTA → `/booking`, `/kontakt`, mailto post@akgolf.no.
- Tilstander: loading/empty/error — n/a (statisk). `SubscribeButton` har egen disabled/laste-tilstand.
- Komponenter: `MarketingHero, HeroEm, Em, SectionEyebrow, SectionH2, CtaLime, CtaOutlineLys`; `SubscribeButton` (`@/components/marketing/subscribe-button`); lokal `PakkeCard` (191).
- Flyt: coaching-salg → SubscribeButton → Stripe; sidegrener til `/booking`, `/kontakt`.
- AK-domene vist: coaching-pakker (Performance / Performance Pro), PlayerHQ inkludert, Trackman.
- Designfil-referanse: `Marketing Undersider (moderne).dc.html` (flate-nivå; ingen kommentar i fila).
- Nåværende designkvalitet: **ferdig** — ren, konsistent, gjenbruker delte primitiver. Featured-kort bruker `.dark` korrekt. Ingen emoji. Token-brudd: `rgba(209,248,67,0.25)` (267), rå `hsl(168 72% 11%)` (151), `[--primary:164_100%_17.3%]` (267).
- Redesign-prioritet: **P2**

---

### /anlegg
- Fil: `src/app/(marketing)/anlegg/page.tsx` · Flate: Marketing (lyst), async server-komponent · Rolle/gating: offentlig (header-nav).
- Jobb: Liste treningsanleggene (GFGK, Miklagard, Mulligan) med kort som lenker til detalj.
- Data vist (felt → kilde): `prisma.location.findMany` (53-60: where active + name in `MARKETING_LOCATIONS`, include facilities active, orderBy name) → anlegg-kort; `MULLIGAN` (const 42-50), `HERO_IMAGES` (const 29-33), `MARKETING_LOCATIONS` (const 38) hardkodet.
- Handlinger: kun read-query (ingen server actions). Klient: ingen. Eksterne kall: ingen.
- Tilstander: empty **delvis** — `locations.map` rendrer ingenting ved 0, men Mulligan-kort vises alltid; per-kort `facilities.length > 0`-guard (195). **error MANGLER**, dedikert empty-state for 0 locations MANGLER, ingen loading-skeleton.
- Komponenter: `CtaLime, CtaOutlineLys` (`@/components/marketing/marketing-sections`); `PulseDot` (`@/components/athletic/pulse-dot`); lokale `SectionEyebrow` (337)/`SectionH2` (345)/`Em` (353).
- Flyt: anlegg-oversikt → `/anlegg/[slug]`; CTA → `/booking`, `/kontakt`.
- AK-domene vist: ingen (anlegg-fokus).
- Designfil-referanse: `Marketing Undersider (moderne).dc.html` (flate-nivå; ingen kommentar i fila).
- Nåværende designkvalitet: **ferdig** (visuelt). Svakhet: ingen tom/error-tilstand for tom Prisma-respons. Token-brudd: lime `rgba(209,248,67,0.25/0.55)`-skygger (135), rå `hsl(168 72% 11%)`-gradient (302). Lokale duplikat-primitiver (drift-tema).
- Redesign-prioritet: **P2** (legg til empty/error)

---

### /playerhq
- Fil: `src/app/(marketing)/playerhq/page.tsx` · Flate: Marketing (lyst) · Rolle/gating: offentlig.
- Jobb: Selge PlayerHQ-appen — funksjoner (mockup), trening, analyse/SG, pris, CTA.
- Data vist (felt → kilde): `TRENING` (const 15-31), `ANALYSE` (const 33-49) hardkodet; app-mockup → `PlayerHQMockup`. Ingen Prisma.
- Handlinger: ingen server actions. Klient: `PlayerHQMockup` (intern). CTA → `/auth/signup`, `/coaching`. Eksterne kall: ingen.
- Tilstander: loading/empty/error — n/a (statisk).
- Komponenter: `PlayerHQMockup` (`@/components/marketing/*`), `PulseDot` (`@/components/athletic/pulse-dot`); **lokale duplikat-primitiver** `SectionEyebrow` (374)/`SectionH2` (382)/`Em` (390)/`PrisCard` (406) + inline-hero (gjenbruker IKKE `MarketingHero`).
- Flyt: app-salg → `/auth/signup` (start gratis); sidegren `/coaching`.
- AK-domene vist: Strokes Gained (OTT/APP/ARG/PUTT), AI-coach, streak/achievements, live-økt/tapper-mode.
- Designfil-referanse: `Marketing Undersider (moderne).dc.html` (flate-nivå; ingen kommentar i fila).
- Nåværende designkvalitet: **halvferdig/inkonsistent** — visuelt bra, men **dupliserer hele hero-blokken + seksjonsprimitivene lokalt** (54-138, 372-491) i stedet for `MarketingHero`/`marketing-sections`. Drift-risiko: hero-animasjons-CSS limt inn på nytt. Token-brudd: lime `rgba(209,248,67,0.25/0.55)`-skygger (124, 354, 483), rå `hsl(168 72% 11%)` (334), `[--primary:164_100%_17.3%]` (483).
- Redesign-prioritet: **P1** (funksjonelt ok, men gjeld + drift mot delt hero)

---

### /booking
- Fil: `src/app/(marketing)/booking/page.tsx` · Flate: Marketing (lyst), booking-funnel inngang, async server-komponent · Rolle/gating: offentlig. Bak `BOOKING_ACTIVE`-flagg (ellers Acuity-fallback).
- Jobb: 3-stegs booking-wizard (lokasjon → coach → tjeneste).
- Data vist (felt → kilde): `prisma.serviceType.findMany` (74-80: where active + priceOre>0, orderBy priceOre, include coach) — kun når `BOOKING_ACTIVE` true; `COACH_BIOS` (const 27-34, keyet på e-post), `LOCATIONS` (const 36-47) hardkodet; env `BOOKING_ACTIVE` (57), `NEXT_PUBLIC_ACUITY_URL` (61, fallback akgolfgroup.as.me).
- Handlinger: ingen server action i fila (booking-submit skjer på `/booking/[slug]`). Klient: steg-navigasjon via searchParams. Eksterne kall: redirect til Acuity hvis flagg av.
- Tilstander: empty «Ingen tjenester tilgjengelig» (342-353); **paused-state** `BookingPaused` ved `!BOOKING_ACTIVE` (70-72); steg-filtrering via searchParams. loading/error-boundary MANGLER.
- Komponenter: `AthleticEyebrow` (`@/components/athletic/eyebrow`); lokale `StegIndikator` (362), `BookingPaused` (410), `SlikFungererDet` (442).
- Flyt: funnel steg 1 → `/booking?lokasjon=…` → `&trener=…` → `/booking/[slug]`.
- AK-domene vist: økt-typer (Pro-time, Trackman, gruppe), coach via `serviceType.coach`, lokasjon GFGK/Mulligan, abonnement vs flex.
- Designfil-referanse: `Flyt - Booking (terminal-lys).dc.html` (flate-nivå; ingen kommentar i fila).
- Nåværende designkvalitet: **ferdig** — ren wizard, responsivt, Tailwind-tokens. Token-brudd minimal: `rgba(209,248,67,0.25)`-skygge i BookingPaused (427). Tekst-piler `→/←`, ikke emoji. Mangler error-boundary.
- Redesign-prioritet: **P2**

---

# Marketing — øvrige offentlige sider · skjermkort (kode-verifisert 2026-06-29)

Informasjons-/innholdssider + juridisk + booking-funnel-resten. Dominerende mønster: statiske const-drevne sider med editorial hero + lokale seksjonsprimitiver. Funn: `/cases` vs `/suksess` duplikat-formål (begge metadata-tittel «Suksesshistorier»), flere foreldreløse ruter, rgba-token-brudd i `cases`/`anlegg/[slug]`/`turneringer/[slug]`.

---

### /treningsfilosofi
- Fil: `src/app/(marketing)/treningsfilosofi/page.tsx` · Flate: Marketing (lyst) · Rolle/gating: offentlig (header-nav «Slik trener vi»).
- Jobb: Forklare metodikken — AK-pyramiden, Strokes Gained, individualisering.
- Data vist: `PYRAMIDE` (5 nivå FYS/TEK/SLAG/SPILL/TURN), `SG` (OTT/APP/ARG/PUTT) — const, hardkodet. Ingen Prisma.
- Handlinger: ingen server actions. CTA → `/booking`, `/coaching`.
- Tilstander: n/a (statisk).
- Komponenter: ingen delte marketing-komponenter — håndkodet m/ Lucide-ikoner + inline tekst-hero.
- Flyt: metodikk-forklaring → `/booking`, `/coaching`.
- AK-domene vist: **tung** — pyramide (FYS→TURN), Strokes Gained-taksonomi, Mac O'Grady-metodikk antydet, TrackMan/PlayerHQ.
- Designfil-referanse: `Marketing Undersider (moderne).dc.html` (flate-nivå).
- Nåværende designkvalitet: **ferdig** — pedagogisk, rent korthierarki. Bevisst egen tekst-hero (ikke `MarketingHero`). Kandidat: gjenbruke `PyramidProgress` fra athletic i stedet for håndkodede rad-kort.
- Redesign-prioritet: **P2**

---

### /om-oss
- Fil: `src/app/(marketing)/om-oss/page.tsx` · Flate: Marketing (lyst) · Rolle/gating: offentlig (header-nav).
- Jobb: Selskapshistorie + verdier (3 manifest-prinsipper) + historikk + org-detaljer.
- Data vist: `MANIFEST` (const, 3), selskapsinfo hardkodet i `Rad`-rader. Ingen Prisma.
- Handlinger: ingen server actions. Lenker → `/booking`, `/coacher`, `/kontakt`.
- Tilstander: n/a (statisk).
- Komponenter: `PulseDot`; lokale `SectionEyebrow`/`SectionH2`/`Em`/`Rad`.
- Flyt: tillit/narrativ → `/booking`, `/coacher`, `/kontakt`.
- AK-domene vist: AK-pyramiden nevnt, data-drevet filosofi.
- Designfil-referanse: `Marketing Undersider (moderne).dc.html` (flate-nivå).
- Nåværende designkvalitet: **ferdig** — narrativt, ren typografi. Dupliserer lokale seksjonsprimitiver (drift-tema).
- Redesign-prioritet: **P3**

---

### /junior
- Fil: `src/app/(marketing)/junior/page.tsx` · Flate: Marketing (lyst) · Rolle/gating: offentlig. **Foreldreløs** i header-nav.
- Jobb: Junior-program — 4 aldersgrupper (U10/U14/U18/Talent), sesongplan-tabell, påmelding.
- Data vist: `GRUPPER` (const, 4), tabellrader + mailto-mal hardkodet. Ingen Prisma.
- Handlinger: ingen server actions. Klient: #pamelding-anker. Eksterne kall: mailto m/ forhåndsutfylt junior-mal (246).
- Tilstander: n/a (statisk).
- Komponenter: `PulseDot`; lokale `SectionEyebrow`/`SectionH2`/`Em`/`GruppeKort`/`GruppeRad`/`Sesongrad`/`InfoRad`.
- Flyt: junior-program → påmelding (mailto) / `/kontakt`.
- AK-domene vist: AK-pyramiden, PlayerHQ-progresjon, WANG Toppidrett.
- Designfil-referanse: `Marketing Undersider (moderne).dc.html` (flate-nivå).
- Nåværende designkvalitet: **ferdig** — god flyt, mailto-mal er fin UX. Lokale primitiver (drift-tema).
- Redesign-prioritet: **P2** (foreldreløs — vurder nav-lenke)

---

### /coacher
- Fil: `src/app/(marketing)/coacher/page.tsx` · Flate: Marketing (lyst), async · Rolle/gating: offentlig (footer).
- Jobb: Vise coach-rosteret (Anders + Markus Røinås Pedersen) med kort + fasiliteter + booking-CTA.
- Data vist (felt → kilde): `FALLBACK_COACHER` (const, 2) beriket med `prisma.user.findMany` (role in COACH/ADMIN) for avatar; `FASILITETER` (const, 2).
- Handlinger: read-query (ingen server actions). CTA → `/booking`, `/kontakt`.
- Tilstander: **error MANGLER** (Prisma-berikelse uten feilfallback, men FALLBACK_COACHER sikrer innhold). Ingen empty (fast 2).
- Komponenter: `MarketingHero, HeroEm, Em, CtaLime, CtaOutlineLys`; lokal `CoachCard`.
- Flyt: roster → `/coacher/[slug]`; CTA → `/booking`, `/kontakt`.
- AK-domene vist: coach-ekspertise-tags (Plan & struktur, Trackman, Mental, Kortspill, Putting, Junior). NB: Markus = ekte coach (ikke demo-spiller).
- Designfil-referanse: `Marketing Undersider (moderne).dc.html` (flate-nivå).
- Nåværende designkvalitet: **ferdig** — gjenbruker `MarketingHero`. Forest-gradient via `hsl(var(--primary))` (token-ok).
- Redesign-prioritet: **P2**

---

### /coacher/[slug]
- Fil: `src/app/(marketing)/coacher/[slug]/page.tsx` · Flate: Marketing (lyst), SSG · Rolle/gating: offentlig (`generateStaticParams`).
- Jobb: Coach-profil — bio, erfaring, spesialiteter, booking/kontakt.
- Data vist: `COACHER` (const, 2: anders, markus, hardkodet); `generateStaticParams` + `generateMetadata`. Ingen Prisma.
- Handlinger: ingen server actions. Eksterne kall: mailto post@akgolf.no.
- Tilstander: `notFound()` hvis slug ukjent. Loading/empty/error — n/a (statisk record).
- Komponenter: ingen delte — håndkodet m/ Lucide (GraduationCap, Trophy, Mail).
- Flyt: fra `/coacher` → profil → `/booking` / mailto.
- AK-domene vist: spesialiteter (Junior-utvikling, Trackman-sertifisert, Mac O'Grady-influence, WANG Toppidrett).
- Designfil-referanse: `Marketing Undersider (moderne).dc.html` (flate-nivå).
- Nåværende designkvalitet: **ferdig** — ingen hex/emoji-brudd, ren profil-layout. Bevisst initial-avatar-header (ikke `MarketingHero`).
- Redesign-prioritet: **P3**

---

### /cases
- Fil: `src/app/(marketing)/cases/page.tsx` · Flate: Marketing (lyst), async · Rolle/gating: offentlig. **Foreldreløs.** Overlapper `/suksess` (samme metadata-tittel «Suksesshistorier»).
- Jobb: Vise 2 suksess-cases + 6 kommende turneringer med forest-hero.
- Data vist (felt → kilde): `CASES` (const 23-44, 2: Marcus R., Sofie L.); `hentKommendeTurneringer` → `prisma.tournament.findMany` (79: gte i dag / lte +90d, status UPCOMING|IN_PROGRESS, take 6); `TAG_TONE` (56), `MND` (62) const.
- Handlinger: read-query (ingen server actions). CTA → `/booking`.
- Tilstander: empty turneringer → dashed-border-melding m/ lenke `/turneringer` (149-157). notFound/error: MANGLER.
- Komponenter: ingen delte (Link + Lucide TrendingDown/ArrowRight).
- Flyt: cases-vitnesbyrd → `/booking`; turneringer-liste statisk.
- AK-domene vist: HCP-forbedring, data-drevet coaching, tier antydet.
- Designfil-referanse: `Marketing Rester (moderne).dc.html` (flate-nivå).
- Nåværende designkvalitet: **inkonsistent** — **hardkodet hex `#0a1f17`** (111, 241) + `rgba(209,248,67,0.18)` (198); **duplisert formål med /suksess**. NB: case-navn Marcus R./Sofie L. er testimonials (ikke demo-kanon), men «Markus»-navn er flagget «skal bort» i CLAUDE.md.
- Redesign-prioritet: **P1** (duplikat-rute + hardkodet hex)

---

### /suksess
- Fil: `src/app/(marketing)/suksess/page.tsx` · Flate: Marketing (lyst), synkron · Rolle/gating: offentlig. **Foreldreløs.** Overlapper `/cases`.
- Jobb: 3 detaljerte suksess-cases m/ testimonials og HCP-progresjon.
- Data vist: `CASES` (const 21-52, 3: Lars H., Emma S., Geir T.). Ingen Prisma.
- Handlinger: ingen server actions. Lenker → `/coaching`, `/kontakt`.
- Tilstander: ingen (notFound/empty/error alle fraværende).
- Komponenter: ingen delte (Lucide TrendingDown/ArrowRight/Quote + Link).
- Flyt: vitnesbyrd → `/coaching`, `/kontakt`.
- AK-domene vist: HCP-progresjon (28→16, 18→6, 22→14), spiller-roller.
- Designfil-referanse: `Marketing Rester (moderne).dc.html` (flate-nivå).
- Nåværende designkvalitet: **ferdig** (token-basert, ingen hex-brudd i motsetning til /cases). Men **duplikat-formål med /cases** — samme metadata-tittel «Suksesshistorier». IA-avklaring: hvilken er kanonisk?
- Redesign-prioritet: **P1** (konsolidering /cases vs /suksess)

---

### /turneringer
- Fil: `src/app/(marketing)/turneringer/page.tsx` · Flate: Marketing (lyst), datadrevet · Rolle/gating: offentlig. Bevisst utenfor v1-nav (`marketing-header.tsx:5`).
- Jobb: Filtrerbar turneringskalender for norske spillere på tvers av tourer, auto-synket daglig.
- Data vist (felt → kilde): `hentTurneringer` → `prisma.tournament.findMany` (162: 60-dagers vindu, status UPCOMING/IN_PROGRESS, take 48, m/ `_count`); `hentNorskeDenneUka` → `prisma.publicPlayerEntry.findMany` (194, take 30); `hentCounts` → 4× `prisma.tournament.count` (236-252). `revalidate = 1800` (21).
- Handlinger: read-queries. Klient: tab-nav via searchParams; live-badge puls på IN_PROGRESS.
- Tilstander: empty → `TomTilstand` ved 0 turneringer (92-93, 348). loading/error MANGLER.
- Komponenter: `NorskeDenneUkaWidget`, `MersalgBanner`, `TurneringKort` (`@/components/turneringer/*`); `AthleticEyebrow`.
- Flyt: kalender → tab `?tab=…` → kort → `/turneringer/[slug]`; mersalg → PlayerHQ.
- AK-domene vist: tour (pga/euro/kft/champ/lpga/let/amateur-no/junior-no), tier, norske spillere.
- Designfil-referanse: `Flyt - Turneringsresultater (terminal-lys).dc.html` (nærmeste; terminal-lys, ikke marketing-moderne).
- Nåværende designkvalitet: **ferdig** — profesjonell kalender, men bruker `var(--s-*)` stats-tokens (eget spor) via `stats.css`, ikke marketing-tokens. Hører delvis til stats-uttrykket.
- Redesign-prioritet: **P2** (avklar token-spor: marketing vs stats)

---

### /turneringer/[slug]
- Fil: `src/app/(marketing)/turneringer/[slug]/page.tsx` · Flate: Marketing (lyst), datadrevet/live · Rolle/gating: offentlig, dynamisk.
- Jobb: Turneringsdetalj m/ live leaderboard, norske highlights, KPI-strip, status-badges.
- Data vist (felt → kilde): `generateMetadata` → `prisma.tournament.findUnique` (60); side → `prisma.tournament.findUnique` m/ publicEntries + leaderboardSnap (78); runder fra `PublicPlayerEntry.rounds` JSON (zod `RoundsSchema` 40, defensiv parsing per gotchas); beregnet KPI. `revalidate = 120` (37). JSON-LD SportsEvent.
- Handlinger: read-query. Klient: `LiveRefresher` poller ved live. Eksterne kall: `officialUrl`.
- Tilstander: `notFound()` (101); `redirect()` til kanonisk ved `mergedIntoId` (103); empty-melding ved 0 entries (635-649); live-kolonner betinget av `erLive`.
- Komponenter: `FlagGlyph, Reveal, CountUp, StatsEyebrow` (`@/components/stats/*`); `MersalgBanner, LiveRefresher` (`@/components/turneringer/*`). Importerer `stats.css` (15).
- Flyt: fra `/turneringer` → detalj → ekstern offisiell URL; mersalg → PlayerHQ.
- AK-domene vist: tier (formaterTier), scoreToPar, status, country-filter.
- Designfil-referanse: `Flyt - Turneringsresultater (terminal-lys).dc.html` (flate-nivå; JSDoc «design 28», ingen .dc.html i fila).
- Nåværende designkvalitet: **ferdig** — avansert (live-refresh, CountUp, tie-logikk, zod-parsing). **Hardkodet rgba** `rgba(0,88,64,0.3/0.05)` (303-304), `rgba(209,248,67,0.10/0.06)` (393, 558) — token-migrering. Stats-token-spor.
- Redesign-prioritet: **P2**

---

### /blogg
- Fil: `src/app/(marketing)/blogg/page.tsx` · Flate: Marketing (lyst) · Rolle/gating: offentlig. **Foreldreløs** i header-nav.
- Jobb: Bloggoversikt — alle innlegg sortert på dato + søk.
- Data vist: `POSTS` (import `./posts`, hardkodet) + `META`-record per-slug. Ingen Prisma.
- Handlinger: ingen server actions. Klient: søk GET-form → `/blogg?q=`.
- Tilstander: n/a (statisk). Søk-resultathåndtering i child `BloggListe`.
- Komponenter: `BloggListe` (lokal `./blogg-liste`).
- Flyt: oversikt → `/blogg/[slug]`; søk → `/blogg?q=`.
- AK-domene vist: ingen.
- Designfil-referanse: `Marketing Rester (moderne).dc.html` (flate-nivå; ingen dedikert prototype).
- Nåværende designkvalitet: **ferdig** men tynt — hardkodet POSTS+META i to filer (sync-risiko).
- Redesign-prioritet: **P3**

---

### /blogg/[slug]
- Fil: `src/app/(marketing)/blogg/[slug]/page.tsx` · Flate: Marketing (lyst), SSG · Rolle/gating: offentlig (`generateStaticParams`).
- Jobb: Enkelt blogginnlegg — hero-bilde, metadata, innhold, tilbake-lenke.
- Data vist: `POSTS` (hardkodet `../posts`); `generateStaticParams` + `generateMetadata`. Ingen Prisma.
- Handlinger: ingen server actions. Back → `/blogg`.
- Tilstander: `notFound()` hvis ukjent.
- Komponenter: ingen (next `Image`/`Link` + Lucide).
- Flyt: fra `/blogg` → artikkel → tilbake.
- AK-domene vist: ingen.
- Designfil-referanse: `Marketing Rester (moderne).dc.html` (flate-nivå).
- Nåværende designkvalitet: **ferdig** — ren artikkel-layout.
- Redesign-prioritet: **P3**

---

### /faq
- Fil: `src/app/(marketing)/faq/page.tsx` · Flate: Marketing (lyst) · Rolle/gating: offentlig. **Foreldreløs** i header-nav.
- Jobb: FAQ-akkordeon per kategori (Coaching/Booking/PlayerHQ/Praktisk) + e-post-CTA.
- Data vist: `FAQ` (const, 4 kategorier, hardkodet). Ingen Prisma.
- Handlinger: ingen server actions. Klient: native `<details>` åpne/lukke. Eksterne kall: mailto post@akgolf.no.
- Tilstander: native `<details>` ekspander; n/a forøvrig.
- Komponenter: ingen delte (Lucide ChevronDown/Mail + Link).
- Flyt: FAQ → mailto / `/kontakt`.
- AK-domene vist: coaching-pakker, PlayerHQ, anlegg, utstyr.
- Designfil-referanse: `Marketing Undersider (moderne).dc.html` (flate-nivå).
- Nåværende designkvalitet: **ferdig** — ren akkordeon, forest-gradient via tokens. Overlapper FAQ-seksjoner på `/priser` og `/kontakt` (innholds-duplisering).
- Redesign-prioritet: **P3**

---

### /kontakt
- Fil: `src/app/(marketing)/kontakt/page.tsx` · Flate: Marketing (lyst) · Rolle/gating: offentlig (footer).
- Jobb: Kontakt-hub — skjema, telefon/e-post, åpningstider, 3 lokasjonskort, FAQ, CTA.
- Data vist: `HOURS` (7 dager), `FAQ` (4) const, hardkodet. Ingen Prisma.
- Handlinger: `KontaktForm` (lokal `./form`, client) — skjema-submit (write i form-handler). Eksterne kall: `tel:+4748216540`, mailto post@akgolf.no, Google Maps.
- Tilstander: skjema-tilstander i `KontaktForm` (client, ikke verifisert i page). Side ellers statisk.
- Komponenter: `KontaktForm` (`./form`); Lucide-ikoner.
- Flyt: kontakt-hub → skjema / telefon / `/booking`.
- AK-domene vist: coaching- vs anleggs-åpningstider, 3 fysiske lokasjoner, bedriftshenvendelser.
- Designfil-referanse: `Marketing Undersider (moderne).dc.html` (flate-nivå).
- Nåværende designkvalitet: **ferdig** — grundig hub, forest-gradient via tokens. Mange seksjoner — kandidat for å trimme FAQ-duplisering mot `/faq`.
- Redesign-prioritet: **P2**

---

### /jobb
- Fil: `src/app/(marketing)/jobb/page.tsx` · Flate: Marketing (lyst) · Rolle/gating: offentlig (footer «Karriere»).
- Jobb: Stillingsutlysninger + verdier + spontansøknad-CTA.
- Data vist: `STILLINGER` (const, 2, hardkodet). Ingen Prisma.
- Handlinger: ingen server actions. Eksterne kall: mailto m/ subject (søk + spontan).
- Tilstander: ingen (n/a — fast 2, ingen empty hvis listen tømmes).
- Komponenter: ingen delte (Lucide + Link); lokal `StillingsKort`.
- Flyt: karriere → mailto-søknad.
- AK-domene vist: data-drevet coaching (Trackman/PlayerHQ/SG).
- Designfil-referanse: `Marketing og Stats STUB-sider komplett (moderne).dc.html` (flate-nivå).
- Nåværende designkvalitet: **ferdig** men tynt (stub-aktig). Bør ha empty-state hvis STILLINGER tømmes.
- Redesign-prioritet: **P3**

---

### /anlegg/[slug]
- Fil: `src/app/(marketing)/anlegg/[slug]/page.tsx` · Flate: Marketing (lyst), dynamisk · Rolle/gating: offentlig.
- Jobb: Detaljside per anlegg — hero, highlights, galleri, kontakt, tre veier inn (greenfee/medlemskap/klubb).
- Data vist: `ANLEGG_DATA` (const-record 53-161, KUN 2: miklagard-golfklubb, gamle-fredrikstad-gk — adresse/telefon/e-post/priser/bilder hardkodet); `generateMetadata` + side leser slug. **Ingen Prisma** (tross async).
- Handlinger: ingen server actions. Eksterne kall: klubb-/greenfee-/medlemskap-lenker, `tel:`, `/booking`, `/anlegg`.
- Tilstander: `notFound()` hvis slug ukjent (i både `generateMetadata` 172 og side 188). Loading/empty/error — n/a (statisk record).
- Komponenter: ingen delte — håndkodet m/ Lucide-ikoner.
- Flyt: fra `/anlegg` → detalj → eksterne klubb-lenker / `/booking`.
- AK-domene vist: ingen.
- Designfil-referanse: `Marketing Undersider (moderne).dc.html` (flate-nivå).
- Nåværende designkvalitet: **ferdig** men med **hardkodet rgba** — `rgba(0,40,28,0.10/0.20/0.85)` (236), `rgba(0,40,28,0.55)` (311), `rgba(209,248,67,0.14)` (448), `rgba(209,248,67,0.35)` (478), `rgba(10,31,23,0.18)` (248) — bør bli tokens. Innhold kun for 2 av 3 anlegg (Mulligan mangler slug-side).
- Redesign-prioritet: **P2** (token-migrering av rgba)

---

### /booking/[slug]
- Fil: `src/app/(marketing)/booking/[slug]/page.tsx` · Flate: Marketing (lyst), booking-funnel, dynamisk · Rolle/gating: offentlig, bak `BOOKING_ACTIVE`.
- Jobb: Tjeneste-detalj — ledige tider (14-dagers dato-velger + slot-grid).
- Data vist (felt → kilde): `prisma.serviceType.findUnique` (slug, 44); `getAvailableSlots` (`@/lib/booking/availability`); 14-dagers range; `generateMetadata`.
- Handlinger: read-query + availability. Klient: `SlotPicker` → slot-valg. Eksterne kall: ingen.
- Tilstander: empty «Ingen ledige tider denne dagen» (155); `notFound()` hvis ukjent/inaktiv; redirect hvis flagg av.
- Komponenter: `SlotPicker` (lokal `./slot-picker`, client).
- Flyt: funnel steg → dato `?dato=…` → slot → `/booking/[slug]/bekreft`.
- AK-domene vist: ServiceType (navn/pris/varighet), coach via `coachUserId`, slot start/end ISO.
- Designfil-referanse: `Flyt - Booking (terminal-lys).dc.html` (flate-nivå).
- Nåværende designkvalitet: **ferdig** — to-trinns-flyt ren, tokens-basert.
- Redesign-prioritet: **P2**

---

### /booking/[slug]/bekreft
- Fil: `src/app/(marketing)/booking/[slug]/bekreft/page.tsx` · Flate: Marketing (lyst), booking-funnel, dynamisk + searchParams (start, coach) · Rolle/gating: offentlig.
- Jobb: Bekreftelsesside — vise øktdetaljer + betalingsskjema før Stripe-redirect.
- Data vist (felt → kilde): `prisma.serviceType.findUnique` (slug); `prisma.user.findUnique` (id=coach); `getCurrentUser`; searchParams start/coach; tid formatert nb-NO/Europe/Oslo.
- Handlinger: `BekreftForm` (lokal `./bekreft-form`, client) → opprett booking + Stripe-redirect.
- Tilstander: `notFound()` hvis start/coach mangler (16) eller tjeneste ukjent (19) eller ugyldig dato (22). **Ingen `metadata`-eksport.** Skjema-tilstander i `BekreftForm`.
- Komponenter: `BekreftForm` (lokal `./bekreft-form`, client).
- Flyt: fra `/booking/[slug]` → bekreft → Stripe → kvittering.
- AK-domene vist: booking (tjeneste/coach/start/pris), Stripe-flyt.
- Designfil-referanse: `Flyt - Booking (terminal-lys).dc.html` (flate-nivå).
- Nåværende designkvalitet: **ferdig** — klar oppsummering. Mangler `metadata`-eksport (mindre SEO-gap, intern flyt).
- Redesign-prioritet: **P3**

---

### /booking/kvittering/[bookingId]
- Fil: `src/app/(marketing)/booking/kvittering/[bookingId]/page.tsx` · Flate: Marketing (lyst), booking-funnel slutt, dynamisk · Rolle/gating: offentlig, `robots: noindex` (10).
- Jobb: Kvittering — bekreft betaling, vis detaljer, tilby signup (gjest) eller «Mine bestillinger» (innlogget).
- Data vist (felt → kilde): `prisma.booking.findUnique` (20, include serviceType+location); `getCurrentUser` (32); status `CONFIRMED` vs pending.
- Handlinger: ingen server action (les). Klient: `PendingRefresh` (poller ved ikke-CONFIRMED). Eksterne kall: ingen.
- Tilstander: `notFound()` hvis booking mangler (28); to UI-tilstander (CONFIRMED success / pending); gjest-vs-innlogget forgrening.
- Komponenter: `PendingRefresh` (lokal `./pending-refresh`, client).
- Flyt: funnel-slutt → `/portal/meg/bookinger` (innlogget) / `/auth/signup?epost=` (gjest) / «Book en til».
- AK-domene vist: booking-status, gjest→konto-funnel.
- Designfil-referanse: `Flyt - Booking (terminal-lys).dc.html` (flate-nivå).
- Nåværende designkvalitet: **ferdig** — ren kvittering, gode success/pending-tilstander.
- Redesign-prioritet: **P3**

---

### /personvern
- Fil: `src/app/(marketing)/personvern/page.tsx` · Flate: Marketing (lyst), juridisk · Rolle/gating: offentlig (footer).
- Jobb: Personvernerklæring (GDPR, 9 nummererte seksjoner).
- Data vist: alt hardkodet; `SIST_OPPDATERT = "12. mai 2026"`. Ingen Prisma.
- Handlinger: ingen server actions. Eksterne kall: mailto personvern@akgolf.no, ekstern datatilsynet.no.
- Tilstander: n/a.
- Komponenter: lokal `Section`.
- Flyt: juridisk fotnote-side (fra footer).
- AK-domene vist: databehandlere (Supabase/Vercel/Stripe/Resend/Anthropic/Sentry), WANG nevnt.
- Designfil-referanse: `Marketing og Stats STUB-sider komplett (moderne).dc.html` (flate-nivå).
- Nåværende designkvalitet: **ferdig** (for juridisk) — «Utkast»-vannmerke prominent (skal godkjennes med advokat før Q3 2026).
- Redesign-prioritet: **P3**

---

### /vilkar
- Fil: `src/app/(marketing)/vilkar/page.tsx` · Flate: Marketing (lyst), juridisk · Rolle/gating: offentlig (footer).
- Jobb: Brukervilkår (10 seksjoner).
- Data vist: hardkodet; `SIST_OPPDATERT`; `className="prose-akgolf"`. Ingen Prisma.
- Handlinger: ingen server actions. Lenker → `/personvern`, mailto support@akgolf.no.
- Tilstander: n/a.
- Komponenter: lokal `Section`.
- Flyt: juridisk fotnote-side (fra footer).
- AK-domene vist: PlayerHQ/AgencyOS/AI-coach, gratis/300-tier, 24t-refusjon, Claude-disclaimer.
- Designfil-referanse: `Marketing og Stats STUB-sider komplett (moderne).dc.html` (flate-nivå).
- Nåværende designkvalitet: **ferdig** (juridisk). «Utkast»-vannmerke.
- Redesign-prioritet: **P3**

---

### /cookies
- Fil: `src/app/(marketing)/cookies/page.tsx` · Flate: Marketing (lyst), juridisk · Rolle/gating: offentlig (footer).
- Jobb: Cookie-policy (5 seksjoner, 4 kategorier).
- Data vist: hardkodet; `SIST_OPPDATERT`. Ingen Prisma.
- Handlinger: ingen server actions. Eksterne kall: mailto personvern@akgolf.no.
- Tilstander: n/a.
- Komponenter: lokal `Section`.
- Flyt: juridisk fotnote-side (fra footer).
- AK-domene vist: PlayerHQ-panel-state, Plausible (cookie-fri, ingen Google Analytics), tema lys/mørk.
- Designfil-referanse: `Marketing og Stats STUB-sider komplett (moderne).dc.html` (flate-nivå).
- Nåværende designkvalitet: **ferdig** (juridisk) — ærlig om analytics.
- Redesign-prioritet: **P3**

---

# Marketing /stats — EGET DESIGNSPOR (kode-verifisert 2026-06-29)

~42 ruter under `src/app/(marketing)/stats/`. **Eget designspor, ikke athletic.** Bygget på et scoped designsystem: `stats.css` + `--s-*`-tokens (`src/app/(marketing)/stats/stats.css:9-32`, duplikat-aliaser av globals.css-hex på `:root` — bg `#FAFAF7`, fg `#0A1F17`, primary `#005840`, accent `#D1F843`) + eget komponentbibliotek `src/components/stats/` (28 komponenter) — IKKE `src/components/athletic/`. Dominerende mønster: server-komponenter med ISR, ekte Prisma-data, pixel-perfekt portet fra arkivert `design-handoff-stats-2026-05-25`-bundel, egne prototyper «Stats-plattform (eget spor)».

**Tre strukturfunn:** (1) **Ingen `stats/layout.tsx`** (verifisert: `find … -name layout.tsx` → tomt) → ingen delt stats-shell/nav, hver side importerer `stats.css` enkeltvis. Stats arver kun `(marketing)/layout.tsx`. (2) **Foreldreløs fra marketing-nav** — header ekskluderer Stats fra v1 (`marketing-header.tsx:5` «ikke med i v1»); ingen `/stats`-href i header/footer. (3) **`StatsCmdK`** (`src/components/stats/stats-cmd-k.tsx`, den tiltenkte globale Cmd+K-nav-en med hardkodet `NAV_SIDER`) er bygget men **ikke wiret inn noe sted** (grep i stats-mappa: 0 treff). Redesign-beslutning: (a) egen `stats/layout.tsx` med stats-shell + montert Cmd+K, og (b) når/hvordan stats kobles inn i marketing-header etter launch.

---

### /stats
- Fil: `src/app/(marketing)/stats/page.tsx`
- Flate: Marketing/Stats (egen flate, marketing-chrome) · Rolle/gating: offentlig, ingen auth.
- Jobb: hub-landingsside som introduserer alle stats-moduler + mersalg til PlayerHQ.
- Data vist (felt → kilde): norske i aksjon denne uka (`prisma.publicPlayerEntry.count`), kommende turneringer 30 d (`prisma.tournament.count`), siste DataGolf-sync (`prisma.tournament.findFirst`). NB: hero-side-tall (1175 turneringer, 1299 PGA, 2497 norske) er **hardkodet** i JSX (`page.tsx:194-205`), ikke live.
- Komponenter: stats-lokale — `StatsIcon, FlagGlyph, StatsEyebrow, Reveal, CountUp, StatsBtn, SparkBars, MiniRadar` (alle `src/components/stats/`).
- Tilstander: empty delvis (norskeIAksjon>0-sjekk). loading/error: MANGLER (ISR server-render).
- Flyt: hub → `/turneringer`, `/stats/pga`, `/stats/spillere`, `/stats/sg-sammenlign`; mersalg → `/portal`, `/priser`.
- AK-domene vist: SG (4 akser via MiniRadar), PlayerHQ-mersalg, 300 kr/mnd-pris.
- Designfil-referanse: `Stats-plattform (eget spor).dc.html` + `Final_AK_Golf_HQ/Stats-plattform (moderne).dc.html`; header-kommentar arkivert `design-handoff-stats-2026-05-25/js/hub.jsx`.
- Nåværende designkvalitet: ferdig — hardkodede hero-tall er datagjeld; mersalg «300 kr/mnd · gratis under beta» bør sjekkes mot BUSINESS-RULES.
- Redesign-prioritet: P1

### /stats/norske
- Fil: `src/app/(marketing)/stats/norske/page.tsx` · Flate: Marketing/Stats · Rolle/gating: offentlig.
- Jobb: liste alle norske spillere i aksjon (pågående/innen 7 d), gruppert per turnering.
- Data vist: `prisma.publicPlayerEntry.findMany` (country NO, aktive/snart). ISR 1800 s.
- Komponenter: stats.css + lucide (`ChevronLeft, Flag, Calendar, MapPin, ExternalLink, Users`).
- AK-domene vist: leaderboard-posisjoner, tour-tilhørighet.
- Designfil-referanse: del av Stats-plattform-sporet.
- Nåværende designkvalitet: ferdig. Redesign-prioritet: P2

### /stats/leaderboards
- Fil: `src/app/(marketing)/stats/leaderboards/page.tsx` (+ `leaderboards-client.tsx`) · Flate: Marketing/Stats · Rolle/gating: offentlig.
- Jobb: tverrkategori topp-10-aggregat (PGA, Korn Ferry, Euro, Norske, Klubber, Kuriositeter).
- Data vist: `prisma.pgaPlayerSeason.findMany` + `prisma.publicPlayer.findMany`. ISR 1t.
- Komponenter: `StatsLeaderboardCard, StatsEyebrow, Reveal, StatsBtn` + lokal `LeaderboardsSearchBox, LeaderboardsKategoriStrip`.
- Layout: hero + inline søk → sticky kategori-strip → 6 PGA-leaderboards → Korn Ferry+Euro → norske → klubber → kuriositets-kort → mersalg.
- AK-domene vist: SG, scoring-snitt, drive distance per leaderboard.
- Designfil-referanse: header arkiv `pages-c.jsx#Leaderboards`.
- Nåværende designkvalitet: ferdig (rik). Redesign-prioritet: P1

### /stats/spillere
- Fil: `src/app/(marketing)/stats/spillere/page.tsx` (+ egen `spillere.css`) · Flate: Marketing/Stats · Rolle/gating: offentlig.
- Jobb: FotMob-aktig norsk spillerdatabase med søk, filterpills, kort-grid vs tabell.
- Data vist: `prisma.publicPlayer.count/findMany` (country NO, aktive), `tournament.count`, `publicPlayerEntry.count`, topp-20. GET-søk via searchParams. ISR 1t.
- Komponenter: stats.css + spillere.css; spiller-rad/avatar fra `src/components/stats/`.
- Tilstander: søk/filter via URL; empty ved 0 treff (verifiser i underkomponent).
- AK-domene vist: kategori, klubb, HCP. Redesign-prioritet: P1

### /stats/spillere/[slug]
- Fil: `src/app/(marketing)/stats/spillere/[slug]/page.tsx` · Flate: Marketing/Stats (dynamisk profil) · Rolle/gating: offentlig; `notFound()` ved ukjent slug.
- Jobb: enkelt norsk spiller-profil (statistikk, resultater, trend).
- Data vist: `prisma.publicPlayer.findUnique` (m/ entries). ISR 1t. `generateStaticParams`.
- Komponenter: stats-bibliotek (radar/trend/tabs).
- AK-domene vist: SG-profil, resultater, kategori. Redesign-prioritet: P2

### /stats/pga
- Fil: `src/app/(marketing)/stats/pga/page.tsx` (+ egen `pga.css`) · Flate: Marketing/Stats · Rolle/gating: offentlig.
- Jobb: PGA Tour Stats-hub — inngang til 6 kategorier (drive, fairway, GIR, putts, scoring, SG).
- Data vist: `getPgaTopN` + `getPgaTourAverage` (`src/lib/stats/pga-sync.ts`, kilde PgaPlayerSeason synket fra DataGolf). ISR 1t.
- Komponenter: `StatsIcon, FlagGlyph, StatsEyebrow, Reveal, CountUp, SparkBars, StatsBtn, PuttPreview`.
- AK-domene vist: 6 PGA-statkategorier, Tour-snitt.
- Designfil-referanse: header arkiv `pga.jsx, components.jsx`. Redesign-prioritet: P1

### /stats/pga/drive-distance
- Fil: `src/app/(marketing)/stats/pga/drive-distance/page.tsx` (+ `explorer.tsx`) · Flate: Marketing/Stats — PGA kategori-detalj (design 03) · Rolle/gating: offentlig.
- Jobb: dypdykk i én PGA-kategori med interaktiv percentile-slider + topp-20 + histogram.
- Data vist: `getPgaTopN` + `getPgaTourAverage`. ISR 1t.
- Komponenter: delt `PgaKategoriDetaljPage` (`src/components/stats/pga-kategori-page.tsx`) + lokal `explorer.tsx`. Importerer `pga.css` + `_shared/kategori.css`.
- AK-domene vist: kategori-percentile, Tour-snitt.
- Designfil-referanse: header arkiv «design 03».
- Nåværende designkvalitet: ferdig — del av konsistent kategori-familie (6 ruter deler `PgaKategoriDetaljPage`). Redesign-prioritet: P2

### /stats/pga/fairway-pct
- Fil: `src/app/(marketing)/stats/pga/fairway-pct/page.tsx` (+ `explorer.tsx`) · PGA kategori-detalj, identisk familie-mønster (delt `PgaKategoriDetaljPage`, `getPgaTopN`/`getPgaTourAverage`, ISR 1t, offentlig). Redesign-prioritet: P2

### /stats/pga/gir-pct
- Fil: `src/app/(marketing)/stats/pga/gir-pct/page.tsx` (+ `explorer.tsx`) · PGA kategori-detalj, familie-mønster. Offentlig, ISR 1t. Redesign-prioritet: P2

### /stats/pga/putts-per-round
- Fil: `src/app/(marketing)/stats/pga/putts-per-round/page.tsx` (+ `explorer.tsx`) · PGA kategori-detalj, familie-mønster. Offentlig, ISR 1t. Redesign-prioritet: P2

### /stats/pga/scoring-avg
- Fil: `src/app/(marketing)/stats/pga/scoring-avg/page.tsx` (+ `explorer.tsx`) · PGA kategori-detalj, familie-mønster. Offentlig, ISR 1t. Redesign-prioritet: P2

### /stats/pga/sg-total
- Fil: `src/app/(marketing)/stats/pga/sg-total/page.tsx` (+ `explorer.tsx`) · PGA kategori-detalj, familie-mønster. AK-domene: SG total. Offentlig, ISR 1t. Redesign-prioritet: P2

### /stats/pga/putt-explorer
- Fil: `src/app/(marketing)/stats/pga/putt-explorer/page.tsx` (+ `explorer.tsx`) · Flate: Marketing/Stats — putting-dypdykk · Rolle/gating: offentlig.
- Jobb: utforsk make-% per putt-distanse på PGA Tour.
- Data vist: `prisma.pgaPuttDistance.findMany`. ISR 1t.
- Komponenter: lokal `explorer.tsx` + stats-bibliotek.
- AK-domene vist: putt-make-% per distanse. Redesign-prioritet: P2

### /stats/pga/spillere
- Fil: `src/app/(marketing)/stats/pga/spillere/page.tsx` (+ `spiller-tabell.tsx`) · Flate: Marketing/Stats — PGA spillerliste · Rolle/gating: offentlig.
- Jobb: søkbar/filtrerbar liste over PGA/Euro/Korn Ferry-spillere.
- Data vist: `prisma.pgaPlayerSeason.count/findMany` (tour pga/euro/…, år CURRENT_YEAR). ISR 1t.
- Komponenter: lokal `spiller-tabell.tsx`.
- AK-domene vist: tour, SG/statkategorier per spiller. Redesign-prioritet: P2

### /stats/pga/spillere/[dg_id]
- Fil: `src/app/(marketing)/stats/pga/spillere/[dg_id]/page.tsx` · Flate: Marketing/Stats — PGA spiller-profil (dynamisk) · Rolle/gating: offentlig; `notFound()` ved isNaN/ukjent id.
- Jobb: profil for én DataGolf-spiller (sesongstatistikk).
- Data vist: `prisma.pgaPlayerSeason.findFirst` (dg_id). ISR 1t. `generateStaticParams`.
- AK-domene vist: full PGA-statlinje, SG-splitt. Redesign-prioritet: P2

### /stats/sg-sammenlign
- Fil: `src/app/(marketing)/stats/sg-sammenlign/page.tsx` · Flate: Marketing/Stats — landingsside (design 07) · Rolle/gating: offentlig; `getCurrentUser()` for personalisering/CTA (verktøyet selv krever konto).
- Jobb: selg «sammenlign din SG med Rory» — forklaring + FAQ + mersalg + CTA inn i flyten.
- Data vist: bruker-status fra `getCurrentUser`. ISR 1t.
- Komponenter: lucide-ikoner + stats.css.
- Layout: BIG italic lime hero → 3-stegs forklaring → SG-intro-kort → FAQ → mersalg → CTA.
- AK-domene vist: 4 SG-akser.
- Designfil-referanse: header arkiv «design 07». Redesign-prioritet: P1

### /stats/sg-sammenlign/start
- Fil: `src/app/(marketing)/stats/sg-sammenlign/start/page.tsx` (+ `skjema.tsx`) · Flate: Marketing/Stats — SG-input-skjema · Rolle/gating: krever konto (`getCurrentUser()`; `force-dynamic`).
- Jobb: la bruker legge inn egne SG-tall og velge referansespiller.
- Data vist: `prisma.pgaPlayerSeason.findMany` (referansespillere). Dynamisk.
- Komponenter: lokal `skjema.tsx`.
- Tilstander: trolig auth-redirect ved manglende bruker (verifiser i skjema).
- AK-domene vist: SG-input (4 akser), referanse-proff. Redesign-prioritet: P1

### /stats/sg-sammenlign/resultat/[id]
- Fil: `src/app/(marketing)/stats/sg-sammenlign/resultat/[id]/page.tsx` (+ `result-view.tsx`) · Flate: Marketing/Stats — SG-resultat (delbar) · Rolle/gating: `getCurrentUser()`; `notFound()` hvis sammenligning mangler; `force-dynamic`.
- Jobb: vis lagret SG-sammenligning mot valgt proff (radar + tall), delbar lenke.
- Data vist: `prisma.brukerSammenligning.findFirst` + `prisma.pgaPlayerSeason.findFirst` (ref). Dynamisk.
- Komponenter: lokal `result-view.tsx`.
- AK-domene vist: SG-gap per akse vs proff. Redesign-prioritet: P1

### /stats/sammenlign-spillere
- Fil: `src/app/(marketing)/stats/sammenlign-spillere/page.tsx` (+ `resultat.tsx`, `spiller-sok.tsx`) · Flate: Marketing/Stats — head-to-head 2 norske (design 10) · Rolle/gating: offentlig; `force-dynamic`.
- Jobb: sammenlign to norske spillere side-om-side (søk-modus → resultat-modus via ?a&b).
- Data vist: `prisma.publicPlayer.findUnique` ×2 + topp-spillere-liste. Dynamisk.
- Komponenter: lokale `resultat.tsx`, `spiller-sok.tsx`.
- Layout: ingen params → 2-kol søk m/ VS-glyph; begge params → sticky bar + KPI + linjegraf + beste resultater.
- AK-domene vist: resultater, trend, beste plasseringer. Redesign-prioritet: P2

### /stats/aargang
- Fil: `src/app/(marketing)/stats/aargang/page.tsx` · Flate: Marketing/Stats — kohort-explorer index · Rolle/gating: offentlig.
- Jobb: visuell tidslinje 2000–2012, klikk → årskull.
- Data vist: `prisma.publicPlayer`-aggregering (counts per fødselsår). ISR 1t.
- Komponenter: `StatsEyebrow, Reveal, StatsBtn`.
- AK-domene vist: kohort/årskull. Redesign-prioritet: P3

### /stats/aargang/[aar]
- Fil: `src/app/(marketing)/stats/aargang/[aar]/page.tsx` · Flate: Marketing/Stats — årskull-detalj (dynamisk) · Rolle/gating: offentlig; `notFound()` ved tomt/ugyldig år.
- Jobb: vis alle spillere i ett fødselsår + sammenligning.
- Data vist: `prisma.publicPlayer`-query per år. ISR 1t. `generateStaticParams`. Redesign-prioritet: P3

### /stats/regions
- Fil: `src/app/(marketing)/stats/regions/page.tsx` (+ `norgeskart-wrapper.tsx`, `region-cards.tsx`) · Flate: Marketing/Stats — region-explorer (design 25) · Rolle/gating: offentlig.
- Jobb: golf-Norge per region via interaktivt Norgeskart.
- Data vist: `prisma.publicPlayer.count`, `tournament.count`, `bane`-count (alle `.catch(()=>0)`-defensive). ISR 1t.
- Komponenter: `StatsNorgeskart` (via wrapper), `region-cards.tsx`, `CountUp, StatsEyebrow, Reveal`.
- AK-domene vist: regional spiller-/bane-/turnerings-tetthet. Redesign-prioritet: P2

### /stats/regions/[slug]
- Fil: `src/app/(marketing)/stats/regions/[slug]/page.tsx` · Flate: Marketing/Stats — region-detalj (dynamisk) · Rolle/gating: offentlig; `notFound()` ved ukjent region.
- Jobb: dypdykk i én region (baner, spillere, kommende turneringer).
- Data vist: `prisma.bane.findMany`, `prisma.tournament.findMany` (kommende). ISR 1t. `generateStaticParams`. Redesign-prioritet: P3

### /stats/baner
- Fil: `src/app/(marketing)/stats/baner/page.tsx` (+ egen `baner.css`) · Flate: Marketing/Stats — banedatabase (design 13) · Rolle/gating: offentlig.
- Jobb: søkbar oversikt over norske golfbaner.
- Data vist: `src/lib/stats/bane-queries.ts` (Prisma). ISR 1t.
- Komponenter: baner.css + stats.css.
- AK-domene vist: bane-metadata. Redesign-prioritet: P3

### /stats/baner/[slug]
- Fil: `src/app/(marketing)/stats/baner/[slug]/page.tsx` (+ `bane-klient.tsx`) · Flate: Marketing/Stats — bane-detalj (dynamisk) · Rolle/gating: offentlig; `notFound()` ved ukjent bane.
- Jobb: vis én bane + turneringer spilt der.
- Data vist: `prisma.bane.findFirst`, `prisma.tournament.findMany`. ISR 1t. `generateStaticParams`.
- Komponenter: lokal `bane-klient.tsx`. Redesign-prioritet: P3

### /stats/klubber
- Fil: `src/app/(marketing)/stats/klubber/page.tsx` (+ egen `klubber.css`) · Flate: Marketing/Stats — klubbdatabase (design 22) · Rolle/gating: offentlig.
- Jobb: oversikt over klubber (aggregert fra PublicPlayer.bio + seed).
- Data vist: `prisma.publicPlayer.count` (aktive), `tournament.count`. ISR 1t.
- Komponenter: klubber.css + stats.css.
- Nåværende designkvalitet: ferdig — NB header advarer at data aggregeres fra bio + seed (datakvalitet-risiko). Redesign-prioritet: P3

### /stats/klubber/[slug]
- Fil: `src/app/(marketing)/stats/klubber/[slug]/page.tsx` (+ `klubb-klient.tsx`) · Flate: Marketing/Stats — klubb-detalj (dynamisk) · Rolle/gating: offentlig; `notFound()` ved ukjent klubb.
- Jobb: vis én klubb + turneringer.
- Data vist: `prisma.tournament.findMany`. ISR 1t. `generateStaticParams`.
- Komponenter: lokal `klubb-klient.tsx`. Redesign-prioritet: P3

### /stats/turneringer
- Fil: `src/app/(marketing)/stats/turneringer/page.tsx` · Flate: Marketing/Stats — turneringsoversikt · Rolle/gating: offentlig.
- Jobb: data-tett grid over turneringer med tour-filter + tidsfilter.
- Data vist: `prisma.tournament.*` (Athletic/DataGolf-stil). ISR 1t. Ren server-komponent.
- AK-domene vist: tour, status, datoer.
- NB: forveksles lett med `/turneringer` (marketing-rot) — denne er stats-versjonen. Redesign-prioritet: P2

### /stats/turneringer/[slug]
- Fil: `src/app/(marketing)/stats/turneringer/[slug]/page.tsx` · Flate: Marketing/Stats — turnerings-detalj (dynamisk) · Rolle/gating: offentlig; `notFound()` ved ukjent slug.
- Jobb: leaderboard/detalj for én turnering.
- Data vist: `prisma.tournament.findUnique` + relaterte `findMany`. ISR 900 s.
- AK-domene vist: leaderboard, scoreToPar. Redesign-prioritet: P2

### /stats/turneringer/[slug]/statistikk
- Fil: `src/app/(marketing)/stats/turneringer/[slug]/statistikk/page.tsx` · Flate: Marketing/Stats — feltets scorefordeling · Rolle/gating: offentlig; `notFound()` ved ukjent slug.
- Jobb: median/beste/kutt + score-til-par-histogram + norske vs feltet.
- Data vist: `prisma.tournament.findUnique` (med PublicPlayerEntry); utleder scoreToPar fra rounds-JSON med defensiv runtime-parsing (ingen blind cast). ISR 900 s.
- Komponenter: lucide (`ChevronLeft, TrendingDown, Trophy, Users, Flag`) + stats.css.
- AK-domene vist: scoreToPar-fordeling, kutt.
- Nåværende designkvalitet: ferdig — god datadisiplin (defensiv parsing per gotchas). Redesign-prioritet: P2

### /stats/tour/[slug]
- Fil: `src/app/(marketing)/stats/tour/[slug]/page.tsx` (+ `tour-client.tsx`) · Flate: Marketing/Stats — tour deep-dive (design-brief 23). Slugs: `srixon | olyo | garmin-ngc | ostlandstour` · Rolle/gating: offentlig; `notFound()` ved ukjent tourConfig.
- Jobb: dypdykk i én norsk amatør-tour (turneringer, kommende, spillere).
- Data vist: `prisma.tournament.findMany` (spilte + kommende). ISR 1t. `generateStaticParams`.
- Komponenter: lokal `tour-client.tsx` + `StatsEyebrow`.
- AK-domene vist: tour-resultater, kalender. Redesign-prioritet: P2

### /stats/uka
- Fil: `src/app/(marketing)/stats/uka/page.tsx` (+ egen `uka.css`) · Flate: Marketing/Stats — ukentlig editorial roundup · Rolle/gating: offentlig.
- Jobb: nyhetsbrev-stil oppsummering av siste ukes norske resultater.
- Data vist: `prisma.tournament.findMany` (siste uke + neste). ISR 86400 s.
- Komponenter: uka.css + stats.css + lucide `Star`.
- Nåværende designkvalitet: ferdig (editorial). Redesign-prioritet: P2

### /stats/2026
- Fil: `src/app/(marketing)/stats/2026/page.tsx` (+ egen `sesong.css`, `sesong-sticky-nav.tsx`) · Flate: Marketing/Stats — sesongoversikt «2026 i tall» (magazine-spread) · Rolle/gating: offentlig.
- Jobb: årsoppsummering i magasin-format med sticky-seksjonsnav.
- Data vist: `prisma.tournament.findMany`, `prisma.publicPlayerEntry.findMany`. ISR 86400 s.
- Komponenter: lokal `sesong-sticky-nav.tsx` + `StatsEyebrow, Reveal` + sesong.css.
- AK-domene vist: sesongaggregater. Redesign-prioritet: P3

### /stats/wrapped/[slug]
- Fil: `src/app/(marketing)/stats/wrapped/[slug]/page.tsx` · Flate: Marketing/Stats — Spotify-Wrapped-stil sesongrapport (dynamisk) · Rolle/gating: offentlig; `notFound()` ved ukjent spiller.
- Jobb: slide-basert årsrapport for én spiller (viral/delbar).
- Data vist: `prisma.publicPlayer.findUnique` + `prisma.publicPlayerEntry.findMany`. ISR 86400 s.
- Komponenter: `StatsWrappedPlayer` (`src/components/stats/stats-wrapped-player.tsx`) + `StatsWrappedSlide`.
- AK-domene vist: sesong-høydepunkter, beste runder. Redesign-prioritet: P3

### /stats/quiz
- Fil: `src/app/(marketing)/stats/quiz/page.tsx` (+ egen `quiz.css`, `quiz-shell.tsx`) · Flate: Marketing/Stats — viral golf-quiz (Buzzfeed-stil) · Rolle/gating: offentlig.
- Jobb: 10-spørsmåls quiz om PGA-statistikk, delbart resultat.
- Data vist: ingen Prisma — all logikk klient-side i `QuizShell`. Statisk metadata-export.
- Komponenter: lokal `QuizShell` + `StatsQuizCard` (`src/components/stats/stats-quiz-card.tsx`) + quiz.css.
- Tilstander: quiz-flyt/resultat i klient.
- AK-domene vist: PGA-statistikk-trivia. Redesign-prioritet: P3

### /stats/blogg
- Fil: `src/app/(marketing)/stats/blogg/page.tsx` · Flate: Marketing/Stats — datadrevet artikkelliste (design 18) · Rolle/gating: offentlig.
- Jobb: bloggoversikt med featured + kategori-filter + grid.
- Data vist: MDX via `src/lib/blogg/posts.ts` (`getAllPosts/getFeaturedPost/getNonFeaturedPosts`), IKKE Prisma. ISR 1t.
- Komponenter: `StatsEyebrow, Reveal` + lucide `ArrowRight`. Redesign-prioritet: P2

### /stats/blogg/[slug]
- Fil: `src/app/(marketing)/stats/blogg/[slug]/page.tsx` · Flate: Marketing/Stats — artikkel-detalj (dynamisk MDX) · Rolle/gating: offentlig; `notFound()` ved ukjent post.
- Jobb: render én MDX-artikkel.
- Data vist: `src/lib/blogg/posts.ts`. ISR 1t. `generateStaticParams`. Redesign-prioritet: P3

### /stats/sok
- Fil: `src/app/(marketing)/stats/sok/page.tsx` (+ `sok-client.tsx`) · Flate: Marketing/Stats — globalt søk (design-brief 27) · Rolle/gating: offentlig; `robots: noindex`.
- Jobb: søk på tvers av spillere, PGA-spillere, klubber, turneringer, artikler.
- Data vist: `prisma.publicPlayer/pgaPlayerSeason/tournament`-søk (GET ?q&type). `revalidate=0` (alltid live).
- Komponenter: lokal `SokClient`.
- Nåværende designkvalitet: ferdig — nærmeste analogen til en stats-nav-hub; vurder å koble til `StatsCmdK`. Redesign-prioritet: P1

### /stats/min-progresjon
- Fil: `src/app/(marketing)/stats/min-progresjon/page.tsx` · Flate: Marketing/Stats — autentisert SG-utvikling (design 16) · Rolle/gating: **krever innlogget bruker** (`getCurrentUser()` → `redirect("/auth/login?next=/stats/min-progresjon")`). `force-dynamic`.
- Jobb: personlig SG-trend over tid for innlogget bruker.
- Data vist: `prisma.brukerSammenligning.findMany` + `prisma.brukerSgInput.findMany`. Dynamisk.
- Komponenter: `StatsTrendGraf` (gjenbrukt), `Reveal, StatsEyebrow` + lucide `TrendingUp/Down, Minus`.
- Layout: hero → status-strip → SG-trend linjegraf → 2×2 per-kategori mini-linjer → alle-sammenligninger-tabell → «største gap»-insight.
- Tilstander: empty-state ved 0 SG-inputs (eksplisitt håndtert); auth-redirect finnes.
- AK-domene vist: personlig SG-trend, per-kategori-gap.
- Nåværende designkvalitet: ferdig — eneste auth-gated stats-side; blander offentlig stats-flate med innlogget PlayerHQ-aktig data (IA-spørsmål: hører den hjemme i PlayerHQ?). Redesign-prioritet: P1

### /stats/verktoy
- Fil: `src/app/(marketing)/stats/verktoy/page.tsx` · Flate: Marketing/Stats — verktøy-hub (design 26) · Rolle/gating: offentlig.
- Jobb: liste 5 kalkulatorer som kort.
- Data vist: ingen (statisk). ISR 86400 s.
- Komponenter: `StatsEyebrow, Reveal, StatsBtn` + lucide (`Gauge, Target, LineChart, Sparkles, Crosshair`). Redesign-prioritet: P3

### /stats/verktoy/avstand
- Fil: `src/app/(marketing)/stats/verktoy/avstand/page.tsx` (+ `client.tsx`) · Flate: Marketing/Stats — avstandskonverter (kalkulator) · Rolle/gating: offentlig.
- Jobb: konverter meter/yards o.l. (klient-kalkulator).
- Data vist: ingen Prisma; logikk i `client.tsx`. ISR 86400 s. Redesign-prioritet: P3

### /stats/verktoy/score-til-hcp
- Fil: `src/app/(marketing)/stats/verktoy/score-til-hcp/page.tsx` (+ `client.tsx`) · Flate: Marketing/Stats — score→HCP-kalkulator. Offentlig, klient-logikk, ISR 86400 s. AK-domene: HCP-beregning. Redesign-prioritet: P3

### /stats/verktoy/sg-estimator
- Fil: `src/app/(marketing)/stats/verktoy/sg-estimator/page.tsx` (+ `client.tsx`) · Flate: Marketing/Stats — SG-estimator-kalkulator. Offentlig, klient-logikk, ISR 86400 s. AK-domene: SG-estimat. Redesign-prioritet: P3

### /stats/verktoy/tour-ekvivalent
- Fil: `src/app/(marketing)/stats/verktoy/tour-ekvivalent/page.tsx` (+ `client.tsx`) · Flate: Marketing/Stats — tour-ekvivalent-kalkulator. Offentlig, klient-logikk, ISR 86400 s. Redesign-prioritet: P3

### /stats/verktoy/whs-kalkulator
- Fil: `src/app/(marketing)/stats/verktoy/whs-kalkulator/page.tsx` (+ `client.tsx`) · Flate: Marketing/Stats — WHS-handicap-kalkulator. Offentlig, klient-logikk, ISR 86400 s. AK-domene: WHS-handicap. Redesign-prioritet: P3

---

## Tverrgående funn (orkestrator-relevant)

1. **Emoji-brudd på forsiden (P0):** `src/app/(marketing)/page.tsx:16-57` bruker emoji (📈 16, 📋 24, 💬 31, 🧪 38, ⭐ 45, 📡 52) som bento-ikoner. Bryter brand-regel «Aldri emoji i UI — bruk Lucide-ikoner». Eneste verifiserte emoji-bruk i hele marketing-flaten. **Verifisert å fortsatt gjelde på DENNE branchen** (ikke den fiksede).
2. **Pris-regelbrudd på forsiden (P0):** Forsidens `PRISER` (67-115) viser Gratis 0 / Performance 1 200 / Performance Pro 2 220 som «app-nivåer» med månedspris — motsier låst BUSINESS-RULES (PlayerHQ = gratis/300; Performance/Pro = coaching-pakker, ikke app-tiere). `/priser` og `/coaching` har riktig modell; forsiden er ute av sync.
3. **Hardkodet hex/rgba (P1–P2):** `#0A1F17`/`#0a1f17` direkte i `page.tsx` (174, 214, 262, 276, 299), `cases/page.tsx` (111, 241); rå `hsl(168 72% 11%)`-gradient + `[--primary:164_100%_17.3%]`-override + lime `rgba(209,248,67,…)`-skygger i priser/coaching/anlegg/playerhq; `rgba(0,40,28,…)` i `anlegg/[slug]`; `rgba(0,88,64,…)`/`rgba(209,248,67,…)` i `turneringer/[slug]`. Designsystem-regelen krever token.
4. **Duplikat-rute (P1):** `/cases` og `/suksess` har samme metadata-tittel «Suksesshistorier» og overlappende formål med ulik hardkodet data. IA-avklaring: én kanonisk suksess-side.
5. **Lokal duplisering av seksjonsprimitiver:** `SectionEyebrow`/`SectionH2`/`Em`/`PrisCard`/`TjenesteCard` er kopiert inn lokalt i `page.tsx`, `playerhq`, `anlegg`, `om-oss`, `junior`, `treningsfilosofi` (mens `priser`/`coaching` importerer fra `marketing-sections.tsx`). Drift-risiko (hero-animasjons-CSS limt inn flere steder).
6. **Manglende error/empty på async Prisma-sider:** `/anlegg` (også empty), `/coacher`, `/turneringer`, `/booking` har ingen error-boundary.
7. **Foreldreløse ruter:** `/priser`, `/junior`, `/cases`, `/suksess`, `/faq`, `/blogg` lenkes ikke fra header-nav (noen kun fra footer/forside). `/turneringer` + hele `/stats/*` er bevisst utenfor v1-nav (`marketing-header.tsx:5`).
8. **To token-spor:** `/turneringer*` (marketing-rot) bruker stats-tokens (`var(--s-*)` via `stats.css`) selv om de ligger under marketing — avklar om de skal følge marketing-moderne eller stats-sporet.
9. **Stats = egen sub-app:** eget `stats.css` (`--s-*` duplikat-aliaser av globals.css-hex), eget bibliotek `src/components/stats/` (28 komp.), INGEN `stats/layout.tsx`, `StatsCmdK` bygget men ikke wiret. Auth-grense uskarp: `/stats/min-progresjon` + `sg-sammenlign/start` + `.../resultat/[id]` krever konto i offentlig flate (IA: hører de til PlayerHQ?). Hardkodede hub-tall (1175/1299/2497) er datagjeld.
