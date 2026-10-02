/**
 * Belastningsberegning (sRPE) for økter og uker i Workbench og PlayerHQ.
 * Foster-metoden: Varighet (minutter) × Opplevd anstrengelse (1–10 Borg CR-10) = Belastningspoeng.
 *
 * Ingen eksterne avhengigheter, ren domenemodell som kan enhetstestes.
 */

export const RPE_SKALA: Record<number, { kort: string; beskrivelse: string }> = {
  1: { kort: "Veldig lett", beskrivelse: "Nærmest hvile, uanstrengt" },
  2: { kort: "Lett", beskrivelse: "Rolig tempo, kan prate uanstrengt" },
  3: { kort: "Moderat", beskrivelse: "Kjenner pulsen litt, kontrollert" },
  4: { kort: "Noe anstrengende", beskrivelse: "Begynner å merke innsatsen" },
  5: { kort: "Anstrengende", beskrivelse: "Tydelig slitsomt, men bærekraftig" },
  6: { kort: "Hardt", beskrivelse: "Krever god konsentrasjon og vilje" },
  7: { kort: "Veldig hardt", beskrivelse: "Tungt, krevende å opprettholde" },
  8: { kort: "Svært hardt", beskrivelse: "Nær maks konsentrasjon eller fysisk innsats" },
  9: { kort: "Ekstremt hardt", beskrivelse: "Nesten utmattende" },
  10: { kort: "Maksimalt", beskrivelse: "Absolutt maks, ingenting igjen på tanken" },
};

export type SessionLoadInput = {
  durationMinutes: number;
  actualMinutes?: number | null;
  perceivedEffort?: number | null;
  status?: string;
};

/**
 * Beregner belastningspoeng (sRPE) for en enkelt økt.
 * Bruker actualMinutes dersom registrert, ellers planlagt durationMinutes.
 * Returnerer null dersom perceivedEffort ikke er registrert (1–10).
 */
export function computeSessionLoad(session: SessionLoadInput): number | null {
  if (
    session.perceivedEffort == null ||
    typeof session.perceivedEffort !== "number" ||
    session.perceivedEffort < 1 ||
    session.perceivedEffort > 10
  ) {
    return null;
  }

  const minutes =
    session.actualMinutes != null && session.actualMinutes >= 0
      ? session.actualMinutes
      : Math.max(0, session.durationMinutes);

  return Math.round(minutes * session.perceivedEffort);
}

export type WeeklyLoadResult = {
  totalLoad: number;
  ratedSessionsCount: number;
  totalSessionsCount: number;
  averageEffort: number | null;
  completedMinutes: number;
};

/**
 * Beregner samlet ukentlig belastning basert på øktene i uken.
 */
export function computeWeeklyLoad(sessions: SessionLoadInput[]): WeeklyLoadResult {
  let totalLoad = 0;
  let ratedCount = 0;
  let sumEffort = 0;
  let completedMinutes = 0;

  for (const s of sessions) {
    const min =
      s.actualMinutes != null && s.actualMinutes >= 0
        ? s.actualMinutes
        : Math.max(0, s.durationMinutes);

    if (s.status === "COMPLETED") {
      completedMinutes += min;
    }

    const load = computeSessionLoad(s);
    if (load !== null) {
      totalLoad += load;
      ratedCount++;
      sumEffort += s.perceivedEffort!;
    }
  }

  return {
    totalLoad,
    ratedSessionsCount: ratedCount,
    totalSessionsCount: sessions.length,
    averageEffort: ratedCount > 0 ? Math.round((sumEffort / ratedCount) * 10) / 10 : null,
    completedMinutes,
  };
}
