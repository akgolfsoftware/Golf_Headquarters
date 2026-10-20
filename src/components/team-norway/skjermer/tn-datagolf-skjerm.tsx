import { notFound } from "next/navigation";

import { hentWangDataGolf, type WangDgValg } from "@/app/team-wang/_data/wang-datagolf-data";
import type { WangDgSide } from "@/app/team-wang/_data/wang-datagolf-visning";
import { hentTnSpillere, hentTnTrenere, medTnSpillerData } from "@/lib/domain/tn-arbeidsflate";
import { hentDgSpillerVisning } from "@/lib/datagolf/spiller-mot-proff-data";
import { TnFilterknapper } from "../tn-flate";
import { SkjermRamme, hentSkjermbruker } from "./felles";
import { TnDgSpillerSide } from "./tn-datagolf-spiller";
import { FANER, Katalog, Kilde, Norske, Oversikt, PoweredBy, Proff, SIDER, SPILLER_SIDER, Topplister, adresse, forste } from "./tn-datagolf-visning";

/** TN-DG Data Golf, bare for ADMIN. Henter data; visningene ligger i tn-datagolf-visning.tsx. */
export async function TnDatagolfSkjerm({ sokeparametre }: { sokeparametre: Record<string, string | string[] | undefined> }) {
  const bruker = await hentSkjermbruker();
  const kontekst = await hentTnTrenere(bruker);
  if (!kontekst || kontekst.kontekst.erSpiller) notFound();

  const sideParam = forste(sokeparametre.side);
  const spillerSide = SPILLER_SIDER.find((s) => s === sideParam);
  if (spillerSide) {
    const spillere = (await hentTnSpillere(bruker))?.rader.map((r) => ({ id: r.id, navn: r.navn })) ?? [];
    const proffId = Number.parseInt(forste(sokeparametre.pro) ?? "", 10);
    const v = await hentDgSpillerVisning({
      bruker, spillere, spillerId: forste(sokeparametre.spiller), proffId: Number.isFinite(proffId) ? proffId : undefined,
      medSpiller: (id, les) => medTnSpillerData(bruker, id, (tx) => les(tx)),
    });
    if (!v) notFound();
    return (
      <SkjermRamme aktiv="datagolf" brukerNavn={bruker.name} kontekst={kontekst.kontekst}>
        <TnDgSpillerSide side={spillerSide} v={v} faner={<TnFilterknapper etikett="Data Golf" valg={FANER.map(([id, label]) => ({ href: adresse(id), label, aktiv: id === "spiller" }))} />} />
        <PoweredBy />
      </SkjermRamme>
    );
  }
  const side: WangDgSide = SIDER.find((s) => s === sideParam) ?? "oversikt";
  const valg: WangDgValg = {
    id: forste(sokeparametre.id),
    sok: forste(sokeparametre.sok),
    tour: forste(sokeparametre.tour),
    norske: forste(sokeparametre.norske),
    kat: forste(sokeparametre.kat),
    aar: forste(sokeparametre.aar),
    sidenr: forste(sokeparametre.sidenr),
  };
  const d = await hentWangDataGolf(side, valg);

  return (
    <SkjermRamme aktiv="datagolf" brukerNavn={bruker.name} kontekst={kontekst.kontekst}>
      {d.side === "oversikt" ? <Oversikt d={d} /> : null}
      {d.side === "proffer" ? <Katalog d={d} /> : null}
      {d.side === "proff" ? <Proff d={d} /> : null}
      {d.side === "topp" ? <Topplister d={d} /> : null}
      {d.side === "norske" ? <Norske d={d} /> : null}
      {d.side === "kilde" ? <Kilde d={d} /> : null}
      <PoweredBy />
    </SkjermRamme>
  );
}

