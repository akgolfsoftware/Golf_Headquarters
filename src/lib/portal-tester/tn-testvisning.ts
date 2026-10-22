/**
 * Testvisningen i Team Norway (utkast 3, «Testvisning», Anders 22.10.2026): én gjennomføring som slag, ikke bare
 * som tall. Ren logikk uten database.
 *
 *  - PEI-testene (Carry og Side mot et mål): spredningsplott mot målet, avstand fra hullet og PEI per slag.
 *    PEI = avstand fra hullet / slaglengde, som brøk (0,058), vist i prosent.
 *  - Gate-testene: port og sone per slag (Bom 0, Gjennom porten 1, I sonen 4; Godkjent/Bom for Driver Gate og Putt Gate).
 *  - Putt: avstandsbånd (9 hull lengde: klassene; Putt Speed: restavstand).
 *  - Uten data: «—», aldri en gjetning.
 */
import { GATE_POENG_VALG, LENGDE_POENG, type TnProtocol } from "./tn-catalog";
import type { TnValues } from "./tn-scoring";

export type TmTall = { club: string | null; clubSpeed: number | null; ballSpeed: number | null; smashFactor: number | null; faceToPath: number | null; clubPath: number | null; attackAngle: number | null; spinRate: number | null };

export type PeiSlag = { nr: number; target: number | null; carry: number | null; side: number | null; iHull: boolean; fraHullet: number | null; pei: number | null; tm: TmTall | null; passerIkke: boolean };
export type GateSlag = { nr: number; valg: string | null; poeng: number | null };
export type Testvisning =
  | { type: "pei"; slag: PeiSlag[] }
  | { type: "gate"; slag: GateSlag[]; fordeling: { navn: string; antall: number }[]; medPoeng: boolean }
  | { type: "putt"; band: { navn: string; antall: number }[] }
  | { type: "annet" };

const tallEllerNull = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

export function byggTestvisning(p: TnProtocol, values: TnValues, tmPerForsok: ReadonlyMap<number, { tm: TmTall; passerIkke: boolean }> = new Map()): Testvisning {
  const felt = (key: string) => p.rows.every((r) => r.fields.some((f) => f.key === key));
  if (felt("carry") && felt("side") && p.rows.every((r) => r.target !== undefined)) {
    return {
      type: "pei",
      slag: p.rows.map((r, i) => {
        const v = values[String(i + 1)] ?? {};
        const iHull = v.holed === "I hull";
        const carry = tallEllerNull(v.carry);
        const side = tallEllerNull(v.side);
        const target = r.target ?? null;
        const fraHullet = iHull ? 0 : target !== null && carry !== null && side !== null ? Math.hypot(carry - target, side) : null;
        const kobling = tmPerForsok.get(i) ?? null;
        return { nr: i + 1, target, carry, side, iHull, fraHullet, pei: fraHullet !== null && target ? fraHullet / target : null, tm: kobling?.tm ?? null, passerIkke: kobling?.passerIkke ?? false };
      }),
    };
  }
  if (p.kind === "gate") {
    const slag = p.rows.map((_, i): GateSlag => {
      const valg = values[String(i + 1)]?.ok;
      const s = typeof valg === "string" ? valg : null;
      return { nr: i + 1, valg: s, poeng: s !== null && s in GATE_POENG_VALG ? GATE_POENG_VALG[s as keyof typeof GATE_POENG_VALG] : null };
    });
    const medPoeng = slag.some((s) => s.poeng !== null) || p.rows[0]?.fields[0]?.choices?.includes("I sonen") === true;
    const navn = p.rows[0]?.fields[0]?.choices ?? [];
    return { type: "gate", slag, medPoeng, fordeling: navn.map((n) => ({ navn: n, antall: slag.filter((s) => s.valg === n).length })) };
  }
  if (felt("klasse")) {
    const klasser = Object.keys(LENGDE_POENG);
    const valg = p.rows.map((_, i) => values[String(i + 1)]?.klasse);
    return { type: "putt", band: klasser.map((k) => ({ navn: k, antall: valg.filter((v) => v === k).length })) };
  }
  if (p.kind === "speed" && felt("distance")) {
    // Restavstand til mållinjen i meter, uansett enhet ført.
    const meter = p.rows.map((_, i) => {
      const v = values[String(i + 1)] ?? {};
      const d = tallEllerNull(v.distance);
      if (d === null) return null;
      return v.distanceUnit === "cm" ? d / 100 : v.distanceUnit === "fot" ? d * 0.3048 : d;
    });
    const band = [
      { navn: "Under 0,5 m", test: (m: number) => m < 0.5 },
      { navn: "0,5–1 m", test: (m: number) => m >= 0.5 && m < 1 },
      { navn: "1–2 m", test: (m: number) => m >= 1 && m < 2 },
      { navn: "2 m eller mer", test: (m: number) => m >= 2 },
    ];
    return { type: "putt", band: band.map((b) => ({ navn: b.navn, antall: meter.filter((m): m is number => m !== null && b.test(m)).length })) };
  }
  return { type: "annet" };
}
