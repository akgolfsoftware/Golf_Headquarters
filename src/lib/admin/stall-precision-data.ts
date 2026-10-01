/**
 * Data for AG-07 Stall i Precision Athletics — tre bånd: I dag · Trener nå ·
 * Hele stallen (beslutninger.md §SKJERMENE … RUNDE 8, AgencyOS › Stall i tre
 * bånd, 28.09.2026). Bygger på den ekte `loadStallen`-loaderen (samme data og
 * tilgangsregel som den gamle Stallen-siden) og legger til:
 *  - «Trener nå»: WorkbenchSession med status IN_PROGRESS og dagens dato (Oslo),
 *    i coachens spillerskop. En økt som ble stående IN_PROGRESS en tidligere
 *    dag, teller ikke som «trener nå».
 *  - Utløp på plan/avtale: Subscription.currentPeriodEnd (kind COACHING) per
 *    spiller. Mangler abonnementet, vises «—» (aldri anslått dato).
 *
 * Ingen nye tabeller, ingen skjemaendring — bare lesing av eksisterende felt.
 */
import { prisma } from "@/lib/prisma";
import { loadStallen, type StallenRow } from "./stallen-data";
import { nesteOktLabel, sisteAktivitetLabel } from "./stall-rad";
import { sammeDag } from "@/lib/uke-helpers";
import { osloDagSomDbDato } from "@/lib/portal/ph01-data";

export type StallBaandRad = StallenRow & {
  /** Plan/avtale (Subscription.currentPeriodEnd, kind COACHING). null = ingen aktiv avtale. */
  avtaleUtlopIso: string | null;
  /** Økten som pågår nå, kun satt for «Trener nå»-båndet. */
  paagaaende: { id: string; tittel: string; startMinute: number; durationMinutes: number } | null;
  nesteOktLabel: string;
  sisteAktivitetLabel: string;
};

export type StallPrecisionData = {
  total: number;
  iDag: StallBaandRad[];
  trenerNaa: StallBaandRad[];
  heleStallen: StallBaandRad[];
};

export async function loadStallPrecision(
  coach: { id: string; role: string },
  params: { q?: string; group?: string },
): Promise<StallPrecisionData> {
  const stall = await loadStallen(coach, params);
  const naa = new Date();
  const spillerIds = stall.rows.map((r) => r.id);

  const [paagaende, avtaler] = await Promise.all([
    spillerIds.length
      ? prisma.workbenchSession.findMany({
          where: { playerId: { in: spillerIds }, status: "IN_PROGRESS", date: osloDagSomDbDato(naa) },
          select: { id: true, playerId: true, title: true, startMinute: true, durationMinutes: true },
        })
      : Promise.resolve([]),
    spillerIds.length
      ? prisma.subscription.findMany({
          where: {
            userId: { in: spillerIds },
            kind: "COACHING",
            status: { in: ["ACTIVE", "TRIALING"] },
          },
          select: { userId: true, currentPeriodEnd: true },
        })
      : Promise.resolve([]),
  ]);

  const paagaaendeByPlayer = new Map(paagaende.map((s) => [s.playerId, s]));
  const avtaleByPlayer = new Map(avtaler.map((a) => [a.userId, a.currentPeriodEnd]));

  const rader: StallBaandRad[] = stall.rows.map((r) => {
    const p = paagaaendeByPlayer.get(r.id);
    const utlop = avtaleByPlayer.get(r.id) ?? null;
    return {
      ...r,
      avtaleUtlopIso: utlop ? utlop.toISOString() : null,
      paagaaende: p ? { id: p.id, tittel: p.title, startMinute: p.startMinute, durationMinutes: p.durationMinutes } : null,
      nesteOktLabel: nesteOktLabel(r.nesteOkt, naa),
      sisteAktivitetLabel: sisteAktivitetLabel(r.sisteOkt, r.dagerSiden, naa),
    };
  });

  const iDag = rader.filter((r) => r.nesteOkt != null && sammeDag(r.nesteOkt, naa));
  const trenerNaa = rader.filter((r) => r.paagaaende != null);

  return { total: stall.total, iDag, trenerNaa, heleStallen: rader };
}

