/**
 * Spillerkort: hvem spilleren er i Data Golf, rangering, nåværende SG total og hvor mye historikk
 * som finnes. Tar valgfrie barn (SG-profil, trend osv.) slik at kortet samler en hel spillervisning.
 */
import type { ReactNode } from "react";
import { Nokkelverdier, Pille } from "@/components/admin/agencyos-ny/ny";
import { formaterFortegn, formaterTall } from "@/lib/format-tall";
import { tourNavn, type DgVisning, type SpillerKortData } from "@/lib/datagolf/visning";
import { DgRamme } from "./DgRamme";

export function SpillerKort({ resultat, children }: { resultat: DgVisning<SpillerKortData>; children?: ReactNode }) {
  const s = resultat.tilstand === "klar" ? resultat.data : null;
  return <DgRamme tittel={s?.navn ?? "Spiller"} tilstand={resultat.tilstand} tomTittel="Fant ikke spilleren" lasteHoyder={[96]}
    tomTekst="Spilleren finnes ikke i Data Golf-katalogen."
    kilde={s?.kildedato ? `Ferdighetstall per ${s.kildedato}` : undefined}>
    {s && <>
      <div className="dgk-kort-pille">
        {s.land && <Pille tone="noy">{s.land}</Pille>}
        {s.norsk && <Pille tone="ok">Norsk</Pille>}
        {s.amator && <Pille tone="noy">Amatør</Pille>}
        {s.primaerTour && <Pille tone="noy">{tourNavn(s.primaerTour)}</Pille>}
      </div>
      <Nokkelverdier rader={[
        ["Data Golf-rang", s.dgRang === null ? "—" : <span className="mono">{s.dgRang}</span>],
        ["OWGR", s.owgrRang === null ? "—" : <span className="mono">{s.owgrRang}</span>],
        ["SG total (modell)", <span className="mono" key="sg">{formaterFortegn(s.sgTotal, 2)}</span>, s.kildedato ? `per ${s.kildedato}` : undefined],
        ["Runder i kilden", <span className="mono" key="r">{formaterTall(s.antallRunder, 0)}</span>,
          s.fraAar && s.tilAar ? `${s.fraAar}–${s.tilAar}` : "ingen runder"],
        ["Født", s.fodselsaar === null ? "—" : <span className="mono">{s.fodselsaar}</span>],
      ]} />
      {children}
    </>}
  </DgRamme>;
}
