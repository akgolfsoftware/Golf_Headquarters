/**
 * Prøvefil for FO-05 Deling (forelder) i Precision Athletics.
 * Syntetiske testdata, ingen ekte personer eller produksjonsdatabase.
 */
import { ForelderSkall } from "@/components/precision/ForelderSkall";
import { FO05Deling } from "@/components/forelder/FO05Deling";

export const sti = "/forelder/samtykke/deling/barn-1";

const sett = async () => ({ ok: true as const });

function S({ children }: { children: React.ReactNode }) {
  return <ForelderSkall><div className="pa-side"><div className="fob">{children}</div></div></ForelderSkall>;
}

export const tilstander = {
  data: <S><FO05Deling barnFornavn="Testbarn" settSamtykke={sett} organisasjoner={[
    { gruppeId: "g1", navn: "Team Norway Golf", testerOgResultater: true, komplettProfil: false },
    { gruppeId: "g2", navn: "WANG Toppidrett Fredrikstad med veldig langt gruppenavn", testerOgResultater: false, komplettProfil: false },
  ]} /></S>,
  tom: <S><FO05Deling barnFornavn="Testbarn" settSamtykke={sett} organisasjoner={[]} /></S>,
};
