import type { Proff } from './player-tool';
/** Hele det interne DG-registeret. Datadekning er beskrevet, ikke antatt. */
export const DG_VIEWS = [
  ['DG-01','Oversikt'], ['DG-02','Spillere'], ['DG-03','Spillerprofil'],
  ['DG-04','Rangering'], ['DG-05','Sammenlign'], ['DG-06','Innspill'],
  ['DG-07','Rundehistorikk'], ['DG-08','Turneringskalender'], ['DG-09','Turneringsanalyse'],
  ['DG-10','Live'], ['DG-11','Modell'], ['DG-12','Bane og felt'], ['DG-13','Trender'],
  ['DG-14','Datautforsker'], ['DG-15','Kilder og dekning'], ['DG-16','Videre til plan'], ['DG-17','Spesialanalyse'],
] as const;
export type DGViewId = typeof DG_VIEWS[number][0];
export function readDGView(value: unknown): DGViewId {
  return DG_VIEWS.find(([id]) => id === value)?.[0] ?? 'DG-01';
}
export const DG_UNAVAILABLE: Partial<Record<DGViewId, string>> = {
  'DG-08': 'Fremtidige startfelt og starttider er ikke koblet til dette arbeidsrommet. Historiske turneringer finnes under Rundehistorikk.',
  'DG-10': 'Ingen livekilde med kildeklokke er koblet til. Importerte historiske runder vises aldri som live.',
  'DG-17': 'Ingen godkjent odds- eller fantasykilde er koblet til. Her vises ingen beregnede eller oppdiktede spilltips.',
};

export function selectedDGReferences(profiles: Proff[], primaryId: number|undefined, requested: unknown[]): Proff[] {
  const ids = [...new Set(requested.flatMap(v=>typeof v==='number' && Number.isSafeInteger(v) && v>0 ? [v] : typeof v==='string' && /^[1-9]\d{0,8}$/.test(v) ? [Number(v)] : []))].filter(id=>id!==primaryId).slice(0,3);
  return ids.flatMap(id=>profiles.find(p=>p.dgId===id) ?? []);
}
