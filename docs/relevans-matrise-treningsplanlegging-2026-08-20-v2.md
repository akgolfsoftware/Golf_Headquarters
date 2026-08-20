# Relevans-matrisen v2 — treningsplanlegging

**Status: DELVIS BEKREFTET (rettet 2. gang 20.08.2026).** Reviderer førsteutkastet i
`docs/gap-evaluering-treningsplanlegging-2026-08-20.md` §1 etter Anders' eksplisitte
beslutning 20.08: *«Motorikk-trinnene UTEN_BALL / LAV_HAST / AUTO gjelder KUN fullsving.
Ingenting på nærspill eller putt har dem.»* Det forrige utkastet antok motorikk også på
CHIP/PITCH/LOB — det er rettet her. Alt merket **(?)** er fortsatt uavklart. Alt annet er
Claudes forslag til fasit — stryk/korriger fritt.

**Rettelser samme dag, runde 2 (Anders):**
- Putting er **seks** bånd, ikke fem: 0–3 · 3–5 · 5–10 · 10–25 · 25–40 · 40+ fot
  (10–40-båndet delt i to). Rettet i `docs/FASIT-AK-GOLF-HQ.md` og under.
- FYS er **tre** områder, ikke to: **Styrke · Kondisjon · Bevegelighet** (kondisjon lagt
  til, mobilitet omdøpt bevegelighet — matcher spec-ens profilbeskrivelse «mer
  bevegelighet, mer kondisjon, mer styrke»).
- **Én drill kan IKKE bære flere egne dimensjoner samtidig** — kun én. (Rettet ned fra
  forslaget «flere, med dominant-markering».)
- **Dimensjonene blir en egen, sjetteanalyseakse** — bekreftet.
- **BANE er ikke låst til pyramide SPILL.** En BANE-drill kan stå under TEK (teknisk
  fokus på banen), SLAG (spesifikt golfslag på banen), SPILL (strategi/scoring) eller TURN
  (turneringsspill) — pyramide og område er uavhengige akser overalt, også for BANE.
  Grupperingen «Fullsving/Nærspill/Putting/FYS/Spill» under er kun for lesbarhet, ikke en
  pyramide-binding.

**Kilder:** `docs/spec-treningsplanlegging-2026-08-19.md` §«Parameter-relevans per område»,
`docs/gap-evaluering-treningsplanlegging-2026-08-20.md` §1 og §7 (spørsmål 1–3),
`docs/FASIT-AK-GOLF-HQ.md` (17-listen, AK-formelen).

---

## Prinsipp (uendret fra utkast 1, presisert)

Hvert av de 17 områdene besvarer tre spørsmål:

1. **Motorikk:** har området UTEN_BALL/LAV_HAST/AUTO? Svaret er **JA kun for de fem
   fullsving-områdene.** Alle andre områder har feltet skjult — det lagres aldri, og
   motorikk-analyseaksen (spec-ens analysedel) omfatter kun disse fem.
2. **Egne teknikk-dimensjoner:** valgfrie, typede merkelapper (aldri fritekst, aldri krav)
   som erstatter motorikk der motorikk ikke gjelder, og supplerer der den gjelder.
3. **Belastning/press:** gjelder alle områder som normalt, med to unntak (FYS skjuler dem i
   UI, BANE auto-foreslår belastning).

**Hva erstatter motorikk-feltet der det ikke gjelder (fase 0.2, punkt 1):** ingenting
strukturelt erstatter det i formelstrengen — feltet er `null`/skjult, og områdets egne
teknikk-dimensjoner bærer analysen i stedet. Unntak: **BUNKER** får et eget to-verdis felt
(se under) fordi sandkontakt er en reell, om enn liten, læringstrapp som ikke passer i den
generelle motorikk-enumen.

---

## Fullsving — motorikk JA (alle tre trinn)

| Område | Egne teknikk-dimensjoner (forslag) | Belastning/press |
|---|---|---|
| TEE_TOTAL | Sikte/oppstilling · startretning · kurve · treffpunkt | Normal |
| INNSPILL_200 | Startretning · kurve · høyde · treffpunkt | Normal |
| INNSPILL_150 | Startretning · kurve · høyde · lengdekontroll | Normal |
| INNSPILL_100 | Lengdekontroll · startretning · høyde | Normal |
| INNSPILL_50 | Lengdekontroll (dominant — delvise sving/klokkesystem) · høyde · spinn | Normal |

Dimensjonene er valgt fordi de matcher TrackMan-parametrene 1:1 (startretning = Launch
Direction, kurve = Spin Axis/Curve, høyde = Apex Height, treffpunkt = Face-to-Path/Smash
Factor) — det gjør Truth Layer-koblingen presis fra dag én, uten oversettelseslag.

## Nærspill — motorikk NEI (rettet fra utkast 1)

Chip, pitch og lob har **ikke** motorikk-trinn, i tråd med 20.08-beslutningen. Ingen egen
læringstrapp erstatter det — dimensjonene under bærer teknikk-analysen alene.

| Område | Egne teknikk-dimensjoner (forslag) | Belastning/press |
|---|---|---|
| CHIP | Landingspunkt · utrulling · lavpunkt/treffpunkt · køllevalg | Normal |
| PITCH | Lengdekontroll · landingspunkt · høyde · spinn | Normal |
| LOB | Høyde · landingspunkt · bounce-bruk/treffpunkt | Normal |
| BUNKER | Sandtrinn (eget felt, se under) · sandinngang · lengdekontroll · høyde/spinn · lie-variasjon (god/nedgravd/oppoverbakke) | Normal |

**BUNKER — sandtrinn (eget felt, ikke motorikk):** `UTEN_BALL_I_SAND` (linjedrill i sanden,
lærer sandkontakt uten ball) → `MED_BALL`. Faglig begrunnelse uendret fra utkast 1: bunker
kan ikke trenes meningsfullt uten sand, og «lav hastighet» fungerer ikke fordi slaget
krever fart gjennom sanden.

## Putting — motorikk NEI (uendret fra utkast 1)

| Område | Egne teknikk-dimensjoner (vekting, forslag) | Belastning/press |
|---|---|---|
| PUTT_0_3 | Ballstart · sikte (dominante) · greenlesing (lav) · lengdekontroll (nær irrelevant) | Normal — INNENDØRS = puttematte/simulator |
| PUTT_3_5 | Ballstart · sikte · greenlesing (jevnt) | Normal |
| PUTT_5_10 | Alle fire likeverdige: greenlesing · sikte · ballstart · lengdekontroll | Normal |
| PUTT_10_25 | Greenlesing · lengdekontroll (begge dominante) · ballstart | Normal |
| PUTT_25_40 | Lengdekontroll (dominant) · greenlesing | Normal |
| PUTT_40_PLUSS | Lengdekontroll (dominant) · greenlesing | Normal |

**Rettet 20.08 (runde 2):** 10–40-båndet er delt i PUTT_10_25 og PUTT_25_40 — seks bånd
totalt, ikke fem. Se `docs/FASIT-AK-GOLF-HQ.md`.

Faglig begrunnelse uendret: putting har ingen hastighetstrapp — slaget er allerede
lavhastighet, og læringen ligger i de fire dimensjonene (greenlesing = persepsjon, sikte =
oppstilling, ballstart = treffkvalitet, lengdekontroll = tempo).

## FYS — motorikk NEI, egne dimensjoner NEI

**Rettet 20.08 (runde 2): tre områder, ikke to.** KONDISJON lagt til; MOBILITET omdøpt
BEVEGELIGHET (norsk framfor anglisisme, samme begrep).

| Område | Egne teknikk-dimensjoner | Belastning/press |
|---|---|---|
| STYRKE | Ingen — erstattes av FYS-parametrene fra spec-en: serier · reps · pause · RIR · vekt | Skjules i UI — lagres som `INNENDØRS`/`ALENE` default |
| KONDISJON | Ingen | Skjules i UI — lagres som `INNENDØRS`/`ALENE` default |
| BEVEGELIGHET | Ingen | Skjules i UI — lagres som `INNENDØRS`/`ALENE` default |

Profilbredde (bevegelighet/kondisjon/styrke) er nå direkte de tre FYS-områdene selv, ikke
et frittstående profilfelt på FYS-programmet — se `docs/fys-ovelsesbank-2026-08-20.md`
for øvelsesbanken (**åpent punkt:** loggeenhet for KONDISJON, se under).

## BANE — motorikk NEI, egen dimensjon JA (ikke låst til pyramide SPILL)

**Rettet 20.08 (runde 2):** BANE er et **område**, ikke en pyramide-binding. En BANE-drill
kan stå under TEK (teknisk fokus mens man spiller banen), SLAG (trene et spesifikt
golfslag på banen), SPILL (strategi/scoring) eller TURN (turneringsspill) — bekreftet av
Anders. Overskriften «Spill» i utkast 1 antydet feilaktig at BANE hørte til pyramide SPILL
alene; den er kun en lesbarhets-gruppering her, ikke en regel.

| Område | Egne teknikk-dimensjoner (forslag) | Belastning/press |
|---|---|---|
| BANE | Spilleformat (treningsrunde/scoringsrunde/simulering) · strategioppgave (DECADE, buffer, Tiger Five, 8-sekundersregelen) · antall hull | Belastning auto-foreslås `BANE` (`KONKURRANSE` i turneringsblokk); press er hovedaksen og fullt relevant |

Motorikk fraværende for BANE (samme mønster som nærspill/putt/FYS) — motorikk finnes kun
på de fem fullsving-områdene, ingen unntak.

---

## Reps-enhet per område (forslag, uendret fra utkast 1)

| Gruppe | Enhet |
|---|---|
| Fullsving + nærspill (TEE_TOTAL … LOB, BUNKER) | Slag |
| Putting (alle seks bånd) | Putter |
| BANE | Hull |
| STYRKE | Serier × reps |
| KONDISJON | **(?) uavklart** — «serier × reps» passer ikke løping/sykling/roing. Forslag:
  minutter (varighet) som hovedenhet, distanse (km) som valgfritt tilleggsfelt |
| BEVEGELIGHET | Minutter (varighet) — mobilitetsøkter måles i tid, ikke reps, i praksis |

Live-øktas +5/+10/+25-knapper gjelder golfområdene (slag/putter); STYRKE logger per serie
(allerede besluttet i spec-en); BANE logger per hull; KONDISJON/BEVEGELIGHET trenger egen
loggemekanikk i live-økta (timer-basert, ikke reps-basert) — se åpne punkter.

---

## Datamodell-konsekvens

- `motorikk`-feltet på drill/øvelse/test blir **nullable** og vises kun når området er ett
  av de fem fullsving-områdene. Formel-strengen for andre områder hopper over motorikk-
  segmentet (f.eks. `TEK_CHIP_TRENINGSOMRADE_ALENE`, ikke `TEK_CHIP_null_...`).
- Egne teknikk-dimensjoner lagres som typet enum per område i én tabell
  (`OmradeDimensjon`: `omrade` + `kode`), slik at analysen kan krysse «lengdekontroll-
  putting under OBSERVERT-press» like presist som formelaksene. **En drill kan bære KUN ÉN
  dimensjon** — bekreftet av Anders 20.08 (rettet ned fra forslaget om flere). Dimensjonene
  utgjør analysens **sjette akse** — også bekreftet.
- BUNKER får i tillegg et eget `sandtrinn`-felt (`UTEN_BALL_I_SAND` | `MED_BALL`), separat
  fra den generelle motorikk-enumen — det er bunkers eneste bruk av en trappe-lignende verdi.
- Øktmaler («full AK-formel» klar til bruk) må ikke lenger anta at alle fem formelakser
  finnes på enhver drill — malmotoren viser kun feltene som er relevante for drillens område
  (jf. bærende UX-prinsipp: «Putt-drill viser aldri motorikk-feltet»).

## Fortsatt åpne punkter i matrisen

Punkt 1–3 fra forrige runde er nå **bekreftet** (kun én dimensjon per drill, egen sjette
akse, BANE er pyramide-uavhengig med motorikk fraværende) — se rettelsene øverst i
dokumentet. Gjenstående etter runde 2:

1. **Loggeenhet for KONDISJON** i live-økta og datamodellen — minutter (+ valgfri distanse)
   er forslaget, ikke bekreftet. Påvirker om FYS-logg-modellen (`FysOvelseRad`: reps/vekt)
   må utvides med et tid/distanse-alternativ, eller om KONDISJON trenger sin egen
   logg-variant.
2. **«Bevegelighet» vs. «Mobilitet»** i UI-tekst og enum-navn — forslått omdøpt til
   BEVEGELIGHET her; `DrillFasilitet`/skjema bruker fortsatt engelsk-inspirerte navn andre
   steder (se gotchas §i18n-beredskap: ASCII-enum, norsk visningslag) — ingen konflikt i
   praksis, men bør nevnes eksplisitt i fase 1-migreringen.
3. Om vektingen på putting-dimensjonene (f.eks. «lengdekontroll dominant») skal lagres som
   et strukturert felt, eller forbli veiledende tekst i denne matrisen alene — nå som en
   drill kun kan bære én dimensjon, faller spørsmålet delvis bort (vektingen ER valget av
   hvilken ene dimensjon som velges), men selve *rekkefølgen* i tabellen (hvilken er mest
   naturlig default per bånd) er fortsatt kun et forslag.
