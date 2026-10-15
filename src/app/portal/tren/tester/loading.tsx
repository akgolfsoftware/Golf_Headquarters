import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { TmLaster } from "@/components/portal/precision/PH17TmFelles";

export default function Loading() {
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <TmLaster tekst="Henter testene" />
    </PlayerHQSkall>
  );
}
