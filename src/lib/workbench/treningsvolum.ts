import { naivOsloTilTidspunkt } from "@/lib/google-calendar-tid";

export const VOLUM_AKSER = ["fys", "tek", "slag", "spill", "turn"] as const;
export type VolumAkse = (typeof VOLUM_AKSER)[number];

/** Kalenderdato lagres ved UTC-midnatt; startMinute er veggklokke i Oslo. */
export type TreningsvolumOkt = {
  id: string;
  date: Date;
  startMinute: number;
  pyramid: string;
  durationMinutes: number;
  actualMinutes: number | null;
  status: string;
  isTemplate?: boolean;
  hiddenByPlayer?: boolean;
  needsPlayerApproval?: boolean;
  approvalStatus?: string | null;
  updatedAt?: Date;
  kilde?: "workbench" | "legacy";
  migrertFraTrainingPlanSessionId?: string | null;
  /** Bare et uttrykkelig kildeanslag. Planlagt varighet utledes aldri som faktisk. */
  legacyAnslagMinutter?: number | null;
};

/** Samme halvåpne kalenderdatovindu gjelder alle summer: fra <= dato < til. */
export type TreningsvolumVindu = { fraDato: Date; tilDato: Date; naa: Date };

export type TreningsvolumSum = {
  /** Hele valgt vindu. Framtidig planlagt tid er en separat oppgitt delmengde. */
  planlagtMinutter: number;
  /** Sum av registreringene, null når ingen gjennomført økt har registrert tid.
   * Ved delvis dekning må ukjentOkter/legacyAnslagOkter følge verdien. */
  faktiskMinutter: number | null;
  legacyAnslagMinutter: number | null;
  framtidigPlanlagtMinutter: number;
  planlagteOkter: number;
  gjennomforteOkter: number;
  /** Ferdigmeldte eller økter som skulle vært ferdige per nå. Hoppet over/avbrutt er utenfor. */
  forventetRegistreringOkter: number;
  faktiskRegistrerteOkter: number;
  legacyAnslagOkter: number;
  ukjentOkter: number;
  framtidigeOkter: number;
  ikkeUtforteOkter: number;
  avbrutteOkter: number;
  /** Planen beholdes, men klokkeslettet kan ikke brukes til frist eller faktisk tid. */
  ugyldigTidOkter: number;
};

export type Treningsvolum = {
  vindu: { fraDato: string; tilDato: string; naa: string };
  total: TreningsvolumSum;
  akser: (TreningsvolumSum & { akse: VolumAkse })[];
  /** Ukjente aksekoder holdes utenfor de fem aksene, men er med i totalen. */
  utenAkse: TreningsvolumSum;
};

function tomSum(): TreningsvolumSum {
  return {
    planlagtMinutter: 0, faktiskMinutter: null, legacyAnslagMinutter: null,
    framtidigPlanlagtMinutter: 0, planlagteOkter: 0, gjennomforteOkter: 0,
    forventetRegistreringOkter: 0, faktiskRegistrerteOkter: 0, legacyAnslagOkter: 0,
    ukjentOkter: 0, framtidigeOkter: 0, ikkeUtforteOkter: 0, avbrutteOkter: 0, ugyldigTidOkter: 0,
  };
}

function gyldigeMinutter(v: number | null | undefined): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0;
}

/** Workbench er autoriteten for en migrert økt, også hvis den siden er flyttet,
 * skjult eller annullert. Avstem FØR vindu-/statusfilter; ingen navnebasert gjetting. */
function unikeOkter(okter: readonly TreningsvolumOkt[]): TreningsvolumOkt[] {
  const migrerteIder = new Map<string, string>();
  for (const okt of okter) {
    if (okt.kilde !== "legacy" && okt.migrertFraTrainingPlanSessionId)
      migrerteIder.set(okt.id, okt.migrertFraTrainingPlanSessionId);
  }
  const perId = new Map<string, TreningsvolumOkt>();
  for (const okt of okter) {
    const kilde = okt.kilde ?? "workbench";
    const migrertId = migrerteIder.get(okt.id);
    const id = kilde === "legacy" ? okt.id : (migrertId ?? okt.id);
    const key = kilde === "legacy" || migrertId ? `plan:${id}` : `wb:${id}`;
    const gammel = perId.get(key);
    const autoritativ = gammel?.kilde === "legacy" && kilde === "workbench";
    const sammeKilde = gammel && (gammel.kilde ?? "workbench") === kilde;
    if (!gammel || autoritativ || (sammeKilde &&
      (okt.updatedAt?.getTime() ?? 0) > (gammel.updatedAt?.getTime() ?? 0))) perId.set(key, okt);
  }
  return [...perId.values()];
}

/** Faktisk krever COMPLETED + registrert tid + påbegynt dato/klokkeslett.
 * SKIPPED/ABANDONED er fortsatt planlagt, men aldri gjennomført/faktisk.
 * Registrering forventes ved planlagt slutt eller tidligere ferdigmelding.
 * DRAFT/CANCELLED og ubesvarte/avviste/skjulte/mal-økter er utenfor grunnlaget. */
export function summerTreningsvolum(
  okter: readonly TreningsvolumOkt[], vindu: TreningsvolumVindu,
): Treningsvolum {
  const total = tomSum();
  const akser = VOLUM_AKSER.map(akse => ({ akse, ...tomSum() }));
  const utenAkse = tomSum();
  for (const okt of unikeOkter(okter)) {
    if (!Number.isFinite(okt.date.getTime()) || okt.date < vindu.fraDato || okt.date >= vindu.tilDato ||
      okt.status === "DRAFT" || okt.status === "CANCELLED" || okt.isTemplate ||
      okt.hiddenByPlayer || okt.needsPlayerApproval || okt.approvalStatus === "PENDING" ||
      okt.approvalStatus === "REJECTED") continue;
    // Tidskonvertereren tar en naiv lokal veggklokke, ikke DB-datokolonnen.
    let start: Date | null = null;
    if (Number.isInteger(okt.startMinute) && okt.startMinute >= 0 && okt.startMinute < 1440 && gyldigeMinutter(okt.durationMinutes)) {
      const aar = okt.date.getUTCFullYear(), maned = okt.date.getUTCMonth(), dag = okt.date.getUTCDate();
      const time = Math.floor(okt.startMinute / 60), minutt = okt.startMinute % 60;
      const naiv = new Date(aar, maned, dag, time, minutt);
      try {
        // Date-konstruktøren kan normalisere 02:30 til 03:30 på en Oslo-maskin.
        // Samme klokkeslett må avvises både lokalt og på en UTC-server.
        if (naiv.getFullYear() === aar && naiv.getMonth() === maned && naiv.getDate() === dag &&
          naiv.getHours() === time && naiv.getMinutes() === minutt) start = naivOsloTilTidspunkt(naiv);
      } catch {
        // Et klokkeslett i sommertidshullet skal rettes, aldri flyttes/gjettes.
      }
    }
    const framtid = start !== null && start > vindu.naa;
    const slutt = start !== null ? new Date(start.getTime() + okt.durationMinutes * 60_000) : null;
    const forventet = start !== null && !framtid && (okt.status === "COMPLETED" || (slutt !== null && slutt <= vindu.naa));
    const akse = akser.find(a => a.akse === okt.pyramid.toLowerCase()) ?? utenAkse;
    for (const sum of [total, akse]) {
      sum.planlagteOkter++;
      if (gyldigeMinutter(okt.durationMinutes)) sum.planlagtMinutter += okt.durationMinutes;
      if (start === null) {
        sum.ugyldigTidOkter++;
      } else if (framtid) {
        sum.framtidigeOkter++;
        if (gyldigeMinutter(okt.durationMinutes)) sum.framtidigPlanlagtMinutter += okt.durationMinutes;
      } else if (okt.status === "SKIPPED") {
        sum.ikkeUtforteOkter++;
      } else if (okt.status === "ABANDONED") {
        sum.avbrutteOkter++;
      } else {
        if (forventet) sum.forventetRegistreringOkter++;
        if (okt.status === "COMPLETED") sum.gjennomforteOkter++;
        if (okt.status === "COMPLETED" && gyldigeMinutter(okt.actualMinutes)) {
          sum.faktiskRegistrerteOkter++;
          sum.faktiskMinutter = (sum.faktiskMinutter ?? 0) + okt.actualMinutes;
        } else if (forventet && okt.status === "COMPLETED" && gyldigeMinutter(okt.legacyAnslagMinutter)) {
          sum.legacyAnslagOkter++;
          sum.legacyAnslagMinutter = (sum.legacyAnslagMinutter ?? 0) + okt.legacyAnslagMinutter;
        } else if (forventet) sum.ukjentOkter++;
      }
    }
  }
  return {
    vindu: { fraDato: vindu.fraDato.toISOString(), tilDato: vindu.tilDato.toISOString(), naa: vindu.naa.toISOString() },
    total, akser, utenAkse,
  };
}
