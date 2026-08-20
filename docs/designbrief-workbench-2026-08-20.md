# Designbrief — treningsplanlegging i Workbench (fase 2.1)

Klar til å limes inn i Claude Design-prosjektet **«AK Golf HQ — Claude Paper»**
(`605a48cc`). Utfører punkt 2.1 i
`docs/plan-treningsplanlegging-til-kode-2026-08-20.md`.

Datamodellen bak alt dette er bygget og ligger i PR #563 — se
`docs/fase1-grunnmur-treningsplanlegging-2026-08-20.md`. Designet skal tegne det
modellen allerede kan bære.

---

## Prompten

Du designer treningsplanleggingen i AK Golf HQ — verktøyet en toppidrettsutøver
og coachen hens planlegger, gjennomfører og analyserer all trening i. Ambisjonen
er programvare Viktor Hovland ville valgt: full dybde under panseret, men et
enkelt og rolig bilde på skjermen.

Følg Paper-språket i dette prosjektet: papir og blekk, Poppins/Lora/IBM Plex
Mono, alle tall i mono med komma-desimal, norsk bokmål, aldri emoji. Maks én
clay-CTA (#D97757) per skjerm. Hver skjerm tegnes i m390 og d1280, i lys og mørk.

### Det bærende prinsippet

Systemet er detaljert, men spilleren skal aldri møte detaljene. Coachen og
Workbench bærer full merking; spilleren møter neste økt, neste oppgave, neste
steg. Ordet «belastning» skal spilleren aldri se. Færre felter er alltid riktig
svar — feltene som ikke gjelder, finnes ikke på skjermen.

**Ingenting i systemet er en regel.** Ingen sperrer, ingen advarsler om at noe er
«for mye» eller «feil». Systemet beskriver — «planlagt 4, gjennomført 2» — og
spilleren bestemmer. Rød farge finnes kun ved ekte feil, aldri ved avvik fra plan.

### Vokabularet du designer for

Hver enkelt drill, øvelse og test — ikke økta — bærer merkingen:

- **Pyramide:** FYS · TEK · SLAG · SPILL · TURN
- **Område:** 19 stykker. Fem fullsving (utslag, innspill ~200/150/100/50 m),
  fire nærspill (chip, pitch, lob, bunker), seks puttebånd (0–3 · 3–5 · 5–10 ·
  10–25 · 25–40 · 40+ fot), tre fysiske (styrke, kondisjon, bevegelighet), og
  banespill. Putt i fot, resten i meter.
- **Motorikk:** uten ball · lav hastighet · automatikk. **Kun på fullsving.**
  Aldri på nærspill, bunker, putt, fys eller bane — feltet skal ikke vises der.
- **Belastning:** innendørs · treningsområde · bane · konkurranse
- **Press:** alene · observert · konkurranse · turnering
- **Én teknikk-dimensjon** per drill, og bare én: putt velger mellom greenlesing,
  sikte, ballstart og lengdekontroll; chip mellom landingspunkt, utrulling,
  treffpunkt og køllevalg; fullsving mellom sikte, startretning, kurve og
  treffpunkt. Bunker har i tillegg en egen sandtrapp (uten ball i sanden → med ball).

Pyramide og område er uavhengige: en bane-drill kan like gjerne være teknisk som
strategisk.

### De åtte skjermene

**1 · Workbench-kalenderen.** Uke er standard på mobil, måned på desktop, og en
årstidslinje viser perioder, treningsblokker (fritt datospenn, merket utvikling ·
forberedelser · konkurranse), turneringer og tester. Egen farge per pyramide, så
fordelingen i uka synes på ett blikk. En økt som ikke er ferdig planlagt vises som
skall med bare en pyramide-merkelapp — «FYS-økt» — til den fylles. Gruppeøkter
merkes med hvilken gruppe de kommer fra, aldri bare «gruppeplan».

**2 · Periodemal-flyten.** Grovplanlegging: coachen sier hvor mange økter per
pyramide en periode skal ha, og får skall-økter i kalenderen. Innhold fylles inn
senere fra teknisk plan og målsetninger. Vis køen av det som ennå ikke er fylt.

**3 · Økt-editoren.** Her legges driller, øvelser, tester og oppgaver fra teknisk
plan inn i økta. Feltene styres av området: en putt-drill viser aldri motorikk,
en fys-drill viser aldri press. Merkingen skal helst arves fra mal eller
øvelsesbank — å taste fem akser på åtte driller er 40 valg, og det dreper bruken.
En kondisjonsøvelse bygges av segmenter: oppvarming, drag, hvile, nedjogg, hver
med varighet og sone 1–5.

**4 · Teknisk utviklingsplan.** Struktur: slag → P-posisjon → arbeidsoppgave.
Slaget er spesifikt («7-jern lav fade»), P-posisjonene er P1.0–P10.0 i liste, og
oppgavene ligger under sin P med beskrivelse, bilde og video. Drag-and-drop setter
prioritet. Fargekoden: clay = denne uken, blekk = i køen, dempet grå = hviler,
grønn = alle rep-mål nådd. Aldri rød. I turneringsuke vises maks to i clay, resten
dempes — som veiledning, ikke sperre.

Hver oppgave har en målmatrise: rep-mål per motorikk-trinn fordelt på kontekst,
f.eks. 500 uten ball innendørs og 500 uten ball på bane. Tellingen oppdateres
automatisk fra gjennomførte økter — vis 300/500 per celle. Og en løpende
statusrapport, ikke bestått/ikke bestått: store tekniske oppgaver blir sjelden
«ferdige», og teknikk faller tilbake etter turneringshelger. Rapporten viser
spredningen i tre kontekster ved siden av hverandre: på trening (TrackMan), på
banen under trening, og i konkurranse.

**5 · Live-økta.** Spilleren trykker på økta, trykker «Start økten», og ser første
drill med alt som er planlagt. Timeren starter automatisk. Reps med +5 · +10 · +25.
Fullført drill stopper timeren og starter en pausetimer som løper til neste. Under
veis: hopp over, bytt rekkefølge, legg til en spontan drill, ta bilde eller video,
skriv eller snakk inn et notat. Fys logges per serie med faktiske reps og vekt —
aldri med +5/+10/+25. Kondisjon logges per segment.

Til slutt et oppsummeringskort: plan mot gjennomført per drill, total varighet,
total pausetid — og tre stjernerader innen tommelens rekkevidde: fokus,
gjennomføring, mestring. De kan hoppes over, og tomt skal se ut som tomt.

Skjermen må virke uten dekning. Ranger og haller har elendig nett, og dette er
punktet der all data fanges.

**6 · Gruppeplanlegging i AgencyOS.** Coachen planlegger for gruppen, og øktene
havner automatisk i hver spillers egen kalender. Redigerer spilleren innholdet,
blir økta hens egen — si det med én setning: «Denne økta blir nå din egen —
endringer fra WANG Toppidrett når den ikke lenger.» Ordene «synk», «kopi» og
«løsrevet» skal aldri stå på skjermen. Vis hvem som er hovedcoach for gruppen.

**7 · Den komplette spillerprofilen.** Samlingspunktet, likt for spiller og coach:
teknisk plan med statusrapport, testhistorikk, mål, bilder og video, gruppene —
og «hvem ser deg», med navngitte trenere og en utmeldingsknapp. En spiller uten
grupper skal se at ingen har innsyn i dataene hens.

**8 · Standard/Tour og onboarding.** En bryter i innstillinger, som lys/mørk:
Standard for medlemsgolferen (bane, statistikk, score — ikke treningsdetaljer),
Tour for den som satser (full dybde). Tegn Tour først og komplett. I onboarding:
et estimat på treningstid, og fasilitetene med fysiske mål — rangelengde i meter,
lengste putt, hva stedet har, hvilken radar. Det er et mulighetsfilter, ikke en
regel: en range på 200 meter betyr bare at driver ikke foreslås der.

### Tilstander

Hver skjerm i fire: normal, tom, laster, feil. Den tomme er den viktigste — den
skal ha nøyaktig én vei videre.
