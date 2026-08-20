# Relevans-matrisen v2 — treningsplanlegging

**Status: FORSLAG, venter Anders' korrigering (fase 0.1).** Reviderer førsteutkastet i
`docs/gap-evaluering-treningsplanlegging-2026-08-20.md` §1 etter Anders' eksplisitte
beslutning 20.08: *«Motorikk-trinnene UTEN_BALL / LAV_HAST / AUTO gjelder KUN fullsving.
Ingenting på nærspill eller putt har dem.»* Det forrige utkastet antok motorikk også på
CHIP/PITCH/LOB — det er rettet her. Alt merket **(?)** er fortsatt uavklart. Alt annet er
Claudes forslag til fasit — stryk/korriger fritt.

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
| PUTT_10_40 | Lengdekontroll · greenlesing (dominante) · ballstart | Normal |
| PUTT_40_PLUSS | Lengdekontroll (dominant) · greenlesing | Normal |

Faglig begrunnelse uendret: putting har ingen hastighetstrapp — slaget er allerede
lavhastighet, og læringen ligger i de fire dimensjonene (greenlesing = persepsjon, sikte =
oppstilling, ballstart = treffkvalitet, lengdekontroll = tempo).

## FYS — motorikk NEI, egne dimensjoner NEI

| Område | Egne teknikk-dimensjoner | Belastning/press |
|---|---|---|
| STYRKE | Ingen — erstattes av FYS-parametrene fra spec-en: serier · reps · pause · RIR · vekt | Skjules i UI — lagres som `INNENDØRS`/`ALENE` default |
| MOBILITET | Ingen | Skjules i UI — lagres som `INNENDØRS`/`ALENE` default |

Profilbredde (bevegelighet/kondisjon/styrke) ligger på FYS-programmet, ikke på den enkelte
drillen — se `docs/fys-ovelsesbank-2026-08-20.md`.

## Spill — motorikk NEI (auto AUTO), egen dimensjon JA

| Område | Egne teknikk-dimensjoner (forslag) | Belastning/press |
|---|---|---|
| BANE | Spilleformat (treningsrunde/scoringsrunde/simulering) · strategioppgave (DECADE, buffer, Tiger Five, 8-sekundersregelen) · antall hull | Belastning auto-foreslås `BANE` (`KONKURRANSE` i turneringsblokk); press er hovedaksen og fullt relevant |

**(?) uavklart:** om BANE i praksis alltid skal ha motorikk satt til `AUTO` bak kulissene
(for analysekonsistens på tvers av områder) eller om feltet skal være helt fraværende som
for nærspill/putt. Forslag: fraværende — samme mønster som resten av ikke-fullsving-
områdene, enklere regel («motorikk finnes kun på fem områder»).

---

## Reps-enhet per område (forslag, uendret fra utkast 1)

| Gruppe | Enhet |
|---|---|
| Fullsving + nærspill (TEE_TOTAL … LOB, BUNKER) | Slag |
| Putting (alle fem bånd) | Putter |
| BANE | Hull |
| STYRKE / MOBILITET | Serier × reps |

Live-øktas +5/+10/+25-knapper gjelder golfområdene (slag/putter); FYS logger per serie
(allerede besluttet i spec-en); BANE logger per hull.

---

## Datamodell-konsekvens

- `motorikk`-feltet på drill/øvelse/test blir **nullable** og vises kun når området er ett
  av de fem fullsving-områdene. Formel-strengen for andre områder hopper over motorikk-
  segmentet (f.eks. `TEK_CHIP_TRENINGSOMRADE_ALENE`, ikke `TEK_CHIP_null_...`).
- Egne teknikk-dimensjoner lagres som typet enum per område i én tabell
  (`OmradeDimensjon`: `omrade` + `kode`), slik at analysen kan krysse «lengdekontroll-
  putting under OBSERVERT-press» like presist som formelaksene. En drill kan bære **flere**
  dimensjoner samtidig (forslag — se åpne punkter).
- BUNKER får i tillegg et eget `sandtrinn`-felt (`UTEN_BALL_I_SAND` | `MED_BALL`), separat
  fra den generelle motorikk-enumen — det er bunkers eneste bruk av en trappe-lignende verdi.
- Øktmaler («full AK-formel» klar til bruk) må ikke lenger anta at alle fem formelakser
  finnes på enhver drill — malmotoren viser kun feltene som er relevante for drillens område
  (jf. bærende UX-prinsipp: «Putt-drill viser aldri motorikk-feltet»).

## Fortsatt åpne punkter i matrisen

1. Kan en drill bære **flere** egne dimensjoner samtidig, eller kun én dominerende? Forslag:
   flere, med valgfri markering av «dominant» — matcher hvordan Anders selv beskriver
   vektingen over (f.eks. «lengdekontroll dominant» på PUTT_40_PLUSS).
2. Skal dimensjonene inn som **egen, sjette analyseakse** i analysedelen, eller forbli en
   ren filtreringsverdi på drillen? Spec-ens analysedel nevner i dag kun de fem
   formelaksene. Forslag: egen akse — den er billig å legge til nå og umulig å rekonstruere
   i etterkant hvis den ikke fanges fra v1.
3. BANE-spørsmålet over (motorikk fraværende vs. auto-`AUTO`).
