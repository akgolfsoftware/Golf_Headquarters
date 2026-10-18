import { notFound } from "next/navigation";

import { hentWangDataGolf, type WangDgValg } from "@/app/team-wang/_data/wang-datagolf-data";
import type { WangDgSide } from "@/app/team-wang/_data/wang-datagolf-visning";
import { krevDataGolfBruker } from "@/lib/auth/datagolf-tilgang";
import { hentTnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { TnDatagolfSkjerm } from "@/components/team-norway/skjermer/tn-datagolf-skjerm";
import { SkjermRamme } from "@/components/team-norway/skjermer/felles";

export const dynamic = "force-dynamic";
export const metadata = { title: "Data Golf · Team Norway" };

const SIDER: WangDgSide[] = ["proffer", "proff", "topp", "norske", "kilde"];
const en = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/**
 * Pakke 9 Data Golf for Team Norway-trenere (Analyse › Data Golf). Bare coach og admin
 * (krevDataGolfBruker, §DATA GOLF VISES ALDRI TIL KUNDER). Samme datalag som WANG og AgencyOS.
 */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const user = await krevDataGolfBruker("/team-norway/datagolf");
  const kontekst = await hentTnArbeidskontekst({ id: user.id, role: user.role, name: user.name });
  if (!kontekst || kontekst.erSpiller) notFound();

  const side = SIDER.find((s) => s === en(sp.side)) ?? "oversikt";
  const valg: WangDgValg = { id: en(sp.id), sok: en(sp.sok), tour: en(sp.tour), norske: en(sp.norske), kat: en(sp.kat), aar: en(sp.aar) };
  const data = await hentWangDataGolf(side, valg);

  return (
    <SkjermRamme aktiv="datagolf" brukerNavn={user.name} kontekst={kontekst}>
      <TnDatagolfSkjerm d={data} />
    </SkjermRamme>
  );
}
