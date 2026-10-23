/** Målgrupper beskriver behov, aldri tilgang, lisens eller ferdighetsnivå.
 * Kilde: Anders sin bestilling 23.10.2026. Ingen personopplysninger.
 */
export const COACHING_KONTEKST_VERSJON = "2026-10-23.1";
export const COACHING_KONTEKSTER = {
  selvbetjent: { navn: "Selvbetjent PlayerHQ", fokus: "Egne mål og realistisk trening rundt hverdagen.", hensyn: ["Spill på banen er ikke automatisk en treningsøkt.", "Turneringer og WAGR er ikke nødvendige for en god personlig plan."] },
  "wang-toppidrett-fredrikstad": { navn: "WANG Toppidrett Fredrikstad", fokus: "Skole, årsplan, konkurranse og individuell oppfølging.", hensyn: ["Skoleopplysninger og helsedata er ikke automatisk golfanalyse."] },
  "wang-ung-fredrikstad": { navn: "WANG Ung Fredrikstad", fokus: "Læring, variasjon, grunnferdigheter og selvstendighet.", hensyn: ["Ikke kopier Toppidrett-planer til yngre elever."] },
  "gfgk-mini": { navn: "GFGK Mini (8–12 år)", fokus: "Lek, trygg deltakelse, variasjon og mestring.", hensyn: ["Ingen talentrangering eller sammenligning etter treningsvolum.", "Lav registreringsbelastning; foresatt og trener støtter."] },
  "gfgk-utvikling": { navn: "GFGK Utvikling (13–15 år)", fokus: "Individuelle grunnferdigheter, rutiner og passende konkurranseerfaring.", hensyn: ["Alder er ikke nivå. Biologisk modning skal ikke gjettes."] },
  "gfgk-elite-aspirant": { navn: "GFGK Elite Aspirant (16–19 år)", fokus: "Konkrete utviklingsgap og overgang mot konkurranserettet trening.", hensyn: ["Opprykk avgjøres faglig; ingen automatisk AI-score."] },
  "gfgk-elite": { navn: "GFGK Elite (16–19 år)", fokus: "Ferdighetsstabilitet, sesongfase og konkurranseforberedelser.", hensyn: ["Ingen resultatgaranti eller blind jakt på rankingpoeng."] },
  "gfgk-college": { navn: "GFGK College", fokus: "Collegekalender, lagtrener, reiser og hjemmeperioder.", hensyn: ["Avklar planansvar med lagtreneren.", "College er ikke automatisk høyeste ferdighetsnivå.", "WAGR-katalogen dekker ikke alle collegekonkurranser."] },
  "ak-golf-academy": { navn: "AK Golf Academy", fokus: "Individuell coaching etter mål, ferdigheter og Anders sine begrunnelser.", hensyn: ["Kan omfatte ulike aldre og nivåer.", "Kjøp av coaching gir ikke automatisk gruppedeling."] },
  "wang-ekstern": { navn: "WANG Toppidrett – annen skole", fokus: "Skolens eget mandat, trenerteam og godkjente deling.", hensyn: ["Fredrikstad-medlemskap gir ikke tilgang til andre skoler."] },
  "team-norway": { navn: "Team Norway – konkret gruppe", fokus: "Den aktuelle gruppens utviklings- og konkurranseoppgave.", hensyn: ["Ingen organisasjonsvid tilgang fra ett gruppemedlemskap.", "Gruppenavn eller nivå skal ikke gjettes."] },
} as const;
export type CoachingKontekst = keyof typeof COACHING_KONTEKSTER;

/** Samme spiller kan ha flere sammenhenger. Timer summeres aldri per medlemskap. */
export function coachingRamme(kontekster: readonly CoachingKontekst[]) {
  const unike = [...new Set(kontekster)];
  return { versjon: COACHING_KONTEKST_VERSJON, kontekster: unike.map(k => ({ id: k, ...COACHING_KONTEKSTER[k] })),
    regler: ["Ferdighetsnivå, alder, mål, lisens og gruppetilhørighet er separate størrelser.",
      "Begynn med spillerens egen utvikling; vis hva som mangler før tiltak foreslås.",
      "En målt sammenheng er ikke dokumentasjon på årsak.",
      "Bruk brutto score. Skill faktisk tid, anslag og ukjent tid.",
      "Bruk versjonerte fagkilder og godkjente maler. Ingen nye coachingregler fra gruppenavnet.",
      "Tiltak er forslag med begrunnelse; treneren og spilleren beholder kontrollen."] };
}
