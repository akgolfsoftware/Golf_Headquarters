/**
 * Aldersgrense i turneringsplanleggeren. Arrangørene bruker ulike regler for «U18»
 * (alder 1. januar, alder ved start, fødselsår), og WAGR oppgir ikke regelen.
 * Vi sier derfor bare sikkert nei når spilleren er for gammel etter alle vanlige
 * regler, og «sjekk» når det avhenger av regelen eller fødselsdatoen.
 */

export type Aldersvurdering =
  | { status: "ok" }
  | { status: "for-gammel" }
  | { status: "sjekk"; tekst: string };

function alderPaa(fodt: Date, d: Date): number {
  let a = d.getUTCFullYear() - fodt.getUTCFullYear();
  const m = d.getUTCMonth() - fodt.getUTCMonth();
  if (m < 0 || (m === 0 && d.getUTCDate() < fodt.getUTCDate())) a--;
  return a;
}

/**
 * @param grense «U18», «U21», «Junior (sjekk reglementet)» eller null
 * @param start turneringens første dag («YYYY-MM-DD»)
 */
export function vurderAlder(
  grense: string | null,
  start: string,
  spiller: { fodselsdato: Date | null; fodselsaar: number | null },
): Aldersvurdering {
  if (!grense) return { status: "ok" };
  const u = /^U(\d{2})$/.exec(grense);
  if (!u) return { status: "sjekk", tekst: "Juniorturnering uten oppgitt aldersgrense. Sjekk reglementet." };
  const n = Number(u[1]);
  const sesong = Number(start.slice(0, 4));
  const startDato = new Date(`${start}T00:00:00Z`);
  const nyttaar = new Date(Date.UTC(sesong, 0, 1));
  const { fodselsdato, fodselsaar } = spiller;

  if (fodselsdato) {
    if (alderPaa(fodselsdato, nyttaar) >= n) return { status: "for-gammel" };
    if (alderPaa(fodselsdato, startDato) >= n) return { status: "sjekk", tekst: `Fyller ${n} før start. Sjekk om grensen gjelder alder 1. januar eller ved start.` };
    if (sesong - fodselsdato.getUTCFullYear() >= n) return { status: "sjekk", tekst: `Fyller ${n} i ${sesong}. Sjekk om grensen gjelder fødselsår.` };
    return { status: "ok" };
  }
  if (fodselsaar) {
    // Uten dato: 1. januar er spilleren sesong − år − 1 (eller sesong − år ved fødsel 1. januar).
    if (sesong - fodselsaar - 1 >= n) return { status: "for-gammel" };
    if (sesong - fodselsaar >= n) return { status: "sjekk", tekst: `Fyller ${n} i ${sesong}. Sjekk aldersregelen og fødselsdatoen.` };
    return { status: "ok" };
  }
  return { status: "sjekk", tekst: `Aldersgrense ${grense}. Fødselsdato mangler i profilen.` };
}
