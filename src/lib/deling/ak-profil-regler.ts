import { maaHaForesattSamtykke, sekstenaarsdag } from "@/lib/auth/minor";

/** Eget formål; analyse-, organisasjons- og navngitte ja oppgraderes aldri. */
export const AK_PROFIL_SCOPE = "AK_GOLF_COACHINGPROFIL";
export const AK_PROFIL_VERSJON = "2026-10-23.1";
export const AK_PROFIL_TEKST = {
  tittel: "Coachingprofil med AK Golf",
  forklaring: "AK Golfs ansvarlige trenere, hjelpetrenerne og administratorene for denne gruppen kan bruke coachingprofilen din i Caddie: navn, handicap, erfaring, ambisjon, hjemmeklubb, treningsplaner, økter, testresultater og rundestatistikk. Dette omfatter også egne økter og resultater utenfor gruppetreningene. Helse, private notater, meldinger, opptak og økonomi inngår ikke. Valget gir ikke tillatelse til felles modellæring eller identifiserbare spillerdata til eksterne AI-modeller.",
  trekk: "Du kan trekke valget her. Nye profiloppslag i Caddie stopper da. Opplysninger som allerede er vist, forsvinner ikke automatisk. Valget endrer ikke andre delinger eller retten til å bruke din egen PlayerHQ.",
} as const;

export type AkProfilRad = {
  scope: string; mottakerGruppeId: string; mottakerUserId: string | null;
  gitt: boolean; gittAvRolle: string; gittAvUserId: string; tekstVersjon: string; createdAt: Date;
};
export type AkProfilKrav = {
  spillerId: string; gruppeId: string; dateOfBirth: Date | null;
  requiresGuardianConsent: boolean; foresattIder: readonly string[]; naa: Date;
};

/** Nyeste gjeldende hendelse avgjør; feil versjon/aktør og lik tid feiler lukket. */
export function delerAkProfil(rader: readonly AkProfilRad[], krav: AkProfilKrav): boolean {
  const fyller16 = sekstenaarsdag(krav.dateOfBirth);
  const aktuelle = rader.filter(r => r.scope === AK_PROFIL_SCOPE && r.mottakerGruppeId === krav.gruppeId && r.mottakerUserId === null)
    // D-69: foreldre kan ikke endre valget etter 16-årsdagen.
    .filter(r => !(r.gittAvRolle === "FORESATT" && fyller16 && r.createdAt >= fyller16));
  if (!aktuelle.length || aktuelle.some(r => !Number.isFinite(r.createdAt.getTime()) || r.createdAt > krav.naa)) return false;
  const tid = Math.max(...aktuelle.map(r => r.createdAt.getTime()));
  const nyeste = aktuelle.filter(r => r.createdAt.getTime() === tid);
  if (nyeste.length !== 1) return false;
  const rad = nyeste[0];
  if (!rad.gitt || rad.tekstVersjon !== AK_PROFIL_VERSJON) return false;
  if (rad.gittAvRolle === "SELV") {
    return rad.gittAvUserId === krav.spillerId && fyller16 !== null && rad.createdAt >= fyller16 && !maaHaForesattSamtykke(krav, krav.naa);
  }
  return rad.gittAvRolle === "FORESATT" && krav.foresattIder.includes(rad.gittAvUserId);
}
