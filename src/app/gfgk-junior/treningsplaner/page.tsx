import type { Metadata } from "next";

import { GfgkFooter } from "../_components/gfgk-footer";
import { GfgkHeader } from "../_components/gfgk-header";
import { GRUPPE_KEYS, type GruppeKey, type UkeOkt } from "../_data/gfgk-junior-data";
import { hentAlleGfgkGrupper } from "../_data/hent-gfgk-data";
import { TreningsplanerInnhold } from "./treningsplaner-innhold";

export const revalidate = 300; // AgencyOS er master — Workbench-endringer ute innen 5 min

export const metadata: Metadata = {
  title: "Treningsplaner",
  description:
    "Fra årsplan til den enkelte økten — treningsplaner for GFGK Junior & Elite per aldersgruppe: årsplan, periodisering, månedsplan, ukeplan og øktplaner.",
};

function tilGruppeKey(g: string | undefined): GruppeKey {
  const k = (g ?? "").toUpperCase();
  return (GRUPPE_KEYS as string[]).includes(k) ? (k as GruppeKey) : "U13";
}

export default async function TreningsplanerPage({
  searchParams,
}: {
  searchParams: Promise<{ g?: string }>;
}) {
  const { g } = await searchParams;
  const grupper = await hentAlleGfgkGrupper();
  const ukeplaner = Object.fromEntries(
    GRUPPE_KEYS.map((k) => [k, grupper[k].ukeplan]),
  ) as Record<GruppeKey, UkeOkt[]>;

  return (
    <div>
      <GfgkHeader aktiv="treningsplaner" />
      <TreningsplanerInnhold startGruppe={tilGruppeKey(g)} ukeplaner={ukeplaner} />
      <GfgkFooter />
    </div>
  );
}
