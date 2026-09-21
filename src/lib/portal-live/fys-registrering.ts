import type { DrillRepState, LiveV2Drill, LiveV2DrillLog } from "@/components/portal/live/types";

export type FysRegistrering =
  | { type: "styrke"; sett: { vekt: number; reps: number }[]; notat: string }
  | { type: "kondisjon"; minutter: number; sone: string; notat: string }
  | { type: "hold"; sekunder: number; notat: string }
  | { type: "reps"; repetisjoner: number; notat: string };

const kg = (n: number) => String(n).replace(".", ",");

/** Bevarer eksisterende lagringsformat. Enheter tolkes aldri fra repsTotal. */
export function fysLoggState(reg: FysRegistrering): DrillRepState {
  let tekst: string;
  let verdi: number;
  switch (reg.type) {
    case "styrke":
      tekst = `Styrke: ${reg.sett.map(s => `${kg(s.vekt)} kg × ${s.reps}`).join(" · ")}`;
      verdi = reg.sett.reduce((sum, s) => sum + s.reps, 0);
      break;
    case "kondisjon":
      tekst = `Kondisjon: ${reg.minutter} min i sone ${reg.sone.replace("S", "")}`;
      verdi = reg.minutter;
      break;
    case "hold": tekst = `Bevegelighet: hold ${reg.sekunder} sek`; verdi = reg.sekunder; break;
    case "reps": tekst = `Bevegelighet: ${reg.repetisjoner} reps`; verdi = reg.repetisjoner; break;
  }
  return { repsTotal: verdi, repsWithoutBall: 0, repsLowSpeed: 0, repsAutomatic: 0,
    repsHit: verdi, logNotes: reg.notat.trim() ? `${tekst} — ${reg.notat.trim()}` : tekst };
}

/** Leser bare loggerens eksakte tekstformat; ukjent eldre tekst beholdes ufortolket. */
export function lesFysRegistrering(notes: string | null | undefined): FysRegistrering | null {
  if (!notes) return null;
  const skille = notes.indexOf(" — ");
  const kjerne = skille < 0 ? notes : notes.slice(0, skille);
  const notat = skille < 0 ? "" : notes.slice(skille + 3);
  const kondisjon = /^Kondisjon: (\d+) min i sone ([1-5])$/.exec(kjerne);
  if (kondisjon && Number(kondisjon[1]) <= 180)
    return { type: "kondisjon", minutter: Number(kondisjon[1]), sone: `S${kondisjon[2]}`, notat };
  const hold = /^Bevegelighet: hold (\d+) sek$/.exec(kjerne);
  if (hold && Number(hold[1]) <= 300) return { type: "hold", sekunder: Number(hold[1]), notat };
  const reps = /^Bevegelighet: (\d+) reps$/.exec(kjerne);
  if (reps && Number(reps[1]) <= 200) return { type: "reps", repetisjoner: Number(reps[1]), notat };
  if (kjerne.startsWith("Styrke: ")) {
    const sett: { vekt: number; reps: number }[] = [];
    for (const rad of kjerne.slice(8).split(" · ")) {
      const treff = /^(\d+(?:[,.]\d+)?) kg × (\d+)$/.exec(rad);
      if (!treff) return null;
      const vekt = Number(treff[1].replace(",", "."));
      const antall = Number(treff[2]);
      if (!Number.isFinite(vekt) || !Number.isSafeInteger(antall) || antall < 1) return null;
      sett.push({ vekt, reps: antall });
    }
    return { type: "styrke", sett, notat };
  }
  return null;
}

export function fysVisningsrader(reg: FysRegistrering): { label: string; verdi: string }[] {
  switch (reg.type) {
    case "styrke": return reg.sett.map((s, i) => ({ label: `Sett ${i + 1}`, verdi: `${kg(s.vekt)} kg × ${s.reps}` }));
    case "kondisjon": return [{ label: "Registrert varighet", verdi: `${reg.minutter} min` }, { label: "Pulssone", verdi: reg.sone }];
    case "hold": return [{ label: "Hold", verdi: `${reg.sekunder} sek` }];
    case "reps": return [{ label: "Repetisjoner", verdi: String(reg.repetisjoner) }];
  }
}

/** Golfrepetisjoner og treff må ikke inkludere FYS-minutter, sekunder eller sett. */
export function golfLoggTall(drills: Pick<LiveV2Drill, "id" | "pyramide" | "plannedReps">[], logs: Pick<LiveV2DrillLog, "drillId" | "repsTotal" | "repsHit">[]) {
  const golf = drills.filter(d => d.pyramide !== "FYS");
  const ids = new Set(golf.map(d => d.id));
  const golfLogs = logs.filter(l => ids.has(l.drillId));
  return { planReps: golf.reduce((sum, d) => sum + d.plannedReps, 0),
    totalReps: golfLogs.reduce((sum, l) => sum + l.repsTotal, 0),
    treff: golfLogs.reduce((sum, l) => sum + l.repsHit, 0) };
}
