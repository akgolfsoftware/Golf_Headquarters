# FYS-øvelsesbank — innlastingsplan

**Status: FORSLAG, venter Anders' godkjenning (fase 0.3).** 132 standardøvelser for fysisk
trening til toppidrettsutøvere i golf, gruppert etter spec-ens FYS-profil (mer bevegelighet,
mer kondisjon, mer styrke — individuell fordeling per spiller). Faglig forankret i TPI Big 12
(golfspesifikk screening), RFD (rate of force development) > 1RM som prinsipp, og
plyometrikk — jf. CLAUDE.md §4. Stryk/legg til fritt; dette er innlastingslisten, ikke en
ferdig fasit.

**Datamodell:** hver rad blir én `ExerciseDefinition` med `pyramidArea = FYS`,
`muscleGroups` (allerede i skjema) og `description`. Serier/reps/pause/RIR/vekt settes per
`FysOvelseRad` når øvelsen legges i en spillers program — ikke på øvelsesdefinisjonen
(spec-ens «planlegging per øvelse»). `videoUrl`/`imageUrl` fylles etter hvert, ikke krav for
innlasting.

**Kategorisering (fem grupper, matcher spec-ens profilbeskrivelse):**

| Gruppe | Dekker | Ca. andel av banken |
|---|---|---|
| Styrke — underkropp | Bilateral og unilateral beinstyrke, hofteekstensjon | ~25 øvelser |
| Styrke — overkropp | Push, pull, skulderstabilitet | ~20 øvelser |
| Styrke — kjerne/rotasjon | Anti-rotasjon, rotasjonskraft, kjernestabilitet | ~20 øvelser |
| Power/plyometri | Hurtig kraftutvikling (RFD), hopp, kast — golfsvingens kraftkilde | ~15 øvelser |
| Mobilitet | Hofte, thorakalrygg, skulder, ankel — TPI Big 12-fokusområder | ~24 øvelser |
| Kondisjon | Aerob base + anaerob/hurtighet | ~14 øvelser |
| Stabilitet/balanse | Golfspesifikk kontroll — ofte førsteøkt i FYS-programmet | ~14 øvelser |

---

## Styrke — underkropp (25)

| Øvelse | Muskelgrupper | Notat |
|---|---|---|
| Knebøy (stang) | Quadriceps, glutes, core | Grunnøvelse — beinstyrke og posturkontroll |
| Frontbøy | Quadriceps, core, øvre rygg | Mer opprett overkropp enn ryggbøy |
| Goblet squat | Quadriceps, glutes, core | Innlæringsvariant, lav terskel |
| Boks-knebøy | Quadriceps, glutes | Dybdekontroll for nybegynnere |
| Markløft (konvensjonell) | Glutes, hamstrings, rygg | Posterior chain-grunnøvelse |
| Sumo-markløft | Glutes, adduktorer, hamstrings | Hoftedominant variant |
| Trap bar-markløft | Glutes, hamstrings, quadriceps | Skånsom rygg-vinkel, gode for kraftutvikling |
| Rumensk markløft (RDL) | Hamstrings, glutes | Eksentrisk hamstrings-styrke |
| Ettbeins RDL | Hamstrings, glutes, balanse | TPI-relevant — enbeinsstabilitet i svingen |
| Hoftehev (hip thrust) | Glutes, hamstrings | Kraftutvikling i hofteekstensjon — direkte svingoverføring |
| Ettbeins hoftehev | Glutes, balanse | Progresjon fra bilateral hoftehev |
| Utfall (gående) | Quadriceps, glutes, balanse | Funksjonell beinstyrke |
| Bulgarsk splittknebøy | Quadriceps, glutes | Unilateral, høy overføring til svingstabilitet |
| Sideutfall | Adduktorer, glutes | Frontalplan-styrke, ofte oversett hos golfere |
| Curtsy-utfall | Glutes, adduktorer | Rotasjonskomponent i frontalplan |
| Step-up | Quadriceps, glutes | Konsentrisk kraft, enbeinskontroll |
| Beinpress | Quadriceps, glutes | Isolert beinstyrke, lav teknisk terskel |
| Ettbeins beinpress | Quadriceps, balanse | Unilateral variant |
| Leggcurl (liggende/sittende) | Hamstrings | Isolasjon, skadeforebygging |
| Nordic hamstring curl | Hamstrings | Eksentrisk styrke, skadeforebyggende |
| Tåhev (stående) | Legger | Ankelstabilitet og propulsjon |
| Tåhev (sittende) | Soleus | Utfyller stående variant |
| Copenhagen-planke | Adduktorer, core | Skadeforebygging lyske |
| Hip airplane (belastet) | Glutes, balanse, rotasjonskontroll | TPI Big 12-øvelse |
| Zercher-knebøy | Quadriceps, core, øvre rygg | Krever mye kjernekontroll |

## Styrke — overkropp (20)

| Øvelse | Muskelgrupper | Notat |
|---|---|---|
| Benkpress | Bryst, triceps, skuldre | Grunnøvelse overkropp push |
| Skrå benkpress | Øvre bryst, skuldre | Variasjon i vinkel |
| Manualpress (flat/skrå) | Bryst, skuldre, triceps | Ensidig stabilitetskrav |
| Push press | Skuldre, triceps, bein (drivkraft) | Kraftutvikling helkropp |
| Militærpress (stående) | Skuldre, core | Vertikal press, kjernekrav |
| Dips | Triceps, bryst, skuldre | Egenvekt-push |
| Push-up | Bryst, triceps, core | Progresjonsvennlig, ingen utstyrskrav |
| Landmine-press | Skuldre, core | Skulderskånsom pressretning |
| Markløft-roing (Pendlay row) | Rygg, biceps | Horisontal pull-styrke |
| Stang-roing (barbell row) | Rygg, biceps, core | Grunnøvelse pull |
| Enarms manualroing | Rygg, core (anti-rotasjon) | Rotasjonskontroll under belastning |
| Kabelroing (sittende) | Rygg, biceps | Kontrollert pull-bevegelse |
| Pull-up / nedtrekk | Rygg (lat), biceps | Vertikal pull |
| Face pull | Bakre skulder, øvre rygg | Skulderhelse, holdning |
| Gummistrikk pull-apart | Bakre skulder | Oppvarming/aktivering |
| Utoverrotasjon skulder (kabel/strikk) | Rotator cuff | Skadeforebygging skulder |
| Innoverrotasjon skulder (kabel/strikk) | Rotator cuff | Balanserer utoverrotasjon |
| Farmer's walk | Grep, core, trapezius | Funksjonell helkroppsstyrke |
| Suitcase carry (ettarms) | Core (anti-lateral bøy), grep | Rotasjonskontroll-overføring |
| Turkish get-up | Helkropp, skulderstabilitet, core | Kompleks bevegelseskontroll |

## Styrke — kjerne/rotasjon (20)

| Øvelse | Muskelgrupper | Notat |
|---|---|---|
| Medisinballkast (rotasjon, stående) | Skråmuskler, hofter | Direkte svingoverføring — rotasjonskraft |
| Kabel-rotasjon («chop», høy-til-lav) | Skråmuskler, core | Simulerer nedsving-mønster |
| Kabel-rotasjon («lift», lav-til-høy) | Skråmuskler, core | Simulerer oppsvingsmønster |
| Pallof press | Core (anti-rotasjon) | Motstår rotasjon — stabiliserer svingen |
| Pallof press (gående) | Core (anti-rotasjon), balanse | Progresjon med bevegelse |
| Planke (standard) | Core | Grunnleggende kjernestabilitet |
| Sideplanke | Skråmuskler, hofter | Frontalplan-stabilitet |
| Sideplanke med rotasjon | Skråmuskler, core | Dynamisk variant |
| Dead bug | Dyp core, hoftefleksorer | Kontrollert kjerneaktivering |
| Bird dog | Core, glutes, rygg | Kryssmønster-stabilitet |
| Russisk vridning (medisinball) | Skråmuskler | Rotasjonsstyrke med belastning |
| Hengende beinløft | Nedre core, hoftefleksorer | Krever grepstyrke og kjernekontroll |
| Ab wheel rollout | Core, skuldre | Avansert anti-ekstensjon |
| Kettlebell windmill | Skråmuskler, skulderstabilitet | Rotasjon under vertikal belastning |
| Halv-tyrkisk get-up | Core, skulderstabilitet | Regresjon av full Turkish get-up |
| Renegade row | Core (anti-rotasjon), rygg | Ustabilt underlag under pull |
| Landmine rotasjon (180) | Skråmuskler, hofter | Høy overføring til svinghastighet |
| Cable anti-rotasjon press (halv-kne) | Core | Isolerer anti-rotasjon uten beinkompensasjon |
| Sit-up med vekt | Rectus abdominis | Klassisk, brukes måteholdent |
| Reverse crunch | Nedre rectus abdominis | Kontrollert bekkentilt |

## Power/plyometri (15)

| Øvelse | Muskelgrupper | Notat |
|---|---|---|
| Medisinballkast (rotasjon, kraft) | Skråmuskler, hofter | Måler RFD — kraftutvikling i rotasjon |
| Medisinball-slam | Helkropp, core | Vertikal kraftutløsning |
| Medisinball chest pass | Bryst, triceps, core | Horisontal kraftutløsning |
| Boksjump | Quadriceps, glutes | Vertikal eksplosivitet |
| Lengdehopp (stillestående) | Quadriceps, glutes | Horisontal eksplosivitet, måles ofte i tester |
| Hoppeknebøy (jump squat) | Quadriceps, glutes | Kraftutvikling under lav belastning |
| Delt jump (split squat jump) | Quadriceps, glutes | Unilateral eksplosivitet |
| Lateralt hopp (sideveis) | Adduktorer, glutes | Frontalplan-eksplosivitet |
| Depth jump | Quadriceps, legger | Reaktiv styrke (kort kontakttid) |
| Kettlebell swing | Glutes, hamstrings, core | Hoftedominant kraftutvikling |
| Rotasjonshopp (180°) | Helkropp, core | Rotasjonseksplosivitet, svingspesifikk |
| Skater hop | Glutes, adduktorer, balanse | Lateral eksplosivitet med landingskontroll |
| Trappesprint (kort) | Helkropp | Reaktiv kraft under tretthet |
| Broad jump til stick | Quadriceps, glutes | Eksplosivitet + landingskontroll |
| Single-arm medisinballkast | Skulder, core, rotasjon | Ettarms overføring, nær golfsvingens asymmetri |

## Mobilitet (24)

| Øvelse | Fokus | Notat |
|---|---|---|
| 90/90 hoftemobilitet | Hofte (rotasjon) | TPI Big 12 — hofterotasjon er ofte begrenset hos golfere |
| Hoftefleksor-tøyning (couch stretch) | Hoftefleksorer | Motvirker sittende livsstil |
| Hofte CARs (controlled articular rotation) | Hofte, full bevegelsesbane | Aktiv mobilitet, ikke bare passiv tøyning |
| Duesstilling (pigeon stretch) | Hofte (utoverrotasjon) | Dyp hoftetøyning |
| Adduktor-mobilisering (frosk-stilling) | Innside lår | Frontalplan-mobilitet |
| Hip airplane (mobilitet) | Hofte, balanse | Kombinerer mobilitet og kontroll |
| Bekkentilt (stående) | Bekkenkontroll | Grunnleggende bevissthetsøvelse |
| Thorakal rotasjon (open book) | Brystrygg | TPI Big 12 — rotasjon i brystryggen er kritisk for svingen |
| Katt-ku (cat-cow) | Rygg (fleksjon/ekstensjon) | Generell ryggmobilitet |
| Thorakal ekstensjon over skumrull | Brystrygg | Motvirker rund rygg |
| Sittende trunk-rotasjon | Brystrygg, hofte-isolert | Isolerer rotasjon fra hoftene |
| Kvadruped thorakal rotasjon («thread the needle») | Brystrygg, skulder | Kombinert mobilitet |
| Skulder CARs | Skulder, full bevegelsesbane | Aktiv skuldermobilitet |
| Vegg-glidninger (wall slides) | Skulder, skulderblad | Skulderrytme og holdning |
| Gummistrikk-dislokasjoner | Skulder | Bevegelighet gjennom hele banen |
| Sovestilling-tøyning (sleeper stretch) | Skulder (innoverrotasjon) | Vanlig golferbegrensning |
| Kryssarmstøyning | Bakre skulder | Enkel, effektiv |
| Ankel-dorsalfleksjon (kne-til-vegg) | Ankel | Påvirker knebøy- og svingstabilitet |
| Håndleddsmobilitet (flow) | Håndledd | Ofte oversett — viktig for kølle-svingplan |
| Verdens beste tøyning (world's greatest stretch) | Hofte, brystrygg, hamstrings | Kombinert helkroppsmobilitet |
| Halv-kne hoftefleksor + rotasjon | Hofte (kombinert) | Progresjon fra couch stretch |
| Sidebøy-tøyning (stående) | Skråmuskler | Frontalplan-mobilitet |
| Nakkemobilitet (rotasjon/sidebøy) | Nakke | Ofte glemt, påvirker synsfelt i adressen |
| Ryggliggende knerulling (lumbar rotation) | Korsrygg | Lav-intensiv mobilisering |

## Kondisjon (14)

| Øvelse | Type | Notat |
|---|---|---|
| Rolig løping | Aerob base | Grunnutholdenhet |
| Sykling (utendørs/spinning) | Aerob base | Leddskånsomt alternativ til løping |
| Roing (ergometer) | Aerob base, helkropp | God kombinasjon utholdenhet/styrke |
| Svømming | Aerob base | Leddskånsomt, helkropp |
| Rask gange (bakke/flatt) | Aerob base, lav belastning | Restitusjonsvennlig |
| Tempoløp (terskeltempo) | Aerob kapasitet | Bygger arbeidsøkonomi |
| Intervall 4×4 min | Aerob/anaerob | Klassisk VO2maks-protokoll |
| Sprintintervaller (10×30 m) | Anaerob/hurtighet | Direkte relevans for eksplosivitet i sving |
| Shuttle run (agility) | Anaerob/hurtighet | Retningsforandring, banerelevant |
| Smidighetsstige (agility ladder) | Koordinasjon/hurtighet | Fotarbeid og reaksjonsevne |
| Sirkeltrening (HIIT, helkropp) | Anaerob | Tidseffektiv kondisjonsøkt |
| Bakkeintervaller | Anaerob, beinstyrke-hybrid | Kombinerer kraft og kondisjon |
| Tredemølle-intervall (stigning) | Aerob/anaerob | Kontrollert alternativ til bakke |
| Airbike-intervaller | Anaerob, helkropp | Skånsomt for ledd, høy intensitet mulig |

## Stabilitet/balanse — golfspesifikk (14)

| Øvelse | Fokus | Notat |
|---|---|---|
| Ettbeinsbalanse (øyne åpne) | Statisk balanse | Screeningens enkleste ledd |
| Ettbeinsbalanse (øyne lukket) | Statisk balanse, propriosepsjon | Progresjon |
| Ettbeinsbalanse på ustabilt underlag | Dynamisk balanse | Bosu/pute — svingspesifikk propriosepsjon |
| Y-balance reach | Dynamisk balanse, hofte-kontroll | Standard screeningsøvelse |
| Bekkenkontroll i halv-kne | Kjernestabilitet, hoftekontroll | Isolerer bekkenkontroll fra beina |
| Glute-aktivering (clamshell) | Glutes (hoftestabilisator) | Forebygger kneknip |
| Glute-aktivering (monster walk med strikk) | Glutes medius | Sideveis hoftestabilitet |
| Single-leg deadlift-balanse (uten vekt) | Balanse, hamstrings | Innlæringssteg før belastet RDL |
| Golfsving-mønster uten kølle (rotasjonskontroll) | Rotasjonskontroll, sekvensiering | Bygger bro mellom FYS og TEK |
| Statisk lunge med rotasjon (armer strukket) | Kjerne, hoftekontroll | Kombinerer stabilitet og mobilitet |
| Halv-kne kabel-press (anti-ekstensjon) | Kjernestabilitet | Motstår overstrekk i korsrygg |
| Enarms farmers walk | Lateral kjernestabilitet | Asymmetrisk belastning, svingrelevant |
| Balanse-planke på ball/pute | Kjernestabilitet, propriosepsjon | Progresjon fra standard planke |
| Sekvensiell rotasjonskontroll (stå → hofte → skulder) | Kinetisk kjede, sekvensiering | Direkte bro til golfsvingens kraftoverføring (hofte leder, jf. P-posisjoner) |

---

## Åpne punkter (fase 0.3)

1. **Skalering per kategori (2–4+ økter/uke, profil):** foreslår at coach velger en profil
   (mer bevegelighet / mer kondisjon / mer styrke) ved programoppstart, og at profilen
   styrer en anbefalt fordeling av kategoriene over — ikke en regel, kun forhåndsutfylling.
   Ikke besluttet.
2. **Video/bilde-dekning:** 132 øvelser uten video ved lansering er mye å taste manuelt.
   Foreslår: prioriter video for Power/plyometri + Stabilitet/balanse (høyest skaderisiko
   ved feil utførelse) først, resten etter behov.
3. **Duplikater mot eksisterende `ExerciseDefinition`-rader:** denne listen er ikke
   kryssjekket mot øvelser som allerede finnes i databasen med `pyramidArea = FYS`.
   Innlastingsskriptet må de-duplisere på navn før insert.
