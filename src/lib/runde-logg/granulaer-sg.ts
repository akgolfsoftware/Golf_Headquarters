/**
 * Granulær SG-bucket-fordeling — fyller Round-modellens finmaskede felter
 * fra per-slag-SG (uavrundet via beregnSgPerSlag; buckets avrundes til slutt).
 *
 * Buckets:
 *  - sgTee: alle slag spilt fra tee (hullets første slag), uansett kategori.
 *  - sgApp50/100/150/200: APP-slag (ikke tee) etter startavstand i meter:
 *    ≤75 → 50 · ≤125 → 100 · ≤175 → 150 · >175 → 200.
 *  - sgChip (≤12 m) / sgPitch (>12 m) for ARG-slag utenom bunker;
 *    sgBunker: ARG-slag fra bunker. sgLob settes ikke (krever kølle-data).
 *  - sgPutt-buckets: startavstand i FOT (kanon: putting i fot):
 *    0–3 · 3–5 · 5–10 · 10–15 · 15–25 · 25–40 · 40+.
 *
 * Straffe-rader (syntetiske −1-rader) tilordnes samme bucket som slaget de
 * hører til, slik at bucket-summene stemmer med kategoritotalene.
 */

import { beregnSgPerSlag } from "@/lib/domain/sg";
import { meterTilFot } from "@/lib/min-golf/format";
import type { SgShotMedMeta } from "./til-sg-shots";
import type { GranulaerSg, LoggetHull } from "./types";

type BucketKey = keyof GranulaerSg;

function puttBucket(fot: number): BucketKey {
  if (fot <= 3) return "sgPutt0_3";
  if (fot <= 5) return "sgPutt3_5";
  if (fot <= 10) return "sgPutt5_10";
  if (fot <= 15) return "sgPutt10_15";
  if (fot <= 25) return "sgPutt15_25";
  if (fot <= 40) return "sgPutt25_40";
  return "sgPutt40plus";
}

function appBucket(meter: number): BucketKey {
  if (meter <= 75) return "sgApp50";
  if (meter <= 125) return "sgApp100";
  if (meter <= 175) return "sgApp150";
  return "sgApp200";
}

/**
 * Velger bucket for ett SgShot (med metadata).
 * `erTeeSlag` = hullets første slag (slagIndex 0, ikke straffe-rad — straffe-
 * raden til et tee-slag går også i sgTee via slagIndex).
 */
function velgBucket(shot: SgShotMedMeta, bunkerStart: boolean): BucketKey | null {
  if (shot.slagIndex === 0) return "sgTee";
  switch (shot.category) {
    case "OTT":
      // OTT utenom tee (svært lange posisjoner) — ingen egen bucket.
      return null;
    case "APP":
      return appBucket(shot.distance);
    case "ARG":
      if (bunkerStart) return "sgBunker";
      return shot.distance <= 12 ? "sgChip" : "sgPitch";
    case "PUTT":
      return puttBucket(meterTilFot(shot.distance));
  }
}

/**
 * Beregner granulære SG-buckets for runden.
 * Trenger hull-lista for å vite startunderlag per slag (bunker-avgjørelsen).
 */
export function beregnGranulaerSg(
  hull: ReadonlyArray<LoggetHull>,
  shots: ReadonlyArray<SgShotMedMeta>,
): GranulaerSg {
  const sum = new Map<BucketKey, number>();

  for (const shot of shots) {
    // Startunderlag for slaget = resultat-lie fra forrige slag på hullet
    // (slagIndex 0 starter på tee → aldri bunker).
    const h = hull.find((x) => x.holeNumber === shot.holeNumber);
    let bunkerStart = false;
    if (h && shot.slagIndex > 0) {
      const forrige = h.slag[shot.slagIndex - 1];
      bunkerStart = !forrige.resultat.iHull && forrige.resultat.lie === "BUNKER";
    }

    const bucket = velgBucket(shot, bunkerStart);
    if (!bucket) continue;
    sum.set(bucket, (sum.get(bucket) ?? 0) + beregnSgPerSlag(shot));
  }

  const rund = (n: number): number => Math.round(n * 100) / 100;
  const hent = (k: BucketKey): number | null => {
    const v = sum.get(k);
    return v === undefined ? null : rund(v);
  };

  return {
    sgTee: hent("sgTee"),
    sgApp200: hent("sgApp200"),
    sgApp150: hent("sgApp150"),
    sgApp100: hent("sgApp100"),
    sgApp50: hent("sgApp50"),
    sgChip: hent("sgChip"),
    sgPitch: hent("sgPitch"),
    sgBunker: hent("sgBunker"),
    sgPutt0_3: hent("sgPutt0_3"),
    sgPutt3_5: hent("sgPutt3_5"),
    sgPutt5_10: hent("sgPutt5_10"),
    sgPutt10_15: hent("sgPutt10_15"),
    sgPutt15_25: hent("sgPutt15_25"),
    sgPutt25_40: hent("sgPutt25_40"),
    sgPutt40plus: hent("sgPutt40plus"),
  };
}
