/**
 * Hva skjer med registrerte slag (Shot-rader) når et scorekort redigeres?
 * Kjeden på et hull motsier scorekortet hvis slag-tallet endres eller hullet
 * fjernes, og slettes da. Det skal aldri skje stille (DI-04, DI-26): denne
 * planleggeren sier nøyaktig hvilke hull som mister slag, så handlingen kan
 * kreve bekreftelse først. Hull der slag-tallet er uendret røres ikke.
 */

export type HullStrokes = { holeNumber: number; strokes: number };
export type SlagPerHull = { holeNumber: number; antall: number };

export type SlagSlettingPlan = {
  /** Hull som fjernes fra scorekortet (finnes ikke i den nye listen). */
  fjernedeHull: number[];
  /** Hull der slag-kjeden må slettes (endret slag-tall eller fjernet hull). */
  slettSlagFor: number[];
  /** Registrerte slag som faktisk går tapt, per hull. Tom = ingenting å bekrefte. */
  tapteSlag: SlagPerHull[];
};

export function planSlagSletting(
  eksisterende: readonly HullStrokes[],
  nye: readonly HullStrokes[],
  slagPerHull: readonly SlagPerHull[],
): SlagSlettingPlan {
  const nyeNr = new Set(nye.map((h) => h.holeNumber));
  const gamleStrokes = new Map(eksisterende.map((h) => [h.holeNumber, h.strokes]));

  const fjernedeHull = eksisterende
    .filter((h) => !nyeNr.has(h.holeNumber))
    .map((h) => h.holeNumber);
  const endret = nye
    .filter((h) => {
      const gamle = gamleStrokes.get(h.holeNumber);
      return gamle != null && gamle !== h.strokes;
    })
    .map((h) => h.holeNumber);

  const slettSlagFor = [...endret, ...fjernedeHull];
  const sett = new Set(slettSlagFor);
  const tapteSlag = slagPerHull
    .filter((s) => s.antall > 0 && sett.has(s.holeNumber))
    .sort((a, b) => a.holeNumber - b.holeNumber);

  return { fjernedeHull, slettSlagFor, tapteSlag };
}

/** Lesbar norsk setning til feilmelding/dialog. */
export function beskrivTapteSlag(tapte: readonly SlagPerHull[]): string {
  const deler = tapte.map((t) => `hull ${t.holeNumber} (${t.antall} slag)`);
  return `Registrerte slag på ${deler.join(", ")} slettes hvis du lagrer.`;
}
