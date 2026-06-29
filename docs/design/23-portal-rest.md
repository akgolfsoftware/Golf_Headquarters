# PlayerHQ (resten av /portal) — skjermkort (kode-verifisert 2026-06-29)

67 ruter dekket (hjem, analyse, baneguide, booking, coach/*, drills, gjennomføre, kalender, planlegge, statistikk, talent, trackman, trening, utfordringer, varsler, ai/*, agent-pipeline, onskeligokt, reach, spiller, ny-okt). Dominerende mønster: server-component som henter Prisma-data og rendrer enten en hybrid-klientkomponent (`@/components/portal/...`) eller inline JSX i «editorial lys hero + terminal-data»-stilen — PlayerHQ er gjennomgående LYST og mobil-først (max-w 430–480px). Største gjeld: (1) hardkodet hex/rgba i inline `style` på mange skjermer (kalender, talent, coach/sg-hub, ovelser, gjennomfore-kort) i strid med token-regelen, (2) navne-kanon-brudd — `coach/melding/ny` faller tilbake på «Hans Brennum/Linn Knutsen/Espen Søvik» og flere skjermer hardkoder «Anders», (3) flere coach-detalj-skjermer har statiske/proxy-tall (sertifiseringer, rating 4,9, COACH_SG-referanser, smash-proxy SG) og «PRE-BETA»-talent som ikke er ekte data.

---

### /portal
- Fil: src/app/portal/page.tsx
- Flate: PlayerHQ hjem
- Rolle/gating: requirePortalUser; PARENT→/forelder, GUEST→/admin/kalender
- Jobb: Spillerens dashboard-landingsside.
- Data vist: alt via `getDashboardData(user.id)` → `HybridHomePage` (`@/components/portal/dashboard/HybridHomePage`)
- Komponenter: `HybridHomePage` (delt, lokal til portal)
- Layout og hierarki: tynn server-wrapper; all layout i klientkomponenten. Skall (topbar/sidebar/bottom-nav) eies av PortalShell.
- Tilstander: redirects for PARENT/GUEST; resten i HybridHomePage (ikke verifisert her)
- Interaksjoner: delegert til HybridHomePage
- AK-domene vist: avhenger av HybridHomePage (UVERIFISERT i denne filen)
- Designfil-referanse: hybrid-design 2026-06-17 (nevnt i fil-doc)
- Nåværende designkvalitet: ferdig (wrapper) — innhold ligger i komponent utenfor scope
- Redesign-prioritet: P2 (selve siden er stub; HybridHomePage avgjør)

### /portal/analyse
- Fil: src/app/portal/analyse/page.tsx
- Flate: redirect
- Rolle/gating: ingen — `permanentRedirect("/portal/analysere")`
- Jobb: Legacy-URL → analysere. **Stub.**
- Redesign-prioritet: P3

### /portal/analysere
- Fil: src/app/portal/analysere/page.tsx
- Flate: PlayerHQ Analyse (samlet — faner SG · Runder · TrackMan · Tester)
- Rolle/gating: requirePortalUser; GUEST/PARENT redirect
- Jobb: Samlet analyse-flate (låst IA: analyse er én flate med faner).
- Data vist: `loadAnalyticsWorkbenchData(user.id)` → `HybridAnalysePage`
- Komponenter: `HybridAnalysePage` (`@/components/portal/analytics/HybridAnalysePage`)
- Layout og hierarki: tynn wrapper; alt i klientkomponent
- Tilstander: i komponent (UVERIFISERT her)
- AK-domene vist: SG/TrackMan/Runder/Tester (via komponent)
- Designfil-referanse: hybrid-design 2026-06-17
- Nåværende designkvalitet: ferdig (wrapper)
- Redesign-prioritet: P2

### /portal/analysere/hull
- Fil: src/app/portal/analysere/hull/page.tsx
- Flate: Hull-analyse (top-down sone-kart)
- Rolle/gating: requirePortalUser
- Jobb: Vise hvor spilleren taper slag per sone (Tee→Innspill→Nærspill→Putt) med ekte SG + trening.
- Data vist: SG per sone → `BrukerSgInput` (siste 8); trening per skillArea → `TrainingPlanSession` (siste 30 d); siste runde hull-for-hull → `Round.holeScores`
- Komponenter: `HullTabs` (lokal), `HoleZone`-type fra `@/components/hole-analysis/hole-analysis`
- Layout og hierarki: tilbake-lenke → mono eyebrow + display-tittel «Hvor taper du *slag*?» → HullTabs (sone-kart + siste-runde-tabell). max-w 440px.
- Tilstander: empty når ingen SG/runde (håndtert i HullTabs); ingen eksplisitt loading/error
- Interaksjoner: faner i HullTabs
- AK-domene vist: SG (sgOtt/sgApp/sgArg/sgPutt), trening per pyramide-skillArea, hull-score-diff
- Designfil-referanse: ingen prototype (nevnt ikke)
- Nåværende designkvalitet: ferdig — token-rent, editorial
- Redesign-prioritet: P2

### /portal/baneguide
- Fil: src/app/portal/baneguide/page.tsx
- Flate: Baneguide-bibliotek (fase 5)
- Rolle/gating: requirePortalUser
- Jobb: Liste baner spilleren har spilt + geometri-status.
- Data vist: `getBaneLibrary(user.id)` → navn, klubb, hasGeometry, holesMapped, playerRounds
- Komponenter: `AthleticEyebrow`, `AthleticBadge` (athletic)
- Layout og hierarki: eyebrow + «Banene dine» + sub → liste med MapPin-avatar + badge (lime «N hull» / neutral «Kommer») + runde-teller + ChevronRight. max-w 2xl.
- Tilstander: empty («Ingen baner ennå»); ingen loading/error
- Interaksjoner: rad → /portal/baneguide/[id]
- AK-domene vist: dispersion/geometri-tilgjengelighet (hull kartlagt)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P2

### /portal/baneguide/[baneId]
- Fil: src/app/portal/baneguide/[baneId]/page.tsx
- Flate: Banekart-oversikt (satellitt + hull-liste)
- Rolle/gating: requirePortalUser; notFound hvis ikke funnet
- Jobb: Hele banen på satellitt + hull-liste med slag-antall per hull.
- Data vist: `getBaneOverview(baneId, user.id)` → bane (geojson, lat/lng), holes (par, lengthMeter, shotCount), parSum
- Komponenter: `CourseMap` (`@/components/baneguide/course-map`), `AthleticEyebrow`
- Layout og hierarki: eyebrow (banenavn) + «Banekart» + meta → CourseMap (340px) → hull-liste med nummer-chip + par/lengde + slag-antall.
- Tilstander: notFound; tom hull-liste mulig; `geojson as unknown as` cast (ikke zod-validert)
- Interaksjoner: hull-rad → /baneguide/[id]/hull/[nr]
- AK-domene vist: slag-antall per hull (dispersion-grunnlag)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig
- Redesign-prioritet: P2

### /portal/baneguide/[baneId]/hull/[nr]
- Fil: src/app/portal/baneguide/[baneId]/hull/[nr]/page.tsx
- Flate: Hull-detalj (signaturskjerm — spredning + dispersion-KPI)
- Rolle/gating: requirePortalUser; notFound
- Jobb: Satellitt + spillerens spredning + KPI fra dispersion-motoren + innsikt.
- Data vist: `getHoleDetail(baneId, holeNumber, user.id, ShotType)` → tee/green, landings, stats (std.lateral/distance, bias). Segment via `?type=utslag|innspill|putt`.
- Komponenter: `CourseMap` (shotPoints/aimLine), `KpiCard` (athletic), `AthleticEyebrow`
- Layout og hierarki: tilbake → eyebrow lime + «Hull N» + par/lengde → CourseMap m/spredning → segment-pills → KPI-grid (σ side, σ lengde, bias, N) → innsikt-kort (forest bg, lime accent) med miss-retning.
- Tilstander: notFound; empty («Ingen … plottet på dette hullet ennå»); ingen loading
- Interaksjoner: segment-pills → `?type=`
- AK-domene vist: dispersion (σ lateral/distance, bias H/V), SG-segment via ShotType
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — signatur-kvalitet, token-rent
- Redesign-prioritet: P3 (allerede sterk)

### /portal/booking
- Fil: src/app/portal/booking/page.tsx
- Flate: Booking-hub (hybrid)
- Rolle/gating: requirePortalUser allow PLAYER/COACH/ADMIN
- Jobb: Bookings-landing — credits, kommende/forrige, coacher, mini-kalender.
- Data vist: `getBookingHubData(user.id)` → credits, upcoming, past, coaches → `BookingHubHybrid`
- Komponenter: `BookingHubHybrid` (`@/components/portal/booking/booking-hub-hybrid`)
- Layout og hierarki: tynn wrapper; layout i klientkomponent (editorial hero + mini-kalender + mine bookinger)
- Tilstander: i komponent (UVERIFISERT her)
- Interaksjoner: dag-klikk → /portal/booking/ny?dato=
- AK-domene vist: credits-saldo
- Designfil-referanse: `PlayerHQ Booking (hybrid).dc.html` (prosjektgjennomgang-2026-06-17)
- Nåværende designkvalitet: ferdig (wrapper)
- Redesign-prioritet: P2

### /portal/booking/ny
- Fil: src/app/portal/booking/ny/page.tsx
- Flate: Booking-wizard (mobil 480px) — 3 steg + bekreft
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN; redirect /coaching hvis ingen/0-credit-abonnement
- Jobb: Velg tjeneste → dato/tid → bekreft via credits.
- Data vist: `Subscription` (credits), `ServiceType` (active, varighet, pris, slug), `Location`+`Facility`, `getAvailableSlots`. Query-drevet steg (`?service`, `?dato`).
- Komponenter: `CreditMeter` (`@/components/portal/abonnement`), `DatoVelger`, `SlotGrid` (lokale `_components`), lokale `Eyebrow`/`StegIndikator`/`SummaryRow`
- Layout og hierarki: hero → steg-prikker → free-gate-kort → credit-saldo (40px mono-tall) → steg 1 tjeneste-kort → context-kort → steg 2 dato+slots → steg 3 bekreft-oppsummering + saldo-før/etter.
- Tilstander: free-gate (warning-kort + «Oppgrader til Pro»); «brukt opp credits»-view (`BruktOppView`); empty slots; ingen tjenester-melding; redirect for inaktiv abonnement
- Interaksjoner: tjeneste/dato-valg via query; slot-trykk → /booking/ny/bekreft
- AK-domene vist: credits-økonomi, GRATIS-tier-gate, tjeneste-lokasjons-mapping (trackman→Mulligan)
- Designfil-referanse: `_prompts/SKJERMER-RUNDE-7-BOOKING.md`
- Nåværende designkvalitet: ferdig — token-rent, rik wizard
- Redesign-prioritet: P2

### /portal/booking/ny/bekreft
- Fil: src/app/portal/booking/ny/bekreft/page.tsx
- Flate: Credit-booking bekreftelse
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN; redirects på manglende abonnement/credits
- Jobb: Endelig bekreftelse + notat før credit-trekk.
- Data vist: query `service`/`start`/`coach`; `Subscription`, `ServiceType`, coach (User), `isSlotStillAvailable`
- Komponenter: `BekreftForm` (lokal client)
- Layout og hierarki: tilbake → «Bekreft *booking*» → ledig-feilbanner (hvis tatt) → oppsummering (dl) → betaling/credit-saldo → BekreftForm → trygghets-fot.
- Tilstander: notFound (manglende params/service/coach); slot-tatt-feilmelding; redirects
- AK-domene vist: credits-saldo før/etter
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig
- Redesign-prioritet: P2

### /portal/booking/bekreftet
- Fil: src/app/portal/booking/bekreftet/page.tsx
- Flate: Booking-kvittering (forespørsel sendt)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN; notFound uten bookingId/eierskap
- Jobb: Bekreftelse + «legg i Google-kalender».
- Data vist: `Booking` (serviceType, location, coach via coachUserId)
- Komponenter: inline (sentrert sjekk-sirkel, coach-kort)
- Layout og hierarki: sjekk-sirkel → «Forespørsel *sendt!*» → coach-kort (initialer fra navn) → «Legg i kalender» (Google-template-URL) + «Se alle bookinger».
- Tilstander: notFound
- Interaksjoner: Google-kalender-lenke (ekstern), → /portal/meg/bookinger
- AK-domene vist: ingen
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P3

### /portal/booking/[bookingId]
- Fil: src/app/portal/booking/[bookingId]/page.tsx
- Flate: Økt-detalj (planlagt booking)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN; notFound uten eierskap
- Jobb: Detaljer om planlagt økt — tidslinje, mål, utstyr.
- Data vist: `Booking` (serviceType, location, coach, status, notes). **MÅL/UTSTYR/TIMELINE er hardkodet** (MAL, UTSTYR, TIMELINE-arrays) — ikke ekte data.
- Komponenter: inline; importerer `@/components/booking/booking.css` (egen CSS-fil, `bk-`-klasser — utenfor token-systemet)
- Layout og hierarki: bk-topnav → status-badge → tittel «Tjeneste — *Sted*» → meta-rad → Mål → Tidslinje → Ta med → notat → actions.
- Tilstander: notFound; status-badge fra ekte status; notat conditional
- Interaksjoner: «Alt er klart» → /booking/bekreftet; tilbake
- AK-domene vist: ingen (mål/struktur er placeholder)
- Designfil-referanse: «Økt-detalj planlagt.html (Bundle 3)»
- Nåværende designkvalitet: inkonsistent — bruker egen `booking.css` (`bk-`-klasser, hardkodet `#4A5418`), og fabrikerte MÅL/UTSTYR/TIMELINE
- Redesign-prioritet: P1 (token-drift + fake-data)

### /portal/booking/anlegg/[anleggId]
- Fil: src/app/portal/booking/anlegg/[anleggId]/page.tsx
- Flate: Anlegg/lokasjon-detalj (desktop-bred 1240px)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN; notFound
- Jobb: Vise én Location + fasiliteter, lenke til booking-flyt.
- Data vist: `Location` (name, address, `Facility`-rader med type/isIndoor/description). Bevisst ingen specs/rating (finnes ikke i modell).
- Komponenter: inline; `FacilityType`-enum-labels
- Layout og hierarki: tilbake → HERO (forest-gradient inline-style m/`var(--forest-deep)` + radial lime) → fasilitet-grid (Inne/Ute-badge) → sticky CTA «Velg tid i booking».
- Tilstander: notFound; empty fasiliteter
- Interaksjoner: → /portal/booking/ny
- AK-domene vist: fasilitet-typer (STUDIO/RANGE/COURSE)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: halvferdig — hero bruker inline gradient med rå rgba/hex (`rgba(209,248,67,0.18)`) + `var(--forest-deep)`; token-drift
- Redesign-prioritet: P1

### /portal/booking/coach/[coachId]
- Fil: src/app/portal/booking/coach/[coachId]/page.tsx
- Flate: Book direkte med coach (desktop 1240px)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN; notFound
- Jobb: Coach-inngangspunkt til booking — tjenester + felles-økt-teller.
- Data vist: coach via `resolveCoach` (cuid ELLER fornavn-slug fra anlegg-lenker), `coachingSession.count`, `serviceType` (coachUserId). `user.tier` for Pro-gate.
- Komponenter: inline
- Layout og hierarki: tilbake → HERO (avatar + navn + ambition + felles-økter-stat) → tjeneste-liste → sticky bekreft-kort + «Send melding» + GRATIS-Pro-banner + kontakt.
- Tilstander: notFound; empty tjenester; GRATIS-tier-banner
- Interaksjoner: tjeneste → /booking/ny?coachId&service; melding → /coach/melding
- AK-domene vist: GRATIS-tier-gate, felles-øktteller
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig (token-rent). NB-kommentar: anlegg-lenker bruker fornavn-slug → teknisk gjeld (resolveCoach er workaround)
- Redesign-prioritet: P2

### /portal/coach
- Fil: src/app/portal/coach/page.tsx
- Flate: Coach Hub (hybrid)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN/GUEST
- Jobb: Spillerens coach-landing — insight, kommende økter, meldinger-preview.
- Data vist: `getCoachProfile`, `getMessages`, `getUpcomingSessions`, `getCoachNotes` (alle fra lokal `./actions`)
- Komponenter: `MessageThread` (`@/components/portal/coach`); inline timeline/bubbles
- Layout og hierarki: eyebrow «Coach · {navn}» + «Din *coach*» → insight-kort (lime left-border, ukes-fokus fra siste notat) → event-timeline (3-state dots m/inline `var(--accent)`) → meldinger-preview (bobler m/inline-style farger) → desktop full MessageThread. max-w 430/860px.
- Tilstander: ingen-coach-tilstand; tom timeline; tom meldinger
- Interaksjoner: send melding/booking-CTA; bobler; «Se alle N sesjoner»
- AK-domene vist: coach-fokus-notat
- Designfil-referanse: hybrid-design 2026-06-17
- Nåværende designkvalitet: halvferdig — flere inline `style={{ background: "var(--...)" }}` for bobler/dots (kunne vært klasser); ellers token-tro
- Redesign-prioritet: P2

### /portal/coach/[coachId]
- Fil: src/app/portal/coach/[coachId]/page.tsx
- Flate: Coach-profil (desktop 1240px)
- Rolle/gating: requirePortalUser; GRATIS→Pro-gate; notFound hvis role≠COACH
- Jobb: Full coach-profil — quote, stats, sertifiseringer.
- Data vist: `User` (name/email/avatar/ambition), `coachingSession.count`. **Stats «Snittsvar 4 t», «Rating 4,9», CERTIFICATIONS-array er hardkodet/statisk.**
- Komponenter: `PlayerHero` (`@/components/portal/player-hero`), inline Stat
- Layout og hierarki: tilbake → PlayerHero (eyebrow + «Din coach *Navn*» + actions send melding/be om økt) → profilkort + stats → sertifiseringer → booking-info (dashed, «UI for ledige tider bygges i senere fase»).
- Tilstander: GRATIS-gate; notFound
- AK-domene vist: MORAD-sertifisering (statisk liste); felles-økter
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: inkonsistent — statiske stats/rating/sertifiseringer presentert som ekte; «booking bygges senere»-tekst er stale (booking finnes)
- Redesign-prioritet: P1

### /portal/coach/ai
- Fil: src/app/portal/coach/ai/page.tsx
- Flate: AI-coach (chat)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN/PARENT; GRATIS→Pro-gate
- Jobb: Personlig AI-coach-chat med kontekst.
- Data vist: siste/ny `coachingSession` (kind AI), initialMessages parses fra JSON (`ChatMelding` fra `@/lib/anthropic`)
- Komponenter: `PlayerHero`, `AiChat` (lokal), `ChatToolbar` (lokal)
- Layout og hierarki: grid `auto/auto/1fr` → PlayerHero-header → avatar-header med Sparkles-badge → AiChat (fyller resten).
- Tilstander: GRATIS-gate; `?ny=1` for ny sesjon; TODO-kommentar: «hent reell kontekst-info»
- Interaksjoner: chat-input, toolbar
- AK-domene vist: AI-kontekst (profil/aktivitet — delvis TODO)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig (skall); kontekst-strip er TODO
- Redesign-prioritet: P2

### /portal/coach/melding
- Fil: src/app/portal/coach/melding/page.tsx
- Flate: Coach Meldinger (hybrid)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN/PARENT; GRATIS→Pro-gate
- Jobb: Skriv til coach + historikk + Q&A-inngang.
- Data vist: `User` (COACH), `coachingSession` (kind DIRECT, siste 20) → historikk-snippets
- Komponenter: `MeldingForm` (lokal)
- Layout og hierarki: tilbake → «Ny *melding*» → mottaker-kort (hovedcoach) → MeldingForm → historikk-liste → Q&A-kort med CTA til /coach/sporsmal/ny. max-w 430/860px.
- Tilstander: GRATIS-gate; conditional historikk
- Interaksjoner: send; historikk-rader; «Still spørsmål»
- AK-domene vist: ingen
- Designfil-referanse: hybrid-design 2026-06-17
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P2

### /portal/coach/melding/[id]
- Fil: src/app/portal/coach/melding/[id]/page.tsx
- Flate: Meldingstråd
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN/PARENT; «tråd ikke funnet» uten eierskap
- Jobb: Full chat-tråd mot coach.
- Data vist: `coachingSession` (messages JSON → items), coach-navn/initialer
- Komponenter: `TradUi` (lokal client), `MeldingHeaderKnapper` (lokal)
- Layout og hierarki: nav (crumb) → sticky thread-header (avatar + «Pålogget · hovedcoach · GFGK») → TradUi. Egen min-h-screen-flate (ikke standard portal-padding).
- Tilstander: tråd-ikke-funnet-fallback; tom tråd = ærlig tom
- Interaksjoner: send i TradUi; vedlegg-lenke; header-knapper
- AK-domene vist: «GFGK»-tekst hardkodet i status-linje
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig; «Pålogget · GFGK» er statisk presence-tekst
- Redesign-prioritet: P2

### /portal/coach/melding/[id]/vedlegg
- Fil: src/app/portal/coach/melding/[id]/vedlegg/page.tsx
- Flate: Vedlegg-galleri
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN/PARENT; notFound hvis ikke part/ADMIN
- Jobb: Alle vedlegg i en meldingstråd (signerte URL-er).
- Data vist: `messageAttachment` (fileName/type/size), signed URL via `getSignedUrl(MESSAGE_ATTACHMENTS)`
- Komponenter: `VedleggUi` (lokal)
- Layout og hierarki: nav (crumb) → VedleggUi. min-h-screen-flate.
- Tilstander: notFound (access-sjekk er eneste vern — storage omgår RLS)
- AK-domene vist: ingen
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig (tynn server-wrapper)
- Redesign-prioritet: P3

### /portal/coach/melding/ny
- Fil: src/app/portal/coach/melding/ny/page.tsx
- Flate: Ny melding (compose, desktop 880px)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN/PARENT
- Jobb: Utgående melding til coach/fysio/mentor.
- Data vist: `User` (COACH, take 4). **FALLBACK-MOTTAKERE HARDKODET: «Hans Brennum/Linn Knutsen/Espen Søvik/Anders K.»** når ingen coacher — navne-kanon-brudd. Roller «Fysio/Mentor/Sub-coach» tildeles per indeks (fabrikert).
- Komponenter: `NyMeldingClient` (lokal)
- Layout og hierarki: nav (crumb) → «Ny *melding*» + lead → NyMeldingClient.
- Tilstander: fallback-mottakere; ingen empty
- AK-domene vist: ingen
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: stygg/inkonsistent — hardkodede demo-navn (Hans Brennum osv.) i strid med Øyvind/Anders-kanon; fabrikerte roller per indeks
- Redesign-prioritet: P1

### /portal/coach/notes
- Fil: src/app/portal/coach/notes/page.tsx
- Flate: Coach-notater (desktop 1240px)
- Rolle/gating: requirePortalUser; GRATIS→Pro-gate
- Jobb: Notater (coach-meldinger) fra DIRECT-sesjoner.
- Data vist: `coachingSession` (DIRECT) → coach-meldinger som notater; nye-i-uka-teller
- Komponenter: `PlayerHero`, `EmptyState`, inline StatPill
- Layout og hierarki: hero (ringed avatar + stat-pills + «Svar coach»/«Be om vurdering») → insight-banner → notat-feed (8/12-kol) + quote-sidebar.
- Tilstander: GRATIS-gate; egen empty-hero + EmptyState når 0 notater
- Interaksjoner: → /coach/melding (svar/vurdering); → /coach/notes/[id]
- AK-domene vist: ingen
- Designfil-referanse: «coaching-detail-demo» (nevnt i fil-doc)
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P2

### /portal/coach/notes/[noteId]
- Fil: src/app/portal/coach/notes/[noteId]/page.tsx
- Flate: Notat-detalj
- Rolle/gating: requirePortalUser; GRATIS→Pro-gate; notFound uten eierskap (med COACH/ADMIN-unntak)
- Jobb: Én coaching-sesjon som notat med fokus-fragmenter.
- Data vist: `coachingSession` (messages → coach-fragmenter som tittel/fokus). **TAGS = `["TEK","SLAG","pitch-konsistens"]` hardkodet.**
- Komponenter: `PlayerHero`, `EmptyState`
- Layout og hierarki: tilbake → PlayerHero → hovedinnhold (fragmenter som blockquotes) + sidebar (knyttet samtale, coach-info, tags, relaterte).
- Tilstander: notFound; empty-innhold
- AK-domene vist: TAGS hardkodet (TEK/SLAG = pyramide-akser, men statiske)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: inkonsistent — statiske TAGS presentert som ekte
- Redesign-prioritet: P2

### /portal/coach/ovelser
- Fil: src/app/portal/coach/ovelser/page.tsx
- Flate: Coach Øvelsesbibliotek (hybrid)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN
- Jobb: Drill-bibliotek-grid m/pyramide-filter.
- Data vist: `exerciseDefinition` (filtrert på `pyramidArea` via `?area`)
- Komponenter: `ExerciseCardActions` (lokal), `EmptyState`, inline `OvelseCard`
- Layout og hierarki: «Øvelser fra *Anders*» (**hardkodet «Anders»**) + teller + «Ny øvelse» → filter-chips (Alle/FYS/TEK/SLAG/SPILL/TURN) → 2/3/4-kol grid med forest-gradient-thumbnail (inline `linear-gradient(150deg,#2f5a2c,#0a2417)` + lime-grid-overlay rgba).
- Tilstander: empty (EmptyState + CTA)
- Interaksjoner: chips → `?area`; kort → /portal/drills/[id]; «Ny øvelse»
- AK-domene vist: pyramide-områder (FYS/TEK/SLAG/SPILL/TURN)
- Designfil-referanse: fasit B5 · Innhold
- Nåværende designkvalitet: halvferdig — hardkodet «Anders»; forest-gradient + lime-grid som inline hex/rgba (token-drift)
- Redesign-prioritet: P1

### /portal/coach/ovelser/ny
- Fil: src/app/portal/coach/ovelser/ny/page.tsx
- Flate: Ny øvelse (editor)
- Rolle/gating: requirePortalUser COACH/ADMIN
- Jobb: Opprett ExerciseDefinition. **Coach-only.**
- Data vist: ingen (tom editor)
- Komponenter: `PlayerHero`, `DrillEditor` (`@/components/portal/drill-editor`, mode=create)
- Layout og hierarki: tilbake → PlayerHero (eyebrow «AgencyOS · Ny øvelse» — NB AgencyOS-eyebrow på portal-rute) → DrillEditor.
- Tilstander: i editor
- AK-domene vist: avhenger av DrillEditor (pyramide/CS)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig (tynn); eyebrow sier «AgencyOS» på /portal — inkonsistent merking
- Redesign-prioritet: P2

### /portal/coach/ovelser/[id]/rediger
- Fil: src/app/portal/coach/ovelser/[id]/rediger/page.tsx
- Flate: Rediger øvelse
- Rolle/gating: requirePortalUser COACH/ADMIN; notFound
- Jobb: Rediger ExerciseDefinition. **Coach-only.**
- Data vist: `exerciseDefinition` (initial)
- Komponenter: `PlayerHero` (eyebrow «AgencyOS · Rediger øvelse»), `DrillEditor` (mode=edit)
- Layout og hierarki: tilbake → PlayerHero → DrillEditor
- Tilstander: notFound
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig (tynn); samme AgencyOS-eyebrow-inkonsistens
- Redesign-prioritet: P2

### /portal/coach/videoer
- Fil: src/app/portal/coach/videoer/page.tsx
- Flate: Coach Videoer (hybrid)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN
- Jobb: Videoer (swing-analyse/drill-demo) fra coach.
- Data vist: `sessionVideo` (playerId, status READY, coach-navn)
- Komponenter: `PlayerVideoCard` (lokal)
- Layout og hierarki: tilbake → «Videoer fra *Anders*» (**hardkodet «Anders»**) → liste med PlayerVideoCard. Empty: forest-gradient placeholder + play-ikon.
- Tilstander: empty (inline forest-gradient `linear-gradient(150deg,#2f5a2c,#0a2417)` + hardkodet lime `#D1F843` i SVG)
- AK-domene vist: video-tags (via kort)
- Designfil-referanse: fasit B5 · Innhold (Videoer-fane)
- Nåværende designkvalitet: halvferdig — hardkodet «Anders» + hardkodet hex i empty
- Redesign-prioritet: P1

### /portal/coach/sg-hub
- Fil: src/app/portal/coach/sg-hub/page.tsx
- Flate: Coach SG-sammenligning (hybrid)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN
- Jobb: Spiller-SG H2H mot coach-referanse + gap-innsikt.
- Data vist: siste `brukerSgInput` (spiller). **`COACH_SG = {ott:0.8,app:0.9,arg:0.2,putt:0.6}` HARDKODET** referanse. Coach-navn fra DB (fallback «Anders Kristiansen»).
- Komponenter: inline (bilateral progress-bar)
- Layout og hierarki: tilbake → «Sammenlign med coach» + coach-navn → H2H-bar per kategori (OTT/APP/ARG/PUTT, inline `#7BA428`/`#1A7D56`/`#A32D2D` farger) → gap-innsikt (lime left-border) → Utstyr/Per-kølle-lenker (til /portal/mal/sg-hub).
- Tilstander: ingen-data-melding (ingen SG)
- Interaksjoner: → /portal/mal/sg-hub*
- AK-domene vist: SG per kategori, største-gap-beregning
- Designfil-referanse: hybrid-design 2026-06-17
- Nåværende designkvalitet: inkonsistent — COACH_SG hardkodet (referanse-tall), flere hardkodede hex i bar-farger; lenker til /portal/mal/* (utenfor scope)
- Redesign-prioritet: P1

### /portal/coach/plans
- Fil: src/app/portal/coach/plans/page.tsx
- Flate: Coach Planer hub (kanban)
- Rolle/gating: requirePortalUser; GRATIS→Pro-gate
- Jobb: Planene coach har laget (Aktiv/Fullført/Pause-kolonner).
- Data vist: `trainingPlan` (userId, createdById≠null) + sessions-status → progress-%
- Komponenter: `EmptyState`, inline KanbanCol/PlanKCard
- Layout og hierarki: «Mine *planer*» + «Fra Anders Kristiansen» (**hardkodet**) + «Be om plan» → kanban (3 kol, horisontal scroll mobil) med progress-bar (inline forest→lime gradient `var(--forest),#b5d629`).
- Tilstander: GRATIS-gate; EmptyState
- Interaksjoner: kort → /coach/plans/[id]; «Be om plan» → /onskeligokt
- AK-domene vist: plan-status, gjennomføringsgrad
- Designfil-referanse: fasit B5 · Planer (Hub)
- Nåværende designkvalitet: halvferdig — hardkodet «Anders Kristiansen»; inline gradient-hex
- Redesign-prioritet: P1

### /portal/coach/plans/[planId]
- Fil: src/app/portal/coach/plans/[planId]/page.tsx
- Flate: Coach Plan-detalj (rik)
- Rolle/gating: requirePortalUser; GRATIS→Pro-gate; notFound uten eier/stab
- Jobb: Full plan — coach-notat, fremgang, 5-fase-progresjon, drills, kommende, pyramide, mål.
- Data vist: `trainingPlan` (sessions+drills+exercise), coach (createdById), siste DIRECT-`coachingSession` (coach-notat), `goal` (ACTIVE), pyramide-fordeling via `@/lib/pyramide`. `planSessionStartHref`.
- Komponenter: `AthleticBadge`, `EmptyState`, `PlayerPlanActions` (lokal), inline TypeTag/FASER
- Layout og hierarki: tilbake → tittel + meta + AKTIV-badge → accept/reject-actions (PENDING/REJECTED) → coach-notat (lime border) → planfremgang (forest→lime bar) → 5-fase-strip → drills m/«Utfør» → kommende økter → pyramide-fordeling (5 områder) → plan-mål → insight-banner → «Start ny økt fra plan» → accept-actions (desktop).
- Tilstander: GRATIS-gate; notFound; empty kommende; conditional mål/drills/insight; plan-status-flyt
- Interaksjoner: accept/reject; «Utfør» → session-href; «Start ny økt»
- AK-domene vist: pyramide-fordeling (FYS/TEK/SLAG/SPILL/TURN), 5-fase-periodisering, SG_AREA/HCP_TARGET-mål, plan-status (PENDING_PLAYER osv.)
- Designfil-referanse: fasit B5 · Planer (Detalj)
- Nåværende designkvalitet: halvferdig — rik og token-tro, men `FASER` (Generell/Spesifikk/Taper/Toppform/Restitusjon) + inline gradient-hex `#b5d629`
- Redesign-prioritet: P1 (mest dataverdi; gradient-drift)

### /portal/coach/plans/[planId]/ny-okt
- Fil: src/app/portal/coach/plans/[planId]/ny-okt/page.tsx
- Flate: Legg til økt i plan
- Rolle/gating: requirePortalUser COACH/ADMIN; notFound
- Jobb: Coach legger økt i en plan. **Coach-only.**
- Data vist: `trainingPlan` (navn), `exerciseDefinition` (alle)
- Komponenter: `PlayerHero` (eyebrow «AgencyOS · Ny økt»), `AddSessionWizard` (`@/components/admin/add-session-wizard` — admin-komponent på portal)
- Layout og hierarki: tilbake → PlayerHero → AddSessionWizard
- Tilstander: notFound
- AK-domene vist: i wizard
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig (tynn); bruker admin-wizard + AgencyOS-eyebrow på portal-rute
- Redesign-prioritet: P2

### /portal/coach/plans/perioder
- Fil: src/app/portal/coach/plans/perioder/page.tsx
- Flate: Periode-oversikt (årsplan per spiller)
- Rolle/gating: requirePortalUser COACH/ADMIN
- Jobb: Sesongperioder per spiller (L-fase-blokker). **Coach-only.**
- Data vist: `User` (PLAYER med seasonPlans) → seneste `seasonPlan` + `periodBlocks` (lPhase, datoer, focus, weeklyVol)
- Komponenter: `PeriodeEditor` (lokal), `Image`
- Layout og hierarki: «Periode*-oversikt*» → per spiller: header (avatar + sesong/N-perioder) + PeriodeEditor.
- Tilstander: empty (ingen sesongplaner); per-spiller fallback
- AK-domene vist: L-fase-perioder (GRUNN/SPESIAL/TURNERING via PeriodeEditor), ukentlig volum
- Designfil-referanse: fasit B5 · Planer (Perioder)
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P2

### /portal/coach/sporsmal
- Fil: src/app/portal/coach/sporsmal/page.tsx
- Flate: Spørsmål-innboks (coach)
- Rolle/gating: requirePortalUser COACH/ADMIN
- Jobb: Q&A rettet til coach + åpen kø. **Coach-only.**
- Data vist: `question` (coachUserId=user ELLER null, take 50) + asker-navn
- Komponenter: inline
- Layout og hierarki: nav (crumb) → «Spørsmål fra *spillere*» → liste med asker-avatar + Besvart/Åpent-pill + tittel. max-w 760px, min-h-screen.
- Tilstander: empty («Ingen spørsmål ennå»)
- Interaksjoner: rad → /coach/sporsmal/[id]
- AK-domene vist: ingen
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P2

### /portal/coach/sporsmal/[id]
- Fil: src/app/portal/coach/sporsmal/[id]/page.tsx
- Flate: Spørsmål-detalj
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN/PARENT; notFound
- Jobb: Vise spørsmål + svar, eller svar-skjema.
- Data vist: `question` (title/body/answer/answeredAt/status), asker
- Komponenter: `SporsmalReaksjoner`, `RelaterteSporsmal`, `SvarSkjema` (lokal `sporsmal-interaktiv`)
- Layout og hierarki: nav → header (besvart/venter) → spørsmål-kort → svar-kort ELLER svar-skjema → reaksjoner → relaterte («3 relaterte» — RelaterteSporsmal kan være statisk).
- Tilstander: notFound; besvart vs ubesvart
- AK-domene vist: ingen
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig; «3 relaterte» og RelaterteSporsmal sannsynlig statisk (UVERIFISERT — i klientkomp)
- Redesign-prioritet: P2

### /portal/coach/sporsmal/ny
- Fil: src/app/portal/coach/sporsmal/ny/page.tsx
- Flate: Still spørsmål (spiller)
- Rolle/gating: requirePortalUser PLAYER/PARENT
- Jobb: Spiller stiller spørsmål + ser egne.
- Data vist: egne `question` (take 20). `?sendt` for kvittering.
- Komponenter: `StillSporsmalForm` (lokal)
- Layout og hierarki: nav → «Still spørsmål til *coach*» + lead → sendt-banner → form → «Mine spørsmål»-liste (Besvart/Venter).
- Tilstander: empty; sendt-banner
- AK-domene vist: ingen
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P2

### /portal/drills
- Fil: src/app/portal/drills/page.tsx
- Flate: Drill-galleri (hybrid)
- Rolle/gating: requirePortalUser
- Jobb: Drill-bibliotek med filter.
- Data vist: `getDrillLibrary(user.id)` → `DrillGallery`
- Komponenter: `DrillGallery` (`@/components/portal/drills/drill-gallery`)
- Layout og hierarki: tynn wrapper; grid + filter-pills i klientkomp.
- Tilstander: tom DB → tom liste (i komp)
- AK-domene vist: pyramide-akse, CS-link (i kort)
- Designfil-referanse: hybrid-design 2026-06-17
- Nåværende designkvalitet: ferdig (wrapper)
- Redesign-prioritet: P2

### /portal/drills/[id]
- Fil: src/app/portal/drills/[id]/page.tsx
- Flate: Drill-detalj (v10-fasit)
- Rolle/gating: requirePortalUser PLAYER/PARENT
- Jobb: Drill-detalj — meta, trinn, media, parametre.
- Data vist: `loadDrillDetalj(id, {id,hcp})` → mappes til v10 `DrillDetaljData`. coachInitials hardkodet «AK».
- Komponenter: `DrillDetalj` (`@/components/portal/drills/drill-detalj`)
- Layout og hierarki: not-found-fallback ELLER `<DrillDetalj>` (meta-chips, checkable trinn, media, coach-avatar, «Legg til i plan» → /planlegge/workbench). max-w 2xl.
- Tilstander: not-found-kort; tom-tilstander bevart (meta=[]/media=[]/params=[])
- AK-domene vist: CS, pyramide-akse, trinn (via mappet data)
- Designfil-referanse: v10 «pl-drill» (i fil-doc)
- Nåværende designkvalitet: ferdig — token-rent; coachInitials hardkodet «AK»
- Redesign-prioritet: P2

### /portal/gjennomfore
- Fil: src/app/portal/gjennomfore/page.tsx
- Flate: Gjennomføre (dagens program, hybrid)
- Rolle/gating: requirePortalUser
- Jobb: Dagens treningsprogram (faner Neste/Resten/Fullført).
- Data vist: `getGjennomforeData(user.id)` → `GjennomforeFaner`
- Komponenter: `AthleticEyebrow`, `GjennomforeFaner` (`@/components/portal/gjennomfore`)
- Layout og hierarki: eyebrow + «Dagens *program*» → GjennomforeFaner. max-w 460/860px.
- Tilstander: i komp
- AK-domene vist: økt-program (i komp)
- Designfil-referanse: hybrid-design 2026-06-17
- Nåværende designkvalitet: ferdig (wrapper)
- Redesign-prioritet: P2

### /portal/gjennomfore/[id]
- Fil: src/app/portal/gjennomfore/[id]/page.tsx
- Flate: Økt-detalj (TrainingSessionV2 / Spor B)
- Rolle/gating: requirePortalUser; notFound uten eierskap (studentId)
- Jobb: Lese-flate for coach-styrt V2-økt.
- Data vist: `trainingSessionV2` (title/tid/status/notes/completedSummary/drills). Coach-brief trygt parset fra `completedSummary.coachBrief.melding`.
- Komponenter: `AthleticEyebrow`, `AthleticBadge`
- Layout og hierarki: tilbake → eyebrow (dato) + tittel + tid → status-badge → coach-brief (forest left-border) → notes (lime) → drill-liste (Target-ikoner) → actions (Start/Fortsett, Kontakt coach, Se i planen).
- Tilstander: notFound; empty drills; status-styrt CTA
- Interaksjoner: `v2SessionStartHref`; → /coach/melding; → /planlegge
- AK-domene vist: pyramide-label per drill, V2-status (PLANNED/IN_PROGRESS/COMPLETED), coach-brief
- Designfil-referanse: ingen prototype (NY 2026-06-11, fikset 404)
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P2

### /portal/kalender
- Fil: src/app/portal/kalender/page.tsx
- Flate: Årskalender (Gantt, hybrid)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN
- Jobb: Årsplan-Gantt (pyramide-rader + turnering-markører).
- Data vist: `seasonPlan` + `periodBlocks` (via `lesPeriodeType`), `tournamentEntry` (m/manualDate). Mapper til 12-mnd Gantt + markører + kommende hendelser.
- Komponenter: inline (GanttRadKomponent); periode-helper fra `@/app/admin/kalender/lib`
- Layout og hierarki: «Årsplan *{år}*» + spiller/HCP → Gantt-kart (FYS/TEK/SES/PEAK/REST/TURN-rader, måneds-header, legend) → kommende hendelser. max-w 460px.
- Tilstander: tom-tilstand (ingen perioder/turneringer) m/CTA «Send melding til coach»; conditional hendelser
- AK-domene vist: periodisering (GRUNN→FYS, SPESIAL→TEK osv.), turnering-tier (Major/Turnering), HCP
- Designfil-referanse: `PlayerHQ Årskalender (hybrid).dc.html`
- Nåværende designkvalitet: inkonsistent — bruker mange `var(--token)` men også rå fallback-hex i inline-style (`#fff`, `#005840`, `#A32D2D`, `rgba(37,99,235,.1)`); fil-doc sier «ingen hardkodet hex» men gjør det
- Redesign-prioritet: P1

### /portal/planlegge
- Fil: src/app/portal/planlegge/page.tsx
- Flate: redirect → Workbench
- Rolle/gating: requirePortalUser; GUEST/PARENT redirect; ellers `redirect("/portal/planlegge/workbench")`
- Jobb: Ett trykkpunkt inn til Workbench (låst IA). **Stub.**
- Redesign-prioritet: P3

### /portal/planlegge/workbench
- Fil: src/app/portal/planlegge/workbench/page.tsx
- Flate: PlayerHQ Workbench (delt planleggings-kjerne)
- Rolle/gating: requirePortalUser; GUEST/PARENT redirect
- Jobb: Spillerens Workbench (AK-formel/periodisering/økt-planlegging).
- Data vist: `loadWorkbenchContext(user.id, weekOffset)` → data, insights.line, tekniskPlan, planId, planStatus. `?uke`-offset.
- Komponenter: `WorkbenchHybrid` (`@/components/workbench-hybrid`, role="player")
- Layout og hierarki: Suspense → WorkbenchHybrid (hub-faner: Teknisk plan/Sesongmål/Maler/Standardøkter/Gantt/Uke/Økt — se design-porting-gate Workbench-seksjon).
- Tilstander: i komponent; tom teknisk plan/sesongmål håndtert (ærlig empty)
- AK-domene vist: AK-formel, teknisk plan, sesongmål, pyramide, L-fase-Gantt (alt i WorkbenchHybrid)
- Designfil-referanse: Workbench v10 (design-porting-gate §Workbench 2026-06-25)
- Nåværende designkvalitet: ferdig (wrapper); kjerne-komponent er mest komplekse PlayerHQ-flate
- Redesign-prioritet: P2 (komponent eier kvaliteten)

### /portal/statistikk
- Fil: src/app/portal/statistikk/page.tsx
- Flate: Statistikk-hub (hybrid)
- Rolle/gating: requirePortalUser
- Jobb: KPI-strip + A–K nivå-diagnose + trend + hub-shortcuts.
- Data vist: `Round` (score/SG/holeScores) → KPI (Snittscore/SG Total/Putts/GIR), `buildNivaaDiagnose` via `@/lib/domain/ak-kategori` (kategori/niva/snittscore/SG-gaps), trend (siste 10)
- Komponenter: `StatistikkHub` (`@/components/portal/statistikk/statistikk-hybrid`)
- Layout og hierarki: i komponent — identitetslinje, nivå-diagnose, KPI, trend, 6 hub-tiles.
- Tilstander: null → «–» i KPI; ingen runder i år → ingen nivå-diagnose (ærlig tom)
- Interaksjoner: hub-tiles → /analysere, /tren/tester, /tren/turneringer
- AK-domene vist: A–K-kategori/nivå, SG-gaps, GIR/putts
- Designfil-referanse: `PlayerHQ Statistikk-hub (hybrid).dc.html`
- Nåværende designkvalitet: ferdig — token-rent (data-bygging i page, render i komp)
- Redesign-prioritet: P2

### /portal/statistikk/[metric]
- Fil: src/app/portal/statistikk/[metric]/page.tsx
- Flate: Statistikk drill-down per disiplin (desktop 1240px)
- Rolle/gating: requirePortalUser; notFound på ukjent metric
- Jobb: Detalj for 5 pyramide + 4 SG-disipliner (+ legacy-aliaser).
- Data vist: `sessionDrill`/`trainingPlanSession` (pyramid) ELLER `Round` SG-felt; 90d-trend, 30d-snitt+delta, topp-5 drills, SG-uke-tabell. **`benchmark`/«Snitt A1» og «Team Norway»-linje er hardkodede proxy-verdier.**
- Komponenter: inline (TrendChart SVG, Tile, EmptyForDiscipline)
- Layout og hierarki: header (tilbake + tittel + disabled periode-pills) → hero-stat (forest-gradient inline `var(--forest),var(--ink)`) + vs-benchmark + total/beste → trend-band → topp-5-drills (pyramid) / SG-uke-tabell (sg) → økt-sammendrag → coach-CTA «Be om mer fokus».
- Tilstander: notFound; EmptyForDiscipline når ingen data; periode-pills disabled (kun 90d virker)
- Interaksjoner: coach-CTA → /coach/melding?type=fokus
- AK-domene vist: pyramide-disipliner, SG-disipliner, A1-benchmark (proxy), treningstid
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: inkonsistent — periode-pills er dekorative (disabled), benchmark «A1»/«Team Norway» er hardkodede proxy-tall, forest-gradient inline; ellers rik
- Redesign-prioritet: P1

### /portal/statistikk/runder/[runId]/del
- Fil: src/app/portal/statistikk/runder/[runId]/del/page.tsx
- Flate: Del runde (shareable kort)
- Rolle/gating: requirePortalUser; notFound uten eierskap
- Jobb: Delbart runde-kort (score + SG + del-knapper).
- Data vist: `Round` (score/SG/notes/course), spiller (navn/initial/hcp/homeClub)
- Komponenter: `DelRundeClient` (lokal)
- Layout og hierarki: tynn wrapper; kort + del-UI i klientkomp.
- Tilstander: notFound
- AK-domene vist: SG-fordeling, score-relativ-par, HCP
- Designfil-referanse: «PlayerHQ 03 Del runde.html»
- Nåværende designkvalitet: ferdig (wrapper)
- Redesign-prioritet: P3

### /portal/stats
- Fil: src/app/portal/stats/page.tsx
- Flate: redirect → /portal/statistikk
- Rolle/gating: ingen — `permanentRedirect`. **Stub.**
- Redesign-prioritet: P3

### /portal/talent
- Fil: src/app/portal/talent/page.tsx
- Flate: Talent-hub (hybrid, mobil 512px)
- Rolle/gating: requirePortalUser
- Jobb: Talent-utviklingsvei — JourneyMap, MasteryRings, mål, streak, percentile, LevelLadder.
- Data vist: `talentTracking` (niva + 5 akser), `goal`, `round` (sgTotal), `trainingPlanSessionLog` (streak via `@/lib/streak`). **JOURNEY_STAGES + LEVEL_LADDER + nivaLabel-mapping er statiske demo-strukturer; «PRE-BETA»-banner sier eksplisitt demo-data.**
- Komponenter: inline (MasteryRing/JourneyIcon SVG)
- Layout og hierarki: hero (NIVÅ-badge) → JourneyMap → MasteryRings (3) → GoalProgress → Streak + PercentileGauge → LevelLadder → PRE-BETA-banner → 4 undersider-tiles.
- Tilstander: empty mål; PRE-BETA-stripe (ærlig demo-merking)
- Interaksjoner: tiles → mitt-niva/min-plan/roadmap/sammenligning
- AK-domene vist: A–K-nivå (NIVÅ-badge), talent-akser (1–10), SG-percentile (proxy), level-stige (B/C/D/E score-bånd — statisk)
- Designfil-referanse: `PlayerHQ Talent (hybrid).dc.html`
- Nåværende designkvalitet: inkonsistent — mye statisk demo (LEVEL_LADDER, journey-mapping), percentile-proxy; men ærlig PRE-BETA-merket. Bruker `var(--color-*)` (annet token-prefiks) + amber-utility-farger
- Redesign-prioritet: P1 (mye fabrikert struktur — vent på datamodell)

### /portal/talent/mitt-niva
- Fil: src/app/portal/talent/mitt-niva/page.tsx
- Flate: Talent · Mitt nivå (desktop 6xl)
- Rolle/gating: requirePortalUser PLAYER; returnerer null uten tracking
- Jobb: Spiller mot kohort-snitt (radar + bar per akse).
- Data vist: `talentTracking` (egen + kohort samme niva, ekskl. egen) → radar-serier + akse-forklaringer (statisk tekst)
- Komponenter: `TalentHero`, `RadarChart` (`@/components/portal/talent`)
- Layout og hierarki: TalentHero → radar + legend (deg vs kohort) → akse-detalj-grid (bar m/kohort-referanselinje).
- Tilstander: null hvis ingen tracking; kohort kan være 0
- AK-domene vist: 5 talent-akser, kohort-benchmark (ekte snitt fra DB)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent, ekte kohort-data
- Redesign-prioritet: P2

### /portal/talent/min-plan
- Fil: src/app/portal/talent/min-plan/page.tsx
- Flate: Talent · Min plan (mobil 480px)
- Rolle/gating: requirePortalUser PLAYER; null uten tracking
- Jobb: Spillerens utviklingsplan — akser, neste mål, milepæler.
- Data vist: `talentTracking` (akser, niva, klubb, region, inkludertFra, milepaeler-JSON parset trygt)
- Komponenter: inline (AxisCard); `AXIS_BAR` mapper akser → pyramide-tokens (`bg-pyr-*`)
- Layout og hierarki: tilbake → header (pulse-eyebrow + «Min *utviklingsplan*») → status-strip 2x2 → 5 akse-kort → neste-mål (lime-glød) → milepæler-tidslinje.
- Tilstander: null; empty milepæler; ingen-aktive-mål-tekst
- AK-domene vist: talent-akser farget per pyramide-token, milepæler, A–K-nivå
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent (bruker pyr-tokens)
- Redesign-prioritet: P2

### /portal/talent/roadmap
- Fil: src/app/portal/talent/roadmap/page.tsx
- Flate: Talent · Roadmap (mobil 480px)
- Rolle/gating: requirePortalUser PLAYER; null uten tracking
- Jobb: Utviklings-roadmap fra ekte sesongplan + milepæler.
- Data vist: `talentTracking` (milepaeler), `seasonPlan` (periodBlocks L-fase/focus, tournamentEntries). KPI-strip = ekte tellinger.
- Komponenter: inline; `LPHASE_NAVN`-mapping
- Layout og hierarki: PRE-BETA-stripe → tilbake → header → KPI-strip (Faser/Turneringer/Milepæler) → faser-liste (L-fase + periode + fokus) → turneringer → milepæler. Ærlige tom-tilstander.
- Tilstander: PRE-BETA; empty faser (CTA til planlegging); conditional turneringer/milepæler; full-tom-tekst
- AK-domene vist: L-faser (GRUNN/SPESIAL/TURNERING), turneringer, milepæler
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent, ekte data, ærlige empties (sterkere enn talent-hub)
- Redesign-prioritet: P2

### /portal/talent/sammenligning
- Fil: src/app/portal/talent/sammenligning/page.tsx
- Flate: Talent · Sammenligning (mobil 480px)
- Rolle/gating: requirePortalUser PLAYER; null uten tracking
- Jobb: Side-by-side mot annen spiller samme nivå + SG-delta over tid.
- Data vist: `talentTracking` (egen + kandidater + valgt motspiller), `round` SG (ny vs gammel periode via `?periode=30d|90d|1ar`). Anonymiser-pref fra `user.preferences`.
- Komponenter: `RadarChart`, `AnonymiserToggle` (lokal), inline (CompareAxis/SgDeltaKort/PeriodePicker)
- Layout og hierarki: tilbake → header + AnonymiserToggle → søk/velg-form → overlapping radar + legende → akser side-om-side → SG-delta-kort (periode-picker).
- Tilstander: null; ingen-treff; ingen-valgt-prompt; delta «—» uten data
- Interaksjoner: form (q/spiller); periode-pills (URL); Anonymiser-toggle
- AK-domene vist: talent-akser, SG-delta (Totalt/APP/ARG/PUTT), kohort
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent, ekte data + personvern
- Redesign-prioritet: P2

### /portal/trackman/[sessionId]
- Fil: src/app/portal/trackman/[sessionId]/page.tsx
- Flate: TrackMan-økt detalj (hybrid)
- Rolle/gating: requirePortalUser; eierskap/ADMIN/COACH-sjekk
- Jobb: Alle shots fra én TrackMan-økt + KPI + SG-proxy.
- Data vist: `trackManSession.rawJson` → mappet shots (club/CS/ballfart/smash/carry/avvik/spinn/launch). **`sgEstimate = (smash-1.44)*8` proxy; environment temp/wind = null (ingen kilde).**
- Komponenter: `PlayerHero`, `TrackManSessionClient` (.Filter/.Actions)
- Layout og hierarki: tilbake → empty-tilstand ELLER PlayerHero → environment-strip (conditional) → snitt-KPI (carry/ballfart/smash) → utvidet KPI-strip → SG-estimat-kort → shot-tabell (terminal data-table) → actions.
- Tilstander: empty («Fant ingen slag») når ukjent/0-shots; DB-nede-fallback (try/catch)
- Interaksjoner: filter, eksport CSV/slett/sammenlign (i client); lenker → /portal/mal/trackman (utenfor scope)
- AK-domene vist: TrackMan-metrikker, smash-baseline 1.44, SG-proxy
- Designfil-referanse: `PlayerHQ TrackMan Detalj (hybrid).dc.html`
- Nåværende designkvalitet: ferdig — token-rent; SG-estimat ærlig merket «proxy»; tilbake-lenker peker til /portal/mal/trackman (utenfor denne scope)
- Redesign-prioritet: P2

### /portal/trening/logg
- Fil: src/app/portal/trening/logg/page.tsx
- Flate: Logg treningsøkt (skjema)
- Rolle/gating: **`"use client"` — INGEN auth-guard i page** (API-ruten `/api/portal/trening/logg` antas å gate)
- Jobb: Manuell logging av SG-område + varighet + drill + kvalitet + notat.
- Data vist: ingen henting; POST til `/api/portal/trening/logg`. SgCategory-områder (OTT/APP/ARG/PUTT).
- Komponenter: ingen delte — rå `<input>/<button>` med basis-Tailwind (`border rounded`, ikke DS-komponenter)
- Layout og hierarki: «Logg treningsøkt» → dato → område-knapper → varighet-slider → drill → kvalitet 1–5 → notat → lagre. max-w md.
- Tilstander: lagrer/feil; ingen empty
- Interaksjoner: submit → /portal/gjennomfore
- AK-domene vist: SG-kategori (OTT/APP/ARG/PUTT)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: stygg — generisk skjema, rå border/rounded uten DS-komponenter eller athletic-stil; ingen eyebrow/hero; bryter med resten av PlayerHQ
- Redesign-prioritet: P1

### /portal/trening/break-tabell
- Fil: src/app/portal/trening/break-tabell/page.tsx
- Flate: Break-tabell (putting)
- Rolle/gating: ingen i page (`BreakTabellClient` antas gate/eller offentlig verktøy)
- Jobb: Putting break-tabell-verktøy. **Stub-wrapper.**
- Data vist: ingen i page; alt i `BreakTabellClient` (lokal)
- Komponenter: `BreakTabellClient`
- Tilstander: i client
- AK-domene vist: putting-break (i client)
- Nåværende designkvalitet: UVERIFISERT (alt i client)
- Redesign-prioritet: P2

### /portal/trening/putte-laboratoriet
- Fil: src/app/portal/trening/putte-laboratoriet/page.tsx
- Flate: Putte-laboratoriet
- Rolle/gating: ingen i page
- Jobb: Putting-lab-verktøy. **Stub-wrapper.**
- Data vist: ingen i page; `PutteLaboratorietClient` (lokal)
- Komponenter: `PutteLaboratorietClient`
- AK-domene vist: putting (i client)
- Nåværende designkvalitet: UVERIFISERT (alt i client)
- Redesign-prioritet: P2

### /portal/utfordringer
- Fil: src/app/portal/utfordringer/page.tsx
- Flate: Utfordringer-liste
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN
- Jobb: Drill-challenges (Aktive/Tidligere) man eier eller deltar i.
- Data vist: `drillChallenge` (owner/participants, status ACTIVE/ENDED, min rank/score)
- Komponenter: `EmptyState`, inline UtfordringKort
- Layout og hierarki: editorial header (eyebrow + «Mine *utfordringer*» + «+ Ny») → Aktive-grid → Tidligere-grid. Kort: status-dot + Eier-badge + deltaker/plassering-KPI + deadline.
- Tilstander: empty (EmptyState + CTA); conditional Tidligere
- Interaksjoner: kort → /utfordringer/[id]; «+ Ny»
- AK-domene vist: drill-challenge-leaderboard
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent. NB: bruker `style={{ fontFamily: "'Inter Tight'...", fontStyle:"italic" }}` inline (heller enn `font-display italic`-klasse) — mønster gjentas på flere editorial-titler
- Redesign-prioritet: P2

### /portal/utfordringer/[id]
- Fil: src/app/portal/utfordringer/[id]/page.tsx
- Flate: Utfordring-detalj + resultatliste
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN; notFound
- Jobb: Detalj, score-innsending, leaderboard, bli-med/avslutt.
- Data vist: `drillChallenge` (owner/participants sortert rank/score, drill via drillId). Server-actions `bliMed`/`avsluttUtfordring`.
- Komponenter: `PlayerHero`, `EmptyState`, `ScoreForm` (lokal), inline Kpi
- Layout og hierarki: tilbake → PlayerHero (m/Bli med / Avslutt-actions) → beskrivelse → KPI (deltakere/startet/slutter) → ScoreForm (hvis deltaker+aktiv) → resultatliste (rank-chip + avatar + score).
- Tilstander: notFound; empty deltakere; eier vs deltaker; aktiv vs avsluttet
- Interaksjoner: bli med / avslutt (server-actions); score-skjema
- AK-domene vist: leaderboard/score
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P2

### /portal/utfordringer/ny
- Fil: src/app/portal/utfordringer/ny/page.tsx
- Flate: Ny utfordring (6-stegs wizard)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN
- Jobb: Lag DrillChallenge — tittel/type/mål/frist/inviter/opprett.
- Data vist: venner via `friendship` (ACCEPTED), `exerciseDefinition` (take 200)
- Komponenter: `PlayerHero`, `NyUtfordringWizard` (lokal)
- Layout og hierarki: tilbake → PlayerHero → NyUtfordringWizard.
- Tilstander: i wizard
- AK-domene vist: drill-kobling, pyramide-area (i wizard)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig (wrapper)
- Redesign-prioritet: P2

### /portal/varsler
- Fil: src/app/portal/varsler/page.tsx
- Flate: Varsler (hybrid)
- Rolle/gating: requirePortalUser
- Jobb: Notification-feed gruppert I dag/Tidligere.
- Data vist: `notification` (type/title/link/readAt, take 100). Ikon-mapping per type (plan/drill/melding/turnering/booking/credit/ai osv.).
- Komponenter: inline (VarselRad/Seksjonskort), `VarslerMarkerKnapp` (lokal)
- Layout og hierarki: «Varsler *nå*» + «N nye»-pill + «Marker alle lest» → I dag-kort → Tidligere-kort → «Ingen eldre»-kort → full tom-tilstand. max-w 460/600px.
- Tilstander: full tom-tilstand; conditional seksjoner; ulest-styling (inline `rgba(209,248,67,.05)`)
- Interaksjoner: rad-lenker; marker alle lest (server-action via klient)
- AK-domene vist: varseltyper (TrackMan/SG/booking/credit/AI Caddie)
- Designfil-referanse: `PlayerHQ Varsler (hybrid).dc.html`
- Nåværende designkvalitet: ferdig — token-tro (én inline lime-rgba for ulest-bg)
- Redesign-prioritet: P2

### /portal/agent-pipeline
- Fil: src/app/portal/agent-pipeline/page.tsx
- Flate: Agent-pipeline (innsikt i AI-tolkning)
- Rolle/gating: requirePortalUser; ADMIN ser ekstra agent-runs
- Jobb: Vise signaler + plan-actions (+ admin agent-kjøringer).
- Data vist: `signal` (kind/value/computedAt), `planAction` (actionType/status/agentName/suggestion), `agentRun` (admin)
- Komponenter: `PlayerHero`, `EmptyState`, inline Th/Td (tabell + mobil-kort)
- Layout og hierarki: tilbake → PlayerHero «Hvordan *systemet* leser deg» → Signaler (desktop tabell / mobil kort) → Plan-actions (status-pills) → admin agent-runs.
- Tilstander: empty signaler/actions; admin-conditional
- Interaksjoner: ingen (lese-flate)
- AK-domene vist: signal-aggregater (SG/pyramide/streak), plan-actions (agent-forslag), cron-kjøringer
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent (litt teknisk/«rå» flate, men bevisst)
- Redesign-prioritet: P2

### /portal/reach
- Fil: src/app/portal/reach/page.tsx
- Flate: Reach & Engagement (P2)
- Rolle/gating: requirePortalUser
- Jobb: Synlighet/connections/personvern — **ingen datamodell ennå → ærlig tom-tilstand.**
- Data vist: ingen (modell finnes ikke; tidligere hardkodede tall fjernet)
- Komponenter: `PlayerHero`, inline empty
- Layout og hierarki: PlayerHero «Hvem ser *reisen* din?» + Personvern-action → tom-tilstand-kort.
- Tilstander: kun tom-tilstand
- Interaksjoner: → /portal/meg/innstillinger
- AK-domene vist: ingen
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — ærlig tom (foreldreløs? — sjekk nav-lenking)
- Redesign-prioritet: P3 (vent på modell)

### /portal/spiller/[spillerId]
- Fil: src/app/portal/spiller/[spillerId]/page.tsx
- Flate: Spiller-detalj (public profil, faner)
- Rolle/gating: requirePortalUser (kun innlogging); notFound
- Jobb: Public spillerprofil (Oversikt/Plan/Statistikk/Runder/Coaching).
- Data vist: `User` (navn/avatar/hcp/homeClub/playingYears/ambition), `Round` (10), aktiv `trainingPlan`, `coachingSession` (5), `goal` (5). Snittscore/SG-snitt beregnet.
- Komponenter: `SpillerDetaljClient` (lokal)
- Layout og hierarki: tynn server-wrapper; faner i klientkomp.
- Tilstander: notFound; null-felter håndtert
- AK-domene vist: SG-snitt, score, HCP, mål (HCP_TARGET/SG osv.), coaching-historikk
- Designfil-referanse: «01 Spiller-detalj.html»
- Nåværende designkvalitet: ferdig (wrapper)
- Redesign-prioritet: P2

### /portal/ny-okt
- Fil: src/app/portal/ny-okt/page.tsx
- Flate: Ny økt (4-stegs wizard, desktop 1240px)
- Rolle/gating: requirePortalUser; GRATIS→Pro-gate
- Jobb: Spiller bygger egen økt utenfor coach-plan.
- Data vist: ingen henting; `NyOktWizard` (lokal)
- Komponenter: `PlayerHero`, `EmptyState`, `NyOktWizard`
- Layout og hierarki: GRATIS: hero + EmptyState (Lock, «Krever Pro 300 kr/mnd») → ellers hero + NyOktWizard.
- Tilstander: GRATIS-gate
- AK-domene vist: drills/pyramide (i wizard)
- Designfil-referanse: `public/design/batch3/ny-okt-wizard.html` (NB: `public/design/`, ikke design-handover — kan være eldre referanse)
- Nåværende designkvalitet: ferdig (wrapper); fil-doc refererer `public/design/batch3/` (utenfor godkjent design-handover-kilde)
- Redesign-prioritet: P2

### /portal/onskeligokt
- Fil: src/app/portal/onskeligokt/page.tsx
- Flate: Be om økt (hybrid, 820px)
- Rolle/gating: requirePortalUser
- Jobb: Send ønske om økt til coach.
- Data vist: `User` (COACH); `?sent` for kvittering
- Komponenter: `OnskeligOktForm` (lokal)
- Layout og hierarki: tilbake → «Be om *økt*» + «{coach} svarer innen 24 timer» → sendt-banner → OnskeligOktForm. min-h-screen.
- Tilstander: sendt-banner
- Interaksjoner: form-submit → SessionRequest
- AK-domene vist: ingen
- Designfil-referanse: hybrid-design 2026-06-17
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P2

### /portal/onskeligokt/bekreftet
- Fil: src/app/portal/onskeligokt/bekreftet/page.tsx
- Flate: Ønske bekreftet (status-tidslinje)
- Rolle/gating: requirePortalUser
- Jobb: Kvittering + status-tidslinje for siste SessionRequest.
- Data vist: siste `sessionRequest` (status/reason/preferredArea/preferredDate, coach). Status styrer tidslinje-steg.
- Komponenter: inline (buildSteps tidslinje, SumRow)
- Layout og hierarki: tom-tilstand (ingen request) ELLER hero (Send-ikon + «*Sendt til coach*») → ditt-ønske-sammendrag (kun ekte felter) → tidslinje (Du sendte/Coach foreslår/Du bekrefter/Booket — status-styrt) → handlinger → ref-nr.
- Tilstander: ekte tom-tilstand (ingen request); status-flyt (APPROVED/DECLINED/CANCELLED)
- AK-domene vist: preferredArea (FYS/TEK/SLAG/SPILL/TURN), SessionRequest-status
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-tro, ekte data + ærlige steg. NB: `bg-[var(--color-pyr-spill-track)]` arbitrary-value + én italic via inline-style
- Redesign-prioritet: P2

---

## Tverrgående funn (for orkestrator)

1. **Token-drift (hardkodet hex/rgba i inline `style`)** — gjentas i: kalender (Gantt-farger), talent-hub (color-mix/amber), coach/sg-hub (`#7BA428`/`#1A7D56`/`#A32D2D`), coach/ovelser + videoer (forest-gradient `#2f5a2c,#0a2417` + lime-grid `rgba(209,248,67,...)`), coach/plans[detalj] (`#b5d629`), booking/anlegg (hero-gradient), statistikk/[metric] (forest-gradient), booking/[bookingId] (egen `booking.css` `bk-`-klasser + `#4A5418`). Bryter designsystem.md-regelen «ingen hardkodet hex».
2. **Navne-kanon-brudd** — `coach/melding/ny` hardkoder «Hans Brennum/Linn Knutsen/Espen Søvik/Anders K.» (mot Øyvind/Anders-kanon). `coach/ovelser`, `coach/videoer`, `coach/plans` hardkoder «Anders» i tittel (skal avledes fra DB-coach).
3. **Statiske/fabrikerte tall presentert som ekte** — coach/[coachId] (rating 4,9 / snittsvar 4 t / MORAD-sertifiseringer), coach/sg-hub (COACH_SG-referanse), statistikk/[metric] («Snitt A1»/«Team Norway»-benchmark), talent-hub (LEVEL_LADDER/journey/percentile-proxy), booking/[bookingId] (MÅL/UTSTYR/TIMELINE), coach/notes/[id] (TAGS).
4. **«AgencyOS»-eyebrow på /portal-ruter** — coach/ovelser/ny, .../rediger, coach/plans/[id]/ny-okt bruker `eyebrow="AgencyOS · ..."` på spiller-portalen (disse er coach-only, men ligger under /portal).
5. **`/portal/mal/*`-lenker** fra coach/sg-hub, drills/[id] og trackman peker inn i /portal/mal (utenfor denne scope — annen agent eier de skjermene).
6. **Avvikende skjemastil** — `trening/logg` bruker rå `border rounded`-skjema uten DS/athletic-komponenter; eneste PlayerHQ-skjerm som ikke følger editorial-hybrid-stilen.
7. **Mulige foreldreløse/legacy** — `analyse`/`stats` er rene redirects; `reach` er tom (modell mangler); flere coach-only-skjermer ligger under /portal men gates på COACH/ADMIN.
