/**
 * Summary-kjeding (flytpakke 2, punkt 2.7): ren tekst-formattering for
 * «neste økt»-linjen nederst i økt-oppsummeringen. Datahenting (hvilken
 * økt som er neste) skjer i load-neste-okt.ts (server-only, spør begge
 * øktspor). Denne fila er ren og enhetstestbar.
 */

const UKEDAG = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export type NesteOktInput = {
  tittel: string;
  startTime: Date;
} | null;

export type NesteOktTekst = {
  tekst: string;
  href: string;
};

export function nesteOktTekst(
  nesteOkt: NesteOktInput,
  href: string,
  naa: Date,
): NesteOktTekst {
  if (!nesteOkt) {
    return { tekst: "Ingen økt planlagt — planlegg uka?", href: "/portal/planlegge/workbench" };
  }

  const dagerFrem = Math.round(
    (startOfDay(nesteOkt.startTime).getTime() - startOfDay(naa).getTime()) / 86_400_000,
  );

  if (dagerFrem <= 0) {
    return { tekst: `I dag: ${nesteOkt.tittel}`, href };
  }
  if (dagerFrem === 1) {
    return { tekst: `I morgen: ${nesteOkt.tittel}`, href };
  }
  if (dagerFrem <= 6) {
    const dag = UKEDAG[nesteOkt.startTime.getDay()];
    return { tekst: `${dag[0].toUpperCase()}${dag.slice(1)}: ${nesteOkt.tittel}`, href };
  }
  const dato = `${nesteOkt.startTime.getDate()}.${nesteOkt.startTime.getMonth() + 1}`;
  return { tekst: `${dato}: ${nesteOkt.tittel}`, href };
}
