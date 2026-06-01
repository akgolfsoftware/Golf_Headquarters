// Forhåndsvisning (ungated, demo-data) — for visuell gjennomgang før lansering.
// Fjernes ved lansering. Viser redesignede skjermer mot v10-fasit.
import { HjemOversikt } from "@/components/portal/hjem/hjem-oversikt";
import type { HjemData } from "@/lib/portal-hjem/hjem-data";

export const dynamic = "force-dynamic";

const DEMO: HjemData = {
  user: { fornavn: "Magnus", initialer: "MR", tier: "PRO", hcp: 4.2, homeClub: "Oslo GK", avatarUrl: null },
  datoEyebrow: "ONSDAG · 28 MAI · OSLO GK",
  headlineNormal: "Approach er ",
  headlineAksent: "der",
  metaLinje: "det skjer i dag.",
  heroImageId: 1,
  dagensOkt: {
    id: "1",
    tittel: "Stinger-drill",
    tidsrom: "14:30",
    meta: "6 baller fra 150 m, høyde under 8 m. Mål: 4 av 6 innenfor 4 m fra flagg.",
    pyramide: "SLAG",
    href: "/forhandsvisning/hjem",
  },
  kpi: [
    { label: "HCP", value: "4,2", trend: { value: "−2,6 i år", tone: "positive" } },
    { label: "SG Total", value: "+0,68", trend: { value: "+0,21", tone: "positive" } },
    { label: "Neste økt", value: "14:30" },
  ],
  pyramide: [
    { label: "Turnering", fillPercent: 38, value: "38 %", tone: "pyr-turn" },
    { label: "Spill", fillPercent: 52, value: "52 %", tone: "pyr-spill" },
    { label: "Golfslag", fillPercent: 64, value: "64 %", tone: "pyr-slag" },
    { label: "Teknisk", fillPercent: 72, value: "72 %", tone: "pyr-tek" },
    { label: "Fysisk", fillPercent: 88, value: "88 %", tone: "pyr-fys" },
  ],
  pyramideNote: "Uke 22",
  nesteTee: { dagKort: "FRE", datoTall: "30", navn: "Oslo GK · 18 hull", sted: "Oslo GK", naar: "fredag", href: "/forhandsvisning/hjem" },
  innsikt: null,
};

export default function ForhandsvisningHjem() {
  return (
    <div className="min-h-screen bg-background">
      <HjemOversikt data={DEMO} />
    </div>
  );
}
