/** AK-formel v3 — se docs/ordre-ak-formel-v3-2026-08-03.md §2. */
export type AkPyramide = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
export type AkPModus = "ENKEL" | "FLERE" | "INTERVALL";

export interface AkFormelVerdi {
  pyr?: AkPyramide | null;
  /** Områdekode. Gyldige verdier avhenger av pyramide — se AK_STRUKTUR. */
  omr?: string | null;
  del?: string | null;
  mot?: "UTEN_BALL" | "LAV_HASTIGHET" | "AUTO" | null;
  bel?: "INNENDORS" | "TRENINGSOMRADE" | "BANE" | "KONKURRANSE" | null;
  press?: "ALENE" | "OBSERVERT" | "KONKURRANSE" | "TURNERING" | null;
  /** Kun TEK på tee/innspill. Lagre alltid ekspandert liste — se §2.4. */
  pValg?: string[];
  pModus?: AkPModus;
}

export interface AkFormelVelgerProps {
  verdi?: AkFormelVerdi;
  onChange?: (verdi: AkFormelVerdi) => void;
  /** Vis formellinja nederst. Av når linja rendres separat. */
  visFormel?: boolean;
  dataOdId?: string;
}
export interface AkFormelLinjeProps {
  verdi?: AkFormelVerdi;
  dataOdId?: string;
}

export declare function AkFormelVelger(props: AkFormelVelgerProps): JSX.Element;
export declare function AkFormelLinje(props: AkFormelLinjeProps): JSX.Element;

/** Strukturen. Pyramiden bestemmer områder, delferdighet og antall slots. */
export declare const AK_STRUKTUR: Record<AkPyramide, {
  l: string; d: string;
  omrader: Array<{ grp: string | null; items: Array<{ k: string; l: string; d?: string }> }>;
  del: "golf" | "spill" | "fys" | null;
  slots: string[];
  delApen?: string;
}>;
export declare const AK_MOTORIKK: Array<{ k: string; l: string; d: string }>;
export declare const AK_BELASTNING: Array<{ k: string; l: string; d: string }>;
export declare const AK_PRESS: Array<{ k: string; l: string; d: string }>;
export declare const AK_P_POSISJONER: string[];

export declare function omradeObjekt(verdi: AkFormelVerdi): { k: string; l: string; d?: string; grp: string | null } | null;
export declare function delferdighetsListe(verdi: AkFormelVerdi): Array<{ k: string; l: string; d: string }> | null;
export declare function harPPosisjon(verdi: AkFormelVerdi): boolean;
/** Intervall utvidet til alle punkter imellom — det som skal lagres. */
export declare function pEkspandert(verdi: AkFormelVerdi): string[];
export declare function formelSlots(verdi: AkFormelVerdi): string[];
/** Kun for visning og søk. Kan ikke parses tilbake — se §5.1. */
export declare function formelStreng(verdi: AkFormelVerdi): string;
