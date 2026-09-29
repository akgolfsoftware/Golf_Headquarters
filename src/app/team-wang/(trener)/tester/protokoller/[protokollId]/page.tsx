import { notFound } from "next/navigation";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { ProtokollVisning } from "@/components/wang/tester-konkurranse/protokoll-visning";
import { WangDemoMerknad, WangSide, WangSidehode } from "@/components/wang/trener/wang-ui";
import { hentBrukPerTest, hentElever, hentFysDefinisjoner } from "@/lib/wang/tester-konkurranse/data";
import { fysProtokoll, ngfProtokoller } from "@/lib/wang/tester-konkurranse/tester";
import { wangHref } from "@/lib/wang/wang-ruter";

export const dynamic = "force-dynamic";

/** WANG-22 Testprotokoll — valgt protokoll. Tegning: «WANG Golf Batch 8.dc.html» #protokoll. */
export default async function WangProtokollSide({ params }: { params: Promise<{ protokollId: string }> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  const { protokollId } = await params;
  const [elever, fys] = await Promise.all([hentElever(gruppe.id), hentFysDefinisjoner()]);
  const rader = [...ngfProtokoller(), ...fys.map(fysProtokoll)];
  const valgt = rader.find((r) => r.id === protokollId);
  if (!valgt) notFound();
  const bruk = await hentBrukPerTest(elever.map((e) => e.id));

  return (
    <WangSide>
      <WangSidehode skjermId="WANG-22" undertittel="Felles for alle WANG-skoler" tittel="Testprotokoller" />
      {erDemo ? <WangDemoMerknad /> : null}
      <ProtokollVisning
        rader={rader}
        filter="alle"
        filterHref={(f) => (f === "alle" ? wangHref("WANG-22") : wangHref("WANG-22", {}, { filter: f }))}
        valgt={valgt}
        fysDef={fys.find((d) => d.id === valgt.id) ?? null}
        bruk={bruk}
      />
    </WangSide>
  );
}
