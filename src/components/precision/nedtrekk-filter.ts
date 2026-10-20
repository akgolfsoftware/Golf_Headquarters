/**
 * Søket i nedtrekksmenyen: treff på navn eller gruppe, uten hensyn til store/små bokstaver
 * og aksenter (é = e), men æ, ø og å beholdes som egne bokstaver.
 */
export type NedtrekkValg = { verdi: string; navn: string; gruppe?: string; antall?: string };

function normaliser(s: string): string {
  return s
    .toLocaleLowerCase("nb-NO")
    .replace(/[éèê]/g, "e")
    .replace(/[áàâ]/g, "a")
    .replace(/[óòô]/g, "o")
    .replace(/[úùû]/g, "u")
    .trim();
}

export function filtrerValg(valg: readonly NedtrekkValg[], sok: string): NedtrekkValg[] {
  const q = normaliser(sok);
  if (!q) return [...valg];
  const ord = q.split(/\s+/);
  return valg.filter((v) => {
    const tekst = normaliser(`${v.navn} ${v.gruppe ?? ""}`);
    return ord.every((o) => tekst.includes(o));
  });
}

/** Grupperer valgene i rekkefølgen gruppene først dukker opp. Valg uten gruppe får tom tittel. */
export function grupperValg(valg: readonly NedtrekkValg[]): { gruppe: string; valg: NedtrekkValg[] }[] {
  const ut: { gruppe: string; valg: NedtrekkValg[] }[] = [];
  for (const v of valg) {
    const g = v.gruppe ?? "";
    let blokk = ut.find((b) => b.gruppe === g);
    if (!blokk) {
      blokk = { gruppe: g, valg: [] };
      ut.push(blokk);
    }
    blokk.valg.push(v);
  }
  return ut;
}
