/**
 * AG-09 Live-tavle — data for AgencyOS' «hvem trener nå»-board (T9, 27.08.2026).
 *
 * Kilde: `TrainingSessionV2` med status IN_PROGRESS. Statusovergangen
 * PLANNED → IN_PROGRESS eies av spilleren selv (`/portal/(fullscreen)/live/
 * [sessionId]/actions.ts` — CLAUDE.md-smoketesten «Spiller: Start →
 * IN_PROGRESS → Ferdig»). Denne fila er ren lesning — ingen skriving, ingen
 * fabrikerte tall. `location` er ofte tom (ikke satt av `startOkt`-broen);
 * vises da som praksis-type, aldri en oppdiktet bane/simulator-plassering.
 */

import { prisma } from "@/lib/prisma";
import { initialsFromName } from "@/lib/avatar-colors";

const PRACTICE_TYPE_LABEL: Record<string, string> = {
  BLOKK: "Blokk",
  RANDOM: "Random",
  KONKURRANSE: "Konkurranse",
  SPILL_TEST: "Spill/test",
};

export type LiveTavleKort = {
  id: string;
  tag: string;
  spillerNavn: string;
  spillerInitialer: string;
  tittel: string;
  startTime: string;
  endTime: string;
  minutterIgjen: number;
  fremdrift: number;
};

export type LiveTavleData = {
  iOkt: LiveTavleKort[];
  /** Neste PLANNED-økt i dag (etter nå), til «Rundt tavla»-panelet. Ekte data, null hvis ingen. */
  nesteOkt: { spillerNavn: string; tittel: string; startTime: string } | null;
};

export async function lastLiveTavleData(): Promise<LiveTavleData> {
  const now = new Date();
  const doegnStart = new Date(now);
  doegnStart.setHours(0, 0, 0, 0);
  const doegnSlutt = new Date(now);
  doegnSlutt.setHours(23, 59, 59, 999);

  const [pagaende, neste] = await Promise.all([
    prisma.trainingSessionV2.findMany({
      where: { status: "IN_PROGRESS" },
      select: {
        id: true,
        title: true,
        studentId: true,
        startTime: true,
        endTime: true,
        location: true,
        practiceType: true,
      },
      orderBy: { startTime: "asc" },
      take: 30,
    }),
    prisma.trainingSessionV2.findFirst({
      where: { status: "PLANNED", startTime: { gt: now, lte: doegnSlutt } },
      select: { title: true, studentId: true, startTime: true },
      orderBy: { startTime: "asc" },
    }),
  ]);

  const spillerIder = Array.from(
    new Set([...pagaende.map((s) => s.studentId), neste?.studentId].filter((v): v is string => !!v)),
  );
  const spillere = spillerIder.length
    ? await prisma.user.findMany({ where: { id: { in: spillerIder } }, select: { id: true, name: true } })
    : [];
  const navnKart = new Map(spillere.map((s) => [s.id, s.name ?? "Ukjent spiller"]));

  const iOkt: LiveTavleKort[] = pagaende.map((s) => {
    const spillerNavn = s.studentId ? (navnKart.get(s.studentId) ?? "Ukjent spiller") : "Ukjent spiller";
    const totalMs = s.endTime.getTime() - s.startTime.getTime();
    const igjenMs = s.endTime.getTime() - now.getTime();
    const minutterIgjen = Math.max(0, Math.round(igjenMs / 60_000));
    const fremdrift = totalMs > 0 ? Math.min(1, Math.max(0, (now.getTime() - s.startTime.getTime()) / totalMs)) : 0;
    return {
      id: s.id,
      tag: s.location?.trim() || PRACTICE_TYPE_LABEL[s.practiceType] || "Økt",
      spillerNavn,
      spillerInitialer: initialsFromName(spillerNavn),
      tittel: s.title,
      startTime: s.startTime.toISOString(),
      endTime: s.endTime.toISOString(),
      minutterIgjen,
      fremdrift,
    };
  });

  return {
    iOkt,
    nesteOkt: neste
      ? {
          spillerNavn: neste.studentId ? (navnKart.get(neste.studentId) ?? "Ukjent spiller") : "Ukjent spiller",
          tittel: neste.title,
          startTime: neste.startTime.toISOString(),
        }
      : null,
  };
}
