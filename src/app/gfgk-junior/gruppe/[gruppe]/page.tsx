import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GfgkFooter } from "../../_components/gfgk-footer";
import { GfgkHeader } from "../../_components/gfgk-header";
import {
  GRUPPER,
  GRUPPE_KEYS,
  type GruppeKey,
  type Hendelse,
} from "../../_data/gfgk-junior-data";
import { hentGfgkGruppe } from "../../_data/hent-gfgk-data";
import { GruppeplanInnhold } from "./gruppeplan-innhold";

export const revalidate = 300; // AgencyOS er master — Workbench-endringer ute innen 5 min

export function generateStaticParams() {
  return GRUPPE_KEYS.map((k) => ({ gruppe: k.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gruppe: string }>;
}): Promise<Metadata> {
  const { gruppe } = await params;
  const key = gruppe.toUpperCase() as GruppeKey;
  if (!GRUPPE_KEYS.includes(key)) return {};
  const g = GRUPPER[key];
  return {
    title: `${g.navn} (${key})`,
    description: `${g.motto}. Treningsplan, kalender og øktplaner for ${g.navn} (${g.alder}) i GFGK Junior & Elite.`,
  };
}

export default async function GruppeplanPage({
  params,
}: {
  params: Promise<{ gruppe: string }>;
}) {
  const { gruppe } = await params;
  const key = gruppe.toUpperCase() as GruppeKey;
  if (!GRUPPE_KEYS.includes(key)) notFound();

  const data = await hentGfgkGruppe(key);
  // Samlinger fra AgencyOS legges inn som gull-hendelser i kalenderen.
  const ekstraHendelser: Hendelse[] = (data.db?.samlinger ?? []).map((s) => [
    s.startAt.slice(0, 10),
    s.title,
    s.location ? `${s.kind === "HELDAGSSAMLING" ? "Heldagssamling" : "Samling"} · ${s.location}` : "Samling",
  ]);

  return (
    <div>
      <GfgkHeader aktiv="gruppe" />
      <GruppeplanInnhold
        gKey={key}
        ukeplan={data.ukeplan}
        ekstraHendelser={ekstraHendelser}
        autoSynk={data.kilde === "agencyos"}
      />
      <GfgkFooter />
    </div>
  );
}
