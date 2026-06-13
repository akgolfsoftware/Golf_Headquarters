# Claude Design-prompt — sett sammen alle skjermer til én interaktiv app

> Lim hele blokken under inn i Claude Design. Last opp som vedlegg: (1) `docs/MASTER-SKJERMPLAN.md` (skjermlista/fasit), og (2) alle eksisterende v10-skjermbilder fra `public/design-handover/v10/`. Da har verktøyet alt det trenger.

---

## OPPDRAG

Du skal sette sammen ALLE eksisterende skjermer for appen **AK Golf HQ** til én helhetlig, klikkbar, interaktiv prototype — ikke løse enkeltbilder, men en sammenhengende app der navigasjonen mellom skjermene faktisk fungerer. Bruk skjermbildene jeg har lastet opp som fasit for utseendet, og master-skjermplanen som fasit for hvilke skjermer som finnes og hvordan de henger sammen.

Du skal IKKE finne på nye skjermer, ny funksjonalitet eller ny grafikk som ikke finnes i de opplastede skjermbildene eller skjermlista. Mangler noe, list det under «Åpne spørsmål» — ikke dikt.

## HVA APPEN ER

AK Golf HQ er én plattform med fire produkter under samme tak og samme designsystem:

1. **PlayerHQ** (`/portal`) — spillerens app. Spørsmålet er «hva skal JEG gjøre i dag?». Mobil-først.
2. **AgencyOS** (`/admin`) — coachens kontrolltårn. Spørsmålet er «hvem trenger MEG i dag?». Data-tett, desktop-først.
3. **Forelderportal** (`/forelder`) — foresatt følger barnet.
4. **Marketing + offentlig statistikk** (`/` og `/stats`) — salgssider og offentlig golf-statistikk.

Felles kjerne: **Workbench** er ÉN delt arbeidsflate. En endring coachen gjør i en spillers Workbench, skal vises hos spilleren. Dette propageringsprinsippet er sentralt — se «Ringvirkninger» nederst.

## DESIGNSYSTEM (ufravikelig — alt skal følge dette)

**Farger (lyst tema):**
- Bakgrunn `#FAFAF7`, tekst `#0A1F17`, kort `#FFFFFF`
- Primær (forest) `#005840` — CTA og hovedhandling. Tekst på primær: lime `#D1F843`
- Aksent (lime) `#D1F843` — highlights, badges. Tekst på aksent: forest `#005840`
- Sand `#F1EEE5` — chips, sekundærflater. Sekundærtekst `#5E5C57`
- Status: suksess `#1A7D56`, advarsel `#B8852A`, feil `#A32D2D`, info `#2563EB`
- Border `#E5E3DD`
- Mørkt tema finnes for `.dark` — speil fargene tilsvarende.

**Typografi:**
- Inter — UI og brødtekst (standard)
- Inter Tight — display og hero (editorial italic tillatt)
- JetBrains Mono — KPI-tall, tabulære tall, eyebrows
- Ingen andre fonter. Ingen Instrument Serif.

**Ikoner:** Kun Lucide, 24px, 1.5px strek, currentColor. **INGEN emoji** noe sted.

**Spacing:** 8pt-grid (p-2/4/6/8/10/12/16). Unntak: data-tette flater (dashboards, tabeller, timelines, innboks-rader i AgencyOS) kan bruke 12/14px tetthet — følg de opplastede skjermbildene der.

**Stemning:** editorial sport-analytics. Rolig, presis, høy datatetthet i AgencyOS, mer luft og fokus i PlayerHQ.

**Språk:** All UI-tekst på norsk bokmål med æ, ø, å.

## NAVIGASJON OG STRUKTUR

**PlayerHQ** — mobil bunn-navigasjon med faste hovedfaner: Hjem · Planlegge · Gjennomføre · Analysere · Meg. Booking og Coach nås inni disse. Live-økt og tester kjører i egen fullskjerm-modus (uten bunnmeny).

**AgencyOS** — venstre sidebar (desktop) med seksjonene: Oversikt/Cockpit · Min uke · Stall (spillere) · Planlegge · Gjennomføre · Innsikt · Admin. Toppen har global player↔gruppe-veksler og hurtigsøk (⌘K).

**Forelder** — enkel bunn-/toppnavigasjon: Hjem · Barn · Bookinger · Coach · Økonomi.

**Marketing** — vanlig topp-meny + footer.

Bruk seksjonsinndelingen i den opplastede master-skjermplanen som autoritativ gruppering. Hver skjerm i lista skal være en node i prototypen, og hver lenke/knapp skal peke til riktig målskjerm slik flyten tilsier. Der det finnes en flyt-fasit (`Coach-flyter.html` for AgencyOS, Workbench-mønsteret for spilleren), følg den for knapp-til-knapp-navigasjon.

## TILSTANDER (hver skjerm skal vises i disse, der relevant)

For hver skjerm, design alle aktuelle tilstander:
- **Normal** (fylt med representative data)
- **Tom** (ingen data ennå — med vennlig tom-tilstand og en tydelig neste-handling)
- **Laster** (skjelett/placeholder)
- **Feil** (noe gikk galt — med gjenopprett-handling)
- **Låst/gated** (funksjon krever PRO-abonnement — vis oppgradér-vei). Tier-modell: kun GRATIS og PRO (300 kr/mnd). Ingen «Elite»-tier i UI.

Interaktive elementer skal ha synlige tilstander: hvile, hover, fokus, aktiv, deaktivert.

## OUTPUT — slik skal du levere

Lever i tre deler, i denne rekkefølgen:

### Del 1 — Samlet Skjermliste
En tabell over hver skjerm du har bygget i prototypen:

| # | Skjermnavn | Modul (PlayerHQ/AgencyOS/Forelder/Marketing) | Adresse | Inn-lenker (hvilke skjermer fører hit) | Ut-lenker (hvor knappene fører) | Tilstander dekket | Datafelt vist |
|---|---|---|---|---|---|---|---|

### Del 2 — Wireframe-spec per skjerm
For hver skjerm, en kort blokk:
- **Topp/hero:** hva som står øverst
- **Seksjoner i rekkefølge:** hver seksjon med innhold
- **Komponenter brukt:** (se komponentbiblioteket under)
- **Knapper og hva de gjør:** hver knapp → målskjerm eller handling
- **Datafelt:** eksakte felter som vises (se «Datafelt» under)
- **Tilstander:** hvilke av tilstandene over som gjelder

### Del 3 — Interaktiv prototype
Den klikkbare appen der alle skjermene er koblet sammen via navigasjonen og knappene fra Del 1 og 2. Start på PlayerHQ Hjem og AgencyOS Cockpit som to innganger.

## KOMPONENTBIBLIOTEK (gjenbruk — ikke bygg nytt)

Bygg av disse mønstrene (de finnes som ferdige komponenter i appen):
- Hero / PhotoHero (sidetopp), FeaturedCard, Card, KpiStrip (mono-tall), Eyebrow
- PyramidProgress (treningspyramide), Badge (varianter: ok/warn/urgent/lime/primary/neutral)
- Button, ActionList, QueueItem (innboks/kø-rader), Avatar, PulseDot, Greeting, DayCal
- Kalendere: månedsrutenett, økt-planlegger, streak-kalender, dagsplan, heatmap, årsplan-gantt
- LiveBar, InsightCard (AI-fortelling), GoalsHubPattern, SectionHeader, ItineraryRow

Tegnede komponenter som ennå ikke er tatt i bruk — bygg dem inn der de hører hjemme:
- Stemme-logging («snakk inn tallene») → live-økt logger / score-tapper
- Credit-måler («X klipp igjen») → booking-hub
- «Svakhet → denne øvelsen»-bro → SG-Hub / analyse
- Sesong-tidslinje → årsplan
- TrackMan stabilitet-/trend-grafer → TrackMan-skjermene
- Hurtigsøk ⌘K → global i AgencyOS

## DATAFELT (hva hver skjermtype skal vise)

Bruk realistiske, men tydelig markerte eksempeldata. Nøkkelfelter per skjermtype:
- **PlayerHQ Hjem:** profilbilde + navn + tier-pill, dagens økt, neste handling, AI-innsikt, streak
- **SG-Hub:** Strokes Gained totalt + per kategori (driving/approach/short/putt), best vs nå, benchmark
- **Runder/Statistikk:** dato, bane, score, SG-tall, fairways/GIR/putts
- **AgencyOS Cockpit:** hvem trenger oppfølging (fokus-spillere), innboks-teller, dagens kalender, nøkkel-KPI for stallen
- **Spiller-detalj:** profil, nivå, aktiv plan, siste tester, siste runder, kommende turneringer
- **Workbench:** ukens plan, økt-blokker, pyramide-fordeling, coach-notat
- **Innboks:** avsender, forhåndsvisning, tidsstempel, status (ny/besvart), prioritet
- **Booking:** tjeneste, coach, anlegg/fasilitet, tid, credits, status
- **Turneringer:** navn, dato, bane, påmeldte spillere, status

Mangler du datafelt for en skjerm, bruk de opplastede skjermbildene som fasit — ikke gjett nye felter.

## RINGVIRKNINGER (når én skjerm endres, hva skjer med andre)

Behandle disse koblingene som ekte i prototypen:
- **Workbench er delt:** en endring coach gjør i spillerens Workbench (`/admin/spillere/[id]/workbench`) vises i spillerens egen Workbench (`/portal/planlegge/workbench`) og på Hjem.
- **Coach tildeler plan/test/økt** → dukker opp hos spilleren under Planlegge/Gjennomføre + gir et varsel.
- **Spiller ber om økt** → havner i coachens innboks/forespørsler.
- **Spiller logger runde/test** → oppdaterer SG-Hub, Statistikk og coachens spiller-detalj.
- **Turnering opprettet i AgencyOS** → vises i spillerens og forelderens turneringsliste.

## BEGRENSNINGER / STANDARDER

- Ingen nye token-farger utenfor paletten over. Ingen hardkodede tilfeldige hex.
- Ingen emoji. Kun Lucide-ikoner.
- Hold dobbeltadresser ute: der samme funksjon finnes på to adresser (f.eks. finance/okonomi, kalender/calendar, innboks/messages), bygg ÉN skjerm og marker den andre som alias.
- Elite/Talent-sporet er bevisst utsatt — ta det med som «parkert» i skjermlista, men ikke prioriter design der nå.
- Marketing-undersidene og det offentlige stats-universet kan grupperes kompakt — ikke bruk tid på å pusse hver enkelt.

## ÅPNE SPØRSMÅL (svar i egen seksjon til slutt)

List alt du måtte gjette, alt som mangler fasit i de opplastede filene, og alle steder der to skjermbilder er i konflikt. Ikke fyll hullene selv — flagg dem.
