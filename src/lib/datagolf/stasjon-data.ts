import { hentAktiveTak } from "@/lib/datagolf/tak-data";
import {
  byggStasjon,
  finnSlag,
  sirkelAndreTak,
  type Stasjon,
  type TakSnapshot,
} from "@/lib/datagolf/stasjon";

function tilSnapshot(tak: Awaited<ReturnType<typeof hentAktiveTak>>[number]): TakSnapshot {
  return {
    dgPlayerId: tak.dgPlayerId,
    name: tak.name,
    asOf: tak.asOf,
    formLabel: tak.formLabel,
    drivingDistY: tak.drivingDistY,
    drivingAcc: tak.drivingAcc,
    bands: tak.bands.map((b) => ({
      band: b.band,
      lie: b.lie,
      proximityMeters: b.proximityMeters,
      sgPerShot: b.sgPerShot,
    })),
  };
}

export async function hentStasjonSide(input: {
  takParam: string | null;
  slagParam: string | null;
  carryParam: string | null;
  lieParam: string | null;
}): Promise<{
  stasjon: Stasjon | null;
  taker: TakSnapshot[];
  valgtTak: TakSnapshot | null;
  carryMeter: number | null;
  andreSirkler: { name: string; sirkelMeter: number | null }[];
}> {
  const rader = await hentAktiveTak();
  const taker = rader.map(tilSnapshot);
  const dgId = input.takParam ? Number.parseInt(input.takParam, 10) : NaN;
  const valgtTak =
    taker.find((t) => t.dgPlayerId === dgId) ?? taker[0] ?? null;
  const slag = finnSlag(input.slagParam);
  const carryRaw = input.carryParam?.replace(",", ".");
  const carryMeter = carryRaw && Number.isFinite(Number(carryRaw)) && Number(carryRaw) > 0
    ? Number(carryRaw)
    : null;
  const lie = input.lieParam === "rough" ? "rough" : "fairway";

  if (!valgtTak) {
    return { stasjon: null, taker, valgtTak: null, carryMeter, andreSirkler: [] };
  }

  const stasjon = byggStasjon({ slag, tak: valgtTak, carryMeter, lie });
  const andreSirkler = sirkelAndreTak({
    slag,
    carryMeter,
    lie,
    andre: taker.filter((t) => t.dgPlayerId !== valgtTak.dgPlayerId),
  });

  return { stasjon, taker, valgtTak, carryMeter, andreSirkler };
}
