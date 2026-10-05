import type { Metadata } from 'next';
import { WangCoachKlient } from '@/app/team-wang/coach/WangCoachKlient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'WANG Toppidrett Golf — Skjermoversikt (WANG-00)',
  description: 'Komplett skjermregister og oversikt over alle skjermer for WANG Golf.',
  robots: { index: false, follow: false },
};

export default function WangSkjermerPage() {
  return (
    <WangCoachKlient
      initialOmraade="system"
      campus="Fredrikstad"
    />
  );
}
