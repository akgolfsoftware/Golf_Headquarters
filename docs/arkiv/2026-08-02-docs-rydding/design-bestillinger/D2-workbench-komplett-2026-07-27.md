# D2 — Open Design-bestilling: Komplett Workbench + Årsaksdiagnose

> Skrevet 2026-07-27 etter Anders' gjennomgang av AK-formelen. Lim hele blokken under
> «PROMPT START» → «PROMPT SLUTT» inn i Open Design.
> Godkjenningsdokument for vokabularet: https://claude.ai/code/artifact/c4bfaf14-7884-40eb-9cab-9dc08c81f740

---

## PROMPT START

Du designer den komplette treningsplanleggeren for **AK Golf HQ** — ett produkt med to flater:
**PlayerHQ** (spilleren) og **AgencyOS** (coachen). Begge bruker samme arbeidsbenk, «Workbench»,
med ulik rolle. All tekst er norsk bokmål. Ikoner er Lucide — aldri emoji.

Dette er ikke en vanlig treningsapp. Fundamentet er **AK-formelen**: hver eneste øvelse får en
komplett adresse på seks akser. Oppdraget ditt er å designe flatene som gjør denne presisjonen
enkel å bruke — og å designe det manglende laget: **årsaksdiagnosen** som forteller *hvorfor*
en spiller taper slag, ikke bare *hvor*.

---

### DEL 1 — VOKABULAR (fasit, må brukes ordrett)

**AK-formelens seks akser:**

1. **Pyramide** — hva slags trening: FYS · Teknikk · Slag · Spill · Turnering
2. **Læringstrinn** — hvor innlært bevegelsen er. Fem trinn:
   Kropp → Uten kølle → Uten ball → Ball med lav hastighet → Auto
3. **CS (Club Speed)** — fart i % av spillerens maks: CS50 · CS60 · CS70 · CS80 · CS90 · CS100 ·
   **CS110 = Speedtrening** (overspeed — trene på å utvikle fart over dagens maks)
4. **Arena** — hvor virkelighetsnært, seks trinn:
   M0 kontrollert uten ball · M1 kontrollert med mål · M2 range med mål og avstander ·
   M3 baneøving uten konkurranse · M4 bane med scoringsfokus · M5 turneringsforhold
5. **Belastning** — hvor mye konsekvens slaget har, fire nivåer:
   Fri (feil er gratis) · Krav (mål, du scorer) · Utfordring (én sjanse, konsekvens) ·
   Konkurranse (mot andre, poeng teller)
6. **P-posisjoner** — svingposisjoner:
   P1.0 Adresse · P2.0 Kølla parallell i baksvingen · P3.0 Venstre arm parallell i baksvingen ·
   P4.0 Toppen av baksvingen · P5.0 Venstre arm parallell i nedsvingen ·
   P6.0 Kølla parallell i nedsvingen · P7.0 Treff · P8.0 Kølla parallell i gjennomsvingen ·
   P9.0 Høyre arm parallell med bakken i gjennomsvingen · P10.0 Finish

**Fire SG-kategorier (fasit fra Anders 27. juli): Tee Total · Innspill · Nærspill · Putting.**
Spill (simulert runde) er IKKE en SG-kategori — det er en egen praksisform som produserer
resultater i alle fire kategoriene samtidig, og har derfor egen rad under for akse-reglene.

**Kritisk regel — aksene gjelder ulikt per SG-kategori (avledet av treningsområdet). Skjul
alltid det som ikke er relevant:**

| SG-kategori | P-posisjoner | CS | Læringstrinn | Arena | Belastning |
|---|---|---|---|---|---|
| Tee Total | Alle P1–P10 | Ja | Ja | Ja | Ja |
| Innspill (50–200 m) | Alle P1–P10 | Ja | Ja | Ja | Ja |
| Nærspill (chip, pitch, lob, bunker, innspill 0–50 m) | Kun P1–P4 | **Nei** | Ja | Ja | Ja |
| Putting (alle avstander) | **Nei** | **Nei** | Ja | Ja | Ja |
| *(ikke SG-kategori)* Spill (simulert runde) | **Nei** | **Nei** | Nei (alltid Auto) | Ja | Ja |

En putting-drill skal aldri vise svingposisjoner eller fart. Dette er selve nøkkelen til at et
presist system føles enkelt.

**Andre faste begreper:**
- **Treningsbelastning** = fysisk slitasje (ikke det samme som Belastning-aksen, som er press)
- **Varighet skrives alltid i timer og minutter:** «1 time og 45 minutter», kortform «1 t 45 min».
  Aldri «105 min».
- **Perioder:** Grunn · Spesialisering · Turnering · Evaluering · Ferie
- **Turneringsformål** (hver turnering merkes med ett): **Trening** (teste tekniske endringer i
  konkurranse) · **Utvikling** (teste strategi, utstyr, rutiner, kosthold) · **Prestasjon**
  (kun prestasjon, ingen eksperimenter)

**Kvalitetssløyfen — tre spørsmål per øvelse, skal ta under 10 sekunder totalt:**
- **Traff du kravet?** Resultat mot et konkret mål («7 av 10 innenfor 3 meter»)
- **Fokus:** 1–5 stjerner
- **Hvor tungt:** 1–10

**Stige-regelen:** Over 80 % treff → ett hakk opp på ÉN akse. 50–80 % → bli der. Under 50 % →
ett hakk ned. Systemet foreslår, coachen godkjenner.

---

### DEL 2 — DET VIKTIGSTE DU SKAL LØSE: ÅRSAKSDIAGNOSEN

Strokes Gained forteller **hvor** en spiller taper slag. Det forteller aldri **hvorfor**. Uten
hvorfor er all treningsplanlegging gjetting. Dette er hullet du skal designe.

Eksemplet som må løses: **«Du taper 1,4 slag på putting.»** Er det greenlesning? Sikte? Ballstart?
Slaget? Lengdekontroll? Eller nerver? Fem helt forskjellige svar — fem helt forskjellige treninger.
Samme problem på driver: er det **teknisk** (svingen), **taktisk** (slår driver på hull der han
ikke skal), eller **mentalt** (klarer ikke slappe av på første tee)?

**Modellen du skal designe rundt — fem årsakskategorier, hver med sin egen kur:**

| Årsak | Hva det betyr | Hva som faktisk hjelper |
|---|---|---|
| **Teknikk** | Bevegelsen produserer feil resultat | Øvelse med AK-formel-adresse (læringstrinn + CS + P-posisjon) |
| **Taktikk** | Bevegelsen er god nok, valgene er feil | Baneplan og køllevalg — ingen svingendring |
| **Mentalt** | Ferdigheten finnes, men forsvinner under press | Rutine- og pressttrening: høy Arena, høy Belastning |
| **Fysisk** | Kroppen setter taket | FYS-trening, mobilitet, fart |
| **Utstyr** | Utstyret motarbeider spilleren | Tilpasning — ikke trening i det hele tatt |

**Diagnose-trakten (design dette som en visuell, forståelig reise i tre steg):**

1. **Hvor** — SG peker på området (f.eks. putting −1,4)
2. **Hva** — området brytes ned i underferdigheter med hver sin måling fra ekte rundedata.
   For putting: **Lengdekontroll** (3-putt-andel og restavstand fra over 10 m) ·
   **Greenlesning** (bommer konsekvent på lavsiden av fallet) · **Sikte** (bommer alltid samme
   side uavhengig av fall) · **Ballstart og slag** (spredning i startlinje) ·
   **Under press** (forskjell mellom trening og turnering på samme avstand)
   For tee: **spredningsmønster** (systematisk skjevhet = teknikk) · **spredning målt mot hullets
   bredde** (spredningen er grei, men brukt på feil hull = taktikk) · **turnering mot trening**
   (samme sving, dårligere resultat = mentalt) · **fart mot potensial** (fysisk/utstyr)
3. **Bekreft** — rundedata kan sjelden peke ut ÉN årsak alene. Den snevrer inn til to–tre
   kandidater, og så **bekrefter en kort test** hvilken det er. Design denne overleveringen
   eksplisitt: «Sannsynlig årsak: sikte eller greenlesning. Ta 10-minutters-testen for å vite
   sikkert.» Test → svar → øvelse.

**Ærlighetsprinsipp (ufravikelig):** Vis alltid hvor sikker diagnosen er, og hva den bygger på.
«3 av 4 tegn peker mot lengdekontroll — basert på 6 runder.» Aldri en påstand uten grunnlag.
Mangler data: si det, og si hva som må logges for å svare.

**Sluttpunktet:** Hver bekreftet årsak skal føre til **én knapp**: «Legg i planen». Diagnosen
leverer ferdig AK-formel-adresse til øvelsen. Dette er hele poenget — data blir til trening uten
at coachen må oversette manuelt.

**Data som allerede finnes å bygge på:** hvert slag lagrer kølle, lie, avstand, GPS-punkter,
**siktelinje** (så spredning kan måles mot intensjon, ikke bare mot fairwaymidten) og en
**mental score 1–5 per slag**. Det finnes også en feilkatalog som kobler tekniske feil til
P-posisjoner og øvelser.

---

### DEL 3 — PLANLEGGINGEN: ÅRSPLAN TIL ØKT

Workbench er **én arbeidsbenk, ikke faner**. Bibliotek (venstre), plan (midten) og detalj (høyre)
er synlige samtidig. Zoom er hovednavigasjonen: **Årsplan → År → Måned → Uke → Dag**.

**Effektivitetskravet — hvert nivå skal svare på nøyaktig ett spørsmål:**

| Nivå | Spørsmålet | Det viktigste på skjermen |
|---|---|---|
| Årsplan | Når skal jeg toppe? | Turneringer merket Trening/Utvikling/Prestasjon + periodene |
| År | Hvordan fordeler året seg? | Perioder, samlinger, ferie, testuker |
| Måned | Hva er temaet nå? | Fokusområder fra diagnosen + månedens belastning |
| Uke | Hvor mye og hvilken miks? | Ukens timer, pyramide-fordeling, hviledager |
| Dag/økt | Hva gjør jeg akkurat nå? | Øvelsene med AK-formel-adresse og krav |

To retninger må være synlige i designet: **rammer flyter nedover** (året setter periodene som
setter ukens grenser), og **bevis flyter oppover** (øktens kvalitet → ukens etterlevelse →
månedens SG-bevegelse → årets form).

**Mål for effektivitet, design mot disse:**
- Fra diagnose til ferdig øvelse i planen: **maks tre klikk**
- Legge en hel uke: under to minutter for coachen
- Spilleren skal forstå dagens økt på under fem sekunder

**SG som vektlegger — spilleren og coachen velger hvordan data styrer planen.** Design dette som
et tydelig valg med konsekvensen synlig med en gang («slik ser uka di ut med dette valget»):
- **Ren SG** — størst tap får mest tid
- **Potensial** — der forbedring kommer raskest, ikke der tapet er størst
- **Turneringsdrevet** — det de neste turneringene faktisk krever
- **Coachens skjønn** — Anders overstyrer, med begrunnelse som blir stående

Vis alltid **hvor mye av planen som er datadrevet** kontra satt manuelt. En plan skal kunne
forsvares.

---

### DEL 4 — SKJERMENE DU SKAL LEVERE (komplett innholds- og komponentliste)

**A. Årsplan-byggeren** (spilleren bygger sitt eget år; coachen samme flate for sine spillere)

Innhold og komponenter:
- **Årsbånd** — hele sesongen som én horisontal tidslinje der perioder tegnes ved å dra
- **Periode-palett:** Grunnperiode · Spesialiseringsperiode · Turneringsperiode · Evaluering ·
  Testperiode · Ferie (+ samling). Hver med egen farge, konsistent i alle visninger
- **Turneringslag** over båndet: turneringene ligger som ankere med formål-badge
  (Trening/Utvikling/Prestasjon) — årsplanen bygges baklengs fra Prestasjon-turneringene
- **«Bygg baklengs»-hjelperen:** velg viktigste turnering → systemet foreslår periodene bakover;
  spilleren justerer ved å dra i kantene
- **Volum per periode:** timer per uke med gyldig-område fra periodens regler (Grunn 420–720
  min/uke osv.) — ulovlige verdier kan ikke velges, de forklares
- **Pyramide-fordeling per periode** som stablede bånd (FYS/Teknikk/Slag/Spill/Turnering)
- **Valideringsstripe:** konflikter i klarspråk («Testperiode ligger inne i Ferie», «12 uker uten
  hviledag») — varsler, aldri sperrer
- **KPI-topp:** uker per periodetype · totale treningstimer · turneringer per formål
- Tilstander: tomt år (én tydelig vei: «Start med viktigste turnering»), utkast, publisert

**B. Periode-detalj** (alt innhold i én periode, åpnes fra årsplanen)

- **Header:** periodetype, datoer, antall uker — og periodens MÅL i én setning
  («Hva skal være sant når perioden er over»)
- **Regel-panel:** CS-tak · volum min/maks · tillatte læringstrinn · pyramide-min/maks ·
  praksis-miks (Blokk/Random/Konkurranse/Spill-test) · minimum hviledager
- **Fokusområder** hentet fra årsaksdiagnosen — hvorfor denne perioden trener det den trener
- **Ukeliste** med mikrosyklus-mønster: gjenbrukbare ukemaler («standard grunnuke») som legges
  på flere uker i ett grep
- **Tester:** inngangstest og utgangstest med dato — beviser at perioden virket
- **Teknisk plan-kobling:** hvilke P-posisjoner og oppgaver som er aktive i perioden
- **Belastningskurve:** planlagt kontra faktisk Treningsbelastning uke for uke
- **Periodebrev:** coachens korte tekst til spilleren om hva perioden handler om

**C. Treningsplan-kalenderen** — hjertet av Workbench. **Kopier Notion Calendar-konseptet:**
ett datasett, flere visninger, alt redigerbart direkte i kalenderen.

- **Visningsvelger:** År · Måned · Uke · Dag · **Tidslinje** (perioder og økter som
  horisontale bånd) · **Liste** (agenda). Samme data overalt, ett tastetrykk mellom dem
- **Venstre stripe (à la Notion Calendar):** minikalender + **kalenderkilder** med av/på:
  Treningsplan · Turneringer · Booking/coach-timer · Skole · Venne-økter
- **Kalenderflaten:** dra-for-å-lage, dra for å flytte, dra i kanten for varighet,
  fargekode per pyramide-område, nå-linje, vær-hint på utendørsøkter
- **Høyre inspektør** for valgt økt — se punktet om hurtigknapper under
- **Kommandofelt (cmd+K):** «putting torsdag 17» oppretter økten
- **Gjentakende økter:** «hver mandag og onsdag 17–19», med unntak og sluttdato —
  redigér én forekomst eller hele serien
- **Lokasjoner:** range · bane · studio · simulator · gym · hjemme — ikon og farge per sted,
  sted-velger med sist brukte øverst
- **Tren sammen:** inviter venn eller treningspartner til økten; status venter/godtatt;
  økten vises i begges kalender; coach ser hvem som trener sammen
- **Driller i økten:** dra fra bibliotek eller Favoritter rett inn i økten i inspektøren

**Hurtigknapper — bærende interaksjonsprinsipp i inspektøren og sidemenyen:**
Hver formel-akse er ÉN knapp som viser gjeldende verdi. **Trykk = neste verdi** (Teknikk → Slag
→ Spill …), hold eller høyreklikk = velg fra liste. Ingen skjemaer, ingen nedtrekksmenyer i
hverdagsflyten. **Progressive disclosure:** kun aksene som gjelder SG-kategorien vises
(matrisen i Del 1) — resten finnes bak «Mer». Målet: endre en økt fra Teknikk til Slag
på ett trykk, uten å åpne noe.

**D. Teknisk plan** (individuell per spiller — dette finnes allerede i datamodellen, design
skal løfte den)

- **P-posisjonsrader P1.0–P10.0** med de nye navnene («Venstre arm parallell i baksvingen» …)
  — hver rad viser antall aktive oppgaver og fremdrift
- **Oppgavekort:** tittel · beskrivelse · bilde/video · formel-adresse (pyramide, område,
  køller, læringstrinn, CS, Arena, Belastning) · rep-mål i tre farter (tørr/lav/full) med
  fremdriftsring
- **Oppgave-kategori:** Teknisk · Taktisk · Mentalt · Sosialt (finnes i datamodellen — vis den)
- **TrackMan-mål per oppgave** med protokoll: rullerende vindu / streak / økt-port — vis målet
  og siste målinger, grønn når protokollen er bestått
- **To-veis forslag:** spilleren kan foreslå en oppgave → coachen godkjenner; coachen kan
  legge oppgaver rett inn. Tydelig merket hvem som la inn hva
- **Diagnose-kobling:** oppgave opprettet fra en bekreftet årsak viser årsaken som kilde
- **Før/etter-video:** to videoer side ved side per oppgave — spillerens egen referansesving
- **Endringslogg:** hva som er endret, av hvem, når

**E. Diagnose-flaten** (begge roller, ulikt detaljnivå)
Trakten fra Del 2: hvor → hva → bekreft → legg i planen. Produktets hjerte — gi den beste designen.

**F. Økt før start**
Rolig brief: varighet i timer og minutter, antall øvelser, formel-adressen, dagens krav,
lokasjon og hvem du trener med. Én stor Start-knapp.

**G. Økt under gjennomføring**
Øvelse for øvelse med: kommentar, bilde og video, fokus-stjerner, kravresultat, hvor tungt.
Talenotat kommer senere — vis plassen, men ikke funksjonen.

**H. Økt-oppsummering**
Treffprosent, fokus-snitt, kommentarer og media samlet — og stige-regelens forslag til neste gang.

**I. Favoritt-økter**
Stjernemerking av økter og maler, med «Favoritter» som egen inngang i menyen. Begge roller.

**J. Turneringskalender**
Velg turnering, merk formål (Trening/Utvikling/Prestasjon), og se hvordan formålet endrer
forberedelsen i ukene før — og hvordan resultatet skal tolkes etterpå.

---

### DEL 5 — VIDEREUTVIKLING TIL VERDENSKLASSE (design for dette fra dag én)

1. **Baklengs-planlegging som standard:** ingen i bransjen gjør «velg turnering → få hele året
   foreslått» godt. Det er vårt største fortrinn — gjør det til førsteopplevelsen.
2. **Selvjusterende plan:** avlyste og tapte økter foreslås automatisk re-plassert innenfor
   periodens regler — planen dør aldri, den flytter seg. Coach godkjenner med ett trykk.
3. **Hva-skjer-hvis:** dra en turnering eller en uke — se konsekvensen for belastning og
   periodene før du slipper.
4. **Belastning i kalenderen:** ukene farges av planlagt kontra tålt Treningsbelastning —
   overbelastning synes FØR den skjer, ikke i etterkant.
5. **Sosial trening som motor:** venne-økter, delte driller og felles krav («først til 7 av 10»)
   — Sosialt-kategorien finnes allerede i datamodellen, ingen bruker den ennå.
6. **Referansebibliotek per P-posisjon:** spillerens egne godkjente svinger som fasit —
   sammenlign dagens video mot egen beste, ikke mot en pro.
7. **Coach-cockpit på tvers:** alle spilleres uker i ett bilde — avvik, røde flagg og
   ubesvarte forslag øverst. Coachen skal aldri lete.
8. **Tale-først på range (V2):** «ni av ti, fokus fire» — logget uten å ta av hanskene.

---

### DEL 6 — KRAV TIL LEVERANSEN

- **Norsk bokmål** i all tekst. Lucide-ikoner. Aldri emoji.
- **Mobil og desktop** for hver skjerm. Spilleren er oftest på mobil, på en range, i sollys,
  med hansker på — store trykkflater, høy kontrast.
- **Alle tilstander:** tom, laster, feil, ingen data ennå, og «for lite data til å konkludere».
- **Ingen pynt uten mening.** Tall som skal sammenlignes settes i tabellsifre.
- **Ærlighet foran fullstendighet:** mangler data, vis en strek og hva som må til — aldri
  et oppdiktet tall.
- **Tilgjengelighet:** synlig tastaturfokus, respekter redusert bevegelse, les-vennlig i sterkt lys.

**Designretning:** Anders' referanser er mørke, filmatiske grensesnitt med store, presise tall,
rolige flater og tydelig ett-ting-om-gangen-fokus. Coachflaten tåler tetthet og mørk bakgrunn;
spillerflaten skal være lettere og mer fokusert. Designsystemet er ikke låst — foreslå din egen
retning, men hold den stram nok til at 449 skjermer kan bygges på den.

**Det viktigste å huske:** Systemet er ekstremt presist under panseret. Brukeren skal aldri
kjenne det. Vanskelig å forstå er feil design — ikke en dum bruker.

## PROMPT SLUTT

---

## Notater til Anders (ikke del av prompten)

**Hva som allerede finnes i koden og styrker prompten:**
- Hvert slag lagrer siktelinje (`targetX/targetY`) — dette gjør at spredning kan måles mot det
  spilleren faktisk siktet på, ikke bare mot fairwaymidten. Det er nøyaktig det som skiller
  teknisk feil fra taktisk feil.
- `mentalScore` 1–5 per slag finnes allerede — råmaterialet til den mentale årsakskategorien.
- `morad-fault-drill-mapping.json` kobler tekniske feil til P-posisjoner og øvelser (14 kB).

**Hva som mangler og må bygges (utover designet):**
- `sg-to-morad-faults.json` er nesten tom — **putting har null oppføringer**, og filen dekker
  bare teknikk. Taktikk, mentalt, fysisk og utstyr finnes ikke som årsakskategorier noe sted.
- Underferdighetene under hvert SG-område (lengdekontroll, greenlesning, sikte, ballstart)
  finnes ikke som begreper i systemet ennå — de må inn i ordboka og datamodellen.
- Testprotokollene som bekrefter en diagnose finnes ikke ennå.
