/**
 * Dispersion-motor for Gameplan (B30, omdøpt fra "Baneguide").
 *
 * Regner spredningsstatistikk fra slag: snitt, standardavvik, bias
 * (venstre/høyre + kort/lang) og en rotert konfidens-ellipse (kovarians →
 * egenvektorer). Jobber i et "sikte-koordinatsystem":
 *   lateral  = meter til siden av sikte-linjen (+ = høyre, − = venstre)
 *   distance = meter forbi målet langs sikte-linjen (+ = lang, − = kort)
 *
 * GPS-slag projiseres inn i dette systemet med projectToAimFrame().
 * TrackMan-slag (side + carry) mappes med trackmanToPoints().
 *
 * Holder ALL spredningsmatematikk ett sted — UI (shot-map, banekart,
 * Gameplan interaktiv modus) leser bare resultatet.
 */

import type { LatLng } from "./shot-coords";

export type DispersionPoint = { lateral: number; distance: number };

export type DispersionEllipse = {
  /** Senter (snittpunkt) i lateral/distance-meter. */
  centerLateral: number;
  centerDistance: number;
  /** Halvakser (meter) for valgt konfidens. */
  semiMajor: number;
  semiMinor: number;
  /** Rotasjon av storaksen, radianer, målt fra distance-aksen mot lateral. */
  angleRad: number;
  /** Konfidensnivå ellipsen dekker (0–1). */
  confidence: number;
};

export type DispersionStats = {
  n: number;
  mean: DispersionPoint;
  std: DispersionPoint;
  bias: {
    lateral: number; // = mean.lateral
    side: "venstre" | "høyre" | "rett";
    distance: number; // = mean.distance
    length: "kort" | "lang" | "presis";
  };
  ellipse: DispersionEllipse | null;
};

const R_EARTH = 6371000;
const toRad = (d: number) => (d * Math.PI) / 180;

/** Storsirkel-avstand (meter). */
export function haversine(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R_EARTH * Math.asin(Math.sqrt(h));
}

/** Kompass-bearing fra a til b, radianer (0 = nord, med klokka). */
export function bearing(a: LatLng, b: LatLng): number {
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLng);
  return Math.atan2(y, x);
}

/** Punkt `distanceM` meter unna `from`, i retning `bearingRad` (0 = nord). */
export function destinationPoint(from: LatLng, bearingRad: number, distanceM: number): LatLng {
  const la1 = toRad(from.lat);
  const lo1 = toRad(from.lng);
  const d = distanceM / R_EARTH;
  const la2 = Math.asin(Math.sin(la1) * Math.cos(d) + Math.cos(la1) * Math.sin(d) * Math.cos(bearingRad));
  const lo2 =
    lo1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(d) * Math.cos(la1),
      Math.cos(d) - Math.sin(la1) * Math.sin(la2),
    );
  return { lat: (la2 * 180) / Math.PI, lng: (lo2 * 180) / Math.PI };
}

/**
 * GeoJSON-polygon (lukket ring) for en meter-nøyaktig sirkel — brukes til
 * Gameplan-soner («bra å misse» / «aldri hit») som Mapbox GL circle-layer
 * (piksel-radius) ikke kan gi presist på tvers av zoom-nivåer.
 */
export function circlePolygon(center: LatLng, radiusM: number, points = 32): [number, number][] {
  const ring: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const b = (i / points) * 2 * Math.PI;
    const p = destinationPoint(center, b, radiusM);
    ring.push([p.lng, p.lat]);
  }
  return ring;
}

/**
 * Projiser et landingspunkt inn i sikte-systemet (tee → target).
 * distance = meter forbi målet (+ lang / − kort), lateral = meter til siden
 * (+ høyre / − venstre sett fra tee mot mål).
 */
export function projectToAimFrame(landing: LatLng, tee: LatLng, target: LatLng): DispersionPoint {
  const aim = bearing(tee, target);
  const d = haversine(tee, landing);
  const b = bearing(tee, landing);
  const delta = b - aim;
  const along = d * Math.cos(delta);
  const across = d * Math.sin(delta); // + = høyre
  const targetDist = haversine(tee, target);
  return { lateral: across, distance: along - targetDist };
}

/** Konverteringsfaktor for 2D-konfidens-ellipse (chi-kvadrat, 2 frihetsgrader). */
function confidenceScale(confidence: number): number {
  const p = Math.min(Math.max(confidence, 0), 0.999999);
  return Math.sqrt(-2 * Math.log(1 - p));
}

const SIDE_THRESHOLD_M = 2; // |bias| under dette = "rett/presis"

export function computeDispersion(
  points: DispersionPoint[],
  opts: { confidence?: number } = {},
): DispersionStats {
  const n = points.length;
  const confidence = opts.confidence ?? 0.95;

  if (n === 0) {
    return {
      n: 0,
      mean: { lateral: 0, distance: 0 },
      std: { lateral: 0, distance: 0 },
      bias: { lateral: 0, side: "rett", distance: 0, length: "presis" },
      ellipse: null,
    };
  }

  const meanLat = points.reduce((s, p) => s + p.lateral, 0) / n;
  const meanDist = points.reduce((s, p) => s + p.distance, 0) / n;

  let sxx = 0; // var(lateral)
  let syy = 0; // var(distance)
  let sxy = 0; // cov
  for (const p of points) {
    const dx = p.lateral - meanLat;
    const dy = p.distance - meanDist;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  // Populasjons-varians (delt på n) — konsistent med shot-map.tsx
  sxx /= n;
  syy /= n;
  sxy /= n;

  const stdLat = Math.sqrt(sxx);
  const stdDist = Math.sqrt(syy);

  // Egenverdier av kovariansmatrisen [[sxx, sxy],[sxy, syy]]
  const tr = sxx + syy;
  const det = sxx * syy - sxy * sxy;
  const disc = Math.max(tr * tr / 4 - det, 0);
  const l1 = tr / 2 + Math.sqrt(disc); // største
  const l2 = Math.max(tr / 2 - Math.sqrt(disc), 0);
  // Vinkel på storaksen. atan2(2sxy, sxx−syy)/2 gir vinkel mot lateral-aksen;
  // vi rapporterer fra distance-aksen, så bruk komplement via x/y-bytte.
  const angleRad = 0.5 * Math.atan2(2 * sxy, syy - sxx);
  const k = confidenceScale(confidence);

  const ellipse: DispersionEllipse = {
    centerLateral: meanLat,
    centerDistance: meanDist,
    semiMajor: Math.sqrt(l1) * k,
    semiMinor: Math.sqrt(l2) * k,
    angleRad,
    confidence,
  };

  return {
    n,
    mean: { lateral: meanLat, distance: meanDist },
    std: { lateral: stdLat, distance: stdDist },
    bias: {
      lateral: meanLat,
      side: meanLat > SIDE_THRESHOLD_M ? "høyre" : meanLat < -SIDE_THRESHOLD_M ? "venstre" : "rett",
      distance: meanDist,
      length: meanDist > SIDE_THRESHOLD_M ? "lang" : meanDist < -SIDE_THRESHOLD_M ? "kort" : "presis",
    },
    ellipse,
  };
}

/** GPS-slag → sikte-punkter. Bruker landingspunktet (end) per slag. */
export function shotsToPoints(
  shots: { end: LatLng | null }[],
  tee: LatLng,
  target: LatLng,
): DispersionPoint[] {
  return shots
    .filter((s): s is { end: LatLng } => s.end != null)
    .map((s) => projectToAimFrame(s.end, tee, target));
}

/**
 * TrackMan-range-slag → sikte-punkter. lateral = side (offline), distance =
 * carry sentrert på snittet (range har ikke et fast "mål").
 */
export function trackmanToPoints(
  shots: { side: number | null; carryDistance: number | null }[],
): DispersionPoint[] {
  const valid = shots.filter((s) => s.side != null && s.carryDistance != null) as {
    side: number;
    carryDistance: number;
  }[];
  if (valid.length === 0) return [];
  const meanCarry = valid.reduce((s, p) => s + p.carryDistance, 0) / valid.length;
  return valid.map((s) => ({ lateral: s.side, distance: s.carryDistance - meanCarry }));
}

/**
 * Gameplan interaktiv modus (C7): prøv spillerens EKTE spredningsellipse mot
 * et NYTT hypotetisk sikte spilleren drar rundt på kartet (i stedet for det
 * historiske sikte'et ellipsen egentlig ble målt mot). Antakelsen — vanlig i
 * golf-strategiverktøy — er at spredningsMØNSTERET (form/størrelse) er en
 * egenskap ved svingen og roterer med hvor spilleren sikter; ellipsens
 * lateral/distance-offset regnes derfor om til ekte GPS relativt til den NYE
 * tee→sikte-retningen, ikke den opprinnelige tee→green-retningen.
 */
export function ellipseGpsPunkter(
  ellipse: DispersionEllipse,
  tee: LatLng,
  sikte: LatLng,
  antall = 240,
): LatLng[] {
  const aimBearing = bearing(tee, sikte);
  const punkter: LatLng[] = [];
  for (let i = 0; i < antall; i++) {
    // Lavdiskrepans (sunflower-mønster) — jevn dekning av disken, som DISK i design-prototypen.
    const r = Math.sqrt((i + 0.5) / antall);
    const a = i * 2.39996;
    const ux = r * Math.cos(a);
    const uy = r * Math.sin(a);
    // Roter og skaler til ellipsens akser, offset fra ellipsens eget senter.
    const cosA = Math.cos(ellipse.angleRad);
    const sinA = Math.sin(ellipse.angleRad);
    const ex = ux * ellipse.semiMinor; // lateral-akse
    const ey = uy * ellipse.semiMajor; // distance-akse
    const lateral = ellipse.centerLateral + (ex * cosA - ey * sinA);
    const distance = ellipse.centerDistance + (ex * sinA + ey * cosA);
    // distance langs ny sikte-retning fra TEE (ikke fra sikte) — offset er
    // relativt til historisk mål-avstand, så vi ankrer på ny sikte i stedet.
    const langsSikte = destinationPoint(sikte, aimBearing, distance);
    punkter.push(destinationPoint(langsSikte, aimBearing + Math.PI / 2, lateral));
  }
  return punkter;
}

/** Andel (0–1) av punktene som faller innenfor minst én sone av `type`. */
export function andelISone(
  punkter: LatLng[],
  soner: { type: "bra" | "aldri"; senter: LatLng; radiusMeter: number }[],
  type: "bra" | "aldri",
): number {
  if (punkter.length === 0) return 0;
  const relevante = soner.filter((s) => s.type === type);
  if (relevante.length === 0) return 0;
  const treff = punkter.filter((p) => relevante.some((s) => haversine(p, s.senter) <= s.radiusMeter));
  return treff.length / punkter.length;
}
