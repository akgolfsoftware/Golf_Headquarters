/**
 * Belastnings- og årsvolumvarsler for AK Golf HQ.
 * Beregner fremdrift mot 1250-timers målet for toppsatsende juniorer
 * og 6 ikke-blokkerende belastningsvarsler for coachen.
 *
 * Ingen I/O, ren domenemodell som er 100% testbar.
 */

export interface SeasonVolumeSummary {
  seasonTargetHours: number; // f.eks. 1250 timer
  completedHoursSoFar: number;
  plannedHoursRemaining: number;
  projectedTotalHours: number; // completed + planned
  targetDiffHours: number; // projected - target
  trajectoryExpectedHours: number; // forventet på gjeldende uke
  trajectoryDeviationPercent: number | null; // % bak/foran forventet bane
  onTrack: boolean;
}

export type WarningSeverity = "INFO" | "ADVARSEL" | "KRITISK";

export interface BudgetWarning {
  id:
    | "AKUTT_BELASTNING"
    | "FULL_SVING_VOLUM"
    | "AKKUMULERT_TRETHET"
    | "SMERTE_EGENSJEKK"
    | "SOEVN_UNDERSKUDD"
    | "AARSVOLUM_BANE";
  tittel: string;
  aktiv: boolean;
  nivaa: WarningSeverity;
  melding: string;
  grunnlagTekst: string;
  manglerData: boolean;
}

export interface BudgetWarningsInput {
  // 1. Akutt:kronisk belastning
  currentWeekLoad?: number | null;
  previousWeeksLoads?: number[]; // siste 4 ukers belastningspoeng

  // 2. Full-sving volum
  currentWeekFullSwingShots?: number | null;
  previousWeekFullSwingShots?: number | null;

  // 3. Akkumulert tretthet (4 uker på rad)
  consecutiveWeeklyLoads?: number[]; // [uke1, uke2, uke3, uke4]

  // 4. Egensjekk og smerte
  painRecords?: { date: string; isRed: boolean; painScore?: number }[];
  redDaysCount?: number | null;

  // 5. Søvn
  sleepRecords?: { date: string; hours: number }[];

  // 6. Årsvolum
  seasonTargetHours?: number; // standard 1250
  completedMinutesSoFar?: number;
  plannedMinutesRemaining?: number;
  currentWeekNumber?: number; // 1-52
  totalWeeksInSeason?: number; // standard 52
}

export interface BudgetWarningsResult {
  seasonVolume: SeasonVolumeSummary;
  warnings: BudgetWarning[];
  activeWarningsCount: number;
}

/**
 * Beregner årsvolum og fremdrift mot 1250-timers målet.
 */
export function computeSeasonVolume(input: {
  completedMinutesSoFar?: number;
  plannedMinutesRemaining?: number;
  seasonTargetHours?: number;
  currentWeekNumber?: number;
  totalWeeksInSeason?: number;
}): SeasonVolumeSummary {
  const target = input.seasonTargetHours ?? 1250;
  const totalWeeks = input.totalWeeksInSeason ?? 52;
  const currentWeek = Math.max(1, Math.min(totalWeeks, input.currentWeekNumber ?? 1));

  const completedHours = Math.round(((input.completedMinutesSoFar ?? 0) / 60) * 10) / 10;
  const plannedHours = Math.round(((input.plannedMinutesRemaining ?? 0) / 60) * 10) / 10;
  const projectedTotalHours = Math.round((completedHours + plannedHours) * 10) / 10;
  const targetDiffHours = Math.round((projectedTotalHours - target) * 10) / 10;

  // Forventet progresjon til nå i sesongen
  const trajectoryExpectedHours = Math.round(((currentWeek / totalWeeks) * target) * 10) / 10;

  let trajectoryDeviationPercent: number | null = null;
  let onTrack = true;

  if (trajectoryExpectedHours > 0) {
    // Prosent avvik: positivt betyr foran rute, negativt betyr bak rute
    trajectoryDeviationPercent =
      Math.round(((completedHours - trajectoryExpectedHours) / trajectoryExpectedHours) * 1000) / 10;
    // Hvis mer enn 5% bak rute, er spilleren ikke på sporet
    if (trajectoryDeviationPercent < -5.0) {
      onTrack = false;
    }
  }

  return {
    seasonTargetHours: target,
    completedHoursSoFar: completedHours,
    plannedHoursRemaining: plannedHours,
    projectedTotalHours,
    targetDiffHours,
    trajectoryExpectedHours,
    trajectoryDeviationPercent,
    onTrack,
  };
}

/**
 * Beregner alle 6 belastnings- og volumvarsler for Workbench.
 */
export function computeBudgetWarnings(input: BudgetWarningsInput): BudgetWarningsResult {
  const volume = computeSeasonVolume({
    completedMinutesSoFar: input.completedMinutesSoFar,
    plannedMinutesRemaining: input.plannedMinutesRemaining,
    seasonTargetHours: input.seasonTargetHours,
    currentWeekNumber: input.currentWeekNumber,
    totalWeeksInSeason: input.totalWeeksInSeason,
  });

  const warnings: BudgetWarning[] = [];

  // ── 1. Akutt:kronisk belastning (>15% over 4-ukers snitt) ───────────────────
  const currentLoad = input.currentWeekLoad;
  const prevLoads = input.previousWeeksLoads ?? [];
  if (currentLoad == null || prevLoads.length < 4) {
    warnings.push({
      id: "AKUTT_BELASTNING",
      tittel: "Akutt:kronisk belastning",
      aktiv: false,
      nivaa: "INFO",
      manglerData: true,
      melding: `Mangler data: krever 4 ukers historikk for å beregne akutt:kronisk belastning (har ${prevLoads.length} uker).`,
      grunnlagTekst: `Nåværende uke: ${currentLoad ?? "ikke registrert"}, historiske uker: ${prevLoads.length}/4.`,
    });
  } else {
    const snitt4Uker = prevLoads.slice(-4).reduce((a, b) => a + b, 0) / 4;
    const okningProsent =
      snitt4Uker > 0 ? Math.round(((currentLoad - snitt4Uker) / snitt4Uker) * 100) : 0;

    if (okningProsent > 15) {
      warnings.push({
        id: "AKUTT_BELASTNING",
        tittel: "Høy akutt belastning",
        aktiv: true,
        nivaa: "ADVARSEL",
        manglerData: false,
        melding: `Ukentlig belastning (${currentLoad} poeng) er ${okningProsent}% over 4-ukers snittet (${Math.round(snitt4Uker)} poeng). Anbefalt økning er maks 10–15% per uke.`,
        grunnlagTekst: `Nåværende uke: ${currentLoad} poeng vs 4-ukers snitt: ${Math.round(snitt4Uker)} poeng (+${okningProsent}%).`,
      });
    } else {
      warnings.push({
        id: "AKUTT_BELASTNING",
        tittel: "Akutt:kronisk belastning",
        aktiv: false,
        nivaa: "INFO",
        manglerData: false,
        melding: `Belastningen er innenfor trygge rammer (${okningProsent >= 0 ? `+${okningProsent}%` : `${okningProsent}%`} mot 4-ukers snitt).`,
        grunnlagTekst: `Nåværende uke: ${currentLoad} poeng, 4-ukers snitt: ${Math.round(snitt4Uker)} poeng.`,
      });
    }
  }

  // ── 2. Full-sving volum (+10% over forrige uke) ────────────────────────────
  const currentShots = input.currentWeekFullSwingShots;
  const prevShots = input.previousWeekFullSwingShots;
  if (currentShots == null || prevShots == null || prevShots === 0) {
    warnings.push({
      id: "FULL_SVING_VOLUM",
      tittel: "Full-sving volum",
      aktiv: false,
      nivaa: "INFO",
      manglerData: true,
      melding: "Mangler data: ingen full-sving-registreringer fra forrige uke å sammenligne med.",
      grunnlagTekst: `Denne uken: ${currentShots ?? "ikke registrert"}, forrige uke: ${prevShots ?? "ikke registrert"}.`,
    });
  } else {
    const shotOkning = Math.round(((currentShots - prevShots) / prevShots) * 100);
    if (shotOkning > 10) {
      warnings.push({
        id: "FULL_SVING_VOLUM",
        tittel: "Brå økning i full sving",
        aktiv: true,
        nivaa: "ADVARSEL",
        manglerData: false,
        melding: `Full-sving-volum (${currentShots} slag) er ${shotOkning}% over forrige uke (${prevShots} slag). Unngå brå hopp over 10% for å skåne rygg og ledd.`,
        grunnlagTekst: `Denne uken: ${currentShots} slag vs forrige uke: ${prevShots} slag (+${shotOkning}%).`,
      });
    } else {
      warnings.push({
        id: "FULL_SVING_VOLUM",
        tittel: "Full-sving volum",
        aktiv: false,
        nivaa: "INFO",
        manglerData: false,
        melding: `Full-sving-volum er stabilt (${currentShots} slag mot ${prevShots} forrige uke).`,
        grunnlagTekst: `Endring: ${shotOkning >= 0 ? `+${shotOkning}%` : `${shotOkning}%`}.`,
      });
    }
  }

  // ── 3. Akkumulert tretthet (4 uker på rad med økende belastning) ────────────
  const series = input.consecutiveWeeklyLoads ?? [];
  if (series.length < 4) {
    warnings.push({
      id: "AKKUMULERT_TRETHET",
      tittel: "Akkumulert tretthet",
      aktiv: false,
      nivaa: "INFO",
      manglerData: true,
      melding: `Mangler data: krever minst 4 sammenhengende uker med belastningstall (har ${series.length} uker).`,
      grunnlagTekst: `Historikk: ${series.join(", ") || "ingen uker"}.`,
    });
  } else {
    const last4 = series.slice(-4);
    const steadilyIncreasing =
      last4[0] < last4[1] && last4[1] < last4[2] && last4[2] < last4[3];

    if (steadilyIncreasing) {
      warnings.push({
        id: "AKKUMULERT_TRETHET",
        tittel: "4 uker med økende belastning",
        aktiv: true,
        nivaa: "ADVARSEL",
        manglerData: false,
        melding: "4 uker på rad med økende belastning. Planlegg en avlastningsuke (deload) for å hente inn overskudd.",
        grunnlagTekst: `Ukesbelastning siste 4 uker: ${last4.join(" → ")} poeng.`,
      });
    } else {
      warnings.push({
        id: "AKKUMULERT_TRETHET",
        tittel: "Akkumulert tretthet",
        aktiv: false,
        nivaa: "INFO",
        manglerData: false,
        melding: "Belastningskurven har tilstrekkelig variasjon og naturlig avlastning.",
        grunnlagTekst: `Siste 4 uker: ${last4.join(", ")} poeng.`,
      });
    }
  }

  // ── 4. Smerte og egensjekk (3 røde dager på rad eller siste uke) ───────────
  const painRecords = input.painRecords;
  let redDays = input.redDaysCount ?? 0;

  if (painRecords && painRecords.length > 0) {
    redDays = painRecords.filter((r) => r.isRed).length;
  }

  if (painRecords == null && input.redDaysCount == null) {
    warnings.push({
      id: "SMERTE_EGENSJEKK",
      tittel: "Smerte og egensjekk",
      aktiv: false,
      nivaa: "INFO",
      manglerData: true,
      melding: "Mangler data: ingen egensjekk eller smerteregistreringer logget for perioden.",
      grunnlagTekst: "Ingen helsedata tilgjengelig.",
    });
  } else if (redDays >= 3) {
    warnings.push({
      id: "SMERTE_EGENSJEKK",
      tittel: "Gjentatt smerte registrert",
      aktiv: true,
      nivaa: "KRITISK",
      manglerData: false,
      melding: `Spilleren har registrert ${redDays} røde dager på smerte/egensjekk den siste uken. Avklar tilstand med coach eller helseapparat før videre belastning.`,
      grunnlagTekst: `${redDays} røde dager registrert.`,
    });
  } else {
    warnings.push({
      id: "SMERTE_EGENSJEKK",
      tittel: "Smerte og egensjekk",
      aktiv: false,
      nivaa: "INFO",
      manglerData: false,
      melding: `Ingen vedvarende smerte registrert (${redDays} røde dager siste uke).`,
      grunnlagTekst: `${redDays} røde dager registrert.`,
    });
  }

  // ── 5. Søvnunderskudd (<8 timer 3 netter på rad) ──────────────────────────
  const sleep = input.sleepRecords ?? [];
  if (sleep.length < 3) {
    warnings.push({
      id: "SOEVN_UNDERSKUDD",
      tittel: "Søvnregistrering",
      aktiv: false,
      nivaa: "INFO",
      manglerData: true,
      melding: `Mangler data: færre enn 3 netter med søvnregistreringer (har ${sleep.length} netter).`,
      grunnlagTekst: `Registrerte netter: ${sleep.length}/3.`,
    });
  } else {
    // Sjekk om det finnes et vindu på 3 netter på rad under 8 timer
    let has3ConsecutiveShortNights = false;
    let shortNightAvg = 0;

    for (let i = 0; i <= sleep.length - 3; i++) {
      const window = sleep.slice(i, i + 3);
      if (window.every((s) => s.hours < 8.0)) {
        has3ConsecutiveShortNights = true;
        shortNightAvg = Math.round((window.reduce((a, b) => a + b.hours, 0) / 3) * 10) / 10;
        break;
      }
    }

    if (has3ConsecutiveShortNights) {
      warnings.push({
        id: "SOEVN_UNDERSKUDD",
        tittel: "Søvnunderskudd",
        aktiv: true,
        nivaa: "ADVARSEL",
        manglerData: false,
        melding: `Spilleren har sovet under 8 timer 3 netter på rad (snitt: ${shortNightAvg} t). Utilstrekkelig søvn svekker restitusjon og øker skaderisiko.`,
        grunnlagTekst: `Siste 3 netter under 8 timer: snitt ${shortNightAvg} timer.`,
      });
    } else {
      const recentAvg =
        Math.round((sleep.slice(-3).reduce((a, b) => a + b.hours, 0) / 3) * 10) / 10;
      warnings.push({
        id: "SOEVN_UNDERSKUDD",
        tittel: "Søvnregistrering",
        aktiv: false,
        nivaa: "INFO",
        manglerData: false,
        melding: `Søvnmengden er tilfredsstillende (snitt siste 3 netter: ${recentAvg} t).`,
        grunnlagTekst: `Snitt siste netter: ${recentAvg} timer.`,
      });
    }
  }

  // ── 6. Årsvolum vs 1250-timers bane (>5% under banen) ───────────────────────
  const currentWeek = input.currentWeekNumber ?? 1;
  if (currentWeek < 2 || volume.completedHoursSoFar === 0) {
    warnings.push({
      id: "AARSVOLUM_BANE",
      tittel: "Årsvolum",
      aktiv: false,
      nivaa: "INFO",
      manglerData: true,
      melding: `Mangler data: for tidlig i sesongen (uke ${currentWeek}) til å vurdere avvik fra 1250-timers banen.`,
      grunnlagTekst: `Fullført hittil: ${volume.completedHoursSoFar} timer.`,
    });
  } else if (!volume.onTrack && volume.trajectoryDeviationPercent != null) {
    const absDeviation = Math.abs(volume.trajectoryDeviationPercent);
    warnings.push({
      id: "AARSVOLUM_BANE",
      tittel: "Etter skjema på årsvolum",
      aktiv: true,
      nivaa: "ADVARSEL",
      manglerData: false,
      melding: `Akkumulert treningstid (${volume.completedHoursSoFar} t) ligger ${absDeviation}% under 1250-timers banen (forventet ${volume.trajectoryExpectedHours} t ved uke ${currentWeek}). Planlagt gjenstående: ${volume.plannedHoursRemaining} t.`,
      grunnlagTekst: `Faktisk: ${volume.completedHoursSoFar} t vs forventet bane: ${volume.trajectoryExpectedHours} t (-${absDeviation}%).`,
    });
  } else {
    warnings.push({
      id: "AARSVOLUM_BANE",
      tittel: "Årsvolum",
      aktiv: false,
      nivaa: "INFO",
      manglerData: false,
      melding: `Spilleren følger eller ligger foran 1250-timers banen (${volume.completedHoursSoFar} t fullført mot forventet ${volume.trajectoryExpectedHours} t ved uke ${currentWeek}).`,
      grunnlagTekst: `Fullført: ${volume.completedHoursSoFar} t, forventet: ${volume.trajectoryExpectedHours} t (${volume.trajectoryDeviationPercent != null && volume.trajectoryDeviationPercent >= 0 ? `+${volume.trajectoryDeviationPercent}%` : `${volume.trajectoryDeviationPercent}%`}).`,
    });
  }

  const activeWarningsCount = warnings.filter((w) => w.aktiv).length;

  return {
    seasonVolume: volume,
    warnings,
    activeWarningsCount,
  };
}
