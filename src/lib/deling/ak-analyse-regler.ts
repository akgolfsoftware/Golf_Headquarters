/** Eget formål i eksisterende delingshistorikk. Gamle profilvalg utvides aldri. */
import { sekstenaarsdag } from "@/lib/auth/minor";
import { harGyldigSamtykke, type DelingSamtykkeRad } from "./samtykke-regler";

export const AK_ANALYSE_SCOPE = "AK_GOLF_GRUPPEANALYSE" as const;
export const AK_ANALYSE_VERSJON = "2026-10-23.1";
export const AK_ANALYSE_TEKST = {
  tittel: "Treningsanalyse med AK Golf",
  forklaring: "AK Golfs ansvarlige trenere og administratorer kan bruke registrert trening i denne gruppens analyse: planlagt tid, gjennomføring, faktisk tid og fordeling på treningsområder. Dette gjelder treningen din, også egne økter utenfor gruppetreningene. Notater, meldinger, helse og opptak inngår ikke. Valget gir ikke tillatelse til å trene AI-modeller eller lære på tvers av spillere.",
  trekk: "Du kan trekke valget her. Nye oppslag i gruppeanalysen bruker da ikke treningen din. Dette valget endrer ikke andre delinger eller retten til å bruke din egen PlayerHQ.",
} as const;

export type AkAnalyseRad = DelingSamtykkeRad & { tekstVersjon: string; mottakerUserId: string | null };

export function delerAkAnalyse(rader: readonly AkAnalyseRad[], gruppeId: string, kreverForesatt: boolean, fodselsdato: Date | null, naa = new Date()): boolean {
  // Ukjente aktører, framtidige rader og navngitt deling gir ingen gruppetilgang.
  // Trekk fra eldre tekstversjoner beholdes; et gammelt ja oppgraderes ikke.
  const gyldige = rader.filter(r => r.mottakerUserId === null &&
    ["SELV", "FORESATT"].includes(r.gittAvRolle) && Number.isFinite(r.createdAt.getTime()) &&
    r.createdAt <= naa && (!r.gitt || r.tekstVersjon === AK_ANALYSE_VERSJON));
  return harGyldigSamtykke(gyldige, { scope: AK_ANALYSE_SCOPE, mottakerGruppeId: gruppeId, kreverForesatt, fodselsdato });
}

/** Foresatt kan ikke handle etter 16-årsdagen selv om et gammelt flagg står igjen. */
export function forelderKanEndreAkAnalyse(kreverForesatt: boolean, fodselsdato: Date | null, naa = new Date()): boolean {
  const grense = sekstenaarsdag(fodselsdato);
  return kreverForesatt && (grense === null || naa < grense);
}
