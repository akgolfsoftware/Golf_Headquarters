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
    tittel: "L-fase",
    forklaring:
      "Hvor langt en bevegelse har kommet i læringsstigen: L-Kropp (grunnbevegelsen), L-Arm, L-Kølle, L-Ball (med ball) eller L-Auto (automatisk under press).",
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
  utfordringScore: {
    tittel: "Score i utfordringer",
    forklaring:
      "Resultatet ditt i denne utfordringen, målt slik eieren har definert øvelsen — for eksempel antall treff eller poeng. Høyere score er alltid bedre, og resultatlisten rangeres etter beste score.",
  },
} as const satisfies Record<string, HjelpTekst>;

export type HjelpNokkel = keyof typeof RAW;

/** Bredet til HjelpTekst (med valgfri mobilTips) — literal-nøklene lever i HjelpNokkel. */
export const HJELPETEKSTER: Record<HjelpNokkel, HjelpTekst> = RAW;
