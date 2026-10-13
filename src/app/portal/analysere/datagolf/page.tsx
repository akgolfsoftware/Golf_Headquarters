import { requireDataGolfAnalyst } from '@/lib/datagolf/access';
import { hentSpillerverktoy } from '@/lib/datagolf/player-tool-data';
import { readDGView } from '@/lib/datagolf/analysis-views';
import { AgencyOSSkall } from '@/components/precision/AgencyOSSkall';
import { InternalDataGolfWorkspace } from '@/components/datagolf/InternalDataGolfWorkspace';
export const dynamic = 'force-dynamic';
export default async function AnalysereDataGolfPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  const user = await requireDataGolfAnalyst();
  const sp = await searchParams;
  const data = await hentSpillerverktoy(user.id,sp);
  return <AgencyOSSkall navn={user.name}><InternalDataGolfWorkspace data={data} view={readDGView(sp.flate)} additionalReferences={[sp.mot2,sp.mot3]} eventId={typeof sp.event === 'string' ? sp.event : undefined}/></AgencyOSSkall>;
}
