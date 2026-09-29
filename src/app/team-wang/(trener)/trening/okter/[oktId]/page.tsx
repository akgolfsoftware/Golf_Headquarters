import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangOktDetalj } from "@/app/team-wang/_components/wang-idag-trening/skjermer/wang-18-oktdetalj";

/** WANG-18 Øktdetalj. Fasit: «WANG Golf Batch 6.dc.html» #kalender/[id] (6cfa623c). Rute: /team-wang/trening/okter/[oktId] */
export default async function Side({ params }: { params: Promise<{ oktId: string }> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  const { oktId } = await params;
  return <WangOktDetalj gruppe={gruppe} erDemo={erDemo} oktId={oktId} />;
}
