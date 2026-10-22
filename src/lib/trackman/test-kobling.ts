/**
 * Kobling testslag ↔ TrackMan-slag i Team Norway-testene (§TRACKMAN I TEAM NORWAY-TESTENE, Anders 22.10.2026).
 * Ren logikk uten database, så reglene kan låses med test.
 *
 *  - Forslaget går i rekkefølge: testslag 1 får første TrackMan-slag med riktig kølle, og så videre.
 *  - Feil kølle hoppes over: et driverslag i en wedge- eller inspilltest, eller et slag med en annen kølle
 *    enn driver i Driver Basic. Mangler køllen («—»), foreslås slaget, og treneren bekrefter.
 *  - «Passer ikke»: slaget lander mer enn 15 m fra målet i wedge- og inspilltestene, eller mer enn 30 m i
 *    Driver Basic. Slaget merkes og kobles ikke; treneren kan koble det likevel.
 *  - Carry og Side fylles fra TrackMan. Side har samme fortegn som testen (venstre −, høyre +).
 *  - Club Speed i Fysisk er beste av de fem første driverslagene i fila.
 */

export type TmSlag = { id: string; shotNumber: number; club: string | null; carryDistance: number | null; side: number | null; clubSpeed?: number | null };
export type Testslag = { indeks: number; target: number | null };

export type KoblingForslag = {
  indeks: number;
  target: number | null;
  slag: TmSlag | null;
  /** Meter fra målet (carry og side). null når målet eller tallene mangler. */
  fraMaalet: number | null;
  passerIkke: boolean;
};

export type Koblingsresultat = {
  forslag: KoblingForslag[];
  /** TrackMan-slag med feil kølle som er hoppet over. */
  feilKolle: TmSlag[];
  /** Testslag uten TrackMan-slag. Føres for hånd. */
  mangler: number;
};

export const GRENSE_DRIVER_M = 30;
export const GRENSE_ANNET_M = 15;

const erDriverBasic = (protokollId: string) => protokollId === "driver-220" || protokollId === "driver-270";

export function grenseFor(protokollId: string): number {
  return erDriverBasic(protokollId) ? GRENSE_DRIVER_M : GRENSE_ANNET_M;
}

export function erDriver(club: string | null): boolean | null {
  if (!club || !club.trim() || club.trim() === "—") return null;
  return /\b(driver|dr|1w)\b/i.test(club.trim());
}

/** Avstand fra målet i meter, regnet fra carry og side. */
export function fraMaalet(target: number | null, slag: Pick<TmSlag, "carryDistance" | "side">): number | null {
  if (target === null || slag.carryDistance === null || slag.side === null) return null;
  return Math.hypot(slag.carryDistance - target, slag.side);
}

export function passerIkke(protokollId: string, target: number | null, slag: Pick<TmSlag, "carryDistance" | "side">): boolean {
  const d = fraMaalet(target, slag);
  return d !== null && d > grenseFor(protokollId);
}

function riktigKolle(protokollId: string, club: string | null): boolean {
  const driver = erDriver(club);
  if (driver === null) return true;
  return erDriverBasic(protokollId) ? driver : !driver;
}

export function foreslaKobling(protokollId: string, testslag: Testslag[], tm: TmSlag[]): Koblingsresultat {
  const sortert = [...tm].sort((a, b) => a.shotNumber - b.shotNumber);
  const feilKolle = sortert.filter((s) => !riktigKolle(protokollId, s.club));
  const kandidater = sortert.filter((s) => riktigKolle(protokollId, s.club));
  const forslag = testslag.map((t, i): KoblingForslag => {
    const slag = kandidater[i] ?? null;
    const d = slag ? fraMaalet(t.target, slag) : null;
    return { indeks: t.indeks, target: t.target, slag, fraMaalet: d, passerIkke: !!slag && d !== null && d > grenseFor(protokollId) };
  });
  return { forslag, feilKolle, mangler: forslag.filter((f) => !f.slag).length };
}

/** Club Speed: beste av de fem første driverslagene (etter slagnummer). Slag nummer seks og senere teller ikke. */
export function clubSpeedFraTrackMan(tm: TmSlag[]): { beste: number | null; slag: TmSlag[]; besteId: string | null } {
  const fem = [...tm].sort((a, b) => a.shotNumber - b.shotNumber).filter((s) => erDriver(s.club) === true).slice(0, 5);
  let beste: TmSlag | null = null;
  for (const s of fem) if (s.clubSpeed != null && (beste?.clubSpeed == null || s.clubSpeed > beste.clubSpeed)) beste = s;
  return { beste: beste?.clubSpeed ?? null, slag: fem, besteId: beste?.id ?? null };
}
