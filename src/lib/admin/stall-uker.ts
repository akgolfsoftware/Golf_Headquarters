/**
 * Etterlevelse per uke for raden i AG-07 Stall (designløft 20.10.2026).
 * Samme regel og samme fire ukers vindu som stallens etterlevelse
 * (domain/etterlevelse.ts), delt i fire løpende sjudagersvinduer bakover fra nå.
 * Eldste først. Et vindu uten forfalte minutter gir null, aldri 0.
 */
import { etterlevelse, etterlevelseFra, type EtterlevelseOkt } from "@/lib/domain/etterlevelse";

const UKE_MS = 7 * 86_400_000;

export function etterlevelseUker(okter: readonly EtterlevelseOkt[], now: Date): (number | null)[] {
  const fra = etterlevelseFra(now).getTime();
  return [0, 1, 2, 3].map((i) => {
    const start = fra + i * UKE_MS;
    const slutt = i === 3 ? now.getTime() + 1 : start + UKE_MS;
    return etterlevelse(okter.filter((o) => o.scheduledAt.getTime() >= start && o.scheduledAt.getTime() < slutt), now).pct;
  });
}
