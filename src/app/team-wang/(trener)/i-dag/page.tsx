import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangTrengerDeg } from "@/app/team-wang/_components/wang-idag-trening/skjermer/wang-43-trenger-deg";

/** WANG-43 Elever som trenger deg. Fasit: «WANG Golf Elevprofil.dc.html» #trenger (6cfa623c). Rute: /team-wang/i-dag */
export default async function Side({ searchParams }: { searchParams: Promise<{ grunn?: string | string[] }> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  return <WangTrengerDeg gruppe={gruppe} erDemo={erDemo} sok={await searchParams} />;
}
