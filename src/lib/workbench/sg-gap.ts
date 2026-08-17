import { hentSpillerSg } from "@/lib/domain/spiller-sg";
import type { SgKategori } from "./fokus";

/**
 * Størst SG-gap for en spiller: laveste strokes gained-kategori (OTT/APP/ARG/PUTT).
 *
 * Kilde: den kanoniske SG-selectoren (`hentSpillerSg` — én SG-sannhet, AP0.1
 * i docs/plan-baneguide-sg-app-2026-08-16.md): beregnede Round.sg* primært,
 * BrukerSgInput kun som fallback når runder med SG mangler.
 * (Frem til 2026-08-16 prioriterte denne fila selvrapporterte tall FORAN
 * beregnede runder — motsatt av Analysere/Hjem.)
 *
 * NB — kun SPILLER-flatene er lagt om så langt (denne, hull-analysen, drills,
 * Workbench-fokus, plan-engine). Coach-flatene har fortsatt motsatt regel:
 * `src/lib/admin/stallen-data.ts` (SG-trend), `benchmark-provider.ts` og
 * `admin-compare/multi-compare-data.ts` leser BrukerSgInput først//kun. Coach
 * og spiller kan derfor se ulike SG-tall for samme person til AP5.1 legger
 * dem om — ikke anta at hele plattformen deler kilde ennå.
 *
 * Null når ingen kategori-SG finnes.
 */
export async function beregnSgGap(
  userId: string,
): Promise<{ kategori: SgKategori; sg: number } | null> {
  const sg = await hentSpillerSg(userId);
  if (!sg) return null;

  const verdier: [SgKategori, number | null][] = [
    ["OTT", sg.ott.sg],
    ["APP", sg.app.sg],
    ["ARG", sg.arg.sg],
    ["PUTT", sg.putt.sg],
  ];

  let svakest: { kategori: SgKategori; sg: number } | null = null;
  for (const [kategori, verdi] of verdier) {
    if (verdi == null) continue;
    if (svakest === null || verdi < svakest.sg) svakest = { kategori, sg: verdi };
  }
  return svakest;
}
