# Treningsplanlegging — systemspec

**Status: FASE 0 NESTEN LUKKET (20.08.2026).** Bygget punkt for punkt fra Anders' svar
19.–20.08.2026. Relevans-matrisen, de tre åpne punktene og FYS-øvelsesbanken er godkjent
(runde 1–3, 20.08). **Gjenstår kun:** de ti spørsmålene i «Fortsatt uavklart før KOMPLETT»
under — hver har et forslått default, ingen er eksplisitt bekreftet ennå. Alt her er
besluttet av Anders med mindre annet er merket.

---

## Plan-hierarkiet (seks nivåer)

| Nivå | Hva det er | Hvordan det lages |
|---|---|---|
| Årsplan | Hele året | Spiller ELLER coach oppretter, med start- og sluttdato |
| Periodeplan | Periodene i året (GRUNNPERIODE osv.) | Spiller eller coach, med start- og sluttdato |
| Treningsblokk | Strekninger mellom holdepunkter, typisk mellom to turneringer | Merkes UTVIKLING · FORBEREDELSER · KONKURRANSE — fritt datospenn i kalenderen (f.eks. to 20.08–fr 28.08), kan deles opp (4 dager FORBEREDELSER + KONKURRANSE). Lagt i fasiten 20.08 |
| Ukeplan | Ukas økter | Fra mal eller blanke ark |
| Dagsplan | Dagens økter (kan være flere) | Utsnitt av uka |
| Øktplan | Innholdet i én økt | Driller, øvelser, tester, oppgaver fra teknisk utviklingsplan |

**Maler finnes på tre nivåer:** periode, uke og økt. Alt kan opprettes fra mal eller fra blanke ark.

---

## Økta (rammen)

| Felt | Regel |
|---|---|
| Dato, tid, sted, fasilitet | Alltid |
| Pyramide, område m.m. | Valgfritt — kun hvis hele økta er lik |

## Innholdet i økta

**Typer:** drill · øvelse · test · oppgave fra teknisk utviklingsplan

| Begrep | Betyr |
|---|---|
| Drill | Teknisk oppgave (P-posisjon, bevegelsesmønster) |
| Øvelse | En oppgave man gjør (friere treningsoppgave) |

**Hver drill/øvelse/test har ALLE planleggingsparametere:**

| Parameter | Merknad |
|---|---|
| Pyramide | FYS/TEK/SLAG/SPILL/TURN |
| Område | TEE_TOTAL … BANE (områdelisten i fasiten — 19 områder etter 20.08-rettelsen, se under) |
| Motorikk | UTEN_BALL / LAV_HAST / AUTO — gjelder KUN fullsving (Anders 20.08); nærspill og putt har ikke motorikk-trinn |
| Belastning | INNENDØRS / TRENINGSOMRÅDE / BANE / KONKURRANSE |
| Press | ALENE / OBSERVERT / KONKURRANSE / TURNERING |
| Planlagt antall reps | Per drill/øvelse |
| Estimert tid | Per drill/øvelse; drill har tid i timer og minutter |

AK-formelen settes altså **på hver enkelt drill/øvelse/test — ikke på økta.**
(Endring fra dagens kode, der den ligger på øktnivå.)

**Blandet økt (Anders 20.08):** En økt lages ofte på ett område med varianter (f.eks.
approach i ulike lengder), eller som nærspillsøkt (lob, bunker, chip, pitch, putting) —
men kan også være helt blandet: 20 driver → 20 putter → 20 bunkerslag. Blandet økt er
normal og fullverdig; merkingen bæres av hver drill, ikke av økta.

---

## Live-økt

Spilleren åpner økta og trykker **Start økten** → live-feed, øvelse for øvelse:

1. **Start øvelsen** → timer for øvelsen starter automatisk
2. Reps logges med hurtigknapper: **+5 · +10 · +25**
3. Øvelse fullført → timeren stopper
4. **Pause-timer** starter automatisk mellom øvelsene, løper til neste startes
5. Faktiske reps + faktisk tid lagres per drill (plan vs. gjennomført)

**Gjennomførbarhet (Anders 20.08):** Spilleren trykker på den planlagte økta → økta åpnes →
«Start økten» → første drill vises med ALT som er planlagt (pyramide, område, reps, tid).
Ekstremt gjennomførbart og oversiktlig, på en enkel og visuelt pen måte — slik at spilleren
sjelden eller helst aldri sporer av, og økta gjennomføres som den var ment.

**Offline (Anders 20.08):** live-økta MÅ virke uten dekning — logging lagres lokalt og
synkes når nettet er tilbake.

**Øktstatus og årsak (Anders 20.08):** økter kan avlyses med årsak (f.eks. syk, skade,
reise, vær) og holdes da utenfor plan-mot-faktisk-analysen. Når en planlagt økt slettes
eller hoppes over skal årsaken også fanges — «hva er årsaken?» er selve datapunktet.

**Per drill/øvelse/test under økten kan spilleren også:**

| Handling | Hva skjer |
|---|---|
| Legge til bilde eller video | Coach varsles · lagres i spillerprofilen på relevant sted · lagres i teknisk plan hvis det hører til en teknisk oppgave |
| Skrive kommentar | Samme som over |
| Talenotat (godkjent, punkt 4) | Snakke inn kommentar, transkriberes automatisk |

**Vurdering ved øktslutt (stjerner 1–5, presisert 20.08):**

| Vurdering | Måler |
|---|---|
| FOKUS | Hvor til stede var du mentalt |
| GJENNOMFØRING | Hvor godt fikk du gjort det planlagte |
| MESTRING | Fikk du til det du jobbet med |

Design (Claude-forslag 20.08): tre stjernerader på ett kort rett etter «Fullfør økten»,
innen tommelens rekkevidde, valgfritt talenotat under. Kan hoppes over — tomt lagres som
tomt, aldri som 3. Analysen viser svarandel ved siden av snittet og trend per vurdering
over tid.

---

## Godkjente tilleggsfunksjoner (alle 8, Anders 19.08)

| # | Funksjon | Beskrivelse |
|---|---|---|
| 1 | Hopp over / bytt rekkefølge | Drill kan hoppes over (lagres som «hoppet over») og dras i ny rekkefølge underveis |
| 2 | Spontan drill | Spilleren legger til uplanlagt innhold direkte i live-feeden |
| 3 | Glemt timer-vakt | Urimelig lang øvelsestimer → appen spør «trener du fortsatt?» |
| 4 | Talenotat | Tale i stedet for tekst, transkriberes |
| 5 | Score-registrering per test | Test i økta bruker testens egen protokoll i stedet for reps-knapper; resultat → testhistorikk + TalentHQ |
| 6 | Oppsummeringskort | Plan vs. gjennomført per drill, total øktvarighet, total pausetid, de tre vurderingene, bilder/kommentarer |
| 7 | Coach-sammendrag i stallbildet | Samme oppsummering per spiller uten å åpne hver økt; uleste bilder/kommentarer markert |
| 8 | TrackMan-kobling på drill-nivå | Drill merkes «måles med TrackMan», tall knyttes til drillen (grunnmur for AI Coach / Truth Layer) |

---

## Godkjenningsflyt (Anders 19.08)

| Hvem lager | Godkjenning |
|---|---|
| Coach lager plan for spiller | Aktiv med en gang — ingen godkjenning |
| Spiller lager komplett årsplan + periodisering | Coach varsles og kan gjøre endringer |
| Endringer på økter/trening (begge veier) | Ingen godkjenning |

**Presisert (Anders 20.08):** godkjenningen er ingen port. Spilleren planlegger, trener og
endrer alt helt fritt. «Godkjenning» betyr i praksis at coachen blir oppdatert og kan gå
inn og justere planen og øktene.

## AI (Caddie)

**Venter til v2.** Planleggingen i v1 er helt manuell, med maler.

**Men planlegges for nå (Anders 20.08):** alt AI-coachen automatisk skal kunne gjøre
kartlegges allerede i v1, slik at datamodellen fanger det som trengs fra dag én.
Kartleggingen inngår i gap-evalueringen igangsatt 20.08.

**Rammer besluttet (Anders 20.08, runde 2):**

- Alt AI leverer er **forslag som krever bekreftelse** — ingen auto-apply overhodet
- For selvstendige subscribere er AI-coachen i praksis coachen, og alle varsler går kun
  til spilleren selv — men dette kommer i v2; ved lansering er alt manuelt

## Maler

| Nivå | Innhold |
|---|---|
| Øktmal | ALT: driller med reps, tid og full AK-formel — klar til bruk |
| Ukemal | Øktene — låser ikke ukedager, plasseres fritt i kalenderen |
| Periodemal | Antall økter per pyramide (FYS/TEK/SLAG/SPILL/TURN) — grovplanlegg f.eks. en måned med økter uten innhold; innhold legges til senere fra teknisk plan, målsetninger m.m. (Anders 20.08) |

**Skall-økter (Anders 20.08):** en økt som ikke er komplett planlagt bærer en
pyramide-merkelapp i kalenderen (f.eks. «FYS-økt») til den fylles med innhold. Kalenderen
har ulik fargekode per pyramide — FYS · TEK · SLAG · SPILL · TURN — så fordelingen synes på
ett blikk. Fargene velges av Claude i designfasen etter samme psykologiske prinsipp som
prioritetsfargene i teknisk plan.

## Workbench-visjonen (Anders 19.08, med skjermbilde som inspirasjon)

Ett komplett planleggingsverktøy, Notion-kalender-aktig. ALT som planlegges for trening
skjer i samme verktøy — ingen separate flater.

| Element | Innhold |
|---|---|
| Kalendervisninger | 3 dager · uke · måned · år |
| Tidslinjer | Årsplan · progresjon · målsetninger · turneringsplanlegging |
| Utgangspunkt | Dagens Workbench-fasit (uke-grid + økt-editor i høyrepanel + ukevolum-stripe) |
| Mangler mot visjonen | 3-dagers/måned/års-visning + tidslinjene |

## Tidslinjen (år)

Viser alt planlagt på én linje: **perioder · turneringer · tester · samlinger.**

## Analysedelen

All data som finnes. AK-formelen er analyseaksene: fordi hver drill/øvelse/test bærer
full formel, kan all loggført trening summeres og krysses på hvilken som helst parameter:

| Eksempel-spørsmål analysen skal svare på |
|---|
| Hvor mye TEK er trent på INNSPILL_50 vs. CHIP? |
| Hvor mye av SLAG-treningen var under press vs. ALENE? |
| Tid i AUTO vs. LAV_HAST på et område over en periode |
| Planlagt vs. faktisk gjennomført — på alle akser |

Råstoffet er live-øktas logging (faktiske reps + faktisk tid per drill).

## Målsetninger

To måltyper:

| Type | Innhold | Måling |
|---|---|---|
| RESULTATMÅL | Utfallet — snittscore, kategori, turneringsplassering, testresultat | Automatisk fra runder/tester der data finnes |
| PROSESSMÅL | Det du gjør — treningsvolum, antall økter, gjennomførte driller | Automatisk fra treningsloggen der data finnes |

Der data ikke finnes: status settes manuelt av spiller/coach.

## Teknisk utviklingsplan (Anders 20.08)

**Struktur: slag → P-posisjon → arbeidsoppgave.**

| Nivå | Innhold |
|---|---|
| Slag / treningsområde | Planen settes per spesifikt slag — f.eks. Driver, 7-jern, 7-jern lav fade, 7-jern høy draw |
| P-posisjon | Under slaget: P1.0–P10.0 i listevisning med dropdown |
| Arbeidsoppgave | Trykk på en P → legg inn oppgave med beskrivelse, video, bilde. Ingen maksgrense per P-posisjon (Anders 20.08 — «maks 15» fra første intervju er opphevet) |

**Prioritering:**

- Drag-and-drop setter oppgavene i prioritert rekkefølge
- Live oppdatert fargekode viser «prioritet denne uken»
- Utviklingsuke: spilleren jobber med flere tekniske oppgaver samtidig.
  Turneringsuke / turneringsforberedelse: maks to — vist gjennom fargekoden som
  veiledning, aldri som sperre (jf. 18.08-beslutningen: ingen treningsregler håndheves)

**Rep-mål og automatisk telling (utvidet 20.08 — målmatrisen er motorikk × belastning):**

| Felt | Regel |
|---|---|
| Rep-mål per motorikk-trinn | Hver arbeidsoppgave har eget antall reps for UTEN_BALL, LAV_HAST og AUTO |
| … fordelt på belastning | Målet fordeles også per kontekst — f.eks. UTEN_BALL: 500 INNENDØRS + 500 BANE |
| Hvorfor kontekst teller | Omgivelsene endrer opplevelsen (ballflukt, lys, til og med skyggen over ballen) — teknikken må trenes i alle kontekster for å holde |
| Automatisk oppdatering | En teknisk oppgave i en økt bærer motorikk + belastning som enhver drill; fullført live-økt teller faktiske reps mot riktig celle i matrisen (f.eks. 300/500 UTEN_BALL INNENDØRS) |
| Formål | Coach ser hvor mye det faktisk er jobbet per oppgave og kontekst uten å åpne hver økt |
| Fordelingen settes manuelt | Coach setter matrisen manuelt per oppgave i v1; standardfordeling kommer sammen med AI-coachen i v2 (Anders 20.08) |

**Når alle rep-mål er nådd (Anders 20.08):**

1. Statusoppdatering sendes automatisk til spillerens **hovedcoach**
2. Coach evaluerer oppgaven — kjernespørsmålet er **relevans**: holdt teknikken gjennom kontekst-trappen?

| Trinn | Kontekst | Ytre påvirkning |
|---|---|---|
| 1 | Matte + nett innendørs | Ingen — null ytre påvirkning |
| 2 | Driving range | Ser ballflukt, uten press |
| 3 | Med noen til stede | OBSERVERT-press |
| 4 | Golfbanen | Fokus flyttes fra teknikk til golfslaget — holder teknikken? |

**Evalueringen er en løpende statusrapport — ikke bestått/ikke bestått (Anders 20.08):**

- Store tekniske oppgaver blir ofte aldri «fullført». Spørsmålet er alltid: **hvilken
  prioritet har oppgaven nå?**
- Teknikk faller tilbake under konkurransespill: én turneringshelg gir litt tilbakefall,
  to–tre på rad gir mer. Tilbakefall er forventet og skal synes i statusen.
- Statusrapporten ser teknikk og **spredning på ballen** sammen: TrackMan-data + testdata +
  banedata (misser man grovt eller ikke).
- Utfall for en oppgave: **videreføres i ny kontekst** eller **erstattes av ny oppgave** —
  arkivering er unntaket, ikke regelen.

**Fargekode for prioritet (valgt av Claude på Anders' delegasjon 20.08 — psykologisk begrunnet):**

| Farge | Status | Hvorfor |
|---|---|---|
| Clay `#D97757` | **Denne uken** — aktiv prioritet | Oransje = handling og energi uten faresignal; clay er allerede Papers eneste signalfarge |
| Blekk (nøytral) | **I køen** — prioritert, ikke aktiv | Nøytral farge krever ikke oppmerksomhet |
| Dempet grå | **Hviler** | Lav synlighet — stjeler ikke fokus |
| Grønn | **Fullført** — alle rep-mål nådd | Grønn = mestring og vekst |

Aldri rød for prioritet — rød betyr feil/fare og skaper stress; rød reserveres for ekte feil.
Fargekoden oppdateres live av blokk-typen: i KONKURRANSE-blokk (turneringsuke) viser maks
to oppgaver clay, resten dempes automatisk til grå — veiledning, aldri sperre. Prinsippet
gjelder alle fargekoder i systemet: farge skal følge menneskelig psykologi (signalfarge =
handling nå, grønn = mestring, rød = kun ekte feil).

**Hvor teknisk plan bor (Anders 20.08):** planlegges i **Workbench**, og vises i den
**komplette spillerprofilen**.

## Bærende UX-prinsipp (Anders 20.08)

Alle detaljparametere — full AK-formel, målmatriser, kontekster — skal kunne kartlegges og
planlegges i Workbench **uten at systemet virker komplisert eller for komplekst for
spilleren.** Detaljene bor hos coachen og i Workbench; spilleren møter alltid et enkelt
bilde: neste økt, neste oppgave, neste steg.

## To moduser: Standard og Tour (Anders 20.08, presisert samme dag)

Ikke to låste versjoner — en **toggle** som skrus av og på live i innstillinger, på lik
linje med lys/mørk modus. Navn (Anders' forslag): **Standard** og **Tour**.

| Modus | Målgruppe | Innhold |
|---|---|---|
| Standard | Medlemsgolferen (f.eks. snittscore 100) — den kommersielle massen ligger her | Baneguide, statistikk og score er det viktige — ikke treningsdetaljer. Teknisk veiledning og ferdigheter foran finjustering av trening. Ekstremt enkelt, av ytterste kvalitet |
| Tour | Toppidrettsutøvere og utøvere som satser | Full dybde — hele plan-, teknikk- og analysesystemet |

- Abonnement: **samme pris for begge** — man velger selv den enklere opplevelsen.
  (Claude enig 20.08: segmentering på modus, ikke pris — ulik pris ville tvunget
  funksjonssperrer inn i Standard og gjort oppgradering til friksjon.)
- **Rekkefølge (Anders 20.08):** komplett Tour-versjon bygges FØRST. Når den står ferdig og
  kan sees, tas avgjørelsen om hva som skal med i Standard og hva som ikke skal — grensen
  trekkes da, ikke nå.

Ambisjonen: high end-programvare Viktor Hovland ville ønsket å bruke — levert enkelt,
effektivt og premium i design og brukeropplevelse for forbrukeren.

## Teknisk statusrapport (Anders 20.08)

**Datakilder:** TrackMan-importen (spredning) · testresultatene · alle slag spilleren
registrerer under runder — både trening og konkurranse.

**Viktig skille — trening vs. konkurranse.** Rapporten viser spredningen i tre kontekster:

| Kontekst | Kilde |
|---|---|
| Spredning på trening | TrackMan/range |
| Spredning på banen under trening | Treningsrunder |
| Spredning i konkurranse | Turneringsrunder |

**Oppdatering:** alltid live — oppdateres etter hver økt og hver turnering. En TrackMan-økt
analyseres umiddelbart ved import og resultatet vises direkte. Auto ukesrapport kan hentes,
men ingenting «sendes ut» som rapport.

## FYS-økter og fysisk treningsprogram (Anders 20.08)

- En FYS-økt er basert på spillerens **fysiske treningsprogram**, som planlegges i et eget vindu
- Programmet er individuelt: antall økter per uke varierer (2–4+), og profilen varierer
  (mer bevegelighet, mer kondisjon, mer styrke)
- **Øvelsesbank:** alle standardøvelser for fysisk trening for toppidrettsutøvere lastes inn
  (knebøy, markløft, benkpress, benpress, roing osv.) — innlastingsplan foreslått 20.08,
  venter Anders' godkjenning
- **Planlegging per øvelse:** antall serier · antall repetisjoner · pause · reps i reserve
  (RIR) · ca. anbefalt vekt for første økt
- **Live FYS-økt logges per serie:** faktiske reps + faktisk vekt. IKKE +5/+10/+25-knappene
  (de er for golfdriller). Spilleren ser selv om vekten var for tung — klarte ikke alle reps
- **v2 (VIKTIG — skal huskes):** når fysiske testresultater (benkpress, markløft, knebøy,
  club speed, 3000 m-test) loggføres i spillerprofilen, skal en automatisk formel foreslå
  fysisk treningsprogram — f.eks. svak i knebøy → fokusområde (beinstyrke er viktig i golf).
  Bygges i v2 sammen med AI-coachen.

## Parameter-relevans per område (Anders 20.08 — under arbeid)

Ikke alle parametere gjelder alle områder.

**Besluttet (Anders 20.08, runde 2):**

- Motorikk-trinnene UTEN_BALL / LAV_HAST / AUTO gjelder **kun fullsving**
  (TEE_TOTAL, INNSPILL_200/150/100/50). **Ingenting på nærspill eller putt har dem.**
- Puttingøvelser kategoriseres med de fire puttingdimensjonene:
  **greenlesing · sikte · ballstart · lengdekontroll**
- Hva som erstatter motorikk-feltet for nærspill/putt i datamodellen: kommer tilbake til

Førsteutkastet til full relevans-matrise ligger i
`docs/gap-evaluering-treningsplanlegging-2026-08-20.md` §1 — må revideres etter
beslutningen over (utkastet antok motorikk på chip/pitch/lob). Egne dimensjoner for bunker
og fullsving er ikke besluttet ennå.

## Onboarding — obligatoriske felter (Anders 20.08)

- **Estimat på treningstid:** ca. hvor mye spilleren trener
- **Fasiliteter — må fylles ut riktig, med fysiske mål og begrensninger per fasilitet.**
  Eksempler: fasilitet A har driving range på kun 200 m → planlegg aldri driver der;
  lengste putt er 15 m → aldri putteøvelser på 20 m. Fasiliteten styrer hvilke øvelser som
  foreslås — et praktisk mulighets-filter, ikke en treningsregel.
- **Hvem legger inn (Anders 20.08):** hver spiller legger inn sin golfklubbs fasiliteter
  manuelt; Anders legger inn fasilitetene der gruppetreningene foregår — på gruppen.

## AgencyOS-skillet: selvstendige kunder vs. tilknyttede spillere (Anders 20.08)

| Type | Innsyn for coach |
|---|---|
| Vanlig subscriber (betaler månedlig, bruker systemet selv) | NULL innsyn — coach kan aldri se eller endre noe |
| Spiller i en gruppe | Synlig for coachene i AgencyOS |

- Grensen er **gruppemedlemskap**: coach ser kun spillere som ligger i en gruppe
- Før lansering gjør Anders ferdig alle gruppene — tilknyttede spillere er allerede
  godkjent i gruppe ved lansering
- Grupper er ikke låst: enkelt å opprette, endre og slette
- Skillet gjelder også AI-funksjonen når den kommer i v2
- **Vei inn i gruppe (Anders 20.08):** to-sidig invitasjon — coach inviterer, spilleren
  godtar i PlayerHQ; for mindreårige godkjenner foresatt i forelder-portalen
- **Hovedcoach (Anders 20.08):** velges i AgencyOS. På hver gruppe registreres hvilke
  trenere som har ansvar for gruppen og hvem som har hovedansvaret. Skal inn i både kode
  og design
- **Foreldre-innsyn (Anders 20.08):** foreldre til mindreårige har tilgang til
  treningsplan, oppmøte og rapport fra trener

## Gruppeplan vs. individuell plan (Anders 20.08)

- En spiller kan være i flere grupper samtidig — f.eks. WANG Toppidrett, GFGK Junior Elite
  og AK Golf Academy
- Planlegges det i en gruppe (økter, øvelser, tester), synkroniseres det **automatisk** inn
  i spillerens egen treningsplan — på tvers av alle grupper
- Kalenderen viser tydelig hva som er individuell plan og hva som er gruppeplan — og
  **hvilken gruppe** en gruppeøkt kommer fra, aldri bare «gruppeplan»

**Besluttet (Anders 20.08, runde 2):**

- Løsrivelses-regelen bekreftet: planendring (driller, reps, tid, flytting) løsriver
  spillerens kopi permanent; oppmøte, logging og vurdering løsriver aldri
- Innmelding i gruppe: **kun fremtidige økter** synkes inn — aldri bakover

## Den komplette spillerprofilen (Anders 20.08)

Videreutvikles som samlingspunktet — gjelder både for spilleren selv og for coach: komplett
oversikt ett sted (teknisk plan med statusrapport, testhistorikk, mål, medier, grupper).

## Fase 0 — forslag til lukking (20.08, venter Anders' svar)

Punktene under er de tre gjenstående åpne punktene fra fase 0.2 i
`docs/plan-treningsplanlegging-til-kode-2026-08-20.md`. Hvert har et Claude-forslag —
bekreft eller korriger, samme mønster som resten av intervjuet.

**1. Hva erstatter motorikk-feltet for nærspill/putt i datamodellen?**
*Forslag (utdypet i `docs/relevans-matrise-treningsplanlegging-2026-08-20-v2.md`):*
Ingenting strukturelt erstatter det — feltet er `null`/skjult for alle områder utenom de
fem fullsving-områdene, og områdets egne teknikk-dimensjoner (typet enum,
`OmradeDimensjon`) bærer analysen i stedet. Unntak: BUNKER får et eget to-verdis
`sandtrinn`-felt (`UTEN_BALL_I_SAND` → `MED_BALL`), separat fra den generelle
motorikk-enumen. Formel-strengen hopper over motorikk-segmentet for områder uten det
(`TEK_CHIP_TRENINGSOMRADE_ALENE`, ikke `TEK_CHIP_null_...`).

**2. Innsyn bakover når spilleren forlater en gruppe** (gap-evalueringens spørsmål 7)**?**
*Forslag (uendret fra gap-evalueringens default):* Ja — grensen er gruppemedlemskap,
konsekvent begge veier. Coachen mister innsyn i spillerens personlige logg fra
medlemsperioden når spilleren forlater gruppen, også bakover i tid. Gruppens egne
artefakter (gruppeplaner, oppmøtelister) forblir i gruppen — det er kun spillerens
personlige logg (reps, tid, vurderinger, medier) som forsvinner fra coachens innsyn.
Enklest å forklare og tryggest GDPR-messig; matcher løsrivelses- og gruppesynk-reglene i
del 4 av gap-evalueringen.

**3. FYS-programmet i v1: manuelt, ingen auto-forslag?**
*Forslag:* Ja, bekreftet. Coach/spiller setter opp FysiskPlan → FysUke → FysOkt →
FysOvelseRad manuelt, med øvelser fra øvelsesbanken (fase 0.3). Automatisk
programforslag fra fysiske testresultater er eksplisitt v2 (spec-ens §FYS-økter,
punkt «v2 — VIKTIG»). Ingen endring i denne bekreftelsen — kun eksplisitt «ja».

## Rettelser 20.08, runde 2 (Anders — bekreftet, ikke lenger forslag)

- **Putting er seks bånd, ikke fem:** 0–3 · 3–5 · 5–10 · 10–25 · 25–40 · 40+ fot
  (10–40-båndet delt i to). Rettet i `docs/FASIT-AK-GOLF-HQ.md`.
- **FYS er tre områder, ikke to:** Styrke · Kondisjon · Bevegelighet (kondisjon lagt til,
  mobilitet omdøpt bevegelighet — matcher profilbeskrivelsen over ordrett).
- **Områdelisten er nå 19 områder, ikke 17** — «17-listen» er et historisk navn, ikke et
  krav om å holde tallet.
- **En drill kan bære KUN ÉN egen teknikk-dimensjon**, ikke flere samtidig.
- **Dimensjonene er en egen, sjette analyseakse** — bekreftet.
- **BANE er ikke bundet til pyramide SPILL.** En BANE-drill kan stå under TEK, SLAG
  (golfslag), SPILL eller TURN (turnering) — pyramide og område er alltid uavhengige akser.

Fullt utdypet i `docs/relevans-matrise-treningsplanlegging-2026-08-20-v2.md`.

## Rettelse 20.08, runde 3 (Anders) — KONDISJON er segment- og sonestrukturert

Svar på det åpne punktet fra runde 2 («loggeenhet for KONDISJON»). Ikke minutter/distanse
som ett tall — en kondisjonsøkt bygges av segmenter, hver med egen timer og sone:
**Timer → Oppvarming → Drag (arbeidsintervall) → Hvile → Sone (1–5, Olympiatoppens
skala).** Full struktur i `docs/relevans-matrise-treningsplanlegging-2026-08-20-v2.md`
§KONDISJON. Sone settes manuelt av spiller i v1 — automatisk fra pulsklokke er en senere
utvidelse, ingen enhet er koblet nå.

## Ikke avklart ennå (intervjuet fortsetter)

- Egne dimensjoner for bunker og fullsving — utkast i
  `docs/relevans-matrise-treningsplanlegging-2026-08-20-v2.md` (fase 0.1), venter Anders'
  korrigering
- Varslinger og signal-lag — utsatt (Anders 20.08: ses på senere)
- FYS-øvelsesbanken: innlastingsplanen i `docs/fys-ovelsesbank-2026-08-20.md` (fase 0.3)
  venter Anders' godkjenning, inkl. om Power/plyometri og Stabilitet/balanse hører under
  STYRKE eller bør bli egne underkategorier
- Relevans-matrisens gjenstående (?)-celler i v2-matrisen (fase 0.1) korrigeres av Anders
- De tre punktene i «Fase 0 — forslag til lukking» over venter fortsatt Anders' svar

---

## Kontrakt for bygging (DRAFT — fase 0.4, venter «spec komplett»)

**Ikke gjeldende ennå.** Denne seksjonen er et utkast til kontrakten Fase 1–3 i
`docs/plan-treningsplanlegging-til-kode-2026-08-20.md` skal bygge mot. Hentet rett fra
fasering og risikovurdering i `docs/analyse-treningsplanlegger-2026-08-20.md` §3/§5.
Spec-en markeres KOMPLETT først når Anders sier det eksplisitt (fase 0.4) — når det skjer,
fjernes «DRAFT» og «UNDER INTERVJU»-status-linjen øverst oppdateres.

### Hva v1 ER

v1 er **sammenkobling og opprydding, ikke nybygg** — 80 prosent av grunnmuren finnes
allerede i koden (V2-øktfamilien, teknisk plan med auto-telling, årsplan-tidslinje,
målmodell). Suksesskriteriet: coach og en 16-åring bruker det daglig i én hel
treningsblokk uten å falle tilbake på Notion/regneark.

**Må med fra dag én:**

1. V2-øktmodellen (`TrainingSessionV2` → `TrainingDrillV2` → `DrillLogV2`) gjøres
   kanonisk. Dobbeltskriving til de tre andre øktfamiliene fjernes. v2-vokabular og typet
   19-område i skjema (områdelisten, se rettelsene 20.08 runde 2). Nytt belastnings-felt.
2. Tre plannivåer i lagringen: årsplan, periode, økt. Uke og dag er **beregnede
   visninger** av øktdatoen (uke-helpers, Oslo-korrekt) — ikke egne rader.
3. Kalender: uke (mobil-standard) + måned (desktop) + eksisterende årsplan-tidslinje med
   test-/samlingsmarkører.
4. Øktmal + «kopier forrige uke/blokk» som én handling.
5. Live-økt-kjernen: start, automatiske timere, +5/+10/+25 med angre, hopp over, spontan
   drill (to-trykks minimum: pyramide + område, resten arves fra kontekst), oppsummerings-
   kort, hoppbar FOKUS/GJENNOMFØRING/MESTRING-vurdering — og **offline for hele
   live-flyten** (lokal-først, siste lokale logg vinner ved synk).
6. Teknisk plan med 1–3 aktive oppgaver løftet frem per slag/P-posisjon, eksisterende
   auto-telling videreført, målmatrise-baren (f.eks. 300/1000 UTEN_BALL) synlig live i
   drill-kortet.
7. To analysekort: Treningsmiksen (pyramide × område, plan vs. faktisk) og
   P-progresjonen (målmatrise-barene, live-oppdatert).
8. TrackMan-nøkkelen (session-/slag-id) lagret stille per innslag fra dag én — kan aldri
   retro-merkes.
9. «Sett av coach»-kvitteringen tilbake til spilleren — én boolean som lukker
   motivasjonsloopen.
10. De åtte «KRITISK»-radene fra gap-evalueringens AI-kartlegging (§2): TrackMan-nøkkel,
    full v2-formel typet (planlagt + faktisk), fasilitets-dimensjoner, trening/konkurranse-
    flagg på runder, HOPPET_OVER + spontan-merking, målmatrisene strukturert, fysiske
    tester typet, tidsstempler overalt.

### Hva som venter (v1.1 / v1.5 / v2 — IKKE i v1)

| Når | Hva |
|---|---|
| v1.1 | Talenotat med transkripsjon, ukemal, hurtigsvar fra stall-innboksen |
| v1.5 | Treningsblokk (etter at UTVIKLING/FORBEREDELSER/KONKURRANSE er lagt i
  `FASIT-AK-GOLF-HQ.md`), periodemal med skall-økter og fyll-senere-kø, oppgavebank for
  teknisk plan, gruppe-utvidelse med løsrivelsesregelen |
| v2 | AI/Caddie (all plan-generering, justering, drill-forslag — kun forslag, aldri
  auto-apply), resten av analysekortene (pressetrapp, test-mot-trening, blokkrapport,
  øktkvalitet-trend), 3-dagersvisning og øvrige tidslinjer, automatisk FYS-programforslag |

**Kuttes helt (ikke bygget i noen v1.x uten ny beslutning):** 3-dagersvisning på mobil
(uke dekker behovet), obligatorisk sted/fasilitet (valgfritt med default fra forrige
økt), felt-diff i godkjenningskøen.

### Bindende prinsipper for hele bygget (gjelder alle faser)

- **Ingen treningsregler håndheves** (18.08-beslutningen, uendret) — all avviksvisning er
  beskrivende («planlagt 4, gjennomført 2»), aldri rødt/grønt utover ekte feil, ingen
  automatiske forslag uten ny, eksplisitt beslutning fra Anders.
- **Formelen arves alltid som defaults** — spilleren skal aldri se ordet «belastning»;
  maks tre trykk per drill i live-flyt (jf. registreringsbyrde-risikoen).
- **Loggene er alltid fasit** — telleren (målmatrise, treningsmiks) er en avledet cache
  som rekalkuleres ved enhver redigering, aldri en selvstendig sannhet.
- **Gruppesynk-regelen er bevisst dum:** løsrivelse ved første planendring, aldri delvis
  fletting eller konfliktdialog.
- **Skjermbilde-gaten gjelder uendret** for alle skjermer i fase 3 — ingen merge uten at
  Anders har SETT skjermen (390px, lys/mørk, fasit ved siden).

### Fortsatt uavklart før KOMPLETT

De ti spørsmålene i `docs/analyse-treningsplanlegger-2026-08-20.md` §7 (ukemerker,
M0–M5-mapping, blandet økt, fargekode, feiringskort, rep-mål-planlegging, P-oppgave-tak,
vurdering hoppbar, godkjenning som status, FYS samme øktmodell) — alle har foreslåtte
defaults i kilden, ingen er eksplisitt bekreftet av Anders ennå. Pluss de tre punktene og
relevans-matrisen over. Spec-en kan ikke markeres KOMPLETT før disse er avklart.
