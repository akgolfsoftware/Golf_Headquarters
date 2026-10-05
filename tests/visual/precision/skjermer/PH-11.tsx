/** Prøvefil for PH-11 Workbench (spiller), nivå Uke, Økt, Volum og Målsetninger. Syntetiske data. */
import { CalendarX } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FeilTilstand, Knapp, LasterTilstand } from "@/components/precision/pa";
import { PH11Workbench } from "@/components/portal/precision/PH11Workbench";
import type { AG11Niva, AG11Side } from "@/components/admin/precision/AG11Workbench";
import { FYS, KILDER, MAL, SPILLER, TOM_FYS, uke } from "./_wb-data";
import { Natt } from "./_natt";

export const sti = "/portal/planlegge/workbench";

export const Vis = ({
  tom = false,
  niva = "uke",
  side,
  valgtOktId,
  nattModus = false,
}: {
  tom?: boolean;
  niva?: AG11Niva;
  side?: AG11Side;
  valgtOktId?: string;
  nattModus?: boolean;
}) => {
  const comp = (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH11Workbench
        playerId="p1"
        spillerNavn={SPILLER}
        uke={uke(tom)}
        kilder={tom ? [] : KILDER}
        goals={tom ? [] : MAL}
        fys={tom ? TOM_FYS : FYS}
        niva={niva}
        side={side}
        valgtOktId={valgtOktId}
      />
    </PlayerHQSkall>
  );
  return nattModus ? <Natt>{comp}</Natt> : comp;
};

export const Laster = () => (
  <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
    <div className="pa-side">
      <LasterTilstand text="Henter planen din …" />
    </div>
  </PlayerHQSkall>
);

export const Feil = () => (
  <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
    <div className="pa-side">
      <FeilTilstand
        icon={CalendarX}
        title="Workbench kunne ikke lastes"
        text="Ingen økter er endret. Prøv igjen, eller gå tilbake til I dag."
        code="FEIL 503 · WORKBENCH"
        retry={<Knapp variant="secondary">Prøv igjen</Knapp>}
      />
    </div>
  </PlayerHQSkall>
);

export const tilstander = {
  uke: <Vis niva="uke" />,
  okt: <Vis niva="okt" valgtOktId="o1" />,
  volum: <Vis niva="vol" />,
  mal: <Vis niva="mal" side="mal" />,
  fys: <Vis side="fys" />,
  tom: <Vis tom />,
  laster: <Laster />,
  feil: <Feil />,
  nattUke: <Vis niva="uke" nattModus />,
  nattOkt: <Vis niva="okt" valgtOktId="o1" nattModus />,
  nattMal: <Vis niva="mal" side="mal" nattModus />,
};

export const natt = ["nattUke", "nattOkt", "nattMal"];
