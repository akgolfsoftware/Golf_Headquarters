/** Prøvefil for pakke 17b Ny målsetning. Syntetiske data, ingen database. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHNyMalsetning } from "@/components/portal/precision/PHNyMalsetning";

export const sti = "/portal/mal/ny";
const S = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;
export const tilstander = {
  data: <S><PHNyMalsetning testOptions={[{ id: "t1", name: "Wedge Gate" }, { id: "t2", name: "8-ball" }]} /></S>,
  "uten-tester": <S><PHNyMalsetning testOptions={[]} /></S>,
};
