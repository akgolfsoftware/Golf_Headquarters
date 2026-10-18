/**
 * AG-05-AR Året (pakke 3, natt 17.10): coachede økter per måned og minutter per
 * akse. Ren funksjon uten Prisma; data kommer fra `admin/kalender/aar-data.ts`.
 * En økt uten kjent akse telles som økt, men står som nøytral i stripen.
 */
import type { KalenderAkse } from "./kalender-lag";

export type AarRad = { dato: string; minutter: number; akse: KalenderAkse | null };

export type AarManed = {
  /** 1–12 */
  maaned: number;
  navn: string;
  okter: number;
  minutter: Record<KalenderAkse | "noy", number>;
  /** Måneden er ikke begynt ennå: tallene er planlagt, ikke gjennomført. */
  framtid: boolean;
};

const NAVN = ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"];

export function summerAar(rader: readonly AarRad[], aar: number, idagIso: string): { maneder: AarManed[]; totalt: number } {
  const maneder: AarManed[] = NAVN.map((navn, i) => ({
    maaned: i + 1,
    navn,
    okter: 0,
    minutter: { fys: 0, tek: 0, slag: 0, spill: 0, turn: 0, noy: 0 },
    framtid: `${aar}-${String(i + 1).padStart(2, "0")}` > idagIso.slice(0, 7),
  }));
  let totalt = 0;
  for (const r of rader) {
    if (Number(r.dato.slice(0, 4)) !== aar) continue;
    const m = maneder[Number(r.dato.slice(5, 7)) - 1];
    if (!m) continue;
    m.okter += 1;
    m.minutter[r.akse ?? "noy"] += Math.max(0, r.minutter);
    totalt += 1;
  }
  return { maneder, totalt };
}
