# Marketing/Stats — skjermkort (kode-verifisert 2026-06-29)

45 ruter under `src/app/(marketing)/stats/`. Dominerende mønster: server-komponenter med ISR, ekte Prisma-data, pixel-perfekt portet fra `design-handoff-stats-2026-05-25`-bundelen, bygget på et **eget, scoped design­system** (`stats.css` + `--s-*`-tokens + `src/components/stats/`-bibliotek) — IKKE `src/components/athletic/`. Største gjeld: (1) Stats er en egen flate men **foreldreløs fra marketing-nav** (header ekskluderer Stats fra v1, `src/components/marketing/marketing-header.tsx:5`), og (2) det finnes **ingen `layout.tsx`** under stats, så hver side importerer `stats.css` manuelt og det er ingen delt stats-shell/nav — `StatsCmdK` (global Cmd+K-nav) er bygget men ikke wiret inn noen steder.

## Svar på stats-flate-spørsmålet (avklart)

**Stats er en egen flate, men teknisk halv-foreldreløs.** Bevis:
- **Egen flate:** eget scoped designsystem `stats.css` (`src/app/(marketing)/stats/stats.css:1`, `--s-bg/--s-fg/--s-primary` osv. definert på `:root`), eget komponentbibliotek `src/components/stats/` (28 komponenter), egne design-prototyper «Stats-plattform (eget spor)» (`public/design-handover/Stats-plattform (eget spor).dc.html`, `.../Final_AK_Golf_HQ/Stats-plattform (eget spor).dc.html`). «eget spor» = bevisst egen designretning.
- **Ingen egen layout:** `find src/app/(marketing)/stats -name layout.tsx` → tomt. Stats arver kun `(marketing)/layout.tsx` (MarketingHeader + MarketingFooter + PlausibleScript). Hver side importerer `stats.css` enkeltvis (verifisert: alle 45 page.tsx har en `import "...stats.css"`).
- **Foreldreløs fra primær-nav:** `src/components/marketing/marketing-header.tsx:5` — kommentar «Stats og Turneringer er ikke med i v1-lanseringen — aktiveres etter launch». Ingen `/stats`-href i header eller footer. Intern stats-navigasjon finnes kun via lenker i sidene selv + den ikke-wirede `StatsCmdK`.
- **Intern nav-modell:** `StatsCmdK` (`src/components/stats/stats-cmd-k.tsx`) har en hardkodet `NAV_SIDER`-liste (Leaderboards, PGA, Norske spillere, SG, Årganger, Regioner, 4 tourer, Globalt søk) — den TILTENKTE stats-nav-en, men er ikke montert i noen page/layout (grep i stats-mappa: 0 treff). `StatsTabs` er en generell in-page fane-bryter (URL-param), ikke global nav.

Konklusjon: behandle Stats som en egen sub-app med eget designspråk. Et redesign bør beslutte (a) om Stats får egen `layout.tsx` med stats-shell + montert Cmd+K/nav, og (b) hvordan/når den kobles inn i marketing-header etter launch.

---

### /stats
- Fil: `src/app/(marketing)/stats/page.tsx`
- Flate: Marketing/Stats (egen flate, marketing-chrome)
- Rolle/gating: offentlig, ingen auth
- Jobb: hub-landingsside som introduserer alle stats-moduler + mersalg til PlayerHQ.
- Data vist (felt → kilde): norske i aksjon denne uka (`prisma.publicPlayerEntry.count`), kommende turneringer 30 d (`prisma.tournament.count`), siste DataGolf-sync (`prisma.tournament.findFirst`). NB: hero-side-tall (1175 turneringer, 1299 PGA, 2497 norske) er **hardkodet** i JSX (`page.tsx:194-205`), ikke live.
- Komponenter: stats-lokale — `StatsIcon, FlagGlyph, StatsEyebrow, Reveal, CountUp, StatsBtn, SparkBars, MiniRadar` (alle `src/components/stats/`)
- Layout og hierarki: hero (eyebrow + display + CTA-par) → KPI-strip (3) → Norske-kort → 6-kol bento (Turneringer/PGA/Spillere/SG) → mørkt mersalg-bånd → trener-3-steg → bunn-CTA. Primær CTA «Se ukens turneringer» → `/turneringer`.
- Tilstander: empty håndtert delvis (norskeIAksjon>0-sjekk). loading/error: MANGLER (ISR server-render).
- Interaksjoner: bento-kort → `/turneringer`, `/stats/pga`, `/stats/spillere`, `/stats/sg-sammenlign`; mersalg → `/portal`, `/priser`.
- AK-domene vist: SG (4 akser via MiniRadar), PlayerHQ-mersalg, 300 kr/mnd-pris
- Designfil-referanse: `public/design-handover/Stats-plattform (eget spor).dc.html` + `Final_AK_Golf_HQ/Stats-plattform (moderne).dc.html`; header-kommentar peker til arkivert `design-handoff-stats-2026-05-25/js/hub.jsx`
- Nåværende designkvalitet: ferdig — men hardkodede hero-tall er datagjeld; mersalg «300 kr/mnd · gratis under beta» bør sjekkes mot BUSINESS-RULES.
- Redesign-prioritet: P1

### /stats/norske
- Fil: `src/app/(marketing)/stats/norske/page.tsx`
- Flate: Marketing/Stats
- Rolle/gating: offentlig
- Jobb: liste alle norske spillere i aksjon (pågående/innen 7 d), gruppert per turnering.
- Data vist: `prisma.publicPlayerEntry.findMany` (country NO, aktive/snart turneringer). ISR 1800 s.
- Komponenter: stats.css + lucide (`ChevronLeft, Flag, Calendar, MapPin, ExternalLink, Users`)
- AK-domene vist: leaderboard-posisjoner, tour-tilhørighet
- Designfil-referanse: del av Stats-plattform-sporet
- Nåværende designkvalitet: ferdig
- Redesign-prioritet: P2

### /stats/leaderboards
- Fil: `src/app/(marketing)/stats/leaderboards/page.tsx` (+ `leaderboards-client.tsx`)
- Flate: Marketing/Stats
- Rolle/gating: offentlig
- Jobb: tverrkategori topp-10-aggregat (PGA, Korn Ferry, Euro, Norske, Klubber, Kuriositeter).
- Data vist: `prisma.pgaPlayerSeason.findMany` + `prisma.publicPlayer.findMany`. ISR 1t.
- Komponenter: `StatsLeaderboardCard, StatsEyebrow, Reveal, StatsBtn` + lokal `LeaderboardsSearchBox, LeaderboardsKategoriStrip`
- Layout og hierarki: hero + inline søk → sticky kategori-strip → 6 PGA-leaderboards 3×2 → Korn Ferry+Euro → norske 3×2 → klubber tabell → 3 kuriositets-kort → mersalg-bånd
- AK-domene vist: SG, scoring-snitt, drive distance m.fl. per leaderboard
- Designfil-referanse: header peker arkiv `pages-c.jsx#Leaderboards`
- Nåværende designkvalitet: ferdig (rik)
- Redesign-prioritet: P1

### /stats/spillere
- Fil: `src/app/(marketing)/stats/spillere/page.tsx` (+ egen `spillere.css`)
- Flate: Marketing/Stats
- Rolle/gating: offentlig
- Jobb: FotMob-aktig norsk spillerdatabase med søk, filterpills, kort-grid vs tabell.
- Data vist: `prisma.publicPlayer.count/findMany` (country NO, aktive), `tournament.count`, `publicPlayerEntry.count`, topp-20. GET-søk via searchParams. ISR 1t.
- Komponenter: stats.css + spillere.css; lokale spiller-rad/avatar fra `src/components/stats/`
- Tilstander: søk/filter via URL; empty ved 0 treff — verifiser i underkomponent
- AK-domene vist: kategori, klubb, HCP
- Redesign-prioritet: P1

### /stats/spillere/[slug]
- Fil: `src/app/(marketing)/stats/spillere/[slug]/page.tsx`
- Flate: Marketing/Stats (dynamisk profil)
- Rolle/gating: offentlig; `notFound()` hvis ukjent slug
- Jobb: enkelt norsk spiller-profil (statistikk, resultater, trend).
- Data vist: `prisma.publicPlayer.findUnique` (m/ entries). ISR 1t. `generateStaticParams` for prebuild.
- Komponenter: stats-bibliotek (radar/trend/tabs)
- AK-domene vist: SG-profil, resultater, kategori
- Redesign-prioritet: P2

### /stats/pga
- Fil: `src/app/(marketing)/stats/pga/page.tsx` (+ egen `pga.css`)
- Flate: Marketing/Stats
- Rolle/gating: offentlig
- Jobb: PGA Tour Stats-hub — inngang til 6 kategorier (drive, fairway, GIR, putts, scoring, SG).
- Data vist: `getPgaTopN` + `getPgaTourAverage` (`src/lib/stats/pga-sync.ts`, kilde PgaPlayerSeason synket fra DataGolf). ISR 1t.
- Komponenter: `StatsIcon, FlagGlyph, StatsEyebrow, Reveal, CountUp, SparkBars, StatsBtn, PuttPreview`
- AK-domene vist: 6 PGA-statkategorier, Tour-snitt
- Designfil-referanse: header peker arkiv `pga.jsx, components.jsx`
- Redesign-prioritet: P1

### /stats/pga/drive-distance
- Fil: `src/app/(marketing)/stats/pga/drive-distance/page.tsx` (+ `explorer.tsx`)
- Flate: Marketing/Stats — PGA kategori-detalj (design 03)
- Rolle/gating: offentlig
- Jobb: dypdykk i én PGA-kategori med interaktiv percentile-slider + topp-20 + histogram.
- Data vist: `getPgaTopN` + `getPgaTourAverage`. ISR 1t.
- Komponenter: delt `PgaKategoriDetaljPage` (`src/components/stats/pga-kategori-page.tsx`) + lokal `explorer.tsx`. Importerer `pga.css` + `_shared/kategori.css`.
- AK-domene vist: kategori-percentile, Tour-snitt
- Designfil-referanse: header peker arkiv «design 03»
- Nåværende designkvalitet: ferdig — del av konsistent kategori-familie (6 ruter deler `PgaKategoriDetaljPage`)
- Redesign-prioritet: P2

### /stats/pga/fairway-pct
- Fil: `src/app/(marketing)/stats/pga/fairway-pct/page.tsx` (+ `explorer.tsx`)
- Flate: Marketing/Stats — PGA kategori-detalj
- Mønster identisk med drive-distance (delt `PgaKategoriDetaljPage` + lokal `explorer.tsx`, `getPgaTopN`/`getPgaTourAverage`, ISR 1t, offentlig). Stub-kort: følger familien.
- Redesign-prioritet: P2

### /stats/pga/gir-pct
- Fil: `src/app/(marketing)/stats/pga/gir-pct/page.tsx` (+ `explorer.tsx`)
- PGA kategori-detalj, identisk familie-mønster. Offentlig, ISR 1t.
- Redesign-prioritet: P2

### /stats/pga/putts-per-round
- Fil: `src/app/(marketing)/stats/pga/putts-per-round/page.tsx` (+ `explorer.tsx`)
- PGA kategori-detalj, familie-mønster. Offentlig, ISR 1t.
- Redesign-prioritet: P2

### /stats/pga/scoring-avg
- Fil: `src/app/(marketing)/stats/pga/scoring-avg/page.tsx` (+ `explorer.tsx`)
- PGA kategori-detalj, familie-mønster. Offentlig, ISR 1t.
- Redesign-prioritet: P2

### /stats/pga/sg-total
- Fil: `src/app/(marketing)/stats/pga/sg-total/page.tsx` (+ `explorer.tsx`)
- PGA kategori-detalj, familie-mønster. AK-domene: SG total. Offentlig, ISR 1t.
- Redesign-prioritet: P2

### /stats/pga/putt-explorer
- Fil: `src/app/(marketing)/stats/pga/putt-explorer/page.tsx` (+ `explorer.tsx`)
- Flate: Marketing/Stats — putting-dypdykk
- Rolle/gating: offentlig
- Jobb: utforsk make-% per putt-distanse på PGA Tour.
- Data vist: `prisma.pgaPuttDistance.findMany`. ISR 1t.
- Komponenter: lokal `explorer.tsx` + stats-bibliotek
- AK-domene vist: putt-make-% per distanse
- Redesign-prioritet: P2

### /stats/pga/spillere
- Fil: `src/app/(marketing)/stats/pga/spillere/page.tsx` (+ `spiller-tabell.tsx`)
- Flate: Marketing/Stats — PGA spillerliste
- Rolle/gating: offentlig
- Jobb: søkbar/filtrerbar liste over PGA/Euro/Korn Ferry-spillere.
- Data vist: `prisma.pgaPlayerSeason.count/findMany` (tour pga/euro/…, år CURRENT_YEAR). ISR 1t.
- Komponenter: lokal `spiller-tabell.tsx`
- AK-domene vist: tour, SG/statkategorier per spiller
- Redesign-prioritet: P2

### /stats/pga/spillere/[dg_id]
- Fil: `src/app/(marketing)/stats/pga/spillere/[dg_id]/page.tsx`
- Flate: Marketing/Stats — PGA spiller-profil (dynamisk)
- Rolle/gating: offentlig; `notFound()` ved isNaN/ukjent id
- Jobb: profil for én DataGolf-spiller (sesongstatistikk).
- Data vist: `prisma.pgaPlayerSeason.findFirst` (dg_id). ISR 1t. `generateStaticParams`.
- AK-domene vist: full PGA-statlinje, SG-splitt
- Redesign-prioritet: P2

### /stats/sg-sammenlign
- Fil: `src/app/(marketing)/stats/sg-sammenlign/page.tsx`
- Flate: Marketing/Stats — landingsside (offentlig, design 07)
- Rolle/gating: offentlig; `getCurrentUser()` brukes for personalisering/CTA (verktøyet selv krever konto)
- Jobb: selg «sammenlign din SG med Rory» — forklaring + FAQ + mersalg + CTA inn i flyten.
- Data vist: bruker-status fra `getCurrentUser`. ISR 1t.
- Komponenter: lucide-ikoner + stats.css
- Layout og hierarki: BIG italic lime hero → 3-stegs forklaring → SG-intro-kort → FAQ → mersalg → CTA
- AK-domene vist: 4 SG-akser
- Designfil-referanse: header peker arkiv «design 07»
- Redesign-prioritet: P1

### /stats/sg-sammenlign/start
- Fil: `src/app/(marketing)/stats/sg-sammenlign/start/page.tsx` (+ `skjema.tsx`)
- Flate: Marketing/Stats — SG-input-skjema
- Rolle/gating: krever konto (`getCurrentUser()` ; `force-dynamic`)
- Jobb: la bruker legge inn egne SG-tall og velge referansespiller.
- Data vist: `prisma.pgaPlayerSeason.findMany` (referansespillere). Dynamisk.
- Komponenter: lokal `skjema.tsx`
- AK-domene vist: SG-input (4 akser), referanse-proff
- Tilstander: trolig auth-redirect ved manglende bruker (verifiser i skjema)
- Redesign-prioritet: P1

### /stats/sg-sammenlign/resultat/[id]
- Fil: `src/app/(marketing)/stats/sg-sammenlign/resultat/[id]/page.tsx` (+ `result-view.tsx`)
- Flate: Marketing/Stats — SG-resultat (delbar)
- Rolle/gating: `getCurrentUser()` ; `notFound()` hvis sammenligning mangler; `force-dynamic`
- Jobb: vis lagret SG-sammenligning mot valgt proff (radar + tall), delbar lenke.
- Data vist: `prisma.brukerSammenligning.findFirst` + `prisma.pgaPlayerSeason.findFirst` (ref). Dynamisk.
- Komponenter: lokal `result-view.tsx`
- AK-domene vist: SG-gap per akse vs proff
- Redesign-prioritet: P1

### /stats/sammenlign-spillere
- Fil: `src/app/(marketing)/stats/sammenlign-spillere/page.tsx` (+ `resultat.tsx`, `spiller-sok.tsx`)
- Flate: Marketing/Stats — head-to-head 2 norske spillere (design 10)
- Rolle/gating: offentlig; `force-dynamic`
- Jobb: sammenlign to norske spillere side-om-side (søk-modus → resultat-modus via ?a&b).
- Data vist: `prisma.publicPlayer.findUnique` ×2 + topp-spillere-liste. Dynamisk.
- Komponenter: lokale `resultat.tsx`, `spiller-sok.tsx`
- Layout og hierarki: ingen params → 2-kol søk m/ VS-glyph; begge params → sticky bar + KPI + linjegraf + beste resultater
- AK-domene vist: resultater, trend, beste plasseringer
- Redesign-prioritet: P2

### /stats/aargang
- Fil: `src/app/(marketing)/stats/aargang/page.tsx`
- Flate: Marketing/Stats — kohort-explorer index
- Rolle/gating: offentlig
- Jobb: visuell tidslinje 2000–2012, klikk → årskull.
- Data vist: `prisma.publicPlayer`-aggregering (counts per fødselsår). ISR 1t.
- Komponenter: `StatsEyebrow, Reveal, StatsBtn`
- AK-domene vist: kohort/årskull
- Redesign-prioritet: P3

### /stats/aargang/[aar]
- Fil: `src/app/(marketing)/stats/aargang/[aar]/page.tsx`
- Flate: Marketing/Stats — årskull-detalj (dynamisk)
- Rolle/gating: offentlig; `notFound()` ved tomt/ugyldig år
- Jobb: vis alle spillere i ett fødselsår + sammenligning.
- Data vist: `prisma.publicPlayer`-query per år. ISR 1t. `generateStaticParams`.
- Redesign-prioritet: P3

### /stats/regions
- Fil: `src/app/(marketing)/stats/regions/page.tsx` (+ `norgeskart-wrapper.tsx`, `region-cards.tsx`)
- Flate: Marketing/Stats — region-explorer (design 25)
- Rolle/gating: offentlig
- Jobb: golf-Norge per region via interaktivt Norgeskart.
- Data vist: `prisma.publicPlayer.count`, `tournament.count`, `bane`-count (alle `.catch(()=>0)`-defensive). ISR 1t.
- Komponenter: `StatsNorgeskart` (via wrapper), `region-cards.tsx`, `CountUp, StatsEyebrow, Reveal`
- AK-domene vist: regional spiller-/bane-/turnerings-tetthet
- Redesign-prioritet: P2

### /stats/regions/[slug]
- Fil: `src/app/(marketing)/stats/regions/[slug]/page.tsx`
- Flate: Marketing/Stats — region-detalj (dynamisk)
- Rolle/gating: offentlig; `notFound()` ved ukjent region
- Jobb: dypdykk i én region (baner, spillere, kommende turneringer).
- Data vist: `prisma.bane.findMany`, `prisma.tournament.findMany` (kommende). ISR 1t. `generateStaticParams`.
- Redesign-prioritet: P3

### /stats/baner
- Fil: `src/app/(marketing)/stats/baner/page.tsx` (+ egen `baner.css`)
- Flate: Marketing/Stats — banedatabase (design 13)
- Rolle/gating: offentlig
- Jobb: søkbar oversikt over norske golfbaner.
- Data vist: `src/lib/stats/bane-queries.ts` (Prisma). ISR 1t.
- Komponenter: baner.css + stats.css
- AK-domene vist: bane-metadata
- Redesign-prioritet: P3

### /stats/baner/[slug]
- Fil: `src/app/(marketing)/stats/baner/[slug]/page.tsx` (+ `bane-klient.tsx`)
- Flate: Marketing/Stats — bane-detalj (dynamisk)
- Rolle/gating: offentlig; `notFound()` ved ukjent bane
- Jobb: vis én bane + turneringer spilt der.
- Data vist: `prisma.bane.findFirst`, `prisma.tournament.findMany`. ISR 1t. `generateStaticParams`.
- Komponenter: lokal `bane-klient.tsx`
- Redesign-prioritet: P3

### /stats/klubber
- Fil: `src/app/(marketing)/stats/klubber/page.tsx` (+ egen `klubber.css`)
- Flate: Marketing/Stats — klubbdatabase (design 22)
- Rolle/gating: offentlig
- Jobb: oversikt over klubber (aggregert fra PublicPlayer.bio + seed).
- Data vist: `prisma.publicPlayer.count` (aktive), `tournament.count`. ISR 1t.
- Komponenter: klubber.css + stats.css
- Nåværende designkvalitet: ferdig — NB header advarer at data aggregeres fra bio + seed (datakvalitet-risiko)
- Redesign-prioritet: P3

### /stats/klubber/[slug]
- Fil: `src/app/(marketing)/stats/klubber/[slug]/page.tsx` (+ `klubb-klient.tsx`)
- Flate: Marketing/Stats — klubb-detalj (dynamisk)
- Rolle/gating: offentlig; `notFound()` ved ukjent klubb
- Jobb: vis én klubb + turneringer.
- Data vist: `prisma.tournament.findMany`. ISR 1t. `generateStaticParams`.
- Komponenter: lokal `klubb-klient.tsx`
- Redesign-prioritet: P3

### /stats/turneringer
- Fil: `src/app/(marketing)/stats/turneringer/page.tsx`
- Flate: Marketing/Stats — turneringsoversikt
- Rolle/gating: offentlig
- Jobb: data-tett grid over turneringer med tour-filter + tidsfilter.
- Data vist: `prisma.tournament.*` (Athletic/DataGolf-stil). ISR 1t. Ren server-komponent.
- AK-domene vist: tour, status, datoer
- NB: forveksles lett med `/turneringer` (marketing-rot) som er separat flate — denne er stats-versjonen.
- Redesign-prioritet: P2

### /stats/turneringer/[slug]
- Fil: `src/app/(marketing)/stats/turneringer/[slug]/page.tsx`
- Flate: Marketing/Stats — turnerings-detalj (dynamisk)
- Rolle/gating: offentlig; `notFound()` ved ukjent slug
- Jobb: leaderboard/detalj for én turnering.
- Data vist: `prisma.tournament.findUnique` + relaterte `findMany`. ISR 900 s.
- AK-domene vist: leaderboard, scoreToPar
- Redesign-prioritet: P2

### /stats/turneringer/[slug]/statistikk
- Fil: `src/app/(marketing)/stats/turneringer/[slug]/statistikk/page.tsx`
- Flate: Marketing/Stats — feltets scorefordeling
- Rolle/gating: offentlig; `notFound()` ved ukjent slug
- Jobb: median/beste/kutt + score-til-par-histogram + norske vs feltet.
- Data vist: `prisma.tournament.findUnique` (med PublicPlayerEntry); utleder scoreToPar fra rounds-JSON med defensiv runtime-parsing (ingen blind cast). ISR 900 s.
- Komponenter: lucide (`ChevronLeft, TrendingDown, Trophy, Users, Flag`) + stats.css
- AK-domene vist: scoreToPar-fordeling, kutt
- Nåværende designkvalitet: ferdig — god datadisiplin (zod-aktig defensiv parsing per gotchas-regel)
- Redesign-prioritet: P2

### /stats/tour/[slug]
- Fil: `src/app/(marketing)/stats/tour/[slug]/page.tsx` (+ `tour-client.tsx`)
- Flate: Marketing/Stats — tour deep-dive (design-brief 23). Slugs: `srixon | olyo | garmin-ngc | ostlandstour`
- Rolle/gating: offentlig; `notFound()` ved ukjent tourConfig
- Jobb: dypdykk i én norsk amatør-tour (turneringer, kommende, spillere).
- Data vist: `prisma.tournament.findMany` (spilte + kommende). ISR 1t. `generateStaticParams`.
- Komponenter: lokal `tour-client.tsx` + `StatsEyebrow`
- AK-domene vist: tour-resultater, kalender
- Redesign-prioritet: P2

### /stats/uka
- Fil: `src/app/(marketing)/stats/uka/page.tsx` (+ egen `uka.css`)
- Flate: Marketing/Stats — ukentlig editorial roundup
- Rolle/gating: offentlig
- Jobb: nyhetsbrev-stil oppsummering av siste ukes norske resultater.
- Data vist: `prisma.tournament.findMany` (siste uke + neste). ISR 86400 s.
- Komponenter: uka.css + stats.css + lucide `Star`
- Nåværende designkvalitet: ferdig (editorial)
- Redesign-prioritet: P2

### /stats/2026
- Fil: `src/app/(marketing)/stats/2026/page.tsx` (+ egen `sesong.css`, `sesong-sticky-nav.tsx`)
- Flate: Marketing/Stats — sesongoversikt «2026 i tall» (magazine-spread)
- Rolle/gating: offentlig
- Jobb: årsoppsummering i magasin-format med sticky-seksjonsnav.
- Data vist: `prisma.tournament.findMany`, `prisma.publicPlayerEntry.findMany`. ISR 86400 s.
- Komponenter: lokal `sesong-sticky-nav.tsx` + `StatsEyebrow, Reveal` + sesong.css
- AK-domene vist: sesongaggregater
- Redesign-prioritet: P3

### /stats/wrapped/[slug]
- Fil: `src/app/(marketing)/stats/wrapped/[slug]/page.tsx`
- Flate: Marketing/Stats — Spotify-Wrapped-stil sesongrapport (dynamisk)
- Rolle/gating: offentlig; `notFound()` ved ukjent spiller
- Jobb: slide-basert årsrapport for én spiller (viral/delbar).
- Data vist: `prisma.publicPlayer.findUnique` + `prisma.publicPlayerEntry.findMany`. ISR 86400 s.
- Komponenter: `StatsWrappedPlayer` (`src/components/stats/stats-wrapped-player.tsx`) + `StatsWrappedSlide`
- AK-domene vist: sesong-høydepunkter, beste runder
- Redesign-prioritet: P3

### /stats/quiz
- Fil: `src/app/(marketing)/stats/quiz/page.tsx` (+ egen `quiz.css`, `quiz-shell.tsx`)
- Flate: Marketing/Stats — viral golf-quiz (Buzzfeed-stil)
- Rolle/gating: offentlig
- Jobb: 10-spørsmåls quiz om PGA-statistikk, delbart resultat.
- Data vist: ingen Prisma — all logikk klient-side i `QuizShell`. Statisk metadata-export.
- Komponenter: lokal `QuizShell` + `StatsQuizCard` (`src/components/stats/stats-quiz-card.tsx`) + quiz.css
- Tilstander: quiz-flyt/resultat i klient
- AK-domene vist: PGA-statistikk-trivia
- Redesign-prioritet: P3

### /stats/blogg
- Fil: `src/app/(marketing)/stats/blogg/page.tsx`
- Flate: Marketing/Stats — datadrevet artikkelliste (design 18)
- Rolle/gating: offentlig
- Jobb: bloggoversikt med featured + kategori-filter + grid.
- Data vist: MDX via `src/lib/blogg/posts.ts` (`getAllPosts/getFeaturedPost/getNonFeaturedPosts`), IKKE Prisma. ISR 1t.
- Komponenter: `StatsEyebrow, Reveal` + lucide `ArrowRight`
- Redesign-prioritet: P2

### /stats/blogg/[slug]
- Fil: `src/app/(marketing)/stats/blogg/[slug]/page.tsx`
- Flate: Marketing/Stats — artikkel-detalj (dynamisk MDX)
- Rolle/gating: offentlig; `notFound()` ved ukjent post
- Jobb: render én MDX-artikkel.
- Data vist: `src/lib/blogg/posts.ts`. ISR 1t. `generateStaticParams`.
- Redesign-prioritet: P3

### /stats/sok
- Fil: `src/app/(marketing)/stats/sok/page.tsx` (+ `sok-client.tsx`)
- Flate: Marketing/Stats — globalt søk (design-brief 27)
- Rolle/gating: offentlig; `robots: noindex`
- Jobb: søk på tvers av spillere, PGA-spillere, klubber, turneringer, artikler.
- Data vist: `prisma.publicPlayer/pgaPlayerSeason/tournament`-søk (GET ?q&type). `revalidate=0` (alltid live).
- Komponenter: lokal `SokClient`
- Nåværende designkvalitet: ferdig — dette er den nærmeste analogen til en stats-nav-hub; vurder å koble til `StatsCmdK`
- Redesign-prioritet: P1

### /stats/min-progresjon
- Fil: `src/app/(marketing)/stats/min-progresjon/page.tsx`
- Flate: Marketing/Stats — autentisert SG-utvikling (design 16)
- Rolle/gating: **krever innlogget bruker** (`getCurrentUser()` → `redirect("/auth/login?next=/stats/min-progresjon")`). `force-dynamic`.
- Jobb: personlig SG-trend over tid for innlogget bruker.
- Data vist: `prisma.brukerSammenligning.findMany` + `prisma.brukerSgInput.findMany`. Dynamisk.
- Komponenter: `StatsTrendGraf` (gjenbrukt), `Reveal, StatsEyebrow` + lucide `TrendingUp/Down, Minus`
- Layout og hierarki: hero → status-strip → SG-trend linjegraf → 2×2 per-kategori mini-linjer → alle-sammenligninger-tabell → «største gap»-insight
- Tilstander: empty-state ved 0 SG-inputs (eksplisitt håndtert); auth-redirect finnes
- AK-domene vist: personlig SG-trend, per-kategori-gap
- Nåværende designkvalitet: ferdig — eneste auth-gated stats-side; den blander offentlig stats-flate med innlogget PlayerHQ-aktig data (IA-spørsmål: hører denne hjemme i PlayerHQ heller enn marketing-stats?)
- Redesign-prioritet: P1

### /stats/verktoy
- Fil: `src/app/(marketing)/stats/verktoy/page.tsx`
- Flate: Marketing/Stats — verktøy-hub (design 26)
- Rolle/gating: offentlig
- Jobb: liste 5 kalkulatorer som kort.
- Data vist: ingen (statisk). ISR 86400 s.
- Komponenter: `StatsEyebrow, Reveal, StatsBtn` + lucide (`Gauge, Target, LineChart, Sparkles, Crosshair`)
- Redesign-prioritet: P3

### /stats/verktoy/avstand
- Fil: `src/app/(marketing)/stats/verktoy/avstand/page.tsx` (+ `client.tsx`)
- Flate: Marketing/Stats — avstandskonverter (kalkulator)
- Rolle/gating: offentlig
- Jobb: konverter meter/yards o.l. (klient-kalkulator).
- Data vist: ingen Prisma; logikk i `client.tsx`. ISR 86400 s (statisk skall).
- Redesign-prioritet: P3

### /stats/verktoy/score-til-hcp
- Fil: `src/app/(marketing)/stats/verktoy/score-til-hcp/page.tsx` (+ `client.tsx`)
- Flate: Marketing/Stats — score→HCP-kalkulator. Offentlig, klient-logikk, ISR 86400 s.
- AK-domene vist: HCP-beregning
- Redesign-prioritet: P3

### /stats/verktoy/sg-estimator
- Fil: `src/app/(marketing)/stats/verktoy/sg-estimator/page.tsx` (+ `client.tsx`)
- Flate: Marketing/Stats — SG-estimator-kalkulator. Offentlig, klient-logikk, ISR 86400 s.
- AK-domene vist: SG-estimat
- Redesign-prioritet: P3

### /stats/verktoy/tour-ekvivalent
- Fil: `src/app/(marketing)/stats/verktoy/tour-ekvivalent/page.tsx` (+ `client.tsx`)
- Flate: Marketing/Stats — tour-ekvivalent-kalkulator. Offentlig, klient-logikk, ISR 86400 s.
- Redesign-prioritet: P3

### /stats/verktoy/whs-kalkulator
- Fil: `src/app/(marketing)/stats/verktoy/whs-kalkulator/page.tsx` (+ `client.tsx`)
- Flate: Marketing/Stats — WHS-handicap-kalkulator. Offentlig, klient-logikk, ISR 86400 s.
- AK-domene vist: WHS-handicap
- Redesign-prioritet: P3

---

## Tverrgående funn (redesign-relevant)

1. **Eget designsystem, ikke athletic.** Stats bruker `stats.css` (`--s-*`-tokens) + `src/components/stats/` (28 komponenter). Token-verdiene speiler globals.css lyst tema (samme HEX: bg `#FAFAF7`, fg `#0A1F17`, primary `#005840`, accent `#D1F843`), men er **duplisert som `--s-*`-aliaser på `:root`** (`stats.css:9-32`) — ikke koblet til globale tokens. Redesign-beslutning: behold eget spor eller konsolider mot globals.css/athletic.
2. **Ingen `layout.tsx`** → ingen delt stats-shell, ingen montert nav, hver side `import`-er stats.css enkeltvis. `StatsCmdK` (tiltenkt global nav) er bygget men ikke wiret. Naturlig redesign-grep: én `stats/layout.tsx` som monterer Cmd+K + stats-topbar og fjerner per-side CSS-importer.
3. **Foreldreløs fra marketing-nav** (header ekskluderer Stats fra v1, `marketing-header.tsx:5`). Inngang i dag kun via direkte URL / interne stats-lenker.
4. **Auth-grense uskarp:** `/stats/min-progresjon`, `/stats/sg-sammenlign/start` og `.../resultat/[id]` krever konto, men ligger i offentlig marketing-flate. IA-spørsmål for redesign: skal personlig SG-progresjon høre til PlayerHQ (`/portal`) i stedet?
5. **Hardkodede tall på hub** (`/stats` hero-side: 1175/1299/2497) er datagjeld — live-tall finnes i samme query-lag og bør brukes.
6. **Modne, konsistente familier:** 6 PGA-kategorisider deler `PgaKategoriDetaljPage`; 5 verktøy deler client-kalkulator-mønster — billig å redesigne samlet (én mal → 6/5 ruter).
