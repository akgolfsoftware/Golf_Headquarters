/** Prøvefil for PH-25 Språk i nytt design. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Sprak } from "@/components/portal/precision/PH25Sprak";

export const sti = "/portal/meg/innstillinger/sprak";
const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;

export const tilstander = {
  data: <Skall><PH25Sprak data={{ spraak: "nb" }} /></Skall>,
};
