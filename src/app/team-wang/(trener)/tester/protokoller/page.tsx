import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { lesProtokollFilter, ProtokollVisning } from "@/components/wang/tester-konkurranse/protokoll-visning";
import s from "@/components/wang/tester-konkurranse/tk.module.css";
import { WangDemoMerknad, WangSide, WangSidehode } from "@/components/wang/trener/wang-ui";
import { hentBrukPerTest, hentElever, hentFysDefinisjoner } from "@/lib/wang/tester-konkurranse/data";
import { forsteParam } from "@/lib/wang/tester-konkurranse/format";
import { fysProtokoll, ngfProtokoller } from "@/lib/wang/tester-konkurranse/tester";
import { wangHref } from "@/lib/wang/wang-ruter";

export const dynamic = "force-dynamic";

/** WANG-22 Testprotokoller. Tegning: «WANG Golf Batch 8.dc.html» #protokoll. */
export default async function WangProtokollerSide({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  const filter = lesProtokollFilter(forsteParam((await searchParams).filter));
  const [elever, fys] = await Promise.all([hentElever(gruppe.id), hentFysDefinisjoner()]);
  const bruk = await hentBrukPerTest(elever.map((e) => e.id));
  const rader = [...ngfProtokoller(), ...fys.map(fysProtokoll)];

  return (
    <WangSide>
      <WangSidehode skjermId="WANG-22" undertittel="Felles for alle WANG-skoler" tittel="Testprotokoller" />
      {erDemo ? <WangDemoMerknad /> : null}
      <p className={s.ingress} style={{ fontSize: 16 }}>Protokollen er kontrakten bak hvert testtall. Den låses ved første bruk, og etter det kan den bare avløses av en ny versjon.</p>
      <ProtokollVisning
        rader={rader}
        filter={filter}
        filterHref={(f) => (f === "alle" ? wangHref("WANG-22") : wangHref("WANG-22", {}, { filter: f }))}
        valgt={null}
        fysDef={null}
        bruk={bruk}
      />
    </WangSide>
  );
}
