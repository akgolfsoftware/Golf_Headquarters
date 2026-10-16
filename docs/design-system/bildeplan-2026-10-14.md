# Bildeplan — referansebilder for økter, tester og flater

Status: **plan, godkjent retning 14.10.2026 (Anders).** TEK er godkjent 16.10; resten gjenstår.
Bakgrunn: designbrevet 13.10, punkt «Bilder (åpent)». Denne planen svarer på *hva* bildene skal vise.
*Hvem* som lager dem (bildeverktøy, egne foto eller lisens) er fortsatt Anders' valg.
Rekkefølge, antall og ferdigkrav: [arbeidsplanen 16.10](bildeplan-arbeidsplan-2026-10-16.md).

## Faste regler for alle bilder

- **Aldri tekst oppå bildet** (designbrevet). Bildet bærer stemning, kortet bærer tekst.
- **Ingen lesbar tekst i bildet**: ingen navn på resultattavler, ingen merkelogoer (TrackMan, Titleist, Nike osv.),
  ingen reklameskilt. Tekst som må finnes (resultattavle), er uskarp.
- **Ingen gjenkjennelige ansikter.** Spilleren sees bakfra, fra siden eller på avstand. Ingen ekte personer.
- **Rolig og dempet** (Anders 16.10, etter to Gemini-forsøk): varme, nedtonede farger i sand, stein, grafitt og
  dempet salviegrønt, som appens flater. Mykt, spredt lys, mye luft og ett tydelig motiv. Bildet holder seg i
  bakgrunnen; aksefargen på kortet bestemmer. Ikke mettet grønt, ikke blå himmel med gjenskinn, ikke grått og vått.
  Bildene som ligger i appen i dag er ikke stilfasit.
- **Stilfasit er `tek-range.jpg`** (godkjent av Anders 16.10): naturlig, mykt overskyet dagslys, naturlige og litt
  dempede farger, ryddig og eksklusivt. Legg det ved i Gemini som stilreferanse for alle nye bilder.
- **Fotografisk, ikke illustrasjon.**
- **Format:** lages i 3:2 (1800 × 1200). Motivet midt i bildet, så det tåler utsnitt til 4:5 (mobil) og 16:9 (topp).
- **Filnavn:** `<akse>-<motiv>.jpg`, kebab-case, under 300 kB etter komprimering. Legges i
  `docs/design-system/utkast-playerhq/bilder/` og senere `public/images/okter/`.

## 1. Aksene — ett hovedbilde per akse (først)

| Akse | Fil | Motiv (Anders 14.10) |
|---|---|---|
| FYS Fysisk | `fys-gym.jpg` | Mørkt gym. Vektstang med skiver ligger på gulvet. |
| TEK Teknisk | `tek-range.jpg` | Spilleren trener en teknisk oppgave (Anders 16.10): stopper i en posisjon i baksvingen, to alignment-pinner på bakken, mobil på stativ filmer. Ingen ballhaug. |
| SLAG Golfslag | `slag-tracer.jpg` | Litt høyt fra siden. Ballbanen tegnet som lyst spor inn mot green. Resultatet teller. |
| SPILL Spill | `spill-runde.jpg` | Spiller på vanlig runde som leser greenen. Rolig, ingen publikum. |
| TURN Turnering | `turn-hull18.jpg` | Hull 18, publikum rundt greenen, resultattavle i bakgrunnen. Press. |

Bestillinger (lim inn i bildeverktøyet, én om gangen):

- **FYS:** `Use the attached image as the style reference: same photographer, same soft natural light, same muted natural colors and clean premium sports-documentary look. Photorealistic, a dimly lit strength gym with daylight falling in from one large window, a loaded olympic barbell with iron plates resting on a rubber floor in the foreground, calm and uncluttered, shallow depth of field, no people, no logos, no readable text, landscape 3:2 aspect ratio`
- **TEK:** `A golfer on a grass practice tee holding a slow, controlled position halfway into the backswing with the club shaft parallel to the ground, two alignment sticks laid on the grass at the feet, a smartphone on a small tripod filming from behind, a single ball, deliberate technical drill, seen from the side and slightly behind, calm minimal editorial sports photography, soft diffused natural light, warm muted desaturated palette of sand, stone, graphite and soft sage green, lots of negative space, one clear subject, uncluttered background, subtle film grain, no saturated colors, face not visible, no logos, no text, landscape 3:2 aspect ratio`
- **SLAG:** `Elevated side view of a golfer just after impact on a fairway, a thin pale shot-tracer line in the sky following the ball toward a distant green with a flag, soft hazy morning, calm minimal editorial sports photography, soft diffused natural light, warm muted desaturated palette of sand, stone, graphite and soft sage green, lots of negative space, one clear subject, uncluttered background, subtle film grain, no saturated colors, face not visible, no logos, no text, landscape 3:2 aspect ratio`
- **SPILL:** `A golfer crouching to read a putt on a quiet green during an ordinary round, early morning mist, birch trees in the background, seen from behind, no spectators, calm minimal editorial sports photography, soft diffused natural light, warm muted desaturated palette of sand, stone, graphite and soft sage green, lots of negative space, one clear subject, uncluttered background, subtle film grain, no saturated colors, face not visible, no logos, no text, landscape 3:2 aspect ratio`
- **TURN:** `18th green of a tournament, a golfer standing over a putt, spectators softly out of focus around the green, a large leaderboard far in the background blurred and unreadable, quiet tension, seen from behind, calm minimal editorial sports photography, soft diffused natural light, warm muted desaturated palette of sand, stone, graphite and soft sage green, lots of negative space, one clear subject, uncluttered background, subtle film grain, no saturated colors, face not visible, no logos, no text, landscape 3:2 aspect ratio`

## 2. Treningsområdene — bilde per område

Brukes på øktkort når økta er knyttet til et område. Område-lista følger `docs/treningsplanlegging.md` §Trinn 2.

| Område | Fil | Motiv | Finnes i dag |
|---|---|---|---|
| Utslag | `slag-utslag.jpg` | Driver på tee, ballen på vei, sett bakfra | Ja (beholdes eller byttes) |
| Innspill | `slag-innspill.jpg` | Jern fra fairway mot green, divot i lufta | Nei |
| Nærspill | `slag-naerspill.jpg` | Chip eller pitch rett ved greenen | Ja (`naerspill-wedge.jpg`) |
| Bunker | `slag-bunker.jpg` | Sand som spruter fra greenside-bunker | Ja |
| Putting | `slag-putting.jpg` | Putter og ball, kort avstand til hull | Ja |
| Fysisk | `fys-gym.jpg` | Samme som aksebildet | Erstatter `fys-styrke.jpg` (Unsplash) |
| Spill | `spill-runde.jpg` | Samme som aksebildet | Erstatter `spill-bane.jpg` |

## 3. Sted og miljø — når økta har sted, men ikke område

| Sted | Fil | Motiv |
|---|---|---|
| Range | `sted-range.jpg` | Tom range med matter og ballkurv i morgenlys |
| Korthullsbane | `sted-korthull.jpg` | Kort par 3 med liten green |
| TM Simulator | `sted-simulator.jpg` | Mørkt simulatorrom, lerret med fairway, spiller i silhuett (ingen TrackMan-logo) |
| Treningsrom | `sted-treningsrom.jpg` | Lyst funksjonsrom med matter og strikk |
| Hjemme | `sted-hjemme.jpg` | Puttematte på stuegulv |

## 4. Tester — ett bilde per testfamilie

43 tester i `docs/planer/testbatteri-protokollregister-2026-10-02.json`. Én bildetype per familie, ikke per test.

| Familie | Tester | Fil | Motiv |
|---|---|---|---|
| Utslag | Driver basic 220/270, Driver Gate | `test-driver.jpg` | Utslag mot smal fairway markert med to kjegler (porten) |
| Innspill | Innspill Basis, Innspill 120/160, Innspill Variation, Golfslag bane, PGA Tour 27 slag | `test-innspill.jpg` | Green med flere flagg på ulike avstander sett fra fairway |
| Wedge | Wedge Variation, Wedge Gate, Wedge 3 Blocked/Variation, Wedgetest egne lengder | `test-wedge.jpg` | Wedge-slag mot green med målringer |
| Nærspill | Nærspill Gate, VISA Express, 8-ball variation/blocked | `test-naerspill.jpg` | Åtte baller lagt ut rundt en green, ulike leier |
| Putting | Putt 1–3 m, Putt Gate, Putt Speed 1×5 og 3×3, 9 hull lengde | `test-putting.jpg` | Baller i en rett linje med økende avstand fra hullet, tee-pinner som porter |
| Bane | 18 hull, PEI Test Bane, ST Leon ROT, ST Cloud GC | `test-bane.jpg` | Scorekort og blyant på golfbag, utydelig skrift |
| Teknikk | Standard sving 7-jern, Teknikktest panel A–C | `test-teknikk.jpg` | Spiller filmet bakfra med mobil på stativ, rangen bak |
| Fysisk: styrke | Benkpress, Trapbar | `test-styrke.jpg` | Trapbar med skiver på gulvet, kalk i lufta |
| Fysisk: spenst | Lengdehopp | `test-lengdehopp.jpg` | Målebånd på gulv, sko i landing |
| Fysisk: rotasjon | Rotasjonskast | `test-rotasjonskast.jpg` | Medisinball i luft mot vegg, spiller i rotasjon |
| Fysisk: hastighet | Club Speed | `test-club-speed.jpg` | Driver i full fart, bevegelsesuskarphet, radar som anonym boks |

Team Norway og WANG bruker samme testbilder, men bare i eget skall og uten AK-farget ramme.

## 5. Andre flater

| Flate | Fil | Motiv |
|---|---|---|
| Runde (registrering, live) | `runde-scorekort.jpg` | Tee-markør og bag ved første tee i morgendugg |
| Stats-topp | `stats-topp.jpg` | Finnes. Kontroller at det ikke har lesbar tekst |
| Booking og coaching | `coaching-okt.jpg` | Coach og spiller på rangen sett bakfra, coach peker |
| Live coachingøkt (AgencyOS) | `coaching-live.jpg` | Mobil på stativ filmer en sving |
| Tom tilstand | — | Ingen bilder. Tom tilstand bruker ikon og tekst |
| Caddie og Innboks | — | Ingen bilder |

## 6. Rekkefølge

1. Anders velger bildeverktøy eller fotograf (åpent punkt i designbrevet).
2. De fem aksebildene lages først og prøves i `idag.html` og `plan.html`.
3. Anders godkjenner aksebildene. Deretter treningsområder, sted og tester i samme stil.
4. Godkjente bilder komprimeres, legges i `bilder/` og byttes inn i utkastene. `fys-styrke.jpg` (Unsplash) fjernes.
5. Lisens eller opphav skrives i `bilder/KILDER.md` per fil.
