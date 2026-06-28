# Claude Design-prompt — akgolf.no/stats (verdens beste golf-stats-funnel)

Lim hele blokken under inn i Claude Design. Den er låst til AK Golf-designsystemet (lyst tema,
eksakte tokens), grunnet i de ekte DataGolf-dataene vi nå har, og bygget for ett mål: gratis
stats-flate som driver PlayerHQ-abonnement. Bygger videre på dagens redaksjonelle `/stats`-base —
løfter den til verdensklasse, kaster den ikke.

Relatert: `docs/datagolf-produktvisjon.md` (full visjon + datainventar), rute `/stats` (offentlig, akgolf.no).
Design-fasit: `public/design-handover/AK Golf HQ Design System/`.

---

```
Oppdrag: Design akgolf.no/stats — den gratis, offentlige golf-stats- og resultatflaten til
AK Golf. Dette er markedsførings-funnelen: den skal være det mest moderne, nytenkende og
interaktive golf-stats-stedet som finnes — og konvertere besøkende til betalende PlayerHQ-
abonnenter. Del av AK Golf-plattformen. ALLTID LYST tema (AK light-brand). UI-tekst på norsk
bokmål (æ, ø, å).

NORD-STJERNEN: hver skjerm skal (1) imponere på 5 sekunder, (2) gi gratis verdi, og
(3) lede mot «Prøv PlayerHQ — se hvor DU rangerer». Funnel før alt annet.

BRYT MED TRADISJONEN: Ingen kjedelige golf-stats-tabeller (PGA Tour-stil grå rad-på-rad).
Vi vil ha levende, interaktiv datafortelling — fordelinger, bevegelse, percentiler, animasjon.
Tenk «Bloomberg møter Spotify Wrapped møter sport-analytics», ikke et regneark.

HVEM: norske golfspillere (alle nivåer), foreldre, trenere, golf-fans. Gratis for alle.
Personlig dybde (egne benchmarks) ligger bak PlayerHQ-abonnementet — det er kroken.

DATAEN VI FAKTISK HAR (design for ekte data, ikke pynt):
- Round-level fra DataGolf, 26 tours, tilbake til 1983, ~295k runder: score, to-par, cut,
  + Strokes Gained PER KATEGORI (Total/OTT/APP/ARG/PUTT/T2G) + driving-lengde, treffsikkerhet,
  GIR%, scrambling%, nærhet fra fairway/rough.
- Approach-skill per AVSTAND (50–75, 75–100, … 200+ yards) — gull for innspill-fortelling.
- Skill-ratings over tid (trend, DG-rank, OWGR-rank) — bevegelse/utvikling.
- Norske spillere: på proff-tours (country=NOR), amatører (WAGR), norske juniorturneringer.
- Turneringsresultater + kommende turneringer.
- Hele FORDELINGEN per kategori, per nivå — så vi kan plassere hvem som helst på en percentil-kurve.

SIGNATURKOMPONENTER (hjertet — design disse som ingen golf-side har gjort):
1. BENCHMARK-SCRUBBER (viktigst — funnel-kroken): en stor, vakker slider/scrubber besøkeren
   drar fra «klubbspiller» → «regional» → «KFT» → «PGA» → «verdens nr. 1». Mens hen drar:
   en SG-fordelingskurve (violin/ridge) animerer, og en markør viser «her ville en 12-handicap
   ligget», med percentil + slag-gap. Avslutt med «Hvor ligger DU? → Prøv PlayerHQ» (lime CTA).
2. FORDELINGS-RADAR: ikke flat radar — hver akse (OTT/APP/ARG/PUTT) er en liten fordeling med
   nivå-bånd skyggelagt + spillerens markør. Viser «hvor i fordelingen», ikke bare «hvor god».
3. APPROACH-VARMESTIGE: avstandsbøttene 50–200+ y som en vertikal stige, farget etter percentil;
   hover/tap → fordeling for den avstanden. Unik innspill-fortelling.
4. SG-ELV / bevegelse: animert flyt av hvor slag vinnes/tapes mot benchmark, kategori for kategori.
5. «DENNE UKA»-historier (auto-generert datafortelling, ikke håndskrevet): kort som
   «Største SG putting denne uka», «Norske i aksjon», «Ukens klatrer» — store mono-tall,
   bevegelses-piler, mini-sparklines. Redaksjonelt + levende.
6. SPILLERKORT («trading card»): vakkert, delbart identitetskort per spiller — nøkkel-SG,
   percentiler, flagg, trend. Sosialt + funnel (del → trafikk tilbake).
7. RESULTAT-/TURNERINGS-HUB: ukens resultater for norske spillere på tvers av tours,
   med lenke til offisiell livescore. «Enkleste sted for norske resultater.»

SKJERMER (design både desktop ~1280px OG mobil ~430px):
A. /stats LANDING (løft dagens base): redaksjonell hero «All statistikken. Gratis. Alltid.»
   BEHOLD, men gjør resten levende: benchmark-scrubber høyt oppe (kroken), «Denne uka»-historier,
   norske spillere i aksjon (som spillerkort, ikke grå liste), tydelig PlayerHQ-CTA-bånd.
B. BENCHMARK-SCRUBBER som egen helte-seksjon/flate — den mest forseggjorte interaksjonen.
C. /stats/uka ukentlig roundup — løft til levende datafortelling (ukens spiller, bevegelser, kommende).
D. SPILLERPROFIL — fordelings-radar + approach-varmestige + trend over tid + spillerkort-topp.
E. TURNERING/RESULTAT — ukens resultater, norske uthevet, lenke til livescore.

LÅST DESIGN-DNA — eksakte verdier, ikke gjett (AK light-brand):
- Bakgrunn #FAFAF7 · Kort #FFFFFF · Tekst #0A1F17 · Dempet tekst #5E5C57 · Kantlinje #E5E3DD
- Sand/sekundær #F1EEE5 (chips, rolige flater)
- Primary #005840 (CTA, primær handling) · tekst på primary = lime #D1F843
- Lime-aksent #D1F843 — KUN på den ene tingen som skal trekke blikket (CTA / aktiv / NÅ). Aldri overalt.
- OK #1A7D56 · Advarsel #B8852A · Info #2563EB · Feil #A32D2D
- Fonter: Inter (UI/brødtekst), Inter Tight (display/overskrift, gjerne editorial italic),
  JetBrains Mono (ALLE tall + eyebrows/etiketter). Store mono-tall er signaturen.
- Ikoner: kun Lucide-stil, 1.5px strek, currentColor. INGEN emoji.
- 8pt-grid. Data-tette flater (leaderboards, ukestall) kan bruke 12–14px tetthet.
- Editorial sport-analytics: rikelig tomrom, store display-overskrifter, dyp skog-grønn +
  ett lime-blikkanker, tabulære mono-tall. Premium, rolig, moderne — aldri rotete eller «excel».

INTERAKSJON & BEVEGELSE: scrubber drar mykt, fordelinger animerer, tall teller opp (count-up),
sparklines tegner seg inn. Bevegelse skal forklare data, ikke pynte. Mobil: scrubber må føles
like god med tommel; «Denne uka» som horisontalt sveip; spillerkort fullbredde.

FUNNEL-MEKANIKK (gjennomgående, men elegant — ikke masete):
- Gratis verdi synlig først. Personlig dybde teaset: «Lås opp dine egne tall».
- Én tydelig lime «Prøv PlayerHQ»-CTA per skjerm (rounded-full pill, mono uppercase).
- Benchmark-scrubberen ender alltid i «Hvor ligger DU?».

Leveranse: Sammenhengende lyst design, desktop + mobil. START med /stats LANDING +
BENCHMARK-SCRUBBER (det er kroken og selve nytenkningen). Vis at golf-stats kan være
det vakreste, mest interaktive sport-data-produktet på nett.
```

---

## Slik bruker du den (3 steg)
1. Kopier hele blokken over.
2. Lim inn i Claude Design, send. (Be om landing + benchmark-scrubber først hvis du vil dele opp.)
3. Få skjermene tilbake → send dem til meg, så porter jeg dem inn i `/stats` via design-gaten,
   koblet på de ekte DataGolf-dataene.

## Notater (ikke til Claude Design — til oss)
- Bygg på eksisterende: `src/components/stats/` har alt mye (stats-big-radar, stats-histogram,
  stats-range-slider, stats-heatmap, trend-graf, norgeskart, count-up, reveal, leaderboard-card,
  wrapped-slide). Scrubberen kan bygge på `stats-range-slider` + `stats-histogram`.
- Data: les DataGolf fra delt DB (dashboard) nå; bytt til Intelligence-API (`/api/v1`) når deployet.
- Norsk dekning: kjør WAGR- + norske junior-pipelines for full «norske denne uka».
