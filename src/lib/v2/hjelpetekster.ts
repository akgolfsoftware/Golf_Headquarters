/**
 * AK Golf HQ v2 — hjelpetekster («?»-forklaringer i klarspråk).
 * Én kilde for alle HjelpTips-innhold (src/components/v2/hjelp.tsx). Nye
 * forklaringer legges til HER, aldri ad-hoc i skjermfiler. mobilTips er kun
 * med der mobil/iPad-oppførselen faktisk skiller seg fra desktop.
 */

export interface HjelpTekst {
  tittel: string;
  forklaring: string;
  mobilTips?: string;
}

const RAW = {
  sgTotal: {
    tittel: "Strokes Gained totalt",
    forklaring:
      "Viser hvor mange slag du vinner eller taper sammenlignet med et referansenivå. Positivt tall betyr at du spiller bedre enn referansen, negativt betyr at du taper slag der.",
  },
  sgOmrade: {
    tittel: "SG per område",
    forklaring:
      "Bryter Strokes Gained ned på del av spillet, som driving, nærspill og putting, slik at du ser hvor slagene faktisk vinnes eller tapes.",
  },
  acwr: {
    tittel: "ACWR (belastningsforhold)",
    forklaring:
      "Forholdet mellom treningsmengden siste uke og gjennomsnittet siste fire uker. Målet er 0,8-1,3. Over det betyr at du trapper opp for fort, under betyr at du kanskje trener for lite til å bygge form.",
  },
  csNivaa: {
    tittel: "CS-nivå",
    forklaring:
      "Club Standard, et målt ferdighetsnivå for en bestemt del av svingen eller slaget. Høyere tall (for eksempel CS100) krever mer presisjon enn et lavere (CS50).",
  },
  lFase: {
    tittel: "Læringsfase",
    forklaring:
      "Hvor langt en bevegelse har kommet i tre steg: Uten ball (grunnbevegelsen bygges med tørrsving og speil), Lav hastighet (med ball i redusert tempo) og Auto (automatisk under press, full fart).",
  },
  periodetype: {
    tittel: "Periodetype",
    forklaring:
      "Hvilken fase treningsperioden er i: Grunn (bygg basis), Spesialisering (integrer ferdigheter), Turnering (automatiser og spiss form), Evaluering (test) eller Ferie (vedlikehold). Hver fase har sin anbefalte fordeling av trening — anbefalinger, aldri sperrer.",
  },
  ukevolum: {
    tittel: "Ukevolum",
    forklaring:
      "Samlet planlagt treningstid per uke, i minutter. Hver periode har et anbefalt volum-vindu; ligger du utenfor er det et signal om å justere, ikke et forbud.",
  },
  pPosisjon: {
    tittel: "P-posisjon",
    forklaring:
      "Fast punkt i svingen (P1–P10): P1 er oppstilling, P4 topp av baksving, P7 treff, P10 avslutning. Brukes til å plassere en teknisk oppgave nøyaktig der i svingen den hører hjemme.",
  },
  repsHastighet: {
    tittel: "Reps-hastighet",
    forklaring:
      "Hvor fort en repetisjon gjøres: TØRR (uten ball, langsomt for kontroll), LAV (redusert fart) eller FULL (full svinghastighet). Lav hastighet bygger mønster; full hastighet tester det under press.",
  },
  planEtterlevelse: {
    tittel: "Plan-etterlevelse",
    forklaring:
      "Hvor mye av planlagt trening som faktisk ble gjennomført, i prosent. Et lavt tall er ikke et forbud mot noe, bare et signal om at planen og virkeligheten har sklidd fra hverandre.",
  },
  tonnasje: {
    tittel: "Tonnasje",
    forklaring:
      "Total vekt løftet i en styrkeøkt, regnet ut fra sett, reps og vekt. Brukes til å følge belastningen over tid sammen med ACWR.",
  },
  pyramideAkse: {
    tittel: "Pyramide-akse",
    forklaring:
      "De fem hovedområdene i AK-formelen: FYS (fysikk), TEK (teknikk), SLAG (slagproduksjon), SPILL (spillforståelse) og TURN (turnering). Hver økt tilhører én akse.",
  },
  skillArea: {
    tittel: "Ferdighetsområde",
    forklaring:
      "Hvilken konkret del av spillet drillen trener på — for eksempel driver, jern, chip eller putting. Mer presist enn pyramide-aksen, som bare sier hvilken av de fem hovedgruppene økta hører til.",
  },
  miljo: {
    tittel: "Miljø",
    forklaring:
      "Hvor drillen trenes: Range (rekkevidde uten press), Simulator, Bane eller Turnering. Miljøet sier noe om hvor mye press og virkelighet som er med — range har minst, turnering mest.",
  },
  prPress: {
    tittel: "Press-nivå",
    forklaring:
      "Hvor mye konsekvens som ligger på slaget, i fire trinn: Fri (bygge, feil er gratis), Krav (score mot et eget mål), Utfordring (én sjanse per slag, men alene) og Konkurranse (mot andre eller turnering, poeng teller). Høyere press trener nervene, ikke bare teknikken.",
  },
  streak: {
    tittel: "Streak",
    forklaring:
      "Antall dager på rad du har gjennomført planlagt trening. En brutt streak er ikke en straff, bare en tilbakemelding på rytmen din.",
  },
  hcp: {
    tittel: "HCP (handicap)",
    forklaring:
      "Det offisielle ferdighetsnivået ditt i golf, beregnet fra innleverte runder. Lavere tall betyr bedre nivå.",
  },
  wagr: {
    tittel: "WAGR",
    forklaring:
      "World Amateur Golf Ranking, verdensrankingen for amatørgolfere. Bygget på resultater i godkjente turneringer over tid.",
  },
  testbatteri: {
    tittel: "Testbatteri",
    forklaring:
      "En fast samling tester (fysiske og tekniske) som gjentas jevnlig, slik at utvikling kan sammenlignes over tid på samme grunnlag.",
  },
  workbenchZoom: {
    tittel: "Zoom i Workbench",
    forklaring:
      "Bytter mellom hvor detaljert du ser planen: sesong, måned, uke eller enkeltøkt. Zoom inn for å redigere én økt, zoom ut for oversikten.",
    mobilTips:
      "På mobil bytter du nivå med knappene i brødsmulestien øverst i planen, ikke ved å klype på skjermen.",
  },
  egentreningVindu: {
    tittel: "Egentreningsvindu",
    forklaring:
      "Tidsrommet innenfor en gruppeøkt som er satt av til at spilleren trener selvstendig, uten direkte styring fra coach.",
  },
  talentVurdering: {
    tittel: "Talent-vurdering",
    forklaring:
      "Coachens vurdering av deg på en skala fra 1 til 10 per område (teknikk, fysisk, motivasjon), vist som prosent av full skala. Oppdateres av coach — ikke beregnet automatisk.",
  },
  spredningSigma: {
    tittel: "σ (spredning)",
    forklaring:
      "Standardavvik — hvor mye slagene dine varierer rundt snittet, målt i meter. σ side er variasjon til høyre/venstre, σ lengde er variasjon i lengde. Lavere tall betyr jevnere slag.",
  },
  skjevhetBias: {
    tittel: "Bias (skjevhet)",
    forklaring:
      "Den gjennomsnittlige miss-retningen din på dette hullet — for eksempel 4 m høyre. Brukes til å justere siktepunktet: misser du systematisk høyre, sikt lenger mot venstre.",
  },
  dispersjon: {
    tittel: "Slag-dispersion",
    forklaring:
      "Spredningen av slagene dine, vist som et punktkart der hvert punkt er ett slag. Et tett mønster betyr stabilt treff — et spredt mønster viser hvor mye slaget varierer i lengde og side.",
  },
  trackman: {
    tittel: "TrackMan-data",
    forklaring:
      "Målinger fra TrackMan-radaren, som ballhastighet, lengde og spredning per kølle. Importeres fra CSV- eller HTML-eksport og brukes til å følge kølleavstander og stabilitet over tid.",
  },
  turneringPrioritet: {
    tittel: "Prioritet",
    forklaring:
      "Rangerer hvem som får plass hvis turneringen har begrenset antall startplasser. Høyere prioritet betyr større sjanse for å bli tatt inn ved overtegning.",
  },
  utfordringScore: {
    tittel: "Score i utfordringer",
    forklaring:
      "Resultatet ditt i denne utfordringen, målt slik eieren har definert øvelsen — for eksempel antall treff eller poeng. Høyere score er alltid bedre, og resultatlisten rangeres etter beste score.",
  },
  signalVerdi: {
    tittel: "Signal-verdi",
    forklaring:
      "Et automatisk beregnet tall for spilleren, som SG totalt, HCP-trend eller streak — typen står i teksten rett over tallet. Signalet varsler deg om noe har endret seg, det er ikke en dom i seg selv.",
  },
  pulsSone: {
    tittel: "Puls-sone",
    forklaring:
      "Intensitetstrinn fra S1 (rolig) til S5 (maks), basert på hjertefrekvens. Brukes til å styre hvor hardt en kondisjonsøkt faktisk kjentes, ikke bare hvor lenge den varte.",
  },
  stimp: {
    tittel: "Stimp (greenhastighet)",
    forklaring:
      "Hvor raskt ballen ruller på greenen, målt med stimpmeter. Høyere tall betyr raskere green — stimp 8 er en treg klubbgreen, stimp 12 er turneringsraskt. Samme putt bryter mer på en rask green.",
  },
  break: {
    tittel: "Break",
    forklaring:
      "Hvor mye putten svinger sideveis på grunn av hellingen i greenen. Oppgis i centimeter eller kopp-bredder fra midten av hullet — sikter du på riktig break, kan du putte med jevn fart rett gjennom svingen.",
  },
  makeProsent: {
    tittel: "Make-prosent",
    forklaring:
      "Andelen putter som går i hullet fra en gitt avstand. Selv proffene holer bare rundt halvparten fra 2,5 meter — bruk tallet til å sette realistiske forventninger, ikke som en dom.",
  },
  prosessScore: {
    tittel: "Prosess-score",
    forklaring:
      "Poeng for hvor godt du gjennomførte prosessen (oppsett, sikte, fart) — ikke om ballen gikk i. God prosess gir flere hull over tid, så denne scoren viser om du trener på riktig ting.",
  },
  kategoriSnitt: {
    tittel: "Kategori-snitt (referanse)",
    forklaring:
      "Et typisk nivå for spillere i samme kategori (for eksempel A1), brukt som sammenligningspunkt. Det er en referanse å måle seg mot, ikke et krav — avstanden viser hvor du har mest å hente.",
  },
  smashFactor: {
    tittel: "Smash factor",
    forklaring:
      "Ballhastighet delt på køllehastighet — et mål på hvor rent du treffer. Rundt 1,50 med driver er svært godt; lavere tall betyr at energi går tapt i treffet, ikke at du svinger for sakte.",
  },
  dPlane: {
    tittel: "D-Plane (face og path)",
    forklaring:
      "Forholdet mellom hvor køllebladet peker (face) og hvor køllen beveger seg (path) i treffet, målt i grader. Face styrer mest av startretningen, forskjellen mellom face og path skaper skruen.",
  },
  sikkerhetsscore: {
    tittel: "Sikkerhetsscore",
    forklaring:
      "En enkel poengsum for hvor godt kontoen din er sikret. Passord alene gir grunnpoeng; tofaktor-innlogging løfter den. Scoren er en påminnelse, ikke en dom — ett grep (skru på 2FA) tar deg til topps.",
  },
  gir: {
    tittel: "GIR (green på regulering)",
    forklaring:
      "Du treffer greenen på par minus to slag — altså i 1 på par 3, 2 på par 4, 3 på par 5. GIR-prosenten er en av de sterkeste enkeltindikatorene på ballstriking; proffene ligger rundt 65 %.",
  },
  fairwayTreff: {
    tittel: "Fairway-treff (FW)",
    forklaring:
      "Utslaget stoppet på fairway. Telles kun på par 4 og par 5 (på par 3 sikter du på greenen). Fairway-treff gir enklere innspill — men lengde og vinkel inn mot greenen betyr ofte mer enn treffprosenten alene.",
  },
  putter: {
    tittel: "Putter per runde",
    forklaring:
      "Antall slag på greenen. Tallet må leses sammen med GIR: mange putter kan bety god ballstriking (flere lange førsteputter), ikke nødvendigvis dårlig putting. Under 30 putter på 18 hull er solid.",
  },
  credits: {
    tittel: "Credits (pakketimer)",
    forklaring:
      "Coaching-pakken din (Performance / Performance Pro) gir et antall økter per måned — hver booking bruker én credit. Er de brukt opp denne måneden, kan du fortsatt booke drop-in med kort, eller vente til de fylles på.",
  },
  malEffektivitet: {
    tittel: "Mal-effektivitet",
    forklaring:
      "Hvor godt denne plan-malen har virket for spillerne som har brukt den: SG-Total-delta er gjennomsnittlig endring i Strokes Gained fra malen startet til den var ferdig, og effektivitets-tallet (1–5) er samme snitt omregnet til en enkel skala. Få brukere gir usikre tall.",
  },
  ngfNivaa: {
    tittel: "NGF-nivå (D–G)",
    forklaring:
      "Norges Golfforbunds nivåtrapp for spillerutvikling. D er høyeste juniornivå her (toppjunior), G er aktiv klubbspiller. Nivået styrer hvilke tester og krav som er relevante for deg — ikke en karakter.",
  },
  kohortSnitt: {
    tittel: "Kohort-snitt",
    forklaring:
      "Gjennomsnittet av de andre spillerne på samme nivå som deg. Det viser hvor du står i forhold til gruppen din akkurat nå — ikke et mål i seg selv, men et referansepunkt for å se hvor du skiller deg ut.",
  },
  vas: {
    tittel: "VAS-skala (smerte 0–10)",
    forklaring:
      "Visuell analog skala: du angir smerten din fra 0 (ingen) til 10 (verst tenkelig). Det finnes ikke rett eller galt svar — poenget er å følge DIN utvikling over tid, så bruk skalaen likt hver gang.",
  },
  hullVarme: {
    tittel: "Varmekart · hvor du taper slag",
    forklaring:
      "Viser gjennomsnittlig avvik fra par på hvert hull, regnet ut fra alle runder du har registrert hull for hull. Jo sterkere farge, jo mer taper du på det hullet i snitt — hull spilt på eller under par vises tomt. Bygges først når du har logget minst tre runder med hull-for-hull-score.",
  },
} as const satisfies Record<string, HjelpTekst>;

export type HjelpNokkel = keyof typeof RAW;

/** Bredet til HjelpTekst (med valgfri mobilTips) — literal-nøklene lever i HjelpNokkel. */
export const HJELPETEKSTER: Record<HjelpNokkel, HjelpTekst> = RAW;
