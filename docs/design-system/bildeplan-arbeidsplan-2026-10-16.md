# Arbeidsplan — alle referansebilder

Status: **plan, verktøy valgt 16.10.2026 (Gemini).** Ingen nye bilder er laget.
Bygger på [bildeplanen 14.10](bildeplan-2026-10-14.md), som sier *hva* bildene viser og har reglene
(ingen tekst, ingen ansikter, ingen logoer, nordisk lys, foto, 3:2 i 1800 × 1200, under 300 kB).
Denne planen sier *i hvilken rekkefølge*, *hvor mange* og *når et bilde er ferdig*.

## Omfang

| Pulje | Innhold | Nye bilder |
|---|---|---|
| 1 | Aksene: FYS · TEK · SLAG · SPILL · TURN | 5 |
| 2 | Fysisk: områder og tester | 6 |
| 3 | Teknisk: test | 1 |
| 4 | Golfslag: områder og tester | 10 (+3 valgfrie) |
| 5 | Spill: test og korthullsbane | 2 |
| 6 | Turnering: runde | 1 |
| 7 | Sted og coaching | 6 |
| | **Sum** | **31 (34 med valgfrie)** |

Pulje 1 setter stilen. Ingen andre bilder lages før Anders har godkjent den, ellers må alt lages på nytt.

## Verktøy: Gemini (Anders 16.10)

Alle bilder lages i Gemini, ett og samme verktøy, så lys og farger holder seg like.
Lim inn én bestilling om gangen i en ny samtale, slik at ett bilde ikke farger det neste.
Legg ved `slag-utslag.jpg` fra `bilder/` som stilreferanse og skriv «Match the light and colors of the attached image»,
så lys og farger blir som i resten av appen. Ikke for FYS (innendørs).
Gemini kan sette et lite merke i et hjørne av bildet. Det skal ikke være med i ferdig bilde:
beskjær det bort, eller lag bildet på nytt.

## Slik blir ett bilde ferdig

1. Lim inn bestillingen i Gemini. Lag tre varianter.
2. Anders velger én (eller ber om ny runde).
3. Kontroll: ingen ansikt, ingen lesbar tekst, logo eller Gemini-merke, motivet tåler utsnitt til 4:5 og 16:9.
4. Skalér til 1800 × 1200 og komprimer under 300 kB. Filnavn som i tabellene under.
5. Legg i `docs/design-system/utkast-playerhq/bilder/` og skriv «Gemini» og dato i `bilder/KILDER.md`.
6. Bytt inn i utkastene der det gamle bildet står. Skjermbilde i 390 og 1280 px.
7. Ferdig når Anders har sett bildet i utkastet (port 7).

Kopiering til `public/images/okter/` skjer når skjermene porteres, ikke i denne planen.

## Pulje 1 — aksene (først, i denne rekkefølgen)

Bestillingene står i bildeplanen §1 og brukes uendret.

| # | Akse | Fil | Erstatter i utkastene |
|---|---|---|---|
| 1 | FYS Fysisk | `fys-gym.jpg` | `fys-styrke.jpg` (Unsplash, 3 steder) |
| 2 | TEK Teknisk | `tek-range.jpg` | `tek-video.jpg` (9 steder) |
| 3 | SLAG Golfslag | `slag-tracer.jpg` | `slag-simulator.jpg` der den står for SLAG (12 steder, sjekkes ett og ett) |
| 4 | SPILL Spill | `spill-runde.jpg` | `spill-bane.jpg` (7 steder) |
| 5 | TURN Turnering | `turn-hull18.jpg` | `turn-tee.jpg` (5 steder) |

**Ferdig når:** alle fem står i `idag.html` og `plan.html`, og Anders har sagt ja til stilen.
Samtidig avgjør Anders om de fire eksisterende bildene i pulje 4 (utslag, nærspill, bunker, putting)
beholdes eller lages på nytt i samme stil. Anbefaling: lag dem på nytt. Opphavet deres er ikke
dokumentert, og de er tatt i annet lys.

## Pulje 2 — Fysisk

| # | Hva | Fil | Status |
|---|---|---|---|
| 6 | Styrke | `fys-gym.jpg` | Samme som aksebildet |
| 7 | Kondisjon | `fys-kondisjon.jpg` | Ny |
| 8 | Bevegelighet | `fys-bevegelighet.jpg` | Ny |
| 9 | Test: styrke (benkpress, trapbar) | `test-styrke.jpg` | Ny |
| 10 | Test: lengdehopp | `test-lengdehopp.jpg` | Ny |
| 11 | Test: rotasjonskast | `test-rotasjonskast.jpg` | Ny |
| 12 | Test: Club Speed | `test-club-speed.jpg` | Ny |

## Pulje 3 — Teknisk

| # | Hva | Fil | Status |
|---|---|---|---|
| 13 | Test: standard sving 7-jern, teknikktest panel A–C | `test-teknikk.jpg` | Ny |

## Pulje 4 — Golfslag

| # | Hva | Fil | Status |
|---|---|---|---|
| 14 | Utslag | `slag-utslag.jpg` | Finnes, lages på nytt hvis Anders sier ja i pulje 1 |
| 15 | Innspill | `slag-innspill.jpg` | Ny |
| 16 | Nærspill | `slag-naerspill.jpg` | Erstatter `naerspill-wedge.jpg` (9 steder) |
| 17 | Bunker | `slag-bunker.jpg` | Finnes, som 14 |
| 18 | Putting | `slag-putting.jpg` | Finnes, som 14. Erstatter også `green-25m.jpg` |
| 19 | Test: utslag | `test-driver.jpg` | Ny |
| 20 | Test: innspill | `test-innspill.jpg` | Ny |
| 21 | Test: wedge | `test-wedge.jpg` | Ny |
| 22 | Test: nærspill | `test-naerspill.jpg` | Ny |
| 23 | Test: putting | `test-putting.jpg` | Ny |

**Valgfritt (krever Anders' ja):** treningsområdene har 19 valg, bildeplanen dekker dem med ett bilde
per familie. Chip, pitch og lob ser ulike ut, og lang putt ligner ikke kort putt. Tre ekstra bilder
gjør kortene tydeligere:

| # | Hva | Fil |
|---|---|---|
| 23a | Chip | `slag-chip.jpg` (da gjelder `slag-naerspill.jpg` pitch) |
| 23b | Lob | `slag-lob.jpg` |
| 23c | Lang putt (10 fot og lengre) | `slag-putt-lang.jpg` (da gjelder `slag-putting.jpg` 0–10 fot) |

## Pulje 5 — Spill

| # | Hva | Fil | Status |
|---|---|---|---|
| 24 | Banespill | `spill-runde.jpg` | Samme som aksebildet |
| 25 | Test: bane (18 hull, PEI Test Bane m.fl.) | `test-bane.jpg` | Ny |
| 26 | Sted: korthullsbane | `sted-korthull.jpg` | Ny |

## Pulje 6 — Turnering

| # | Hva | Fil | Status |
|---|---|---|---|
| 27 | Runde (registrering, live) | `runde-scorekort.jpg` | Ny |

## Pulje 7 — Sted og coaching

| # | Hva | Fil | Status |
|---|---|---|---|
| 28 | Range | `sted-range.jpg` | Ny |
| 29 | TM Simulator | `sted-simulator.jpg` | Ny, erstatter `slag-simulator.jpg` der den står for stedet |
| 30 | Treningsrom | `sted-treningsrom.jpg` | Ny |
| 31 | Hjemme | `sted-hjemme.jpg` | Ny |
| 32 | Booking og coaching | `coaching-okt.jpg` | Ny |
| 33 | Live coachingøkt (AgencyOS) | `coaching-live.jpg` | Ny |
| 34 | Stats-topp | `stats-topp.jpg` | Finnes. Kontroller at det ikke har lesbar tekst |

## Bestillinger for pulje 2–7

Pulje 1 bruker bestillingene i bildeplanen §1. Alle under slutter med samme hale, slik at stilen
holder seg lik:

> `, bright clear summer day with soft warm sunlight, lush green well-kept grass, clean and crisp premium sports photography, natural colors, shallow depth of field, photorealistic, face not visible, no logos, no text, subject centered, landscape 3:2`

| Fil | Bestilling (før halen) |
|---|---|
| `fys-kondisjon.jpg` | `A runner on a forest gravel path at dawn, seen from behind, breath visible in cold air` |
| `fys-bevegelighet.jpg` | `An athlete doing a deep hip mobility stretch on a mat in a bright functional training room, seen from the side` |
| `test-styrke.jpg` | `A loaded trap bar with iron plates on a gym floor, chalk dust in the air, no people` |
| `test-lengdehopp.jpg` | `A measuring tape on a gym floor, a pair of training shoes just landing beside it, low angle` |
| `test-rotasjonskast.jpg` | `A medicine ball in mid-air flying toward a wall, an athlete in rotation behind it, motion blur` |
| `test-club-speed.jpg` | `A driver at full speed through impact, strong motion blur, a small anonymous radar box on the ground behind the ball` |
| `test-teknikk.jpg` | `A smartphone on a small tripod filming a golfer from behind on a driving range mat` |
| `slag-utslag.jpg` | `A golfer on a tee box just after a driver swing, ball in flight down a tree-lined fairway, seen from behind` |
| `slag-innspill.jpg` | `A golfer hitting an iron from the fairway toward a distant green, a divot flying, seen from behind` |
| `slag-naerspill.jpg` | `A golfer playing a pitch shot from short grass next to the green, ball in the air toward the flag` |
| `slag-bunker.jpg` | `Sand spraying from a greenside bunker as a golfer splashes the ball out, seen from the side` |
| `slag-putting.jpg` | `A putter and ball a short distance from the hole on a green, low angle, golfer only visible from the knees down` |
| `test-driver.jpg` | `A narrow fairway seen from the tee, two orange cones marking a gate in the landing area` |
| `test-innspill.jpg` | `A green with several flags at different depths, seen from the fairway` |
| `test-wedge.jpg` | `A wedge shot landing on a green with painted target circles around the flag` |
| `test-naerspill.jpg` | `Eight golf balls placed around a green in different lies, rough, fringe and slope` |
| `test-putting.jpg` | `Golf balls placed in a straight line at increasing distance from the hole, tee pegs forming small gates` |
| `test-bane.jpg` | `A scorecard and pencil resting on a golf bag, the writing blurred and unreadable` |
| `sted-korthull.jpg` | `A short par 3 hole with a small green surrounded by birch trees` |
| `runde-scorekort.jpg` | `A tee marker and a golf bag on the first tee in morning dew, no people` |
| `sted-range.jpg` | `An empty driving range with hitting mats and a basket of balls in morning light` |
| `sted-simulator.jpg` | `A dark indoor golf simulator room, a screen showing a fairway, a golfer in silhouette` |
| `sted-treningsrom.jpg` | `A bright functional training room with mats, resistance bands and a medicine ball, no people` |
| `sted-hjemme.jpg` | `A putting mat on a living room floor with a putter and two balls, warm home light` |
| `coaching-okt.jpg` | `A coach and a player on a driving range seen from behind, the coach pointing toward the target` |
| `coaching-live.jpg` | `A smartphone on a tripod filming a golf swing on a range, the coach standing beside it, seen from behind` |

Valgfrie: `slag-chip.jpg` `A low chip shot rolling toward the hole from the fringe` · `slag-lob.jpg`
`A high soft lob shot over a bunker toward a tight flag` · `slag-putt-lang.jpg` `A long putt rolling
across a large sloping green toward a distant flag`.

## Opprydding til slutt

Når alle erstatninger er gjort: slett `fys-styrke.jpg`, `tek-video.jpg`, `spill-bane.jpg`,
`turn-tee.jpg`, `naerspill-wedge.jpg`, `green-25m.jpg` og `slag-simulator.jpg` fra `bilder/`, etter et
søk som viser 0 treff i utkastene. Bildene under `public/images/playerhq/` røres ikke før skjermene
porteres.
