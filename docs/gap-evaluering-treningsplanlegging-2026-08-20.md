# Gap-evaluering — treningsplanlegging AK Golf HQ

Samlet fra fem felt-gjennomganger: relevans-matrise, AI-forberedelse, onboarding/fasiliteter, gruppesynk, tilgangsskille og helhets-hull. Alt merket (?) er førsteutkast som venter på Anders' korrigering. Dato: 20.08.2026.

**Historisk dokument — §1 er delvis erstattet 20.08 (runde 2, fase 0).** Relevans-matrisen
under er førsteutkastet; gjeldende fasit er
`docs/relevans-matrise-treningsplanlegging-2026-08-20-v2.md`, som blant annet retter putt
til seks bånd, FYS til tre områder, én dimensjon per drill (ikke flere), og at BANE ikke er
bundet til pyramide SPILL. Beholdt uendret her som logg over hvordan konklusjonen ble nådd.

---

## 1. Relevans-matrisen — førsteutkast

**Prinsipp:** hvert av de 17 områdene besvarer tre spørsmål: (1) gjelder motorikk-trinnene UTEN_BALL / LAV_HAST / AUTO — og hvis nei, hva erstatter dem, (2) hvilke egne teknikk-dimensjoner har området (som putting-dimensjonene), (3) gjelder belastning og press som normalt. Usikre celler er merket (?).

**Tverrgående forslag (?):** motorikk spørres kun når pyramiden er TEK. Ved SLAG/SPILL/TURN settes AUTO automatisk (kan overstyres) — man slår ikke golfslag under press i UTEN_BALL. Egne dimensjoner er valgfrie, typede merkelapper på drillen — aldri fritekst, aldri krav.

### Fullsving

| Område | Motorikk | Egne teknikk-dimensjoner | Belastning/press |
|---|---|---|---|
| TEE_TOTAL | JA — alle tre trinn | Sikte/oppstilling · startretning · kurve · treffpunkt (?) | Normal |
| INNSPILL_200 | JA | Startretning · kurve · høyde · treffpunkt (?) | Normal |
| INNSPILL_150 | JA | Startretning · kurve · høyde · lengdekontroll (?) | Normal |
| INNSPILL_100 | JA | Lengdekontroll · startretning · høyde (?) | Normal |
| INNSPILL_50 | JA | Lengdekontroll (dominant — delvise sving/klokkesystem) · høyde · spinn (?) | Normal |

### Nærspill

| Område | Motorikk | Egne teknikk-dimensjoner | Belastning/press |
|---|---|---|---|
| CHIP | JA (?) — Anders unntok kun putt og bunker | Landingspunkt · utrulling · lavpunkt/treffpunkt · køllevalg (?) | Normal |
| PITCH | JA (?) | Lengdekontroll · landingspunkt · høyde · spinn (?) | Normal |
| LOB | JA (?) | Høyde · landingspunkt · bounce-bruk/treffpunkt (?) | Normal |
| BUNKER | NEI (Anders). Erstatning (?): to-trinns sand-trapp — UTEN_BALL_I_SAND (linjedrill i sanden) → MED_BALL | Sandinngang (hvor kølla treffer sanden) · lengdekontroll · høyde/spinn · lie-variasjon (god/nedgravd/oppoverbakke) (?) | Normal |

### Putting

| Område | Motorikk | Egne teknikk-dimensjoner | Belastning/press |
|---|---|---|---|
| PUTT_0_3 | NEI (Anders) — erstattes av putting-dimensjonene | Ballstart · sikte dominante; greenlesing lav, lengdekontroll nær irrelevant (?) | Normal — INNENDØRS = puttematte/simulator |
| PUTT_3_5 | NEI | Ballstart · sikte · greenlesing (?) | Normal |
| PUTT_5_10 | NEI | Alle fire likeverdige: greenlesing · sikte · ballstart · lengdekontroll (?) | Normal |
| PUTT_10_40 | NEI | Lengdekontroll · greenlesing dominante · ballstart (?) | Normal |
| PUTT_40_PLUSS | NEI | Lengdekontroll dominant · greenlesing (?) | Normal |

### FYS

| Område | Motorikk | Egne teknikk-dimensjoner | Belastning/press |
|---|---|---|---|
| STYRKE | NEI — erstattes av FYS-parametrene fra spec-en: serier · reps · pause · RIR · vekt | Ingen (profil bevegelighet/kondisjon/styrke ligger på programmet, ikke drillen) | Skjules i UI (?) — lagres som INNENDØRS/ALENE som default |
| MOBILITET | NEI — som STYRKE | Ingen | Skjules (?) |

### Spill

| Område | Motorikk | Egne teknikk-dimensjoner | Belastning/press |
|---|---|---|---|
| BANE | NEI — auto AUTO (?) | Spilleformat (treningsrunde/scoringsrunde/simulering) · strategioppgave (DECADE, buffer, Tiger Five, 8-sekundersregelen) · antall hull (?) | Belastning auto-foreslås BANE (KONKURRANSE i turneringsblokk); press er hovedaksen og fullt relevant |

**Reps-enhet per område (?):** slag for alle fullsving- og nærspillsområder, putter for de fem puttebåndene, hull for BANE, serier × reps for STYRKE/MOBILITET. Live-øktas +5/+10/+25 gjelder golfområdene; FYS logger per serie (allerede besluttet); BANE logger per hull.

**Faglig begrunnelse for putting- og bunker-unntaket:** putting har ingen hastighetstrapp — slaget er allerede lavhastighet, og læringen ligger i de fire dimensjonene (greenlesing er persepsjon, sikte er oppstilling, ballstart er treffkvalitet, lengdekontroll er tempo). Bunker kan ikke trenes meningsfullt uten sand, og «lav hastighet» fungerer ikke fordi slaget krever fart gjennom sanden — trappen der er sandinngang uten ball → med ball.

**Datamodell-forberedelse (for AI-coach v2):** egne dimensjoner lagres som typet enum per område (én tabell, f.eks. OmradeDimensjon med omrade + kode), slik at analysen kan krysse «lengdekontroll-putting under OBSERVERT-press» like presist som formelaksene. Dimensjonene blir en sjette, områdespesifikk analyseakse.

**UX (jf. bærende prinsipp):** spilleren ser aldri matrisen — den styrer kun hvilke felter som i det hele tatt vises når en drill planlegges. Putt-drill viser aldri motorikk-feltet; FYS-drill viser aldri press. Færre felter per område er enklere, ikke mer komplisert.

**Åpne punkter i matrisen (utover (?)-cellene):** hva som lagres som motorikk-verdi for putt/bunker i formel-strengen (tomt felt, eget trinn-sett eller default) avgjør datamodellen; om en drill kan bære flere dimensjoner samtidig; hvordan øktmaler håndterer områder uten motorikk (malfeltet «full AK-formel» antar i dag alle fem akser); om dimensjonene skal inn som egen analyseakse — spec-ens analysedel nevner kun de fem formelaksene.

---

## 2. AI-coach-kartleggingen

Arkitekturen gjenbrukes fra playerhq-agents-skillen: DATA → SIGNALER → SKILLS → AGENTER → PLAN-HANDLINGER. Alt AI leverer er forslag som bekreftes — aldri auto-endring (18.08). **KRITISK** = umulig i v2 hvis v1 ikke fanger det; kan ikke rekonstrueres i etterkant.

1. **Plan-generering** (års-/periode-/uke-/øktforslag). v1 må fange: målsetninger (resultat + prosess), turneringskalender, treningstid-estimat fra onboarding, fasiliteter med fysiske mål, maler som strukturert data, typet 17-område + full v2-formel per drill. **KRITISK:** fasilitets-dimensjonene og typet område — fri tekst gir falske kategorier AI aldri kan vaske.

2. **Plan-justering løpende** (plan mot faktisk per akse). v1: planlagt OG faktisk reps/tid per drill, HOPPET_OVER-status, spontan drill merket uplanlagt, pausetid, FOKUS/GJENNOMFØRING/MESTRING (tomt lagres som tomt). **KRITISK:** hoppet-over/spontan-merkingen — uten den kan AI aldri skille «endret plan» fra «fulgte ikke plan».

3. **Drill-forslag per svakhet.** v1: øvelsesbank med full formel + typet område, SG per område fra runder, testresultater, drill-historikk, fasilitets-filter. Weakness- og drill-selection-skillene må skrives om fra L-fase/CS til motorikk/belastning. Avhenger av relevans-matrisen (del 1).

4. **Standardfordeling av målmatriser** (motorikk × belastning per arbeidsoppgave). v1: coachens manuelt satte matriser, auto-telling per celle, oppgavens slag + P-posisjon. **KRITISK:** de manuelle matrisene ER treningsdataene — settes de ikke strukturert i v1, har v2 ingenting å lære standardene fra.

5. **Automatisk FYS-programforslag.** v1: fysiske testresultater som typede felter i spillerprofilen (benkpress, markløft, knebøy, club speed, 3000 m), FYS-øvelsesbank, FYS-logg per serie, programprofil. **KRITISK:** testresultater typet, aldri fritekst. NB: FYS-formelens referanseverdier avventer fortsatt.

6. **Teknisk statusrapport-tolkning.** v1: TrackMan-spredning koblet til drill, testdata, alle slag under runder med skille trening/konkurranse, teknisk plan med rep-telling. **KRITISK:** trening-vs.-konkurranse-flagget på runder — spredning i tre kontekster krever det fra dag én.

7. **Turneringsforberedelse.** v1: turneringsstatus, blokk-merker UTVIKLING/FORBEREDELSER/KONKURRANSE, press-aksen per drill, forberedelsesvariant (konservativ/standard/aggressiv), baneinfo. Gjenbruk: turnering-agenten + periodization-skill.

8. **Tilbakefall-varsling etter turneringshelger.** v1: turneringsdatoer, tidsstempler på all logging og TrackMan-import, teknisk oppgavestatus over tid. **KRITISK:** tidsstemplet spredningsdata per kontekst — tilbakefall er en tidsserie; hull kan aldri rekonstrueres.

9. **TrackMan-analyse per drill (Truth Layer).** v1: TrackMan-nøkkel (session-id, helst slag-id) per innslag lagret stille, «måles med TrackMan»-flagg, full formel på drillen. **KRITISK:** dette er datasettet «hvert slag vet hvorfor det ble slått» — kjernen i 10M-visjonen; kan aldri retro-merkes.

10. **Periodiseringsforslag.** v1: historikk planlagt mot faktisk volum per periode/blokk, turneringskalender, skoleblokker. Gjenbruk: pyramid-skill — som forslag, aldri krav.

11. **Spørsmål-svar (Caddie over egne data).** v1: alt over i ETT konsistent skjema — v2-vokabular i databasen, én øktfamilie (ikke fire), typet område. **KRITISK i praksis:** konsolideringen — fire parallelle øktfamilier gir AI fire sannheter.

12. **Coach-avlastning** (stall-prioritering: hvem trenger blikk). v1: coach-sammendragets data, uleste medier/kommentarer, «sett av coach»-kvittering, vurderingssnitt per spiller.

**Gjenbruk:** fire-lags-arkitekturen og PlanAction-typene gjenbrukes som leveringsformat; de fem agentene (plan-vakten, runde-, turnering-, test-, trackman-agenten) dekker evne 2/3/7/8/9. **Må revideres:** auto-apply-tabellen (strider mot 18.08), junior-guard (slettet), progression- og drill-selection-skill (v1-formel). Signal-laget i skillen er design, ikke kode — beregningsfunksjonene finnes ikke i src/lib.

**De kritiske radene samlet — v1-skjemaet MÅ ha:** (a) TrackMan-nøkkel per innslag, (b) full v2-formel typet per drill, planlagt og faktisk, (c) fasilitets-dimensjoner, (d) trening/konkurranse-flagg på runder, (e) HOPPET_OVER + spontan-merking, (f) målmatrisene strukturert, (g) fysiske tester typet, (h) tidsstempler overalt. Alt annet kan v2 utlede senere.

---

## 3. Fasilitetsmodellen og onboarding

**Prinsipp:** onboarding fanger bare det planleggingen ikke kan virke uten — samtykke, fasiliteter med fysiske mål, treningstid. Alt annet flyttes til et «Fullfør profilen»-kort i portalen. Mål: under 4 minutter.

### Må-ha ved oppstart (5 steg)

1. **Identitet og samtykke:** fullt navn, e-post, telefon, fødselsdato (trigger mindreårig-flyt: under 16 → foresatt-e-post → foreldresamtykke; dagens mønster beholdes), aksept av vilkår + personvern tidsstemplet.
2. **Spillet:** hjemmeklubb, handicap, snittscore-estimat (brutto) → spillerkategori A–K beregnes automatisk, spørres aldri; merkes «estimat» til runder er logget. Mosjon/konkurranse beholdes.
3. **Treningstid (obligatorisk, Anders 20.08):** timer per uke (tall) + økter per uke (segment).
4. **Fasiliteter (obligatorisk — minst ett sted).** Felter per fasilitet: navn · type (klubbanlegg/simulator/treningssenter/hjemme) · inne/ute (finnes som PlayerFacility.isIndoor) · rangelengde i meter (null = ingen range; 200 m → driver filtreres bort) · maks puttelengde (enhet må avklares — meter eller fot) · muligheter (flervalg, gjenbruk DrillFasilitet-enumen: bunker, nærspillsareal, putting green kort/lang, range, bane, simulator, radar/TrackMan, vektstang, løpebane, medisinball) · radar-merke (TrackMan/FlightScope/R10/Mevo+ — grunnmur for Truth Layer) · notat. Åpningstider og reisetid: i modellen, aldri i onboarding. Fasiliteten er et **mulighetsfilter, aldri en regel** — øvelsesforslag filtreres via en matrise område → fasilitetskrav (Claude lager førsteutkast, Anders korrigerer).
5. **Mål (lett):** inntil 3 sesongmål (pills, finnes). Fulle RESULTAT-/PROSESSMÅL settes i Workbench.

### Kan fylles senere

Flere fasiliteter, åpningstider, reisetid · skole-/arbeidsrytme (ett valg + faste blokker med blokktype Skole) · treningsdager/tid-på-dagen-preferanser (flyttes ut av obligatorisk løp) · drivkraft · SG-baseline (hoppbart, beholdes) · utstyr (kølleoppsett, kamera, personlig launch monitor) · helsesamtykke (spørres først når klokke kobles) · delingssamtykke Team Norway/WANG (spørres ved gruppeinnmelding; FORESATT signerer for mindreårige) · FYS-profil.

### Spørres aldri

Spillerkategori (beregnes) · grupper (Anders legger inn alle før lansering; medlemskap vises, velges aldri; subscriber uten gruppe = null coach-innsyn) · AK-formel-parametere (spilleren møter aldri «belastning» i onboarding).

### Gjenbruk og ombygging

Dagens 7-stegs wizard har allerede mindreårig-gate, fasiliteter med navn/inne-ute/capabilities, økter/uke, sesongmål og hoppbart tall-steg. Ombyggingen er: (a) fysiske mål inn i PlayerFacility (rangelengde, maks puttelengde, type, radar-merke), (b) timer/uke-felt, (c) preferanse-pills ut av obligatorisk løp, (d) snittscore → A–K-beregning.

**Største åpne punkt:** om klubbanlegg (GFGK, WANG, Mulligan) skal være **delte katalogobjekter** coach vedlikeholder ett sted, eller privat kopi per spiller — duplisering gir drift i målene. Anbefaling: felles katalog + privat «egendefinert sted»; gruppespillere får gruppens anlegg automatisk. Terskelmatrisen område → fasilitetskrav finnes ikke ennå. Standard-modusens onboarding er ubesluttet (Tour bygges først).

---

## 4. Gruppesynk — anbefalt regel og kant-tilfeller

**Anbefalt regel (én setning):** gruppeøkta er originalen; hver spiller får en levende kopi som følger originalen helt til spilleren endrer planinnholdet — da løsrives den permanent. Oppmøte, logging og vurdering er aldri endringer. Ingen fletting, ingen konfliktdialoger.

**Tre handlingsklasser på en gruppeøkt-kopi:**

| Klasse | Eksempler | Effekt på lenken |
|---|---|---|
| Oppmøte | «Deltar ikke», hoppet over live | Ingen — kopien forblir lenket, status lagres |
| Gjennomføring | Faktiske reps, tid, bilder, kommentar, talenotat, stjerner | Ingen — spillerens egne data på kopien |
| Planendring | Endre driller/reps/tid, flytte økta, slette innhold | **Permanent løsrivelse** — kopien blir individuell økt med varig opphavsstempel «fra \<gruppe\>» |

**Kant-tilfellene:**
- **Kollisjon** (gruppe mot gruppe, eller gruppe mot individuell): begge vises i kalenderen med kollisjonsmarkering. Ingen auto-løsning — det ville vært en skjult treningsregel. Spilleren velger: «Deltar ikke» eller flytt egen økt.
- **Coach endrer gruppeøkta etterpå:** endringen når alle fortsatt lenkede kopier — men aldri gjennomførte økter (fullført økt er frossen historikk) og aldri løsrevne. Sletting: fremtidige lenkede kopier slettes; gjennomførte består med opphavsstempel.
- **Spilleren forlater gruppen:** gjennomført historikk beholdes i spillerens plan og analyse med gruppestempel; fremtidige lenkede kopier slettes; løsrevne består. Innmelding synker kun fremover, aldri bakover.
- **Analyse og rep-telling:** gruppeøkter teller nøyaktig som individuelle — det er spillerens faktiske logging som teller mot AK-formel-aksene og målmatrisen, ikke gruppeplanen. «Deltar ikke» = null bidrag. Opphavsstempelet gjør filtrering per gruppe gratis.
- **Vurderingen 1–5:** FOKUS/GJENNOMFØRING/MESTRING er alltid spillerens selvvurdering på egen kopi. Gruppecoachen ser aggregat (snitt + svarandel), setter aldri stjerner.

**Datamodell (AI v2):** kopien bærer `sourceGroupSessionId` + `groupId` + `detachedAt` (null = lenket). Stempelet slettes aldri — v2-AI-en kan da skille «det coachen planla» fra «det spilleren gjorde», per gruppe, uten datavask.

**UI:** spilleren ser aldri ordene «synk», «kopi» eller «løsrevet». Redigeres en gruppeøkt sier appen én setning: «Denne økta blir nå din egen — endringer fra \<gruppe\> når den ikke lenger.»

**Mangler beslutning:** selve løsrivelses-regelen, oppmøtestatus («Deltar ikke» finnes ikke i spec-en), propagering ved coach-endring/sletting, og hovedcoach-begrepet (se del 5 og 7).

---

## 5. Tilgangsskillet — hull som må tettes

Grunnmuren finnes og skal gjenbrukes: `src/lib/auth/coached.ts` er eneste lovlige port for spiller-synlighet i AgencyOS (selvbetjent subscriber er usynlig overalt), `GroupMember` har soft-end, og per-coach-modellen (eier + COACH/ASSISTANT-medlemskap, ADMIN ser alt) er bygget — Markus ser kun sine grupper. Seks hull:

1. **Veien INN for eksisterende subscriber.** Dagens invitasjonsflyt blokkerer bevisst brukere utenfor coach-scope — en subscriber kan i dag ikke legges i gruppe i det hele tatt. Riktig, for énsidig innmelding ville gitt coachen måneder med privat treningsdata i ett kall. Forslag: **to-sidig invitasjon** — coach inviterer, spilleren godtar eksplisitt i PlayerHQ, godtakelsen lagres som samtykke-artefakt etter DelingsSamtykke-mønsteret (append-only: hvem, når, tekstversjon).
2. **Mindreårige.** Gruppemedlemskap har ingen samtykkekobling i dag. Forslag: for spillere med `requiresGuardianConsent` godtas gruppe-invitasjonen av foresatt i forelder-portalen — samme FORESATT-port som delingssamtykkene, håndhevet i server-action, aldri bare UI.
3. **Ut av gruppen.** To regler mangler: (a) spilleren skal selv kunne melde seg ut fra profilen (samtykke kan alltid trekkes, GDPR art. 7), coach varsles; (b) historikk-grensen må avklares — se del 7. NB: `Group → members` har `onDelete: Cascade` — «slette gruppe» må bety arkivere (soft-delete), ellers forsvinner medlemshistorikken.
4. **AI i v2.** Tre lag forberedes i datamodellen nå: spillerens egen AI jobber alltid på egne data (alle brukere); coach-vendt AI går gjennom `coachScopedPlayerWhere` som all annen lesing — subscriber-data kan aldri lekke inn; aggregert/anonymisert bruk krever egen samtykke-scope, default AV. Samtykke-scopes som enum i DelingsSamtykke-mønsteret fra dag én.
5. **Synlighet motsatt vei.** «Hvem ser deg»-seksjon i spillerprofilen: hver gruppe med navngitte trenere (ASSISTANT merket «kun innsyn») og utmeldingsknapp. Subscriber uten grupper ser «Ingen har innsyn i dataene dine». Billig å bygge — bærer hele tillitsargumentet.
6. **«Hovedcoach» er udefinert** — brukes i spec-en (statusvarsler fra teknisk plan) men finnes ikke i datamodellen. En spiller i tre grupper har tre coacher. Se del 7, spørsmål 6.

---

## 6. Det ingen har spurt om

### Må avklares FØR bygging (påvirker datamodell eller kjerneflyt)

1. **Sykdom, skade og fravær.** BUSINESS-RULES har SKADET/PERMISJON med return-to-play — men spec-en sier ingenting om planlagte økter når status endres. Uten øktstatus for avlysning blir en sykeuke stående som «0 % gjennomført», og etterlevelsesanalysen (selve salgsargumentet) forurenses av falske avvik. Forslag: GJENNOMFØRT / HOPPET_OVER / AVLYST med årsak (SYK · SKADE · REISE · VÆR · ANNET); AVLYST vises men holdes utenfor etterlevelse. Hviledag som egen kalendermerkelapp, slik at «ingen økt» kan være planlagt, ikke bare tomt.
2. **Offline på rangen.** Live-økta er hele fangstpunktet, og ranger/haller har notorisk dårlig dekning. Må avgjøres før live-økta bygges: lokal-først, «siste lokale logg vinner» ved synk, talenotat-transkripsjon køes. Serwist/PWA-grunnmuren finnes.
3. **Foreldre-innsyn for mindreårige.** Forelder-portalen finnes, målgruppene er WANG-elever og GFGK-juniorer — men spec-en nevner ikke foreldre med ett ord. Vurderingene er selvrapportert og sensitivt; bilder/video av mindreåriges teknikk er PII — media-modellen må vite hvem som ser hva fra dag én.
4. **Varslingsmodellen.** «Coach varsles» står fire steder uten hvordan. Med 15+ spillere blir det varselstorm. Forslag: alt lander stille i stall-innboksen, push kun for et fåtall hendelser, daglig digest, eksplisitt hovedcoach-felt.
5. **Innsyn bakover, eksport og retensjon.** Hva skjer med coachens historikk-innsyn ved utmelding; spillerens rett til egne data ved coachbytte (GDPR art. 20 — og et salgsargument); retensjonsregel for treningslogg og media (video akkumulerer i Vercel Blob).

### Kan vente — men skriv beslutningen ned

6. **Gruppeøkt live:** hvem logger når 11 WANG-elever trener samtidig — default hver spiller selv, coach markerer oppmøte. Må avklares før WANG tar systemet i bruk.
7. **Booking møter planen:** booket 1:1-time bør vises i treningskalenderen — lesevisning i v1.1 holder.
8. **Historikk/arkiv:** avsluttet sesong forblir lesbar; «aldri slett, kun arkivstatus».
9. **Tidssoner:** veggklokke der spilleren er, naiv lagring, Oslo-uke for telling — konvensjon, ingen kode i v1.
10. **Vær:** ingen integrasjon — «flytt økta» + AVLYST(VÆR) dekker behovet.
11. **i18n-beredskap:** enum-verdier i basen skrives ASCII (INNENDORS, TRENINGSOMRAADE) med norsk visningslag — engelsk UI mulig senere uten datamigrering. Norsk bokmål forblir eneste UI-språk.
12. **Samtidighet:** coach redigerer planen mens spilleren står i live-økt — hvem vinner er udefinert; noteres som kjent hull.

---

## 7. Neste intervjurunde — spørsmålene til Anders

Prioritert og deduplisert på tvers av feltene. Hvert spørsmål har et foreslått default-svar — bekreft eller korriger.

**1. [HØY] Har CHIP, PITCH og LOB motorikk-trinnene UTEN_BALL/LAV_HAST/AUTO?** Du unntok eksplisitt kun putt og bunker.
*Default: Ja — de har fullverdig svingteknikk som kan trenes uten ball og i lav hastighet; kun putt og bunker unntas.*

**2. [HØY] Hva erstatter motorikk-feltet for putt og bunker i datamodellen?**
*Default: Feltet finnes ikke for disse områdene (vises aldri, lagres tomt). Putt bærer putting-dimensjonene, bunker bærer sand-trappen UTEN_BALL_I_SAND → MED_BALL. Motorikk-analyseaksen omfatter kun områder som har den.*

**3. [HØY] Egne teknikk-dimensjoner: gjelder de fire putting-dimensjonene alle fem bånd med vekting per bånd — og skal bunker og fullsving få tilsvarende dimensjoner?**
*Default: Ja på alle tre: alle fire putting-dimensjoner på alle bånd med veiledende vekting (0–3 fot: ballstart/sikte; 40+: lengdekontroll/greenlesing); bunker får sandinngang/lengdekontroll/høyde-spinn/lie; fullsving får startretning/kurve/høyde/treffpunkt/lengdekontroll som valgfrie merkelapper — de matcher TrackMan-parametrene og gjør Truth Layer-koblingen presis fra dag én. Alltid forslag, aldri krav.*

**4. [HØY] Gruppesynk: bekrefter du løsrivelses-regelen — planendring (driller, reps, tid, flytting) løsriver kopien permanent, mens oppmøte, logging og vurdering aldri løsriver?**
*Default: Ja. Enkel og forutsigbar; ingen fletting, ingen dialoger. Coach ser løsrevne økter i stallbildet.*

**5. [HØY] Coach-endring og utmelding: endringer når lenkede kopier men aldri gjennomførte økter; ved gruppe-exit beholdes gjennomført historikk hos spilleren (med gruppestempel) og fremtidige lenkede kopier slettes?**
*Default: Ja på begge. Fullført økt er frossen historikk; innmelding synker kun fremover.*

**6. [HØY] Hvem er «hovedcoach» når spilleren er i flere grupper (WANG + GFGK + Academy)?** Brukes i spec-en (statusvarsler) men finnes ikke i datamodellen.
*Default: Eksplisitt hovedcoach-felt per spiller, satt av deg i AgencyOS (fallback: coachen på aktiv PlayerEnrollment). Gruppecoacher ser alt for sine grupper; kun hovedcoach får teknisk plan-varslene. Vises i spillerprofilen.*

**7. [HØY] Innsyn bakover: mister coachen innsyn i spillerens personlige logg fra medlemsperioden når spilleren forlater gruppen — også bakover?**
*Default: Ja — grensen er gruppemedlemskap, konsekvent begge veier. Gruppens egne artefakter (gruppeplaner, oppmøtelister) forblir i gruppen. Enklest å forklare og tryggest GDPR-messig.*

**8. [HØY] Vei inn i gruppe: to-sidig invitasjon for eksisterende subscribere (coach inviterer, spilleren godtar i PlayerHQ, godtakelse lagres som samtykke-artefakt) — og foresatt-godkjenning i forelder-portalen for mindreårige?**
*Default: Ja på begge. Helt nye brukere via dagens e-postflyt der registrering = aksept. Gruppene du gjør ferdig FØR lansering unntas praktisk (samtykket ligger i WANG-/GFGK-avtalene), men artefaktet lagres likevel. Spilleren kan alltid melde seg ut selv fra profilen.*

**9. [HØY] AI: skal ALT AI leverer være forslag som krever bekreftelse — ingen auto-apply overhodet (auto-apply-tabellen i playerhq-agents forkastes)?**
*Default: Ja. I tråd med 18.08 (ingen regler håndheves) og kun-bekreftelser-autonomien fra 17.08.*

**10. [HØY] AI for selvstendige subscribere: full AI der AI-en i praksis ER coachen, og alle varsler går kun til spilleren selv?**
*Default: Ja — det er en bærende del av abonnementsverdien. Coach-varsler finnes kun for spillere i grupper.*

**11. [HØY] Skal økter kunne AVLYSES med årsak (SYK/SKADE/REISE/VÆR/ANNET), holdt utenfor plan-mot-faktisk-analysen?**
*Default: Ja — øktstatus GJENNOMFØRT/HOPPET_OVER/AVLYST(årsak). AVLYST vises i kalenderen men telles aldri som avvik. Ved userStatus SKADET foreslås ingenting automatisk i v1 — coach rydder planen manuelt.*

**12. [HØY] Skal live-økta virke helt uten dekning (offline-først, synk når nett er tilbake)?**
*Default: Ja — lokal-først for hele live-flyten, «siste lokale logg vinner», talenotat-transkripsjon køes. Serwist-grunnmuren finnes.*

**13. [HØY] Hva ser foreldre av treningsdata for mindreårige?**
*Default: Plan og øktsammendrag (reps/tid/oppmøte) inn i eksisterende ukerapport. FOKUS/GJENNOMFØRING/MESTRING, talenotater og kommentarer er private mellom spiller og coach. Bilder/video vises aldri automatisk til foreldre.*

**14. [MIDDELS] Fasiliteter: delte katalogobjekter for kjente anlegg (GFGK, WANG, Mulligan) som coach vedlikeholder ett sted — og maks puttelengde tastes i meter (systemet regner om til fot mot PUTT-båndene)?**
*Default: Ja på begge. Felles katalog + privat «egendefinert sted»; gruppespillere får gruppens anlegg automatisk. Meter i onboarding (slik folk snakker om greener), fot internt (FASIT). Claude lager førsteutkast til terskelmatrisen område → fasilitetskrav som du korrigerer — samme mønster som relevans-matrisen.*

**15. [MIDDELS] Varsling og signal-lag: alt lander stille i stall-innboksen med daglig digest, push kun for rep-mål nådd (hovedcoach) og «coach har sett økta di» (spiller) — og det deterministiske signal-laget (SG per område, completion-rate, turneringsnærhet) bygges allerede i v1 uten AI?**
*Default: Ja på begge. Signalene er ren matematikk, driver v1-analysekortene gratis, og gir v2-AI-en ferdig grunnlag — bygget mot v2-vokabularet, aldri v1-enums. Anonymisert tverrsnitt for kalibrering av standarder tillates (aldri PII i sky-prompts); all per-spiller-innsikt bygger kun på spillerens egne data.*
